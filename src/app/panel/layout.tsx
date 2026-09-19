import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Panel de Control | Campo Directo",
  description: "Panel administrativo interno para gestión de clientes, cotizaciones y establecimientos.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
