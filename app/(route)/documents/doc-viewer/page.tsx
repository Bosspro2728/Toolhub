"use client";
import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import ToolWrapper from '@/components/shared/tool-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Upload,
  Download,
  Search,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { toast } from 'sonner';
import { UsageLimitAlert } from '@/components/shared/usage-limit-alert';
import { useFeatureLimit } from '@/hooks/use-feature-limit';

export default function DocViewerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the feature limit hook
  const { canUse, incrementUsage } = useFeatureLimit('document_view', {
    redirectToPricing: true,
    showToast: true
  });

  const handleOpen = () => fileInputRef.current?.click();

  const handleFileUpload = async (file: File) => {
    // Check if user can use this feature
    if (!canUse) {
      toast.error("Daily limit reached for document viewer. Please upgrade your plan for more usage.");
      return;
    }
    
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("https://services-view-file.onrender.com/upload-temp-docx/", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const { url } = await uploadRes.json();
      setFileUrl(url);
      setCurrentPage(1);
      setSearchResults('');
      
      // Increment usage after successful upload
      await incrementUsage();
    } catch (err) {
      console.error(err);
      setError("Failed to upload or fetch the file.");
      toast.error("Failed to upload or fetch the file.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (
      !['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.type)
    ) {
      toast.error('Please select a Word document (.doc or .docx)');
      return;
    }
    setFile(f);
    handleFileUpload(f);
  };

  const handleDownload = () => {
    if (!file || !fileUrl) return;
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = file.name;
    a.click();
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));

  const handleSearch = () => {
    if (!fileUrl) return;
    if (!searchQuery.trim()) {
      setSearchResults('');
      return;
    }
    setSearchResults('Search not supported for Word documents in this viewer.');
    toast.error('Search not supported for Word files');
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Document Viewer"
        description="View various document formats online"
      />
      <Separator className="my-6" />
      
      {/* Usage limit alert */}
      <UsageLimitAlert featureType="document_view" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Viewer */}
        <div className="lg:col-span-2">
          <ToolWrapper title="Document Viewer">
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleOpen} disabled={uploading || !canUse}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Open Document"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!fileUrl}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomOut}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[4rem] text-center">{zoom}%</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomIn}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="aspect-[8.5/11] bg-muted rounded-lg overflow-hidden">
                {fileUrl ? (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=https://services-view-file.onrender.com${
                      fileUrl
                    }&wdStartOn=1`}
                    className="w-full h-full"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                    title="Word document preview"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <FileText className="h-12 w-12 mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Upload a Word document to view
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button variant="outline" disabled>
                  Next
                </Button>
              </div>
            </div>
          </ToolWrapper>
        </div>

        {/* Sidebar */}
        <div>
          <ToolWrapper title="Document Search">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search in document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSearch}
                  disabled={!fileUrl}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground text-center py-8">
                {searchResults || 'No search results'}
              </div>
            </div>
          </ToolWrapper>

          <div className="mt-6">
            <ToolWrapper title="Pro Features">
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Text Recognition (OCR)</p>
                  <p className="text-sm text-muted-foreground">
                    Extract text from scanned documents
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Annotations</p>
                  <p className="text-sm text-muted-foreground">
                    Add notes and highlights
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Document Translation</p>
                  <p className="text-sm text-muted-foreground">
                    Translate documents to other languages
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