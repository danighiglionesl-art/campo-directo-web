import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { siteConfig } from "@/data/siteConfig";

export const viewport: Viewport = {
  themeColor: "#339966",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://campodirecto.ar"),
  title: `${siteConfig.name} | Soluciones Directas para el Agro Argentino`,
  description: siteConfig.description,
  applicationName: "Campo Directo",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Campo Directo",
  },
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
  icons: {
    icon: [
      { url: "/favicon.ico?v=3" },
      { url: "/favicon-32x32.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=3", sizes: "16x16", type: "image/png" },
      { url: "/android-chrome-192x192.png?v=3", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: [
      { url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json?v=4",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://campodirecto.ar",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Soluciones Directas para el Agro Argentino`,
    description: siteConfig.description,
    images: [
      {
        url: "https://campodirecto.ar/images/og-campo-directo.png?v=3",
        width: 1200,
        height: 630,
        alt: "Campo Directo - Soluciones Directas para el Agro Argentino",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Soluciones Directas para el Agro Argentino`,
    description: siteConfig.description,
    images: ["https://campodirecto.ar/images/og-campo-directo.png?v=3"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
        <link rel="manifest" href="/manifest.json?v=4" />
        <meta name="theme-color" content="#339966" />
        <meta name="msapplication-TileColor" content="#339966" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Campo Directo" />
        <meta property="og:image" content="https://campodirecto.ar/images/og-campo-directo.png?v=3" />
        <meta name="twitter:image" content="https://campodirecto.ar/images/og-campo-directo.png?v=3" />
      </head>
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
