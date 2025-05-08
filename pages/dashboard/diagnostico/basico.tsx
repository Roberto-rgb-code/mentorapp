import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../../contexts/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import PrivateLayout from "../../../components/layout/PrivateLayout";
import "animate.css";

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
  const [mensaje, setMensaje] = useState<{ error?: string; success?: string }>({});
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({
    bloque1: true,
    bloque2: false,
    bloque3: false,
    bloque4: false,
    bloque5: false,
  });

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
    if (datos.problemas.some((p) => !p.trim())) errors.problemas = "Tres problemas requeridos";
    if (!datos.intentoResolver) errors.intentoResolver = "Requerido";
    if (!datos.expectativasConsultoria) errors.expectativasConsultoria = "Requerido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* -------------------------- Submit --------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMensaje({ error: "Debes iniciar sesión." });
      return;
    }
    if (!validateForm()) {
      setMensaje({ error: "Completa los campos obligatorios." });
      return;
    }

    try {
      await setDoc(doc(db, "diagnosticos", `${user.uid}_basico`), {
        ...datos,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
      setMensaje({ success: "Diagnóstico guardado." });
      setTimeout(() => router.push("/dashboard/inicio"), 2000);
    } catch (error) {
      console.error(error);
      setMensaje({ error: "Error al guardar." });
    }
  };

  /* ------------------------------------------------------------------ */
  return (
    <PrivateLayout>
      <div className="container mx-auto px-4 py-10 bg-gray-100 min-h-screen animate__animated animate__fadeIn">
        <h1 className="text-4xl font-bold text-blue-900 mb-6 text-center">
          Diagnóstico Básico
        </h1>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Completa este formulario para que comprendamos el contexto de tu negocio y podamos ofrecerte el mejor acompañamiento.
        </p>

        {/* Mensajes */}
        {mensaje.error && <p className="text-red-500 text-center mb-6">{mensaje.error}</p>}
        {mensaje.success && <p className="text-green-600 text-center mb-6">{mensaje.success}</p>}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto border border-gray-200">
          {/* Bloque 1 */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
              onClick={() => toggleBlock("bloque1")}
            >
              <h3 className="text-xl font-semibold text-blue-900">1. Información general</h3>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${
                  expandedBlocks.bloque1 ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
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
                    formErrors.motivacionNegocio ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Cuéntanos brevemente qué te motivó a emprender"
                />
                {formErrors.motivacionNegocio && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.motivacionNegocio}</p>
                )}

                <label className="block mt-4 mb-2 text-gray-600 font-medium">
                  Nombre del negocio *
                </label>
                <input
                  name="businessName"
                  value={datos.businessName}
                  onChange={handleChange}
                  className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.businessName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingresa el nombre de tu negocio"
                />
                {formErrors.businessName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.businessName}</p>
                )}
              </div>
            )}
          </div>

          {/* Bloque 2 */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
              onClick={() => toggleBlock("bloque2")}
            >
              <h3 className="text-xl font-semibold text-blue-900">2. Etapa actual de tu negocio</h3>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${
                  expandedBlocks.bloque2 ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {expandedBlocks.bloque2 && (
              <div className="p-4 bg-gray-50 rounded-lg mt-2 animate__animated animate__fadeIn">
                {[
                  "Ideación",
                  "Validación",
                  "Puesta en marcha",
                  "Formalización",
                  "Crecimiento",
                  "Reinvención o salida",
                ].map((stage) => (
                  <label key={stage} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="businessStage"
                      value={stage}
                      checked={datos.businessStage === stage}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-600">{stage}</span>
                  </label>
                ))}
                {formErrors.businessStage && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.businessStage}</p>
                )}
              </div>
            )}
          </div>

          {/* Bloque 3 */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
              onClick={() => toggleBlock("bloque3")}
            >
              <h3 className="text-xl font-semibold text-blue-900">3. Problemas principales</h3>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${
                  expandedBlocks.bloque3 ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {expandedBlocks.bloque3 && (
              <div className="p-4 bg-gray-50 rounded-lg mt-2 animate__animated animate__fadeIn">
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
                    placeholder={`Problema ${i + 1}`}
                  />
                ))}
                {formErrors.problemas && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.problemas}</p>
                )}
              </div>
            )}
          </div>

          {/* Bloque 4 */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
              onClick={() => toggleBlock("bloque4")}
            >
              <h3 className="text-xl font-semibold text-blue-900">4. Intentos de solución</h3>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${
                  expandedBlocks.bloque4 ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {expandedBlocks.bloque4 && (
              <div className="p-4 bg-gray-50 rounded-lg mt-2 animate__animated animate__fadeIn">
                <textarea
                  name="intentoResolver"
                  value={datos.intentoResolver}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.intentoResolver ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Describe qué has hecho, si funcionó y por qué crees que no"
                />
                {formErrors.intentoResolver && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.intentoResolver}</p>
                )}
              </div>
            )}
          </div>

          {/* Bloque 5 */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
              onClick={() => toggleBlock("bloque5")}
            >
              <h3 className="text-xl font-semibold text-blue-900">5. Expectativas de consultoría</h3>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${
                  expandedBlocks.bloque5 ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {expandedBlocks.bloque5 && (
              <div className="p-4 bg-gray-50 rounded-lg mt-2 animate__animated animate__fadeIn">
                <textarea
                  name="expectativasConsultoria"
                  value={datos.expectativasConsultoria}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.expectativasConsultoria ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Describe qué esperas lograr al recibir acompañamiento empresarial"
                />
                {formErrors.expectativasConsultoria && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.expectativasConsultoria}</p>
                )}
              </div>
            )}
          </div>

          {/* Botón */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-300"
            >
              Guardar Diagnóstico
            </button>
          </div>
        </form>
      </div>
    </PrivateLayout>
  );
};

export default DiagnosticoBasico;
