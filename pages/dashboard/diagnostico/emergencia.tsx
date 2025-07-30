// pages/dashboard/diagnostico/emergencia.tsx
import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../../contexts/AuthContext";
import PrivateLayout from "../../../components/layout/PrivateLayout";
import "animate.css"; // Asegúrate de que animate.css esté importado para las animaciones
import {
  XCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BoltIcon, // Icono para emergencia
  ClipboardDocumentListIcon, // Icono para datos generales
  QuestionMarkCircleIcon, // Icono para problemática
  ScaleIcon, // Icono para continuidad
  CurrencyDollarIcon, // Icono para flujo de efectivo
  ShoppingCartIcon, // Icono para clientes y ventas
  UsersIcon, // Icono para personal
  Cog6ToothIcon, // Icono para operaciones
  TruckIcon, // Icono para proveedores
  LightBulbIcon, // Icono para capacidad de adaptarse
  HandRaisedIcon, // Icono para apoyo externo
} from "@heroicons/react/24/solid";

// Interfaz para los datos del formulario de Diagnóstico de Emergencia
interface DiagnosticoEmergenciaData {
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
  areaMayorProblema: string;
  problematicaEspecifica: string;
  principalPrioridad: string;
  problemaMasUrgente: string;
  impactoDelProblema: string;
  continuidadNegocio: "1" | "2" | "3" | "4" | "5" | "";
  flujoEfectivo: "Si" | "No" | "Parcialmente" | "";
  ventasDisminuido: "Si" | "No" | "No lo sé" | "";
  personalAfectado: "Si" | "No" | "No aplica" | "";
  operacionesCalidadTiempo: "Si" | "No" | "Parcialmente" | "";
  suministroMateriales: "Si" | "No" | "Parcialmente" | "";
  capacidadAdaptarse: "1" | "2" | "3" | "4" | "5" | "";
  apoyoExterno: "Si" | "No" | "Estoy buscando" | "";
  createdAt: string;
}

