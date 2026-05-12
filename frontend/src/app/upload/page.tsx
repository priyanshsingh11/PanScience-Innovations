"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { fileService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, FileText, Music, Video, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'video/*': ['.mp4', '.mov']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      await fileService.upload(file);
      toast.success("File uploaded and processed successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Upload failed", error);
      toast.error(error.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Upload Multimedia</h1>
        <p className="text-muted-foreground">Upload PDFs, Audio or Video to start an AI-powered conversation.</p>
      </div>

      <Card className="border-2 border-dashed">
        <CardContent className="p-0">
          {!file ? (
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center p-20 cursor-pointer transition-colors ${isDragActive ? 'bg-primary/5' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <p className="text-lg font-medium">Drag & Drop file here</p>
              <p className="text-sm text-muted-foreground mt-2">or click to browse from your computer</p>
              <p className="text-xs text-muted-foreground mt-4">Supported: PDF, MP3, WAV, MP4, MOV</p>
            </div>
          ) : (
            <div className="p-10 flex flex-col items-center">
              <div className="flex items-center justify-between w-full bg-muted/30 p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="bg-background p-2 rounded border">
                    {file.type.includes('pdf') ? <FileText className="h-6 w-6 text-red-500" /> :
                     file.type.includes('video') ? <Video className="h-6 w-6 text-blue-500" /> :
                     <Music className="h-6 w-6 text-green-500" />}
                  </div>
                  <div>
                    <p className="font-medium truncate max-w-[300px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-8 flex gap-4 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setFile(null)} disabled={uploading}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Upload & Process"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
