"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/sign-out-button";
import { motion } from "framer-motion";
import { fadeInDown } from "@/lib/animations";

interface NavbarProps {
  session?: {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  } | null;
}

export function Navbar({ session }: NavbarProps) {

  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      variants={fadeInDown}
      className="sticky top-0 z-50 w-full border-b glass shadow-soft"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <motion.div 
          className="flex items-center gap-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-dorado to-azul bg-clip-text text-transparent">
              Research Hub UP
            </span>
          </Link>
          {session && (
            <nav className="hidden md:flex items-center gap-4">
              <Link 
                href="/projects" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Proyectos
              </Link>
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          )}
        </motion.div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || ""} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                      {session.user?.role && (
                        <Badge variant="secondary" className="mt-1 w-fit">
                          {session.user.role}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/projects">Proyectos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-projects">Mis Proyectos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Configuración</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <SignOutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild className="gradient-dorado hover:opacity-90 transition-smooth">
              <Link href="/auth/sign-in">Iniciar sesión</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
