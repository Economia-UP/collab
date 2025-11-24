import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Collaboration Hub - Plataforma de Colaboración",
  description: "Plataforma de colaboración para proyectos de investigación y trabajo colaborativo de la Universidad Panamericana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // Always wrap with ClerkProvider - it can work in keyless mode for development
  // If no key is provided, Clerk will show a message but won't crash
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="es" className={spaceGrotesk.variable}>
        <body className="font-sans antialiased">
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}

