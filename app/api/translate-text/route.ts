import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/utils/supabase/server';
import { incrementFeatureUsage, canUseFeature } from '@/utils/feature-limits';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user can use this feature
    const hasAccess = await canUseFeature('translation');
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Daily limit reached for translations. Please upgrade your plan for more usage." }, 
        { status: 403 }
      );
    }
    
    const { text, target_lang, source_lang } = await req.json();

    const response = await fetch("https://openl-translate.p.rapidapi.com/translate", {
      method: "POST",
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY_TRANSLATE_TEXT || "",
        "x-rapidapi-host": "openl-translate.p.rapidapi.com",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        target_lang,
        source_lang
      })
    });

    const data = await response.json();
    console.log("Translation response:", data);

    // Increment usage after successful API call
    await incrementFeatureUsage('translation');

    return NextResponse.json({ translated: data?.translatedText || "" });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ translated: "Error" }, { status: 500 });
  }
}