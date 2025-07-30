// pages/dashboard/diagnostico/profundo.tsx
import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../../contexts/AuthContext";
import PrivateLayout from "../../../components/layout/PrivateLayout";
import "animate.css"; // Asegúrate de que animate.css esté importado
import {
  XCircleIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon, // Datos Generales
  QuestionMarkCircleIcon, // Problemática
  BuildingOfficeIcon, // Dirección General y Planeación
  BanknotesIcon, // Finanzas y Administración
  CubeTransparentIcon, // Operaciones / Prestación del Servicio
  MegaphoneIcon, // Marketing y Ventas
  UsersIcon, // Recursos Humanos
  TruckIcon, // Logística y Cadena de Suministro
  LightBulbIcon, // Eje de Habilidades del Empresario
  RocketLaunchIcon, // Eje de Cultura de Innovación
  ChartBarIcon, // Eje de Retos y Aspiraciones del Empresario
} from "@heroicons/react/24/solid";

// Interfaz para los datos del formulario de Diagnóstico Profundo
interface DiagnosticoProfundoData {
  userId: string;
  nombreSolicitante: string;
  puestoSolicitante: string;
  nombreEmpresa: string;
  rfcEmpresa: string;
  giroIndustria: string;
  numeroEmpleados: string;
  antiguedadEmpresa: string;
  ubicacion: string;
  telefonoContacto: string;
  correoElectronico: string;
  sitioWebRedes: string;
  // Problemática
  areaMayorProblema: string;
  problematicaEspecifica: string;
  principalPrioridad: string;
  // Área 1: Dirección General y Planeación
  dg_misionVisionValores: "1" | "2" | "3" | "4" | "5" | "";
  dg_objetivosClaros: "1" | "2" | "3" | "4" | "5" | "";
  dg_planEstrategicoDocumentado: "1" | "2" | "3" | "4" | "5" | "";
  dg_revisionAvancePlan: "1" | "2" | "3" | "4" | "5" | "";
  dg_factoresExternos: "1" | "2" | "3" | "4" | "5" | "";
  dg_impideCumplirMetas: string;
  dg_capacidadAdaptacion: "1" | "2" | "3" | "4" | "5" | "";
  dg_comoSeTomanDecisiones: string;
  dg_colaboradoresParticipan: "1" | "2" | "3" | "4" | "5" | "";
  dg_porQueNoParticipan: string;
  // Área 2: Finanzas y Administración
  fa_margenGanancia: "1" | "2" | "3" | "4" | "5" | "";
  fa_estadosFinancierosActualizados: "1" | "2" | "3" | "4" | "5" | "";
  fa_presupuestosAnuales: "1" | "2" | "3" | "4" | "5" | "";
  fa_liquidezCubreObligaciones: "1" | "2" | "3" | "4" | "5" | "";
  fa_gastosControlados: "1" | "2" | "3" | "4" | "5" | "";
  fa_causaProblemasFinancieros: string;
  fa_indicadoresFinancieros: "1" | "2" | "3" | "4" | "5" | "";
  fa_analizanEstadosFinancieros: "1" | "2" | "3" | "4" | "5" | "";
  fa_porQueNoSeAnalizan: string;
  fa_herramientasSoftwareFinanciero: "1" | "2" | "3" | "4" | "5" | "";
  fa_situacionFinancieraGeneral: "1" | "2" | "3" | "4" | "5" | ""; // Special Likert
  // Área 3: Operaciones / Prestación del Servicio
  op_capacidadProductivaCubreDemanda: "1" | "2" | "3" | "4" | "5" | "";
  op_porQueNoCubreDemanda: string;
  op_procesosDocumentados: "1" | "2" | "3" | "4" | "5" | "";
  op_estandaresCalidadCumplen: "1" | "2" | "3" | "4" | "5" | "";
  op_controlesErrores: "1" | "2" | "3" | "4" | "5" | "";
  op_tiemposEntregaCumplen: "1" | "2" | "3" | "4" | "5" | "";
  op_porQueNoCumplen: string;
  op_eficienciaProcesosOptima: "1" | "2" | "3" | "4" | "5" | "";
  op_personalConoceProcedimientos: "1" | "2" | "3" | "4" | "5" | "";
  op_porQueNoConocen: string;
  op_indicadoresOperativos: "1" | "2" | "3" | "4" | "5" | "";
  // Área 4: Marketing y Ventas
  mv_clienteIdealNecesidades: "1" | "2" | "3" | "4" | "5" | "";
  mv_planEstrategiasMarketing: "1" | "2" | "3" | "4" | "5" | "";
  mv_impactoCanalesVenta: string;
  mv_canalesVentaActuales: string;
  mv_marcaReconocida: "1" | "2" | "3" | "4" | "5" | "";
  mv_estudiosSatisfaccionCliente: "1" | "2" | "3" | "4" | "5" | "";
  mv_porQueNoHaceEstudios: string;
  mv_indicadoresDesempenoComercial: "1" | "2" | "3" | "4" | "5" | "";
  mv_equipoVentasCapacitado: "1" | "2" | "3" | "4" | "5" | "";
  mv_politicasDescuentosPromociones: "1" | "2" | "3" | "4" | "5" | "";
  // Área 5: Recursos Humanos
  rh_organigramaFuncionesClaras: "1" | "2" | "3" | "4" | "5" | "";
  rh_personalCapacitado: "1" | "2" | "3" | "4" | "5" | "";
  rh_climaLaboralFavoreceProductividad: "1" | "2" | "3" | "4" | "5" | "";
  rh_programasMotivacion: "1" | "2" | "3" | "4" | "5" | "";
  rh_causaClimaLaboralComplejo: string;
  rh_evaluacionesDesempeno: "1" | "2" | "3" | "4" | "5" | "";
  rh_indicadoresRotacionPersonal: "1" | "2" | "3" | "4" | "5" | "";
  rh_liderazgoJefesIntermedios: "1" | "2" | "3" | "4" | "5" | "";
  rh_cuantasPersonasTrabajan: string;
  // Área 6: Logística y Cadena de Suministro
  lcs_proveedoresCumplen: "1" | "2" | "3" | "4" | "5" | "";
  lcs_entregasClientesPuntuales: "1" | "2" | "3" | "4" | "5" | "";
  lcs_costosLogisticosCompetitivos: "1" | "2" | "3" | "4" | "5" | "";
  lcs_problemasLogisticosPunto: string;
  lcs_poderNegociacionProveedores: "1" | "2" | "3" | "4" | "5" | "";
  lcs_indicadoresLogisticos: "1" | "2" | "3" | "4" | "5" | "";
  // Área 7: Eje de Habilidades del Empresario
  he_liderInspiraEquipo: "1" | "2" | "3" | "4" | "5" | "";
  he_tomaDecisionesDatos: "1" | "2" | "3" | "4" | "5" | "";
  he_resilienteDificultades: "1" | "2" | "3" | "4" | "5" | "";
  he_invierteDesarrolloPropio: "1" | "2" | "3" | "4" | "5" | "";
  he_porQueNoInvierte: string;
  he_visionNegocioClara: "1" | "2" | "3" | "4" | "5" | "";
  he_apoyoAsesoresMentores: "1" | "2" | "3" | "4" | "5" | "";
  // Área 8: Eje de Cultura de Innovación
  ci_mejoranProductosServicios: "1" | "2" | "3" | "4" | "5" | "";
  ci_recogeImplementaIdeasPersonal: "1" | "2" | "3" | "4" | "5" | "";
  ci_invierteTecnologiaInnovacion: "1" | "2" | "3" | "4" | "5" | "";
  ci_dispuestoAsumirRiesgos: "1" | "2" | "3" | "4" | "5" | "";
  ci_porQueNoInnova: string;
  ci_protegePropiedadIntelectual: "1" | "2" | "3" | "4" | "5" | "";
  ci_fomentaCulturaCambio: "1" | "2" | "3" | "4" | "5" | "";
  // Área 9: Eje de Retos y Aspiraciones del Empresario
  ra_mayorReto: string;
  ra_queMotiva: string;
  ra_cambiosPersonalesNecesarios: string;
  ra_lograrEn5Anos: string;
  ra_queEnorgullece: string;
  ra_quePreocupa: string;
  ra_principalProblematica: string;
  ra_habilidadesFortalecer: string;
  ra_tanSatisfechoRolActual: "1" | "2" | "3" | "4" | "5" | "";
  ra_referenteParaEquipo: "1" | "2" | "3" | "4" | "5" | "";
  ra_situacionFinancieraGeneral: "1" | "2" | "3" | "4" | "5" | ""; // Special Likert, repeated
  createdAt: string;
}

// Interfaz para el resultado del análisis del LLM (IA) para Diagnóstico Profundo
interface LLMAnalysisResult {
  resumen_ejecutivo_profundo: string;
  causas_raiz_identificadas: string[];
  fortalezas_clave: string[];
  oportunidades_crecimiento: string[];
  recomendaciones_estrategicas_por_area: {
    direccion_general_planeacion?: string[];
    finanzas_administracion?: string[];
    operaciones_prestacion_servicio?: string[];
    marketing_ventas?: string[];
    recursos_humanos?: string[];
    logistica_cadena_suministro?: string[];
    habilidades_empresario?: string[];
    cultura_innovacion?: string[];
    retos_aspiraciones?: string[];
  };
  puntuacion_madurez_promedio: number;
  nivel_madurez_general_profundo: "muy_bajo" | "bajo" | "medio" | "alto" | "muy_alto";
  plan_de_accion_sugerido: string[];
}

