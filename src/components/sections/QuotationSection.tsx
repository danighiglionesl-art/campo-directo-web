"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Check,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  ShoppingCart,
  Calculator,
  Building2,
  Wheat,
  Sprout,
  FlaskConical,
  Mail,
  ShieldCheck,
  AlertCircle,
  Loader2,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  LocateFixed,
  ExternalLink,
  Compass,
  Landmark,
  CreditCard,
  FileCheck,
  Banknote,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import {
  OperationType,
  CategoryType,
  InsumoItem,
  SemillaItem,
  QuoteItem,
  DeliveryLocation,
} from "@/types/quotation";
import { useClientAuth } from "@/context/ClientAuthContext";
import { triggerGoogleAuth } from "@/utils/googleAuth";
import {
  allInsumos,
  allSemillas,
  granosConfig,
  insumoEmpresas,
  insumoCategorias,
  insumoPrincipios,
  insumoCultivos,
  semillaEmpresas,
  semillaCultivos,
  semillaTecnologias,
  ARGENTINE_PROVINCES,
  LOCALITIES_BY_PROVINCE,
  COUNTRY_PHONE_CODES,
  HORARIOS_PREFERIDOS,
  formatCuit,
  lookupCuitAfip,
  validateCuitModulo11,
} from "@/data/quotationHelper";

const PAGE_SIZE = 6;

const PAYMENT_METHODS = [
  {
    id: "Transferencia Bancaria",
    number: "1",
    label: "Transferencia Bancaria",
    desc: "CBU / CVU / ALIAS BANCARIO DIRECTO",
    icon: Landmark,
  },
  {
    id: "echeq",
    number: "2",
    label: "echeq",
    desc: "CHEQUE ELECTRÓNICO DIFERIDO",
    icon: FileCheck,
  },
  {
    id: "Tarjeta de Crédito",
    number: "3",
    label: "Tarjeta de Crédito",
    desc: "TARJETAS AGRO / CORPORATIVAS",
    icon: CreditCard,
  },
  {
    id: "Canje de granos",
    number: "4",
    label: "Canje de granos",
    desc: "DISPONIBLE O A COSECHA CON CEREALES",
    icon: Wheat,
  },
  {
    id: "Otra (especificar)",
    number: "5",
    label: "Otra (especificar)",
    desc: "CONDICIÓN, PLAZO O FORMA A CONVENIR",
    icon: Banknote,
  },
];

