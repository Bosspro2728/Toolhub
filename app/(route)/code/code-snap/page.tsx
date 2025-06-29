"use client";

import { useState, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FileCode, Save, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import * as htmlToImage from 'html-to-image';

export default function CodeSnapPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [savedSnap, setSavedSnap] = useState<any>(null);
  const { theme } = useTheme();
  const codeRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "bash", label: "Bash" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
  ];

  const handleSave = () => {
    if (!content.trim()) {
      toast.error("Please enter some code");
      return;
    }

    setSavedSnap({
      title: title || "Untitled",
      content,
      language,
      timestamp: new Date().toLocaleString(),
    });

    toast.success("Code saved successfully!");
  };

  const handleDownload = async () => {
    if (!savedSnap?.content) {
      toast.error("Please save your code first");
      return;
    }

    try {
      if (codeRef.current) codeRef.current.style.borderRadius = '10px';
      const blob = await htmlToImage.toBlob(codeRef.current!);
      const url = URL.createObjectURL(blob!);
      const link = document.createElement('a');
      link.download = `${savedSnap.title}.png`;
      link.href = url;
      link.click();
      toast.success("Image downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <FileCode className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Code Snap</h2>
        <p className="text-muted-foreground mt-2">Create beautiful code screenshots for sharing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input and Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create Code Snap</CardTitle>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter a title for your code snap"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Textarea
                placeholder="Paste your code here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="font-mono text-sm min-h-[300px]"
              />

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Snap
                </Button>
                <Button onClick={handleDownload} variant="outline" disabled={!savedSnap}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Moved Preview Card here */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {savedSnap ? (
                <div ref={codeRef} className="rounded-lg overflow-hidden">
                  <div className="bg-gray-800 p-4 flex items-center justify-between">
                    <span className="text-white font-medium">{savedSnap.title}</span>
                    <span className="text-gray-400 text-sm">{savedSnap.language}</span>
                  </div>
                  <SyntaxHighlighter
                    language={savedSnap.language}
                    style={isDark ? oneDark : oneLight}
                    wrapLongLines
                    customStyle={{ margin: 0, borderRadius: '0 0 0.75rem 0.75rem' }}
                    codeTagProps={{ style: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }}
                    lineProps={{ style: { display: 'block', whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }}
                    showLineNumbers
                    startingLineNumber={1}
                  >
                    {savedSnap.content}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Save your code to preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Features */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Syntax highlighting for multiple languages</li>
                <li>• Customizable title and metadata</li>
                <li>• Dark and light theme support</li>
                <li>• Export as PNG image</li>
                <li>• Copy code to clipboard</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
