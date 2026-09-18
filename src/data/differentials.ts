export interface DifferentialPillar {
  id: string;
  pilarNumber: string;
  title: string;
  description: string;
  iconName: string;
}

export const differentialsData: DifferentialPillar[] = [
  {
    id: "relacion-directa",
    pilarNumber: "PILAR 01",
    title: "Relación Directa",
    description:
      "Conectamos industria y productor, sin intermediaciones, con comunicación clara y acompañamiento profesional.",
    iconName: "Users",
  },
  {
    id: "menores-costos",
    pilarNumber: "PILAR 02",
    title: "Menores Costos",
    description:
      "Al reducir intermediarios, se eliminan recargos, márgenes adicionales y costos logísticos y de almacenamiento.",
    iconName: "TrendingUp",
  },
  {
    id: "mayor-rentabilidad",
    pilarNumber: "PILAR 03",
    title: "Mayor Rentabilidad",
    description:
      "Facturación directa que evita la duplicidad de impuestos y el efecto cascada de tasas, permitiendo un mejor precio y más margen para el productor.",
    iconName: "Coins",
  },
  {
    id: "confianza",
    pilarNumber: "PILAR 04",
    title: "Confianza",
    description:
      "Trabajamos con fabricantes y laboratorios reconocidos, garantizando productos originales, condiciones claras y relaciones a largo plazo.",
    iconName: "Handshake",
  },
  {
    id: "asesoramiento-tecnico",
    pilarNumber: "PILAR 05",
    title: "Asesoramiento Técnico",
    description:
      "Acompañamiento de especialistas para ayudarte a elegir las mejores soluciones según tu lote, tu producción y tus objetivos.",
    iconName: "Sprout",
  },
  {
    id: "logistica-eficiente",
    pilarNumber: "PILAR 06",
    title: "Logística Eficiente",
    description:
      "Coordinamos entregas directas en campo, optimizando tiempos y reduciendo costos de transporte y almacenamiento.",
    iconName: "MapPin",
  },
  {
    id: "soluciones-a-tu-medida",
    pilarNumber: "PILAR 07",
    title: "Soluciones a tu Medida",
    description:
      "Acceso a un amplio portafolio de productos y alternativas comerciales adaptadas a cada campaña y a las necesidades de cada productor.",
    iconName: "Cog",
  },
  {
    id: "innovacion-oportunidades",
    pilarNumber: "PILAR 08",
    title: "Innovación y Oportunidades",
    description:
      "Incorporamos tecnología y nuevos modelos de negocio para generar más oportunidades comerciales y un campo más competitivo.",
    iconName: "Lightbulb",
  },
];
