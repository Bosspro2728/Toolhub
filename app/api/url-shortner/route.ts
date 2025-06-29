// app/api/url-shortner/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { incrementFeatureUsage, canUseFeature } from '@/utils/feature-limits';

const TINYURL_API = 'https://api.tinyurl.com';
const token = process.env.TINYURL_API_TOKEN;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { url } = await req.json();

  if (!url || !token) {
    return NextResponse.json({ error: 'Missing URL or API token' }, { status: 400 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check if user can use this feature
  const hasAccess = await canUseFeature('url_shortener');
  
  if (!hasAccess) {
    return NextResponse.json(
      { error: "Daily limit reached for URL shortener. Please upgrade your plan for more usage." }, 
      { status: 403 }
    );
  }

  try {
    const res = await fetch(`${TINYURL_API}/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        domain: 'tinyurl.com',
      }),
    });

    const data = await res.json();
    console.log('TinyURL response:', data);
    if (!res.ok || !data?.data?.tiny_url) {
      return NextResponse.json({ error: data?.errors?.[0]?.message || 'Shortening failed' }, { status: 500 });
    }

    const shortUrl = data.data.tiny_url;
    const shortCode = shortUrl.split('/').pop() || '';
    const tinyId = data.data.id_string;
    const expiresAt = data.data.expires_at;

    const { error: dbError } = await supabase.from('urls').insert([
      {
        user_id: user.id,
        original_url: url,
        short_code: shortCode,
        expires_at: expiresAt,
      },
    ]);

    if (dbError) {
      console.error(dbError);
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
    }
    
    // Increment usage after successful API call
    await incrementFeatureUsage('url_shortener');

    return NextResponse.json({ short: shortUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('urls')
    .select('original_url, short_code')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch URLs' }, { status: 500 });
  }

  const formatted = data.map((item) => ({
    original: item.original_url,
    shortened: `https://tinyurl.com/${item.short_code}`,
  }));

  return NextResponse.json({ history: formatted });
}