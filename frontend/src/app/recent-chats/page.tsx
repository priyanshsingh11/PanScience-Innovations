"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ChatMessage {
  id: string;
  file_id: string;
  role: string;
  content: string;
  created_at: string;
  uploaded_files?: {
    name: string;
  };
}

export default function RecentChatsPage() {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/history?user_id=test_user`);
        if (response.ok) {
          const data = await response.json();
          setChats(data);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recent Chats</h1>
            <p className="text-muted-foreground">View your past conversations with multimedia files.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-semibold">No chats yet</h3>
            <p className="text-muted-foreground mb-6">Start a conversation with an uploaded file to see it here.</p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {chats.map((chat) => (
              <div key={chat.id} className="group relative bg-card hover:bg-muted/50 border rounded-xl p-6 transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        chat.role === "user" ? "bg-primary/10 text-primary" : "bg-green-500/10 text-green-500"
                      )}>
                        {chat.role}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(chat.created_at), "MMM d, h:mm a")}
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2 mb-4 italic text-muted-foreground">
                      "{chat.content}"
                    </p>
                    {chat.uploaded_files && (
                      <div className="text-xs font-medium text-primary">
                        Context: {chat.uploaded_files.name}
                      </div>
                    )}
                  </div>
                  <Link href={`/chat/${chat.file_id}`}>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper for class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
