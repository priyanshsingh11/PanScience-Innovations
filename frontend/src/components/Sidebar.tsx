"use client";

import { LayoutDashboard, Upload, Settings, LogOut, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Upload, label: "Upload", href: "/upload" },
    { icon: MessageSquare, label: "Recent Chats", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
  ];

  return (
    <div className={cn(
      "h-screen border-r bg-muted/20 transition-all duration-300 relative flex flex-col",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && <span className="font-bold text-xl tracking-tighter text-primary">PanScience</span>}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute -right-3 top-7 bg-background border rounded-full h-6 w-6"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <div className={cn(
              "flex items-center gap-4 px-3 py-2 rounded-lg transition-colors cursor-pointer group",
              pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
            )}>
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className={cn(
          "flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors",
          isCollapsed && "justify-center"
        )}>
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </div>
      </div>
    </div>
  );
}
