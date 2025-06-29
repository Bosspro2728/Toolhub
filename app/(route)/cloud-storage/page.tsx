"use client";

import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import ToolWrapper from "@/components/shared/tool-wrapper";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FolderPlus,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Download,
  Trash2,
  Share2,
} from "lucide-react";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { getFeatureLimit, getUserPlanTier } from "@/utils/feature-limits";

type UploadedFile = {
  url: string;
  name: string;
  size: string;
  sizeMB: number;
  type: string;
  date: string | undefined;
  key: string;
};

export default function CloudStoragePage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [storageLimit, setStorageLimit] = useState<number>(300); // Default to free tier
  const [planTier, setPlanTier] = useState<string>('free');

  useEffect(() => {
    loadUserFiles();
    loadStorageLimit();
  }, []);

  const loadStorageLimit = async () => {
    try {
      const tier = await getUserPlanTier();
      setPlanTier(tier);
      
      const limit = await getFeatureLimit('storage_limit_mb');
      if (typeof limit === 'number') {
        setStorageLimit(limit);
      }
    } catch (error) {
      console.error("Error loading storage limit:", error);
    }
  };

  const loadUserFiles = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to view your conversations.");
      return;
    }

    try {
      const res = await fetch(`/api/get-files?user_id=${user.id}`, {
          method: 'GET',
        });

      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();

      if (data.files) {
        setFiles(data.files.map((f: any) => ({
          url: f.url,
          name: f.name,
          size: f.size,
          sizeMB: Number(f.sizeMB),
          type: f.type,
          date: f.date,
          key: f.key,
        })));

        toast.success("Files loaded successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading files");
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-5 w-5" />;
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "audio":
        return <Music className="h-5 w-5" />;
      case "folder":
        return <FolderPlus className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const handleDeleteFile = async (index: number) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // Call the API to delete the file from the server
    try{
      const response = await fetch("/api/uploadthing", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: files[index].url, fileKey: files[index].key, user_id: user?.id }),
      })
      const data = await response.json()
      if (data.success) {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        return true;
      } else {
        console.error("Failed to delete file:", data);
        alert("Failed to delete file");
        return false;
      }
    }
    catch(error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file");
      return false;
    };
  };

  const handleDownload = async (file: UploadedFile) => {
    if (!file.url) {
      toast.error("File URL not available for download");
      return;
    }

    try {
      // 1) Fetch the remote file
      const res = await fetch(file.url);
      if (!res.ok) throw new Error("Network response was not OK");

      // 2) Get it as a blob
      const blob = await res.blob();

      // 3) Create an object URL
      const downloadUrl = URL.createObjectURL(blob);

      // 4) Create a hidden <a> and click it
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 5) Clean up
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Download failed");
    }
  };

  const handleShare = (file: any) => {
    const url = file.url;
    navigator.clipboard.writeText(url);
    toast.success(`Link copied to clipboard ${url}`);
  };

  const totalUsedMB = files.reduce((sum, file) => sum + (file.sizeMB || 0), 0);
  const totalUsedGB = totalUsedMB / 1024;
  const storageLimitGB = storageLimit / 1024;
  const usagePercentage = (totalUsedMB / storageLimit) * 100;

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Cloud Storage"
        description="Store and access your files from anywhere"
      />
      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Files">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <UploadButton 
                  endpoint="fileUploader"
                  onClientUploadComplete={(res) => {
                    res.forEach(file => {
                      if (!res || res.length === 0) return;
                      const type = file.type.startsWith("image")
                        ? "image"
                        : file.type.startsWith("video")
                        ? "video"
                        : file.type.startsWith("audio")
                        ? "audio"
                        : "document";
                      setFiles(prev => [
                        ...prev,
                        {
                          name: file.name,
                          type: type,
                          sizeMB: file.size / (1024 * 1024),
                          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                          date: file.lastModified
                            ? new Date(file.lastModified).toISOString().slice(0, 10)
                            : new Date().toISOString().slice(0, 10),
                          url: file.ufsUrl,
                          key: file.key,
                        }
                      ]);
                    });
                    console.log("Files: ", res);
                    toast.success("Upload Completed");
                  }}
                  onUploadError={(error: Error) => {
                    // Do something with the error.
                    toast.error(`ERROR! ${error.message}`);
                  }}
                />
              </div>

              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.size} • {file.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.type !== "folder" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShare(file)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          const confirmed = confirm('Really delete this file?');
                          if (!confirmed) return;
                          const ok = await handleDeleteFile(index);
                          if (ok) {
                            toast.success('File deleted');
                            // Optionally refresh file list
                          } else {
                            toast.error('Could not delete file');
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ToolWrapper>
        </div>

        <div>
          <ToolWrapper title="Storage">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage Used</span>
                  <span>{totalUsedGB.toFixed(2)} GB / {storageLimitGB.toFixed(2)} GB</span>
                </div>
                <Progress value={usagePercentage} />
                <p className="text-xs text-muted-foreground text-right">
                  {planTier === 'free' ? 'Free' : planTier === 'pro' ? 'Pro' : 'Master'} plan: {storageLimitGB.toFixed(2)} GB storage
                </p>
              </div>

              <div className="space-y-4">
                {["document", "image", "video"].map((type) => {
                  const sum = files
                    .filter((f) => f.type === type)
                    .reduce((a, b) => a + (b.sizeMB || 0), 0);
                  const icon =
                    type === "document" ? (
                      <FileText className="h-5 w-5 text-blue-500" />
                    ) : type === "image" ? (
                      <ImageIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <Video className="h-5 w-5 text-purple-500" />
                    );

                  const label =
                    type === "document"
                      ? "Documents"
                      : type === "image"
                      ? "Images"
                      : "Videos";

                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between p-3 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        {icon}
                        <span>{label}</span>
                      </div>
                      <span>{(sum / 1024).toFixed(2)} GB</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </ToolWrapper>

          <div className="mt-6">
            <ToolWrapper title="Pro Features">
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">More Storage</p>
                  <p className="text-sm text-muted-foreground">
                    Up to 5GB of cloud storage
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">File Versioning</p>
                  <p className="text-sm text-muted-foreground">
                    Access previous versions
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Advanced Sharing</p>
                  <p className="text-sm text-muted-foreground">
                    Password protection and expiry
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