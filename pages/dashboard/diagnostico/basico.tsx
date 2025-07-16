import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../../contexts/AuthContext";
import PrivateLayout from "../../../components/layout/PrivateLayout";
import "animate.css"; // Ensure animate.css is imported
import {
  SparklesIcon,
  LightBulbIcon,
  ChartBarIcon,
  // Adjusted import path for Heroicons v2
  XCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid"; // <--- CHANGED THIS LINE

interface DiagnosticoBasicoData {
  userId: string;
  motivacionNegocio: string;
  businessName: string;
  businessStage: string;
  problemas: string[];
  intentoResolver: string;
  expectativasConsultoria: string;
  createdAt: string;
}

// Define the interface for the LLM analysis result based on your previous image
interface LLMAnalysisResult {
  fortalezas: string[];
  areas_oportunidad: string[];
  score: number;
  recomendaciones: string[];
}

const DiagnosticoBasico = () => {
  const { user } = useAuth();
  const router = useRouter();

  /* ----------------------- Estados del formulario ----------------------- */
  const [datos, setDatos] = useState<DiagnosticoBasicoData>({
    userId: user?.uid || "",
    motivacionNegocio: "",
    businessName: "",
    businessStage: "",
    problemas: ["", "", ""],
    intentoResolver: "",
    expectativasConsultoria: "",
    createdAt: new Date().toISOString(),
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState<{ error?: string; success?: string }>(
    {}
  );
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>(
    {
      bloque1: true,
      bloque2: false,
      bloque3: false,
      bloque4: false,
      bloque5: false,
    }
  );
  // New state for API analysis result, typed with LLMAnalysisResult
  const [analisis, setAnalisis] = useState<LLMAnalysisResult | null>(null);
  // New state for loading indicator
  const [isLoading, setIsLoading] = useState(false);

  /* --------------------------- Helpers UI --------------------------- */
  const toggleBlock = (block: string) =>
    setExpandedBlocks((prev) => ({ ...prev, [block]: !prev[block] }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    const { name, value } = e.target;
    setDatos((prev) => {
      if (name === "problemas" && index !== undefined) {
        const nuevos = [...prev.problemas];
        nuevos[index] = value;
        return { ...prev, problemas: nuevos };
      }
      return { ...prev, [name]: value } as DiagnosticoBasicoData;
    });

    setFormErrors((prev) => {
      const n = { ...prev };
      delete n[name];
      return n;
    });
  };

  /* -------------------------- Validación --------------------------- */
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!datos.motivacionNegocio) errors.motivacionNegocio = "Requerido";
    if (!datos.businessName) errors.businessName = "Requerido";
    if (!datos.businessStage) errors.businessStage = "Requerido";
    // Ensure all three problem fields have some content after trimming
    if (datos.problemas.some((p) => !p.trim()))
      errors.problemas = "Tres problemas requeridos";
    if (!datos.intentoResolver) errors.intentoResolver = "Requerido";
    if (!datos.expectativasConsultoria)
      errors.expectativasConsultoria = "Requerido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* -------------------------- Submit --------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous analysis results and messages
    setAnalisis(null);
    setMensaje({});

    if (!user) {
      setMensaje({ error: "Debes iniciar sesión para realizar el diagnóstico." });
      return;
    }
    if (!validateForm()) {
      setMensaje({
        error: "Por favor, completa todos los campos obligatorios antes de enviar.",
      });
      return;
    }

    setIsLoading(true); // Start loading

    try {
      // Call FastAPI backend API for analysis
      const res = await fetch("http://127.0.0.1:8000/api/diagnostico/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // You might add an Authorization header here if your API is secured
          // 'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...datos,
          userId: user.uid, // Ensure userId is sent with the data
          createdAt: new Date().toISOString(), // Ensure createdAt is updated on submission
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error en el análisis del diagnóstico.");
      }

      const analysisData: LLMAnalysisResult = await res.json(); // Type assertion
      setAnalisis(analysisData);
      setMensaje({ success: "¡Diagnóstico enviado y analizado correctamente!" });
    } catch (err: any) {
      console.error("Error al procesar el diagnóstico:", err);
      setMensaje({
        error:
          err.message ||
          "No se pudo procesar el diagnóstico. Intenta de nuevo más tarde.",
      });
    } finally {
      setIsLoading(false); // End loading
    }
  };

  /* ------------------------------------------------------------------ */
  return (
    <PrivateLayout>
      <div className="container mx-auto px-4 py-10 bg-gray-100 min-h-screen animate__animated animate__fadeIn">
        <h1 className="text-4xl font-bold text-blue-900 mb-6 text-center">
          Diagnóstico Básico Empresarial
        </h1>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Completa este formulario para que comprendamos el contexto de tu
          negocio y podamos ofrecerte el mejor acompañamiento. Una vez enviado,
          un modelo de lenguaje analizará tus respuestas para brindarte una
          visión inicial.
        </p>

        {/* Mensajes */}
        {mensaje.error && (
          <p className="text-red-500 text-center mb-6 font-medium flex items-center justify-center">
            <XCircleIcon className="h-5 w-5 mr-2" />
            {mensaje.error}
          </p>
        )}
        {mensaje.success && (
          <p className="text-green-600 text-center mb-6 font-medium flex items-center justify-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {mensaje.success}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto border border-gray-200"
        >
          {/* Bloque 1: Información general */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
              onClick={() => toggleBlock("bloque1")}
            >
              <h3 className="text-xl font-semibold text-blue-900">
                1. Información general
              </h3>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${
                  expandedBlocks.bloque1 ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {expandedBlocks.bloque1 && (
              <div className="p-4 bg-gray-50 rounded-lg mt-2 animate__animated animate__fadeIn">
                <label className="block mb-2 text-gray-600 font-medium">
                  ¿Por qué comenzaste tu negocio? *
                </label>
                <textarea
                  name="motivacionNegocio"
                  value={datos.motivacionNegocio}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.motivacionNegocio
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Cuéntanos brevemente qué te motivó a emprender, cuál es tu pasión o necesidad que buscas resolver."
                />
                {formErrors.motivacionNegocio && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.motivacionNegocio}
                  </p>
                )}

                <label className="block mt-4 mb-2 text-gray-600 font-medium">
                  Nombre del negocio *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={datos.businessName}
                  onChange={handleChange}
                  className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.businessName
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Ingresa el nombre oficial o provisional de tu negocio."
                />
                {formErrors.businessName && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.businessName}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bloque 2: Etapa actual de tu negocio */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
              onClick={() => toggleBlock("bloque2")}
            >
              <h3 className="text-xl font-semibold text-blue-900">
                2. Etapa actual de tu negocio
              </h3>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${
                  expandedBlocks.bloque2 ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {expandedBlocks.bloque2 && (
              <div className="p-4 bg-gray-50 rounded-lg mt-2 animate__animated animate__fadeIn">
                <p className="mb-3 text-gray-600">
                  ¿En qué fase de desarrollo se encuentra tu emprendimiento o
                  negocio? *
                </p>
                {[
                  "Ideación (recién estoy pensando la idea)",
                  "Validación (probando si la idea funciona en el mercado)",
                  "Puesta en marcha (negocio operando, primeros clientes)",
                  "Formalización (ya establecido, buscando crecer con estructura)",
                  "Crecimiento (escalando operaciones, expandiendo mercado)",
                  "Reinvención o salida (buscando pivotar o planificando una transición)",
                ].map((stage) => (
                  <label key={stage} className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="radio"
                      name="businessStage"
                      value={stage}
                      checked={datos.businessStage === stage}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700">{stage}</span>
                  </label>
                ))}
                {formErrors.businessStage && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.businessStage}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bloque 3: Problemas principales */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
              onClick={() => toggleBlock("bloque3")}
            >
              <h3 className="text-xl font-semibold text-blue-900">
                3. Problemas principales
              </h3>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${
                  expandedBlocks.bloque3 ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {expandedBlocks.bloque3 && (
              <div className="p-4 bg-gray-50 rounded-lg mt-2 animate__animated animate__fadeIn">
                <p className="mb-3 text-gray-600">
                  Identifica los tres desafíos más grandes que enfrenta tu
                  negocio actualmente. *
                </p>
                {[0, 1, 2].map((i) => (
                  <textarea
                    key={i}
                    name="problemas"
                    value={datos.problemas[i]}
                    onChange={(e) => handleChange(e, i)}
                    rows={2}
                    className={`w-full border rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.problemas ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={`Problema ${
                      i + 1
                    }: Sé específico, por ejemplo, 'Dificultad para atraer nuevos clientes' o 'Problemas con la gestión de inventario'.`}
                  />
                ))}
                {formErrors.problemas && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.problemas}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bloque 4: Intentos de solución */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
              onClick={() => toggleBlock("bloque4")}
            >
              <h3 className="text-xl font-semibold text-blue-900">
                4. Intentos de solución
              </h3>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${
                  expandedBlocks.bloque4 ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {expandedBlocks.bloque4 && (
              <div className="p-4 bg-gray-50 rounded-lg mt-2 animate__animated animate__fadeIn">
                <label className="block mb-2 text-gray-600 font-medium">
                  ¿Qué has intentado para resolver estos problemas y cuál fue el
                  resultado? *
                </label>
                <textarea
                  name="intentoResolver"
                  value={datos.intentoResolver}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.intentoResolver
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Describe qué acciones tomaste, si funcionaron (o no) y por qué crees que obtuviste esos resultados."
                />
                {formErrors.intentoResolver && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.intentoResolver}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bloque 5: Expectativas de consultoría */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
              onClick={() => toggleBlock("bloque5")}
            >
              <h3 className="text-xl font-semibold text-blue-900">
                5. Expectativas de consultoría
              </h3>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${
                  expandedBlocks.bloque5 ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {expandedBlocks.bloque5 && (
              <div className="p-4 bg-gray-50 rounded-lg mt-2 animate__animated animate__fadeIn">
                <label className="block mb-2 text-gray-600 font-medium">
                  ¿Qué esperas lograr al recibir acompañamiento empresarial? *
                </label>
                <textarea
                  name="expectativasConsultoria"
                  value={datos.expectativasConsultoria}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.expectativasConsultoria
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Describe tus metas o los resultados que te gustaría ver después de la consultoría."
                />
                {formErrors.expectativasConsultoria && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.expectativasConsultoria}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Botón de Enviar */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading} // Disable button when loading
            >
              {isLoading ? "Analizando Diagnóstico..." : "Enviar Diagnóstico y Analizar"}
            </button>
          </div>
        </form>

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="flex justify-center items-center mt-8 p-6 bg-blue-50 rounded-xl shadow-lg animate__animated animate__fadeIn">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mr-4"></div>
            <p className="text-blue-700 text-lg font-semibold">
              Analizando tu negocio con IA... ¡Un momento por favor!
            </p>
          </div>
        )}

        {/* ANÁLISIS DE LA API (Improved Display) */}
        {analisis && !isLoading && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl shadow-2xl mt-8 max-w-4xl mx-auto animate__animated animate__fadeInUp">
            <h3 className="text-3xl font-extrabold text-blue-900 mb-6 text-center">
              Resultados del Análisis del LLM
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-lg border border-green-200 shadow-md transform hover:scale-105 transition duration-300">
                <h4 className="text-xl font-bold text-green-700 mb-3 flex items-center">
                  <CheckCircleIcon className="w-6 h-6 mr-2 text-green-500" />
                  Fortalezas
                </h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {analisis.fortalezas.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-5 rounded-lg border border-yellow-200 shadow-md transform hover:scale-105 transition duration-300">
                <h4 className="text-xl font-bold text-yellow-700 mb-3 flex items-center">
                  <ExclamationCircleIcon className="w-6 h-6 mr-2 text-yellow-500" />
                  Áreas de Oportunidad
                </h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {analisis.areas_oportunidad.map((ao, i) => (
                    <li key={i}>{ao}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-blue-200 shadow-md mt-6 text-center transform hover:scale-105 transition duration-300">
              <h4 className="text-xl font-bold text-blue-700 mb-3 flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 mr-2 text-blue-500" />
                Score del Diagnóstico
              </h4>
              <p className="text-4xl font-extrabold text-blue-800">
                {analisis.score}
              </p>
              <p className="text-gray-600">
                Este score refleja la salud general de tu negocio.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-purple-200 shadow-md mt-6 transform hover:scale-105 transition duration-300">
              <h4 className="text-xl font-bold text-purple-700 mb-3 flex items-center">
                <LightBulbIcon className="w-6 h-6 mr-2 text-purple-500" />
                Recomendaciones Clave
              </h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {analisis.recomendaciones.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};

export default DiagnosticoBasico;