// Componente del Loader de Uiverse.io
const UiverseLoader = () => (
  <>
    <style jsx>{`
      /* CSS for the Uiverse.io Boxes Loader */
      .boxes {
        --size: 32px;
        --duration: 800ms;
        height: var(--size);
        width: calc(var(--size) * 4);
        position: relative;
        transform-style: preserve-3d;
        transform-origin: 50% 50%;
        transform: rotateX(60deg) rotateZ(45deg) rotateY(0deg) translateZ(0px);
      }

      .boxes .box {
        width: var(--size);
        height: var(--size);
        top: 0;
        left: 0;
        position: absolute;
        transform-style: preserve-3d;
      }

      .boxes .box:nth-child(1) {
        transform: translate(100%, 0);
        animation: box1 var(--duration) linear infinite;
      }

      .boxes .box:nth-child(2) {
        transform: translate(0, 100%);
        animation: box2 var(--duration) linear infinite;
      }

      .boxes .box:nth-child(3) {
        transform: translate(100%, 100%);
        animation: box3 var(--duration) linear infinite;
      }

      .boxes .box:nth-child(4) {
        transform: translate(200%, 0);
        animation: box4 var(--duration) linear infinite;
      }

      .boxes .box > div {
        --background: #6366F1; /* Tailwind indigo-500 for deep theme */
        --top: auto;
        --right: auto;
        --bottom: auto;
        --left: auto;
        --translateZ: calc(var(--size) / 2);
        --rotateY: 0deg;
        --rotateX: 0deg;
        position: absolute;
        width: 100%;
        height: 100%;
        background: var(--background);
        top: var(--top);
        right: var(--right);
        bottom: var(--bottom);
        left: var(--left);
        transform: rotateY(var(--rotateY)) rotateX(var(--rotateX)) translateZ(var(--translateZ));
      }

      .boxes .box > div:nth-child(1) {
        --top: 0;
        --left: 0;
        --translateZ: calc(var(--size) / 2);
      }

      .boxes .box > div:nth-child(2) {
        --background: #4F46E5; /* Tailwind indigo-600 */
        --right: 0;
        --rotateY: 90deg;
        --translateZ: calc(var(--size) / 2);
      }

      .boxes .box > div:nth-child(3) {
        --background: #4338CA; /* Tailwind indigo-700 */
        --bottom: 0;
        --rotateX: 90deg;
        --translateZ: calc(var(--size) / 2);
      }

      .boxes .box > div:nth-child(4) {
        --background: #3730A3; /* Tailwind indigo-800 */
        --left: 0;
        --rotateY: -90deg;
        --translateZ: calc(var(--size) / 2);
      }

      .boxes .box > div:nth-child(5) {
        --background: #312E81; /* Tailwind indigo-900 */
        --top: 0;
        --left: 0;
        --translateZ: calc(var(--size) / -2);
      }

      .boxes .box > div:nth-child(6) {
        --background: #EEF2FF; /* Tailwind indigo-50 */
        --top: 0;
        --left: 0;
        --rotateX: -90deg;
        --translateZ: calc(var(--size) / 2);
      }

      @keyframes box1 {
        0%,
        50% {
          transform: translate(100%, 0);
        }

        100% {
          transform: translate(200%, 0);
        }
      }

      @keyframes box2 {
        0%{
          transform: translate(0, 100%);
        }

        50% {
          transform: translate(0, 0);
        }

        100% {
          transform: translate(100%, 0);
        }
      }

      @keyframes box3 {
        0%,
        50% {
          transform: translate(100%, 100%);
        }

        100% {
          transform: translate(0, 100%);
        }
      }

      @keyframes box4 {
        0%{
          transform: translate(200%, 0);
        }

        50% {
          transform: translate(200%, 100%);
        }

        100% {
          transform: translate(100%, 100%);
        }
      }
    `}</style>
    <div className="boxes">
      <div className="box">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="box">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="box">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="box">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </>
);