export const QuotationSection: React.FC = () => {
  const {
    user,
    login,
    registerClient,
    logout,
    establishments,
    addSentQuotation,
    loginWithGoogle,
  } = useClientAuth();

  // 1. Wizard: Operación (COMPRAR / VENDER) & Categoría (INSUMOS / SEMILLAS / GRANOS)
  const [operation, setOperation] = useState<OperationType>("COMPRAR");
  const [activeCategory, setActiveCategory] = useState<CategoryType>("INSUMOS");

  // 2. Filtros de Insumos Agropecuarios
  const [insumoEmpresa, setInsumoEmpresa] = useState<string>("");
  const [insumoProducto, setInsumoProducto] = useState<string>(""); // Filtro por Nombre Comercial
  const [insumoCategoria, setInsumoCategoria] = useState<string>("");
  const [insumoPrincipio, setInsumoPrincipio] = useState<string>("");
  const [insumoCultivo, setInsumoCultivo] = useState<string>("");
  const [insumoSearch, setInsumoSearch] = useState<string>("");
  const [insumoCurrentPage, setInsumoCurrentPage] = useState<number>(1);

  // 3. Filtros de Semillas
  const [semillaEmpresa, setSemillaEmpresa] = useState<string>("");
  const [semillaVariedad, setSemillaVariedad] = useState<string>(""); // Filtro por Variedad
  const [semillaCultivo, setSemillaCultivo] = useState<string>("");
  const [semillaTecnologia, setSemillaTecnologia] = useState<string>("");
  const [semillaSearch, setSemillaSearch] = useState<string>("");
  const [semillaCurrentPage, setSemillaCurrentPage] = useState<number>(1);

  // 4. Formulario Constructor de Granos (TODO EN MAYÚSCULAS)
  const [granoSelected, setGranoSelected] = useState<string>(granosConfig.granos[0] || "SOJA");
  const [puertoSelected, setPuertoSelected] = useState<string>(granosConfig.puertos[0] || "ROSARIO");
  const [condicionSelected, setCondicionSelected] = useState<string>(granosConfig.condiciones[0] || "PESOS");
  const [mercadoSelected, setMercadoSelected] = useState<string>(granosConfig.mercados[0] || "EXPORTACIÓN");
  const [precioBuscadoSelected, setPrecioBuscadoSelected] = useState<string>(granosConfig.precioBuscado[0] || "PESOS");
  const [customPrecio, setCustomPrecio] = useState<string>("");
  const [fleteSelected, setFleteSelected] = useState<string>(granosConfig.fletes[0] || "SERVICIO DE FLETE DE TERCEROS");
  const [volumenTn, setVolumenTn] = useState<string>("100");

  // 5. Lista de Cotización en Tiempo Real (Carrito con persistencia PWA)
  const [cartItems, setCartItems] = useState<QuoteItem[]>([]);
  const [quickNotice, setQuickNotice] = useState<string | null>(null);
  const [isCartLoaded, setIsCartLoaded] = useState<boolean>(false);

  // Cargar carrito persistido en localStorage al montar en cliente
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("cd_quotation_cart");
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error al cargar carrito guardado:", e);
    } finally {
      setIsCartLoaded(true);
    }
  }, []);

  // Sincronizar cambios del carrito con localStorage
  useEffect(() => {
    if (!isCartLoaded || typeof window === "undefined") return;
    try {
      if (cartItems.length > 0) {
        localStorage.setItem("cd_quotation_cart", JSON.stringify(cartItems));
      } else {
        localStorage.removeItem("cd_quotation_cart");
      }
    } catch (e) {
      console.error("Error al persistir carrito:", e);
    }
  }, [cartItems, isCartLoaded]);

  // 6. Modal de Identificación / Checkout
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [clientTab, setClientTab] = useState<"NUEVO" | "REGISTRADO">("NUEVO");

  // Formulario CLIENTE NUEVO (TODO EN MAYÚSCULAS)
  const [formNuevo, setFormNuevo] = useState({
    apellidos: "",
    nombres: "",
    fechaNacimiento: "",
    dni: "",
    whatsappCountryCode: "+54",
    whatsappNumber: "",
    email: "",
    provincia: "BUENOS AIRES",
    localidad: "",
    codigoPostal: "",
    cuit: "",
    razonSocial: "",
    horariosPreferidos: ["MAÑANA (08:00 A 12:00 HS)"],
    observaciones: "",
    usuario: "",
    password: "",
  });

  // Estado para localidad manual o desplegable
  const [isCustomLocalidad, setIsCustomLocalidad] = useState<boolean>(false);

  // Indicador de razón social auto-generada desde AFIP/BCRA o Apellidos y Nombres
  const [isRazonSocialAuto, setIsRazonSocialAuto] = useState<boolean>(false);

  // Formulario CLIENTE REGISTRADO
  const [formRegistrado, setFormRegistrado] = useState({
    identifier: "",
    password: "",
  });

  // 6.c Forma de Pago de la Operación
  const [formaPago, setFormaPago] = useState<string>("Transferencia Bancaria");
  const [formaPagoOtra, setFormaPagoOtra] = useState<string>("");

  // Sincronizar identificador y pestaña si el usuario ya está autenticado en el portal
  useEffect(() => {
    if (user) {
      setClientTab("REGISTRADO");
      setFormRegistrado((prev) => ({
        ...prev,
        identifier: prev.identifier || user.email || user.cuit,
      }));
    }
  }, [user, isModalOpen]);

  // Selección de establecimiento registrado o carga de tranquera personalizada
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string | null>(null);
  const [useCustomPuntoEntrega, setUseCustomPuntoEntrega] = useState<boolean>(false);

  useEffect(() => {
    if (establishments && establishments.length > 0 && !selectedEstablishmentId) {
      setSelectedEstablishmentId(establishments[0].id);
    }
  }, [establishments, selectedEstablishmentId]);

  // 6.b Geoposición Satelital de Entrega (1 o más opciones)
  const [puntosEntrega, setPuntosEntrega] = useState<DeliveryLocation[]>([
    {
      id: "punto-1",
      nombreLote: "CAMPO PRINCIPAL - TRANQUERA 1",
      referenciaAcceso: "",
      coordenadasGps: "",
      linkMaps: "",
      tipoDescarga: "TRANQUERA DE CAMPO",
      esPrincipal: true,
    },
  ]);
  const [gpsLoadingId, setGpsLoadingId] = useState<string | null>(null);
  const [gpsSuccessNotice, setGpsSuccessNotice] = useState<{ id: string; msg: string } | null>(null);

  const [isAfipLoading, setIsAfipLoading] = useState<boolean>(false);
  const [afipSuccessMessage, setAfipSuccessMessage] = useState<string | null>(null);
  const [afipErrorMessage, setAfipErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // 7. Modal de Éxito al Enviar
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  // Control de tecla ESC y bloqueo del scroll de la página de fondo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) setIsModalOpen(false);
        if (isSuccessModalOpen) setIsSuccessModalOpen(false);
      }
    };

    if (isModalOpen || isSuccessModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, isSuccessModalOpen]);

  // Reset de página al modificar filtros de Insumos
  useEffect(() => {
    setInsumoCurrentPage(1);
  }, [insumoEmpresa, insumoProducto, insumoCategoria, insumoPrincipio, insumoCultivo, insumoSearch]);

  // Reset de página al modificar filtros de Semillas
  useEffect(() => {
    setSemillaCurrentPage(1);
  }, [semillaEmpresa, semillaVariedad, semillaCultivo, semillaTecnologia, semillaSearch]);

  // --- FILTRADO DE INSUMOS (ESTILO EXCEL - TODO EN MAYÚSCULAS) ---
  const filteredInsumos = useMemo(() => {
    return allInsumos.filter((item) => {
      if (insumoEmpresa && item.empresa !== insumoEmpresa) return false;
      if (insumoProducto && item.producto !== insumoProducto) return false;
      if (insumoCategoria && item.categoria !== insumoCategoria) return false;
      if (insumoPrincipio && item.principioActivo !== insumoPrincipio) return false;
      if (insumoCultivo) {
        if (
          insumoCultivo !== "TODOS LOS CULTIVOS" &&
          !item.cultivosPrincipales.toUpperCase().includes(insumoCultivo.toUpperCase())
        ) {
          return false;
        }
      }
      if (insumoSearch.trim()) {
        const query = insumoSearch.toUpperCase();
        const matchesName = item.producto.toUpperCase().includes(query);
        const matchesEmpresa = item.empresa.toUpperCase().includes(query);
        const matchesPrincipio = item.principioActivo.toUpperCase().includes(query);
        const matchesCategoria = item.categoria.toUpperCase().includes(query);
        const matchesCultivo = item.cultivosPrincipales.toUpperCase().includes(query);
        if (!matchesName && !matchesEmpresa && !matchesPrincipio && !matchesCategoria && !matchesCultivo) {
          return false;
        }
      }
      return true;
    });
  }, [insumoEmpresa, insumoProducto, insumoCategoria, insumoPrincipio, insumoCultivo, insumoSearch]);

  // Paginación a máximo 6 productos por página
  const paginatedInsumos = useMemo(() => {
    const start = (insumoCurrentPage - 1) * PAGE_SIZE;
    return filteredInsumos.slice(start, start + PAGE_SIZE);
  }, [filteredInsumos, insumoCurrentPage]);

  const totalInsumoPages = Math.max(1, Math.ceil(filteredInsumos.length / PAGE_SIZE));

  // Lista dinámica de Nombres Comerciales (Productos) según empresa/filtros seleccionados (MAYÚSCULAS)
  const availableInsumoProductos = useMemo(() => {
    let list = allInsumos;
    if (insumoEmpresa) list = list.filter((i) => i.empresa === insumoEmpresa);
    if (insumoCategoria) list = list.filter((i) => i.categoria === insumoCategoria);
    if (insumoPrincipio) list = list.filter((i) => i.principioActivo === insumoPrincipio);
    return Array.from(new Set(list.map((i) => i.producto).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" })
    );
  }, [insumoEmpresa, insumoCategoria, insumoPrincipio]);

  // Lista dinámica de Categorías según empresa seleccionada (MAYÚSCULAS)
  const availableInsumoCategorias = useMemo(() => {
    const list = insumoEmpresa
      ? allInsumos.filter((i) => i.empresa === insumoEmpresa)
      : allInsumos;
    return Array.from(new Set(list.map((i) => i.categoria).filter(Boolean))).sort();
  }, [insumoEmpresa]);

  // Lista dinámica de Principios Activos según empresa/categoría seleccionada (MAYÚSCULAS)
  const availableInsumoPrincipios = useMemo(() => {
    let list = allInsumos;
    if (insumoEmpresa) list = list.filter((i) => i.empresa === insumoEmpresa);
    if (insumoCategoria) list = list.filter((i) => i.categoria === insumoCategoria);
    return Array.from(new Set(list.map((i) => i.principioActivo).filter(Boolean))).sort();
  }, [insumoEmpresa, insumoCategoria]);

  // --- FILTRADO DE SEMILLAS (ESTILO EXCEL - TODO EN MAYÚSCULAS) ---
  const filteredSemillas = useMemo(() => {
    return allSemillas.filter((item) => {
      if (semillaEmpresa && item.empresa !== semillaEmpresa) return false;
      if (semillaVariedad && item.variedad !== semillaVariedad) return false;
      if (semillaCultivo && item.semilla !== semillaCultivo) return false;
      if (semillaTecnologia && item.tecnologia !== semillaTecnologia) return false;
      if (semillaSearch.trim()) {
        const q = semillaSearch.toUpperCase();
        const matchesVar = item.variedad.toUpperCase().includes(q);
        const matchesEmp = item.empresa.toUpperCase().includes(q);
        const matchesSem = item.semilla.toUpperCase().includes(q);
        const matchesTec = item.tecnologia.toUpperCase().includes(q);
        const matchesCar = item.caracteristicas.toUpperCase().includes(q);
        if (!matchesVar && !matchesEmp && !matchesSem && !matchesTec && !matchesCar) {
          return false;
        }
      }
      return true;
    });
  }, [semillaEmpresa, semillaVariedad, semillaCultivo, semillaTecnologia, semillaSearch]);

  const paginatedSemillas = useMemo(() => {
    const start = (semillaCurrentPage - 1) * PAGE_SIZE;
    return filteredSemillas.slice(start, start + PAGE_SIZE);
  }, [filteredSemillas, semillaCurrentPage]);

  const totalSemillaPages = Math.max(1, Math.ceil(filteredSemillas.length / PAGE_SIZE));

  // Lista dinámica de Variedades según criadero/empresa seleccionada (MAYÚSCULAS)
  const availableSemillaVariedades = useMemo(() => {
    let list = allSemillas;
    if (semillaEmpresa) list = list.filter((s) => s.empresa === semillaEmpresa);
    if (semillaCultivo) list = list.filter((s) => s.semilla === semillaCultivo);
    if (semillaTecnologia) list = list.filter((s) => s.tecnologia === semillaTecnologia);
    return Array.from(new Set(list.map((s) => s.variedad).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" })
    );
  }, [semillaEmpresa, semillaCultivo, semillaTecnologia]);

  // Localidades según provincia seleccionada (sugerencias autocompletables)
  const currentLocalities = useMemo(() => {
    return LOCALITIES_BY_PROVINCE[formNuevo.provincia] || [];
  }, [formNuevo.provincia]);

  // --- ACCIONES DEL CARRITO ---
  const showNotification = (msg: string) => {
    setQuickNotice(msg.toUpperCase());
    setTimeout(() => setQuickNotice(null), 2800);
  };

  const addInsumoToCart = (item: InsumoItem) => {
    const existingIndex = cartItems.findIndex((c) => c.id === item.id);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      const currentQty = typeof updated[existingIndex].quantity === "number" ? (updated[existingIndex].quantity as number) : 100;
      updated[existingIndex].quantity = currentQty + 100;
      setCartItems(updated);
      showNotification(`SE ACTUALIZARON +100 LTS/KGS DE ${item.producto}`);
    } else {
      const newItem: QuoteItem = {
        id: item.id,
        type: "INSUMOS",
        title: item.producto.toUpperCase(),
        subtitle: item.empresa.toUpperCase(),
        badge: item.categoria.toUpperCase(),
        details: `PRINCIPIO ACTIVO: ${item.principioActivo.toUpperCase()} | CULTIVOS: ${item.cultivosPrincipales.toUpperCase()}`,
        quantity: 100,
        unit: "LTS/KGS",
      };
      setCartItems((prev) => [...prev, newItem]);
      showNotification(`SE AGREGÓ ${item.producto} A TU COTIZACIÓN`);
    }
  };

  const addSemillaToCart = (item: SemillaItem) => {
    const existingIndex = cartItems.findIndex((c) => c.id === item.id);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      const currentQty = typeof updated[existingIndex].quantity === "number" ? (updated[existingIndex].quantity as number) : 50;
      updated[existingIndex].quantity = currentQty + 50;
      setCartItems(updated);
      showNotification(`SE ACTUALIZARON +50 BOLSAS DE ${item.variedad}`);
    } else {
      const newItem: QuoteItem = {
        id: item.id,
        type: "SEMILLAS",
        title: `${item.semilla.toUpperCase()} - ${item.variedad.toUpperCase()}`,
        subtitle: item.empresa.toUpperCase(),
        badge: (item.tecnologia || "SEMILLA FISCALIZADA").toUpperCase(),
        details: (item.caracteristicas || "SEMILLA DE ALTA CALIDAD Y PUREZA GARANTIZADA").toUpperCase(),
        quantity: 50,
        unit: "BOLSAS",
      };
      setCartItems((prev) => [...prev, newItem]);
      showNotification(`SE AGREGÓ ${item.variedad} A TU COTIZACIÓN`);
    }
  };

  const addGranoToCart = () => {
    const granoId = `grano-${Date.now()}`;
    const priceText = customPrecio ? `${precioBuscadoSelected} $${customPrecio}` : precioBuscadoSelected;
    const newItem: QuoteItem = {
      id: granoId,
      type: "GRANOS",
      title: `${granoSelected.toUpperCase()} (${mercadoSelected.toUpperCase()})`,
      subtitle: `PUERTO/DESTINO: ${puertoSelected.toUpperCase()}`,
      badge: `${condicionSelected.toUpperCase()} - ${fleteSelected.toUpperCase()}`,
      details: `PRECIO BUSCADO: ${priceText.toUpperCase()} | FLETE: ${fleteSelected.toUpperCase()}`,
      quantity: volumenTn || "100",
      unit: "TN",
    };
    setCartItems((prev) => [...prev, newItem]);
    showNotification(`SE AGREGÓ LA POSICIÓN DE ${granoSelected} (${volumenTn} TN) A TU COTIZACIÓN`);
  };

  const updateItemQty = (id: string, newQty: number | string) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const updateItemUnit = (id: string, unit: string) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unit: unit.toUpperCase() } : item))
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // --- PROCESO AUTOMÁTICO: CONSULTA AFIP/BCRA Y RAZÓN SOCIAL ---
  const handleApellidosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setFormNuevo((prev) => {
      const next = { ...prev, apellidos: val };
      if (isRazonSocialAuto || !prev.razonSocial.trim()) {
        const auto = `${val} ${prev.nombres}`.trim();
        next.razonSocial = auto;
        if (auto) setIsRazonSocialAuto(true);
      }
      return next;
    });
  };

  const handleNombresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setFormNuevo((prev) => {
      const next = { ...prev, nombres: val };
      if (isRazonSocialAuto || !prev.razonSocial.trim()) {
        const auto = `${prev.apellidos} ${val}`.trim();
        next.razonSocial = auto;
        if (auto) setIsRazonSocialAuto(true);
      }
      return next;
    });
  };

  const handleCuitChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 11);
    const formatted = formatCuit(rawVal);
    setFormNuevo((prev) => ({ ...prev, cuit: formatted }));

    setAfipSuccessMessage(null);
    setAfipErrorMessage(null);

    if (rawVal.length === 11) {
      if (!validateCuitModulo11(rawVal)) {
        setAfipErrorMessage("CUIT INVÁLIDO: El número ingresado no coincide con el dígito verificador oficial de AFIP.");
        return;
      }

      setIsAfipLoading(true);
      try {
        const result = await lookupCuitAfip(rawVal);
        if (!result.valid) {
          setAfipErrorMessage(result.error || "CUIT INVÁLIDO: No superó la validación oficial.");
        } else {
          // Si el CUIT contiene DNI y no se había ingresado, auto-completar DNI
          if (result.dni) {
            setFormNuevo((prev) => (prev.dni ? prev : { ...prev, dni: result.dni! }));
          }

          if (result.razonSocial) {
            // Razón social obtenida de BCRA / Directorio Corporativo
            setFormNuevo((prev) => ({ ...prev, razonSocial: result.razonSocial!.toUpperCase() }));
            setIsRazonSocialAuto(true);
            setAfipSuccessMessage(`CUIT VALIDADO (${result.tipoPersona || "CONTRIBUYENTE"}): ${result.razonSocial!.toUpperCase()}`);
          } else {
            // Para persona física o contribuyente sin registro societario previo:
            // La denominación legal ante AFIP es su Apellido y Nombre
            const nombreCompleto = `${formNuevo.apellidos.trim()} ${formNuevo.nombres.trim()}`.trim();
            if (nombreCompleto) {
              setFormNuevo((prev) => ({ ...prev, razonSocial: nombreCompleto.toUpperCase() }));
              setIsRazonSocialAuto(true);
              setAfipSuccessMessage(`CUIT VALIDADO ANTE AFIP (${result.tipoPersona || "CONTRIBUYENTE"}): ${nombreCompleto.toUpperCase()}`);
            } else {
              setFormNuevo((prev) => ({ ...prev, razonSocial: "" }));
              setIsRazonSocialAuto(true);
              setAfipSuccessMessage(
                `CUIT VÁLIDO ANTE AFIP (${result.tipoPersona || "CONTRIBUYENTE"}). Se completará automáticamente con tu Apellido y Nombre.`
              );
            }
          }
        }
      } catch (err) {
        console.error("Error al consultar CUIT:", err);
      } finally {
        setIsAfipLoading(false);
      }
    }
  };

  const handleFechaNacimientoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (v.length >= 5) {
      v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length >= 3) {
      v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    setFormNuevo((prev) => ({ ...prev, fechaNacimiento: v }));
  };

  const toggleHorario = (horario: string) => {
    setFormNuevo((prev) => {
      const exists = prev.horariosPreferidos.includes(horario);
      if (exists) {
        return {
          ...prev,
          horariosPreferidos: prev.horariosPreferidos.filter((h) => h !== horario),
        };
      } else {
        return {
          ...prev,
          horariosPreferidos: [...prev.horariosPreferidos, horario],
        };
      }
    });
  };

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleAuth = async (flow: "LOGIN" | "REGISTER" = "REGISTER") => {
    try {
      setIsGoogleLoading(true);
      const googleUser = await triggerGoogleAuth();

      // Iniciar sesión global en el contexto de cliente
      loginWithGoogle(googleUser);

      const nombres = (
        googleUser.given_name ||
        googleUser.name?.split(" ")[0] ||
        ""
      ).toUpperCase();
      const apellidos = (
        googleUser.family_name ||
        googleUser.name?.split(" ").slice(1).join(" ") ||
        ""
      ).toUpperCase();
      const email = googleUser.email.toUpperCase();

      if (flow === "REGISTER") {
        setFormNuevo((prev) => ({
          ...prev,
          nombres: nombres || prev.nombres,
          apellidos: apellidos || prev.apellidos,
          razonSocial:
            prev.razonSocial ||
            `${apellidos} ${nombres}`.trim() ||
            googleUser.name.toUpperCase(),
          email: email,
          usuario: email,
          password: "••••••••••••",
        }));
        showNotification(
          `¡VINCULADO CON GOOGLE! BIENVENIDO ${googleUser.name.toUpperCase()}`
        );
      } else {
        // Flujo LOGIN para cliente registrado
        setFormRegistrado({
          identifier: email,
          password: "••••••••••••",
        });
        showNotification(
          `¡SESIÓN INICIADA CON GOOGLE! BIENVENIDO ${googleUser.name.toUpperCase()}`
        );
      }
    } catch (err: any) {
      console.warn("Google Auth cancelado o con error:", err);
      const msg = err?.message || "";
      if (
        !msg.toLowerCase().includes("cerrada") &&
        !msg.toLowerCase().includes("popup_closed") &&
        !msg.toLowerCase().includes("cancelada")
      ) {
        showNotification(
          `ERROR AL CONECTAR CON GOOGLE: ${msg.toUpperCase() || "INTENTE NUEVAMENTE"}`
        );
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const addPuntoEntrega = () => {
    const newIndex = puntosEntrega.length + 1;
    const newPunto: DeliveryLocation = {
      id: `punto-${Date.now()}`,
      nombreLote: `CAMPO / LOTE #${newIndex}`,
      referenciaAcceso: "",
      coordenadasGps: "",
      linkMaps: "",
      tipoDescarga: "TRANQUERA DE CAMPO",
      esPrincipal: false,
    };
    setPuntosEntrega((prev) => [...prev, newPunto]);
  };

  const removePuntoEntrega = (id: string) => {
    if (puntosEntrega.length <= 1) return;
    setPuntosEntrega((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePuntoEntrega = (id: string, field: keyof DeliveryLocation, value: any) => {
    setPuntosEntrega((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, [field]: value };
        if (field === "coordenadasGps") {
          const coords = String(value).trim();
          if (coords.includes(",") || coords.includes(" ")) {
            const cleaned = coords.replace(/[^\d.,\s-]/g, "").trim();
            updated.linkMaps = `https://www.google.com/maps?q=${encodeURIComponent(cleaned)}&t=k`;
          }
        }
        return updated;
      })
    );
  };

  const handleCapturarGps = (id: string) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("LA GEOLOCALIZACIÓN NO ESTÁ DISPONIBLE EN ESTE DISPOSITIVO.");
      return;
    }
    setGpsLoadingId(id);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(5);
        const lng = position.coords.longitude.toFixed(5);
        const coords = `${lat}, ${lng}`;
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}&t=k`;

        setPuntosEntrega((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  coordenadasGps: coords,
                  linkMaps: mapsUrl,
                }
              : p
          )
        );
        setGpsLoadingId(null);
        setGpsSuccessNotice({ id, msg: `UBICACIÓN GPS CAPTURADA: ${coords}` });
        setTimeout(() => setGpsSuccessNotice(null), 4000);
      },
      (error) => {
        console.warn("Error de geolocalización:", error);
        setGpsLoadingId(null);
        alert("NO SE PUDO CAPTURAR LA POSICIÓN AUTOMÁTICA. PODÉS INGRESAR COORDENADAS O REFERENCIAS MANUALMENTE.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // --- NIVEL 3 - OPCIÓN A: REGISTRO DE CLIENTE NUEVO Y PASE A NIVEL CON CLAVE ---
  const handleRegisterAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formNuevo.apellidos.trim()) {
      setFormError("EL CAMPO APELLIDO/S ES OBLIGATORIO");
      modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!formNuevo.nombres.trim()) {
      setFormError("EL CAMPO NOMBRES/S ES OBLIGATORIO");
      modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!formNuevo.fechaNacimiento.trim() || formNuevo.fechaNacimiento.length < 8) {
      setFormError("LA FECHA DE NACIMIENTO ES OBLIGATORIA (FORMATO DD/MM/AAAA)");
      modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!formNuevo.dni.trim()) {
      setFormError("EL CAMPO DNI ES OBLIGATORIO");
      modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!formNuevo.whatsappNumber.trim()) {
      setFormError("EL NÚMERO DE WHATSAPP ES OBLIGATORIO");
      modalScrollRef.current?.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }
    if (!formNuevo.localidad.trim()) {
      setFormError("LA LOCALIDAD ES OBLIGATORIA");
      modalScrollRef.current?.scrollTo({ top: 150, behavior: "smooth" });
      return;
    }
    if (!formNuevo.codigoPostal.trim()) {
      setFormError("EL CÓDIGO POSTAL ES OBLIGATORIO");
      modalScrollRef.current?.scrollTo({ top: 150, behavior: "smooth" });
      return;
    }
    if (!formNuevo.cuit.trim() || formNuevo.cuit.replace(/\D/g, "").length < 11) {
      setFormError("EL CUIT ES OBLIGATORIO Y DEBE TENER 11 DÍGITOS");
      modalScrollRef.current?.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    // RESOLVER AUTOMÁTICAMENTE LA RAZÓN SOCIAL: Proceso 100% automático sin bloquear al usuario
    const autoResolvedRazonSocial =
      formNuevo.razonSocial.trim() ||
      `${formNuevo.apellidos.trim()} ${formNuevo.nombres.trim()}`.trim() ||
      formNuevo.cuit;

    if (!formNuevo.password.trim()) {
      setFormError("POR FAVOR DEFINÍ UNA CONTRASEÑA PARA TU CUENTA");
      modalScrollRef.current?.scrollTo({ top: 300, behavior: "smooth" });
      return;
    }

    const res = registerClient({
      usuario: formNuevo.usuario || formNuevo.email.split("@")[0].toUpperCase(),
      razonSocial: autoResolvedRazonSocial.toUpperCase(),
      apellidos: formNuevo.apellidos.toUpperCase(),
      nombres: formNuevo.nombres.toUpperCase(),
      cuit: formNuevo.cuit,
      email: formNuevo.email.toLowerCase(),
      whatsapp: `${formNuevo.whatsappCountryCode} ${formNuevo.whatsappNumber}`,
      provincia: formNuevo.provincia,
      localidad: formNuevo.localidad,
      codigoPostal: formNuevo.codigoPostal,
    });

    if (res.success) {
      showNotification("¡CUENTA REGISTRADA CON ÉXITO! AHORA COMPLETÁ EL DESTINO Y FORMA DE PAGO");
      modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // --- NIVEL 3 - OPCIÓN B: LOGIN DE CLIENTE REGISTRADO Y PASE A NIVEL CON CLAVE ---
  const handleLoginAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formRegistrado.identifier.trim()) {
      setFormError("INGRESÁ TU CUIT O CORREO ELECTRÓNICO");
      return;
    }
    if (!formRegistrado.password.trim()) {
      setFormError("INGRESÁ TU CONTRASEÑA");
      return;
    }

    const res = login(formRegistrado.identifier, formRegistrado.password);
    if (!res.success) {
      setFormError(res.error || "ERROR AL INICIAR SESIÓN. VERIFICÁ TUS DATOS.");
    } else {
      showNotification("¡SESIÓN INICIADA! AHORA COMPLETÁ EL DESTINO Y FORMA DE PAGO");
      modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // --- NIVEL 4 CON CLAVE: ENVÍO FINAL DE LA COTIZACIÓN CON FORMA DE PAGO Y DESTINO ---
  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (cartItems.length === 0) {
      setFormError("DEBES AGREGAR AL MENOS UN PRODUCTO A TU COTIZACIÓN");
      modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!user) {
      setFormError("DEBÉS INICIAR SESIÓN O REGISTRARTE PARA CONTINUAR");
      return;
    }

    if (!formaPago) {
      setFormError("DEBÉS SELECCIONAR UNA FORMA DE PAGO");
      modalScrollRef.current?.scrollTo({ top: modalScrollRef.current.scrollHeight, behavior: "smooth" });
      return;
    }

    if (formaPago === "Otra (especificar)" && !formaPagoOtra.trim()) {
      setFormError("POR FAVOR ESPECIFICÁ LA FORMA DE PAGO EN EL CAMPO 'OTRA'");
      modalScrollRef.current?.scrollTo({ top: modalScrollRef.current.scrollHeight, behavior: "smooth" });
      return;
    }

    const paymentMethodSelected =
      formaPago === "Otra (especificar)"
        ? `OTRA: ${formaPagoOtra.trim().toUpperCase()}`
        : formaPago.toUpperCase();

    // Determinar nombre del establecimiento o punto de entrega de descarga
    let targetEstablishmentName = "";
    if (!useCustomPuntoEntrega && selectedEstablishmentId && establishments && establishments.length > 0) {
      const foundEst = establishments.find((est) => est.id === selectedEstablishmentId);
      if (foundEst) {
        targetEstablishmentName = `${foundEst.nombre} (${foundEst.localidad}, ${foundEst.provincia})`;
      }
    }
    if (!targetEstablishmentName && puntosEntrega.length > 0) {
      targetEstablishmentName = puntosEntrega[0].nombreLote || "TRANQUERA DE CAMPO DIRECTO";
    }

    setIsSubmitting(true);

    try {
      const payload = {
        operation,
        items: cartItems,
        formaPago: paymentMethodSelected,
        client: {
          tipoCliente: "REGISTRADO" as const,
          formaPago: paymentMethodSelected,
          email: user.email.toUpperCase(),
          cuit: user.cuit.toUpperCase(),
          razonSocial: user.razonSocial?.toUpperCase() || `${user.apellidos} ${user.nombres}`.trim(),
          apellidos: user.apellidos,
          nombres: user.nombres,
          provincia: user.provincia,
          localidad: user.localidad,
          codigoPostal: user.codigoPostal || formNuevo.codigoPostal || undefined,
          telefono: user.telefono || user.whatsapp,
          whatsappNumber: user.whatsapp,
          establecimientoDestino: targetEstablishmentName,
          puntosEntrega: useCustomPuntoEntrega || !establishments || establishments.length === 0 ? puntosEntrega : undefined,
        },
        generalObservations: formNuevo.observaciones || undefined,
      };

      const res = await fetch("/api/cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Sincronizar automáticamente con el portal de clientes (Cotizaciones Enviadas)
      try {
        addSentQuotation({
          operacion: operation === "VENDER" ? "VENTA" : "COMPRA",
          formaPago: paymentMethodSelected,
          items: cartItems.map((c) => {
            const tipoNormalized: "insumo" | "semilla" | "grano" =
              c.type === "INSUMOS"
                ? "insumo"
                : c.type === "SEMILLAS"
                ? "semilla"
                : "grano";

            return {
              tipo: tipoNormalized,
              nombre: c.title,
              categoriaOVariedad: c.subtitle || c.badge,
              empresa: c.badge,
              cantidad:
                typeof c.quantity === "number"
                  ? c.quantity
                  : parseFloat(String(c.quantity)) || 1,
              unidad: c.unit,
              detalle: c.details,
            };
          }),
          establecimientoDestino: targetEstablishmentName || "ESTABLECIMIENTO PRINCIPAL",
          observaciones: formNuevo.observaciones || undefined,
        });
      } catch (syncErr) {
        console.error("Error sincronizando cotización con portal:", syncErr);
      }

      setIsSubmitting(false);
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
      setCartItems([]);
      setFormaPago("Transferencia Bancaria");
      setFormaPagoOtra("");
      setPuntosEntrega([
        {
          id: "punto-1",
          nombreLote: "CAMPO PRINCIPAL - TRANQUERA 1",
          referenciaAcceso: "",
          coordenadasGps: "",
          linkMaps: "",
          tipoDescarga: "TRANQUERA DE CAMPO",
          esPrincipal: true,
        },
      ]);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setIsModalOpen(false);
      setCartItems([]);
      setIsSuccessModalOpen(true);
    }
  };

  const clearAllFilters = () => {
    setInsumoEmpresa("");
    setInsumoProducto("");
    setInsumoCategoria("");
    setInsumoPrincipio("");
    setInsumoCultivo("");
    setInsumoSearch("");
    setSemillaEmpresa("");
    setSemillaVariedad("");
    setSemillaCultivo("");
    setSemillaTecnologia("");
    setSemillaSearch("");
    setInsumoCurrentPage(1);
    setSemillaCurrentPage(1);
  };

  // Helper de Paginación Numérica 1, 2, 3, 4... x
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onPageChange: (p: number) => void
  ) => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-6 mt-2 border-t border-slate-200/80 uppercase">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>ANTERIOR</span>
        </button>

        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`dots-${idx}`} className="px-2 py-1 text-xs text-slate-400 font-black">
                ...
              </span>
            );
          }
          const pageNum = p as number;
          const isActive = pageNum === currentPage;
          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[32px] h-8 px-2 text-xs font-black rounded-lg transition-all ${
                isActive
                  ? "bg-campo-green text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          <span>SIGUIENTE</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <section
      id="tu-cotizacion"
      className="py-16 sm:py-24 bg-slate-50 relative border-b border-slate-200/80 overflow-hidden"
    >
      {/* Marca de agua de sembrado que termina en la nada sin cortes */}
      <div className="absolute bottom-0 left-0 right-0 h-72 sm:h-96 pointer-events-none overflow-hidden z-0 select-none">
        <Image
          src="/images/sembrado-soja-watermark.jpg"
          alt="Sembrado de soja Campo Directo"
          fill
          sizes="100vw"
          className="object-cover object-bottom opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-slate-50/70 to-slate-50" />
      </div>

      {/* Notificación flotante de producto añadido */}
      {quickNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-campo-green/50 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-campo-green shrink-0" />
          <span className="text-sm font-semibold">{quickNotice}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado Institucional Oficial */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12 sm:mb-16 pb-8 border-b border-slate-200/80">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-campo-green-100 text-campo-green-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <Calculator className="w-4 h-4 text-campo-green" />
              <span>MARKETPLACE DIRECTO & COTIZADOR OFICIAL</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Tu <span className="text-campo-green">Cotización</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Seleccioná los insumos, semillas o posiciones de granos que necesitás cotizar, agregalos a tu lista en tiempo real y gestioná tu solicitud comercial directamente con nuestro equipo.
            </p>
          </div>

          {/* Lado Derecho: Logo Campo Directo + Eslogan Unificado en Verde sin punto */}
          <div className="flex items-center gap-5 sm:gap-7 shrink-0 self-start lg:self-center py-2">
            <div className="relative flex items-center justify-center">
              <Logo
                className="h-20 sm:h-24 lg:h-28 w-auto filter drop-shadow-md hover:scale-105 transition-transform"
                variant="standard"
              />
            </div>
            <div className="h-16 sm:h-20 w-[2px] bg-campo-green/80" />
            <div>
              <span className="text-xl sm:text-2xl lg:text-3xl font-black text-campo-green tracking-tight leading-tight block">
                Del Laboratorio<br />a tu campo
              </span>
              <div className="w-14 sm:w-16 h-1.5 bg-campo-green rounded-full mt-2" />
            </div>
          </div>
        </div>

        {/* RECTÁNGULO 1: ¿QUÉ QUERÉS HACER? + ¿QUÉ ESTÁS NECESITANDO? (FULL WIDTH) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-slate-200/80 mb-8 w-full uppercase">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Paso 1: ¿Qué querés hacer? */}
            <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-6 lg:pb-0 lg:pr-8 flex flex-col justify-start">
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-campo-green text-white text-xs font-black shrink-0">
                  1
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  ¿QUÉ QUERÉS HACER?
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOperation("COMPRAR")}
                  className={`flex flex-col items-center justify-center h-[96px] sm:h-[102px] p-2 sm:p-3 rounded-xl border-2 font-bold transition-all text-center cursor-pointer ${
                    operation === "COMPRAR"
                      ? "border-campo-green bg-campo-green text-white shadow-md"
                      : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <ShoppingCart
                    className={`w-5 h-5 mb-1.5 shrink-0 ${
                      operation === "COMPRAR" ? "text-white" : "text-slate-500"
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-black leading-tight tracking-wide block">
                    COMPRAR
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-normal leading-tight mt-1 line-clamp-1 block ${
                      operation === "COMPRAR" ? "text-white/90" : "text-slate-500"
                    }`}
                  >
                    ADQUIRIR INSUMOS O SEMILLAS
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOperation("VENDER")}
                  className={`flex flex-col items-center justify-center h-[96px] sm:h-[102px] p-2 sm:p-3 rounded-xl border-2 font-bold transition-all text-center cursor-pointer ${
                    operation === "VENDER"
                      ? "border-campo-green bg-campo-green text-white shadow-md"
                      : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <TrendingUp
                    className={`w-5 h-5 mb-1.5 shrink-0 ${
                      operation === "VENDER" ? "text-white" : "text-slate-500"
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-black leading-tight tracking-wide block">
                    VENDER
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-normal leading-tight mt-1 line-clamp-1 block ${
                      operation === "VENDER" ? "text-white/90" : "text-slate-500"
                    }`}
                  >
                    OFRECER GRANOS O PRODUCCIÓN
                  </span>
                </button>
              </div>
            </div>

            {/* Paso 2: ¿Qué estás necesitando? */}
            <div className="lg:col-span-7 flex flex-col justify-start">
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-campo-green text-white text-xs font-black shrink-0">
                  2
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  ¿QUÉ ESTÁS NECESITANDO?
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActiveCategory("GRANOS")}
                  className={`flex flex-col items-center justify-center h-[96px] sm:h-[102px] p-2 sm:p-3 rounded-xl border-2 font-bold transition-all text-center cursor-pointer ${
                    activeCategory === "GRANOS"
                      ? "border-campo-green bg-campo-green text-white shadow-md"
                      : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <Wheat
                    className={`w-5 h-5 mb-1.5 shrink-0 ${
                      activeCategory === "GRANOS" ? "text-white" : "text-slate-500"
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-black leading-tight tracking-wide block">
                    GRANOS
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-normal leading-tight mt-1 line-clamp-1 block ${
                      activeCategory === "GRANOS" ? "text-white/90" : "text-slate-500"
                    }`}
                  >
                    SOJA, MAÍZ, TRIGO...
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory("SEMILLAS")}
                  className={`flex flex-col items-center justify-center h-[96px] sm:h-[102px] p-2 sm:p-3 rounded-xl border-2 font-bold transition-all text-center cursor-pointer ${
                    activeCategory === "SEMILLAS"
                      ? "border-campo-green bg-campo-green text-white shadow-md"
                      : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <Sprout
                    className={`w-5 h-5 mb-1.5 shrink-0 ${
                      activeCategory === "SEMILLAS" ? "text-white" : "text-slate-500"
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-black leading-tight tracking-wide block">
                    SEMILLAS
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-normal leading-tight mt-1 line-clamp-1 block ${
                      activeCategory === "SEMILLAS" ? "text-white/90" : "text-slate-500"
                    }`}
                  >
                    VARIEDADES & HÍBRIDOS
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory("INSUMOS")}
                  className={`flex flex-col items-center justify-center h-[96px] sm:h-[102px] p-2 sm:p-3 rounded-xl border-2 font-bold transition-all text-center cursor-pointer ${
                    activeCategory === "INSUMOS"
                      ? "border-campo-green bg-campo-green text-white shadow-md"
                      : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <FlaskConical
                    className={`w-5 h-5 mb-1.5 shrink-0 ${
                      activeCategory === "INSUMOS" ? "text-white" : "text-slate-500"
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-black leading-tight tracking-wide block">
                    INSUMOS
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-normal leading-tight mt-1 line-clamp-1 block ${
                      activeCategory === "INSUMOS" ? "text-white/90" : "text-slate-500"
                    }`}
                  >
                    HERBICIDAS, FUNGICIDAS...
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RECTÁNGULO DE FILTROS DINÁMICOS (FULL WIDTH - TODO EN MAYÚSCULAS) */}
        <div className="bg-[#f0f8f2] rounded-2xl p-6 sm:p-7 shadow-card border border-campo-green/25 mb-8 w-full uppercase">
          {/* FILTROS DE INSUMOS */}
          {activeCategory === "INSUMOS" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-campo-green/20">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Filter className="w-5 h-5 text-campo-green" />
                  <span className="text-base sm:text-lg font-black text-slate-900">
                    FILTROS DINÁMICOS DE INSUMOS AGROPECUARIOS
                  </span>
                </div>
                {(insumoEmpresa || insumoProducto || insumoCategoria || insumoPrincipio || insumoCultivo || insumoSearch) && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RESTABLECER FILTROS</span>
                  </button>
                )}
              </div>

              {/* Búsqueda Rápida en Mayúsculas */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="BUSCAR POR PRODUCTO, EMPRESA (EJ. GLEBA, ADAMA), PRINCIPIO ACTIVO O CULTIVO..."
                  value={insumoSearch}
                  onChange={(e) => setInsumoSearch(e.target.value.toUpperCase())}
                  className="w-full uppercase pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-campo-green focus:ring-2 focus:ring-campo-green/20 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all"
                />
                {insumoSearch && (
                  <button
                    type="button"
                    onClick={() => setInsumoSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 5 Desplegables de Filtro Insumos en Mayúsculas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* 1. Empresa / Fabricante */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    EMPRESA / FABRICANTE
                  </label>
                  <select
                    value={insumoEmpresa}
                    onChange={(e) => {
                      setInsumoEmpresa(e.target.value);
                      setInsumoProducto("");
                    }}
                    className="w-full uppercase py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:border-campo-green focus:ring-2 focus:ring-campo-green/20 focus:outline-none shadow-2xs transition-colors"
                  >
                    <option value="">TODAS LAS EMPRESAS ({insumoEmpresas.length})</option>
                    {insumoEmpresas.map((emp) => (
                      <option key={emp} value={emp}>
                        {emp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Nombre Comercial (Producto) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NOMBRE COMERCIAL (PRODUCTO)
                  </label>
                  <select
                    value={insumoProducto}
                    onChange={(e) => setInsumoProducto(e.target.value)}
                    className="w-full uppercase py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:border-campo-green focus:ring-2 focus:ring-campo-green/20 focus:outline-none shadow-2xs transition-colors truncate"
                  >
                    <option value="">
                      {insumoEmpresa ? `TODOS LOS PRODUCTOS DE ${insumoEmpresa}` : "TODOS LOS PRODUCTOS"}
                    </option>
                    {availableInsumoProductos.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Categoría */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CATEGORÍA
                  </label>
                  <select
                    value={insumoCategoria}
                    onChange={(e) => setInsumoCategoria(e.target.value)}
                    className="w-full uppercase py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:border-campo-green focus:ring-2 focus:ring-campo-green/20 focus:outline-none shadow-2xs transition-colors"
                  >
                    <option value="">TODAS LAS CATEGORÍAS</option>
                    {availableInsumoCategorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Principio Activo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PRINCIPIO ACTIVO
                  </label>
                  <select
                    value={insumoPrincipio}
                    onChange={(e) => setInsumoPrincipio(e.target.value)}
                    className="w-full uppercase py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:border-campo-green focus:ring-2 focus:ring-campo-green/20 focus:outline-none shadow-2xs transition-colors truncate"
                  >
                    <option value="">TODOS LOS PRINCIPIOS</option>
                    {availableInsumoPrincipios.map((pa) => (
                      <option key={pa} value={pa}>
                        {pa}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Principales Cultivos */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PRINCIPALES CULTIVOS
                  </label>
                  <select
                    value={insumoCultivo}
                    onChange={(e) => setInsumoCultivo(e.target.value)}
                    className="w-full uppercase py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:border-campo-green focus:ring-2 focus:ring-campo-green/20 focus:outline-none shadow-2xs transition-colors"
                  >
                    <option value="">TODOS LOS CULTIVOS</option>
                    {insumoCultivos.map((cult) => (
                      <option key={cult} value={cult}>
                        {cult}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resumen del filtro */}
              <div className="mt-4 pt-3 border-t border-campo-green/20 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                <span>
                  MOSTRANDO PÁGINA <strong className="text-slate-800">{insumoCurrentPage}</strong> DE <strong className="text-slate-800">{totalInsumoPages}</strong> ({filteredInsumos.length} PRODUCTOS DISPONIBLES)
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {insumoEmpresa && (
                    <span className="inline-flex items-center gap-1 bg-white border border-campo-green/30 text-campo-green px-2 py-0.5 rounded-md font-bold shadow-2xs">
                      EMPRESA: {insumoEmpresa}
                    </span>
                  )}
                  {insumoProducto && (
                    <span className="inline-flex items-center gap-1 bg-white border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded-md font-bold shadow-2xs">
                      PRODUCTO: {insumoProducto}
                    </span>
                  )}
                  {insumoCategoria && (
                    <span className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-800 px-2 py-0.5 rounded-md font-bold shadow-2xs">
                      {insumoCategoria}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FILTROS DE SEMILLAS */}
          {activeCategory === "SEMILLAS" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-campo-green/20">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Filter className="w-5 h-5 text-campo-green" />
                  <span className="text-base sm:text-lg font-black text-slate-900">
                    FILTROS DE SEMILLAS, CRIADEROS & VARIEDADES
                  </span>
                </div>
                {(semillaEmpresa || semillaVariedad || semillaCultivo || semillaTecnologia || semillaSearch) && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RESTABLECER FILTROS</span>
                  </button>
                )}
              </div>

              {/* Búsqueda rápida */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="BUSCAR POR VARIEDAD, CRIADERO (EJ. DON MARIO, NIDERA), CULTIVO O TECNOLOGÍA..."
                  value={semillaSearch}
                  onChange={(e) => setSemillaSearch(e.target.value.toUpperCase())}
                  className="w-full uppercase pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-campo-green focus:ring-2 focus:ring-campo-green/20 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all"
                />
                {semillaSearch && (
                  <button
                    type="button"
                    onClick={() => setSemillaSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 4 Desplegables de Filtro Semillas en Mayúsculas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Criadero / Empresa */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CRIADERO / EMPRESA
                  </label>
                  <select
                    value={semillaEmpresa}
                    onChange={(e) => {
                      setSemillaEmpresa(e.target.value);
                      setSemillaVariedad("");
                    }}
                    className="w-full uppercase py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:border-campo-green focus:ring-2 focus:ring-campo-green/20 focus:outline-none shadow-2xs transition-colors"
                  >
                    <option value="">TODOS LOS CRIADEROS ({semillaEmpresas.length})</option>
                    {semillaEmpresas.map((emp) => (
                      <option key={emp} value={emp}>
                        {emp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Variedad */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    VARIEDAD
                  </label>
                  <select
                    value={semillaVariedad}
                    onChange={(e) => setSemillaVariedad(e.target.value)}
                    className="w-full uppercase py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:border-campo-green focus:ring-2 focus:ring-campo-green/20 focus:outline-none shadow-2xs transition-colors truncate"
                  >
                    <option value="">
                      {semillaEmpresa ? `TODAS LAS VARIEDADES DE ${semillaEmpresa}` : "TODAS LAS VARIEDADES"}
                    </option>
                    {availableSemillaVariedades.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Cultivo / Especie */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CULTIVO / ESPECIE
                  </label>
                  <select
                    value={semillaCultivo}
                    onChange={(e) => setSemillaCultivo(e.target.value)}
                    className="w-full uppercase py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:border-campo-green focus:ring-2 focus:ring-campo-green/20 focus:outline-none shadow-2xs transition-colors"
                  >
                    <option value="">TODOS LOS CULTIVOS</option>
                    {semillaCultivos.map((cult) => (
                      <option key={cult} value={cult}>
                        {cult}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Tecnología */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    TECNOLOGÍA
                  </label>
                  <select
                    value={semillaTecnologia}
                    onChange={(e) => setSemillaTecnologia(e.target.value)}
                    className="w-full uppercase py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:border-campo-green focus:ring-2 focus:ring-campo-green/20 focus:outline-none shadow-2xs transition-colors"
                  >
                    <option value="">TODAS LAS TECNOLOGÍAS</option>
                    {semillaTecnologias.map((tec) => (
                      <option key={tec} value={tec}>
                        {tec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-campo-green/20 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                <span>
                  MOSTRANDO PÁGINA <strong className="text-slate-800">{semillaCurrentPage}</strong> DE <strong className="text-slate-800">{totalSemillaPages}</strong> ({filteredSemillas.length} VARIEDADES REGISTRADAS)
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {semillaEmpresa && (
                    <span className="inline-flex items-center gap-1 bg-white border border-campo-green/30 text-campo-green px-2 py-0.5 rounded-md font-bold shadow-2xs">
                      CRIADERO: {semillaEmpresa}
                    </span>
                  )}
                  {semillaVariedad && (
                    <span className="inline-flex items-center gap-1 bg-white border border-amber-300 text-amber-800 px-2 py-0.5 rounded-md font-bold shadow-2xs">
                      VARIEDAD: {semillaVariedad}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CONSTRUCTOR DE POSICIÓN DE GRANOS */}
          {activeCategory === "GRANOS" && (
            <div>
              <div className="border-b border-campo-green/20 pb-4 mb-5">
                <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
                  <Wheat className="w-6 h-6 text-campo-green" />
                  <span>CONFIGURACIÓN DE POSICIÓN COMERCIAL DE GRANOS</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  DEFINÍ EL CEREAL U OLEAGINOSA, EL PUERTO O DESTINO COMERCIAL, LAS CONDICIONES DE LIQUIDACIÓN Y EL VOLUMEN EN TONELADAS PARA COTIZAR.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Grano */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    GRANO / CULTIVO
                  </label>
                  <select
                    value={granoSelected}
                    onChange={(e) => setGranoSelected(e.target.value)}
                    className="w-full uppercase py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 focus:border-campo-green focus:outline-none shadow-2xs transition-colors"
                  >
                    {granosConfig.granos.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Puerto / Destino */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    PUERTO / DESTINO DE ENTREGA
                  </label>
                  <select
                    value={puertoSelected}
                    onChange={(e) => setPuertoSelected(e.target.value)}
                    className="w-full uppercase py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 focus:border-campo-green focus:outline-none shadow-2xs transition-colors"
                  >
                    {granosConfig.puertos.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condición */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    CONDICIÓN DE PAGO
                  </label>
                  <select
                    value={condicionSelected}
                    onChange={(e) => setCondicionSelected(e.target.value)}
                    className="w-full uppercase py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 focus:border-campo-green focus:outline-none shadow-2xs transition-colors"
                  >
                    {granosConfig.condiciones.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mercado */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    MERCADO
                  </label>
                  <select
                    value={mercadoSelected}
                    onChange={(e) => setMercadoSelected(e.target.value)}
                    className="w-full uppercase py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 focus:border-campo-green focus:outline-none shadow-2xs transition-colors"
                  >
                    {granosConfig.mercados.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Moneda / Precio Buscado */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    PRECIO BUSCADO / MONEDA
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={precioBuscadoSelected}
                      onChange={(e) => setPrecioBuscadoSelected(e.target.value)}
                      className="w-1/2 uppercase py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 focus:border-campo-green focus:outline-none shadow-2xs transition-colors"
                    >
                      {granosConfig.precioBuscado.map((pb) => (
                        <option key={pb} value={pb}>
                          {pb}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="VALOR (OPCIONAL)"
                      value={customPrecio}
                      onChange={(e) => setCustomPrecio(e.target.value.toUpperCase())}
                      className="w-1/2 uppercase py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 focus:border-campo-green focus:outline-none shadow-2xs transition-colors"
                    />
                  </div>
                </div>

                {/* Flete */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    MODALIDAD DE FLETE
                  </label>
                  <select
                    value={fleteSelected}
                    onChange={(e) => setFleteSelected(e.target.value)}
                    className="w-full uppercase py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 focus:border-campo-green focus:outline-none shadow-2xs transition-colors"
                  >
                    {granosConfig.fletes.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Volumen en Toneladas */}
                <div className="sm:col-span-2 lg:col-span-3 bg-white p-4 rounded-xl border border-campo-green/30 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-1">
                  <div>
                    <span className="block text-xs font-black uppercase tracking-wider text-slate-600">
                      VOLUMEN ESTIMADO DE LA OPERACIÓN
                    </span>
                    <p className="text-sm text-slate-800 font-bold">
                      INDICÁ LAS TONELADAS QUE PROYECTÁS {operation === "VENDER" ? "ENTREGAR" : "ADQUIRIR"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="10"
                      value={volumenTn}
                      onChange={(e) => setVolumenTn(e.target.value)}
                      className="w-28 py-2 px-3 rounded-lg border-2 border-campo-green text-center font-black text-slate-900 bg-emerald-50/50 focus:bg-white focus:outline-none text-base"
                    />
                    <span className="text-base font-bold text-slate-700">TN</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  type="button"
                  onClick={addGranoToCart}
                  className="w-full py-3.5 px-4 bg-campo-green hover:bg-campo-green-600 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase"
                >
                  <Plus className="w-5 h-5" />
                  <span>+ AGREGAR POSICIÓN DE {granoSelected} A LA COTIZACIÓN</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SIDE-BY-SIDE: 6 PRODUCTOS EN LA IZQUIERDA Y CARRITO EN LA DERECHA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch uppercase">
          {/* COLUMNA IZQUIERDA: MÁXIMO 6 PRODUCTOS POR PÁGINA (8 columnas) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            {/* VISTA A: PRODUCTOS DE INSUMOS */}
            {activeCategory === "INSUMOS" && (
              <div className="flex-1 flex flex-col justify-between">
                {filteredInsumos.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-card flex-1 flex flex-col items-center justify-center min-h-[380px]">
                    <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-base font-bold text-slate-700">
                      NO ENCONTRAMOS INSUMOS CON LOS FILTROS SELECCIONADOS.
                    </p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      PROBÁ CAMBIANDO LA EMPRESA, EL PRODUCTO O EL PRINCIPIO ACTIVO.
                    </p>
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="px-4 py-2 bg-campo-green text-white text-xs font-bold rounded-lg hover:bg-campo-green-600 transition-colors"
                    >
                      RESTABLECER TODOS LOS FILTROS
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between">
                    {/* Grilla exacta de 6 productos (3 filas de 2 columnas) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paginatedInsumos.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                                <Building2 className="w-3 h-3 mr-1 text-slate-500" />
                                {item.empresa}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-campo-green-50 text-campo-green-800 text-[11px] font-semibold">
                                {item.categoria}
                              </span>
                            </div>

                            <h4 className="text-base font-black text-slate-900 leading-snug mb-2">
                              {item.producto}
                            </h4>

                            <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                              <div className="flex items-start gap-1.5">
                                <FlaskConical className="w-3.5 h-3.5 text-campo-green shrink-0 mt-0.5" />
                                <span>
                                  <strong className="text-slate-700">P. ACTIVO:</strong> {item.principioActivo || "-"}
                                </span>
                              </div>
                              <div className="flex items-start gap-1.5">
                                <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>
                                  <strong className="text-slate-700">CULTIVOS:</strong> {item.cultivosPrincipales || "TODOS LOS CULTIVOS"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => addInsumoToCart(item)}
                            className="w-full mt-2 py-2.5 px-3 bg-campo-green hover:bg-campo-green-600 text-white text-xs font-black rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group"
                          >
                            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>AGREGAR A COTIZACIÓN</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* PAGINACIÓN NUMÉRICA 1, 2, 3, 4... X */}
                    {renderPagination(insumoCurrentPage, totalInsumoPages, (p) => {
                      setInsumoCurrentPage(p);
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VISTA B: PRODUCTOS DE SEMILLAS */}
            {activeCategory === "SEMILLAS" && (
              <div className="flex-1 flex flex-col justify-between">
                {filteredSemillas.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-card flex-1 flex flex-col items-center justify-center min-h-[380px]">
                    <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-base font-bold text-slate-700">
                      NO ENCONTRAMOS VARIEDADES CON LOS FILTROS SELECCIONADOS.
                    </p>
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="mt-4 px-4 py-2 bg-campo-green text-white text-xs font-bold rounded-lg hover:bg-campo-green-600 transition-colors"
                    >
                      RESTABLECER TODOS LOS FILTROS
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between">
                    {/* Grilla exacta de 6 semillas (3 filas de 2 columnas) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paginatedSemillas.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                                <Building2 className="w-3 h-3 mr-1 text-slate-500" />
                                {item.empresa}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[11px] font-bold">
                                {item.semilla}
                              </span>
                            </div>

                            <h4 className="text-base font-black text-slate-900 leading-snug mb-1">
                              {item.variedad}
                            </h4>

                            <div className="mb-3">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-campo-green-100 text-campo-green-900 text-[10px] font-bold uppercase">
                                TECNOLOGÍA: {item.tecnologia || "CONVENCIONAL"}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
                              {item.caracteristicas || "HÍBRIDO/VARIEDAD CON EXCELENTE POTENCIAL DE RINDE Y SANIDAD FOLIAR."}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => addSemillaToCart(item)}
                            className="w-full mt-2 py-2.5 px-3 bg-campo-green hover:bg-campo-green-600 text-white text-xs font-black rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group"
                          >
                            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>AGREGAR A COTIZACIÓN</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* PAGINACIÓN NUMÉRICA 1, 2, 3, 4... X */}
                    {renderPagination(semillaCurrentPage, totalSemillaPages, (p) => {
                      setSemillaCurrentPage(p);
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VISTA C: POSICIÓN DE GRANOS CONFIGURADA */}
            {activeCategory === "GRANOS" && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-4 flex-1 flex flex-col justify-between min-h-[380px]">
                <div>
                  <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
                    <Package className="w-5 h-5 text-campo-green" />
                    <span className="text-base font-black">POSICIONES FRECUENTES DE GRANOS</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    TAMBIÉN PODÉS AGREGAR POSICIONES RÁPIDAS SUGERIDAS PARA TU ZONA O CONSULTAR FIJACIONES DIRECTAS CON LOS PUERTOS DEL UP-RIVER Y DEL SUR DE LA PROVINCIA DE BUENOS AIRES.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col justify-between">
                    <div>
                      <span className="font-black text-slate-900 block text-sm">SOJA ROSARIO / UP-RIVER</span>
                      <span className="text-slate-500 text-[11px]">MERCADO EXPORTACIÓN / FÁBRICA • CONDICIÓN PESOS</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGranoSelected("SOJA");
                        setPuertoSelected("ROSARIO");
                        setMercadoSelected("EXPORTACIÓN");
                        addGranoToCart();
                      }}
                      className="mt-3 py-1.5 px-3 bg-campo-green hover:bg-campo-green-600 text-white text-[11px] font-black rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>AGREGAR SOJA ROSARIO (100 TN)</span>
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col justify-between">
                    <div>
                      <span className="font-black text-slate-900 block text-sm">MAÍZ SAN LORENZO / TIMBÚES</span>
                      <span className="text-slate-500 text-[11px]">MERCADO EXPORTACIÓN • CONDICIÓN DÓLARES</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGranoSelected("MAÍZ");
                        setPuertoSelected("SAN LORENZO");
                        setMercadoSelected("EXPORTACIÓN");
                        addGranoToCart();
                      }}
                      className="mt-3 py-1.5 px-3 bg-campo-green hover:bg-campo-green-600 text-white text-[11px] font-black rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>AGREGAR MAÍZ SAN LORENZO (100 TN)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: EL CARRITO DE COTIZACIÓN (TAMAÑO PRE-ESTABLECIDO SIN SOBREPASAR PRODUCTOS) */}
          <div className="lg:col-span-4 flex flex-col lg:max-h-[690px]">
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border-2 border-slate-200/90 flex-1 flex flex-col justify-between min-h-[520px] lg:min-h-0 lg:max-h-[690px] overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2 font-black text-slate-900 text-base">
                  <ShoppingCart className="w-5 h-5 text-campo-green" />
                  <span>TU LISTA DE COTIZACIÓN</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-campo-green text-white text-xs font-black">
                  {cartItems.length} {cartItems.length === 1 ? "ÍTEM" : "ÍTEMS"}
                </span>
              </div>

              {/* Lista de productos agregados - Barra de movimiento (scroll) dentro de ese tamaño ya pre-establecido */}
              <div className="py-4 space-y-3 flex-1 overflow-y-auto pr-1.5 min-h-0 custom-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-8 text-center text-slate-400 space-y-2">
                    <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
                    <p className="text-xs font-bold text-slate-600">
                      TU LISTA DE COTIZACIÓN ESTÁ VACÍA
                    </p>
                    <p className="text-[11px] text-slate-400 px-4 leading-relaxed">
                      HACÉ CLIC EN &quot;AGREGAR A COTIZACIÓN&quot; EN LOS INSUMOS, SEMILLAS O GRANOS QUE QUIERAS PRESUPUESTAR.
                    </p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="ELIMINAR DE LA LISTA"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="pr-6">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-600 mb-1">
                          {item.type} • {item.subtitle}
                        </span>
                        <h5 className="text-xs font-black text-slate-900 leading-snug">
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.details}
                        </p>
                      </div>

                      {/* Control de Cantidad y Unidad */}
                      <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-600">
                          CANTIDAD:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => updateItemQty(item.id, e.target.value)}
                            className="w-16 py-1 px-1.5 text-center text-xs font-bold rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-campo-green"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => updateItemUnit(item.id, e.target.value)}
                            className="py-1 px-1.5 text-[11px] font-semibold rounded border border-slate-300 bg-white text-slate-800 focus:outline-none uppercase"
                          >
                            <option value="LTS">LTS</option>
                            <option value="KGS">KGS</option>
                            <option value="LTS/KGS">LTS/KGS</option>
                            <option value="BOLSAS">BOLSAS</option>
                            <option value="TN">TN</option>
                            <option value="BIDONES 20L">BIDONES 20L</option>
                            <option value="IBC 1000L">IBC 1000L</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Botón de Acción Principal para Enviar Cotización */}
              <div className="pt-4 border-t border-slate-100 space-y-2 shrink-0">
                <button
                  type="button"
                  disabled={cartItems.length === 0}
                  onClick={() => setIsModalOpen(true)}
                  className={`w-full py-3 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md uppercase ${
                    cartItems.length > 0
                      ? "bg-campo-green hover:bg-campo-green-600 text-white cursor-pointer shadow-campo-green/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>SOLICITAR COTIZACIÓN OFICIAL</span>
                </button>

                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCartItems([])}
                    className="w-full py-1 text-center text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase"
                  >
                    VACIAR LISTA DE COTIZACIÓN
                  </button>
                )}

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 uppercase">
                    <ShieldCheck className="w-4 h-4 text-campo-green shrink-0" />
                    <span>ENVÍO DIRECTO SIN INTERMEDIARIOS.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE IDENTIFICACIÓN: CLIENTE REGISTRADO vs CLIENTE NUEVO */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn uppercase"
        >
          <div
            className="relative bg-[#f0f8f2] w-full max-w-4xl h-[92vh] max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border-2 border-campo-green/30 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal - Fijo en la parte superior */}
            <div className="shrink-0 bg-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-800">
              <div className="pr-3">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-campo-green uppercase block">
                  IDENTIFICACIÓN DE OPERADOR
                </span>
                <h3 className="text-sm sm:text-lg md:text-xl font-black tracking-tight text-white leading-tight">
                  CONFIRMÁ TU SOLICITUD DE COTIZACIÓN
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  title="Cerrar modal (Esc)"
                >
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-700 rounded text-slate-200 font-mono">ESC</kbd>
                  <span className="hidden sm:inline">VOLVER</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Cerrar modal (Esc)"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Pestañas destacadas en Verde: CLIENTE NUEVO vs ACCESO CLIENTE REGISTRADO */}
            <div className="shrink-0 grid grid-cols-2 bg-emerald-900/10 border-b-2 border-campo-green/30 p-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setClientTab("NUEVO");
                  setFormError(null);
                }}
                className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-black transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 ${
                  clientTab === "NUEVO"
                    ? "bg-campo-green text-white shadow-md shadow-campo-green/30 border-2 border-campo-green-700"
                    : "bg-emerald-100 hover:bg-emerald-200/80 text-emerald-950 font-black border-2 border-emerald-300"
                }`}
              >
                <span>CLIENTE NUEVO</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setClientTab("REGISTRADO");
                  setFormError(null);
                }}
                className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-black transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 ${
                  clientTab === "REGISTRADO"
                    ? "bg-campo-green text-white shadow-md shadow-campo-green/30 border-2 border-campo-green-700"
                    : "bg-emerald-100 hover:bg-emerald-200/80 text-emerald-950 font-black border-2 border-emerald-300"
                }`}
              >
                <span>ACCESO CLIENTE REGISTRADO</span>
                {user && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/25 text-white font-black border border-white/30 hidden sm:inline-block">
                    ACTIVO
                  </span>
                )}
              </button>
            </div>

            {/* Error banner - Fijo en la parte superior si existe */}
            {formError && (
              <div className="shrink-0 mx-4 sm:mx-6 mt-3 p-2.5 sm:p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-bold text-red-700 shadow-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="flex-1">{formError}</span>
              </div>
            )}

            {/* Contenedor desplazable con todos los campos */}
            <div
              ref={modalScrollRef}
              className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-5 lg:p-6 space-y-4"
            >
              {/* ========================================================================= */}
              {/* CASO 1: USUARIO AUTENTICADO ("NIVEL 4 CON CLAVE")                         */}
              {/* ========================================================================= */}
              {user ? (
                clientTab === "NUEVO" ? (
                  /* Usuario autenticado que pulsó "CLIENTE NUEVO" */
                  <div className="bg-white p-5 rounded-2xl border-2 border-campo-green/40 shadow-xs space-y-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-campo-green flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 uppercase">
                        YA TENÉS UNA SESIÓN ACTIVA
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 uppercase">
                        ACTUALMENTE ESTÁS IDENTIFICADO COMO <strong>{user.razonSocial || user.usuario}</strong> (CUIT: {user.cuit}).
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Si deseás solicitar la cotización con tus datos actuales, continuá con tu sesión. Si querés registrar otra empresa o productor, cerrá tu sesión primero.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => setClientTab("REGISTRADO")}
                        className="py-2.5 px-5 bg-campo-green text-white text-xs font-black rounded-xl hover:bg-campo-green-600 transition-colors cursor-pointer uppercase shadow-md shadow-campo-green/20"
                      >
                        CONTINUAR CON MI SESIÓN
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setFormError(null);
                        }}
                        className="py-2.5 px-5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-bold rounded-xl transition-colors border border-slate-300 cursor-pointer uppercase"
                      >
                        CERRAR SESIÓN Y REGISTRAR NUEVA CUENTA
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Usuario autenticado en tab "ACCESO CLIENTES REGISTRADO" -> Nivel con clave */
                  <div className="space-y-4">
                    {/* Tarjeta de Sesión Activa */}
                    <div className="p-3.5 bg-emerald-50 border-2 border-campo-green/40 rounded-xl text-emerald-950 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-campo-green text-white flex items-center justify-center shrink-0 shadow-xs">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-xs sm:text-sm text-slate-900 uppercase">
                            SESIÓN ACTIVA: {user.razonSocial || user.usuario}
                          </p>
                          <p className="text-[11px] text-emerald-800 font-medium uppercase">
                            CUIT: {user.cuit} · {user.email} {user.localidad ? `· ${user.localidad}, ${user.provincia}` : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setFormError(null);
                        }}
                        className="text-[11px] font-bold text-slate-600 hover:text-red-600 hover:underline transition-colors self-start sm:self-center cursor-pointer uppercase"
                      >
                        CERRAR SESIÓN / CAMBIAR CUENTA
                      </button>
                    </div>

                    {/* 5. ELECCIÓN DE ESTABLECIMIENTOS, LOTE O TRANQUERA (EXCLUSIVO CLIENTE REGISTRADO) */}
                    <div className="bg-white p-4 sm:p-5 rounded-xl border-2 border-campo-green/40 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 text-slate-900">
                          <div className="w-8 h-8 rounded-lg bg-campo-green text-white flex items-center justify-center shrink-0 shadow-xs">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black uppercase text-slate-900 leading-tight">
                              ESTABLECIMIENTO, LOTE O TRANQUERA DE ENTREGA *
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              INDICÁ DÓNDE SE DESCARGARÁ O ENTREGARÁ ESTA OPERACIÓN
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-campo-green-50 text-campo-green-800 text-[10px] font-black tracking-wider uppercase self-start sm:self-auto border border-campo-green-200">
                          DESTINO DE DESCARGA
                        </span>
                      </div>

                      {/* Si el cliente tiene establecimientos guardados */}
                      {establishments && establishments.length > 0 && (
                        <div className="space-y-2">
                          <label className="block text-[11px] font-black uppercase text-slate-700">
                            SELECCIONÁ UNO DE TUS ESTABLECIMIENTOS GUARDADOS:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {establishments.map((est) => {
                              const isSelected = !useCustomPuntoEntrega && selectedEstablishmentId === est.id;
                              return (
                                <button
                                  type="button"
                                  key={est.id}
                                  onClick={() => {
                                    setSelectedEstablishmentId(est.id);
                                    setUseCustomPuntoEntrega(false);
                                  }}
                                  className={`p-3 rounded-xl border-2 text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                                    isSelected
                                      ? "border-campo-green bg-campo-green-50/70 text-slate-900 shadow-xs ring-2 ring-campo-green/20"
                                      : "border-slate-200 bg-white hover:border-campo-green/40 text-slate-700"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-black text-slate-900 uppercase">{est.nombre}</span>
                                      {est.esPrincipal && (
                                        <span className="text-[9px] px-1.5 py-0.2 bg-campo-green text-white rounded font-bold uppercase">
                                          PRINCIPAL
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5 uppercase">
                                      {est.localidad}, {est.provincia} {est.hectareas ? `· ${est.hectareas} HA` : ""}
                                    </p>
                                    {est.referenciaAcceso && (
                                      <p className="text-[10px] text-slate-400 mt-0.5 italic uppercase">
                                        ACCESO: {est.referenciaAcceso}
                                      </p>
                                    )}
                                  </div>
                                  <span
                                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${
                                      isSelected
                                        ? "bg-campo-green border-campo-green text-white"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setUseCustomPuntoEntrega(!useCustomPuntoEntrega)}
                              className={`w-full p-2.5 rounded-xl border-2 text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer uppercase ${
                                useCustomPuntoEntrega
                                  ? "border-campo-green bg-campo-green-50 text-campo-green-950 font-black"
                                  : "border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <LocateFixed className="w-4 h-4 text-campo-green" />
                                <span>DEFINIR OTRA TRANQUERA O COORDENADAS GPS SATELITALES</span>
                              </span>
                              <span className="text-[10px] underline text-campo-green font-black">
                                {useCustomPuntoEntrega ? "OCULTAR COORDENADAS" : "CONFIGURAR GPS"}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Bloque satelital / coordenadas GPS (si no hay establecimientos guardados o si activó custom) */}
                      {(!establishments || establishments.length === 0 || useCustomPuntoEntrega) && (
                        <div className="space-y-3.5 pt-1">
                          {puntosEntrega.map((punto, index) => (
                            <div
                              key={punto.id}
                              className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all ${
                                index === 0
                                  ? "border-campo-green/40 bg-campo-green-50/20"
                                  : "border-slate-200 bg-slate-50/60"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-campo-green text-white text-[10px] font-black">
                                    {index + 1}
                                  </span>
                                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                                    {index === 0 ? "PUNTO DE DESCARGA PRINCIPAL" : `PUNTO DE DESCARGA ALTERNATIVO #${index + 1}`}
                                  </span>
                                </div>
                                {puntosEntrega.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removePuntoEntrega(punto.id)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 p-1 transition-colors uppercase cursor-pointer"
                                    title="ELIMINAR ESTA OPCIÓN"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>QUITAR</span>
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                <div className="sm:col-span-7">
                                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                                    NOMBRE O IDENTIFICACIÓN DEL CAMPO / LOTE *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="EJ. CAMPO LA ESMERALDA - LOTE 3 / TRANQUERA NORTE"
                                    value={punto.nombreLote}
                                    onChange={(e) => updatePuntoEntrega(punto.id, "nombreLote", e.target.value.toUpperCase())}
                                    className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                                  />
                                </div>

                                <div className="sm:col-span-5">
                                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                                    TIPO DE INSTALACIÓN DE DESCARGA
                                  </label>
                                  <select
                                    value={punto.tipoDescarga || "TRANQUERA DE CAMPO"}
                                    onChange={(e) => updatePuntoEntrega(punto.id, "tipoDescarga", e.target.value)}
                                    className="w-full uppercase py-2 px-2.5 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white cursor-pointer"
                                  >
                                    <option value="TRANQUERA DE CAMPO">TRANQUERA DE CAMPO</option>
                                    <option value="GALPÓN / DEPÓSITO DE INSUMOS">GALPÓN / DEPÓSITO DE INSUMOS</option>
                                    <option value="LOTE DIRECTO DE SIEMBRA">LOTE DIRECTO DE SIEMBRA</option>
                                    <option value="ACOPIO / PLANTA DE SILOS">ACOPIO / PLANTA DE SILOS</option>
                                    <option value="OTRA INSTALACIÓN RURAL">OTRA INSTALACIÓN RURAL</option>
                                  </select>
                                </div>

                                <div className="sm:col-span-12">
                                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                                    REFERENCIA DE ACCESO Y TRANQUERA (RUTA / KM / SEÑALIZACIÓN)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="EJ. RUTA 8 KM 224, TRANQUERA BLANCA A 2 KM DEL CRUCE"
                                    value={punto.referenciaAcceso}
                                    onChange={(e) => updatePuntoEntrega(punto.id, "referenciaAcceso", e.target.value.toUpperCase())}
                                    className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                                  />
                                </div>

                                <div className="sm:col-span-12">
                                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                                    COORDENADAS SATELITALES GPS (LATITUD, LONGITUD)
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2 min-w-0">
                                    <input
                                      type="text"
                                      placeholder="EJ. -33.8941, -60.5732 O LINK MAPS"
                                      value={punto.coordenadasGps}
                                      onChange={(e) => updatePuntoEntrega(punto.id, "coordenadasGps", e.target.value)}
                                      className="flex-1 min-w-[160px] py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleCapturarGps(punto.id)}
                                      disabled={gpsLoadingId === punto.id}
                                      title="OBTENER MI UBICACIÓN GPS ACTUAL CON EL DISPOSITIVO"
                                      className="px-3.5 py-2 bg-campo-green hover:bg-campo-green-600 text-white rounded-lg text-xs font-black transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:opacity-50"
                                    >
                                      {gpsLoadingId === punto.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <LocateFixed className="w-3.5 h-3.5" />
                                      )}
                                      <span className="text-[11px]">GPS ACTUAL</span>
                                    </button>
                                    {punto.coordenadasGps && (
                                      <a
                                        href={punto.linkMaps || `https://www.google.com/maps?q=${encodeURIComponent(punto.coordenadasGps)}&t=k`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="VER ESTE LOTE EN GOOGLE MAPS SATELITAL"
                                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0 uppercase"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span className="text-[10px]">SATÉLITE</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {gpsSuccessNotice?.id === punto.id && (
                                <p className="mt-2 text-[10px] font-bold text-campo-green flex items-center gap-1 uppercase">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>{gpsSuccessNotice.msg}</span>
                                </p>
                              )}
                            </div>
                          ))}

                          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={addPuntoEntrega}
                              className="w-full sm:w-auto py-2.5 px-4 rounded-xl border-2 border-dashed border-campo-green hover:border-campo-green-600 bg-campo-green-50/80 hover:bg-campo-green-100 text-campo-green-950 font-black text-xs transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
                            >
                              <Plus className="w-4 h-4 text-campo-green" />
                              <span>+ AGREGAR OTRA OPCIÓN DE ENTREGA SATELITAL</span>
                            </button>
                            <span className="text-[11px] text-slate-500 font-medium text-center sm:text-right">
                              * Podés registrar varias tranqueras o campos para repartir la descarga.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 4. FORMA DE PAGO DE LA OPERACIÓN (EXCLUSIVO CLIENTE REGISTRADO) */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-campo-green/40 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 text-slate-900">
                          <div className="w-8 h-8 rounded-lg bg-campo-green text-white flex items-center justify-center shrink-0 shadow-xs">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black uppercase text-slate-900 leading-tight">
                              FORMA DE PAGO DE LA OPERACIÓN *
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              SELECCIONÁ CÓMO PREFERÍS CANCELAR O PACTAR ESTA COTIZACIÓN
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-campo-green-50 text-campo-green-800 text-[10px] font-black tracking-wider uppercase self-start sm:self-auto border border-campo-green-200">
                          CONDICIÓN DE PAGO
                        </span>
                      </div>

                      {/* Grilla con las 5 Opciones Requeridas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {PAYMENT_METHODS.map((method) => {
                          const isSelected = formaPago === method.id;
                          const IconComp = method.icon;
                          return (
                            <button
                              type="button"
                              key={method.id}
                              onClick={() => {
                                setFormaPago(method.id);
                                setFormError(null);
                              }}
                              className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                                isSelected
                                  ? "border-campo-green bg-campo-green-50/70 text-slate-900 shadow-xs ring-2 ring-campo-green/20"
                                  : "border-slate-200 bg-white hover:border-campo-green/40 hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? "bg-campo-green text-white shadow-xs"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <IconComp className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-black uppercase text-slate-900 leading-tight">
                                    {method.number}. {method.label}
                                  </span>
                                  <span
                                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                                      isSelected
                                        ? "bg-campo-green border-campo-green text-white"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase">
                                  {method.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Campo adicional cuando se selecciona "Otra (especificar)" */}
                      {formaPago === "Otra (especificar)" && (
                        <div className="p-3.5 bg-amber-50/70 rounded-xl border-2 border-amber-300 space-y-2 animate-fadeIn">
                          <label className="block text-[11px] font-black uppercase text-amber-950">
                            ESPECIFICÁ LA CONDICIÓN O FORMA DE PAGO PARTICULAR *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="EJ. 30 DÍAS CON VALORES / 50% ANTICIPO Y SALDO A COSECHA / OTRA..."
                            value={formaPagoOtra}
                            onChange={(e) => setFormaPagoOtra(e.target.value.toUpperCase())}
                            className="w-full uppercase py-2 px-3 rounded-lg border-2 border-amber-400 text-xs font-bold focus:border-campo-green focus:outline-none bg-white text-slate-900 shadow-xs"
                          />
                          <p className="text-[10px] text-amber-800 font-medium">
                            * Indicanos plazos, instrumentos o convenios especiales para que nuestro equipo comercial lo evalúe.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Observaciones Generales */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                        OBSERVACIONES ADICIONALES PARA LA COTIZACIÓN (OPCIONAL)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="DETALLES DE ENTREGA, PLAZOS O CONDICIONES PARTICULARES..."
                        value={formNuevo.observaciones}
                        onChange={(e) =>
                          setFormNuevo((prev) => ({
                            ...prev,
                            observaciones: e.target.value.toUpperCase(),
                          }))
                        }
                        className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                )
              ) : clientTab === "NUEVO" ? (
                /* ========================================================================= */
                /* CASO 2: CLIENTE NUEVO (REGISTRO - SIN FORMA DE PAGO NI TRANQUERAS)        */
                /* ========================================================================= */
                <div className="bg-[#f0f8f2] p-4 sm:p-6 rounded-2xl border-2 border-campo-green/20 space-y-4 shadow-xs">
                  <div className="bg-campo-green-100/90 p-3 rounded-xl border border-campo-green-300/80 text-campo-green-950 text-xs font-black flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-campo-green shrink-0" />
                    <span>FORMULARIO DE REGISTRO: TODOS LOS CAMPOS DEBEN COMPLETARSE EN MAYÚSCULAS</span>
                  </div>

                  {/* Botón destacado 1 Clic con Google */}
                  <div className="bg-white p-3 sm:p-4 rounded-xl border border-emerald-300/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-black text-slate-900 uppercase">
                        ¿Querés ahorrar tiempo?
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Vinculá tu cuenta de Gmail para autocompletar tus datos al instante
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGoogleAuth("REGISTER")}
                      disabled={isGoogleLoading}
                      className="w-full sm:w-auto py-2 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs hover:border-campo-green shrink-0 uppercase disabled:opacity-50 cursor-pointer"
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-campo-green" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      )}
                      <span>
                        {isGoogleLoading
                          ? "CONECTANDO..."
                          : "COMPLETAR CON MI CUENTA GOOGLE"}
                      </span>
                    </button>
                  </div>

                  {/* 1. Apellido/s y 2. Nombres */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                          APELLIDO/S *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="APELLIDOS"
                          value={formNuevo.apellidos}
                          onChange={handleApellidosChange}
                          className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                          NOMBRES/S *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="NOMBRES"
                          value={formNuevo.nombres}
                          onChange={handleNombresChange}
                          className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Fecha Nacimiento & 4. DNI */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                          FECHA NACIMIENTO (DD/MM/AAAA) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="DD/MM/AAAA"
                          maxLength={10}
                          value={formNuevo.fechaNacimiento}
                          onChange={handleFechaNacimientoChange}
                          className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                          DNI *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="NÚMERO DE DOCUMENTO"
                          value={formNuevo.dni}
                          onChange={(e) =>
                            setFormNuevo((prev) => ({
                              ...prev,
                              dni: e.target.value.replace(/\D/g, "").slice(0, 9),
                            }))
                          }
                          className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. WhatsApp & 6. Correo Electrónico */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                          WHATSAPP (CÓDIGO PAÍS Y NÚMERO) *
                        </label>
                        <div className="flex gap-2 min-w-0">
                          <select
                            value={formNuevo.whatsappCountryCode}
                            onChange={(e) =>
                              setFormNuevo((prev) => ({
                                ...prev,
                                whatsappCountryCode: e.target.value,
                              }))
                            }
                            className="w-24 sm:w-28 py-2 px-2 rounded-lg border border-slate-300 text-xs font-bold bg-slate-50 focus:outline-none focus:border-campo-green shrink-0 cursor-pointer"
                          >
                            {COUNTRY_PHONE_CODES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.flag} {c.code} ({c.name.toUpperCase()})
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            required
                            placeholder="EJ. 358 5095475"
                            value={formNuevo.whatsappNumber}
                            onChange={(e) =>
                              setFormNuevo((prev) => ({
                                ...prev,
                                whatsappNumber: e.target.value.replace(/[^0-9 ]/g, ""),
                              }))
                            }
                            className="flex-1 min-w-0 py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                          CORREO ELECTRÓNICO *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="EJEMPLO@CORREO.COM"
                          value={formNuevo.email}
                          onChange={(e) =>
                            setFormNuevo((prev) => ({
                              ...prev,
                              email: e.target.value.toUpperCase(),
                            }))
                          }
                          className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 7. Provincia, Localidad y Código Postal */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                          PROVINCIA (DESPLEGABLE) *
                        </label>
                        <select
                          value={formNuevo.provincia}
                          onChange={(e) => {
                            const newProv = e.target.value.toUpperCase();
                            setIsCustomLocalidad(false);
                            setFormNuevo((prev) => ({
                              ...prev,
                              provincia: newProv,
                              localidad: "",
                            }));
                          }}
                          className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-campo-green cursor-pointer"
                        >
                          {ARGENTINE_PROVINCES.map((prov) => (
                            <option key={prov} value={prov}>
                              {prov}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                          LOCALIDAD (DESPLEGABLE) *
                        </label>
                        <select
                          required
                          value={isCustomLocalidad ? "OTRA" : formNuevo.localidad}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "OTRA") {
                              setIsCustomLocalidad(true);
                              setFormNuevo((prev) => ({ ...prev, localidad: "" }));
                            } else {
                              setIsCustomLocalidad(false);
                              setFormNuevo((prev) => ({ ...prev, localidad: val }));
                            }
                          }}
                          className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-campo-green cursor-pointer"
                        >
                          <option value="">-- SELECCIONÁ TU LOCALIDAD ({currentLocalities.length}) --</option>
                          {currentLocalities.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                          <option value="OTRA">OTRA LOCALIDAD (ESCRIBIR MANUALMENTE)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                          CÓDIGO POSTAL (CP) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="EJ. 2700 / X5800"
                          value={formNuevo.codigoPostal}
                          onChange={(e) =>
                            setFormNuevo((prev) => ({
                              ...prev,
                              codigoPostal: e.target.value.toUpperCase(),
                            }))
                          }
                          className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-campo-green"
                        />
                      </div>

                      {isCustomLocalidad && (
                        <div className="sm:col-span-12">
                          <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                            ESCRIBÍ TU LOCALIDAD, PARAJE O COLONIA *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="ESCRIBÍ EL NOMBRE DE TU LOCALIDAD"
                            value={formNuevo.localidad}
                            onChange={(e) =>
                              setFormNuevo((prev) => ({
                                ...prev,
                                localidad: e.target.value.toUpperCase(),
                              }))
                            }
                            className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-campo-green"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 9. CUIT y 10. Razón Social con AFIP y BCRA */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-black uppercase text-slate-700">
                            CUIT EMPRESA O PERSONA FÍSICA *
                          </label>
                          {isAfipLoading && (
                            <span className="inline-flex items-center text-[10px] text-campo-green font-bold gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              VALIDANDO AFIP / BCRA...
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="XX-XXXXXXXX-X"
                          value={formNuevo.cuit}
                          onChange={handleCuitChange}
                          className={`w-full uppercase py-2 px-3 rounded-lg border text-xs font-semibold focus:outline-none transition-colors ${
                            afipErrorMessage
                              ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-500"
                              : afipSuccessMessage
                              ? "border-campo-green bg-campo-green-50/20 text-slate-900 focus:border-campo-green"
                              : "border-slate-300 focus:border-campo-green bg-white"
                          }`}
                        />
                        <div className="mt-1.5 flex items-center justify-between">
                          <a
                            href="https://seti.afip.gob.ar/padron-puc-constancia-internet/ConsultaConstanciaAction.do"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-campo-green hover:underline"
                          >
                            <span>Consultar Constancia Oficial en AFIP (ARCA)</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-black uppercase text-slate-700">
                            NOMBRE O RAZÓN SOCIAL A FACTURAR *
                          </label>
                          {isRazonSocialAuto && (
                            <span className="text-[9px] font-bold text-campo-green bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              PROCESO AUTOMÁTICO
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="APELLIDO Y NOMBRE O RAZÓN SOCIAL A FACTURAR"
                          value={formNuevo.razonSocial}
                          onChange={(e) => {
                            setIsRazonSocialAuto(false);
                            setFormNuevo((prev) => ({
                              ...prev,
                              razonSocial: e.target.value.toUpperCase(),
                            }));
                          }}
                          className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold bg-slate-50 focus:bg-white focus:border-campo-green focus:outline-none"
                        />
                      </div>
                    </div>

                    {afipSuccessMessage && (
                      <p className="mt-2 text-[10px] font-bold text-campo-green flex items-center gap-1.5 break-words">
                        <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />
                        <span className="flex-1 break-words">{afipSuccessMessage}</span>
                      </p>
                    )}

                    {afipErrorMessage && (
                      <p className="mt-2 text-[10px] font-bold text-red-600 flex items-center gap-1.5 break-words">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1 break-words">{afipErrorMessage}</span>
                      </p>
                    )}
                  </div>

                  {/* 11. Horario de Contacto */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <label className="block text-[11px] font-black uppercase text-slate-700 mb-2">
                      HORARIO DE CONTACTO PREFERIDO (LISTA CON TILDES)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {HORARIOS_PREFERIDOS.map((horario) => {
                        const isChecked = formNuevo.horariosPreferidos.includes(horario);
                        return (
                          <button
                            type="button"
                            key={horario}
                            onClick={() => toggleHorario(horario)}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border text-left text-xs transition-colors uppercase cursor-pointer ${
                              isChecked
                                ? "border-campo-green bg-campo-green-50 text-campo-green-950 font-bold"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center border ${
                                isChecked
                                  ? "bg-campo-green border-campo-green text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <span className="text-[11px]">{horario}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 12. Observaciones */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                      OBSERVACIONES (OPCIONAL)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="DETALLES DE ENTREGA, PLAZOS O CONDICIONES PARTICULARES..."
                      value={formNuevo.observaciones}
                      onChange={(e) =>
                        setFormNuevo((prev) => ({
                          ...prev,
                          observaciones: e.target.value.toUpperCase(),
                        }))
                      }
                      className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                    />
                  </div>

                  {/* 13. Usuario y 14. Contraseña */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-slate-700">
                        DEFINÍ TU USUARIO Y CONTRASEÑA PARA TU CUENTA
                      </span>
                      <button
                        type="button"
                        onClick={() => handleGoogleAuth("REGISTER")}
                        disabled={isGoogleLoading}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-campo-green hover:underline uppercase disabled:opacity-50 cursor-pointer"
                      >
                        {isGoogleLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-campo-green" />
                        ) : (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                        )}
                        <span>
                          {isGoogleLoading
                            ? "VINCULANDO..."
                            : "VINCULAR CON CUENTA DE GOOGLE"}
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="USUARIO (EMAIL / CUIT)"
                          value={formNuevo.usuario}
                          onChange={(e) =>
                            setFormNuevo((prev) => ({
                              ...prev,
                              usuario: e.target.value.toUpperCase(),
                            }))
                          }
                          className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="CONTRASEÑA"
                          value={formNuevo.password}
                          onChange={(e) =>
                            setFormNuevo((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                          className="w-full py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleRegisterAndContinue}
                        className="w-full py-3.5 px-4 rounded-xl bg-campo-green hover:bg-campo-green-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-campo-green/20 uppercase cursor-pointer"
                      >
                        <span>CREAR CUENTA Y CONTINUAR A LA COTIZACIÓN</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================================= */
                /* CASO 3: ACCESO CLIENTE REGISTRADO (LOGIN - SIN FORMA DE PAGO NI DESTINO)  */
                /* ========================================================================= */
                <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-campo-green/30 shadow-xs space-y-4">
                  <div className="p-3 bg-emerald-50 border border-campo-green/30 rounded-xl text-emerald-950 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-campo-green shrink-0" />
                    <span>INGRESÁ CON TU USUARIO/CUIT Y CONTRASEÑA PARA CONFIRMAR TU COTIZACIÓN</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      CUIT O CORREO ELECTRÓNICO *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="INGRESE SU CUIT O EMAIL"
                      value={formRegistrado.identifier}
                      onChange={(e) =>
                        setFormRegistrado((prev) => ({
                          ...prev,
                          identifier: e.target.value.toUpperCase(),
                        }))
                      }
                      className="w-full uppercase py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-campo-green focus:ring-2 focus:ring-campo-green/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      CONTRASEÑA *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={formRegistrado.password}
                      onChange={(e) =>
                        setFormRegistrado((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-campo-green focus:ring-2 focus:ring-campo-green/20 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 space-y-2.5">
                    <button
                      type="button"
                      onClick={handleLoginAndContinue}
                      className="w-full py-3.5 px-4 rounded-xl bg-campo-green hover:bg-campo-green-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-campo-green/20 uppercase cursor-pointer"
                    >
                      <span>INGRESAR A MI CUENTA Y CONTINUAR</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGoogleAuth("LOGIN")}
                      disabled={isGoogleLoading}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs uppercase disabled:opacity-50 cursor-pointer"
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-campo-green" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      )}
                      <span>
                        {isGoogleLoading
                          ? "CONECTANDO CON GOOGLE..."
                          : "INICIAR SESIÓN CON GOOGLE"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pie Fijo con Botones Contextuales (SIEMPRE VISIBLE EN PANTALLA) */}
            <div className="shrink-0 p-3.5 sm:p-4 border-t-2 border-campo-green/30 bg-[#f0f8f2] shadow-lg space-y-2">
              {formError && (
                <div className="text-center text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>← VOLVER (ESC)</span>
                </button>

                {/* BOTÓN CONTEXTUAL SEGÚN EL NIVEL Y ESTADO DEL USUARIO */}
                {user ? (
                  clientTab === "NUEVO" ? (
                    <button
                      type="button"
                      onClick={() => setClientTab("REGISTRADO")}
                      className="flex-1 w-full py-3.5 px-6 rounded-xl bg-campo-green hover:bg-campo-green-600 text-white font-black text-sm transition-all shadow-lg shadow-campo-green/20 flex items-center justify-center gap-2 uppercase cursor-pointer"
                    >
                      <span>CONTINUAR A LA COTIZACIÓN CON MI SESIÓN ACTUAL</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuotation}
                      disabled={isSubmitting}
                      className="flex-1 w-full py-3.5 px-6 rounded-xl bg-campo-green hover:bg-campo-green-600 text-white font-black text-sm transition-all shadow-lg shadow-campo-green/20 flex items-center justify-center gap-2 uppercase cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>PROCESANDO Y ENVIANDO COTIZACIÓN...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>CONFIRMAR Y ENVIAR COTIZACIÓN OFICIAL</span>
                        </>
                      )}
                    </button>
                  )
                ) : clientTab === "NUEVO" ? (
                  <button
                    type="button"
                    onClick={handleRegisterAndContinue}
                    className="flex-1 w-full py-3.5 px-6 rounded-xl bg-campo-green hover:bg-campo-green-600 text-white font-black text-sm transition-all shadow-lg shadow-campo-green/20 flex items-center justify-center gap-2 uppercase cursor-pointer"
                  >
                    <span>CREAR CUENTA Y CONTINUAR A LA COTIZACIÓN</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLoginAndContinue}
                    className="flex-1 w-full py-3.5 px-6 rounded-xl bg-campo-green hover:bg-campo-green-600 text-white font-black text-sm transition-all shadow-lg shadow-campo-green/20 flex items-center justify-center gap-2 uppercase cursor-pointer"
                  >
                    <span>INGRESAR A MI CUENTA Y CONTINUAR</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-center text-[10px] text-slate-400 uppercase">
                {user && clientTab === "REGISTRADO"
                  ? "LA COTIZACIÓN SERÁ PROCESADA EXCLUSIVAMENTE POR NUESTRO DEPARTAMENTO COMERCIAL."
                  : "EL ACCESO REGISTRADO O NUEVO PERMITE DEFINIR EL DESTINO DE ENTREGA Y FORMA DE PAGO."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO EXCLUSIVO */}
      {isSuccessModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSuccessModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            className="bg-white max-w-md w-full rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-campo-green-100 text-campo-green flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Tu cotización fue enviada con éxito
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Hemos recibido tu solicitud de cotización. Nuestro equipo comercial se comunicará a la brevedad en el horario de contacto seleccionado.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-campo-green text-white font-bold text-sm transition-colors shadow-md uppercase cursor-pointer"
              >
                Aceptar (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
