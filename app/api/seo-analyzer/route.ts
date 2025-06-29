import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from '@/utils/supabase/server';
import { incrementFeatureUsage, canUseFeature } from '@/utils/feature-limits';

interface RequestBody {
  url: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user can use this feature
    const hasAccess = await canUseFeature('seo_analyzer');
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Daily limit reached for SEO analyzer. Please upgrade your plan for more usage." }, 
        { status: 403 }
      );
    }
    
    // 1. Parse JSON body
    const body: RequestBody = await req.json();
    const targetUrl = body.url?.trim();
    console.log(targetUrl)
    if (!targetUrl) {
      return NextResponse.json(
        { error: "Missing required field in JSON body: url" },
        { status: 400 }
      );
    }

    // 2. Ensure the RapidAPI key is set
    const apiKey = process.env.RAPID_API_KEY_SEO_ANALYZER;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: RAPIDAPI_KEY is not set" },
        { status: 500 }
      );
    }

    // 3. Construct the RapidAPI endpoint URL
    const encodedUrl = encodeURIComponent(targetUrl);
    const rapidApiEndpoint = 
      `https://website-seo-analyzer.p.rapidapi.com/seo/seo-audit-basic?url=${encodedUrl}`;

    // 4. Prepare fetch options
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "website-seo-analyzer.p.rapidapi.com",
      },
    };

    // 5. Call the external SEO‐Audit API
    const response = await fetch(rapidApiEndpoint, options);
    if (!response.ok) {
      const text = await response.text();
      console.error(
        `RapidAPI responded with status ${response.status}: ${text}`
      );
      return NextResponse.json(
        { error: "Failed to fetch SEO audit from RapidAPI." },
        { status: 502 }
      );
    }

    // 6. Parse and return the JSON result
    const result = await response.json();
    
    // Increment usage after successful API call
    await incrementFeatureUsage('seo_analyzer');
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Internal API error (SEO Audit):", error);
    return NextResponse.json(
      {
        error: "Internal server error while generating SEO audit.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}