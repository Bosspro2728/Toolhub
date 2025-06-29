import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from '@/utils/supabase/server';
import { incrementFeatureUsage, canUseFeature } from '@/utils/feature-limits';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user can use this feature
    const hasAccess = await canUseFeature('ai_chat');
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Daily limit reached for AI chat. Please upgrade your plan for more usage." }, 
        { status: 403 }
      );
    }
    
    const { prompt, model } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: model || "llama-3.3-70b-versatile",
    });

    const content = completion.choices[0]?.message?.content || "";
    
    // Increment usage after successful API call
    await incrementFeatureUsage('ai_chat');
    
    return NextResponse.json({ text: content });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json({ error: "Failed to fetch from Groq" }, { status: 500 });
  }
}