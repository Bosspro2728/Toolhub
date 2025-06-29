'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
              </div>
              <p className="text-muted-foreground">Processing your subscription...</p>
              <p className="text-xs text-muted-foreground">Setting up your premium access</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 relative">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/20 animate-ping opacity-75"></div>
          </div>
          <CardTitle className="text-2xl">Welcome to ToolHub Premium! 🎉</CardTitle>
          <CardDescription className="text-base">
            Your subscription is now active. Thank you for upgrading your account!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sessionId && (
            <div className="p-4 bg-muted rounded-lg border">
              <p className="text-sm font-medium text-muted-foreground mb-1">Transaction ID:</p>
              <p className="text-xs font-mono break-all bg-background p-2 rounded border">{sessionId}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              What's included in your plan:
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Unlimited access to all premium tools</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Higher usage limits and priority processing</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Advanced features and export options</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Priority customer support</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Next steps:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li>• Check your email for a receipt and welcome guide</li>
              <li>• Your premium features are now active</li>
              <li>• Explore all available tools in your dashboard</li>
              <li>• Manage your subscription anytime in your account</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Link href="/services">
              <Button className="w-full" size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                Explore Premium Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}