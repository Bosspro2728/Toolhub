import { useState, useEffect } from 'react';
import { FeatureType, canUseFeature, incrementFeatureUsage, getRemainingUsage, getFeatureLimit, getUserPlanTier } from '@/utils/feature-limits';
import { toast } from 'sonner';

interface UseFeatureLimitOptions {
  redirectToPricing?: boolean;
  showToast?: boolean;
}

interface UseFeatureLimitResult {
  canUse: boolean;
  remaining: number | null;
  limit: number | null;
  planTier: string | null;
  loading: boolean;
  incrementUsage: () => Promise<boolean>;
  checkAccess: () => Promise<boolean>;
}

/**
 * Hook to check and manage feature usage limits
 */
export function useFeatureLimit(
  featureType: FeatureType,
  options: UseFeatureLimitOptions = {}
): UseFeatureLimitResult {
  const { redirectToPricing = false, showToast = true } = options;
  
  const [canUse, setCanUse] = useState<boolean>(true);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);
  const [planTier, setPlanTier] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if the user can use the feature
  const checkAccess = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Get user's plan tier
      const userPlanTier = await getUserPlanTier();
      setPlanTier(userPlanTier);
      
      // Get feature limit
      const featureLimit = await getFeatureLimit(`${featureType}_daily_limit`);
      if (typeof featureLimit === 'number') {
        setLimit(featureLimit);
      }
      
      // Check if user can use the feature
      const hasAccess = await canUseFeature(featureType);
      setCanUse(hasAccess);
      
      // Get remaining usage
      const remainingUsage = await getRemainingUsage(featureType);
      setRemaining(remainingUsage);
      
      if (!hasAccess && showToast) {
        toast.error(`Daily limit reached for this feature on your ${userPlanTier} plan`, {
          description: "Upgrade your plan to get more daily uses.",
          action: redirectToPricing ? {
            label: "Upgrade",
            onClick: () => window.location.href = "/pricing"
          } : undefined
        });
      }
      
      return hasAccess;
    } catch (error) {
      console.error('Error checking feature access:', error);
      setCanUse(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Increment usage for the feature
  const incrementUsage = async (): Promise<boolean> => {
    try {
      const success = await incrementFeatureUsage(featureType);
      
      if (success) {
        // Update remaining count
        const newRemaining = await getRemainingUsage(featureType);
        setRemaining(newRemaining);
        setCanUse(newRemaining > 0);
        
        // Show toast if running low
        if (newRemaining === 0 && showToast) {
          toast.warning(`You've used all your daily ${featureType.replace('_', ' ')} uses`, {
            description: "Upgrade your plan to get more daily uses.",
            action: redirectToPricing ? {
              label: "Upgrade",
              onClick: () => window.location.href = "/pricing"
            } : undefined
          });
        } else if (limit && newRemaining <= Math.max(1, Math.floor(limit * 0.1)) && showToast) {
          toast.warning(`Running low on ${featureType.replace('_', ' ')} uses today`, {
            description: `${newRemaining} uses remaining out of ${limit}.`,
            action: redirectToPricing ? {
              label: "Upgrade",
              onClick: () => window.location.href = "/pricing"
            } : undefined
          });
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error incrementing feature usage:', error);
      return false;
    }
  };

  // Check access on mount
  useEffect(() => {
    checkAccess();
  }, [featureType]);

  return {
    canUse,
    remaining,
    limit,
    planTier,
    loading,
    incrementUsage,
    checkAccess
  };
}