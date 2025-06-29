"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import ToolWrapper from '@/components/shared/tool-wrapper';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { GitCompare, Upload, Download, Search, RefreshCw } from 'lucide-react';
import { compareCode } from '@/utils/codeCompare';
import { toast } from 'sonner';

export default function CodeComparePage() {
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [diffMode, setDiffMode] = useState('inline');
  const [isComparing, setIsComparing] = useState(false);
  const [diffResult, setDiffResult] = useState(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
  ];

  const handleCompare = () => {
    if (!code1.trim() || !code2.trim()) {
      toast.error("Please enter code in both editors");
      return;
    }

    setIsComparing(true);
    try {
      const result = compareCode(code1, code2);
      setDiffResult(result);
      toast.success("Comparison complete!");
    } catch (error) {
      console.error("Error comparing code:", error);
      toast.error("Failed to compare code");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <GitCompare className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Code Compare</h2>
        <p className="text-muted-foreground mt-2">Compare and find differences between code snippets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Code Comparison">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={diffMode} onValueChange={setDiffMode}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select View Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inline">Inline</SelectItem>
                    <SelectItem value="split">Split View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Original Code</label>
                    <Button variant="ghost" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={code1}
                    onChange={(e) => setCode1(e.target.value)}
                    placeholder="Paste original code here..."
                    className="font-mono text-sm min-h-[400px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Modified Code</label>
                    <Button variant="ghost" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={code2}
                    onChange={(e) => setCode2(e.target.value)}
                    placeholder="Paste modified code here..."
                    className="font-mono text-sm min-h-[400px]"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleCompare}
                disabled={isComparing || !code1.trim() || !code2.trim()}
                className="w-full"
              >
                {isComparing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  "Compare Code"
                )}
              </Button>

              {diffResult && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-medium">Differences</h3>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                    {diffResult.map((part, index) => (
                      <span
                        key={index}
                        className={
                          part.added
                            ? "bg-green-500/10 text-green-700 dark:text-green-300"
                            : part.removed
                            ? "bg-red-500/10 text-red-700 dark:text-red-300"
                            : ""
                        }
                      >
                        {part.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ToolWrapper>
        </div>
        
        <div className="space-y-6">
          <ToolWrapper title="Diff Summary">
            {diffResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Changes</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Lines Added:</span>
                      <span className="text-green-600 dark:text-green-400">
                        {diffResult.filter(p => p.added).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lines Removed:</span>
                      <span className="text-red-600 dark:text-red-400">
                        {diffResult.filter(p => p.removed).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lines Modified:</span>
                      <span className="text-yellow-600 dark:text-yellow-400">
                        {diffResult.filter(p => !p.added && !p.removed).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Compare code to see differences</p>
              </div>
            )}
          </ToolWrapper>

          {/* <ToolWrapper title="Pro Features">
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Syntax Highlighting</p>
                <p className="text-sm text-muted-foreground">
                  Language-specific highlighting
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Directory Compare</p>
                <p className="text-sm text-muted-foreground">
                  Compare entire directories
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Version Control</p>
                <p className="text-sm text-muted-foreground">
                  Integration with Git
                </p>
              </div>
              <div className="mt-4 text-center">
                <Button>Upgrade to Pro</Button>
              </div>
            </div>
          </ToolWrapper> */}
        </div>
      </div>
    </div>
  );
}