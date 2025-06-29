"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import ToolWrapper from "@/components/shared/tool-wrapper";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Languages, Copy, History } from "lucide-react";
import {languages} from "@/constant/languagesCodes";
import { UsageLimitAlert } from "@/components/shared/usage-limit-alert";
import { useFeatureLimit } from "@/hooks/use-feature-limit";
import { toast } from "sonner";

export default function TranslationPage() {
  const [sourceText, setSourceText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  // Use the feature limit hook
  const { canUse, incrementUsage } = useFeatureLimit('translation', {
    redirectToPricing: true,
    showToast: true
  });

  const handleTranslate = async () => {
    // Check if user can use this feature
    if (!canUse) {
      toast.error("Daily limit reached for translations. Please upgrade your plan for more usage.");
      return;
    }
    
    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: sourceText,
          target_lang: targetLang,
          source_lang: sourceLang
        })
      });

      const data = await res.json();
      setTranslatedText(data?.translated || "Translation failed.");
      
      // Increment usage after successful API call
      await incrementUsage();
    } catch (err) {
      setTranslatedText("Error translating text.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader title="Translation" description="Translate text between multiple languages with AI" />
      <Separator className="my-6" />
      
      {/* Usage limit alert */}
      <UsageLimitAlert featureType="translation" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Translation">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" onClick={() => {
                  const temp = sourceLang;
                  setSourceLang(targetLang);
                  setTargetLang(temp);
                }}>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter text to translate..."
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => setSourceText("")}>
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Textarea
                    value={translatedText}
                    readOnly
                    className="min-h-[200px]"
                    placeholder="Translation will appear here..."
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(translatedText)}
                      disabled={!translatedText}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleTranslate}
                  disabled={!sourceText || isTranslating || !canUse}
                  className="min-w-[200px]"
                >
                  <Languages className="h-4 w-4 mr-2" />
                  {isTranslating ? "Translating..." : "Translate"}
                </Button>
              </div>
            </div>
          </ToolWrapper>
        </div>

        <div>
          <ToolWrapper title="Translation History">
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent translations</p>
              </div>
            </div>
          </ToolWrapper>
        </div>
      </div>
    </div>
  );
}