"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileJson, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function JSONValidator() {
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState(false);

  const validateJSON = () => {
    if (!jsonInput.trim()) {
      toast.error("Please enter some JSON to validate");
      return;
    }

    setIsValidating(true);
    try {
      const parsed = JSON.parse(jsonInput);
      const pretty = JSON.stringify(parsed, null, 2);
      setValidationResult({
        valid: true,
        message: "Valid JSON",
        formatted: pretty,
      });
      toast.success("JSON is valid!");
    } catch (error) {
      setValidationResult({
        valid: false,
        message: `Invalid JSON: ${error.message}`,
      });
      toast.error("Invalid JSON");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCopy = () => {
    if (!validationResult?.formatted) return;
    navigator.clipboard.writeText(validationResult.formatted);
    setCopied(true);
    toast.success("Formatted JSON copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setJsonInput("");
    setValidationResult(null);
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <FileJson className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">JSON Validator</h2>
        <p className="text-muted-foreground mt-2">Validate and format JSON data with ease</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Validate & Format JSON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Input JSON</label>
                  <Textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste your JSON here..."
                    className="font-mono text-sm min-h-[400px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Formatted Output</label>
                    {validationResult?.formatted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
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
                    )}
                  </div>
                  <div className="relative">
                    <Textarea
                      value={validationResult?.formatted || ""}
                      readOnly
                      className={`font-mono text-sm min-h-[400px] ${
                        validationResult?.valid
                          ? "bg-muted"
                          : "bg-red-50 dark:bg-red-900/20"
                      }`}
                      placeholder="Formatted JSON will appear here..."
                    />
                    {validationResult?.valid === false && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 px-4 py-2 rounded-lg">
                          {validationResult.message}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={validateJSON}
                  disabled={isValidating || !jsonInput.trim()}
                  className="flex-1"
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    "Validate & Format"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={!jsonInput && !validationResult}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>JSON Syntax Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Basic Rules</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Property names must be in double quotes</li>
                    <li>• Strings must be in double quotes</li>
                    <li>• Numbers can be integers or decimals</li>
                    <li>• Arrays are wrapped in square brackets []</li>
                    <li>• Objects are wrapped in curly braces {}</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Valid Values</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Strings: "Hello, World!"</li>
                    <li>• Numbers: 42, 3.14</li>
                    <li>• Booleans: true, false</li>
                    <li>• null</li>
                    <li>• Arrays: [1, 2, 3]</li>
                    <li>• Objects: {"{"}"name": "John"{"}"}
                  </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Missing or extra commas</li>
                <li>• Single quotes instead of double quotes</li>
                <li>• Trailing commas in arrays/objects</li>
                <li>• Unmatched brackets or braces</li>
                <li>• Invalid property names</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}