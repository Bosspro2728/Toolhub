// app/api/text-to-speech/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { incrementFeatureUsage, canUseFeature } from '@/utils/feature-limits';

// Ensure Node.js runtime to handle binary and Buffer
export const config = { runtime: 'nodejs' };

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user can use this feature
    const hasAccess = await canUseFeature('text_to_speech');
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Daily limit reached for text-to-speech. Please upgrade your plan for more usage." }, 
        { status: 403 }
      );
    }
    
    const { text, voice, modelId, voiceSettings, outputFormat } = await req.json();
    if (!text || !voice) {
      return NextResponse.json(
        { error: 'Missing required fields: text and voice' },
        { status: 400 }
      );
    }
    if (!ELEVEN_API_KEY) {
      return NextResponse.json(
        { error: 'Server misconfiguration: missing API key' },
        { status: 500 }
      );
    }

    const url = `${BASE_URL}/${encodeURIComponent(voice)}`;
    const params = new URLSearchParams();
    if (outputFormat) params.set('output_format', outputFormat);
    const fullUrl = params.toString() ? `${url}?${params}` : url;

    const body: any = { text };
    if (modelId) body.model_id = modelId;
    if (voiceSettings) body.voice_settings = voiceSettings;

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs error:', errText);
      return NextResponse.json(
        { error: `TTS service error: ${response.status}` },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const audioBase64 = buffer.toString('base64');

    // Increment usage after successful API call
    await incrementFeatureUsage('text_to_speech');

    return NextResponse.json({ audio: audioBase64 });
  } catch (err: any) {
    console.error('TTS error:', err);
    const message = err?.message || 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}