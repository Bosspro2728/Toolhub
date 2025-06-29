"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import ToolWrapper from '@/components/shared/tool-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Link2,
  Copy,
  History,
  Trash2,
} from 'lucide-react';
import { UsageLimitAlert } from '@/components/shared/usage-limit-alert';
import { useFeatureLimit } from '@/hooks/use-feature-limit';
import { toast } from 'sonner';

export default function UrlShortenerPage() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  const [history, setHistory] = useState<{original: string, shortened: string}[]>([]);

  // Use the feature limit hook
  const { canUse, incrementUsage } = useFeatureLimit('url_shortener', {
    redirectToPricing: true,
    showToast: true
  });

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch('/api/url-shortner', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();
        if (data?.history) {
          setHistory(data.history);
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
      }
    };

    loadHistory();
  }, []);

  const handleShorten = async () => {
    if (!url) return;
    
    // Check if user can use this feature
    if (!canUse) {
      toast.error("Daily limit reached for URL shortener. Please upgrade your plan for more usage.");
      return;
    }
    
    setIsShortening(true);

    try {
      const res = await fetch('/api/url-shortner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (data.short) {
        setShortUrl(data.short);
        setHistory([{ original: url, shortened: data.short }, ...history]);
        
        // Increment usage after successful shortening
        await incrementUsage();
      } else {
        alert(data.error || 'Failed to shorten URL');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    } finally {
      setIsShortening(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="URL Shortener"
        description="Create short and memorable links"
      />
      <Separator className="my-6" />
      
      {/* Usage limit alert */}
      <UsageLimitAlert featureType="url_shortener" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="URL Shortener">
            <div className="space-y-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter long URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button
                  onClick={handleShorten}
                  disabled={!url || isShortening || !canUse}
                  className="shrink-0"
                >
                  {isShortening ? 'Shortening...' : 'Shorten'}
                </Button>
              </div>
              
              {shortUrl && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm">{shortUrl}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(shortUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {history.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Recent URLs</h3>
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted rounded-lg flex items-center justify-between"
                    >
                      <div className="space-y-1 truncate mr-4">
                        <p className="text-sm font-medium truncate">
                          {item.shortened}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.original}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(item.shortened)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ToolWrapper>
        </div>
        
        <div>
          <ToolWrapper title="Statistics">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{history.length}</p>
                  <p className="text-sm text-muted-foreground">Links Created</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                </div>
              </div>
            </div>
          </ToolWrapper>
          
          <div className="mt-6">
            <ToolWrapper title="Pro Features">
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Custom URLs</p>
                  <p className="text-sm text-muted-foreground">
                    Create branded short links
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Click Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Track link performance
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">QR Codes</p>
                  <p className="text-sm text-muted-foreground">
                    Generate QR codes for links
                  </p>
                </div>
                <div className="mt-4 text-center">
                  <Button>Upgrade to Pro</Button>
                </div>
              </div>
            </ToolWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}