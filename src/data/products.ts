import { ProductItem } from "@/types";

export const productCategories = [
  "Todas",
  "Nutrición & Bioestimulación",
  "Protección de Cultivos",
  "Coadyuvantes & Calidad de Aplicación",
  "Tratamiento de Semillas",
] as const;

export const initialProducts: ProductItem[] = [
  {
    id: "bioestimulante-radicular",
    name: "Bioestimulante Radicular Pro",
    category: "Nutrición & Bioestimulación",
    description:
      "Formulación de rápida absorción con aminoácidos y microelementos quelatados para arranque vigoroso y resistencia al estrés hídrico.",
    presentation: "Bidón x 20 L / Caja 4x5 L",
    imageUrl:
      "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "coadyuvante-antideriva",
    name: "Coadyuvante Siliconado Antideriva",
    category: "Coadyuvantes & Calidad de Aplicación",
    description:
      "Optimiza el tamaño de gota, reduce pérdidas por evaporación y mejora la penetración cuticular en aplicaciones foliares exigentes.",
    presentation: "Bidón x 10 L",
    imageUrl:
      "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "fertilizante-foliar-zinc",
    name: "Fertilizante Foliar Zinc & Boro",
    category: "Nutrición & Bioestimulación",
    description:
      "Solución de alta concentración para corrección inmediata de deficiencias en etapas críticas de floración y cuajado.",
    presentation: "Bidón x 20 L / Granel",
    imageUrl:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "inoculante-soja-larga-vida",
    name: "Inoculante de Alta Densidad para Soja",
    category: "Tratamiento de Semillas",
    description:
      "Bacterias fijadoras de nitrógeno con protector biológico incorporado. Asegura nodulación temprana y máxima compatibilidad.",
    presentation: "Vejiga para 50 dosis con protector",
    imageUrl:
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "fungicida-curasemillas",
    name: "Fungicida Terápico de Semilla",
    category: "Protección de Cultivos",
    description:
      "Protección de amplio espectro contra patógenos de suelo y semilla para cereales de invierno y cultivos estivales.",
    presentation: "Bidón x 5 L y 20 L",
    imageUrl:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "corrector-secuestrante",
    name: "Corrector de Aguas & Secuestrante",
    category: "Coadyuvantes & Calidad de Aplicación",
    description:
      "Acondicionador de pH y neutralizador de cationes duros para garantizar la máxima eficacia de los activos en el caldo de pulverización.",
    presentation: "Bidón x 20 L",
    imageUrl:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80",
  },
];
