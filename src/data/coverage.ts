export interface CoverageRegion {
  name: string;
  scopeDescription: string;
  status: "active" | "planned";
}

export const coverageConfig = {
  title: "Cobertura Geográfica",
  subtitle:
    "Estructura logística y de atención comercial preparada para coordinar entregas y asesoramiento en zonas estratégicas de Argentina.",
  // NOTA: No se inventan localidades ni provincias según la directiva del proyecto.
  // Los datos específicos serán incorporados cuando el usuario los proporcione.
  pendingDataNotice:
    "El mapa y listado de localidades y provincias se actualizarán con los datos operativos específicos suministrados por Campo Directo.",
  regions: [] as CoverageRegion[],
};
