"use client";

import { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import "@/styles/quill-icons.css"
import { FileText, Download, Copy, Check, File as FilePdf, FileText as FileDocx } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from '@/components/shared/page-header';
import { Separator } from "@/components/ui/separator";
import ToolWrapper from '@/components/shared/tool-wrapper';
import { toast } from "sonner";
import { useFeatureLimit } from "@/hooks/use-feature-limit";
import { getUserPlanTier } from "@/utils/feature-limits";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ size: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "video", "blockquote", "code-block", "link"],
  ["clean"],
];

export default function TextEditor() {
  const wrapperRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [copied, setCopied] = useState(false);
  const [planTier, setPlanTier] = useState<string>('free');
  const [allowedExports, setAllowedExports] = useState<string[]>(['html']);

  useEffect(() => {
    // Get user's plan tier and allowed exports
    const getUserPlan = async () => {
      const tier = await getUserPlanTier();
      setPlanTier(tier);
      
      // Set allowed exports based on plan
      if (tier === 'master' || tier === 'pro') {
        setAllowedExports(['html', 'docx', 'pdf']);
      } else {
        setAllowedExports(['html']);
      }
    };
    
    getUserPlan();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    import("quill").then((QuillModule) => {
      const Quill = QuillModule.default;

      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = "";
        const editor = document.createElement("div");
        wrapperRef.current.append(editor);

        const q = new Quill(editor, {
          theme: "snow",
          readOnly,
          modules: {
            syntax: { hljs },
            toolbar: TOOLBAR_OPTIONS,
          },
        });

        setQuill(q);
      }
    });
  }, []);

  useEffect(() => {
    if (quill) {
      quill.enable(!readOnly);
    }
  }, [readOnly, quill]);

  const handleExport = () => {
    if (!quill) return;

    const content = quill.root.innerHTML;
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDocx = () => {
    if (planTier === 'free') {
      toast.error("Upgrade to Pro or Master plan to export as DOCX");
      return;
    }
    
    toast.info("DOCX export coming soon!", {
      description: "This feature is currently in development and will be available soon."
    });
  };

  const handleExportPdf = () => {
    if (planTier === 'free') {
      toast.error("Upgrade to Pro or Master plan to export as PDF");
      return;
    }
    
    toast.info("PDF export coming soon!", {
      description: "This feature is currently in development and will be available soon."
    });
  };

  const handleCopy = () => {
    if (!quill) return;

    const content = quill.root.innerHTML;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Document Creator"
        description="Create and edit rich text documents"
      />
      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Rich Text Editor">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="read-only" checked={readOnly} onCheckedChange={setReadOnly} />
                    <Label htmlFor="read-only" className="text-gray-700 dark:text-gray-300">
                      Read-only
                    </Label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy HTML
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export HTML
                  </Button>
                  <Button
                    variant={allowedExports.includes('docx') ? "outline" : "ghost"}
                    size="sm"
                    onClick={handleExportDocx}
                    className="border-gray-300 dark:border-gray-600"
                    disabled={!allowedExports.includes('docx')}
                  >
                    <FileDocx className="mr-2 h-4 w-4" />
                    Export DOCX
                    {!allowedExports.includes('docx') && <span className="ml-1 text-xs">(Pro)</span>}
                  </Button>
                  <Button
                    variant={allowedExports.includes('pdf') ? "outline" : "ghost"}
                    size="sm"
                    onClick={handleExportPdf}
                    className="border-gray-300 dark:border-gray-600"
                    disabled={!allowedExports.includes('pdf')}
                  >
                    <FilePdf className="mr-2 h-4 w-4" />
                    Export PDF
                    {!allowedExports.includes('pdf') && <span className="ml-1 text-xs">(Pro)</span>}
                  </Button>
                </div>
              </div>

              <div className="min-h-[500px] border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                <div className="container" ref={wrapperRef}></div>
              </div>
            </div>
          </ToolWrapper>
        </div>

        <div className="space-y-6">
          <ToolWrapper title="Editor Tips">
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Basic Features</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Format text with the toolbar</li>
                  <li>• Insert images and media</li>
                  <li>• Create lists and tables</li>
                  <li>• Add links and citations</li>
                  <li>• Use keyboard shortcuts</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Keyboard Shortcuts</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Ctrl + B: Bold</li>
                  <li>• Ctrl + I: Italic</li>
                  <li>• Ctrl + U: Underline</li>
                  <li>• Ctrl + K: Add link</li>
                  <li>• Ctrl + Z: Undo</li>
                </ul>
              </div>
            </div>
          </ToolWrapper>

          <ToolWrapper title="Pro Features">
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Real-time Collaboration</p>
                <p className="text-sm text-muted-foreground">
                  Work together with your team
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Version History</p>
                <p className="text-sm text-muted-foreground">
                  Track changes and revisions
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Advanced Export</p>
                <p className="text-sm text-muted-foreground">
                  Export to PDF, Word, and more
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
  );
}