import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Video Plánovač",
  description: "Plánování a správa videí",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={inter.className}>
        <TooltipProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-56 min-h-screen bg-background">
              {children}
            </main>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
