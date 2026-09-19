"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const isInstallPage = pathname === "/instalar";

  // En la página de instalación /instalar aislamos la interfaz para evitar menús comerciales,
  // cotizaciones, pie de página extendido y el botón flotante de WhatsApp.
  if (isInstallPage) {
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-grow pt-20 sm:pt-24">{children}</main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  );
};
