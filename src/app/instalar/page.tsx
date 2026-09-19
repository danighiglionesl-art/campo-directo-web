import type { Metadata } from "next";
import { InstallClientPage } from "@/components/install/InstallClientPage";

export const metadata: Metadata = {
  title: "Campo Directo | Llevá el campo con vos",
  description:
    "Accedé a Campo Directo desde tu celular y agregalo a tu pantalla de inicio.",
  alternates: {
    canonical: "https://campodirecto.ar/instalar",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://campodirecto.ar/instalar",
    siteName: "Campo Directo",
    title: "Campo Directo | Llevá el campo con vos",
    description:
      "Accedé a Campo Directo desde tu celular y agregalo a tu pantalla de inicio.",
    images: [
      {
        url: "https://campodirecto.ar/images/og-campo-directo.png?v=3",
        width: 1200,
        height: 630,
        alt: "Campo Directo | Llevá el campo con vos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campo Directo | Llevá el campo con vos",
    description:
      "Accedé a Campo Directo desde tu celular y agregalo a tu pantalla de inicio.",
    images: ["https://campodirecto.ar/images/og-campo-directo.png?v=3"],
  },
};

export default function InstalarPage() {
  return <InstallClientPage />;
}
