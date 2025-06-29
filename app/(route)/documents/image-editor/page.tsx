"use client";

import { useEffect, useRef, useState } from "react";
import {
  ImageIcon,
  Download,
  Upload,
  Maximize,
  Minimize,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/shared/page-header";
import { Separator } from "@/components/ui/separator";
import ToolWrapper from "@/components/shared/tool-wrapper";
import Photopea from "photopea";

export default function PhotopeaEditor({ width = 800, height = 600 }) {
  const containerRef = useRef(null);
  const peaRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;
    setIsLoading(true);
    Photopea.createEmbed(containerRef.current)
      .then((pea) => {
        peaRef.current = pea;
        return pea.runScript(
          `app.documents.add(${width}, ${height}, 72, "Untitled", "RGB");`
        );
      })
      .catch((err) => console.error("Photopea init error:", err))
      .finally(() => setIsLoading(false));
  }, [width, height]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const loadImage = async () => {
    if (!peaRef.current) return;
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    try {
      setIsLoading(true);
      toast.info("Loading image…", { duration: 2000 });
      const resp = await fetch(imageUrl);
      if (!resp.ok) throw new Error("Fetch failed");
      const buf = await resp.arrayBuffer();
      await peaRef.current.loadAsset(buf);
      await peaRef.current.runScript(`
        var doc = app.activeDocument;
        doc.resizeCanvas(doc.width, doc.height, app.BackgroundColor);
      `);
      toast.success("Image loaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load. Check URL.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportPNG = async () => {
    if (!peaRef.current) return;
    try {
      toast.info("Exporting…", { duration: 2000 });
      const result = await peaRef.current.runScript(
        `app.activeDocument.saveAsPNG();`
      );
      const dataURL = result.find((r) => r.startsWith("data:image/png"));
      if (!dataURL) throw new Error("No data URL");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "photopea-export.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Export complete!");
    } catch (err) {
      console.error(err);
      toast.error("Export failed. Try to export it in the editor itself.");
    }
  };

  const resetEditor = async () => {
    if (!peaRef.current) return;
    try {
      setIsLoading(true);
      toast.info("Resetting…", { duration: 2000 });
      await peaRef.current.runScript(`
        if (app.documents.length > 0) app.activeDocument.close(false);
        app.documents.add(${width}, ${height}, 72, "Untitled", "RGB");
      `);
      setImageUrl("");
      toast.success("Editor reset!");
    } catch (err) {
      console.error(err);
      toast.error("Reset failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!isFullscreen) {
      el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() ?? document.webkitExitFullscreen?.();
    }
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Image Editor"
        description="Edit and enhance your images with powerful tools"
      />
      <p>
        This editor is powered by{" "}
        <a
          href="https://www.photopea.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600"
        >
          Photopea
        </a>
      </p>
      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Image Editor">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter image URL to load"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  />
                  <Button
                    onClick={loadImage}
                    className="bg-blue-600 text-white"
                  >
                    <Upload className="h-4 w-4 mr-1" /> Load
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={exportPNG} className="bg-green-600 text-white">
                    <Download className="h-4 w-4 mr-1" /> Export PNG
                  </Button>
                  {!isFullscreen && (
                    <Button onClick={toggleFullscreen} variant="outline">
                      <Maximize className="h-4 w-4 mr-1" /> Fullscreen
                    </Button>
                  )}
                </div>
              </div>

              <div
                ref={containerRef}
                className={`relative ${
                  isFullscreen
                    ? "fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4 w-screen h-screen"
                    : "h-[600px]"
                } border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden`}
              >
                {isFullscreen && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 z-20 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  >
                    <Minimize className="h-4 w-4 mr-1" /> Exit Fullscreen
                  </Button>
                )}

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400" />
                      <p className="mt-4 text-gray-600 dark:text-gray-300">
                        Loading editor...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ToolWrapper>
        </div>

        <div className="space-y-6">
          <ToolWrapper title="Editor Features">
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Basic Tools
                </h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Crop and resize images</li>
                  <li>• Adjust brightness and contrast</li>
                  <li>• Apply filters and effects</li>
                  <li>• Work with layers</li>
                  <li>• Add text and shapes</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Supported Formats
                </h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• PNG, JPG, WEBP</li>
                  <li>• PSD (Photoshop)</li>
                  <li>• SVG, GIF</li>
                  <li>• RAW formats</li>
                  <li>• And many more</li>
                </ul>
              </div>
            </div>
          </ToolWrapper>

          {/* <ToolWrapper title="Pro Features">
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Advanced Tools</p>
                <p className="text-sm text-muted-foreground">
                  Access professional editing tools
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Batch Processing</p>
                <p className="text-sm text-muted-foreground">
                  Edit multiple images at once
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Cloud Storage</p>
                <p className="text-sm text-muted-foreground">
                  Save and access your work anywhere
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
