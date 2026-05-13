import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PanScience | Multimedia RAG",
  description: "AI-Powered Multimedia Retrieval-Augmented Generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <TooltipProvider>
            <div className="flex">
              <SidebarWrapper />
              <main className="flex-1 h-screen overflow-auto">
                {children}
              </main>
            </div>
            <Toaster position="top-right" richColors />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// Separate component to handle conditional sidebar rendering based on path
// Note: We need a client component or a check here, but since Sidebar itself is a client component, 
// we can move the logic into a wrapper or just let Sidebar handle its own visibility.
function SidebarWrapper() {
  return <Sidebar />;
}
