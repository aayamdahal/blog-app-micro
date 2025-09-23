import SideBar from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React, { ReactNode } from "react";

interface BlogsProps {
  children: ReactNode;
}

const HomeLayout: React.FC<BlogsProps> = ({ children }) => {
  return (
    <div className="bg-muted/30">
      <SidebarProvider>
        <SideBar />
        <main className="relative w-full bg-gradient-to-b from-white via-white to-transparent">
          <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,var(--primary)/12,transparent_70%)]" />
          <div className="relative z-10 w-full min-h-[calc(100vh-4rem)] px-2 py-6 md:px-6 md:py-10">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default HomeLayout;
