"use client";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@/lib/animations";

interface DashboardLayoutProps {
  children: React.ReactNode;
  session?: any;
}

export function DashboardLayout({ children, session }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar session={session} />
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar */}
        {mounted ? (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="fixed bottom-4 right-4 z-50 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
              <Sidebar />
            </SheetContent>
          </Sheet>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-4 right-4 z-50 lg:hidden"
            disabled
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}

        {/* Main Content */}
        <motion.main
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex-1 overflow-y-auto"
        >
          <div className="container mx-auto p-6">{children}</div>
        </motion.main>
      </div>
    </div>
  );
}

