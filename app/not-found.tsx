import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Página no encontrada
          </CardTitle>
          <CardDescription className="text-center">
            La página que buscas no existe o ha sido movida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/">Volver al inicio</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Ir al Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

