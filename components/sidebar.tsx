"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, staggerItem } from "@/lib/animations";
import {
  LayoutDashboard,
  FolderKanban,
  FolderOpen,
  Settings,
  FileText,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Proyectos", href: "/projects", icon: FolderKanban },
  { name: "Mis Proyectos", href: "/my-projects", icon: FolderOpen },
  { name: "Configuración", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.div 
      initial="visible"
      animate="visible"
      variants={fadeIn}
      className="flex h-full w-64 flex-col border-r bg-background"
    >
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-dorado to-azul bg-clip-text text-transparent">
          Menú
        </h2>
      </div>
      <motion.nav 
        initial="visible"
        animate="visible"
        variants={staggerContainer}
        className="flex-1 space-y-1 p-4"
      >
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <motion.div key={item.name} {...staggerItem}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-smooth",
                  isActive
                    ? "bg-gradient-to-r from-dorado/20 to-azul/20 text-dorado border border-dorado/30 shadow-soft"
                    : "text-muted-foreground hover:bg-dorado/10 hover:text-dorado"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>
    </motion.div>
  );
}

