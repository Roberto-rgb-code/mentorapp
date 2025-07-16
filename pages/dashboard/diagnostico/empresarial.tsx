// pages/dashboard/diagnostico/empresarial.tsx

import { useState, useEffect, ChangeEvent, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import PrivateLayout from "../../../components/layout/PrivateLayout";
import "animate.css"; // Assuming you have animate.css installed and configured
import jsPDF from "jspdf";
import html2canvas from 'html2canvas-pro';
import {
  XCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BookOpenIcon,
  LightBulbIcon, // Estrategia
  ChartBarIcon, // Finanzas
  MegaphoneIcon, // Marketing
  Cog6ToothIcon, // Operaciones
  ComputerDesktopIcon, // Tecnología
  ShieldCheckIcon, // Legal
  UsersIcon, // Recursos Humanos
  ScaleIcon, // General for some aspect
  CurrencyDollarIcon, // General for some aspect
  PencilSquareIcon, // Added for Edit
  TrashIcon, // Added for Delete
  PlusCircleIcon, // Added for "New Diagnostic" button
} from "@heroicons/react/24/solid"; // Import specific icons

// Define the interface for the comprehensive LLM analysis result
interface LLMAnalysisResult {
  resumen_ejecutivo: string;
  semaforo_riesgo: {
    estrategia?: "verde" | "amarillo" | "rojo";
    finanzas?: "verde" | "amarillo" | "rojo";
    marketing?: "verde" | "amarillo" | "rojo";
    operaciones?: "verde" | "amarillo" | "rojo";
    tecnologia?: "verde" | "amarillo" | "rojo";
    legal?: "verde" | "amarillo" | "rojo";
    recursos_humanos?: "verde" | "amarillo" | "rojo";
    // Making these optional with '?' because the LLM might not always return all of them
    // Or you might want to provide default fallbacks
  };
  fortalezas: string[];
  areas_oportunidad: string[];
  recomendaciones: string[];
  score_global: number;
}

// Ensure default structure for semaforo_riesgo
const defaultSemaforoRiesgo: LLMAnalysisResult['semaforo_riesgo'] = {
  estrategia: "rojo",
  finanzas: "rojo",
  marketing: "rojo",
  operaciones: "rojo",
  tecnologia: "rojo",
  legal: "rojo",
  recursos_humanos: "rojo",
};


interface DiagnosticoData {
  userId: string;
  nombreCompleto: string;
  nombreEmpresa: string;
  tipoNegocio: string;
  tiempoOperacion: string;
  facturacionAnual: string;
  situacionFinanciera: string;
  accesoFinanciamiento: string;
  flujoEfectivo: string;
  gestionFinanciera: string; // Changed from retoGestionFinanciera for consistency
  propuestaValor: string;
  modeloNegocio: string;
  ventajaCompetitiva: string;
  innovacionProducto: string;
  estrategiaMarketing: string;
  perfilesClientes: string;
  cierreVentas: string;
  retoComercial: string;
  procesosDocumentados: string;
  herramientasControl: string;
  eficienciaOperacion: string;
  obstaculoOperativo: string;
  numeroPersonas: string;
  sistemaGestionRH: string;
  retoGestionPersonas: string;
  herramientasDigitales: string;
  retoTecnologico: string;
  claridadFiscalLegal: string;
  contratosPoliticas: string;
  createdAt: string;
  // Add an optional field for the analysis result directly in the saved data
  analysisResult?: LLMAnalysisResult;
}

const initialDiagnostico: DiagnosticoData = {
  userId: "",
  nombreCompleto: "",
  nombreEmpresa: "",
  tipoNegocio: "",
  tiempoOperacion: "",
  facturacionAnual: "",
  situacionFinanciera: "",
  accesoFinanciamiento: "",
  flujoEfectivo: "",
  gestionFinanciera: "",
  propuestaValor: "",
  modeloNegocio: "",
  ventajaCompetitiva: "",
  innovacionProducto: "",
  estrategiaMarketing: "",
  perfilesClientes: "",
  cierreVentas: "",
  retoComercial: "",
  procesosDocumentados: "",
  herramientasControl: "",
  eficienciaOperacion: "",
  obstaculoOperativo: "",
  numeroPersonas: "",
  sistemaGestionRH: "",
  retoGestionPersonas: "",
  herramientasDigitales: "",
  retoTecnologico: "",
  claridadFiscalLegal: "",
  contratosPoliticas: "",
  createdAt: "",
};

const DiagnosticoEmpresarial = () => {
  const { user } = useAuth(); // Assuming useAuth provides a 'user' object with 'uid'
  const [diagnostico, setDiagnostico] =
    useState<DiagnosticoData>(initialDiagnostico);
  const [expandedBlocks, setExpandedBlocks] = useState<{
    [key: string]: boolean;
  }>({
    bloque1: true, // Expand the first block by default
    bloque2: false,
    bloque3: false,
    bloque4: false,
    bloque5: false,
    bloque6: false,
    bloque7: false,
    bloque8: false,
    bloque9: false,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [mensaje, setMensaje] = useState<{ error?: string; success?: string }>(
    {}
  );
  // Type analysis with the new LLMAnalysisResult interface
  const [analisis, setAnalisis] = useState<LLMAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticosList, setDiagnosticosList] = useState<DiagnosticoData[]>(
    []
  );
  const [showForm, setShowForm] = useState(true);
  const [selectedDiagnostico, setSelectedDiagnostico] =
    useState<DiagnosticoData | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // Ref for the analysis report section to be captured as PDF
  const analysisReportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    handleLoadFromLocalStorage();
  }, []);

  const toggleBlock = (blockName: string) => {
    setExpandedBlocks((prev) => ({
      ...prev,
      [blockName]: !prev[blockName],
    }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDiagnostico((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for the current field as soon as it's changed
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    // Iterate over each field in initialDiagnostico to check if it's filled
    // This is a more dynamic way to validate
    for (const key in initialDiagnostico) {
      // Exclude userId and createdAt from validation as they are set programmatically
      if (key !== 'userId' && key !== 'createdAt' && key !== 'analysisResult') {
        const value = diagnostico[key as keyof DiagnosticoData];
        // Check if value is empty string, null, or undefined
        if (typeof value === 'string' && value.trim() === '') {
          errors[key] = `El campo '${key.replace(/([A-Z])/g, ' $1').toLowerCase()}' es obligatorio.`;
        }
      }
    }

    // Specific messages for known fields if you prefer them over generic ones
    if (!diagnostico.nombreCompleto.trim()) {
      errors.nombreCompleto = "El nombre completo es obligatorio.";
    }
    if (!diagnostico.nombreEmpresa.trim()) {
      errors.nombreEmpresa = "El nombre de la empresa es obligatorio.";
    }
    // ... continue with specific error messages if desired, otherwise the loop above handles it.
    // The specific checks below are redundant if the loop above is kept, but they provide
    // more user-friendly messages for key fields. Keep them if you want specific messages.
    if (!diagnostico.tipoNegocio) errors.tipoNegocio = "Selecciona un tipo de negocio.";
    if (!diagnostico.tiempoOperacion) errors.tiempoOperacion = "Selecciona el tiempo de operación.";
    if (!diagnostico.facturacionAnual) errors.facturacionAnual = "Selecciona la facturación anual.";
    if (!diagnostico.situacionFinanciera) errors.situacionFinanciera = "Selecciona la situación financiera.";
    if (!diagnostico.accesoFinanciamiento) errors.accesoFinanciamiento = "Selecciona el acceso a financiamiento.";
    if (!diagnostico.flujoEfectivo) errors.flujoEfectivo = "Selecciona el flujo de efectivo.";
    if (!diagnostico.gestionFinanciera) errors.gestionFinanciera = "Selecciona la gestión financiera.";
    if (!diagnostico.propuestaValor) errors.propuestaValor = "Selecciona la propuesta de valor.";
    if (!diagnostico.modeloNegocio) errors.modeloNegocio = "Selecciona el modelo de negocio.";
    if (!diagnostico.ventajaCompetitiva) errors.ventajaCompetitiva = "Selecciona la ventaja competitiva.";
    if (!diagnostico.innovacionProducto) errors.innovacionProducto = "Selecciona la innovación de producto.";
    if (!diagnostico.estrategiaMarketing) errors.estrategiaMarketing = "Selecciona la estrategia de marketing.";
    if (!diagnostico.perfilesClientes) errors.perfilesClientes = "Selecciona la definición de perfiles de clientes.";
    if (!diagnostico.cierreVentas) errors.cierreVentas = "Selecciona cómo cierras tus ventas.";
    if (!diagnostico.retoComercial) errors.retoComercial = "Selecciona el principal reto comercial.";
    if (!diagnostico.procesosDocumentados) errors.procesosDocumentados = "Selecciona si tienes procesos documentados.";
    if (!diagnostico.herramientasControl) errors.herramientasControl = "Selecciona tus herramientas de control.";
    if (!diagnostico.eficienciaOperacion) errors.eficienciaOperacion = "Selecciona cómo evalúas la eficiencia operativa.";
    if (!diagnostico.obstaculoOperativo) errors.obstaculoOperativo = "Selecciona el obstáculo operativo más frecuente.";
    if (!diagnostico.numeroPersonas) errors.numeroPersonas = "Selecciona el número de personas que trabajan contigo.";
    if (!diagnostico.sistemaGestionRH) errors.sistemaGestionRH = "Selecciona el sistema de gestión de RH.";
    if (!diagnostico.retoGestionPersonas) errors.retoGestionPersonas = "Selecciona el reto en gestión de personas.";
    if (!diagnostico.herramientasDigitales) errors.herramientasDigitales = "Selecciona tus herramientas digitales.";
    if (!diagnostico.retoTecnologico) errors.retoTecnologico = "Selecciona tu mayor reto tecnológico.";
    if (!diagnostico.claridadFiscalLegal) errors.claridadFiscalLegal = "Selecciona tu claridad fiscal y legal.";
    if (!diagnostico.contratosPoliticas) errors.contratosPoliticas = "Selecciona sobre tus contratos y políticas.";


    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveToLocalStorage = (data: DiagnosticoData[]) => {
    localStorage.setItem("diagnosticos", JSON.stringify(data));
  };

  const handleLoadFromLocalStorage = () => {
    const storedDiagnosticos = localStorage.getItem("diagnosticos");
    if (storedDiagnosticos) {
      setDiagnosticosList(JSON.parse(storedDiagnosticos));
    }
  };

  const submitDiagnostico = async () => {
    setMensaje({}); // Clear previous messages
    setAnalisis(null); // Clear previous analysis

    if (!user) {
      setMensaje({ error: "Debes iniciar sesión para guardar el diagnóstico." });
      return;
    }

    if (!validateForm()) {
      // Scroll to the first error if validation fails
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      setMensaje({ error: "Por favor, completa todos los campos requeridos." });
      return;
    }

    setIsLoading(true);
    const diagnosticoToSave = {
      ...diagnostico,
      userId: user.uid, // Assuming user.uid is available from useAuth()
      createdAt: editingKey || new Date().toISOString(), // Use existing key for edit, new for create
    };

    try {
      // API call to analyze the diagnostic (your backend's analyze endpoint)
      const res = await fetch("http://127.0.0.1:8000/api/diagnostico/analyze", { // Changed to /analyze as per your API docs
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diagnosticoToSave),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.detail || "Error en el análisis del diagnóstico."
        );
      }

      const analysisData: LLMAnalysisResult = await res.json(); // Cast to the new interface
      setAnalisis(analysisData); // Store the analysis results

      let updatedList;
      if (editingKey) {
        updatedList = diagnosticosList.map((diag) =>
          diag.createdAt === editingKey
            ? { ...diagnosticoToSave, analysisResult: analysisData } // Save analysis with the data
            : diag
        );
        setEditingKey(null);
        setMensaje({ success: "Diagnóstico actualizado y analizado correctamente." });
      } else {
        updatedList = [...diagnosticosList, { ...diagnosticoToSave, analysisResult: analysisData }]; // Save analysis with the new data
        setMensaje({ success: "Diagnóstico guardado y analizado correctamente." });
      }

      setDiagnosticosList(updatedList);
      handleSaveToLocalStorage(updatedList);
      setDiagnostico(initialDiagnostico); // Reset form
      setShowForm(false); // After submission, show the list
      setSelectedDiagnostico(null); // Ensure no old detailed view is shown
    } catch (err: any) {
      console.error("Error al procesar el diagnóstico:", err);
      setMensaje({
        error:
          err.message || "No se pudo guardar ni analizar el diagnóstico. Intenta de nuevo más tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const editDiagnostico = (key: string) => {
    const diagToEdit = diagnosticosList.find((diag) => diag.createdAt === key);
    if (diagToEdit) {
      setDiagnostico(diagToEdit);
      setEditingKey(key);
      setShowForm(true);
      setSelectedDiagnostico(null);
      setAnalisis(diagToEdit.analysisResult || null); // Load existing analysis if available
      setMensaje({}); // Clear messages
      // Optionally expand all blocks when editing
      setExpandedBlocks({
        bloque1: true,
        bloque2: true,
        bloque3: true,
        bloque4: true,
        bloque5: true,
        bloque6: true,
        bloque7: true,
        bloque8: true,
        bloque9: true,
      });
    }
  };

  const deleteDiagnostico = (key: string) => {
    setMensaje({}); // Clear messages
    if (window.confirm("¿Estás seguro de que quieres eliminar este diagnóstico?")) {
      const updatedList = diagnosticosList.filter((diag) => diag.createdAt !== key);
      setDiagnosticosList(updatedList);
      handleSaveToLocalStorage(updatedList);
      setMensaje({ success: "Diagnóstico eliminado correctamente." });
      if (selectedDiagnostico?.createdAt === key) {
        setSelectedDiagnostico(null);
      }
      if (editingKey === key) {
        setEditingKey(null);
        setDiagnostico(initialDiagnostico);
      }
      setShowForm(false); // Go back to showing the list after deletion
      setAnalisis(null); // Clear analysis
    }
  };

  const viewDiagnostico = (diag: DiagnosticoData) => {
    setSelectedDiagnostico(diag);
    setAnalisis(diag.analysisResult || null); // Load analysis if it exists
    setShowForm(false);
    setEditingKey(null);
    setMensaje({}); // Clear messages
  };

  // Function to generate PDF (Client-side with html2canvas and jspdf)
  const generatePdfReport = async () => {
    if (!analysisReportRef.current) {
      setMensaje({ error: "No se pudo generar el PDF. El contenido de análisis no está visible." });
      return;
    }
    if (!analisis) {
      setMensaje({ error: "No hay un análisis disponible para generar el PDF." });
      return;
    }

    setIsLoading(true);
    setMensaje({});

    try {
      const input = analysisReportRef.current;
      const canvas = await html2canvas(input, {
        scale: 2, // Increase scale for better resolution
        useCORS: true, // If you have images from other origins (e.g., if you display images from external URLs)
        logging: true, // Enable logging for debugging
        allowTaint: true, // Allow images from other origins to be drawn on the canvas
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4"); // 'p' for portrait, 'mm' for millimeters, 'a4' size
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pageHeight; // Corrected position calculation for subsequent pages
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Reporte_Diagnostico_Empresarial_${selectedDiagnostico?.nombreEmpresa || 'TuNegocio'}.pdf`);
      setMensaje({ success: "Reporte PDF generado exitosamente." });
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      setMensaje({ error: `Error al generar el PDF: ${error.message || 'Inténtalo de nuevo.'}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get traffic light color
  const getTrafficLightColor = (status: "verde" | "amarillo" | "rojo" | undefined) => {
    switch (status) {
      case "verde":
        return "bg-green-500";
      case "amarillo":
        return "bg-yellow-500";
      case "rojo":
        return "bg-red-500";
      default:
        return "bg-gray-400"; // Default color if status is undefined or unexpected
    }
  };

  // Helper to get traffic light text
  const getTrafficLightText = (status: "verde" | "amarillo" | "rojo" | undefined) => {
    switch (status) {
      case "verde":
        return "Óptimo";
      case "amarillo":
        return "Atención";
      case "rojo":
        return "Crítico";
      default:
        return "N/A"; // Default text if status is undefined or unexpected
    }
  };

  // Map for semaforo_riesgo areas to display names and icons
  const semaforoAreasMap = {
    estrategia: { name: "Estrategia", icon: <LightBulbIcon className="h-5 w-5 mr-2 text-blue-700" /> },
    finanzas: { name: "Finanzas", icon: <ChartBarIcon className="h-5 w-5 mr-2 text-green-700" /> },
    marketing: { name: "Marketing", icon: <MegaphoneIcon className="h-5 w-5 mr-2 text-purple-700" /> },
    operaciones: { name: "Operaciones", icon: <Cog6ToothIcon className="h-5 w-5 mr-2 text-indigo-700" /> },
    tecnologia: { name: "Tecnología", icon: <ComputerDesktopIcon className="h-5 w-5 mr-2 text-gray-700" /> },
    legal: { name: "Legal", icon: <ShieldCheckIcon className="h-5 w-5 mr-2 text-yellow-700" /> },
    recursos_humanos: { name: "Recursos Humanos", icon: <UsersIcon className="h-5 w-5 mr-2 text-red-700" /> },
  };

  return (
    <PrivateLayout>
      <div className="container mx-auto px-4 py-10 bg-gray-100 min-h-screen animate__animated animate__fadeIn">
        <h1 className="text-4xl font-bold text-blue-900 mb-6 text-center">
          Diagnóstico Empresarial Completo
        </h1>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Responde estas preguntas detalladas para obtener un análisis integral
          de las áreas clave de tu negocio. Al finalizar, recibirás un reporte
          personalizado y la opción de descargarlo en PDF.
        </p>

        {mensaje.error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 max-w-4xl mx-auto flex items-center"
            role="alert"
          >
            <XCircleIcon className="h-5 w-5 mr-2" />
            <strong className="font-bold mr-1">Error:</strong>
            <span className="block sm:inline"> {mensaje.error}</span>
          </div>
        )}
        {mensaje.success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 max-w-4xl mx-auto flex items-center"
            role="alert"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <strong className="font-bold mr-1">Éxito:</strong>
            <span className="block sm:inline"> {mensaje.success}</span>
          </div>
        )}

        {/* Diagnostic List View */}
        {!showForm && !selectedDiagnostico && (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate__animated animate__fadeIn">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
              Tus Diagnósticos Anteriores
            </h2>
            {diagnosticosList.length === 0 ? (
              <p className="text-gray-600 text-center">
                Aún no tienes diagnósticos guardados. ¡Empieza uno nuevo!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-sm font-medium text-blue-800 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-blue-800 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-blue-800 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="py-3 px-6 text-center text-sm font-medium text-blue-800 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {diagnosticosList.map((diag) => (
                      <tr key={diag.createdAt} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-gray-700">
                          {new Date(diag.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {diag.nombreCompleto}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {diag.nombreEmpresa}
                        </td>
                        <td className="py-4 px-6 text-center flex justify-center space-x-2">
                          <button
                            onClick={() => viewDiagnostico(diag)}
                            className="text-blue-600 hover:text-blue-900 font-medium p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition duration-200"
                            title="Ver Diagnóstico"
                          >
                            <BookOpenIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => editDiagnostico(diag.createdAt)}
                            className="text-yellow-600 hover:text-yellow-900 font-medium p-2 rounded-md bg-yellow-50 hover:bg-yellow-100 transition duration-200"
                            title="Editar Diagnóstico"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => deleteDiagnostico(diag.createdAt)}
                            className="text-red-600 hover:text-red-900 font-medium p-2 rounded-md bg-red-50 hover:bg-red-100 transition duration-200"
                            title="Eliminar Diagnóstico"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => {
                  setShowForm(true);
                  setDiagnostico(initialDiagnostico);
                  setEditingKey(null);
                  setAnalisis(null);
                  setMensaje({});
                  setExpandedBlocks({
                    // Reset expanded blocks for new form
                    bloque1: true,
                    bloque2: false,
                    bloque3: false,
                    bloque4: false,
                    bloque5: false,
                    bloque6: false,
                    bloque7: false,
                    bloque8: false,
                    bloque9: false,
                  });
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md flex items-center"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" /> Crear Nuevo Diagnóstico
              </button>
            </div>
          </div>
        )}

        {/* Detailed Diagnostic View (after selecting from list) */}
        {!showForm && selectedDiagnostico && (
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto border border-gray-200 animate__animated animate__fadeIn">
            <button
              onClick={() => {
                setSelectedDiagnostico(null); // Go back to list view
                setAnalisis(null); // Clear analysis when going back
                setMensaje({});
              }}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Volver a la lista de diagnósticos
            </button>

            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
              Detalles del Diagnóstico de {selectedDiagnostico.nombreEmpresa}
            </h2>
            <p className="text-gray-600 text-center mb-4">
              Fecha: {new Date(selectedDiagnostico.createdAt).toLocaleDateString()}
            </p>

            <div className="space-y-4">
              {/* Display basic info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Información General</h3>
                <p><strong>Nombre Completo:</strong> {selectedDiagnostico.nombreCompleto}</p>
                <p><strong>Nombre Empresa:</strong> {selectedDiagnostico.nombreEmpresa}</p>
                <p><strong>Tipo de Negocio:</strong> {selectedDiagnostico.tipoNegocio}</p>
                <p><strong>Tiempo de Operación:</strong> {selectedDiagnostico.tiempoOperacion}</p>
              </div>

              {/* Display all other diagnostic questions and answers dynamically */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Respuestas Detalladas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedDiagnostico).map(([key, value]) => {
                    // Exclude properties that are already displayed or not questions
                    if (
                      ["userId", "nombreCompleto", "nombreEmpresa", "tipoNegocio", "tiempoOperacion", "createdAt", "analysisResult"].includes(key)
                    ) {
                      return null;
                    }
                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim(); // Formats camelCase and snake_case
                    return (
                      <div key={key} className="mb-2">
                        <p className="font-semibold text-gray-700">
                          {formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1)}:
                        </p>
                        <p className="text-gray-600">{value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Analysis Report Section (Conditional Rendering and Error Handling) */}
            {isLoading ? (
              <div className="text-center mt-8 p-4 bg-blue-50 rounded-lg shadow-inner">
                <p className="text-blue-700 animate-pulse">Analizando diagnóstico con IA...</p>
              </div>
            ) : analisis ? (
              <div ref={analysisReportRef} className="mt-8 p-6 bg-blue-50 rounded-xl shadow-lg border border-blue-200">
                <h3 className="text-3xl font-bold text-blue-800 mb-6 text-center">
                  Análisis Detallado del Diagnóstico
                </h3>

                <div className="mb-8">
                  <h4 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                    <BookOpenIcon className="h-6 w-6 mr-2 text-blue-600" /> Resumen Ejecutivo
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    {analisis.resumen_ejecutivo}
                  </p>
                </div>

                <div className="mb-8">
                  <h4 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                    <ExclamationCircleIcon className="h-6 w-6 mr-2 text-orange-600" /> Semáforo de Riesgo por Área
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(analisis.semaforo_riesgo || defaultSemaforoRiesgo).map(([key, status]) => {
                      const areaInfo = semaforoAreasMap[key as keyof typeof semaforoAreasMap];
                      if (!areaInfo) return null; // Skip if area not defined in map

                      return (
                        <div key={key} className={`p-4 rounded-lg shadow-md flex items-center justify-between transition-all duration-300 ${getTrafficLightColor(status)}`}>
                          <div className="flex items-center">
                            {areaInfo.icon}
                            <span className="font-semibold text-white text-lg">
                              {areaInfo.name}
                            </span>
                          </div>
                          <span className="text-white font-bold text-lg">
                            {getTrafficLightText(status)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                    <CheckCircleIcon className="h-6 w-6 mr-2 text-green-600" /> Fortalezas
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    {analisis.fortalezas.length > 0 ? (
                      analisis.fortalezas.map((fortaleza, index) => (
                        <li key={index} className="mb-1">{fortaleza}</li>
                      ))
                    ) : (
                      <li>No se identificaron fortalezas específicas.</li>
                    )}
                  </ul>
                </div>

                {/* Continued from the user's provided code */}
                <div className="mb-8">
                  <h4 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                    <LightBulbIcon className="h-6 w-6 mr-2 text-yellow-600" /> Áreas de Oportunidad
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    {analisis.areas_oportunidad.length > 0 ? (
                      analisis.areas_oportunidad.map((oportunidad, index) => (
                        <li key={index} className="mb-1">{oportunidad}</li>
                      ))
                    ) : (
                      <li>No se identificaron áreas de oportunidad específicas.</li>
                    )}
                  </ul>
                </div>

                <div className="mb-8">
                  <h4 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                    <BookOpenIcon className="h-6 w-6 mr-2 text-purple-600" /> Recomendaciones
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    {analisis.recomendaciones.length > 0 ? (
                      analisis.recomendaciones.map((recomendacion, index) => (
                        <li key={index} className="mb-1">{recomendacion}</li>
                      ))
                    ) : (
                      <li>No se generaron recomendaciones específicas.</li>
                    )}
                  </ul>
                </div>

                <div className="mb-8 text-center">
                  <h4 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center justify-center">
                    <ScaleIcon className="h-6 w-6 mr-2 text-blue-600" /> Score Global del Negocio
                  </h4>
                  <div className="text-5xl font-bold text-blue-700 p-4 bg-blue-100 rounded-full inline-block min-w-[120px] shadow-lg">
                    {analisis.score_global}
                    <span className="text-xl">%</span>
                  </div>
                  <p className="text-gray-600 mt-2">
                    Este score representa la salud general de tu negocio basado en el análisis.
                  </p>
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    onClick={generatePdfReport}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition duration-300 shadow-md flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generando PDF...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l3-3m-3 3l-3-3m0 2H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2M5 21h14a2 2 0 002-2V8l-7-7H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Descargar Reporte en PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center mt-8 p-4 bg-yellow-50 rounded-lg shadow-inner">
                <p className="text-yellow-700">No hay análisis disponible para este diagnóstico. Edita el diagnóstico y envíalo para generar el análisis.</p>
              </div>
            )}

            {/* Edit and Delete buttons for the current selected diagnostic */}
            <div className="flex justify-center space-x-4 mt-8">
              <button
                onClick={() => selectedDiagnostico && editDiagnostico(selectedDiagnostico.createdAt)}
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition duration-300 shadow-md flex items-center"
              >
                <PencilSquareIcon className="h-5 w-5 mr-2" /> Editar Diagnóstico
              </button>
              <button
                onClick={() => selectedDiagnostico && deleteDiagnostico(selectedDiagnostico.createdAt)}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-300 shadow-md flex items-center"
              >
                <TrashIcon className="h-5 w-5 mr-2" /> Eliminar Diagnóstico
              </button>
            </div>
          </div>
        )}

        {/* Diagnostic Form View */}
        {showForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitDiagnostico();
            }}
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto animate__animated animate__fadeIn"
          >
            {/* Bloque 1: Información General del Solicitante y Empresa */}
            <div
              className={`mb-8 p-6 border rounded-lg transition-all duration-300 ease-in-out ${expandedBlocks.bloque1 ? "border-blue-300 bg-blue-50 shadow-md" : "border-gray-200 bg-white"
                }`}
            >
              <h3
                className="text-2xl font-bold text-blue-700 mb-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleBlock("bloque1")}
              >
                Información General
                <svg
                  className={`h-6 w-6 text-blue-700 transition-transform duration-300 ${expandedBlocks.bloque1 ? "rotate-90" : ""
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </h3>
              {expandedBlocks.bloque1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate__animated animate__fadeInDown animate__faster">
                  <div className="form-group">
                    <label
                      htmlFor="nombreCompleto"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="nombreCompleto"
                      name="nombreCompleto"
                      value={diagnostico.nombreCompleto}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.nombreCompleto ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Tu nombre completo"
                    />
                    {formErrors.nombreCompleto && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.nombreCompleto}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="nombreEmpresa"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Nombre de la Empresa
                    </label>
                    <input
                      type="text"
                      id="nombreEmpresa"
                      name="nombreEmpresa"
                      value={diagnostico.nombreEmpresa}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.nombreEmpresa ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Nombre de tu empresa"
                    />
                    {formErrors.nombreEmpresa && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.nombreEmpresa}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="tipoNegocio"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Tipo de Negocio
                    </label>
                    <select
                      id="tipoNegocio"
                      name="tipoNegocio"
                      value={diagnostico.tipoNegocio}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.tipoNegocio ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Productos">Productos</option>
                      <option value="Comercio">Comercio</option>
                      <option value="Manufactura">Manufactura</option>
                      <option value="Tecnología">Tecnología</option>
                      <option value="Otro">Otro</option>
                    </select>
                    {formErrors.tipoNegocio && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.tipoNegocio}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="tiempoOperacion"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Tiempo de Operación de la Empresa
                    </label>
                    <select
                      id="tiempoOperacion"
                      name="tiempoOperacion"
                      value={diagnostico.tiempoOperacion}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.tiempoOperacion ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Menos de 1 año">Menos de 1 año</option>
                      <option value="1-3 años">1-3 años</option>
                      <option value="3-5 años">3-5 años</option>
                      <option value="Más de 5 años">Más de 5 años</option>
                    </select>
                    {formErrors.tiempoOperacion && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.tiempoOperacion}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 2: Finanzas */}
            <div
              className={`mb-8 p-6 border rounded-lg transition-all duration-300 ease-in-out ${expandedBlocks.bloque2 ? "border-blue-300 bg-blue-50 shadow-md" : "border-gray-200 bg-white"
                }`}
            >
              <h3
                className="text-2xl font-bold text-blue-700 mb-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleBlock("bloque2")}
              >
                Finanzas
                <svg
                  className={`h-6 w-6 text-blue-700 transition-transform duration-300 ${expandedBlocks.bloque2 ? "rotate-90" : ""
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </h3>
              {expandedBlocks.bloque2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate__animated animate__fadeInDown animate__faster">
                  <div className="form-group">
                    <label
                      htmlFor="facturacionAnual"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Facturación Anual Aproximada
                    </label>
                    <select
                      id="facturacionAnual"
                      name="facturacionAnual"
                      value={diagnostico.facturacionAnual}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.facturacionAnual ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Menos de $500,000 MXN">
                        Menos de $500,000 MXN
                      </option>
                      <option value="$500,000 - $2,000,000 MXN">
                        $500,000 - $2,000,000 MXN
                      </option>
                      <option value="$2,000,000 - $5,000,000 MXN">
                        $2,000,000 - $5,000,000 MXN
                      </option>
                      <option value="Más de $5,000,000 MXN">
                        Más de $5,000,000 MXN
                      </option>
                    </select>
                    {formErrors.facturacionAnual && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.facturacionAnual}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="situacionFinanciera"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Situación Financiera Actual de la Empresa
                    </label>
                    <select
                      id="situacionFinanciera"
                      name="situacionFinanciera"
                      value={diagnostico.situacionFinanciera}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.situacionFinanciera ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Rentable y creciendo">
                        Rentable y creciendo
                      </option>
                      <option value="Estable pero sin crecimiento">
                        Estable pero sin crecimiento
                      </option>
                      <option value="Con dificultades pero operando">
                        Con dificultades pero operando
                      </option>
                      <option value="En crisis o con pérdidas constantes">
                        En crisis o con pérdidas constantes
                      </option>
                    </select>
                    {formErrors.situacionFinanciera && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.situacionFinanciera}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="accesoFinanciamiento"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Acceso a Financiamiento Externo
                    </label>
                    <select
                      id="accesoFinanciamiento"
                      name="accesoFinanciamiento"
                      value={diagnostico.accesoFinanciamiento}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.accesoFinanciamiento ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Fácil acceso (créditos bancarios, inversionistas)">
                        Fácil acceso (créditos bancarios, inversionistas)
                      </option>
                      <option value="Acceso limitado (solo préstamos pequeños o informales)">
                        Acceso limitado (solo préstamos pequeños o informales)
                      </option>
                      <option value="Sin acceso (deudas, historial crediticio negativo)">
                        Sin acceso (deudas, historial crediticio negativo)
                      </option>
                    </select>
                    {formErrors.accesoFinanciamiento && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.accesoFinanciamiento}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="flujoEfectivo"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Gestión del Flujo de Efectivo
                    </label>
                    <select
                      id="flujoEfectivo"
                      name="flujoEfectivo"
                      value={diagnostico.flujoEfectivo}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.flujoEfectivo ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Muy eficiente y controlado">
                        Muy eficiente y controlado
                      </option>
                      <option value="Suficiente, pero con poca planificación">
                        Suficiente, pero con poca planificación
                      </option>
                      <option value="Justo, a menudo con escasez de liquidez">
                        Justo, a menudo con escasez de liquidez
                      </option>
                      <option value="Crítico, problemas constantes de liquidez">
                        Crítico, problemas constantes de liquidez
                      </option>
                    </select>
                    {formErrors.flujoEfectivo && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.flujoEfectivo}
                      </p>
                    )}
                  </div>
                  <div className="form-group md:col-span-2">
                    <label
                      htmlFor="gestionFinanciera"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      ¿Cuál es el principal reto en tu gestión financiera?
                    </label>
                    <textarea
                      id="gestionFinanciera"
                      name="gestionFinanciera"
                      value={diagnostico.gestionFinanciera}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.gestionFinanciera ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Describe el reto..."
                    ></textarea>
                    {formErrors.gestionFinanciera && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.gestionFinanciera}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 3: Estrategia y Modelo de Negocio */}
            <div
              className={`mb-8 p-6 border rounded-lg transition-all duration-300 ease-in-out ${expandedBlocks.bloque3 ? "border-blue-300 bg-blue-50 shadow-md" : "border-gray-200 bg-white"
                }`}
            >
              <h3
                className="text-2xl font-bold text-blue-700 mb-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleBlock("bloque3")}
              >
                Estrategia y Modelo de Negocio
                <svg
                  className={`h-6 w-6 text-blue-700 transition-transform duration-300 ${expandedBlocks.bloque3 ? "rotate-90" : ""
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </h3>
              {expandedBlocks.bloque3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate__animated animate__fadeInDown animate__faster">
                  <div className="form-group">
                    <label
                      htmlFor="propuestaValor"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Propuesta de Valor de tu Negocio
                    </label>
                    <select
                      id="propuestaValor"
                      name="propuestaValor"
                      value={diagnostico.propuestaValor}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.propuestaValor ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Clara, única y diferenciada">
                        Clara, única y diferenciada
                      </option>
                      <option value="Existe, pero necesita mayor definición">
                        Existe, pero necesita mayor definición
                      </option>
                      <option value="Poco clara o similar a la competencia">
                        Poco clara o similar a la competencia
                      </option>
                    </select>
                    {formErrors.propuestaValor && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.propuestaValor}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="modeloNegocio"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Claridad y Solidez de tu Modelo de Negocio
                    </label>
                    <select
                      id="modeloNegocio"
                      name="modeloNegocio"
                      value={diagnostico.modeloNegocio}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.modeloNegocio ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Muy claro, probado y escalable">
                        Muy claro, probado y escalable
                      </option>
                      <option value="Funcional, pero con áreas de mejora">
                        Funcional, pero con áreas de mejora
                      </option>
                      <option value="En desarrollo o poco definido">
                        En desarrollo o poco definido
                      </option>
                      <option value="Inestable o con fallas constantes">
                        Inestable o con fallas constantes
                      </option>
                    </select>
                    {formErrors.modeloNegocio && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.modeloNegocio}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="ventajaCompetitiva"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Ventaja Competitiva Principal
                    </label>
                    <textarea
                      id="ventajaCompetitiva"
                      name="ventajaCompetitiva"
                      value={diagnostico.ventajaCompetitiva}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.ventajaCompetitiva ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Describe tu ventaja competitiva..."
                    ></textarea>
                    {formErrors.ventajaCompetitiva && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.ventajaCompetitiva}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="innovacionProducto"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Nivel de Innovación en Productos/Servicios
                    </label>
                    <select
                      id="innovacionProducto"
                      name="innovacionProducto"
                      value={diagnostico.innovacionProducto}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.innovacionProducto ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Constante y disruptiva">
                        Constante y disruptiva
                      </option>
                      <option value="Ocasional y de mejora">
                        Ocasional y de mejora
                      </option>
                      <option value="Básica, siguiendo tendencias">
                        Básica, siguiendo tendencias
                      </option>
                      <option value="Nula o muy limitada">
                        Nula o muy limitada
                      </option>
                    </select>
                    {formErrors.innovacionProducto && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.innovacionProducto}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 4: Marketing y Ventas */}
            <div
              className={`mb-8 p-6 border rounded-lg transition-all duration-300 ease-in-out ${expandedBlocks.bloque4 ? "border-blue-300 bg-blue-50 shadow-md" : "border-gray-200 bg-white"
                }`}
            >
              <h3
                className="text-2xl font-bold text-blue-700 mb-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleBlock("bloque4")}
              >
                Marketing y Ventas
                <svg
                  className={`h-6 w-6 text-blue-700 transition-transform duration-300 ${expandedBlocks.bloque4 ? "rotate-90" : ""
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </h3>
              {expandedBlocks.bloque4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate__animated animate__fadeInDown animate__faster">
                  <div className="form-group">
                    <label
                      htmlFor="estrategiaMarketing"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Estrategia de Marketing Digital y Tradicional
                    </label>
                    <select
                      id="estrategiaMarketing"
                      name="estrategiaMarketing"
                      value={diagnostico.estrategiaMarketing}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.estrategiaMarketing ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Bien definida y en ejecución constante">
                        Bien definida y en ejecución constante
                      </option>
                      <option value="Existe, pero con implementación inconsistente">
                        Existe, pero con implementación inconsistente
                      </option>
                      <option value="Poca o nula estrategia">
                        Poca o nula estrategia
                      </option>
                    </select>
                    {formErrors.estrategiaMarketing && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.estrategiaMarketing}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="perfilesClientes"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Definición de Perfiles de Clientes (Buyer Personas)
                    </label>
                    <select
                      id="perfilesClientes"
                      name="perfilesClientes"
                      value={diagnostico.perfilesClientes}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.perfilesClientes ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Muy claros y bien segmentados">
                        Muy claros y bien segmentados
                      </option>
                      <option value="Identificados, pero no a detalle">
                        Identificados, pero no a detalle
                      </option>
                      <option value="Poco claros o inexistentes">
                        Poco claros o inexistentes
                      </option>
                    </select>
                    {formErrors.perfilesClientes && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.perfilesClientes}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="cierreVentas"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Efectividad en el Cierre de Ventas
                    </label>
                    <select
                      id="cierreVentas"
                      name="cierreVentas"
                      value={diagnostico.cierreVentas}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.cierreVentas ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Muy alta, procesos definidos">
                        Muy alta, procesos definidos
                      </option>
                      <option value="Aceptable, pero con oportunidades de mejora">
                        Aceptable, pero con oportunidades de mejora
                      </option>
                      <option value="Baja, muchas oportunidades perdidas">
                        Baja, muchas oportunidades perdidas
                      </option>
                    </select>
                    {formErrors.cierreVentas && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.cierreVentas}
                      </p>
                    )}
                  </div>
                  <div className="form-group md:col-span-2">
                    <label
                      htmlFor="retoComercial"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      ¿Cuál es tu principal reto comercial actualmente?
                    </label>
                    <textarea
                      id="retoComercial"
                      name="retoComercial"
                      value={diagnostico.retoComercial}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.retoComercial ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Describe el reto..."
                    ></textarea>
                    {formErrors.retoComercial && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.retoComercial}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 5: Operaciones */}
            <div
              className={`mb-8 p-6 border rounded-lg transition-all duration-300 ease-in-out ${expandedBlocks.bloque5 ? "border-blue-300 bg-blue-50 shadow-md" : "border-gray-200 bg-white"
                }`}
            >
              <h3
                className="text-2xl font-bold text-blue-700 mb-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleBlock("bloque5")}
              >
                Operaciones
                <svg
                  className={`h-6 w-6 text-blue-700 transition-transform duration-300 ${expandedBlocks.bloque5 ? "rotate-90" : ""
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </h3>
              {expandedBlocks.bloque5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate__animated animate__fadeInDown animate__faster">
                  <div className="form-group">
                    <label
                      htmlFor="procesosDocumentados"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Procesos Clave Documentados y Estandarizados
                    </label>
                    <select
                      id="procesosDocumentados"
                      name="procesosDocumentados"
                      value={diagnostico.procesosDocumentados}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.procesosDocumentados ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="La mayoría están documentados y son seguidos">
                        La mayoría están documentados y son seguidos
                      </option>
                      <option value="Algunos documentados, pero no siempre seguidos">
                        Algunos documentados, pero no siempre seguidos
                      </option>
                      <option value="Pocos o ningún proceso documentado">
                        Pocos o ningún proceso documentado
                      </option>
                    </select>
                    {formErrors.procesosDocumentados && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.procesosDocumentados}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="herramientasControl"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Herramientas de Control y Seguimiento Operativo
                    </label>
                    <select
                      id="herramientasControl"
                      name="herramientasControl"
                      value={diagnostico.herramientasControl}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.herramientasControl ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Sistemas avanzados (ERP, CRM, etc.)">
                        Sistemas avanzados (ERP, CRM, etc.)
                      </option>
                      <option value="Hojas de cálculo y herramientas básicas">
                        Hojas de cálculo y herramientas básicas
                      </option>
                      <option value="Control manual o poco sistemático">
                        Control manual o poco sistemático
                      </option>
                    </select>
                    {formErrors.herramientasControl && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.herramientasControl}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="eficienciaOperacion"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Nivel de Eficiencia en tus Operaciones Diarias
                    </label>
                    <select
                      id="eficienciaOperacion"
                      name="eficienciaOperacion"
                      value={diagnostico.eficienciaOperacion}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.eficienciaOperacion ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Muy eficiente, poca fricción">
                        Muy eficiente, poca fricción
                      </option>
                      <option value="Aceptable, con algunos cuellos de botella">
                        Aceptable, con algunos cuellos de botella
                      </option>
                      <option value="Baja, procesos lentos y errores frecuentes">
                        Baja, procesos lentos y errores frecuentes
                      </option>
                    </select>
                    {formErrors.eficienciaOperacion && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.eficienciaOperacion}
                      </p>
                    )}
                  </div>
                  <div className="form-group md:col-span-2">
                    <label
                      htmlFor="obstaculoOperativo"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      ¿Cuál es el obstáculo operativo más frecuente?
                    </label>
                    <textarea
                      id="obstaculoOperativo"
                      name="obstaculoOperativo"
                      value={diagnostico.obstaculoOperativo}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.obstaculoOperativo ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Describe el obstáculo..."
                    ></textarea>
                    {formErrors.obstaculoOperativo && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.obstaculoOperativo}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 6: Recursos Humanos */}
            <div
              className={`mb-8 p-6 border rounded-lg transition-all duration-300 ease-in-out ${expandedBlocks.bloque6 ? "border-blue-300 bg-blue-50 shadow-md" : "border-gray-200 bg-white"
                }`}
            >
              <h3
                className="text-2xl font-bold text-blue-700 mb-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleBlock("bloque6")}
              >
                Recursos Humanos
                <svg
                  className={`h-6 w-6 text-blue-700 transition-transform duration-300 ${expandedBlocks.bloque6 ? "rotate-90" : ""
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </h3>
              {expandedBlocks.bloque6 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate__animated animate__fadeInDown animate__faster">
                  <div className="form-group">
                    <label
                      htmlFor="numeroPersonas"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Número de Personas que Trabajan Contigo (incluyéndote)
                    </label>
                    <select
                      id="numeroPersonas"
                      name="numeroPersonas"
                      value={diagnostico.numeroPersonas}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.numeroPersonas ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="1-5">1-5</option>
                      <option value="6-15">6-15</option>
                      <option value="16-50">16-50</option>
                      <option value="Más de 50">Más de 50</option>
                    </select>
                    {formErrors.numeroPersonas && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.numeroPersonas}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="sistemaGestionRH"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Sistema de Gestión de Recursos Humanos
                    </label>
                    <select
                      id="sistemaGestionRH"
                      name="sistemaGestionRH"
                      value={diagnostico.sistemaGestionRH}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.sistemaGestionRH ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Formal y estructurado (evaluaciones, capacitaciones)">
                        Formal y estructurado (evaluaciones, capacitaciones)
                      </option>
                      <option value="Básico, centrado en nómina y contratos">
                        Básico, centrado en nómina y contratos
                      </option>
                      <option value="Informal o inexistente">
                        Informal o inexistente
                      </option>
                    </select>
                    {formErrors.sistemaGestionRH && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.sistemaGestionRH}
                      </p>
                    )}
                  </div>
                  <div className="form-group md:col-span-2">
                    <label
                      htmlFor="retoGestionPersonas"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      ¿Cuál es tu mayor reto en la gestión de personas?
                    </label>
                    <textarea
                      id="retoGestionPersonas"
                      name="retoGestionPersonas"
                      value={diagnostico.retoGestionPersonas}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.retoGestionPersonas ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Describe el reto..."
                    ></textarea>
                    {formErrors.retoGestionPersonas && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.retoGestionPersonas}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 7: Tecnología */}
            <div
              className={`mb-8 p-6 border rounded-lg transition-all duration-300 ease-in-out ${expandedBlocks.bloque7 ? "border-blue-300 bg-blue-50 shadow-md" : "border-gray-200 bg-white"
                }`}
            >
              <h3
                className="text-2xl font-bold text-blue-700 mb-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleBlock("bloque7")}
              >
                Tecnología
                <svg
                  className={`h-6 w-6 text-blue-700 transition-transform duration-300 ${expandedBlocks.bloque7 ? "rotate-90" : ""
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </h3>
              {expandedBlocks.bloque7 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate__animated animate__fadeInDown animate__faster">
                  <div className="form-group">
                    <label
                      htmlFor="herramientasDigitales"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Herramientas Digitales para Operación y Gestión
                    </label>
                    <select
                      id="herramientasDigitales"
                      name="herramientasDigitales"
                      value={diagnostico.herramientasDigitales}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.herramientasDigitales ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Amplio uso de software y plataformas avanzadas">
                        Amplio uso de software y plataformas avanzadas
                      </option>
                      <option value="Uso básico de ofimática y algunas herramientas gratuitas">
                        Uso básico de ofimática y algunas herramientas gratuitas
                      </option>
                      <option value="Dependencia de procesos manuales o nulo uso de tecnología">
                        Dependencia de procesos manuales o nulo uso de tecnología
                      </option>
                    </select>
                    {formErrors.herramientasDigitales && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.herramientasDigitales}
                      </p>
                    )}
                  </div>
                  <div className="form-group md:col-span-2">
                    <label
                      htmlFor="retoTecnologico"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      ¿Cuál es tu mayor reto tecnológico?
                    </label>
                    <textarea
                      id="retoTecnologico"
                      name="retoTecnologico"
                      value={diagnostico.retoTecnologico}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.retoTecnologico ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Describe el reto..."
                    ></textarea>
                    {formErrors.retoTecnologico && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.retoTecnologico}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 8: Legal y Fiscal */}
            <div
              className={`mb-8 p-6 border rounded-lg transition-all duration-300 ease-in-out ${expandedBlocks.bloque8 ? "border-blue-300 bg-blue-50 shadow-md" : "border-gray-200 bg-white"
                }`}
            >
              <h3
                className="text-2xl font-bold text-blue-700 mb-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleBlock("bloque8")}
              >
                Legal y Fiscal
                <svg
                  className={`h-6 w-6 text-blue-700 transition-transform duration-300 ${expandedBlocks.bloque8 ? "rotate-90" : ""
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </h3>
              {expandedBlocks.bloque8 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate__animated animate__fadeInDown animate__faster">
                  <div className="form-group">
                    <label
                      htmlFor="claridadFiscalLegal"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Claridad y Cumplimiento de Obligaciones Fiscales y Legales
                    </label>
                    <select
                      id="claridadFiscalLegal"
                      name="claridadFiscalLegal"
                      value={diagnostico.claridadFiscalLegal}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.claridadFiscalLegal ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Totalmente al día y asesorado">
                        Totalmente al día y asesorado
                      </option>
                      <option value="Casi al día, pero con algunas dudas">
                        Casi al día, pero con algunas dudas
                      </option>
                      <option value="Desconocimiento o incumplimiento">
                        Desconocimiento o incumplimiento
                      </option>
                    </select>
                    {formErrors.claridadFiscalLegal && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.claridadFiscalLegal}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="contratosPoliticas"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Contratos y Políticas Internas/Externas
                    </label>
                    <select
                      id="contratosPoliticas"
                      name="contratosPoliticas"
                      value={diagnostico.contratosPoliticas}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.contratosPoliticas ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Todos los contratos y políticas en regla">
                        Todos los contratos y políticas en regla
                      </option>
                      <option value="Algunos contratos o políticas pendientes">
                        Algunos contratos o políticas pendientes
                      </option>
                      <option value="Pocos o ningún contrato/política">
                        Pocos o ningún contrato/política
                      </option>
                    </select>
                    {formErrors.contratosPoliticas && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.contratosPoliticas}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition duration-300 shadow-xl flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analizando...
                  </>
                ) : (
                  "Enviar Diagnóstico y Obtener Análisis"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </PrivateLayout>
  );
};

export default DiagnosticoEmpresarial;