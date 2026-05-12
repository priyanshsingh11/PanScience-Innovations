"use client";

import { useState, useEffect } from "react";
import { fileService } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Music, Video, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const data = await fileService.list();
      setFiles(data);
    } catch (error) {
      console.error("Failed to fetch files", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your multimedia files and start chatting.</p>
        </div>
        <Link href="/upload">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Upload New
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-40" />
            </Card>
          ))
        ) : files.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">No files uploaded yet</h3>
            <p className="text-muted-foreground mb-6">Upload your first PDF, Audio or Video file to get started.</p>
            <Link href="/upload">
              <Button variant="outline">Upload Now</Button>
            </Link>
          </div>
        ) : (
          files.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium truncate max-w-[200px]">
                  {file.name}
                </CardTitle>
                {file.type === "pdf" ? <FileText className="h-4 w-4 text-red-500" /> : 
                 file.type === "mp4" ? <Video className="h-4 w-4 text-blue-500" /> : 
                 <Music className="h-4 w-4 text-green-500" />}
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-4 capitalize">
                  Status: <span className={file.status === 'ready' ? 'text-green-500 font-semibold' : 'text-yellow-500'}>{file.status}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/chat/${file.id}`} className="w-full">
                    <Button variant="secondary" className="w-full" disabled={file.status !== 'ready'}>
                      <MessageSquare className="mr-2 h-4 w-4" /> Chat
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
