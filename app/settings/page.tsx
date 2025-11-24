import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings-form";
import { getSession } from "@/lib/auth-config";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return null;
  }

  const authSession = await getSession();

  // Check which OAuth integrations are configured
  const integrationsConfig = {
    github: !!process.env.GITHUB_CLIENT_ID,
    googleDrive: !!process.env.GOOGLE_CLIENT_ID,
    dropbox: !!process.env.DROPBOX_CLIENT_ID,
  };

  return (
    <DashboardLayout session={authSession}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Gestiona tu perfil y preferencias
          </p>
        </div>

        <SettingsForm user={user} integrationsConfig={integrationsConfig} />
      </div>
    </DashboardLayout>
  );
}

