'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap } from 'lucide-react';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
}

const planConfig = {
  'price_1RetsiKLsZT7M52urVbmm6EP': { name: 'Master', icon: Crown, color: 'bg-purple-500' },
  'price_1RetZ6KLsZT7M52uIyb7Ruc5': { name: 'Pro', icon: Zap, color: 'bg-blue-500' },
  'price_1ResxnKLsZT7M52uP3vbpv0f': { name: 'Free', icon: null, color: 'bg-gray-500' },
};

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('subscription_status, price_id')
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [supabase]);

  if (loading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <div className="h-3 w-12 bg-muted rounded"></div>
      </Badge>
    );
  }

  if (!subscription || !subscription.price_id) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Free
      </Badge>
    );
  }

  const plan = planConfig[subscription.price_id as keyof typeof planConfig];
  const planName = plan?.name || 'Unknown';
  const Icon = plan?.icon;

  const getVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trialing':
        return 'secondary';
      case 'past_due':
      case 'canceled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const isActive = subscription.subscription_status === 'active';

  return (
    <Badge 
      variant={getVariant(subscription.subscription_status)}
      className={`${isActive && plan ? 'text-white' : ''} ${isActive && plan ? plan.color : ''}`}
    >
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {planName}
    </Badge>
  );
}