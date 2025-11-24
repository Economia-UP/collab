"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink } from "lucide-react";

type OAuthProvider = "github" | "google-drive" | "dropbox";

interface OAuthConnectionDialogProps {
  provider: OAuthProvider;
  context: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
}

const providerNames: Record<OAuthProvider, string> = {
  github: "GitHub",
  "google-drive": "Google Drive",
  dropbox: "Dropbox",
};

export function OAuthConnectionDialog({
  provider,
  context,
  open,
  onOpenChange,
  onConnected,
}: OAuthConnectionDialogProps) {
  const handleConnect = () => {
    window.location.href = `/api/${provider}/oauth`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Conexión requerida
          </DialogTitle>
          <DialogDescription className="pt-2">
            Necesitas conectar tu cuenta de {providerNames[provider]} {context}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Al hacer clic en "Conectar", serás redirigido a {providerNames[provider]} para autorizar
            el acceso. Una vez conectado, podrás continuar con la acción.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConnect}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Conectar {providerNames[provider]}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

