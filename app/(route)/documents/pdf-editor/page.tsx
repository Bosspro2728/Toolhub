//@ts-nocheck
"use client";

import { useRef, useEffect, useState } from "react";
import { PageHeader } from '@/components/shared/page-header';
import ToolWrapper from '@/components/shared/tool-wrapper';
import { Button } from "@/components/ui/button";
import { EmbedPDF } from "@simplepdf/react-embed-pdf";
import { FileType, Maximize, Minimize } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function PDFEditor() {
  const containerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  useEffect(() => {
    const handler = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, []);

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="PDF Editor"
        description="View, edit, and manage your PDF documents"
      />
      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="PDF Editor">
            <div
              ref={containerRef}
              className="relative border rounded-xl p-2 bg-white dark:bg-gray-900 mt-4 flex justify-center items-center min-h-[70vh]"
              style={{ minHeight: 500 }}
              id="pdf-viewer-container"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 h-8 w-8 text-gray-500 dark:text-gray-400"
                title="Full Screen"
                onClick={toggleFullScreen}
              >
                {isFullScreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </Button>
              <EmbedPDF
                mode="inline"
                style={{ width: '100%', height: '70vh', minHeight: 500, border: 'none', borderRadius: 12 }}
              />
            </div>
          </ToolWrapper>
        </div>

        <div className="space-y-6">
          <ToolWrapper title="About PDF Editor">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Features</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Drag and drop PDF upload</li>
                  <li>• View and annotate PDF files</li>
                  <li>• Fast, in-browser PDF rendering</li>
                  <li>• Fullscreen mode for distraction-free editing</li>
                  <li>• No server upload—files stay on your device</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Use Cases</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Quickly preview and annotate PDF documents</li>
                  <li>• Fill out forms and add comments</li>
                  <li>• Review e-books, reports, and contracts</li>
                  <li>• Works on all modern browsers and devices</li>
                </ul>
              </div>
            </div>
          </ToolWrapper>

          {/* <ToolWrapper title="Pro Features">
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Advanced Editing</p>
                <p className="text-sm text-muted-foreground">
                  Edit text, images, and form fields
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">OCR Support</p>
                <p className="text-sm text-muted-foreground">
                  Extract text from scanned documents
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Batch Processing</p>
                <p className="text-sm text-muted-foreground">
                  Merge, split, and organize multiple PDFs
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