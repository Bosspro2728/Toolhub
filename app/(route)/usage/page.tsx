"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Crown, Star } from 'lucide-react';
import Link from 'next/link';

interface FeatureUsage {
  feature: string;
  usage: number;
  limit: number;
  remaining: number;
}

interface UsageData {
  plan: string;
  features: FeatureUsage[];
}

const featureNames: Record<string, string> = {
  ai_chat: 'AI Chat',
  text_humanizer: 'Text Humanizer',
  ai_detection: 'AI Detection',
  translation: 'Translation',
  text_to_speech: 'Text to Speech',
  seo_analyzer: 'SEO Analyzer',
  code_snippets: 'Code Snippets',
  document_view: 'Document Viewer',
  file_conversion: 'File Conversion',
  media_conversion: 'Media Conversion',
  url_shortener: 'URL Shortener'
};

export default function UsagePage() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsageData() {
      try {
        const response = await fetch('/api/usage');
        
        if (!response.ok) {
          throw new Error('Failed to fetch usage data');
        }
        
        const data = await response.json();
        setUsageData(data);
      } catch (err) {
        console.error('Error fetching usage data:', err);
        setError('Failed to load usage data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsageData();
  }, []);

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'master':
        return <Crown className="h-5 w-5 text-purple-500" />;
      case 'pro':
        return <Zap className="h-5 w-5 text-blue-500" />;
      default:
        return <Star className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'master':
        return 'bg-purple-500';
      case 'pro':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="container py-6 md:py-8">
        <PageHeader
          title="Usage Dashboard"
          description="Monitor your feature usage and limits"
        />
        <Separator className="my-6" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading usage data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6 md:py-8">
        <PageHeader
          title="Usage Dashboard"
          description="Monitor your feature usage and limits"
        />
        <Separator className="my-6" />
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Usage Dashboard"
        description="Monitor your feature usage and limits"
      />
      <Separator className="my-6" />
      
      {/* Current Plan */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getPlanIcon(usageData?.plan || 'free')}
              <CardTitle>
                Current Plan: {usageData?.plan === 'master' ? 'Master' : usageData?.plan === 'pro' ? 'Pro' : 'Free'}
              </CardTitle>
              <Badge className={`${getPlanColor(usageData?.plan || 'free')} text-white`}>
                Active
              </Badge>
            </div>
            <Link href="/pricing">
              <Button>
                {usageData?.plan === 'free' ? 'Upgrade' : 'Manage Subscription'}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {usageData?.plan === 'free' 
              ? 'You are on the Free plan. Upgrade to Pro or Master for increased usage limits.'
              : usageData?.plan === 'pro'
              ? 'You are on the Pro plan. Enjoy increased usage limits and premium features.'
              : 'You are on the Master plan. Enjoy maximum usage limits and all premium features.'}
          </p>
        </CardContent>
      </Card>
      
      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usageData?.features.map((feature) => {
          const usagePercentage = Math.min(100, (feature.usage / feature.limit) * 100);
          const isExhausted = feature.remaining <= 0;
          const isLow = feature.remaining <= Math.max(1, Math.floor(feature.limit * 0.2));
          
          return (
            <Card 
              key={feature.feature}
              className={`${isExhausted 
                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
                : isLow 
                ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                : ''}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{featureNames[feature.feature] || feature.feature}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Daily Usage</span>
                    <span className={`font-medium ${isExhausted ? 'text-red-600 dark:text-red-400' : ''}`}>
                      {feature.usage} / {feature.limit}
                    </span>
                  </div>
                  
                  <Progress 
                    value={usagePercentage} 
                    className={`h-2 ${
                      isExhausted 
                        ? 'bg-red-200 dark:bg-red-950' 
                        : isLow 
                        ? 'bg-yellow-200 dark:bg-yellow-950'
                        : ''
                    }`}
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {feature.remaining} uses remaining today
                    </span>
                    
                    {(isExhausted || isLow) && (
                      <Link href="/pricing">
                        <Button size="sm" variant={isExhausted ? "default" : "outline"}>
                          <Zap className="mr-1 h-3 w-3" />
                          Upgrade
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Usage Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Usage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Your usage limits reset daily at midnight UTC. Upgrade your plan to increase your daily limits.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Free Plan</h3>
                <p className="text-sm text-muted-foreground">Basic access with limited daily usage</p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium mb-2 text-blue-700 dark:text-blue-300">Pro Plan</h3>
                <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Increased limits for regular users</p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-medium mb-2 text-purple-700 dark:text-purple-300">Master Plan</h3>
                <p className="text-sm text-purple-600/80 dark:text-purple-400/80">Maximum limits for power users</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}