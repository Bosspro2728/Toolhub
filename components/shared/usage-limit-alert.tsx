import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Zap } from "lucide-react";
import Link from "next/link";
import { FeatureType, getRemainingUsage, getFeatureLimit, getUserPlanTier } from "@/utils/feature-limits";
import { useEffect, useState } from "react";

interface UsageLimitAlertProps {
  featureType: FeatureType;
  showProgress?: boolean;
}

export function UsageLimitAlert({ featureType, showProgress = true }: UsageLimitAlertProps) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);
  const [planTier, setPlanTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsageData() {
      try {
        const userPlanTier = await getUserPlanTier();
        setPlanTier(userPlanTier);
        
        const featureLimit = await getFeatureLimit(`${featureType}_daily_limit`);
        if (typeof featureLimit === 'number') {
          setLimit(featureLimit);
        }
        
        const remainingUsage = await getRemainingUsage(featureType);
        setRemaining(remainingUsage);
      } catch (error) {
        console.error("Error loading usage data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUsageData();
  }, [featureType]);

  if (loading) {
    return null;
  }

  if (remaining === null || limit === null) {
    return null;
  }

  // If plenty of usage remaining, don't show anything
  if (remaining > limit * 0.3) {
    return null;
  }

  const usedPercentage = ((limit - remaining) / limit) * 100;
  const isExhausted = remaining <= 0;

  return (
    <Alert variant={isExhausted ? "destructive" : "warning"} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {isExhausted 
          ? "Daily limit reached" 
          : "Usage limit warning"}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-3">
          <p>
            {isExhausted
              ? `You've reached your daily limit for this feature on the ${planTier} plan.`
              : `You have ${remaining} uses remaining out of ${limit} for today on the ${planTier} plan.`}
          </p>
          
          {showProgress && (
            <div className="space-y-1">
              <Progress value={usedPercentage} className="h-2" />
              <p className="text-xs text-right">
                {limit - remaining}/{limit} used
              </p>
            </div>
          )}
          
          {(isExhausted || remaining < limit * 0.2) && (
            <div className="flex justify-end">
              <Link href="/pricing">
                <Button size="sm" className="mt-2">
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}