"use client";

import { LayoutDashboard, Upload, Settings, LogOut, ChevronLeft, ChevronRight, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, signOut } = useAuth();

  // Hide sidebar on login page
  if (pathname === "/login") return null;

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Upload, label: "Upload", href: "/upload" },
    { icon: MessageSquare, label: "Recent Chats", href: "/recent-chats" },
    { icon: Settings, label: "Settings", href: "#" },
  ];

  return (
    <div className={cn(
      "h-screen border-r bg-[#0a0a0a] transition-all duration-300 relative flex flex-col",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="font-bold text-xl tracking-tighter text-white">PanScience</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute -right-3 top-7 bg-background border border-white/10 rounded-full h-6 w-6 hover:bg-white/5 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <div className={cn(
              "flex items-center gap-4 px-3 py-2 rounded-lg transition-all cursor-pointer group",
              pathname === item.href 
                ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 text-white shadow-lg shadow-purple-500/10" 
                : "hover:bg-white/5 text-gray-400 hover:text-white"
            )}>
              <item.icon className={cn("h-5 w-5 flex-shrink-0", pathname === item.href ? "text-purple-400" : "group-hover:text-purple-400")} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-3 py-2 text-gray-400">
            <User className="h-4 w-4" />
            <span className="text-xs truncate">Dev User</span>
          </div>
        )}
        <div 
          onClick={() => {}}
          className={cn(
            "flex items-center gap-4 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/5 cursor-not-allowed transition-all group",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="font-medium">Auth Disabled</span>}
        </div>
      </div>
    </div>
  );
}
