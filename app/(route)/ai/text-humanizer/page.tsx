"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import ToolWrapper from '@/components/shared/tool-wrapper';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Wand2, Copy, Save, History } from 'lucide-react';
import { toast } from 'sonner';
import { UsageLimitAlert } from '@/components/shared/usage-limit-alert';
import { useFeatureLimit } from '@/hooks/use-feature-limit';

export default function TextHumanizerPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [level, setLevel] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);

  // Use the feature limit hook
  const { canUse, incrementUsage } = useFeatureLimit('text_humanizer', {
    redirectToPricing: true,
    showToast: true
  });

  const handleHumanize = async () => {
    // Check if user can use this feature
    if (!canUse) {
      toast.error("Daily limit reached for text humanizer. Please upgrade your plan for more usage.");
      return;
    }
    
    setIsProcessing(true);

    try {
      const res = await fetch('/api/text-humanizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, level }),
      });

      const data = await res.json();
      const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;

      setOutputText(parsed.humanized_text || 'Failed to parse response');
      
      // Increment usage after successful API call
      await incrementUsage();
    } catch (error) {
      setOutputText('An error occurred while processing.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Text Humanizer"
        description="Make AI-generated text sound more natural and human-like"
      />
      <Separator className="my-6" />
      
      {/* Usage limit alert */}
      <UsageLimitAlert featureType="text_humanizer" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Text Humanizer">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter AI-generated text here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[300px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputText('')}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Textarea
                    value={outputText}
                    readOnly
                    className="min-h-[300px]"
                    placeholder="Humanized text will appear here..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(outputText)}
                      disabled={!outputText}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Humanization Level</label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="enhanced">Enhanced</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleHumanize}
                  disabled={!inputText || isProcessing || !canUse}
                  className="min-w-[200px]"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Humanize Text'}
                </Button>
              </div>
            </div>
          </ToolWrapper>
        </div>

        <div>
          <ToolWrapper title="Recent Texts">
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent texts</p>
              </div>
            </div>
          </ToolWrapper>

          <div className="mt-6">
            <ToolWrapper title="Pro Features">
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Advanced Tone Control</p>
                  <p className="text-sm text-muted-foreground">
                    Fine-tune the writing style with more options
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Batch Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Humanize multiple texts at once
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Templates</p>
                  <p className="text-sm text-muted-foreground">
                    Save and reuse your favorite settings
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