"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Bot, Loader2, Info, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { UsageLimitAlert } from "@/components/shared/usage-limit-alert";
import { useFeatureLimit } from "@/hooks/use-feature-limit";

export default function AIDetectionPage() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Use the feature limit hook
  const { canUse, incrementUsage } = useFeatureLimit('ai_detection', {
    redirectToPricing: true,
    showToast: true
  });

  const handleAnalyze = async () => {
    if (!text.trim() || text.length < 10) {
      toast.error("Please enter at least 10 characters of text.");
      return;
    }

    // Check if user can use this feature
    if (!canUse) {
      toast.error("Daily limit reached for AI detection. Please upgrade your plan for more usage.");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/ai-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze text");
      setResult(data);
      toast.success("Analysis complete!");
      
      // Increment usage after successful API call
      await incrementUsage();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      toast.error("Failed to analyze text.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreLabel = (score: number) => {
    if (score < 30) return "Likely Human";
    if (score < 50) return "Possibly Human";
    if (score < 70) return "Possibly AI";
    return "Likely AI";
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return "bg-green-500 text-white";
    if (score < 50) return "bg-yellow-500 text-white";
    if (score < 70) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="AI Content Detector"
        description="Analyze whether text was written by AI or a human"
      />
      <Separator className="my-6" />
      
      {/* Usage limit alert */}
      <UsageLimitAlert featureType="ai_detection" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Text Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your text here (minimum 10 characters)..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] resize-none"
                disabled={isAnalyzing}
              />

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !text.trim() || !canUse}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Analyze Text
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive" className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="mt-6 space-y-4">
                  {/* Summary Badges */}
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Analysis Results
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getScoreColor(result.probabilities.ai)}>
                          {/* {getScoreLabel(result.confidence).toUpperCase()} */}
                          {getScoreLabel(result.confidence).toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="border-gray-300 dark:border-gray-600">
                          Confidence: {result.confidence}
                        </Badge>
                        {result.language && (
                          <Badge variant="outline" className="border-gray-300 dark:border-gray-600">
                            {result.language.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Confidence Progress Bar */}
                    <div>
                      <div className="flex justify-between mb-1 text-sm text-gray-700 dark:text-gray-300">
                        <span>Human</span>
                        <span>AI</span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={`h-full transition-all ${getScoreColor(result.probabilities.ai)}`}
                          style={{ width: `${result.probabilities.ai}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sentence Analysis */}
                  {result.sentences && result.sentences.length > 0 && (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                        Sentence Analysis
                      </h3>
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {result.sentences.map((sentence, idx) => (
                          <div key={idx} className="p-3 rounded bg-gray-100 dark:bg-gray-800">
                            <div className="flex items-center justify-between mb-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                      <span
                                        className={`text-xs font-medium ${getScoreColor(
                                          sentence.confidence
                                        )}`}
                                      >
                                        {getScoreLabel(sentence.confidence)} Confidence:{" "}
                                        {sentence.confidence.toFixed(1)}%
                                      </span>
                                      <Info className="h-3 w-3 ml-1 text-gray-400" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">
                                      Higher confidence indicates stronger AI patterns in this
                                      sentence
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              {sentence.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Our AI detector analyzes various aspects of the text to determine if it was
                likely written by a human or generated by AI:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500/10 text-blue-500 p-1 rounded">•</span>
                  <span>Writing patterns and structure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500/10 text-blue-500 p-1 rounded">•</span>
                  <span>Language complexity and variation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500/10 text-blue-500 p-1 rounded">•</span>
                  <span>Contextual coherence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500/10 text-blue-500 p-1 rounded">•</span>
                  <span>Statistical patterns</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accuracy Note</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                While our detector is highly sophisticated, no AI detection system is
                100% accurate. Results should be considered as probabilistic rather than
                definitive. Multiple factors can influence the detection score, including
                text length, complexity, and writing style.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}