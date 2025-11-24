"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { springIn, fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

interface HeroSectionProps {
  session: any;
}

export function HeroSection({ session }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-dorado/10 via-azul/5 to-vino/10 py-24 md:py-32">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-dorado/5 via-transparent to-azul/5 animate-pulse" />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="container relative mx-auto px-4"
      >
        <motion.div
          variants={staggerItem}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={springIn}
            className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
          >
            <span className="bg-gradient-to-r from-dorado via-azul to-vino bg-clip-text text-transparent">
              Hub de Proyectos
            </span>
            <br />
            <span className="text-foreground">de Investigación</span>
          </motion.h1>
          
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-10 text-xl text-muted-foreground md:text-2xl"
          >
            Plataforma de colaboración para investigadores de la{" "}
            <span className="font-semibold text-azul">Universidad Panamericana</span>.
            <br />
            Conecta, colabora y avanza en tus proyectos de investigación.
          </motion.p>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            {!session ? (
              <>
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link href="/auth/sign-in">
                    Inicia sesión con tu correo @up.edu.mx
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Link href="/projects">Explorar proyectos</Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/dashboard">Ir al Dashboard</Link>
              </Button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

