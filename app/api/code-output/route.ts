import { NextResponse } from 'next/server';
import { languageIds } from '@/constant/languageIds';
import { createClient } from '@/utils/supabase/server';
import { incrementFeatureUsage, canUseFeature } from '@/utils/feature-limits';

function encode(str) {
    return btoa(unescape(encodeURIComponent(str || "")));
}

function decode(bytes) {
    var escaped = escape(atob(bytes || ""));
    try {
        return decodeURIComponent(escaped);
    } catch {
        return unescape(escaped);
    }
}

async function fetchApi(code, input, lang) {
    var requestBody;
    if (!input) {
        requestBody = {
            language_id: lang,
            source_code: encode(code)
        }
    }else{
        requestBody={
            language_id: lang,
            source_code: encode(code),
            stdin: encode(input)
        }
    }
    try {
        var result;
        console.log(lang);
        console.log(code);
        console.log(encode(code))
        console.log(input)
        console.log(encode(input))
        const getTokenUrl = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false&fields=*';
        const options = {
            method: 'POST',
            headers: {
                'x-rapidapi-key': process.env.COMPILE_API_KEY,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        };

        console.log("before fetch");
        const tokenResponse = await fetch(getTokenUrl, options);
        const data = await tokenResponse.json();
        console.log("after fetch", typeof (data.token));
        const token = data.token;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 7 seconds
        const getResponseUrl = 'https://judge0-ce.p.rapidapi.com/submissions/' + token + '?base64_encoded=true&fields=*';
        console.log(token);
        console.log(getResponseUrl);
        const options2 = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': process.env.COMPILE_API_KEY,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            }
        };

        console.log("before second fetch");
        const response = await fetch(getResponseUrl, options2);
        //await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 7 seconds
        console.log(response)
        const data2 = await response.json();
        console.log("after second fetch", data2.stdout);
        result = [decode(data2.stdout), data2.time, data2.wall_time];
        console.log(result, 'result');
        return result;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch output');
    }
}

function getLanguageId(languageIds, lang) {
    return languageIds[lang];
}

async function fetchCodeOutput(code, input, lang) {
    var languageId;
    languageId = getLanguageId(languageIds, lang);
    console.log(lang, languageId);
    try {
        const output = await fetchApi(code, input, (languageId));
        //await new Promise(resolve => setTimeout(resolve, 1000));
        return output;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to get code output');
    }
}

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // Check if user can use this feature
        const hasAccess = await canUseFeature('code_snippets');
        
        if (!hasAccess) {
            return NextResponse.json(
                { error: "Daily limit reached for code snippets. Please upgrade your plan for more usage." }, 
                { status: 403 }
            );
        }
        
        const { code, input, lang } = await request.json();
        const output = await fetchCodeOutput(code, input, lang);
        
        // Increment usage after successful API call
        await incrementFeatureUsage('code_snippets');
        
        return NextResponse.json({output});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}