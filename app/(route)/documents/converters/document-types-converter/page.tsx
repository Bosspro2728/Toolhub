"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { PageHeader } from "@/components/shared/page-header";
import ToolWrapper from "@/components/shared/tool-wrapper";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Upload,
  Download,
  ArrowRight,
  Trash2,
} from "lucide-react";
import bytesToSize from "@/utils/bytes-to-size";
import { UsageLimitAlert } from "@/components/shared/usage-limit-alert";
import { useFeatureLimit } from "@/hooks/use-feature-limit";

const formatGroups = {
  document: ["pdf", "docx", "doc", "txt", "rtf", "html"],
  spreadsheet: ["xlsx", "xls", "csv", "json"],
  presentation: ["pptx", "ppt"],
};

const getFileExtension = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase() || "";

const getFileCategory = (fileName: string) => {
  const ext = getFileExtension(fileName);
  return (
    Object.entries(formatGroups).find(([_, extensions]) =>
      extensions.includes(ext)
    )?.[0] || "other"
  );
};

const getCompatibleFormats = (fileName: string) => {
  const category = getFileCategory(fileName);
  return formatGroups[category as keyof typeof formatGroups] || [];
};

interface FileAction {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  from: string;
  to: string | null;
  status: "pending" | "converting" | "completed" | "error";
  error?: string;
  output?: string;
  url?: string;
}

export default function DocumentTypesConverterPage() {
  const [files, setFiles] = useState<FileAction[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  
  // Use the feature limit hook
  const { canUse, incrementUsage } = useFeatureLimit('file_conversion', {
    redirectToPricing: true,
    showToast: true
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (!canUse) {
        toast.error("Daily limit reached for file conversions. Please upgrade your plan for more usage.");
        return;
      }
      
      const newFiles = acceptedFiles.map((file) => ({
        id: uuidv4(),
        file,
        fileName: file.name,
        fileSize: file.size,
        from: getFileExtension(file.name),
        to: null,
        status: "pending" as const,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    },
  });

  const handleFormatChange = (fileId: string, format: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, to: format } : file
      )
    );
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleConvert = async () => {
    // Check if user can use this feature
    if (!canUse) {
      toast.error("Daily limit reached for file conversions. Please upgrade your plan for more usage.");
      return;
    }
    
    setIsConverting(true);

    const updatedFiles = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file.file);
        formData.append("target_format", file.to || "");

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_FILE_CONVERTER_URL}`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to convert ${file.fileName}`);
          }

          const blob = await response.blob();
          const downloadUrl = URL.createObjectURL(blob);
          const outputName = `${
            file.fileName.split(".")[0]
          }_converted.${file.to}`;

          return {
            ...file,
            status: "completed" as const,
            output: outputName,
            url: downloadUrl,
            error: undefined,
          };
        } catch (error: any) {
          console.error(error);
          return {
            ...file,
            status: "error" as const,
            error:
              error.message || "Unknown error occurred during conversion.",
          };
        }
      })
    );

    setFiles(updatedFiles);
    setIsConverting(false);
    
    // Increment usage after successful conversion
    await incrementUsage();
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Document Types Converter"
        description="Convert between different document formats  (conversion from docx to pdf could take a bit longer)"
      />
      <Separator className="my-6" />
      
      {/* Usage limit alert */}
      <UsageLimitAlert featureType="file_conversion" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Document Converter">
            <div className="space-y-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${isDragActive ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <input {...getInputProps()} />
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your documents here or click to browse
                </p>
                <Button variant="outline" disabled={!canUse}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>

              {files.length > 0 && (
                <div className="space-y-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{file.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {bytesToSize(file.fileSize)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {file.from.toUpperCase()}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <Select
                            value={file.to || ""}
                            onValueChange={(value) =>
                              handleFormatChange(file.id, value)
                            }
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="To" />
                            </SelectTrigger>
                            <SelectContent>
                              {getCompatibleFormats(file.fileName).map(
                                (format) => (
                                  <SelectItem key={format} value={format}>
                                    {format.toUpperCase()}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center gap-2">
                          {file.status === "completed" && file.url && (
                            <a
                              href={file.url}
                              download={file.output}
                              className="text-sm text-blue-600 hover:underline flex items-center"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          )}

                          {file.status === "converting" && (
                            <span className="text-sm text-muted-foreground">
                              Converting...
                            </span>
                          )}

                          {file.status === "error" && (
                            <span className="text-sm text-red-500">
                              {file.error}
                            </span>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setFiles([])}>
                      Clear All
                    </Button>
                    <Button
                      onClick={handleConvert}
                      disabled={isConverting || !files.every((f) => f.to) || !canUse}
                    >
                      {isConverting ? (
                        "Converting..."
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Convert Files
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ToolWrapper>
        </div>

        <div>
          <ToolWrapper title="Supported Formats">
            <div className="space-y-4">
              {Object.entries(formatGroups).map(([group, formats]) => (
                <div key={group}>
                  <h3 className="font-medium mb-2 capitalize">{group}</h3>
                  <div className="space-y-2">
                    {formats.map((format) => (
                      <div key={format} className="p-2 bg-muted rounded-md">
                        <p className="text-sm">.{format.toUpperCase()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ToolWrapper>

          <div className="mt-6">
            <ToolWrapper title="Pro Features">
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Batch Conversion</p>
                  <p className="text-sm text-muted-foreground">
                    Convert multiple files at once
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">OCR Support</p>
                  <p className="text-sm text-muted-foreground">
                    Extract text from scanned documents
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Advanced Settings</p>
                  <p className="text-sm text-muted-foreground">
                    Customize conversion parameters
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