// Interfaz para el resultado del análisis del LLM (IA)
interface LLMAnalysisResult {
  diagnostico_rapido: string;
  acciones_inmediatas: string[];
  riesgo_general: "bajo" | "moderado" | "alto" | "critico";
  recomendaciones_clave: string[];
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
        --background: #EF4444; /* Tailwind red-500 for emergency theme */
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
        --background: #DC2626; /* Tailwind red-600 */
        --right: 0;
        --rotateY: 90deg;
        --translateZ: calc(var(--size) / 2);
      }

      .boxes .box > div:nth-child(3) {
        --background: #B91C1C; /* Tailwind red-700 */
        --bottom: 0;
        --rotateX: 90deg;
        --translateZ: calc(var(--size) / 2);
      }

      .boxes .box > div:nth-child(4) {
        --background: #991B1B; /* Tailwind red-800 */
        --left: 0;
        --rotateY: -90deg;
        --translateZ: calc(var(--size) / 2);
      }

      .boxes .box > div:nth-child(5) {
        --background: #7F1D1D; /* Tailwind red-900 */
        --top: 0;
        --left: 0;
        --translateZ: calc(var(--size) / -2);
      }

      .boxes .box > div:nth-child(6) {
        --background: #FEF2F2; /* Tailwind red-50 */
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

const DiagnosticoEmergencia = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Estado inicial del formulario
  const initialData: DiagnosticoEmergenciaData = {
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
    problemaMasUrgente: "",
    impactoDelProblema: "",
    continuidadNegocio: "",
    flujoEfectivo: "",
    ventasDisminuido: "",
    personalAfectado: "",
    operacionesCalidadTiempo: "",
    suministroMateriales: "",
    capacidadAdaptarse: "",
    apoyoExterno: "",
    createdAt: new Date().toISOString(),
  };

  const [datos, setDatos] = useState<DiagnosticoEmergenciaData>(initialData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState<{ error?: string; success?: string }>(
    {}
  );
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>(
    {
      bloqueDatosGenerales: true, // Expandir el primer bloque por defecto
      bloqueProblematica: false,
      bloquePrincipalProblema: false,
      bloqueEvaluacionImpacto: false,
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
    setDatos((prev) => ({ ...prev, [name]: value } as DiagnosticoEmergenciaData));
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  // Validar el formulario antes de enviar
  const validateForm = () => {
    const errors: Record<string, string> = {};
    // Validación de Datos Generales
    if (!datos.nombreSolicitante) errors.nombreSolicitante = "Requerido";
    if (!datos.puestoSolicitante) errors.puestoSolicitante = "Requerido";
    if (!datos.nombreEmpresa) errors.nombreEmpresa = "Requerido";
    if (!datos.giroIndustria) errors.giroIndustria = "Requerido";
    if (!datos.numeroEmpleados) errors.numeroEmpleados = "Requerido";
    if (!datos.antiguedadEmpresa) errors.antiguedadEmpresa = "Requerido";
    if (!datos.ubicacion) errors.ubicacion = "Requerido";
    if (!datos.telefonoContacto) errors.telefonoContacto = "Requerido";
    if (!datos.correoElectronico) errors.correoElectronico = "Requerido";

    // Validación de Problemática
    if (!datos.areaMayorProblema) errors.areaMayorProblema = "Requerido";
    if (!datos.problematicaEspecifica) errors.problematicaEspecifica = "Requerido";
    if (!datos.principalPrioridad) errors.principalPrioridad = "Requerido";

    // Validación de Principal Problema Actual
    if (!datos.problemaMasUrgente) errors.problemaMasUrgente = "Requerido";
    if (!datos.impactoDelProblema) errors.impactoDelProblema = "Requerido";
    if (!datos.continuidadNegocio) errors.continuidadNegocio = "Requerido";
    if (!datos.flujoEfectivo) errors.flujoEfectivo = "Requerido";
    if (!datos.ventasDisminuido) errors.ventasDisminuido = "Requerido";
    if (!datos.personalAfectado) errors.personalAfectado = "Requerido";
    if (!datos.operacionesCalidadTiempo) errors.operacionesCalidadTiempo = "Requerido";
    if (!datos.suministroMateriales) errors.suministroMateriales = "Requerido";
    if (!datos.capacidadAdaptarse) errors.capacidadAdaptarse = "Requerido";
    if (!datos.apoyoExterno) errors.apoyoExterno = "Requerido";

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
      return;
    }

    setIsLoading(true); // Iniciar loader

    try {
      // Llamada a la API Route de Next.js para procesar el diagnóstico con IA
      // Esta API Route es la que contendrá la lógica de llamada a Gemini
      const response = await fetch('/api/diagnostico/emergencia-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...datos, userId: user.uid, createdAt: new Date().toISOString() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el diagnóstico.');
      }

      const result: LLMAnalysisResult = await response.json();
      setAnalisis(result);
      setMensaje({ success: "Diagnóstico de emergencia analizado exitosamente." });

      // Opcional: Guardar el diagnóstico completo (datos + análisis) en DynamoDB
      // Esto se haría a través de otra API Route de Next.js
      // await fetch('/api/diagnostico/save', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...datos, analysisResult: result }),
      // });

    } catch (error: any) {
      console.error("Error en el diagnóstico de emergencia:", error);
      setMensaje({ error: error.message || "Ocurrió un error al procesar tu diagnóstico." });
    } finally {
      setIsLoading(false); // Detener loader
    }
  };

  // Función para determinar el color del riesgo
  const getRiesgoColor = (riesgo: LLMAnalysisResult['riesgo_general']) => {
    switch (riesgo) {
      case 'bajo': return 'text-green-600';
      case 'moderado': return 'text-yellow-600';
      case 'alto': return 'text-orange-600';
      case 'critico': return 'text-red-600';
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
                Analizando tu situación de emergencia con IA... <br /> ¡Un momento por favor!
              </p>
            </div>
          </div>
        )}

        <div className="max-w-5xl w-full bg-white p-8 rounded-xl shadow-lg animate__animated animate__fadeInDown border border-red-200">
          <h1 className="text-4xl font-extrabold text-center text-red-800 mb-4">
            Diagnóstico de Emergencia Empresarial
          </h1>
          <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
            El diagnóstico de emergencia te ayudará a identificar con rapidez las situaciones más críticas que enfrenta tu empresa, para que puedas tomar decisiones inmediatas y definir prioridades claras.
          </p>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto italic">
            A través de preguntas organizadas en áreas clave, podrás reflexionar sobre los aspectos que requieren atención urgente. Sabemos que algunas respuestas pueden resultar incómodas, pero son fundamentales para tener una visión honesta de la situación y encontrar soluciones efectivas. Toda la información será tratada con confidencialidad y servirá únicamente para apoyarte en este momento crítico. Al finalizar, un consultor especializado se pondrá en contacto contigo para explicarte los resultados, orientarte y acompañarte en los siguientes pasos.
          </p>
          <p className="text-center text-red-600 font-bold text-xl mb-10">
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
            {/* Bloque: Datos Generales */}
            <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueDatosGenerales")}
              >
                <h2 className="text-2xl font-semibold text-red-700 flex items-center">
                  <ClipboardDocumentListIcon className="h-7 w-7 mr-3 text-red-600" />
                  1. Datos Generales
                </h2>
                <button type="button" className="text-red-600 hover:text-red-800">
                  {expandedBlocks.bloqueDatosGenerales ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueDatosGenerales && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate__animated animate__fadeIn">
                  {/* Nombre del solicitante */}
                  <div>
                    <label htmlFor="nombreSolicitante" className="block text-sm font-medium text-gray-700">Nombre del solicitante: *</label>
                    <input type="text" id="nombreSolicitante" name="nombreSolicitante" value={datos.nombreSolicitante} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.nombreSolicitante ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.nombreSolicitante && <p className="mt-1 text-sm text-red-600">{formErrors.nombreSolicitante}</p>}
                  </div>
                  {/* Puesto del solicitante */}
                  <div>
                    <label htmlFor="puestoSolicitante" className="block text-sm font-medium text-gray-700">Puesto del solicitante: *</label>
                    <input type="text" id="puestoSolicitante" name="puestoSolicitante" value={datos.puestoSolicitante} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.puestoSolicitante ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.puestoSolicitante && <p className="mt-1 text-sm text-red-600">{formErrors.puestoSolicitante}</p>}
                  </div>
                  {/* Nombre de la empresa */}
                  <div>
                    <label htmlFor="nombreEmpresa" className="block text-sm font-medium text-gray-700">Nombre de la empresa: *</label>
                    <input type="text" id="nombreEmpresa" name="nombreEmpresa" value={datos.nombreEmpresa} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.nombreEmpresa ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.nombreEmpresa && <p className="mt-1 text-sm text-red-600">{formErrors.nombreEmpresa}</p>}
                  </div>
                  {/* RFC de la empresa */}
                  <div>
                    <label htmlFor="rfcEmpresa" className="block text-sm font-medium text-gray-700">RFC de la empresa: (Opcional)</label>
                    <input type="text" id="rfcEmpresa" name="rfcEmpresa" value={datos.rfcEmpresa} onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
                  </div>
                  {/* Giro o industria */}
                  <div>
                    <label htmlFor="giroIndustria" className="block text-sm font-medium text-gray-700">Giro o industria a la que pertenece: *</label>
                    <input type="text" id="giroIndustria" name="giroIndustria" value={datos.giroIndustria} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.giroIndustria ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.giroIndustria && <p className="mt-1 text-sm text-red-600">{formErrors.giroIndustria}</p>}
                  </div>
                  {/* Número de empleados */}
                  <div>
                    <label htmlFor="numeroEmpleados" className="block text-sm font-medium text-gray-700">Número de empleados actuales: *</label>
                    <input type="text" id="numeroEmpleados" name="numeroEmpleados" value={datos.numeroEmpleados} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.numeroEmpleados ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.numeroEmpleados && <p className="mt-1 text-sm text-red-600">{formErrors.numeroEmpleados}</p>}
                  </div>
                  {/* Antigüedad de la empresa */}
                  <div>
                    <label htmlFor="antiguedadEmpresa" className="block text-sm font-medium text-gray-700">Antigüedad de la empresa (en años): *</label>
                    <input type="text" id="antiguedadEmpresa" name="antiguedadEmpresa" value={datos.antiguedadEmpresa} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.antiguedadEmpresa ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.antiguedadEmpresa && <p className="mt-1 text-sm text-red-600">{formErrors.antiguedadEmpresa}</p>}
                  </div>
                  {/* Ubicación */}
                  <div>
                    <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700">Ubicación (ciudad y estado): *</label>
                    <input type="text" id="ubicacion" name="ubicacion" value={datos.ubicacion} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.ubicacion ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.ubicacion && <p className="mt-1 text-sm text-red-600">{formErrors.ubicacion}</p>}
                  </div>
                  {/* Teléfono de contacto */}
                  <div>
                    <label htmlFor="telefonoContacto" className="block text-sm font-medium text-gray-700">Teléfono de contacto: *</label>
                    <input type="tel" id="telefonoContacto" name="telefonoContacto" value={datos.telefonoContacto} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.telefonoContacto ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.telefonoContacto && <p className="mt-1 text-sm text-red-600">{formErrors.telefonoContacto}</p>}
                  </div>
                  {/* Correo electrónico */}
                  <div>
                    <label htmlFor="correoElectronico" className="block text-sm font-medium text-gray-700">Correo electrónico: *</label>
                    <input type="email" id="correoElectronico" name="correoElectronico" value={datos.correoElectronico} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.correoElectronico ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.correoElectronico && <p className="mt-1 text-sm text-red-600">{formErrors.correoElectronico}</p>}
                  </div>
                  {/* Sitio web o redes sociales */}
                  <div>
                    <label htmlFor="sitioWebRedes" className="block text-sm font-medium text-gray-700">Sitio web o redes sociales: (Opcional)</label>
                    <input type="text" id="sitioWebRedes" name="sitioWebRedes" value={datos.sitioWebRedes} onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Bloque: Problemática Actual */}
            <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueProblematica")}
              >
                <h2 className="text-2xl font-semibold text-red-700 flex items-center">
                  <QuestionMarkCircleIcon className="h-7 w-7 mr-3 text-red-600" />
                  2. Problemática Actual
                </h2>
                <button type="button" className="text-red-600 hover:text-red-800">
                  {expandedBlocks.bloqueProblematica ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueProblematica && (
                <div className="mt-4 space-y-4 animate__animated animate__fadeIn">
                  {/* Área de mayor problema */}
                  <div>
                    <label htmlFor="areaMayorProblema" className="block text-sm font-medium text-gray-700">¿Cuál es el área de tu empresa que presenta el mayor problema o crisis en este momento? (Ej. Ventas, Operaciones, Finanzas, Personal, etc.): *</label>
                    <input type="text" id="areaMayorProblema" name="areaMayorProblema" value={datos.areaMayorProblema} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.areaMayorProblema ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.areaMayorProblema && <p className="mt-1 text-sm text-red-600">{formErrors.areaMayorProblema}</p>}
                  </div>
                  {/* Problemática específica */}
                  <div>
                    <label htmlFor="problematicaEspecifica" className="block text-sm font-medium text-gray-700">Describe la problemática específica que estás enfrentando en esa área: *</label>
                    <textarea id="problematicaEspecifica" name="problematicaEspecifica" rows={3} value={datos.problematicaEspecifica} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.problematicaEspecifica ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.problematicaEspecifica && <p className="mt-1 text-sm text-red-600">{formErrors.problematicaEspecifica}</p>}
                  </div>
                  {/* Principal prioridad */}
                  <div>
                    <label htmlFor="principalPrioridad" className="block text-sm font-medium text-gray-700">¿Cuál es tu principal prioridad o el resultado más crítico que esperas obtener de este diagnóstico de emergencia? *</label>
                    <textarea id="principalPrioridad" name="principalPrioridad" rows={2} value={datos.principalPrioridad} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.principalPrioridad ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.principalPrioridad && <p className="mt-1 text-sm text-red-600">{formErrors.principalPrioridad}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque: Principal Problema Actual */}
            <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloquePrincipalProblema")}
              >
                <h2 className="text-2xl font-semibold text-red-700 flex items-center">
                  <BoltIcon className="h-7 w-7 mr-3 text-red-600" />
                  3. Principal Problema Actual
                </h2>
                <button type="button" className="text-red-600 hover:text-red-800">
                  {expandedBlocks.bloquePrincipalProblema ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloquePrincipalProblema && (
                <div className="mt-4 space-y-4 animate__animated animate__fadeIn">
                  {/* Problema más urgente */}
                  <div>
                    <label htmlFor="problemaMasUrgente" className="block text-sm font-medium text-gray-700">En una frase, ¿cuál es el problema más urgente que necesita ser resuelto HOY? *</label>
                    <textarea id="problemaMasUrgente" name="problemaMasUrgente" rows={2} value={datos.problemaMasUrgente} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.problemaMasUrgente ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.problemaMasUrgente && <p className="mt-1 text-sm text-red-600">{formErrors.problemaMasUrgente}</p>}
                  </div>
                  {/* Impacto del problema */}
                  <div>
                    <label htmlFor="impactoDelProblema" className="block text-sm font-medium text-gray-700">¿Cómo está impactando este problema a tu empresa en este momento? (Ej. Pérdida de clientes, disminución de ingresos, baja moral del personal, interrupción de operaciones, etc.): *</label>
                    <textarea id="impactoDelProblema" name="impactoDelProblema" rows={3} value={datos.impactoDelProblema} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.impactoDelProblema ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`} />
                    {formErrors.impactoDelProblema && <p className="mt-1 text-sm text-red-600">{formErrors.impactoDelProblema}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque: Evaluación Rápida de Impacto */}
            <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100">
              <div
                className="flex justify-between items-center cursor-pointer p-2"
                onClick={() => toggleBlock("bloqueEvaluacionImpacto")}
              >
                <h2 className="text-2xl font-semibold text-red-700 flex items-center">
                  <ExclamationCircleIcon className="h-7 w-7 mr-3 text-red-600" />
                  4. Evaluación Rápida de Impacto
                </h2>
                <button type="button" className="text-red-600 hover:text-red-800">
                  {expandedBlocks.bloqueEvaluacionImpacto ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {expandedBlocks.bloqueEvaluacionImpacto && (
                <div className="mt-4 space-y-6 animate__animated animate__fadeIn">
                  {/* Continuidad del negocio */}
                  <div>
                    <label htmlFor="continuidadNegocio" className="block text-sm font-medium text-gray-700 mb-2">
                      <ScaleIcon className="inline-block h-5 w-5 mr-1 text-red-500" />
                      ¿Qué tan afectada está la continuidad de tu negocio? (1 = Mínimamente afectada, 5 = Completamente interrumpida) *
                    </label>
                    <select id="continuidadNegocio" name="continuidadNegocio" value={datos.continuidadNegocio} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.continuidadNegocio ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Selecciona una opción</option>
                      <option value="1">1 - Mínimamente afectada</option>
                      <option value="2">2 - Ligeramente afectada</option>
                      <option value="3">3 - Moderadamente afectada</option>
                      <option value="4">4 - Severamente afectada</option>
                      <option value="5">5 - Completamente interrumpida</option>
                    </select>
                    {formErrors.continuidadNegocio && <p className="mt-1 text-sm text-red-600">{formErrors.continuidadNegocio}</p>}
                  </div>

                  {/* Flujo de efectivo */}
                  <div>
                    <label htmlFor="flujoEfectivo" className="block text-sm font-medium text-gray-700 mb-2">
                      <CurrencyDollarIcon className="inline-block h-5 w-5 mr-1 text-red-500" />
                      ¿Tu flujo de efectivo se ha visto comprometido significativamente? *
                    </label>
                    <select id="flujoEfectivo" name="flujoEfectivo" value={datos.flujoEfectivo} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.flujoEfectivo ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Selecciona una opción</option>
                      <option value="Si">Sí</option>
                      <option value="No">No</option>
                      <option value="Parcialmente">Parcialmente</option>
                    </select>
                    {formErrors.flujoEfectivo && <p className="mt-1 text-sm text-red-600">{formErrors.flujoEfectivo}</p>}
                  </div>

                  {/* Ventas han disminuido */}
                  <div>
                    <label htmlFor="ventasDisminuido" className="block text-sm font-medium text-gray-700 mb-2">
                      <ShoppingCartIcon className="inline-block h-5 w-5 mr-1 text-red-500" />
                      ¿Tus ventas han disminuido drásticamente? *
                    </label>
                    <select id="ventasDisminuido" name="ventasDisminuido" value={datos.ventasDisminuido} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.ventasDisminuido ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Selecciona una opción</option>
                      <option value="Si">Sí</option>
                      <option value="No">No</option>
                      <option value="No lo sé">No lo sé</option>
                    </select>
                    {formErrors.ventasDisminuido && <p className="mt-1 text-sm text-red-600">{formErrors.ventasDisminuido}</p>}
                  </div>

                  {/* Personal afectado */}
                  <div>
                    <label htmlFor="personalAfectado" className="block text-sm font-medium text-gray-700 mb-2">
                      <UsersIcon className="inline-block h-5 w-5 mr-1 text-red-500" />
                      ¿El personal clave o una parte significativa de tu equipo se ha visto afectado? *
                    </label>
                    <select id="personalAfectado" name="personalAfectado" value={datos.personalAfectado} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.personalAfectado ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Selecciona una opción</option>
                      <option value="Si">Sí</option>
                      <option value="No">No</option>
                      <option value="No aplica">No aplica</option>
                    </select>
                    {formErrors.personalAfectado && <p className="mt-1 text-sm text-red-600">{formErrors.personalAfectado}</p>}
                  </div>

                  {/* Operaciones o calidad/tiempo de entrega */}
                  <div>
                    <label htmlFor="operacionesCalidadTiempo" className="block text-sm font-medium text-gray-700 mb-2">
                      <Cog6ToothIcon className="inline-block h-5 w-5 mr-1 text-red-500" />
                      ¿Tus operaciones o la calidad/tiempo de entrega de tus productos/servicios se han visto gravemente comprometidos? *
                    </label>
                    <select id="operacionesCalidadTiempo" name="operacionesCalidadTiempo" value={datos.operacionesCalidadTiempo} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.operacionesCalidadTiempo ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Selecciona una opción</option>
                      <option value="Si">Sí</option>
                      <option value="No">No</option>
                      <option value="Parcialmente">Parcialmente</option>
                    </select>
                    {formErrors.operacionesCalidadTiempo && <p className="mt-1 text-sm text-red-600">{formErrors.operacionesCalidadTiempo}</p>}
                  </div>

                  {/* Suministro de materiales o servicios clave */}
                  <div>
                    <label htmlFor="suministroMateriales" className="block text-sm font-medium text-gray-700 mb-2">
                      <TruckIcon className="inline-block h-5 w-5 mr-1 text-red-500" />
                      ¿El suministro de materiales o servicios clave para tu operación se ha interrumpido? *
                    </label>
                    <select id="suministroMateriales" name="suministroMateriales" value={datos.suministroMateriales} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.suministroMateriales ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Selecciona una opción</option>
                      <option value="Si">Sí</option>
                      <option value="No">No</option>
                      <option value="Parcialmente">Parcialmente</option>
                    </select>
                    {formErrors.suministroMateriales && <p className="mt-1 text-sm text-red-600">{formErrors.suministroMateriales}</p>}
                  </div>

                  {/* Capacidad de adaptarse */}
                  <div>
                    <label htmlFor="capacidadAdaptarse" className="block text-sm font-medium text-gray-700 mb-2">
                      <LightBulbIcon className="inline-block h-5 w-5 mr-1 text-red-500" />
                      ¿Qué tan preparada está tu empresa para adaptarse rápidamente a esta situación de emergencia? (1 = Nada preparada, 5 = Muy preparada) *
                    </label>
                    <select id="capacidadAdaptarse" name="capacidadAdaptarse" value={datos.capacidadAdaptarse} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.capacidadAdaptarse ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Selecciona una opción</option>
                      <option value="1">1 - Nada preparada</option>
                      <option value="2">2 - Poco preparada</option>
                      <option value="3">3 - Moderadamente preparada</option>
                      <option value="4">4 - Bien preparada</option>
                      <option value="5">5 - Muy preparada</option>
                    </select>
                    {formErrors.capacidadAdaptarse && <p className="mt-1 text-sm text-red-600">{formErrors.capacidadAdaptarse}</p>}
                  </div>

                  {/* Apoyo externo */}
                  <div>
                    <label htmlFor="apoyoExterno" className="block text-sm font-medium text-gray-700 mb-2">
                      <HandRaisedIcon className="inline-block h-5 w-5 mr-1 text-red-500" />
                      ¿Has buscado apoyo externo (consultores, abogados, etc.) para esta situación? *
                    </label>
                    <select id="apoyoExterno" name="apoyoExterno" value={datos.apoyoExterno} onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${formErrors.apoyoExterno ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Selecciona una opción</option>
                      <option value="Si">Sí</option>
                      <option value="No">No</option>
                      <option value="Estoy buscando">Estoy buscando</option>
                    </select>
                    {formErrors.apoyoExterno && <p className="mt-1 text-sm text-red-600">{formErrors.apoyoExterno}</p>}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar Diagnóstico de Emergencia"}
            </button>
          </form>

          {/* Sección de Resultados del Análisis (se muestra solo si hay análisis) */}
          {analisis && (
            <div className="mt-10 p-8 bg-red-100 rounded-xl shadow-lg border border-red-300 animate__animated animate__fadeInUp">
              <h2 className="text-3xl font-extrabold text-red-800 mb-6 text-center">
                Resultados del Diagnóstico
              </h2>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-red-700 mb-3">
                  Diagnóstico Rápido:
                </h3>
                <p className="text-gray-800 leading-relaxed bg-red-50 p-4 rounded-lg border border-red-200">
                  {analisis.diagnostico_rapido}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-red-700 mb-3">
                  Acciones Inmediatas Sugeridas:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-800 bg-red-50 p-4 rounded-lg border border-red-200">
                  {analisis.acciones_inmediatas.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-red-700 mb-3">
                  Nivel de Riesgo General:
                </h3>
                <p className={`text-3xl font-bold ${getRiesgoColor(analisis.riesgo_general)} bg-red-50 p-4 rounded-lg border border-red-200 inline-block`}>
                  {analisis.riesgo_general.toUpperCase()}
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-red-700 mb-3">
                  Recomendaciones Clave:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-800 bg-red-50 p-4 rounded-lg border border-red-200">
                  {analisis.recomendaciones_clave.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              <p className="mt-8 text-center text-gray-600 italic">
                Un consultor se pondrá en contacto contigo para discutir estos resultados en detalle.
              </p>
            </div>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
};

export default DiagnosticoEmergencia;
