import { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import s3 from "../../../lib/aws";
import {
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import PrivateLayout from "../../../components/layout/PrivateLayout";
import 'animate.css';

// Interfaz para los datos del diagnóstico
interface DiagnosticoData {
  userId: string;
  // Bloque 1: Datos del Empresario
  nombreCompleto: string;
  edad: string;
  ciudadEstado: string;
  ultimoGradoEstudios: string;
  experienciaEmprendedor: string;
  esPrincipalIngreso: string;
  // Bloque 2: Perfil del Negocio
  etapaNegocio: string;
  giroActividad: string;
  giroActividadOtro: string;
  industriaNegocio: string;
  industriaNegocioOtro: string;
  constitucionLegal: string;
  modeloNegocio: string;
  lugaresVenta: string[];
  // Bloque 3: Estrategia y Planeación
  planEstrategico: string;
  frecuenciaRevision: string;
  obstaculoEstrategico: string;
  // Bloque 4: Finanzas
  controlFinanciero: string;
  costoOperacionMensual: string;
  preocupacionFinanciera: string;
  // Bloque 5: Marketing y Ventas
  estrategiaMarketing: string;
  perfilesClientes: string;
  cierreVentas: string;
  retoComercial: string;
  // Bloque 6: Operaciones y Procesos
  procesosDocumentados: string;
  herramientasControl: string;
  eficienciaOperacion: string;
  obstaculoOperativo: string;
  // Bloque 7: Recursos Humanos
  numeroPersonas: string;
  sistemaGestionRH: string;
  retoGestionPersonas: string;
  // Bloque 8: Tecnología y Digitalización
  herramientasDigitales: string;
  retoTecnologico: string;
  // Bloque 9: Legal y Fiscal
  claridadFiscalLegal: string;
  contratosPoliticas: string;
  createdAt: string;
}

const DiagnosticoEmpresarial = () => {
  const { user } = useAuth();
  const [diagnosticos, setDiagnosticos] = useState<(DiagnosticoData & { _key: string })[]>([]);
  const [selectedDiagnostico, setSelectedDiagnostico] = useState<(DiagnosticoData & { _key: string }) | null>(null);
  const [mensaje, setMensaje] = useState<{ error?: string; success?: string }>({});
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [expandedBlocks, setExpandedBlocks] = useState<{ [key: string]: boolean }>({
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

  // Estado inicial del diagnóstico
  const initialDiagnostico: DiagnosticoData = {
    userId: user?.uid || "",
    nombreCompleto: "",
    edad: "",
    ciudadEstado: "",
    ultimoGradoEstudios: "",
    experienciaEmprendedor: "",
    esPrincipalIngreso: "",
    etapaNegocio: "",
    giroActividad: "",
    giroActividadOtro: "",
    industriaNegocio: "",
    industriaNegocioOtro: "",
    constitucionLegal: "",
    modeloNegocio: "",
    lugaresVenta: [],
    planEstrategico: "",
    frecuenciaRevision: "",
    obstaculoEstrategico: "",
    controlFinanciero: "",
    costoOperacionMensual: "",
    preocupacionFinanciera: "",
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
    createdAt: new Date().toISOString(),
  };
  const [diagnostico, setDiagnostico] = useState<DiagnosticoData>(initialDiagnostico);

  // Cargar diagnósticos desde S3
  useEffect(() => {
    if (!user) {
      setMensaje({ error: "Inicia sesión primero." });
      return;
    }
    const fetchDiagnosticos = async () => {
      try {
        const list = await-s3.send(
          new ListObjectsV2Command({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!, Prefix: "diagnosticos/empresarial/" })
        );
        const items = list.Contents?.map((i) => i.Key!).filter(Boolean) || [];
        const datos = await Promise.all(
          items.map(async (Key) => {
            if (!Key.endsWith('.json')) return null;
            try {
              const res = await s3.send(new GetObjectCommand({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!, Key }));
              const body = await res.Body?.transformToString('utf-8');
              if (body) {
                const data = JSON.parse(body) as DiagnosticoData;
                return { ...data, _key: Key };
              }
              return null;
            } catch (fetchError) {
              console.error(`Error al leer el archivo ${Key}:`, fetchError);
              return null;
            }
          })
        );
        const uniqueDatos = datos
          .filter((d): d is DiagnosticoData & { _key: string } => d !== null)
          .filter((d, index, self) => index === self.findIndex((t) => t._key === d._key));
        setDiagnosticos(uniqueDatos);
        if (uniqueDatos.length > 0) {
          setSelectedDiagnostico(uniqueDatos[0]);
        }
      } catch (e) {
        console.error("Error al cargar diagnósticos:", e);
        setMensaje({ error: "Error al cargar diagnósticos." });
      }
    };
    fetchDiagnosticos();
  }, [user]);

  // Manejar cambios en el formulario
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setDiagnostico((prev) => {
      const newDiagnostico = { ...prev };
      if (type === "checkbox") {
        if (name === "lugaresVenta") {
          if (checked) {
            if (prev.lugaresVenta.length < 2) {
              newDiagnostico.lugaresVenta = [...prev.lugaresVenta, value];
            }
          } else {
            newDiagnostico.lugaresVenta = prev.lugaresVenta.filter((lugar) => lugar !== value);
          }
        }
      } else {
        newDiagnostico[name] = value;
      }
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        if (name === "lugaresVenta" && newDiagnostico.lugaresVenta.length > 0) {
          delete newErrors.lugaresVenta;
        }
        return newErrors;
      });
      return newDiagnostico;
    });
  };

  // Validar campos requeridos
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!diagnostico.nombreCompleto) errors.nombreCompleto = "El nombre completo es obligatorio";
    if (!diagnostico.edad) errors.edad = "La edad es obligatoria";
    if (!diagnostico.ciudadEstado) errors.ciudadEstado = "La ciudad/estado es obligatoria";
    if (!diagnostico.ultimoGradoEstudios) errors.ultimoGradoEstudios = "El último grado de estudios es obligatorio";
    if (!diagnostico.experienciaEmprendedor) errors.experienciaEmprendedor = "La experiencia como emprendedor es obligatoria";
    if (!diagnostico.esPrincipalIngreso) errors.esPrincipalIngreso = "Este campo es obligatorio";
    if (!diagnostico.etapaNegocio) errors.etapaNegocio = "La etapa del negocio es obligatoria";
    if (!diagnostico.giroActividad) errors.giroActividad = "El giro de actividad es obligatorio";
    if (diagnostico.giroActividad === "Otro" && !diagnostico.giroActividadOtro) errors.giroActividadOtro = "Especifique el giro de actividad";
    if (!diagnostico.industriaNegocio) errors.industriaNegocio = "La industria del negocio es obligatoria";
    if (diagnostico.industriaNegocio === "Otro" && !diagnostico.industriaNegocioOtro) errors.industriaNegocioOtro = "Especifique la industria";
    if (!diagnostico.constituciónLegal) errors.constituciónLegal = "La constitución legal es obligatoria";
    if (!diagnostico.modeloNegocio) errors.modeloNegocio = "El modelo de negocio es obligatorio";
    if (diagnostico.lugaresVenta.length === 0) errors.lugaresVenta = "Selecciona al menos un lugar de venta";
    if (!diagnostico.planEstrategico) errors.planEstrategico = "El plan estratégico es obligatorio";
    if (!diagnostico.frecuenciaRevision) errors.frecuenciaRevision = "La frecuencia de revisión es obligatoria";
    if (!diagnostico.obstaculoEstrategico) errors.obstaculoEstrategico = "El obstáculo estratégico es obligatorio";
    if (!diagnostico.controlFinanciero) errors.controlFinanciero = "El control financiero es obligatorio";
    if (!diagnostico.costoOperacionMensual) errors.costoOperacionMensual = "Este campo es obligatorio";
    if (!diagnostico.preocupacionFinanciera) errors.preocupacionFinanciera = "La preocupación financiera es obligatoria";
    if (!diagnostico.estrategiaMarketing) errors.estrategiaMarketing = "La estrategia de marketing es obligatoria";
    if (!diagnostico.perfilesClientes) errors.perfilesClientes = "Los perfiles de clientes son obligatorios";
    if (!diagnostico.cierreVentas) errors.cierreVentas = "El método de cierre de ventas es obligatorio";
    if (!diagnostico.retoComercial) errors.retoComercial = "El reto comercial es obligatorio";
    if (!diagnostico.procesosDocumentados) errors.procesosDocumentados = "Este campo es obligatorio";
    if (!diagnostico.herramientasControl) errors.herramientasControl = "Las herramientas de control son obligatorias";
    if (!diagnostico.eficienciaOperacion) errors.eficienciaOperacion = "La eficiencia operativa es obligatoria";
    if (!diagnostico.obstaculoOperativo) errors.obstaculoOperativo = "El obstáculo operativo es obligatorio";
    if (!diagnostico.numeroPersonas) errors.numeroPersonas = "El número de personas es obligatorio";
    if (!diagnostico.sistemaGestionRH) errors.sistemaGestionRH = "El sistema de gestión de RH es obligatorio";
    if (!diagnostico.retoGestionPersonas) errors.retoGestionPersonas = "El reto de gestión de personas es obligatorio";
    if (!diagnostico.herramientasDigitales) errors.herramientasDigitales = "Las herramientas digitales son obligatorias";
    if (!diagnostico.retoTecnologico) errors.retoTecnologico = "El reto tecnológico es obligatorio";
    if (!diagnostico.claridadFiscalLegal) errors.claridadFiscalLegal = "La claridad fiscal/legal es obligatoria";
    if (!diagnostico.contratosPoliticas) errors.contratosPoliticas = "Este campo es obligatorio";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Crear o actualizar diagnóstico
  const submitDiagnostico = async () => {
    if (!user) {
      setMensaje({ error: "Inicia sesión primero." });
      return;
    }
    if (!validateForm()) {
      setMensaje({ error: "Por favor, completa todos los campos obligatorios." });
      return;
    }
    try {
      const Key = editingKey || `diagnosticos/empresarial/${user.uid}-${Date.now()}.json`;
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
          Key,
          Body: JSON.stringify({ ...diagnostico, userId: user.uid, createdAt: new Date().toISOString() }),
          ContentType: "application/json",
          ContentEncoding: "utf-8",
        })
      );
      setDiagnosticos((prev) =>
        editingKey
          ? prev.map((d) => (d._key === Key ? { ...diagnostico, _key: Key } : d))
          : [...prev, { ...diagnostico, _key: Key }]
      );
      setMensaje({ success: editingKey ? "Diagnóstico actualizado." : "Diagnóstico guardado." });
      setShowForm(false);
      setEditingKey(null);
      setDiagnostico(initialDiagnostico);
      setFormErrors({});
      setSelectedDiagnostico({ ...diagnostico, _key: Key });
      setExpandedBlocks({
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
    } catch (e) {
      console.error("Error al guardar diagnóstico:", e);
      setMensaje({ error: "Error al guardar diagnóstico." });
    }
  };

  // Editar diagnóstico
  const editDiagnostico = (d: DiagnosticoData & { _key: string }) => {
    setDiagnostico(d);
    setEditingKey(d._key);
    setShowForm(true);
    setFormErrors({});
    setExpandedBlocks({
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
  };

  // Eliminar diagnóstico
  const deleteDiagnostico = async (Key: string) => {
    if (!confirm("¿Estás seguro de eliminar este diagnóstico?")) return;
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!, Key }));
      setDiagnosticos((prev) => {
        const updatedDiagnosticos = prev.filter((d) => d._key !== Key);
        if (selectedDiagnostico?._key === Key) {
          setSelectedDiagnostico(updatedDiagnosticos.length > 0 ? updatedDiagnosticos[0] : null);
        }
        return updatedDiagnosticos;
      });
      setMensaje({ success: "Diagnóstico eliminado." });
    } catch (e) {
      console.error("Error al eliminar diagnóstico:", e);
      setMensaje({ error: "No se pudo eliminar el diagnóstico." });
    }
  };

  // Manejar cambio en checkboxes para lugares de venta
  const handleLugaresVentaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setDiagnostico((prev) => {
      let newLugaresVenta = [...prev.lugaresVenta];
      if (checked) {
        if (newLugaresVenta.length < 2) {
          newLugaresVenta.push(value);
        }
      } else {
        newLugaresVenta = newLugaresVenta.filter((lugar) => lugar !== value);
      }
      return { ...prev, lugaresVenta: newLugaresVenta };
    });
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      if (checked && newLugaresVenta.length > 0) {
        delete newErrors.lugaresVenta;
      }
      return newErrors;
    });
  };

  // Alternar bloques expandidos
  const toggleBlock = (block: string) => {
    setExpandedBlocks((prev) => ({
      ...prev,
      [block]: !prev[block],
    }));
  };

  return (
    <PrivateLayout>
      <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">Diagnóstico Empresarial</h1>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Tus Diagnósticos</h2>
          <button
            onClick={() => {
              setShowForm((v) => !v);
              if (showForm) {
                setEditingKey(null);
                setDiagnostico(initialDiagnostico);
                setFormErrors({});
                setExpandedBlocks({
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
              }
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            {showForm ? "Cancelar" : "Nuevo Diagnóstico"}
          </button>
        </div>

        {mensaje.error && <p className="text-red-500 text-center mt-4">{mensaje.error}</p>}
        {mensaje.success && <p className="text-green-500 text-center mt-4">{mensaje.success}</p>}

        {/* Lista de diagnósticos */}
        <div className="mb-8">
          {diagnosticos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {diagnosticos.map((d) => (
                <div
                  key={d._key}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 animate__animated animate__fadeIn"
                  onClick={() => setSelectedDiagnostico(d)}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Diagnóstico {d.createdAt}</h3>
                  <p className="text-gray-600 mb-4">Nombre: {d.nombreCompleto}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        editDiagnostico(d);
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300"
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDiagnostico(d._key);
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center">No tienes diagnósticos guardados.</p>
          )}
        </div>

        {/* Formulario de diagnóstico */}
        {showForm && (
          <div className="bg-white p-8 rounded-xl shadow-lg mb-12 border border-gray-200 animate__animated animate__fadeIn">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
              {editingKey ? "Editar Diagnóstico" : "Nuevo Diagnóstico Empresarial"}
            </h2>

            {/* Bloque 1: Datos del Empresario */}
            <div className="mb-4">
              <div
                className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
                onClick={() => toggleBlock("bloque1")}
              >
                <h3 className="text-xl font-semibold text-blue-900">Bloque 1: Datos del Empresario</h3>
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
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      1. ¿Cuál es tu nombre completo, edad y ciudad/estado de residencia? *
                    </label>
                    <input
                      name="nombreCompleto"
                      value={diagnostico.nombreCompleto}
                      onChange={handleChange}
                      className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.nombreCompleto ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Nombre completo"
                    />
                    {formErrors.nombreCompleto && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.nombreCompleto}</p>
                    )}
                    <input
                      name="edad"
                      value={diagnostico.edad}
                      onChange={handleChange}
                      className={`w-full border rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.edad ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Edad"
                    />
                    {formErrors.edad && <p className="text-red-500 text-sm mt-1">{formErrors.edad}</p>}
                    <input
                      name="ciudadEstado"
                      value={diagnostico.ciudadEstado}
                      onChange={handleChange}
                      className={`w-full border rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.ciudadEstado ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Ciudad/Estado"
                    />
                    {formErrors.ciudadEstado && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.ciudadEstado}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      2. ¿Cuál es tu último grado de estudios y experiencia previa como emprendedor? *
                    </label>
                    <div className="space-y-2">
                      {["Primaria", "Secundaria", "Preparatoria", "Técnica", "Licenciatura", "Posgrado"].map(
                        (grado) => (
                          <label key={grado} className="flex items-center">
                            <input
                              type="radio"
                              name="ultimoGradoEstudios"
                              value={grado}
                              checked={diagnostico.ultimoGradoEstudios === grado}
                              onChange={handleChange}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-600">{grado}</span>
                          </label>
                        )
                      )}
                    </div>
                    {formErrors.ultimoGradoEstudios && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.ultimoGradoEstudios}</p>
                    )}
                    <div className="space-y-2 mt-4">
                      {["Nunca he emprendido", "He tenido uno o más negocios antes"].map((exp) => (
                        <label key={exp} className="flex items-center">
                          <input
                            type="radio"
                            name="experienciaEmprendedor"
                            value={exp}
                            checked={diagnostico.experienciaEmprendedor === exp}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{exp}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.experienciaEmprendedor && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.experienciaEmprendedor}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      3. ¿Tu empresa es tu principal fuente de ingresos? *
                    </label>
                    <div className="space-y-2">
                      {["Sí", "No", "Parcialmente"].map((ingreso) => (
                        <label key={ingreso} className="flex items-center">
                          <input
                            type="radio"
                            name="esPrincipalIngreso"
                            value={ingreso}
                            checked={diagnostico.esPrincipalIngreso === ingreso}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{ingreso}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.esPrincipalIngreso && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.esPrincipalIngreso}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 2: Perfil del Negocio */}
            <div className="mb-4">
              <div
                className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
                onClick={() => toggleBlock("bloque2")}
              >
                <h3 className="text-xl font-semibold text-blue-900">Bloque 2: Perfil del Negocio</h3>
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
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      4. ¿En qué etapa se encuentra actualmente tu negocio? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "Idea en desarrollo",
                        "Validación / prototipo",
                        "En operación inicial (menos de 1 año)",
                        "Establecido (1-3 años)",
                        "Consolidado (más de 3 años)",
                      ].map((etapa) => (
                        <label key={etapa} className="flex items-center">
                          <input
                            type="radio"
                            name="etapaNegocio"
                            value={etapa}
                            checked={diagnostico.etapaNegocio === etapa}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{etapa}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.etapaNegocio && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.etapaNegocio}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      5. ¿Cuál es el giro y tipo de actividad principal del negocio? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "Comercialización",
                        "Servicios",
                        "Producción / manufactura",
                        "Tecnología / digital",
                        "Agroindustria",
                        "Otro",
                      ].map((giro) => (
                        <label key={giro} className="flex items-center">
                          <input
                            type="radio"
                            name="giroActividad"
                            value={giro}
                            checked={diagnostico.giroActividad === giro}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{giro}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.giroActividad && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.giroActividad}</p>
                    )}
                    {diagnostico.giroActividad === "Otro" && (
                      <input
                        name="giroActividadOtro"
                        value={diagnostico.giroActividadOtro}
                        onChange={handleChange}
                        className={`w-full border rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.giroActividadOtro ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Especifique el giro"
                      />
                    )}
                    {formErrors.giroActividadOtro && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.giroActividadOtro}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      6. ¿A qué industria pertenece principalmente tu negocio? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "Salud",
                        "Moda",
                        "Alimentos",
                        "Construcción",
                        "Educación",
                        "Tecnología",
                        "Turismo",
                        "Otro",
                      ].map((industria) => (
                        <label key={industria} className="flex items-center">
                          <input
                            type="radio"
                            name="industriaNegocio"
                            value={industria}
                            checked={diagnostico.industriaNegocio === industria}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{industria}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.industriaNegocio && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.industriaNegocio}</p>
                    )}
                    {diagnostico.industriaNegocio === "Otro" && (
                      <input
                        name="industriaNegocioOtro"
                        value={diagnostico.industriaNegocioOtro}
                        onChange={handleChange}
                        className={`w-full border rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.industriaNegocioOtro ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Especifique la industria"
                      />
                    )}
                    {formErrors.industriaNegocioOtro && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.industriaNegocioOtro}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      7. ¿Cómo está legalmente constituido tu negocio? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "Persona física",
                        "Persona moral",
                        "Asociación o cooperativa",
                        "No está formalizado",
                        "En proceso de formalización",
                      ].map((legal) => (
                        <label key={legal} className="flex items-center">
                          <input
                            type="radio"
                            name="constituciónLegal"
                            value={legal}
                            checked={diagnostico.constituciónLegal === legal}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{legal}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.constituciónLegal && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.constituciónLegal}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      8. ¿Cuál es tu modelo de negocio predominante? *
                    </label>
                    <div className="space-y-2">
                      {["B2C", "B2B", "B2G", "Mixto"].map((modelo) => (
                        <label key={modelo} className="flex items-center">
                          <input
                            type="radio"
                            name="modeloNegocio"
                            value={modelo}
                            checked={diagnostico.modeloNegocio === modelo}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{modelo}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.modeloNegocio && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.modeloNegocio}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      9. ¿Dónde vendes actualmente? (máximo 2 opciones) *
                    </label>
                    <div className="space-y-2">
                      {["Local físico", "Redes sociales", "Tienda en línea", "Marketplace", "Distribuidores"].map(
                        (lugar) => (
                          <label key={lugar} className="flex items-center">
                            <input
                              type="checkbox"
                              name="lugaresVenta"
                              value={lugar}
                              checked={diagnostico.lugaresVenta.includes(lugar)}
                              onChange={handleLugaresVentaChange}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              disabled={
                                !diagnostico.lugaresVenta.includes(lugar) &&
                                diagnostico.lugaresVenta.length >= 2
                              }
                            />
                            <span className="text-gray-600">{lugar}</span>
                          </label>
                        )
                      )}
                    </div>
                    {formErrors.lugaresVenta && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.lugaresVenta}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 3: Estrategia y Planeación */}
            <div className="mb-4">
              <div
                className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
                onClick={() => toggleBlock("bloque3")}
              >
                <h3 className="text-xl font-semibold text-blue-900">Bloque 3: Estrategia y Planeación</h3>
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
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      10. ¿Tienes un plan estratégico o de crecimiento claro? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "No",
                        "Tengo ideas, pero no están documentadas",
                        "Plan a 1 año",
                        "Plan por áreas con seguimiento a KPIs",
                      ].map((plan) => (
                        <label key={plan} className="flex items-center">
                          <input
                            type="radio"
                            name="planEstrategico"
                            value={plan}
                            checked={diagnostico.planEstrategico === plan}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{plan}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.planEstrategico && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.planEstrategico}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      11. ¿Con qué frecuencia revisas objetivos o indicadores de desempeño? *
                    </label>
                    <div className="space-y-2">
                      {["Nunca", "Una vez al año", "Trimestralmente", "Cada mes o más"].map((frecuencia) => (
                        <label key={frecuencia} className="flex items-center">
                          <input
                            type="radio"
                            name="frecuenciaRevision"
                            value={frecuencia}
                            checked={diagnostico.frecuenciaRevision === frecuencia}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{frecuencia}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.frecuenciaRevision && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.frecuenciaRevision}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      12. ¿Cuál consideras que es tu mayor obstáculo estratégico actual? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "Falta de visión o enfoque",
                        "Desorden o improvisación",
                        "Problemas en ejecución",
                        "No tengo claridad de hacia dónde ir",
                      ].map((obstaculo) => (
                        <label key={obstaculo} className="flex items-center">
                          <input
                            type="radio"
                            name="obstaculoEstrategico"
                            value={obstaculo}
                            checked={diagnostico.obstaculoEstrategico === obstaculo}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{obstaculo}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.obstaculoEstrategico && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.obstaculoEstrategico}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 4: Finanzas */}
            <div className="mb-4">
              <div
                className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
                onClick={() => toggleBlock("bloque4")}
              >
                <h3 className="text-xl font-semibold text-blue-900">Bloque 4: Finanzas</h3>
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
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      13. ¿Cómo llevas el control financiero de tu negocio? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "No llevo",
                        "Excel / libreta",
                        "Software contable",
                        "Tengo asesor o responsable interno",
                      ].map((control) => (
                        <label key={control} className="flex items-center">
                          <input
                            type="radio"
                            name="controlFinanciero"
                            value={control}
                            checked={diagnostico.controlFinanciero === control}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{control}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.controlFinanciero && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.controlFinanciero}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      14. ¿Sabes cuánto cuesta operar tu negocio al mes? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "No",
                        "Aproximadamente",
                        "Sí, lo tengo calculado y monitoreado",
                        "Sí, y lo comparo con mis ventas e ingresos",
                      ].map((costo) => (
                        <label key={costo} className="flex items-center">
                          <input
                            type="radio"
                            name="costoOperacionMensual"
                            value={costo}
                            checked={diagnostico.costoOperacionMensual === costo}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{costo}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.costoOperacionMensual && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.costoOperacionMensual}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      15. ¿Cuál es tu principal preocupación financiera actual? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "No sé si gano o pierdo",
                        "No puedo pagarme a mí mismo",
                        "No me alcanza para reinvertir",
                        "Todo depende de un solo cliente",
                      ].map((preocupacion) => (
                        <label key={preocupacion} className="flex items-center">
                          <input
                            type="radio"
                            name="preocupacionFinanciera"
                            value={preocupacion}
                            checked={diagnostico.preocupacionFinanciera === preocupacion}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{preocupacion}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.preocupacionFinanciera && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.preocupacionFinanciera}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 5: Marketing y Ventas */}
            <div className="mb-4">
              <div
                className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
                onClick={() => toggleBlock("bloque5")}
              >
                <h3 className="text-xl font-semibold text-blue-900">Bloque 5: Marketing y Ventas</h3>
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
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      16. ¿Cuentas con una estrategia de marketing? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "No",
                        "Solo publicaciones ocasionales",
                        "Hago campañas y promociones",
                        "Tengo segmentación, embudos y estrategia digital",
                      ].map((estrategia) => (
                        <label key={estrategia} className="flex items-center">
                          <input
                            type="radio"
                            name="estrategiaMarketing"
                            value={estrategia}
                            checked={diagnostico.estrategiaMarketing === estrategia}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{estrategia}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.estrategiaMarketing && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.estrategiaMarketing}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      17. ¿Tienes definidos tus perfiles de clientes ideales (buyer persona)? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "No",
                        "Tengo una idea, pero no los tengo segmentados",
                        "Sí, los tengo definidos y dirigidos",
                        "Sí, y hago análisis continuo de comportamiento",
                      ].map((perfil) => (
                        <label key={perfil} className="flex items-center">
                          <input
                            type="radio"
                            name="perfilesClientes"
                            value={perfil}
                            checked={diagnostico.perfilesClientes === perfil}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{perfil}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.perfilesClientes && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.perfilesClientes}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      18. ¿Cómo cierras la mayoría de tus ventas? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "Venta directa sin seguimiento",
                        "Venta por redes / mensajes",
                        "Uso de CRM o embudo",
                        "Venta asistida con seguimiento estructurado",
                      ].map((cierre) => (
                        <label key={cierre} className="flex items-center">
                          <input
                            type="radio"
                            name="cierreVentas"
                            value={cierre}
                            checked={diagnostico.cierreVentas === cierre}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{cierre}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.cierreVentas && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.cierreVentas}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      19. ¿Cuál es el principal reto comercial que enfrentas? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "No genero suficientes prospectos",
                        "No convierto en ventas",
                        "Mis clientes no repiten",
                        "No tengo diferenciación",
                      ].map((reto) => (
                        <label key={reto} className="flex items-center">
                          <input
                            type="radio"
                            name="retoComercial"
                            value={reto}
                            checked={diagnostico.retoComercial === reto}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{reto}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.retoComercial && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.retoComercial}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 6: Operaciones y Procesos */}
            <div className="mb-4">
              <div
                className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
                onClick={() => toggleBlock("bloque6")}
              >
                <h3 className="text-xl font-semibold text-blue-900">Bloque 6: Operaciones y Procesos</h3>
                <svg
                  className={`w-6 h-6 transform transition-transform duration-300 ${
                    expandedBlocks.bloque6 ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {expandedBlocks.bloque6 && (
                <div className="p-4 bg-gray-50 rounded-lg mt-2 animate__animated animate__fadeIn">
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      20. ¿Tienes procesos documentados? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "No",
                        "Solo lo básico (ventas o pedidos)",
                        "Varias áreas, pero sin estandarizar",
                        "Sí, documentados y con seguimiento",
                      ].map((proceso) => (
                        <label key={proceso} className="flex items-center">
                          <input
                            type="radio"
                            name="procesosDocumentados"
                            value={proceso}
                            checked={diagnostico.procesosDocumentados === proceso}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{proceso}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.procesosDocumentados && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.procesosDocumentados}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      21. ¿Cuáles son tus herramientas de control operativo? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "Ninguna",
                        "Agenda, papel, WhatsApp",
                        "Excel, Google Drive",
                        "Software (ERP, POS, etc.)",
                      ].map((herramienta) => (
                        <label key={herramienta} className="flex items-center">
                          <input
                            type="radio"
                            name="herramientasControl"
                            value={herramienta}
                            checked={diagnostico.herramientasControl === herramienta}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{herramienta}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.herramientasControl && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.herramientasControl}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      22. ¿Cómo sabes si tu operación es eficiente? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "Solo por intuición",
                        "Cuando me lo dice un cliente",
                        "Porque entrego a tiempo",
                        "Porque mido rendimiento por área",
                      ].map((eficiencia) => (
                        <label key={eficiencia} className="flex items-center">
                          <input
                            type="radio"
                            name="eficienciaOperacion"
                            value={eficiencia}
                            checked={diagnostico.eficienciaOperacion === eficiencia}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{eficiencia}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.eficienciaOperacion && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.eficienciaOperacion}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      23. ¿Qué obstáculo operativo enfrentas con más frecuencia? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "Retrasos en entrega",
                        "Errores de producto / servicio",
                        "Cuellos de botella internos",
                        "Falta de estandarización",
                      ].map((obstaculo) => (
                        <label key={obstaculo} className="flex items-center">
                          <input
                            type="radio"
                            name="obstaculoOperativo"
                            value={obstaculo}
                            checked={diagnostico.obstaculoOperativo === obstaculo}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{obstaculo}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.obstaculoOperativo && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.obstaculoOperativo}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 7: Recursos Humanos */}
            <div className="mb-4">
              <div
                className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
                onClick={() => toggleBlock("bloque7")}
              >
                <h3 className="text-xl font-semibold text-blue-900">Bloque 7: Recursos Humanos</h3>
                <svg
                  className={`w-6 h-6 transform transition-transform duration-300 ${
                    expandedBlocks.bloque7 ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {expandedBlocks.bloque7 && (
                <div className="p-4 bg-gray-50 rounded-lg mt-2 animate__animated animate__fadeIn">
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      24. ¿Cuántas personas trabajan contigo actualmente? *
                    </label>
                    <div className="space-y-2">
                      {["Solo yo", "2-5", "6-15", "Más de 15"].map((numero) => (
                        <label key={numero} className="flex items-center">
                          <input
                            type="radio"
                            name="numeroPersonas"
                            value={numero}
                            checked={diagnostico.numeroPersonas === numero}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{numero}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.numeroPersonas && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.numeroPersonas}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      25. ¿Tienes definido un sistema de contratación, capacitación o evaluación? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "No",
                        "Solo capacito cuando hay errores",
                        "Capacito y doy retroalimentación",
                        "Tengo procesos definidos y evalúo desempeño",
                      ].map((sistema) => (
                        <label key={sistema} className="flex items-center">
                          <input
                            type="radio"
                            name="sistemaGestionRH"
                            value={sistema}
                            checked={diagnostico.sistemaGestionRH === sistema}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{sistema}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.sistemaGestionRH && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.sistemaGestionRH}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      26. ¿Cuál es tu reto más grande en gestión de personas? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "No logro retener talento",
                        "Hay rotación o desorden",
                        "No puedo delegar",
                        "Mi equipo no es productivo",
                      ].map((reto) => (
                        <label key={reto} className="flex items-center">
                          <input
                            type="radio"
                            name="retoGestionPersonas"
                            value={reto}
                            checked={diagnostico.retoGestionPersonas === reto}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{reto}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.retoGestionPersonas && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.retoGestionPersonas}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 8: Tecnología y Digitalización */}
            <div className="mb-4">
              <div
                className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
                onClick={() => toggleBlock("bloque8")}
              >
                <h3 className="text-xl font-semibold text-blue-900">Bloque 8: Tecnología y Digitalización</h3>
                <svg
                  className={`w-6 h-6 transform transition-transform duration-300 ${
                    expandedBlocks.bloque8 ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {expandedBlocks.bloque8 && (
                <div className="p-4 bg-gray-50 rounded-lg mt-2 animate__animated animate__fadeIn">
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      27. ¿Qué herramientas digitales usas actualmente? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "Ninguna",
                        "WhatsApp, Excel, redes",
                        "CRM, software de ventas, contabilidad",
                        "Herramientas integradas (ERP, automatizaciones)",
                      ].map((herramienta) => (
                        <label key={herramienta} className="flex items-center">
                          <input
                            type="radio"
                            name="herramientasDigitales"
                            value={herramienta}
                            checked={diagnostico.herramientasDigitales === herramienta}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{herramienta}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.herramientasDigitales && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.herramientasDigitales}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      28. ¿Cuál es el mayor reto tecnológico que enfrentas? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "No sé qué usar ni por dónde empezar",
                        "No tengo dinero para invertir",
                        "Tengo herramientas pero no las aprovecho",
                        "No tengo a nadie que me ayude a implementarlas",
                      ].map((reto) => (
                        <label key={reto} className="flex items-center">
                          <input
                            type="radio"
                            name="retoTecnologico"
                            value={reto}
                            checked={diagnostico.retoTecnologico === reto}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{reto}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.retoTecnologico && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.retoTecnologico}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 9: Legal y Fiscal */}
            <div className="mb-4">
              <div
                className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer"
                onClick={() => toggleBlock("bloque9")}
              >
                <h3 className="text-xl font-semibold text-blue-900">Bloque 9: Legal y Fiscal</h3>
                <svg
                  className={`w-6 h-6 transform transition-transform duration-300 ${
                    expandedBlocks.bloque9 ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {expandedBlocks.bloque9 && (
                <div className="p-4 bg-gray-50 rounded-lg mt-2 animate__animated animate__fadeIn">
                  {/* Pregunta 29 */}
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      29.&nbsp;¿Qué tan clara tienes tu situación fiscal y legal? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "No estoy dado de alta / no sé mi situación",
                        "Cumplo parcialmente y tengo dudas",
                        "Cumplo con obligaciones básicas",
                        "Tengo todo al día y asesoría especializada",
                      ].map((claridad) => (
                        <label key={claridad} className="flex items-center">
                          <input
                            type="radio"
                            name="claridadFiscalLegal"
                            value={claridad}
                            checked={diagnostico.claridadFiscalLegal === claridad}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{claridad}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.claridadFiscalLegal && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.claridadFiscalLegal}
                      </p>
                    )}
                  </div>

                  {/* Pregunta 30 */}
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-600 font-medium">
                      30.&nbsp;¿Cuentas con contratos, políticas internas o manuales
                      actualizados? *
                    </label>
                    <div className="space-y-2">
                      {[
                        "No tengo nada",
                        "Tengo algunos contratos sin actualizar",
                        "Cuento con contratos y políticas básicas",
                        "Tengo todo actualizado y revisado por especialistas",
                      ].map((contrato) => (
                        <label key={contrato} className="flex items-center">
                          <input
                            type="radio"
                            name="contratosPoliticas"
                            value={contrato}
                            checked={diagnostico.contratosPoliticas === contrato}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-600">{contrato}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.contratosPoliticas && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.contratosPoliticas}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-center space-x-4 mt-8">
              <button
                onClick={submitDiagnostico}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-300"
              >
                {editingKey ? "Actualizar Diagnóstico" : "Guardar Diagnóstico"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingKey(null);
                  setDiagnostico(initialDiagnostico);
                  setFormErrors({});
                }}
                className="bg-gray-400 text-white px-8 py-3 rounded-lg hover:bg-gray-500 transition duration-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Vista detallada del diagnóstico seleccionado */}
        {selectedDiagnostico && !showForm && (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate__animated animate__fadeIn">
            <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
              Detalle del Diagnóstico
            </h2>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Fecha:</span>{" "}
              {new Date(selectedDiagnostico.createdAt).toLocaleString()}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Nombre:</span>{" "}
              {selectedDiagnostico.nombreCompleto}
            </p>
            {/* Agrega aquí más campos si deseas mostrarlos */}
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};

export default DiagnosticoEmpresarial;