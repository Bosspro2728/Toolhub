import { NextRequest, NextResponse } from 'next/server';
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
    const hasAccess = await canUseFeature('text_humanizer');
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Daily limit reached for text humanizer. Please upgrade your plan for more usage." }, 
        { status: 403 }
      );
    }
    
    const { text, level = 'standard' } = await req.json();

    const url = 'https://ai-humanizer-api.p.rapidapi.com/';

    const headers = {
      'x-rapidapi-key': process.env.RAPID_API_KEY_TEXT_HUMANIZER!,
      'x-rapidapi-host': 'ai-humanizer-api.p.rapidapi.com',
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method: 'POST',
      headers,
      body: JSON.stringify({ text, level }),
    };

    const response = await fetch(url, options);
    const result = await response.text();

    // Increment usage after successful API call
    await incrementFeatureUsage('text_humanizer');

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Humanization failed:', error);
    return NextResponse.json({ error: 'Failed to humanize text' }, { status: 500 });
  }
}