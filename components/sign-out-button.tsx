"use client";

import { signOut } from "@/lib/auth-config";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ redirectTo: "/" });
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
    >
      Cerrar sesión
    </button>
  );
}

