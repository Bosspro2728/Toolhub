import { createClient } from '@/utils/supabase/client';

// Feature types that can be limited
export type FeatureType = 
  | 'ai_chat'
  | 'text_humanizer'
  | 'ai_detection'
  | 'translation'
  | 'text_to_speech'
  | 'seo_analyzer'
  | 'code_snippets'
  | 'document_view'
  | 'file_conversion'
  | 'media_conversion'
  | 'url_shortener';

// Plan tiers
export type PlanTier = 'free' | 'pro' | 'master';

// Feature limits interface
export interface FeatureLimits {
  [key: string]: number | boolean | string[];
}

// Cache for feature limits to avoid repeated fetches
let featureLimitsCache: Record<PlanTier, FeatureLimits> | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

/**
 * Fetches feature limits from Supabase storage
 */
export async function getFeatureLimits(): Promise<Record<PlanTier, FeatureLimits>> {
  const now = Date.now();
  
  // Return cached limits if available and not expired
  if (featureLimitsCache && (now - lastFetchTime < CACHE_TTL)) {
    return featureLimitsCache;
  }
  
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .storage
      .from('feature-limits')
      .getPublicUrl('limits.json');
    
    if (error) {
      console.error('Error fetching feature limits:', error);
      throw error;
    }
    const res = await fetch(data.publicUrl);
     if (!res.ok) throw new Error(`Could not fetch limits.json (${res.status})`);
    const limits = (await res.json()) as Record<PlanTier, FeatureLimits>;

    
    // Update cache
    featureLimitsCache = limits;
    lastFetchTime = now;
    
    return limits;
  } catch (error) {
    console.error('Failed to fetch feature limits:', error);
    
    // Return default limits if fetch fails
    return {
      free: {
        ai_chat_daily_limit: 3,
        text_humanizer_daily_limit: 3,
        ai_detection_daily_limit: 3,
        translation_daily_limit: 3,
        text_to_speech_daily_limit: 1,
        seo_analyzer_daily_limit: 1,
        code_snippets_daily_limit: 2,
        collaborative_editor: false,
        document_view_daily_limit: 2,
        doc_creator_export: ["html"],
        file_conversion_daily_limit: 2,
        media_conversion_daily_limit: 2,
        url_shortener_daily_limit: 3,
        storage_limit_mb: 300
      },
      pro: {
        ai_chat_daily_limit: 10,
        text_humanizer_daily_limit: 6,
        ai_detection_daily_limit: 6,
        translation_daily_limit: 6,
        text_to_speech_daily_limit: 3,
        seo_analyzer_daily_limit: 3,
        code_snippets_daily_limit: 5,
        collaborative_editor: true,
        document_view_daily_limit: 5,
        doc_creator_export: ["html", "docx", "pdf"],
        file_conversion_daily_limit: 5,
        media_conversion_daily_limit: 5,
        url_shortener_daily_limit: 5,
        storage_limit_mb: 1024
      },
      master: {
        ai_chat_daily_limit: 50,
        text_humanizer_daily_limit: 30,
        ai_detection_daily_limit: 30,
        translation_daily_limit: 30,
        text_to_speech_daily_limit: 20,
        seo_analyzer_daily_limit: 20,
        code_snippets_daily_limit: 50,
        collaborative_editor: true,
        document_view_daily_limit: 30,
        doc_creator_export: ["html", "docx", "pdf"],
        file_conversion_daily_limit: 30,
        media_conversion_daily_limit: 30,
        url_shortener_daily_limit: 30,
        storage_limit_mb: 5120
      }
    };
  }
}

/**
 * Gets the user's current plan tier
 */
export async function getUserPlanTier(): Promise<PlanTier> {
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 'free';
    }
    
    const { data, error } = await supabase.rpc('get_user_plan', { p_user_id: user.id });
    
    if (error || !data) {
      console.error('Error getting user plan tier:', error);
      return 'free';
    }
    
    if (data === 'master' || data === 'pro') {
      return data as PlanTier;
    }
    
    return 'free';
  } catch (error) {
    console.error('Error getting user plan tier:', error);
    return 'free';
  }
}

/**
 * Gets the limit for a specific feature based on the user's plan
 */
