"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Type, ArrowRight, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const convertCase = (text: string, type: string) => {
  switch (type) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "capitalize":
      return text.replace(/\b\w/g, (c) => c.toUpperCase());
    case "sentence":
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    default:
      return text;
  }
};

export default function TextCaseConverter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [caseType, setCaseType] = useState("uppercase");
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to convert");
      return;
    }
    const result = convertCase(inputText, caseType);
    setOutputText(result);
    toast.success("Text converted successfully");
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Type className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Text Case Converter</h2>
        <p className="text-muted-foreground mt-2">Easily convert your text into different case formats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Convert Text Case</CardTitle>
                <Select value={caseType} onValueChange={(val) => setCaseType(val)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uppercase">UPPERCASE</SelectItem>
                    <SelectItem value="lowercase">lowercase</SelectItem>
                    <SelectItem value="capitalize">Capitalized Case</SelectItem>
                    <SelectItem value="sentence">Sentence case</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Input Text</label>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter your text here..."
                    className="min-h-[400px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Converted Text</label>
                    <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!outputText}>
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={outputText}
                    readOnly
                    placeholder="Converted text will appear here..."
                    className="min-h-[400px] bg-muted"
                  />
                </div>
              </div>

              <Button
                onClick={handleConvert}
                disabled={!inputText.trim()}
                className="w-full"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Convert
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Case Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• UPPERCASE: All characters uppercase</li>
                <li>• lowercase: All characters lowercase</li>
                <li>• Capitalized: First letter of each word</li>
                <li>• Sentence case: First letter of each sentence</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Use Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Formatting titles and headings</li>
                <li>• Preparing text for code variables</li>
                <li>• Standardizing writing styles</li>
                <li>• Correcting inconsistent casing</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
