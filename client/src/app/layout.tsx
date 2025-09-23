import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { AppProvider } from "@/context/AppContext";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "The Reading Retreat",
  description:
    "A minimal, calming blog experience for discovering and writing thoughtful stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-muted/30 text-foreground antialiased">
        <AppProvider>
          <Navbar />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
