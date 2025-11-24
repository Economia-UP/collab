"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OAuthConnectionDialog } from "@/components/oauth-connection-dialog";

type OAuthProvider = "github" | "google-drive" | "dropbox";

interface UseOAuthRequiredOptions {
  provider: OAuthProvider;
  context: string;
  onConnected?: () => void;
}

export function useOAuthRequired({ provider, context, onConnected }: UseOAuthRequiredOptions) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkOAuthConnection = useCallback(async (): Promise<boolean> => {
    try {
      setIsChecking(true);
      const response = await fetch(`/api/${provider}/check`);
      const data = await response.json();
      return data.connected === true;
    } catch (error) {
      console.error(`Error checking ${provider} connection:`, error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [provider]);

  const executeWithAuth = useCallback(async <T,>(action: () => Promise<T>): Promise<T> => {
    const isConnected = await checkOAuthConnection();
    
    if (!isConnected) {
      setShowDialog(true);
      throw new Error("OAUTH_REQUIRED");
    }

    try {
      return await action();
    } catch (error: any) {
      // If the error is about OAuth, show dialog
      if (error?.message?.includes("no conectado") || error?.message?.includes("not connected")) {
        setShowDialog(true);
        throw new Error("OAUTH_REQUIRED");
      }
      throw error;
    }
  }, [checkOAuthConnection]);

  const handleConnected = useCallback(() => {
    setShowDialog(false);
    router.refresh();
    if (onConnected) {
      onConnected();
    }
  }, [router, onConnected]);

  const Dialog = (
    <OAuthConnectionDialog
      provider={provider}
      context={context}
      open={showDialog}
      onOpenChange={setShowDialog}
      onConnected={handleConnected}
    />
  );

  return {
    executeWithAuth,
    Dialog,
    isChecking,
  };
}

