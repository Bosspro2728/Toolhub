'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
}

const plans = [
  {
    id: 'free',
    name: 'Free plan',
    description: 'Free plan and access to all tools',
    price: 0,
    priceId: 'price_1ResxnKLsZT7M52uP3vbpv0f',
    badge: 'TEST MODE',
    badgeColor: 'bg-gray-500',
    icon: Star,
    features: [
      'Access to all tools',
      '300 MB of storage',
      '3 chat messages a day',
      '3 humanizer, ai detector and translation a day',
      '1 text to speech generation a day',
      '1 SEO analyzer a day',
      'run 2 code snippets a day',
      'no collaborative editor',
      '2 documents to view a day',
      'export doc creator only as html',
      '2 file conversions a day',
      '2 media conversions a day',
      '3 urls in url shorteners a day'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Upgrading will allow you more 10 requests per each service daily',
    price: 30,
    priceId: 'price_1RetZ6KLsZT7M52uIyb7Ruc5',
    badge: 'Best deal',
    badgeColor: 'bg-blue-500',
    icon: Zap,
    popular: true,
    features: [
      '- Access to all tools',
      '- 1 GB storage of cloud storage',
      '- 10 chat messages a day',
      '- 6 humanizer and ai detector and 6 translation a day',
      '- 3 text to speech generation a day',
      '- 3 SEO analyzer a day',
      'run 5 code snippets a day',
      'collaborative code editor',
      '5 document to view a day',
      'export doc creator to docx and pdf(coming soon)',
      '5 file conversions a day',
      '5 media conversions a day',
      '5 urls in url shortener a day'
    ]
  },
  {
    id: 'master',
    name: 'Master',
    description: 'Even more access and available tools',
    price: 50,
    priceId: 'price_1RetsiKLsZT7M52urVbmm6EP',
    badge: 'TEST MODE',
    badgeColor: 'bg-purple-500',
    icon: Crown,
    features: [
      '- Access to all tools',
      '- 5 GB storage of cloud storage',
      '- 50 chat messages a day',
      '- 30 humanizer, ai detector and translation a day',
      '- 20 text to speech generation a day',
      '- 20 SEO analyzer a day',
      '- run 50 code snippets a day',
      '- collaborative code editor',
      '30 documents to view a day',
      'export doc creator to docx and pdf(coming soon)',
      '30 file conversions a day',
      '30 media conversions a day',
      '30 urls in url shortener a day'
    ]
  }
];

export default function PricingPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getCurrentUserAndSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Fetch current subscription
        const { data: subData, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('subscription_status, price_id')
          .maybeSingle();

        if (!error && subData) {
          setSubscription(subData);
        }
      }
      setLoading(false);
    };

    getCurrentUserAndSubscription();
  }, [supabase]);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!userId) {
      toast.error('Please sign in to subscribe');
      return;
    }

    // Check if user already has this plan
    if (subscription?.price_id === plan.priceId && subscription?.subscription_status === 'active') {
      toast.info('You already have this plan');
      return;
    }

    setProcessingPlan(plan.id);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to continue');
        return;
      }

      // Get the correct URL for the Supabase Edge Function
      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`;
      
      console.log(`Calling Stripe checkout function at: ${functionUrl}`);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: plan.priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/pricing`,
          mode: 'subscription',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        try {
          // Try to parse as JSON, but handle case where it's HTML
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to create checkout session');
        } catch (parseError) {
          // If it's not valid JSON (likely HTML), provide a more helpful error
          if (errorText.includes('<!DOCTYPE')) {
            throw new Error('Server returned HTML instead of JSON. The Edge Function may not be deployed correctly.');
          } else {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
        }
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to start subscription process');
    } finally {
      setProcessingPlan(null);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription?.price_id) return null;
    return plans.find(plan => plan.priceId === subscription.price_id);
  };

  const isCurrentPlan = (planPriceId: string) => {
    return subscription?.price_id === planPriceId && subscription?.subscription_status === 'active';
  };

  if (loading) {
    return (
      <div className="container py-6 md:py-8">
        <PageHeader
          title="Choose Your Plan"
          description="Unlock the full potential of ToolHub with our premium plans"
        />
        <Separator className="my-6" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Choose Your Plan"
        description="Unlock the full potential of ToolHub with our premium plans"
      />
      <Separator className="my-6" />
      
      {/* Current Subscription Status */}
      {currentPlan && subscription?.subscription_status === 'active' && (
        <Card className="mb-8 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <currentPlan.icon className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800 dark:text-green-200">
                Current Plan: {currentPlan.name}
              </CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                Active
              </Badge>
            </div>
            <CardDescription className="text-green-700 dark:text-green-300">
              You're currently subscribed to the {currentPlan.name} plan.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = isCurrentPlan(plan.priceId);
          const isProcessing = processingPlan === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                plan.popular 
                  ? 'border-2 border-blue-500 shadow-lg scale-105' 
                  : 'border border-gray-200 dark:border-gray-700'
              } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-4 left-4">
                  <Badge className={`${plan.badgeColor} text-white text-xs px-2 py-1`}>
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pt-8 pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground px-2">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground ml-1">
                      {plan.price > 0 ? '/month' : ''}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <Button 
                  className={`w-full mb-6 ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : isCurrent
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : isCurrent ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrent || isProcessing || !userId}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrent ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Current Plan
                    </>
                  ) : !userId ? (
                    'Sign in to Subscribe'
                  ) : (
                    'Subscribe'
                  )}
                </Button>

                <div className="space-y-3">
                  <p className="font-semibold text-sm">This includes:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Information */}
      <Card className="mt-12 max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Can I change plans anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated automatically.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, debit cards, and other payment methods through Stripe.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
              <p className="text-sm text-muted-foreground">
                We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}