export async function getFeatureLimit(feature: string): Promise<number | boolean | string[]> {
  const planTier = await getUserPlanTier();
  const limits = await getFeatureLimits();
  
  // If the feature is already a complete key (like 'collaborative_editor')
  if (feature in limits[planTier]) {
    return limits[planTier][feature];
  }
  
  // Otherwise, it might be a partial key (like 'ai_chat' instead of 'ai_chat_daily_limit')
  const featureKey = feature.endsWith('_daily_limit') ? feature : `${feature}_daily_limit`;
  return limits[planTier][featureKey] || limits['free'][featureKey];
}

/**
 * Gets the user's current usage for a specific feature
 */
export async function getUserFeatureUsage(feature: FeatureType): Promise<number> {
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get or create user usage record
    let { data, error } = await supabase
      .from('user_feature_usage')
      .select(`${feature}_daily_count, last_reset`)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user feature usage:', error);
      throw error;
    }
    
    // If no record exists, create one
    if (!data) {
      const { error: insertError } = await supabase
        .from('user_feature_usage')
        .insert({ user_id: user.id });
      
      if (insertError) {
        console.error('Error creating user feature usage record:', insertError);
        throw insertError;
      }
      
      return 0;
    }
    
    // Check if we need to reset based on last_reset date
    const lastReset = new Date(data.last_reset);
    const now = new Date();
    
    // Reset if last reset was yesterday or earlier
    if (lastReset.getUTCDate() !== now.getUTCDate() || 
        lastReset.getUTCMonth() !== now.getUTCMonth() || 
        lastReset.getUTCFullYear() !== now.getUTCFullYear()) {
      
      // Create update object with all counts reset to 0
      const resetData: Record<string, any> = {
        last_reset: now.toISOString(),
      };
      
      // Reset all feature counts
      const features: FeatureType[] = [
        'ai_chat', 'text_humanizer', 'ai_detection', 'translation',
        'text_to_speech', 'seo_analyzer', 'code_snippets', 'document_view',
        'file_conversion', 'media_conversion', 'url_shortener'
      ];
      
      features.forEach(f => {
        resetData[`${f}_daily_count`] = 0;
      });
      
      const { error: updateError } = await supabase
        .from('user_feature_usage')
        .update(resetData)
        .eq('user_id', user.id);
      
      if (updateError) {
        console.error('Error resetting user feature usage:', updateError);
        throw updateError;
      }
      
      return 0;
    }
    
    return data[`${feature}_daily_count`] || 0;
  } catch (error) {
    console.error('Error in getUserFeatureUsage:', error);
    return 0;
  }
}

/**
 * Checks if a user can use a feature based on their plan limits
 */
export async function canUseFeature(feature: FeatureType): Promise<boolean> {
  try {
    const planTier = await getUserPlanTier();
    const limits = await getFeatureLimits();
    const currentUsage = await getUserFeatureUsage(feature);
    
    // Special case for boolean features like collaborative_editor
    if (typeof limits[planTier][feature] === 'boolean') {
      return limits[planTier][feature] as boolean;
    }
    
    // For numerical limits
    const limit = limits[planTier][`${feature}_daily_limit`] as number;
    return currentUsage < limit;
  } catch (error) {
    console.error('Error checking if user can use feature:', error);
    return false;
  }
}

/**
 * Increments usage for a specific feature
 */
export async function incrementFeatureUsage(feature: FeatureType): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // First check if user can use the feature
    const canUse = await canUseFeature(feature);
    
    if (!canUse) {
      return false;
    }
    
    // Increment the usage count
    const { error } = await supabase.rpc('increment_feature_usage', {
      user_id_param: user.id,
      feature_name: feature
    });
    
    if (error) {
      console.error('Error incrementing feature usage:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in incrementFeatureUsage:', error);
    return false;
  }
}

/**
 * Gets the remaining usage for a specific feature
 */
export async function getRemainingUsage(feature: FeatureType): Promise<number> {
  try {
    const planTier = await getUserPlanTier();
    const limits = await getFeatureLimits();
    const currentUsage = await getUserFeatureUsage(feature);
    
    const limit = limits[planTier][`${feature}_daily_limit`] as number;
    return Math.max(0, limit - currentUsage);
  } catch (error) {
    console.error('Error getting remaining usage:', error);
    return 0;
  }
}