import { NavItem } from "@/types";

export const siteConfig = {
  name: "Campo Directo",
  tagline: "Conectamos el campo con soluciones directas y eficientes", // Placeholder editable
  description:
    "Comercialización, asesoramiento y soluciones directas para el agro argentino. Cercanía, confianza y eficiencia comercial.",
  contact: {
    phone: process.env.NEXT_PUBLIC_PHONE || "+54 9 358 509-5475",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5493585095475",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@campodirecto.ar",
    instagramUrl: "https://www.instagram.com/campodirecto.ar/",
    facebookUrl: "https://www.facebook.com/campodirecto.ar",
    location: "Argentina",
  },
  navigation: [
    { label: "Inicio", href: "#inicio" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Qué hacemos", href: "#que-hacemos" },
    { label: "Cobertura", href: "#cobertura" },
    { label: "Contacto", href: "#contacto" },
  ] as NavItem[],
  clientAccess: {
    label: "Tu Cotización",
    href: "#tu-cotizacion",
  },
  clientPortal: {
    label: "Acceso a Clientes",
    href: "#acceso-clientes",
  },
  ctaNav: {
    label: "Contactanos",
    href: "#contacto",
  },
  hero: {
    badge: "Soluciones Agropecuarias en Argentina",
    titlePrimary: "Conectamos el campo con soluciones",
    titleHighlight: "directas y eficientes",
    subtitle:
      "Comercialización, asesoramiento técnico y oportunidades comerciales pensadas para potenciar al productor y a las empresas del sector.",
    sloganPlaceholder: "— Tu aliado estratégico directo en el campo —", // Slogan provisional fácilmente reemplazable
    ctaPrimary: "Contactar al equipo",
    ctaWhatsApp: "Consultar por WhatsApp",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Actividad y producción en el agro argentino",
  },
  about: {
    badge: "Quiénes Somos",
    title: "Cercanía, confianza y eficiencia comercial en el agro",
    paragraphs: [
      "En Campo Directo trabajamos con el compromiso de acercar soluciones comerciales y asesoramiento de primer nivel para el productor y las empresas agropecuarias de Argentina.",
      "Nuestra dinámica de trabajo combina conocimiento profundo del mercado rural, atención personalizada y una vocación constante por generar valor real en cada campaña.",
    ],
    // Texto definitivo a proporcionar posteriormente por el usuario
    isPlaceholder: true,
    pillars: [
      {
        title: "Atención Directa",
        description: "Comunicación ágil y directa para resolver consultas sin dilaciones.",
      },
      {
        title: "Cercanía & Confianza",
        description: "Acompañamiento cercano y conocimiento de las demandas reales del sector.",
      },
      {
        title: "Eficiencia Comercial",
        description: "Propuestas competitivas y soluciones pensadas para optimizar resultados.",
      },
    ],
  },
};

/**
 * Genera el enlace directo a WhatsApp con mensaje parametrizado para un producto o consulta general
 */
export function getWhatsAppLink(productName?: string): string {
  const number = siteConfig.contact.whatsappNumber.replace(/[^0-9]/g, "");
  const baseMessage = productName
    ? `Hola Campo Directo, quisiera recibir información sobre ${productName}.`
    : "Hola Campo Directo, quisiera hacerles una consulta.";

  const encodedMessage = encodeURIComponent(baseMessage);

  if (!number) {
    // Si aún no hay número cargado, dirige a la API general o ancla de contacto
    return `https://wa.me/?text=${encodedMessage}`;
  }

  return `https://wa.me/${number}?text=${encodedMessage}`;
}
