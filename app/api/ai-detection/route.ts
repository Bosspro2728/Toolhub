import { NextResponse } from "next/server"
import { createClient } from '@/utils/supabase/server';
import { incrementFeatureUsage, canUseFeature } from '@/utils/feature-limits';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user can use this feature
    const hasAccess = await canUseFeature('ai_detection');
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Daily limit reached for AI detection. Please upgrade your plan for more usage." }, 
        { status: 403 }
      );
    }
    
    const { text } = await request.json()

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: "Please provide text with at least 10 characters" }, { status: 400 })
    }

    const url = "https://ai-content-detector6.p.rapidapi.com/v1/ai-detector"
    const options = {
      method: "POST",
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY_AI_DETECT || "",
        "x-rapidapi-host": "ai-content-detector6.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const result = await response.json()
    
    // Increment usage after successful API call
    await incrementFeatureUsage('ai_detection');
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("AI detection error:", error)
    return NextResponse.json({ error: "Failed to analyze text. Please try again later." }, { status: 500 })
  }
}