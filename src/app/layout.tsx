import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { siteConfig } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: `${siteConfig.name} | Soluciones Directas para el Agro Argentino`,
  description: siteConfig.description,
  keywords: [
    "Campo Directo",
    "Agro argentino",
    "Insumos agropecuarios",
    "Comercialización agro",
    "Soluciones para el campo",
    "Productores agropecuarios",
    "Argentina",
  ],
  authors: [{ name: "Campo Directo" }],
  creator: "Campo Directo",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://campodirecto.ar",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Soluciones Directas para el Agro Argentino`,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased bg-slate-50 text-slate-900">
        <ClientProviders>
          <Header />
          <main className="flex-grow pt-20 sm:pt-24">{children}</main>
          <Footer />
          <WhatsAppButton variant="floating" />
        </ClientProviders>
        <Script
          id="google-gsi-client"
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
