import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { FeatureType } from '@/utils/feature-limits';

export async function GET(req: NextRequest) {
  try {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
    console.log(user)
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get feature from query params
    const searchParams = req.nextUrl.searchParams;
    const feature = searchParams.get('feature') as FeatureType | null;
    
    // If no feature specified, return all usage data
    if (!feature) {
      const features: FeatureType[] = [
        'ai_chat', 'text_humanizer', 'ai_detection', 'translation',
        'text_to_speech', 'seo_analyzer', 'code_snippets', 'document_view',
        'file_conversion', 'media_conversion', 'url_shortener'
      ];
      
      // Get user's plan tier
      const { data: planTier, error: planError } = await supabaseAdmin.rpc('get_user_plan', { p_user_id: user.id });
      console.log("PlainTier: ",planTier)
      
      if (planError) {
        console.error('Error getting user plan:', planError);
        return NextResponse.json({ error: 'Failed to get user plan' }, { status: 500 });
      }
      
      // Get feature limits from storage
      const { data: limitsData, error: limitsError } = await supabaseAdmin
        .storage
        .from('feature-limits')
        .download('limits.json');
      console.log("limitsData: ", limitsData)
      
      if (limitsError) {
        console.error('Error fetching feature limits:', limitsError);
        return NextResponse.json({ error: 'Failed to fetch feature limits' }, { status: 500 });
      }
      
      const limits = JSON.parse(await limitsData.text());
      const userPlan = planTier || 'free';
      
      // Get user's current usage
      const { data: usageData, error: usageError } = await supabaseAdmin
        .from('user_feature_usage')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (usageError) {
        console.error('Error fetching user feature usage:', usageError);
        return NextResponse.json({ error: 'Failed to fetch user feature usage' }, { status: 500 });
      }
      
      // If no usage record exists, create one
      if (!usageData) {
        const { error: insertError } = await supabaseAdmin
          .from('user_feature_usage')
          .insert({ user_id: user.id });
        
        if (insertError) {
          console.error('Error creating user feature usage record:', insertError);
          return NextResponse.json({ error: 'Failed to create user feature usage record' }, { status: 500 });
        }
      }
      
      // Format the response
      const usageInfo = features.map(feat => {
        const usage = usageData ? usageData[`${feat}_daily_count`] || 0 : 0;
        const limit = limits[userPlan][`${feat}_daily_limit`] || 0;
        
        return {
          feature: feat,
          usage,
          limit,
          remaining: Math.max(0, limit - usage)
        };
      });
      
      return NextResponse.json({
        plan: userPlan,
        features: usageInfo
      });
    }
    
    // Get usage for specific feature
    const { data: usageData, error: usageError } = await supabaseAdmin
      .from('user_feature_usage')
      .select(`${feature}_daily_count`)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (usageError) {
      console.error('Error fetching user feature usage:', usageError);
      return NextResponse.json({ error: 'Failed to fetch user feature usage' }, { status: 500 });
    }
    
    const usage = usageData ? usageData[`${feature}_daily_count`] || 0 : 0;
    
    // Get user's plan tier
    const { data: planTier, error: planError } = await supabaseAdmin.rpc('get_user_plan', { p_user_id: user.id });
    
    if (planError) {
      console.error('Error getting user plan:', planError);
      return NextResponse.json({ error: 'Failed to get user plan' }, { status: 500 });
    }
    
    // Get feature limits from storage
    const { data: limitsData, error: limitsError } = await supabaseAdmin
      .storage
      .from('feature-limits')
      .download('limits.json');
    
    if (limitsError) {
      console.error('Error fetching feature limits:', limitsError);
      return NextResponse.json({ error: 'Failed to fetch feature limits' }, { status: 500 });
    }
    
    const limits = JSON.parse(await limitsData.text());
    const userPlan = planTier || 'free';
    const limit = limits[userPlan][`${feature}_daily_limit`] || 0;
    
    return NextResponse.json({
      feature,
      usage,
      limit,
      remaining: Math.max(0, limit - usage),
      plan: userPlan
    });
    
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
  }
}