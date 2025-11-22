import { signIn } from "@/lib/auth-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Research Hub UP
          </CardTitle>
          <CardDescription className="text-center">
            Inicia sesión con tu correo institucional @up.edu.mx
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}>
            <Button type="submit" className="w-full" size="lg">
              Continuar con Google (UP)
            </Button>
          </form>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Solo usuarios con correo @up.edu.mx pueden acceder
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
