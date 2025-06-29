"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatCode } from "@/utils/formatCode";
import { FileCode, Copy, Check, Code2 } from 'lucide-react';
import { toast } from "sonner";

const languages = ["javascript", "typescript", "html", "css", "json"];

export default function CodeFormatter() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [formatted, setFormatted] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFormat = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to format");
      return;
    }

    setIsLoading(true);
    try {
      const result = await formatCode(code, language);
      setFormatted(result);
      toast.success("Code formatted successfully!");
    } catch (error) {
      console.error("Error formatting code:", error);
      toast.error("Failed to format code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!formatted) return;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    toast.success("Formatted code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Code2 className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Code Formatter</h2>
        <p className="text-muted-foreground mt-2">Format and beautify your code with support for multiple languages</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Format Code</CardTitle>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Input Code</label>
                  <Textarea
                    placeholder="Paste your code here..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono text-sm min-h-[400px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Formatted Output</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!formatted}
                    >
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
                    value={formatted}
                    readOnly
                    className="font-mono text-sm min-h-[400px] bg-muted"
                    placeholder="Formatted code will appear here..."
                  />
                </div>
              </div>

              <Button
                onClick={handleFormat}
                disabled={isLoading || !code.trim()}
                className="w-full"
              >
                {isLoading ? "Formatting..." : "Format Code"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Formatting Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Supported Languages</h3>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <div
                      key={lang}
                      className="px-3 py-2 rounded-md bg-muted text-sm"
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formatting Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Consistent indentation</li>
                <li>• Proper spacing around operators</li>
                <li>• Standardized line breaks</li>
                <li>• Semicolon handling</li>
                <li>• Bracket style consistency</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}