import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Research Hub UP</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Inicia sesión con tu correo institucional @up.edu.mx
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
            },
          }}
        />
        <p className="mt-4 text-sm text-center text-muted-foreground">
          Solo usuarios con correo @up.edu.mx pueden acceder
        </p>
      </div>
    </div>
  );
}

