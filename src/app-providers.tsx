"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { BlogProvider } from "@/contexts/BlogContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { SiteContentProvider } from "@/contexts/SiteContentContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ThemeProvider>
            <SiteContentProvider>
              <ProjectProvider>
                <BlogProvider>
                  <Toaster />
                  <Sonner />
                  {children}
                </BlogProvider>
              </ProjectProvider>
            </SiteContentProvider>
          </ThemeProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
