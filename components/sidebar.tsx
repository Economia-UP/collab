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
  Plus,
  Search,
  Bell,
  Home,
  Users,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarStats } from "@/components/sidebar-stats";

const navigation = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Búsqueda", href: "/search", icon: Search },
  { name: "Proyectos", href: "/projects", icon: FolderKanban },
  { name: "Mis Proyectos", href: "/my-projects", icon: FolderOpen },
  { name: "Configuración", href: "/settings", icon: Settings },
];

const quickActions = [
  { name: "Crear Proyecto", href: "/projects/new", icon: Plus, variant: "default" as const },
  { name: "Buscar Proyectos", href: "/projects", icon: Search, variant: "outline" as const },
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
        <Link href="/" className="flex items-center gap-2">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-dorado to-azul bg-clip-text text-transparent">
            Collaboration Hub
          </h2>
        </Link>
      </div>
      
      <motion.nav 
        initial="visible"
        animate="visible"
        variants={staggerContainer}
        className="flex-1 space-y-1 p-4 overflow-y-auto"
      >
        {/* Main Navigation */}
        <div className="space-y-1 mb-4">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navegación
            </h3>
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href + "/"));
            return (
              <motion.div key={item.name} {...staggerItem}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                    isActive
                      ? "bg-gradient-to-r from-dorado/20 to-azul/20 text-dorado border border-dorado/30 shadow-soft"
                      : "text-muted-foreground hover:bg-dorado/10 hover:text-dorado"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                  {isActive && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Activo
                    </Badge>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions Section */}
        <div className="border-t pt-4 mt-4">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Acciones Rápidas
            </h3>
          </div>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <motion.div key={action.name} {...staggerItem}>
                <Button
                  asChild
                  variant={action.variant}
                  className="w-full justify-start gap-3"
                >
                  <Link href={action.href}>
                    <action.icon className="h-4 w-4" />
                    {action.name}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-t pt-4 mt-4">
          <SidebarStats />
        </div>

        {/* Help Section */}
        <div className="border-t pt-4 mt-4">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recursos
            </h3>
          </div>
          <div className="space-y-1">
            <motion.div {...staggerItem}>
              <Link
                href="/projects"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-dorado/10 hover:text-dorado transition-smooth"
              >
                <FileText className="h-4 w-4" />
                <span>Explorar Proyectos</span>
              </Link>
            </motion.div>
            <motion.div {...staggerItem}>
              <Link
                href="/my-projects"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-dorado/10 hover:text-dorado transition-smooth"
              >
                <Users className="h-4 w-4" />
                <span>Mis Colaboraciones</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>
    </motion.div>
  );
}