const DiagnosticoProfundo = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Estado inicial del formulario
  const initialData: DiagnosticoProfundoData = {
    userId: user?.uid || "",
    nombreSolicitante: "",
    puestoSolicitante: "",
    nombreEmpresa: "",
    rfcEmpresa: "",
    giroIndustria: "",
    numeroEmpleados: "",
    antiguedadEmpresa: "",
    ubicacion: "",
    telefonoContacto: "",
    correoElectronico: "",
    sitioWebRedes: "",
    areaMayorProblema: "",
    problematicaEspecifica: "",
    principalPrioridad: "",
    dg_misionVisionValores: "",
    dg_objetivosClaros: "",
    dg_planEstrategicoDocumentado: "",
    dg_revisionAvancePlan: "",
    dg_factoresExternos: "",
    dg_impideCumplirMetas: "",
    dg_capacidadAdaptacion: "",
    dg_comoSeTomanDecisiones: "",
    dg_colaboradoresParticipan: "",
    dg_porQueNoParticipan: "",
    fa_margenGanancia: "",
    fa_estadosFinancierosActualizados: "",
    fa_presupuestosAnuales: "",
    fa_liquidezCubreObligaciones: "",
    fa_gastosControlados: "",
    fa_causaProblemasFinancieros: "",
    fa_indicadoresFinancieros: "",
    fa_analizanEstadosFinancieros: "",
    fa_porQueNoSeAnalizan: "",
    fa_herramientasSoftwareFinanciero: "",
    fa_situacionFinancieraGeneral: "",
    op_capacidadProductivaCubreDemanda: "",
    op_porQueNoCubreDemanda: "",
    op_procesosDocumentados: "",
    op_estandaresCalidadCumplen: "",
    op_controlesErrores: "",
    op_tiemposEntregaCumplen: "",
    op_porQueNoCumplen: "",
    op_eficienciaProcesosOptima: "",
    op_personalConoceProcedimientos: "",
    op_porQueNoConocen: "",
    op_indicadoresOperativos: "",
    mv_clienteIdealNecesidades: "",
    mv_planEstrategiasMarketing: "",
    mv_impactoCanalesVenta: "",
    mv_canalesVentaActuales: "",
    mv_marcaReconocida: "",
    mv_estudiosSatisfaccionCliente: "",
    mv_porQueNoHaceEstudios: "",
    mv_indicadoresDesempenoComercial: "",
    mv_equipoVentasCapacitado: "",
    mv_politicasDescuentosPromociones: "",
    rh_organigramaFuncionesClaras: "",
    rh_personalCapacitado: "",
    rh_climaLaboralFavoreceProductividad: "",
    rh_programasMotivacion: "",
    rh_causaClimaLaboralComplejo: "",
    rh_evaluacionesDesempeno: "",
    rh_indicadoresRotacionPersonal: "",
    rh_liderazgoJefesIntermedios: "",
    rh_cuantasPersonasTrabajan: "",
    lcs_proveedoresCumplen: "",
    lcs_entregasClientesPuntuales: "",
    lcs_costosLogisticosCompetitivos: "",
    lcs_problemasLogisticosPunto: "",
    lcs_poderNegociacionProveedores: "",
    lcs_indicadoresLogisticos: "",
    he_liderInspiraEquipo: "",
    he_tomaDecisionesDatos: "",
    he_resilienteDificultades: "",
    he_invierteDesarrolloPropio: "",
    he_porQueNoInvierte: "",
    he_visionNegocioClara: "",
    he_apoyoAsesoresMentores: "",
    ci_mejoranProductosServicios: "",
    ci_recogeImplementaIdeasPersonal: "",
    ci_invierteTecnologiaInnovacion: "",
    ci_dispuestoAsumirRiesgos: "",
    ci_porQueNoInnova: "",
    ci_protegePropiedadIntelectual: "",
    ci_fomentaCulturaCambio: "",
    ra_mayorReto: "",
    ra_queMotiva: "",
    ra_cambiosPersonalesNecesarios: "",
    ra_lograrEn5Anos: "",
    ra_queEnorgullece: "",
    ra_quePreocupa: "",
    ra_principalProblematica: "",
    ra_habilidadesFortalecer: "",
    ra_tanSatisfechoRolActual: "",
    ra_referenteParaEquipo: "",
    ra_situacionFinancieraGeneral: "",
    createdAt: new Date().toISOString(),
  };

  const [datos, setDatos] = useState<DiagnosticoProfundoData>(initialData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState<{ error?: string; success?: string }>(
    {}
  );
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>(
    {
      bloqueDatosGenerales: true, // Expandir el primer bloque por defecto
      bloqueProblematicas: false,
      bloqueDireccionGeneralPlaneacion: false,
      bloqueFinanzasAdministracion: false,
      bloqueOperacionesServicio: false,
      bloqueMarketingVentas: false,
      bloqueRecursosHumanos: false,
      bloqueLogisticaCadenaSuministro: false,
      bloqueHabilidadesEmpresario: false,
      bloqueCulturaInnovacion: false,
      bloqueRetosAspiraciones: false,
    }
  );
  const [analisis, setAnalisis] = useState<LLMAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Asegurar que userId se actualice si el usuario cambia
  useEffect(() => {
    if (user?.uid && datos.userId === "") {
      setDatos((prev) => ({ ...prev, userId: user.uid }));
    }
  }, [user, datos.userId]);

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (mensaje.error || mensaje.success) {
      const timer = setTimeout(() => setMensaje({}), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // Función para expandir/colapsar bloques del formulario
  const toggleBlock = (blockName: string) =>
    setExpandedBlocks((prev) => ({ ...prev, [blockName]: !prev[blockName] }));

  // Manejar cambios en los inputs del formulario
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDatos((prev) => ({ ...prev, [name]: value } as DiagnosticoProfundoData));
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  // Validar el formulario antes de enviar
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Área 0: Formato Básico del Empresario - Datos Generales
    if (!datos.nombreSolicitante) errors.nombreSolicitante = "Requerido";
    if (!datos.puestoSolicitante) errors.puestoSolicitante = "Requerido";
    if (!datos.nombreEmpresa) errors.nombreEmpresa = "Requerido";
    if (!datos.giroIndustria) errors.giroIndustria = "Requerido";
    if (!datos.numeroEmpleados) errors.numeroEmpleados = "Requerido";
    if (!datos.antiguedadEmpresa) errors.antiguedadEmpresa = "Requerido";
    if (!datos.ubicacion) errors.ubicacion = "Requerido";
    if (!datos.telefonoContacto) errors.telefonoContacto = "Requerido";
    if (!datos.correoElectronico) errors.correoElectronico = "Requerido";

    // Área 0: Formato Básico del Empresario - Problemática
    if (!datos.areaMayorProblema) errors.areaMayorProblema = "Requerido";
    if (!datos.problematicaEspecifica) errors.problematicaEspecifica = "Requerido";
    if (!datos.principalPrioridad) errors.principalPrioridad = "Requerido";

    // Área 1: Dirección General y Planeación
    if (!datos.dg_misionVisionValores) errors.dg_misionVisionValores = "Requerido";
    if (!datos.dg_objetivosClaros) errors.dg_objetivosClaros = "Requerido";
    if (!datos.dg_planEstrategicoDocumentado) errors.dg_planEstrategicoDocumentado = "Requerido";
    if (!datos.dg_revisionAvancePlan) errors.dg_revisionAvancePlan = "Requerido";
    if (!datos.dg_factoresExternos) errors.dg_factoresExternos = "Requerido";
    if (!datos.dg_impideCumplirMetas) errors.dg_impideCumplirMetas = "Requerido";
    if (!datos.dg_capacidadAdaptacion) errors.dg_capacidadAdaptacion = "Requerido";
    if (!datos.dg_comoSeTomanDecisiones) errors.dg_comoSeTomanDecisiones = "Requerido";
    if (!datos.dg_colaboradoresParticipan) errors.dg_colaboradoresParticipan = "Requerido";
    if (!datos.dg_porQueNoParticipan) errors.dg_porQueNoParticipan = "Requerido";

    // Área 2: Finanzas y Administración
    if (!datos.fa_margenGanancia) errors.fa_margenGanancia = "Requerido";
    if (!datos.fa_estadosFinancierosActualizados) errors.fa_estadosFinancierosActualizados = "Requerido";
    if (!datos.fa_presupuestosAnuales) errors.fa_presupuestosAnuales = "Requerido";
    if (!datos.fa_liquidezCubreObligaciones) errors.fa_liquidezCubreObligaciones = "Requerido";
    if (!datos.fa_gastosControlados) errors.fa_gastosControlados = "Requerido";
    if (!datos.fa_causaProblemasFinancieros) errors.fa_causaProblemasFinancieros = "Requerido";
    if (!datos.fa_indicadoresFinancieros) errors.fa_indicadoresFinancieros = "Requerido";
    if (!datos.fa_analizanEstadosFinancieros) errors.fa_analizanEstadosFinancieros = "Requerido";
    if (!datos.fa_porQueNoSeAnalizan) errors.fa_porQueNoSeAnalizan = "Requerido";
    if (!datos.fa_herramientasSoftwareFinanciero) errors.fa_herramientasSoftwareFinanciero = "Requerido";
    if (!datos.fa_situacionFinancieraGeneral) errors.fa_situacionFinancieraGeneral = "Requerido";

    // Área 3: Operaciones / Prestación del Servicio
    if (!datos.op_capacidadProductivaCubreDemanda) errors.op_capacidadProductivaCubreDemanda = "Requerido";
    if (!datos.op_porQueNoCubreDemanda) errors.op_porQueNoCubreDemanda = "Requerido";
    if (!datos.op_procesosDocumentados) errors.op_procesosDocumentados = "Requerido";
    if (!datos.op_estandaresCalidadCumplen) errors.op_estandaresCalidadCumplen = "Requerido";
    if (!datos.op_controlesErrores) errors.op_controlesErrores = "Requerido";
    if (!datos.op_tiemposEntregaCumplen) errors.op_tiemposEntregaCumplen = "Requerido";
    if (!datos.op_porQueNoCumplen) errors.op_porQueNoCumplen = "Requerido";
    if (!datos.op_eficienciaProcesosOptima) errors.op_eficienciaProcesosOptima = "Requerido";
    if (!datos.op_personalConoceProcedimientos) errors.op_personalConoceProcedimientos = "Requerido";
    if (!datos.op_porQueNoConocen) errors.op_porQueNoConocen = "Requerido";
    if (!datos.op_indicadoresOperativos) errors.op_indicadoresOperativos = "Requerido";

    // Área 4: Marketing y Ventas
    if (!datos.mv_clienteIdealNecesidades) errors.mv_clienteIdealNecesidades = "Requerido";
    if (!datos.mv_planEstrategiasMarketing) errors.mv_planEstrategiasMarketing = "Requerido";
    if (!datos.mv_impactoCanalesVenta) errors.mv_impactoCanalesVenta = "Requerido";
    if (!datos.mv_canalesVentaActuales) errors.mv_canalesVentaActuales = "Requerido";
    if (!datos.mv_marcaReconocida) errors.mv_marcaReconocida = "Requerido";
    if (!datos.mv_estudiosSatisfaccionCliente) errors.mv_estudiosSatisfaccionCliente = "Requerido";
    if (!datos.mv_porQueNoHaceEstudios) errors.mv_porQueNoHaceEstudios = "Requerido";
    if (!datos.mv_indicadoresDesempenoComercial) errors.mv_indicadoresDesempenoComercial = "Requerido";
    if (!datos.mv_equipoVentasCapacitado) errors.mv_equipoVentasCapacitado = "Requerido";
    if (!datos.mv_politicasDescuentosPromociones) errors.mv_politicasDescuentosPromociones = "Requerido";

    // Área 5: Recursos Humanos
    if (!datos.rh_organigramaFuncionesClaras) errors.rh_organigramaFuncionesClaras = "Requerido";
    if (!datos.rh_personalCapacitado) errors.rh_personalCapacitado = "Requerido";
    if (!datos.rh_climaLaboralFavoreceProductividad) errors.rh_climaLaboralFavoreceProductividad = "Requerido";
    if (!datos.rh_programasMotivacion) errors.rh_programasMotivacion = "Requerido";
    if (!datos.rh_causaClimaLaboralComplejo) errors.rh_causaClimaLaboralComplejo = "Requerido";
    if (!datos.rh_evaluacionesDesempeno) errors.rh_evaluacionesDesempeno = "Requerido";
    if (!datos.rh_indicadoresRotacionPersonal) errors.rh_indicadoresRotacionPersonal = "Requerido";
    if (!datos.rh_liderazgoJefesIntermedios) errors.rh_liderazgoJefesIntermedios = "Requerido";
    if (!datos.rh_cuantasPersonasTrabajan) errors.rh_cuantasPersonasTrabajan = "Requerido";

    // Área 6: Logística y Cadena de Suministro
    if (!datos.lcs_proveedoresCumplen) errors.lcs_proveedoresCumplen = "Requerido";
    if (!datos.lcs_entregasClientesPuntuales) errors.lcs_entregasClientesPuntuales = "Requerido";
    if (!datos.lcs_costosLogisticosCompetitivos) errors.lcs_costosLogisticosCompetitivos = "Requerido";
    if (!datos.lcs_problemasLogisticosPunto) errors.lcs_problemasLogisticosPunto = "Requerido";
    if (!datos.lcs_poderNegociacionProveedores) errors.lcs_poderNegociacionProveedores = "Requerido";
    if (!datos.lcs_indicadoresLogisticos) errors.lcs_indicadoresLogisticos = "Requerido";

    // Área 7: Eje de Habilidades del Empresario
    if (!datos.he_liderInspiraEquipo) errors.he_liderInspiraEquipo = "Requerido";
    if (!datos.he_tomaDecisionesDatos) errors.he_tomaDecisionesDatos = "Requerido";
    if (!datos.he_resilienteDificultades) errors.he_resilienteDificultades = "Requerido";
    if (!datos.he_invierteDesarrolloPropio) errors.he_invierteDesarrolloPropio = "Requerido";
    if (!datos.he_porQueNoInvierte) errors.he_porQueNoInvierte = "Requerido";
    if (!datos.he_visionNegocioClara) errors.he_visionNegocioClara = "Requerido";
    if (!datos.he_apoyoAsesoresMentores) errors.he_apoyoAsesoresMentores = "Requerido";

    // Área 8: Eje de Cultura de Innovación
    if (!datos.ci_mejoranProductosServicios) errors.ci_mejoranProductosServicios = "Requerido";
    if (!datos.ci_recogeImplementaIdeasPersonal) errors.ci_recogeImplementaIdeasPersonal = "Requerido";
    if (!datos.ci_invierteTecnologiaInnovacion) errors.ci_invierteTecnologiaInnovacion = "Requerido";
    if (!datos.ci_dispuestoAsumirRiesgos) errors.ci_dispuestoAsumirRiesgos = "Requerido";
    if (!datos.ci_porQueNoInnova) errors.ci_porQueNoInnova = "Requerido";
    if (!datos.ci_protegePropiedadIntelectual) errors.ci_protegePropiedadIntelectual = "Requerido";
    if (!datos.ci_fomentaCulturaCambio) errors.ci_fomentaCulturaCambio = "Requerido";

    // Área 9: Eje de Retos y Aspiraciones del Empresario
    if (!datos.ra_mayorReto) errors.ra_mayorReto = "Requerido";
    if (!datos.ra_queMotiva) errors.ra_queMotiva = "Requerido";
    if (!datos.ra_cambiosPersonalesNecesarios) errors.ra_cambiosPersonalesNecesarios = "Requerido";
    if (!datos.ra_lograrEn5Anos) errors.ra_lograrEn5Anos = "Requerido";
    if (!datos.ra_queEnorgullece) errors.ra_queEnorgullece = "Requerido";
    if (!datos.ra_quePreocupa) errors.ra_quePreocupa = "Requerido";
    if (!datos.ra_principalProblematica) errors.ra_principalProblematica = "Requerido";
    if (!datos.ra_habilidadesFortalecer) errors.ra_habilidadesFortalecer = "Requerido";
    if (!datos.ra_tanSatisfechoRolActual) errors.ra_tanSatisfechoRolActual = "Requerido";
    if (!datos.ra_referenteParaEquipo) errors.ra_referenteParaEquipo = "Requerido";
    if (!datos.ra_situacionFinancieraGeneral) errors.ra_situacionFinancieraGeneral = "Requerido";


    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({}); // Limpiar mensajes previos
    setAnalisis(null); // Limpiar análisis previo

    if (!user) {
      setMensaje({ error: "Debes iniciar sesión para realizar el diagnóstico." });
      return;
    }

    if (!validateForm()) {
      setMensaje({ error: "Por favor, completa todos los campos obligatorios." });
      // Desplazarse al primer error
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        document.getElementsByName(firstErrorField)[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsLoading(true); // Iniciar loader

    try {
      // Llamada a la API Route de Next.js para procesar el diagnóstico con IA
      // Esta API Route es la que contendrá la lógica de llamada a Gemini
      const response = await fetch('/api/diagnostico/profundo-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...datos, userId: user.uid, createdAt: new Date().toISOString() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el diagnóstico profundo.');
      }

      const result: LLMAnalysisResult = await response.json();
      setAnalisis(result);
      setMensaje({ success: "Diagnóstico profundo analizado exitosamente." });

      // Opcional: Guardar el diagnóstico completo (datos + análisis) en DynamoDB
      // Esto se haría a través de otra API Route de Next.js
      // await fetch('/api/diagnostico/save', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...datos, analysisResult: result }),
      // });

    } catch (error: any) {
      console.error("Error en el diagnóstico profundo:", error);
      setMensaje({ error: error.message || "Ocurrió un error al procesar tu diagnóstico profundo." });
    } finally {
      setIsLoading(false); // Detener loader
    }
  };

  // Función para renderizar los botones de la escala Likert
  const renderLikertScale = (name: keyof DiagnosticoProfundoData, label: string) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label} *</label>
      <div className="flex space-x-2">
        {["1", "2", "3", "4", "5"].map((value) => (
          <button
            key={value}
            type="button"
            className={`px-4 py-2 rounded-lg border text-lg font-bold transition-all duration-200
              ${datos[name] === value
                ? "bg-indigo-600 text-white shadow-md scale-105 border-indigo-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-100 hover:border-indigo-400"
              }`}
            onClick={() => handleChange({ target: { name, value } } as ChangeEvent<HTMLSelectElement>)}
          >
            {value}
          </button>
        ))}
      </div>
      {formErrors[name] && <p className="mt-1 text-sm text-red-600">{formErrors[name]}</p>}
    </div>
  );

  // Función para renderizar el Likert especial con descripciones
  const renderSpecialLikertScale = (name: keyof DiagnosticoProfundoData, label: string, options: { value: string; label: string }[]) => (
    <div className="mb-4">
      <label htmlFor={name as string} className="block text-sm font-medium text-gray-700 mb-2">{label} *</label>
      <select
        id={name as string}
        name={name as string}
        value={datos[name] as string}
        onChange={handleChange}
        className={`mt-1 block w-full px-3 py-2 border ${formErrors[name] ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
      >
        <option value="">Selecciona una opción</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value} - {option.label}
          </option>
        ))}
      </select>
      {formErrors[name] && <p className="mt-1 text-sm text-red-600">{formErrors[name]}</p>}
    </div>
  );

  // Función para determinar el color del nivel de madurez
  const getNivelMadurezColor = (nivel: LLMAnalysisResult['nivel_madurez_general_profundo']) => {
    switch (nivel) {
      case 'muy_bajo': return 'text-red-600';
      case 'bajo': return 'text-orange-600';
      case 'medio': return 'text-yellow-600';
      case 'alto': return 'text-blue-600';
      case 'muy_alto': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };


  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 animate__animated animate__fadeIn">
            <div className="flex flex-col items-center">
              <UiverseLoader />
              <p className="mt-4 text-white text-lg font-semibold text-center">
                Realizando un análisis profundo de tu empresa con IA... <br /> ¡Un momento por favor!
              </p>
            </div>
          </div>
        )}

        <div className="max-w-5xl w-full bg-white p-8 rounded-xl shadow-lg animate__animated animate__fadeInDown border border-indigo-200">
          <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-4">
            Diagnóstico Profundo Empresarial
          </h1>
          <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
            Con el propósito de facilitar un análisis detallado de la empresa e identificar las posibles causas raíz de los desafíos que enfrenta, se presenta el siguiente diagnóstico profundo, compuesto por 96 preguntas. Este instrumento abarca las principales áreas funcionales, así como ejes transversales, incluyendo las habilidades del equipo y aspectos estratégicos fundamentales para comprender la situación actual del negocio.
          </p>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto italic">
            Es importante considerar que un diagnóstico puede generar cierta incomodidad, ya que refleja con claridad las condiciones reales de la organización. Por ello, se recomienda responder con la mayor honestidad y precisión posible; al igual que en un examen médico, si la información proporcionada no es veraz, los resultados podrían no reflejar adecuadamente la realidad y limitar el impacto de las acciones sugeridas. No es necesario conocer todos los aspectos técnicos de la gestión empresarial. En caso de que alguna pregunta o término no sea claro, al finalizar el llenado del cuestionario en la plataforma, un consultor especializado brindará el apoyo necesario para aclarar dudas, interpretar los resultados y definir las acciones estratégicas que mejor se ajusten a las necesidades identificadas. Toda la información proporcionada será tratada con estricta confidencialidad y utilizada únicamente con fines de análisis y mejora de la empresa.
          </p>
          <p className="text-center text-gray-600 mb-4 max-w-3xl mx-auto">
            Las preguntas en este diagnóstico utilizan dos formatos complementarios:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 max-w-3xl mx-auto">
            <li>
              **Preguntas abiertas**, diseñadas para que pueda expresarse con libertad y detallar toda la información que considere relevante. Posteriormente, un consultor especializado le apoyará para darles sentido, enriquecerlas con contexto y extraer información adicional necesaria para comprender mejor la situación de la empresa.
            </li>
            <li>
              **Preguntas con escala de Likert**, del 1 al 5, para obtener datos de forma más rápida y precisa. La interpretación de cada nivel es la siguiente:
              <ul className="list-disc list-inside ml-5 text-sm mt-2">
                <li>**1️⃣:** Difuso, poco claro, no desarrollado; no se cumplen los objetivos; no se percibe valor.</li>
                <li>**2️⃣:** Se realiza de manera ocasional e informal; a veces se cumplen los objetivos; se percibe poco valor.</li>
                <li>**3️⃣:** Se realiza regularmente, pero sin procesos definidos y de forma perceptiva; se cumplen los objetivos; se percibe valor principalmente a nivel regional.</li>
                <li>**4️⃣:** Se realiza correctamente, con seguimiento y mediciones básicas; se cumplen los objetivos con procesos estandarizados; se reconoce su alto valor a nivel nacional.</li>
                <li>**5️⃣:** Se realiza de manera excelente, automatizada y con indicadores de desempeño; se cumplen los objetivos con altos estándares; es reconocido a nivel internacional.</li>
              </ul>
            </li>
          </ul>
          <p className="text-center text-indigo-600 font-bold text-xl mb-10">
            ¿Listo?
          </p>

          {/* Mensajes de error/éxito */}
          {mensaje.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 animate__animated animate__shakeX">
              <strong className="font-bold">Error:</strong>{" "}
              <span className="block sm:inline">{mensaje.error}</span>
            </div>
          )}
          {mensaje.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 animate__animated animate__fadeIn">
              <strong className="font-bold">Éxito:</strong>{" "}
              <span className="block sm:inline">{mensaje.success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Bloque: Área 0: Formato Básico del Empresario - Datos Generales */}
            <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueDatosGenerales")}
              >
                <h2 className="text-2xl font-semibold text-indigo-700 flex items-center">
                  <ClipboardDocumentListIcon className="h-7 w-7 mr-3 text-indigo-600" />
                  Área 0: Formato Básico del Empresario - Datos Generales
                </h2>
                <button type="button" className="text-indigo-600 hover:text-indigo-800">
                  {expandedBlocks.bloqueDatosGenerales ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueDatosGenerales && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate__animated animate__fadeIn">
                  {/* Nombre del solicitante */}
                  <div>
                    <label htmlFor="nombreSolicitante" className="block text-sm font-medium text-gray-700">Nombre del solicitante: *</label>
                    <input type="text" id="nombreSolicitante" name="nombreSolicitante" value={datos.nombreSolicitante} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.nombreSolicitante ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.nombreSolicitante && <p className="mt-1 text-sm text-red-600">{formErrors.nombreSolicitante}</p>}
                  </div>
                  {/* Puesto del solicitante */}
                  <div>
                    <label htmlFor="puestoSolicitante" className="block text-sm font-medium text-gray-700">Puesto del solicitante: *</label>
                    <input type="text" id="puestoSolicitante" name="puestoSolicitante" value={datos.puestoSolicitante} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.puestoSolicitante ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.puestoSolicitante && <p className="mt-1 text-sm text-red-600">{formErrors.puestoSolicitante}</p>}
                  </div>
                  {/* Nombre de la empresa */}
                  <div>
                    <label htmlFor="nombreEmpresa" className="block text-sm font-medium text-gray-700">Nombre de la empresa: *</label>
                    <input type="text" id="nombreEmpresa" name="nombreEmpresa" value={datos.nombreEmpresa} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.nombreEmpresa ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.nombreEmpresa && <p className="mt-1 text-sm text-red-600">{formErrors.nombreEmpresa}</p>}
                  </div>
                  {/* RFC de la empresa */}
                  <div>
                    <label htmlFor="rfcEmpresa" className="block text-sm font-medium text-gray-700">RFC de la empresa: (Opcional)</label>
                    <input type="text" id="rfcEmpresa" name="rfcEmpresa" value={datos.rfcEmpresa} onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  {/* Giro o industria */}
                  <div>
                    <label htmlFor="giroIndustria" className="block text-sm font-medium text-gray-700">Giro o industria a la que pertenece: *</label>
                    <input type="text" id="giroIndustria" name="giroIndustria" value={datos.giroIndustria} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.giroIndustria ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.giroIndustria && <p className="mt-1 text-sm text-red-600">{formErrors.giroIndustria}</p>}
                  </div>
                  {/* Número de empleados */}
                  <div>
                    <label htmlFor="numeroEmpleados" className="block text-sm font-medium text-gray-700">Número de empleados actuales: *</label>
                    <input type="text" id="numeroEmpleados" name="numeroEmpleados" value={datos.numeroEmpleados} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.numeroEmpleados ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.numeroEmpleados && <p className="mt-1 text-sm text-red-600">{formErrors.numeroEmpleados}</p>}
                  </div>
                  {/* Antigüedad de la empresa */}
                  <div>
                    <label htmlFor="antiguedadEmpresa" className="block text-sm font-medium text-gray-700">Antigüedad de la empresa (en años): *</label>
                    <input type="text" id="antiguedadEmpresa" name="antiguedadEmpresa" value={datos.antiguedadEmpresa} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.antiguedadEmpresa ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.antiguedadEmpresa && <p className="mt-1 text-sm text-red-600">{formErrors.antiguedadEmpresa}</p>}
                  </div>
                  {/* Ubicación */}
                  <div>
                    <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700">Ubicación (ciudad y estado): *</label>
                    <input type="text" id="ubicacion" name="ubicacion" value={datos.ubicacion} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.ubicacion ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.ubicacion && <p className="mt-1 text-sm text-red-600">{formErrors.ubicacion}</p>}
                  </div>
                  {/* Teléfono de contacto */}
                  <div>
                    <label htmlFor="telefonoContacto" className="block text-sm font-medium text-gray-700">Teléfono de contacto: *</label>
                    <input type="tel" id="telefonoContacto" name="telefonoContacto" value={datos.telefonoContacto} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.telefonoContacto ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.telefonoContacto && <p className="mt-1 text-sm text-red-600">{formErrors.telefonoContacto}</p>}
                  </div>
                  {/* Correo electrónico */}
                  <div>
                    <label htmlFor="correoElectronico" className="block text-sm font-medium text-gray-700">Correo electrónico: *</label>
                    <input type="email" id="correoElectronico" name="correoElectronico" value={datos.correoElectronico} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.correoElectronico ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.correoElectronico && <p className="mt-1 text-sm text-red-600">{formErrors.correoElectronico}</p>}
                  </div>
                  {/* Sitio web o redes sociales */}
                  <div>
                    <label htmlFor="sitioWebRedes" className="block text-sm font-medium text-gray-700">Sitio web o redes sociales: (Opcional)</label>
                    <input type="text" id="sitioWebRedes" name="sitioWebRedes" value={datos.sitioWebRedes} onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Bloque: Área 0: Formato Básico del Empresario - Problemática */}
            <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueProblematicas")}
              >
                <h2 className="text-2xl font-semibold text-indigo-700 flex items-center">
                  <QuestionMarkCircleIcon className="h-7 w-7 mr-3 text-indigo-600" />
                  Área 0: Formato Básico del Empresario - Problemática
                </h2>
                <button type="button" className="text-indigo-600 hover:text-indigo-800">
                  {expandedBlocks.bloqueProblematicas ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueProblematicas && (
                <div className="mt-4 space-y-4 animate__animated animate__fadeIn">
                  {/* Área de mayor problema */}
                  <div>
                    <label htmlFor="areaMayorProblema" className="block text-sm font-medium text-gray-700">¿Cuál considera que es el área de la empresa en la que enfrenta mayores problemas actualmente? *</label>
                    <input type="text" id="areaMayorProblema" name="areaMayorProblema" value={datos.areaMayorProblema} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.areaMayorProblema ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.areaMayorProblema && <p className="mt-1 text-sm text-red-600">{formErrors.areaMayorProblema}</p>}
                  </div>
                  {/* Problemática específica */}
                  <div>
                    <label htmlFor="problematicaEspecifica" className="block text-sm font-medium text-gray-700">¿Qué problemática específica siente que está afectando más a su empresa en este momento? *</label>
                    <textarea id="problematicaEspecifica" name="problematicaEspecifica" rows={3} value={datos.problematicaEspecifica} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.problematicaEspecifica ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.problematicaEspecifica && <p className="mt-1 text-sm text-red-600">{formErrors.problematicaEspecifica}</p>}
                  </div>
                  {/* Principal prioridad */}
                  <div>
                    <label htmlFor="principalPrioridad" className="block text-sm font-medium text-gray-700">¿Cuál considera que es la principal prioridad para mejorar la situación de su empresa a corto plazo? *</label>
                    <textarea id="principalPrioridad" name="principalPrioridad" rows={2} value={datos.principalPrioridad} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.principalPrioridad ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.principalPrioridad && <p className="mt-1 text-sm text-red-600">{formErrors.principalPrioridad}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque: Área 1: Dirección General y Planeación */}
            <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueDireccionGeneralPlaneacion")}
              >
                <h2 className="text-2xl font-semibold text-indigo-700 flex items-center">
                  <BuildingOfficeIcon className="h-7 w-7 mr-3 text-indigo-600" />
                  Área 1: Dirección General y Planeación
                </h2>
                <button type="button" className="text-indigo-600 hover:text-indigo-800">
                  {expandedBlocks.bloqueDireccionGeneralPlaneacion ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueDireccionGeneralPlaneacion && (
                <div className="mt-4 space-y-4 animate__animated animate__fadeIn">
                  {renderLikertScale("dg_misionVisionValores", "1. ¿La empresa tiene misión, visión y valores claros y conocidos por el equipo?")}
                  {renderLikertScale("dg_objetivosClaros", "2. ¿La dirección establece metas anuales claras y medibles?")}
                  {renderLikertScale("dg_planEstrategicoDocumentado", "3. ¿Existe un plan estratégico documentado con objetivos a corto, mediano y largo plazo?")}
                  {renderLikertScale("dg_revisionAvancePlan", "4. ¿Se revisa periódicamente el avance contra el plan estratégico?")}
                  {renderLikertScale("dg_factoresExternos", "5. ¿Identifican factores externos que afectan a la empresa?")}
                  <div>
                    <label htmlFor="dg_impideCumplirMetas" className="block text-sm font-medium text-gray-700">6. Si no se cumplen las metas, ¿qué lo impide? *</label>
                    <textarea id="dg_impideCumplirMetas" name="dg_impideCumplirMetas" rows={2} value={datos.dg_impideCumplirMetas} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.dg_impideCumplirMetas ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.dg_impideCumplirMetas && <p className="mt-1 text-sm text-red-600">{formErrors.dg_impideCumplirMetas}</p>}
                  </div>
                  {renderLikertScale("dg_capacidadAdaptacion", "7. ¿Cómo evalúas la capacidad de la empresa para adaptarse a cambios del entorno?")}
                  <div>
                    <label htmlFor="dg_comoSeTomanDecisiones" className="block text-sm font-medium text-gray-700">8. ¿Cómo se toman las decisiones estratégicas? *</label>
                    <textarea id="dg_comoSeTomanDecisiones" name="dg_comoSeTomanDecisiones" rows={2} value={datos.dg_comoSeTomanDecisiones} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.dg_comoSeTomanDecisiones ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.dg_comoSeTomanDecisiones && <p className="mt-1 text-sm text-red-600">{formErrors.dg_comoSeTomanDecisiones}</p>}
                  </div>
                  {renderLikertScale("dg_colaboradoresParticipan", "9. ¿Participan los colaboradores en la definición de los objetivos?")}
                  <div>
                    <label htmlFor="dg_porQueNoParticipan" className="block text-sm font-medium text-gray-700">10. Si no participan, ¿por qué? *</label>
                    <textarea id="dg_porQueNoParticipan" name="dg_porQueNoParticipan" rows={2} value={datos.dg_porQueNoParticipan} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.dg_porQueNoParticipan ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.dg_porQueNoParticipan && <p className="mt-1 text-sm text-red-600">{formErrors.dg_porQueNoParticipan}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque: Área 2: Finanzas y Administración */}
            <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueFinanzasAdministracion")}
              >
                <h2 className="text-2xl font-semibold text-indigo-700 flex items-center">
                  <BanknotesIcon className="h-7 w-7 mr-3 text-indigo-600" />
                  Área 2: Finanzas y Administración
                </h2>
                <button type="button" className="text-indigo-600 hover:text-indigo-800">
                  {expandedBlocks.bloqueFinanzasAdministracion ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueFinanzasAdministracion && (
                <div className="mt-4 space-y-4 animate__animated animate__fadeIn">
                  {renderLikertScale("fa_margenGanancia", "11. ¿Conoces el margen de ganancia de tus productos o servicios?")}
                  {renderLikertScale("fa_estadosFinancierosActualizados", "12. ¿La empresa cuenta con estados financieros actualizados?")}
                  {renderLikertScale("fa_presupuestosAnuales", "13. ¿Se elaboran y siguen presupuestos anuales?")}
                  {renderLikertScale("fa_liquidezCubreObligaciones", "14. ¿La liquidez cubre las obligaciones inmediatas?")}
                  {renderLikertScale("fa_gastosControlados", "15. ¿Los gastos están controlados?")}
                  <div>
                    <label htmlFor="fa_causaProblemasFinancieros" className="block text-sm font-medium text-gray-700">16. Si hay problemas financieros, ¿qué los causa principalmente? *</label>
                    <textarea id="fa_causaProblemasFinancieros" name="fa_causaProblemasFinancieros" rows={2} value={datos.fa_causaProblemasFinancieros} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.fa_causaProblemasFinancieros ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.fa_causaProblemasFinancieros && <p className="mt-1 text-sm text-red-600">{formErrors.fa_causaProblemasFinancieros}</p>}
                  </div>
                  {renderLikertScale("fa_indicadoresFinancieros", "17. ¿Existen indicadores financieros para medir rentabilidad, flujo y deuda?")}
                  {renderLikertScale("fa_analizanEstadosFinancieros", "18. ¿Se analizan los estados financieros para tomar decisiones?")}
                  <div>
                    <label htmlFor="fa_porQueNoSeAnalizan" className="block text-sm font-medium text-gray-700">19. Si no se analizan, ¿por qué? *</label>
                    <textarea id="fa_porQueNoSeAnalizan" name="fa_porQueNoSeAnalizan" rows={2} value={datos.fa_porQueNoSeAnalizan} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.fa_porQueNoSeAnalizan ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.fa_porQueNoSeAnalizan && <p className="mt-1 text-sm text-red-600">{formErrors.fa_porQueNoSeAnalizan}</p>}
                  </div>
                  {renderLikertScale("fa_herramientasSoftwareFinanciero", "20. ¿Se utilizan herramientas o software financiero para control?")}
                  {renderSpecialLikertScale("fa_situacionFinancieraGeneral", "21. ¿Cómo describirías la situación financiera general de la empresa?", [
                    { value: "1", label: "Muy inestable" },
                    { value: "2", label: "Inestable" },
                    { value: "3", label: "Regular" },
                    { value: "4", label: "Estable" },
                    { value: "5", label: "Muy estable" },
                  ])}
                </div>
              )}
            </div>

            {/* Bloque: Área 3: Operaciones / Prestación del Servicio */}
            <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueOperacionesServicio")}
              >
                <h2 className="text-2xl font-semibold text-indigo-700 flex items-center">
                  <CubeTransparentIcon className="h-7 w-7 mr-3 text-indigo-600" />
                  Área 3: Operaciones / Prestación del Servicio
                </h2>
                <button type="button" className="text-indigo-600 hover:text-indigo-800">
                  {expandedBlocks.bloqueOperacionesServicio ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueOperacionesServicio && (
                <div className="mt-4 space-y-4 animate__animated animate__fadeIn">
                  {renderLikertScale("op_capacidadProductivaCubreDemanda", "22. ¿La capacidad productiva cubre la demanda?")}
                  <div>
                    <label htmlFor="op_porQueNoCubreDemanda" className="block text-sm font-medium text-gray-700">23. Si no cubre la demanda ¿A qué se debe? *</label>
                    <textarea id="op_porQueNoCubreDemanda" name="op_porQueNoCubreDemanda" rows={2} value={datos.op_porQueNoCubreDemanda} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.op_porQueNoCubreDemanda ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.op_porQueNoCubreDemanda && <p className="mt-1 text-sm text-red-600">{formErrors.op_porQueNoCubreDemanda}</p>}
                  </div>
                  {renderLikertScale("op_procesosDocumentados", "24. ¿Los procesos están documentados?")}
                  {renderLikertScale("op_estandaresCalidadCumplen", "25. ¿Los estándares de calidad se cumplen?")}
                  {renderLikertScale("op_controlesErrores", "26. ¿Existen controles para detectar y corregir errores?")}
                  {renderLikertScale("op_tiemposEntregaCumplen", "27. ¿Los tiempos de entrega/prestación cumplen lo prometido?")}
                  <div>
                    <label htmlFor="op_porQueNoCumplen" className="block text-sm font-medium text-gray-700">28. Si no cumplen, ¿por qué? *</label>
                    <textarea id="op_porQueNoCumplen" name="op_porQueNoCumplen" rows={2} value={datos.op_porQueNoCumplen} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.op_porQueNoCumplen ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.op_porQueNoCumplen && <p className="mt-1 text-sm text-red-600">{formErrors.op_porQueNoCumplen}</p>}
                  </div>
                  {renderLikertScale("op_eficienciaProcesosOptima", "29. ¿La eficiencia de los procesos es óptima?")}
                  {renderLikertScale("op_personalConoceProcedimientos", "30. ¿El personal conoce bien los procedimientos?")}
                  <div>
                    <label htmlFor="op_porQueNoConocen" className="block text-sm font-medium text-gray-700">31. Si no los conocen, ¿por qué? *</label>
                    <textarea id="op_porQueNoConocen" name="op_porQueNoConocen" rows={2} value={datos.op_porQueNoConocen} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.op_porQueNoConocen ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.op_porQueNoConocen && <p className="mt-1 text-sm text-red-600">{formErrors.op_porQueNoConocen}</p>}
                  </div>
                  {renderLikertScale("op_indicadoresOperativos", "32. ¿Se utilizan indicadores operativos?")}
                </div>
              )}
            </div>

            {/* Bloque: Área 4: Marketing y Ventas */}
            <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueMarketingVentas")}
              >
                <h2 className="text-2xl font-semibold text-indigo-700 flex items-center">
                  <MegaphoneIcon className="h-7 w-7 mr-3 text-indigo-600" />
                  Área 4: Marketing y Ventas
                </h2>
                <button type="button" className="text-indigo-600 hover:text-indigo-800">
                  {expandedBlocks.bloqueMarketingVentas ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueMarketingVentas && (
                <div className="mt-4 space-y-4 animate__animated animate__fadeIn">
                  {renderLikertScale("mv_clienteIdealNecesidades", "33. ¿Conoces a tu cliente ideal y sus necesidades?")}
                  {renderLikertScale("mv_planEstrategiasMarketing", "34. ¿Existe un plan de marketing o estrategias de marketing?")}
                  <div>
                    <label htmlFor="mv_impactoCanalesVenta" className="block text-sm font-medium text-gray-700">35. ¿Qué tanto impacto tiene los canales de venta para el negocio? *</label>
                    <textarea id="mv_impactoCanalesVenta" name="mv_impactoCanalesVenta" rows={2} value={datos.mv_impactoCanalesVenta} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.mv_impactoCanalesVenta ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.mv_impactoCanalesVenta && <p className="mt-1 text-sm text-red-600">{formErrors.mv_impactoCanalesVenta}</p>}
                  </div>
                  <div>
                    <label htmlFor="mv_canalesVentaActuales" className="block text-sm font-medium text-gray-700">36. ¿Cuáles son los canales de venta que actualmente tiene tu empresa? *</label>
                    <textarea id="mv_canalesVentaActuales" name="mv_canalesVentaActuales" rows={2} value={datos.mv_canalesVentaActuales} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.mv_canalesVentaActuales ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.mv_canalesVentaActuales && <p className="mt-1 text-sm text-red-600">{formErrors.mv_canalesVentaActuales}</p>}
                  </div>
                  {renderLikertScale("mv_marcaReconocida", "37. ¿Tu marca es reconocida frente a la competencia?")}
                  {renderLikertScale("mv_estudiosSatisfaccionCliente", "38. ¿Realizas estudios de satisfacción al cliente?")}
                  <div>
                    <label htmlFor="mv_porQueNoHaceEstudios" className="block text-sm font-medium text-gray-700">39. Si no los haces, ¿por qué? *</label>
                    <textarea id="mv_porQueNoHaceEstudios" name="mv_porQueNoHaceEstudios" rows={2} value={datos.mv_porQueNoHaceEstudios} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.mv_porQueNoHaceEstudios ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.mv_porQueNoHaceEstudios && <p className="mt-1 text-sm text-red-600">{formErrors.mv_porQueNoHaceEstudios}</p>}
                  </div>
                  {renderLikertScale("mv_indicadoresDesempenoComercial", "40. ¿Tienes indicadores para medir desempeño comercial?")}
                  {renderLikertScale("mv_equipoVentasCapacitado", "41. ¿El equipo de ventas está capacitado?")}
                  {renderLikertScale("mv_politicasDescuentosPromociones", "42. ¿Hay políticas claras para descuentos y promociones?")}
                </div>
              )}
            </div>

            {/* Bloque: Área 5: Recursos Humanos */}
            <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueRecursosHumanos")}
              >
                <h2 className="text-2xl font-semibold text-indigo-700 flex items-center">
                  <UsersIcon className="h-7 w-7 mr-3 text-indigo-600" />
                  Área 5: Recursos Humanos
                </h2>
                <button type="button" className="text-indigo-600 hover:text-indigo-800">
                  {expandedBlocks.bloqueRecursosHumanos ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueRecursosHumanos && (
                <div className="mt-4 space-y-4 animate__animated animate__fadeIn">
                  {renderLikertScale("rh_organigramaFuncionesClaras", "43. ¿Existe un organigrama con funciones claras y descriptivos de puesto?")}
                  {renderLikertScale("rh_personalCapacitado", "44. ¿El personal está capacitado para su trabajo?")}
                  {renderLikertScale("rh_climaLaboralFavoreceProductividad", "45. ¿El clima laboral favorece la productividad?")}
                  {renderLikertScale("rh_programasMotivacion", "46. ¿Existen programas de motivación?")}
                  <div>
                    <label htmlFor="rh_causaClimaLaboralComplejo" className="block text-sm font-medium text-gray-700">47. Si el clima laboral es complejo, ¿qué lo provoca? *</label>
                    <textarea id="rh_causaClimaLaboralComplejo" name="rh_causaClimaLaboralComplejo" rows={2} value={datos.rh_causaClimaLaboralComplejo} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.rh_causaClimaLaboralComplejo ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.rh_causaClimaLaboralComplejo && <p className="mt-1 text-sm text-red-600">{formErrors.rh_causaClimaLaboralComplejo}</p>}
                  </div>
                  {renderLikertScale("rh_evaluacionesDesempeno", "48. ¿Existen evaluaciones periódicas de desempeño?")}
                  {renderLikertScale("rh_indicadoresRotacionPersonal", "49. ¿Hay indicadores de rotación de personal?")}
                  {renderLikertScale("rh_liderazgoJefesIntermedios", "50. ¿El liderazgo de los jefes intermedios es adecuado?")}
                  <div>
                    <label htmlFor="rh_cuantasPersonasTrabajan" className="block text-sm font-medium text-gray-700">51. ¿Cuántas personas trabajan actualmente en tu empresa (incluyéndote)? *</label>
                    <textarea id="rh_cuantasPersonasTrabajan" name="rh_cuantasPersonasTrabajan" rows={2} value={datos.rh_cuantasPersonasTrabajan} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.rh_cuantasPersonasTrabajan ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.rh_cuantasPersonasTrabajan && <p className="mt-1 text-sm text-red-600">{formErrors.rh_cuantasPersonasTrabajan}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque: Área 6: Logística y Cadena de Suministro */}
            <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueLogisticaCadenaSuministro")}
              >
                <h2 className="text-2xl font-semibold text-indigo-700 flex items-center">
                  <TruckIcon className="h-7 w-7 mr-3 text-indigo-600" />
                  Área 6: Logística y Cadena de Suministro
                </h2>
                <button type="button" className="text-indigo-600 hover:text-indigo-800">
                  {expandedBlocks.bloqueLogisticaCadenaSuministro ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueLogisticaCadenaSuministro && (
                <div className="mt-4 space-y-4 animate__animated animate__fadeIn">
                  {renderLikertScale("lcs_proveedoresCumplen", "52. ¿Tus proveedores cumplen a tiempo y con la calidad acordada?")}
                  {renderLikertScale("lcs_entregasClientesPuntuales", "53. ¿Las entregas a clientes son puntuales?")}
                  {renderLikertScale("lcs_costosLogisticosCompetitivos", "54. ¿Los costos logísticos son competitivos?")}
                  <div>
                    <label htmlFor="lcs_problemasLogisticosPunto" className="block text-sm font-medium text-gray-700">55. Si hay problemas logísticos, ¿en qué punto ocurren? *</label>
                    <textarea id="lcs_problemasLogisticosPunto" name="lcs_problemasLogisticosPunto" rows={2} value={datos.lcs_problemasLogisticosPunto} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.lcs_problemasLogisticosPunto ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.lcs_problemasLogisticosPunto && <p className="mt-1 text-sm text-red-600">{formErrors.lcs_problemasLogisticosPunto}</p>}
                  </div>
                  {renderLikertScale("lcs_poderNegociacionProveedores", "56. ¿Consideras que tienes poder de negociación con tus proveedores?")}
                  {renderLikertScale("lcs_indicadoresLogisticos", "57. ¿Existen indicadores logísticos?")}
                </div>
              )}
            </div>

            {/* Bloque: Área 7: Eje de Habilidades del Empresario */}
            <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueHabilidadesEmpresario")}
              >
                <h2 className="text-2xl font-semibold text-indigo-700 flex items-center">
                  <LightBulbIcon className="h-7 w-7 mr-3 text-indigo-600" />
                  Área 7: Eje de Habilidades del Empresario
                </h2>
                <button type="button" className="text-indigo-600 hover:text-indigo-800">
                  {expandedBlocks.bloqueHabilidadesEmpresario ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueHabilidadesEmpresario && (
                <div className="mt-4 space-y-4 animate__animated animate__fadeIn">
                  {renderLikertScale("he_liderInspiraEquipo", "58. ¿Te consideras un líder capaz de inspirar al equipo?")}
                  {renderLikertScale("he_tomaDecisionesDatos", "59. ¿Tomas decisiones con base en datos y análisis?")}
                  {renderLikertScale("he_resilienteDificultades", "60. ¿Eres resiliente frente a dificultades?")}
                  {renderLikertScale("he_invierteDesarrolloPropio", "61. ¿Inviertes en tu propio desarrollo?")}
                  <div>
                    <label htmlFor="he_porQueNoInvierte" className="block text-sm font-medium text-gray-700">62. Si no, ¿qué lo impide? *</label>
                    <textarea id="he_porQueNoInvierte" name="he_porQueNoInvierte" rows={2} value={datos.he_porQueNoInvierte} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.he_porQueNoInvierte ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.he_porQueNoInvierte && <p className="mt-1 text-sm text-red-600">{formErrors.he_porQueNoInvierte}</p>}
                  </div>
                  {renderLikertScale("he_visionNegocioClara", "63. ¿Tu visión del negocio está clara y la transmites bien?")}
                  {renderLikertScale("he_apoyoAsesoresMentores", "64. ¿Te apoyas en asesores o mentores para tomar decisiones clave?")}
                </div>
              )}
            </div>

            {/* Bloque: Área 8: Eje de Cultura de Innovación */}
            <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueCulturaInnovacion")}
              >
                <h2 className="text-2xl font-semibold text-indigo-700 flex items-center">
                  <RocketLaunchIcon className="h-7 w-7 mr-3 text-indigo-600" />
                  Área 8: Eje de Cultura de Innovación
                </h2>
                <button type="button" className="text-indigo-600 hover:text-indigo-800">
                  {expandedBlocks.bloqueCulturaInnovacion ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueCulturaInnovacion && (
                <div className="mt-4 space-y-4 animate__animated animate__fadeIn">
                  {renderLikertScale("ci_mejoranProductosServicios", "65. ¿Se mejoran constantemente los productos/servicios?")}
                  {renderLikertScale("ci_recogeImplementaIdeasPersonal", "66. ¿Recoges e implementas ideas de mejora del personal?")}
                  {renderLikertScale("ci_invierteTecnologiaInnovacion", "67. ¿Inviertes en tecnología o innovación?")}
                  {renderLikertScale("ci_dispuestoAsumirRiesgos", "68. ¿Estás dispuesto a asumir riesgos calculados para innovar?")}
                  <div>
                    <label htmlFor="ci_porQueNoInnova" className="block text-sm font-medium text-gray-700">69. Si no innovas, ¿por qué? *</label>
                    <textarea id="ci_porQueNoInnova" name="ci_porQueNoInnova" rows={2} value={datos.ci_porQueNoInnova} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.ci_porQueNoInnova ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.ci_porQueNoInnova && <p className="mt-1 text-sm text-red-600">{formErrors.ci_porQueNoInnova}</p>}
                  </div>
                  {renderLikertScale("ci_protegePropiedadIntelectual", "70. ¿Proteges tu propiedad intelectual?")}
                  {renderLikertScale("ci_fomentaCulturaCambio", "71. ¿Fomentas una cultura abierta al cambio entre tu equipo?")}
                </div>
              )}
            </div>

            {/* Bloque: Área 9: Eje de Retos y Aspiraciones del Empresario */}
            <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueRetosAspiraciones")}
              >
                <h2 className="text-2xl font-semibold text-indigo-700 flex items-center">
                  <ChartBarIcon className="h-7 w-7 mr-3 text-indigo-600" />
                  Área 9: Eje de Retos y Aspiraciones del Empresario
                </h2>
                <button type="button" className="text-indigo-600 hover:text-indigo-800">
                  {expandedBlocks.bloqueRetosAspiraciones ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueRetosAspiraciones && (
                <div className="mt-4 space-y-4 animate__animated animate__fadeIn">
                  <div>
                    <label htmlFor="ra_mayorReto" className="block text-sm font-medium text-gray-700">72. ¿Cuál es tu mayor reto como empresario hoy? *</label>
                    <textarea id="ra_mayorReto" name="ra_mayorReto" rows={2} value={datos.ra_mayorReto} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.ra_mayorReto ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.ra_mayorReto && <p className="mt-1 text-sm text-red-600">{formErrors.ra_mayorReto}</p>}
                  </div>
                  <div>
                    <label htmlFor="ra_queMotiva" className="block text-sm font-medium text-gray-700">73. ¿Qué te motiva a seguir adelante? *</label>
                    <textarea id="ra_queMotiva" name="ra_queMotiva" rows={2} value={datos.ra_queMotiva} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.ra_queMotiva ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.ra_queMotiva && <p className="mt-1 text-sm text-red-600">{formErrors.ra_queMotiva}</p>}
                  </div>
                  <div>
                    <label htmlFor="ra_cambiosPersonalesNecesarios" className="block text-sm font-medium text-gray-700">74. ¿Qué cambios personales crees que necesitas para mejorar como empresario? *</label>
                    <textarea id="ra_cambiosPersonalesNecesarios" name="ra_cambiosPersonalesNecesarios" rows={2} value={datos.ra_cambiosPersonalesNecesarios} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.ra_cambiosPersonalesNecesarios ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.ra_cambiosPersonalesNecesarios && <p className="mt-1 text-sm text-red-600">{formErrors.ra_cambiosPersonalesNecesarios}</p>}
                  </div>
                  <div>
                    <label htmlFor="ra_lograrEn5Anos" className="block text-sm font-medium text-gray-700">75. ¿Qué te gustaría que tu empresa logre en los próximos 5 años? *</label>
                    <textarea id="ra_lograrEn5Anos" name="ra_lograrEn5Anos" rows={2} value={datos.ra_lograrEn5Anos} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.ra_lograrEn5Anos ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.ra_lograrEn5Anos && <p className="mt-1 text-sm text-red-600">{formErrors.ra_lograrEn5Anos}</p>}
                  </div>
                  <div>
                    <label htmlFor="ra_queEnorgullece" className="block text-sm font-medium text-gray-700">76. ¿Qué es lo que más te enorgullece de tu empresa? *</label>
                    <textarea id="ra_queEnorgullece" name="ra_queEnorgullece" rows={2} value={datos.ra_queEnorgullece} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.ra_queEnorgullece ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.ra_queEnorgullece && <p className="mt-1 text-sm text-red-600">{formErrors.ra_queEnorgullece}</p>}
                  </div>
                  <div>
                    <label htmlFor="ra_quePreocupa" className="block text-sm font-medium text-gray-700">77. ¿Qué es lo que más te preocupa actualmente? *</label>
                    <textarea id="ra_quePreocupa" name="ra_quePreocupa" rows={2} value={datos.ra_quePreocupa} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.ra_quePreocupa ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.ra_quePreocupa && <p className="mt-1 text-sm text-red-600">{formErrors.ra_quePreocupa}</p>}
                  </div>
                  <div>
                    <label htmlFor="ra_principalProblematica" className="block text-sm font-medium text-gray-700">78. ¿Cuál consideras que es la principal problemática de tu empresa actualmente? *</label>
                    <textarea id="ra_principalProblematica" name="ra_principalProblematica" rows={2} value={datos.ra_principalProblematica} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.ra_principalProblematica ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.ra_principalProblematica && <p className="mt-1 text-sm text-red-600">{formErrors.ra_principalProblematica}</p>}
                  </div>
                  <div>
                    <label htmlFor="ra_habilidadesFortalecer" className="block text-sm font-medium text-gray-700">79. ¿Qué habilidades personales quisieras fortalecer? *</label>
                    <textarea id="ra_habilidadesFortalecer" name="ra_habilidadesFortalecer" rows={2} value={datos.ra_habilidadesFortalecer} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.ra_habilidadesFortalecer ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />
                    {formErrors.ra_habilidadesFortalecer && <p className="mt-1 text-sm text-red-600">{formErrors.ra_habilidadesFortalecer}</p>}
                  </div>
                  {renderSpecialLikertScale("ra_tanSatisfechoRolActual", "80. ¿Qué tan satisfecho estás con tu rol actual en la empresa?", [
                    { value: "1", label: "Muy insatisfecho" },
                    { value: "2", label: "Insatisfecho" },
                    { value: "3", label: "Neutral" },
                    { value: "4", label: "Satisfecho" },
                    { value: "5", label: "Muy satisfecho" },
                  ])}
                  {renderLikertScale("ra_referenteParaEquipo", "81. ¿Te consideras un referente para tu equipo?")}
                  {renderSpecialLikertScale("ra_situacionFinancieraGeneral", "82. ¿Cómo describirías la situación financiera general de la empresa?", [
                    { value: "1", label: "Muy inestable" },
                    { value: "2", label: "Inestable" },
                    { value: "3", label: "Regular" },
                    { value: "4", label: "Estable" },
                    { value: "5", label: "Muy estable" },
                  ])}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar Diagnóstico Profundo"}
            </button>
          </form>

          {/* Sección de Resultados del Análisis (se muestra solo si hay análisis) */}
          {analisis && (
            <div className="mt-10 p-8 bg-indigo-100 rounded-xl shadow-lg border border-indigo-300 animate__animated animate__fadeInUp">
              <h2 className="text-3xl font-extrabold text-indigo-800 mb-6 text-center">
                Resultados del Diagnóstico Profundo
              </h2>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-indigo-700 mb-3">
                  Resumen Ejecutivo Profundo:
                </h3>
                <p className="text-gray-800 leading-relaxed bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  {analisis.resumen_ejecutivo_profundo}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-indigo-700 mb-3">
                  Causas Raíz Identificadas:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-800 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  {analisis.causas_raiz_identificadas.map((causa, index) => (
                    <li key={index}>{causa}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-indigo-700 mb-3">
                  Fortalezas Clave:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-800 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  {analisis.fortalezas_clave.map((fortaleza, index) => (
                    <li key={index}>{fortaleza}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-indigo-700 mb-3">
                  Oportunidades de Crecimiento:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-800 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  {analisis.oportunidades_crecimiento.map((oportunidad, index) => (
                    <li key={index}>{oportunidad}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-indigo-700 mb-3">
                  Recomendaciones Estratégicas por Área:
                </h3>
                {Object.entries(analisis.recomendaciones_estrategicas_por_area).map(([area, recs]) => (
                  <div key={area} className="mb-4 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-xl font-medium text-indigo-600 mb-2 capitalize">
                      {area.replace(/_/g, ' ')}:
                    </h4>
                    <ul className="list-disc list-inside ml-5 text-gray-800">
                      {recs?.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-indigo-700 mb-3">
                  Puntuación de Madurez Promedio:
                </h3>
                <p className="text-3xl font-bold text-indigo-600 bg-indigo-50 p-4 rounded-lg border border-indigo-200 inline-block">
                  {analisis.puntuacion_madurez_promedio.toFixed(2)}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-indigo-700 mb-3">
                  Nivel de Madurez General:
                </h3>
                <p className={`text-3xl font-bold ${getNivelMadurezColor(analisis.nivel_madurez_general_profundo)} bg-indigo-50 p-4 rounded-lg border border-indigo-200 inline-block`}>
                  {analisis.nivel_madurez_general_profundo.toUpperCase().replace(/_/g, ' ')}
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-indigo-700 mb-3">
                  Plan de Acción Sugerido:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-800 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  {analisis.plan_de_accion_sugerido.map((paso, index) => (
                    <li key={index}>{paso}</li>
                  ))}
                </ul>
              </div>

              <p className="mt-8 text-center text-gray-600 italic">
                Un consultor especializado se pondrá en contacto contigo para discutir estos resultados en detalle y definir los próximos pasos.
              </p>
            </div>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
};

export default DiagnosticoProfundo;
