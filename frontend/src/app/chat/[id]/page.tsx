"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { chatService, fileService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Play, Loader2, User, Bot, FileText, Video, Music } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function ChatPage() {
  const { id } = useParams() as { id: string };
  const [file, setFile] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const playerRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFile();
    fetchChatHistory();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const data = await chatService.getHistory(id);
      const fileMessages = data
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((m: any) => ({
          role: m.role,
          content: m.content,
          created_at: m.created_at
        }));
      setMessages(fileMessages);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const fetchFile = async () => {
    try {
      const files = await fileService.list();
      const currentFile = files.find((f: any) => f.id === id);
      setFile(currentFile);
    } catch (error) {
      toast.error("Failed to load file details");
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !file) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatService.query([id], input, messages);
      const aiMessage = { role: "assistant", content: response.answer, sources: response.sources };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  const handleSeek = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, "seconds");
      toast.info(`Jumped to ${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Media Side */}
      <div className="flex-1 p-6 flex flex-col gap-6">
        <div className="flex items-center gap-4 border-b pb-4">
          <div className="bg-primary/10 p-2 rounded">
            {file?.type === 'pdf' ? <FileText className="h-6 w-6 text-red-500" /> :
             file?.type === 'mp4' ? <Video className="h-6 w-6 text-blue-500" /> :
             <Music className="h-6 w-6 text-green-500" />}
          </div>
          <div>
            <h1 className="text-xl font-bold">{file?.name || "Loading..."}</h1>
            <p className="text-sm text-muted-foreground capitalize">{file?.type} Document</p>
          </div>
        </div>

        <div className="flex-1 bg-black rounded-xl overflow-hidden relative group">
          {file?.type === 'pdf' ? (
             <div className="h-full flex items-center justify-center text-white/50">
               <FileText className="h-20 w-20 mb-4" />
               <p>PDF Viewer (Metadata RAG)</p>
             </div>
          ) : (
            <ReactPlayer
              ref={playerRef}
              url={file?.url}
              controls
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          )}
        </div>
      </div>

      {/* Chat Side */}
      <div className="w-[450px] border-l bg-muted/10 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <Bot className="h-12 w-12 mx-auto text-primary mb-4 opacity-20" />
                <p className="text-muted-foreground text-sm">Ask me anything about this {file?.type}!</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border shadow-sm'
                }`}>
                  <div className="flex items-center gap-2 mb-2 opacity-70">
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    <span className="text-xs font-bold uppercase">{msg.role}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Timestamps / Sources</p>
                      {msg.sources.map((src: any, idx: number) => (
                        src.metadata.start_time !== null && (
                          <Button 
                            key={idx} 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 text-xs mr-2"
                            onClick={() => handleSeek(src.metadata.start_time)}
                          >
                            <Play className="h-3 w-3 mr-1" /> 
                            {Math.floor(src.metadata.start_time / 60)}:{String(Math.floor(src.metadata.start_time % 60)).padStart(2, '0')}
                          </Button>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-background border rounded-2xl p-4 shadow-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex gap-2"
          >
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
