"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Loader2, Globe, FileText, Image, Link2, Bot } from 'lucide-react';
import { UsageLimitAlert } from '@/components/shared/usage-limit-alert';
import { useFeatureLimit } from '@/hooks/use-feature-limit';

export default function SeoAnalyzerPage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // Use the feature limit hook
  const { canUse, incrementUsage } = useFeatureLimit('seo_analyzer', {
    redirectToPricing: true,
    showToast: true
  });

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL to analyze");
      return;
    }

    // Check if user can use this feature
    if (!canUse) {
      toast.error("Daily limit reached for SEO analyzer. Please upgrade your plan for more usage.");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch('/api/seo-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setResult(data.result);
      toast.success("Analysis complete!");
      
      // Increment usage after successful API call
      await incrementUsage();
    } catch (err) {
      console.error('Error analyzing URL:', err);
      toast.error("Failed to analyze URL");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="SEO Analyzer"
        description="Analyze your website for SEO optimization"
      />
      <Separator className="my-6" />
      
      {/* Usage limit alert */}
      <UsageLimitAlert featureType="seo_analyzer" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Website Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="Enter website URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button onClick={handleAnalyze} disabled={isAnalyzing || !canUse}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>

              {result && (
                <div className="space-y-6">
                  {/* HTTP Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">HTTP Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Status Code</span>
                        <Badge variant={result.http.status === 200 ? "success" : "destructive"}>
                          {result.http.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>HTTPS</span>
                        <Badge variant={result.http.using_https ? "success" : "destructive"}>
                          {result.http.using_https ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time</span>
                        <span>{result.http.responseTime}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Meta Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Meta Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">Title</h3>
                        <p className="text-sm bg-muted p-2 rounded">{result.title.data}</p>
                        <div className="flex justify-between text-sm">
                          <span>Length</span>
                          <span>{result.title.characters} characters</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium">Meta Description</h3>
                        <p className="text-sm bg-muted p-2 rounded">{result.meta_description.data}</p>
                        <div className="flex justify-between text-sm">
                          <span>Length</span>
                          <span>{result.meta_description.characters} characters</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Content Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h3 className="font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Word Count
                          </h3>
                          <div className="text-2xl font-bold">{result.word_count.total}</div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-medium flex items-center gap-2">
                            <Link2 className="h-4 w-4" />
                            Total Links
                          </h3>
                          <div className="text-2xl font-bold">{result.links_summary["Total links"]}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Images
                        </h3>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Total Images</span>
                            <span>{result.images_analysis.summary.total}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Missing Alt Text</span>
                            <span>{result.images_analysis.summary["No alt tag"]}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium">Headings Distribution</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(result["Page Headings summary"])
                            .filter(([key]) => key.startsWith('H') && key.length === 2)
                            .map(([heading, count]) => (
                              <div key={heading} className="bg-muted p-2 rounded text-center">
                                <div className="text-lg font-bold">{count}</div>
                                <div className="text-sm">{heading}</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Globe className="h-4 w-4 mt-1 text-blue-500" />
                  <span className="text-sm">Check HTTPS security</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-1 text-blue-500" />
                  <span className="text-sm">Analyze meta tags</span>
                </li>
                <li className="flex items-start gap-2">
                  <Image className="h-4 w-4 mt-1 text-blue-500" />
                  <span className="text-sm">Verify image optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <Link2 className="h-4 w-4 mt-1 text-blue-500" />
                  <span className="text-sm">Check internal/external links</span>
                </li>
                <li className="flex items-start gap-2">
                  <Bot className="h-4 w-4 mt-1 text-blue-500" />
                  <span className="text-sm">Validate robots.txt</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pro Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Competitor Analysis</p>
                <p className="text-sm text-muted-foreground">
                  Compare with competitors
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Keyword Tracking</p>
                <p className="text-sm text-muted-foreground">
                  Monitor keyword rankings
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Custom Reports</p>
                <p className="text-sm text-muted-foreground">
                  Generate detailed PDF reports
                </p>
              </div>
              <div className="mt-4 text-center">
                <Button>Upgrade to Pro</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}