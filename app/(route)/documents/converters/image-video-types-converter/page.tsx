"use client";

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { PageHeader } from '@/components/shared/page-header';
import ToolWrapper from '@/components/shared/tool-wrapper';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Image, Video, Upload, Download, ArrowRight, Trash2 } from 'lucide-react';
import bytesToSize from '@/utils/bytes-to-size';
import fileToIcon from '@/utils/fileToIcon';
import { UsageLimitAlert } from '@/components/shared/usage-limit-alert';
import { useFeatureLimit } from '@/hooks/use-feature-limit';
import { toast } from 'sonner';

const formatGroups = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  video: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'mp3'],
  audio: ['mp3', 'wav', 'm4a'],
};

const getFileExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() || '';

const getFileCategory = (fileName: string) => {
  const ext = getFileExtension(fileName);
  return Object.entries(formatGroups).find(([_, extensions]) =>
    extensions.includes(ext)
  )?.[0] || 'other';
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
  fileType: string;
  from: string;
  to: string | null;
  status: 'pending' | 'converting' | 'completed' | 'error';
  error?: string;
  output?: string;
  url?: string;
}

export default function ImageVideoTypesConverterPage() {
  const [files, setFiles] = useState<FileAction[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  
  // Use the feature limit hook
  const { canUse, incrementUsage } = useFeatureLimit('media_conversion', {
    redirectToPricing: true,
    showToast: true
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (!canUse) {
        toast.error("Daily limit reached for media conversions. Please upgrade your plan for more usage.");
        return;
      }
      
      const newFiles = acceptedFiles.map((file) => ({
        id: uuidv4(),
        file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        from: getFileExtension(file.name),
        to: null,
        status: 'pending' as const,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    },
    accept: {
      'image/*': formatGroups.image.map((ext) => `.${ext}`),
      'video/*': formatGroups.video.map((ext) => `.${ext}`),
      'audio/*': formatGroups.audio.map((ext) => `.${ext}`),
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
    setFiles((prev) => {
      const f = prev.find((f) => f.id === fileId);
      if (f?.url) URL.revokeObjectURL(f.url);
      return prev.filter((file) => file.id !== fileId);
    });
  };

  const handleConvert = async () => {
    // Check if user can use this feature
    if (!canUse) {
      toast.error("Daily limit reached for media conversions. Please upgrade your plan for more usage.");
      return;
    }
    
    setIsConverting(true);

    const updated = await Promise.all(
      files.map(async (file) => {
        // mark converting
        file.status = 'converting';
        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('target_format', file.to || '');
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_FILE_CONVERTER_URL}`,
            { method: 'POST', body: formData }
          );
          if (!res.ok) throw new Error(`Failed to convert ${file.fileName}`);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const output = `${file.fileName.split('.')[0]}_converted.${file.to}`;
          return { ...file, status: 'completed' as const, url, output, error: undefined };
        } catch (e: any) {
          console.error(e);
          return { ...file, status: 'error' as const, error: e.message };
        }
      })
    );
    setFiles(updated);
    setIsConverting(false);
    
    // Increment usage after successful conversion
    await incrementUsage();
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Image & Video Converter"
        description="Convert between different image and video formats"
      />
      <Separator className="my-6" />
      
      {/* Usage limit alert */}
      <UsageLimitAlert featureType="media_conversion" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Media Converter">
            <div className="space-y-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}`}
              >
                <input {...getInputProps()} />
                <div className="flex justify-center gap-4 mb-4">
                  <Image className="h-12 w-12 text-muted-foreground" />
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Upload Media Files</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your files here or click to browse
                </p>
                <Button variant="outline" disabled={!canUse}>
                  <Upload className="h-4 w-4 mr-2" /> Choose Files
                </Button>
              </div>

              {files.length > 0 && (
                <div className="space-y-4">
                  {files.map((file) => {
                    const FileIcon = fileToIcon(file.fileType);
                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <FileIcon className="h-5 w-5 text-primary" />
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
                              value={file.to || ''}
                              onValueChange={(value) => handleFormatChange(file.id, value)}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="To" />
                              </SelectTrigger>
                              <SelectContent>
                                {getCompatibleFormats(file.fileName).map((fmt) => (
                                  <SelectItem key={fmt} value={fmt}>
                                    {fmt.toUpperCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-2">
                            {file.status === 'converting' && (
                              <span className="text-sm text-muted-foreground">
                                Converting...
                              </span>
                            )}

                            {file.status === 'completed' && file.url && (
                              <a href={file.url} download={file.output}>
                                <Button variant="secondary" size="icon">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </a>
                            )}

                            {file.status === 'error' && (
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
                    );
                  })}

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        files.forEach(f => f.url && URL.revokeObjectURL(f.url));
                        setFiles([]);
                      }}
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={handleConvert}
                      disabled={isConverting || !files.every((f) => f.to) || !canUse}
                    >
                      {isConverting ? (
                        'Converting...'
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" /> Convert Files
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
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Image Formats</h3>
                <div className="space-y-2">
                  {formatGroups.image.map((format) => (
                    <div key={format} className="p-2 bg-muted rounded-md">
                      <p className="text-sm">.{format.toUpperCase()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Video Formats</h3>
                <div className="space-y-2">
                  {formatGroups.video.map((format) => (
                    <div key={format} className="p-2 bg-muted rounded-md">
                      <p className="text-sm">.{format.toUpperCase()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Audio Formats</h3>
                <div className="space-y-2">
                  {formatGroups.audio.map((format) => (
                    <div key={format} className="p-2 bg-muted rounded-md">
                      <p className="text-sm">.{format.toUpperCase()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ToolWrapper>

          <div className="mt-6">
            <ToolWrapper title="Pro Features">
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Batch Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Convert multiple files at once
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Quality Control</p>
                  <p className="text-sm text-muted-foreground">
                    Advanced quality settings
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Custom Presets</p>
                  <p className="text-sm text-muted-foreground">
                    Save conversion settings
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