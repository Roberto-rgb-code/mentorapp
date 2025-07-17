// pages/dashboard/asesoria.tsx
import { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import s3 from "../../lib/aws";
import {
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import PrivateLayout from "../../components/layout/PrivateLayout";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Interfaz del perfil
interface PerfilData {
  userId: string;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  ciudadPais: string;
  ultimoGrado: string;
  areaEstudios: string;
  anosExperiencia: string;
  experienciaMipymes: string;
  areasExperiencia: string[];
  casoExito: string;
  tipoAcompanamiento: string;
  modalidadTrabajo: string;
  disponibilidadSemanal: string;
  tarifa: string;
  motivacion: string;
  profileImageUrl?: string;
  confirmacionEntrevista: boolean;
  createdAt: string;
  role: "MENTOR" | "ENTREPRENEUR";
  isVisibleInAsesoria: boolean;
}

type PerfilWithKey = PerfilData & { _key: string };
type MaybePerfilWithKey = PerfilData & { _key?: string } | null;

const Asesoria = () => {
  const { user } = useAuth();
  const [perfiles, setPerfiles] = useState<PerfilWithKey[]>([]);
  const [mensaje, setMensaje] = useState<{ error?: string; success?: string }>({});
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<MaybePerfilWithKey>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [formErrors, setFormErrors] = useState<{ [key: number]: string[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArea, setFilterArea] = useState("");

  // Estado inicial del perfil
  const initialPerfil: PerfilData = {
    userId: user?.uid || "",
    nombreCompleto: "",
    correo: "",
    telefono: "",
    ciudadPais: "",
    ultimoGrado: "",
    areaEstudios: "",
    anosExperiencia: "",
    experienciaMipymes: "",
    areasExperiencia: [],
    casoExito: "",
    tipoAcompanamiento: "",
    modalidadTrabajo: "",
    disponibilidadSemanal: "",
    tarifa: "",
    motivacion: "",
    profileImageUrl: "/images/default-profile.jpg",
    confirmacionEntrevista: false,
    createdAt: new Date().toISOString(),
    role: "MENTOR",
    isVisibleInAsesoria: false,
  };
  const [perfil, setPerfil] = useState<PerfilData>(initialPerfil);
  const [file, setFile] = useState<File | null>(null);

  // **Read**: Cargar perfiles desde S3
  useEffect(() => {
    if (!user) {
      setMensaje({ error: "Inicia sesión primero." });
      return;
    }
    const fetchPerfiles = async () => {
      setIsLoading(true);
      try {
        const list = await s3.send(
          new ListObjectsV2Command({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!, Prefix: "perfiles/" })
        );
        const items = list.Contents?.map((i) => i.Key!).filter(Boolean) || [];
        const datos = await Promise.all(
          items.map(async (Key) => {
            if (!Key.endsWith('.json')) {
              console.log(`Skipping non-JSON file: ${Key}`);
              return null;
            }
            try {
              const res = await s3.send(new GetObjectCommand({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!, Key }));
              const body = await res.Body?.transformToString('utf-8');
              if (body) {
                try {
                  const data = JSON.parse(body) as PerfilData;
                  return { ...data, _key: Key };
                } catch (parseError) {
                  console.error(`Error al parsear JSON para la clave ${Key}:`, parseError);
                  return null;
                }
              } else {
                console.error(`No se encontró contenido para la clave ${Key}`);
                return null;
              }
            } catch (fetchError) {
              console.error(`Error al leer el archivo ${Key}:`, fetchError);
              return null;
            }
          })
        );
        const filteredDatos = datos
          .filter((d): d is PerfilWithKey => d !== null)
          .filter((d, index, self) => 
            index === self.findIndex((t) => t._key === d._key)
          );
        setPerfiles(filteredDatos);
      } catch (e) {
        console.error("Error al cargar perfiles:", e);
        setMensaje({ error: "Error al cargar perfiles." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPerfiles();
  }, [user]);

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (mensaje.error || mensaje.success) {
      const timer = setTimeout(() => setMensaje({}), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // Manejar cambios en el formulario
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setPerfil((p) => {
      const newPerfil = { ...p };
      if (type === "checkbox") {
        if (name === "isVisibleInAsesoria" || name === "confirmacionEntrevista") {
          newPerfil[name] = checked;
        } else {
          newPerfil.areasExperiencia = checked
            ? [...p.areasExperiencia, value]
            : p.areasExperiencia.filter((v) => v !== value);
        }
      } else if (type === "radio") {
        (newPerfil as any)[name] = value;
      } else {
        (newPerfil as any)[name] = value;
      }

      // Clear errors for the field being updated
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((step) => {
          const stepNum = parseInt(step);
          newErrors[stepNum] = newErrors[stepNum]?.filter((err) => err !== name) || [];
          if (newErrors[stepNum].length === 0) delete newErrors[stepNum];
        });
        return newErrors;
      });
      return newPerfil;
    });
  };

  // Subir archivo a S3
  const uploadFile = async (file: File) => {
    try {
      const Key = `perfiles/${user!.uid}-${Date.now()}-${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      const bodyData = new Uint8Array(arrayBuffer);
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
          Key,
          Body: bodyData,
          ContentType: file.type,
        })
      );
      return `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${Key}`;
    } catch (e) {
      console.error("Error al subir archivo:", e);
      throw e;
    }
  };

  // Validar campos requeridos por paso
  const validateStep = (step: number): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];
    switch (step) {
      case 0:
        break;
      case 1:
        if (!perfil.nombreCompleto) missingFields.push("nombreCompleto");
        if (!perfil.correo) missingFields.push("correo");
        if (!perfil.telefono) missingFields.push("telefono");
        if (!perfil.ciudadPais) missingFields.push("ciudadPais");
        break;
      case 2:
        if (!perfil.ultimoGrado) missingFields.push("ultimoGrado");
        if (!perfil.areaEstudios) missingFields.push("areaEstudios");
        break;
      case 3:
        if (!perfil.anosExperiencia) missingFields.push("anosExperiencia");
        if (!perfil.experienciaMipymes) missingFields.push("experienciaMipymes");
        break;
      case 4:
        if (perfil.areasExperiencia.length === 0) missingFields.push("areasExperiencia");
        if (!perfil.casoExito) missingFields.push("casoExito");
        break;
      case 5:
        if (!perfil.tipoAcompanamiento) missingFields.push("tipoAcompanamiento");
        if (!perfil.modalidadTrabajo) missingFields.push("modalidadTrabajo");
        break;
      case 6:
        if (!perfil.disponibilidadSemanal) missingFields.push("disponibilidadSemanal");
        if (!perfil.tarifa) missingFields.push("tarifa");
        break;
      case 7:
        if (!perfil.confirmacionEntrevista) missingFields.push("confirmacionEntrevista");
        break;
      default:
        break;
    }
    return { isValid: missingFields.length === 0, missingFields };
  };

  const validateAllSteps = () => {
    const errors: { [key: number]: string[] } = {};
    let firstErrorStep = -1;
    for (let step = 0; step < totalCards; step++) {
      const { isValid, missingFields } = validateStep(step);
      if (!isValid) {
        errors[step] = missingFields;
        if (firstErrorStep === -1) firstErrorStep = step;
      }
    }
    setFormErrors(errors);
    return { hasErrors: firstErrorStep !== -1, firstErrorStep };
  };

  // **Create/Update**: Guardar o actualizar perfil
  const submitPerfil = async () => {
    if (!user) {
      setMensaje({ error: "Inicia sesión primero." });
      return;
    }
    const { hasErrors, firstErrorStep } = validateAllSteps();
    if (hasErrors) {
      setCurrentCardIndex(firstErrorStep);
      setMensaje({ error: "Por favor, completa todos los campos obligatorios antes de guardar." });
      return;
    }
    setIsLoading(true);
    try {
      if (file) {
        perfil.profileImageUrl = await uploadFile(file);
      }
      const Key = editingKey || `perfiles/${user.uid}-${Date.now()}.json`;
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
          Key,
          Body: JSON.stringify({ ...perfil, userId: user.uid, createdAt: new Date().toISOString() }),
          ContentType: "application/json",
          ContentEncoding: "utf-8",
        })
      );
      setPerfiles((prev) =>
        editingKey
          ? prev.map((p) => (p._key === Key ? { ...perfil, _key: Key } : p))
          : [...prev, { ...perfil, _key: Key }]
      );
      setMensaje({ success: editingKey ? "Perfil actualizado exitosamente." : "Perfil creado exitosamente." });
      setShowForm(false);
      setEditingKey(null);
      setPerfil(initialPerfil);
      setFile(null);
      setCurrentCardIndex(0);
      setFormErrors({});
    } catch (e) {
      console.error("Error al guardar perfil:", e);
      setMensaje({ error: "Error al guardar perfil. Intenta de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  // **Update**: Cargar datos para edición
  const editPerfil = (p: PerfilWithKey) => {
    setPerfil(p);
    setEditingKey(p._key);
    setShowForm(true);
    setCurrentCardIndex(0);
    setFormErrors({});
  };

  // **Delete**: Eliminar perfil
  const deletePerfil = async (Key: string) => {
    if (!confirm("¿Estás seguro de eliminar este perfil? Esta acción no se puede deshacer.")) return;
    setIsLoading(true);
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!, Key }));
      setPerfiles((prev) => prev.filter((p) => p._key !== Key));
      setMensaje({ success: "Perfil eliminado exitosamente." });
    } catch (e) {
      console.error("Error al eliminar perfil:", e);
      setMensaje({ error: "No se pudo eliminar el perfil. Intenta de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  // Seleccionar consultor para ver detalles
  const handleSelectConsultant = (consultant: PerfilWithKey) => {
    setSelectedConsultant(consultant);
  };

  // Filtrar perfiles
  const filteredPerfiles = perfiles.filter((p) => {
    if (!p.isVisibleInAsesoria) return false;
    
    const matchesSearch = searchTerm === "" || 
      p.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.areaEstudios.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ciudadPais.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArea = filterArea === "" || 
      p.areasExperiencia.some(area => area.toLowerCase().includes(filterArea.toLowerCase()));
    
    return matchesSearch && matchesArea;
  });

  // Configuración del carrusel
  const settings = {
    dots: true,
    infinite: filteredPerfiles.length > 3,
    speed: 500,
    slidesToShow: Math.min(3, filteredPerfiles.length),
    slidesToScroll: 1,
    arrows: true,
    autoplay: filteredPerfiles.length > 3,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(2, filteredPerfiles.length) } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const totalCards = 8;
  const stepTitles = [
    "Foto de Perfil",
    "Datos Personales", 
    "Formación Académica",
    "Experiencia",
    "Especialidad",
    "Metodología",
    "Disponibilidad",
    "Confirmación"
  ];

  const nextCard = () => {
    const { isValid, missingFields } = validateStep(currentCardIndex);
    if (!isValid) {
      setFormErrors((prev) => ({
        ...prev,
        [currentCardIndex]: missingFields,
      }));
      setMensaje({ error: "Por favor, completa todos los campos obligatorios antes de continuar." });
      return;
    }
    setMensaje({}); // Limpiar mensaje de error
    if (currentCardIndex < totalCards - 1) setCurrentCardIndex(currentCardIndex + 1);
  };

  const prevCard = () => {
    setMensaje({}); // Limpiar mensaje de error
    if (currentCardIndex > 0) setCurrentCardIndex(currentCardIndex - 1);
  };

  const goToStep = (stepIndex: number) => {
    // Validar pasos anteriores antes de saltar
    for (let i = 0; i < stepIndex; i++) {
      const { isValid } = validateStep(i);
      if (!isValid && i !== 0) { // Paso 0 (foto) es opcional
        setMensaje({ error: `Completa el paso ${i + 1} antes de continuar.` });
        return;
      }
    }
    setCurrentCardIndex(stepIndex);
    setMensaje({});
  };

  // Obtener áreas únicas para el filtro
  const uniqueAreas = Array.from(new Set(
    perfiles.flatMap(p => p.areasExperiencia)
  )).sort();

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Loader global */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-700 font-medium">Procesando...</span>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Header con gradiente mejorado */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Conecta con Mentores Expertos
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encuentra el mentor perfecto para impulsar tu negocio al siguiente nivel
            </p>
          </div>

          {/* Botón de acción principal mejorado */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => {
                setShowForm((v) => !v);
                if (showForm) {
                  setEditingKey(null);
                  setPerfil(initialPerfil);
                  setFile(null);
                  setCurrentCardIndex(0);
                  setFormErrors({});
                  setMensaje({});
                }
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg flex items-center space-x-2"
            >
              {showForm ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Cancelar</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Convertirme en Mentor</span>
                </>
              )}
            </button>
          </div>

          {/* Mensajes mejorados con mejor styling */}
          {mensaje.error && (
            <div className="max-w-md mx-auto mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 font-medium">{mensaje.error}</p>
              </div>
            </div>
          )}
          
          {mensaje.success && (
            <div className="max-w-md mx-auto mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-700 font-medium">{mensaje.success}</p>
              </div>
            </div>
          )}

          {/* Formulario mejorado con mejor navegación */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl mx-auto mb-12 overflow-hidden">
              {/* Header del formulario */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <h2 className="text-3xl font-bold text-center">
                  {editingKey ? "Actualizar Perfil de Mentor" : "Registro de Mentor"}
                </h2>
                <p className="text-center text-blue-100 mt-2">
                  Completa tu información para conectar con emprendedores
                </p>
              </div>

              {/* Indicador de progreso mejorado */}
              <div className="px-6 py-4 bg-gray-50 border-b">
                <div className="flex justify-between items-center mb-4">
                  {stepTitles.map((title, i) => (
                    <div key={i} className="flex flex-col items-center cursor-pointer group" onClick={() => goToStep(i)}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          i === currentCardIndex 
                            ? "bg-blue-600 text-white shadow-lg transform scale-110" 
                            : i < currentCardIndex 
                            ? "bg-green-500 text-white" 
                            : formErrors[i]?.length > 0 
                            ? "bg-red-500 text-white" 
                            : "bg-gray-200 text-gray-500 group-hover:bg-gray-300"
                        }`}
                      >
                        {i < currentCardIndex ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span className={`text-xs mt-1 text-center ${i === currentCardIndex ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                        {title}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
                  ></div>
                </div>
                
                <p className="text-center text-gray-600 mt-2 font-medium">
                  Paso {currentCardIndex + 1} de {totalCards}
                </p>
              </div>

              {/* Contenido del formulario */}
              <div className="p-8">
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
                  >
                    {/* Paso 1: Foto de perfil mejorada */}
                    <div className="min-w-full px-4">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-gray-200">
                        <div className="text-center">
                          <div className="w-32 h-32 mx-auto mb-6 relative">
                            <img
                              src={file ? URL.createObjectURL(file) : perfil.profileImageUrl}
                              alt="Foto de perfil"
                              className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white"
                            />
                            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">Sube tu foto de perfil</h3>
                          <p className="text-gray-600">Una foto profesional ayuda a generar confianza (opcional)</p>
                        </div>
                      </div>
                    </div>

                    {/* Paso 2: Datos personales mejorados */}
                    <div className="min-w-full px-4">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Datos Personales</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block mb-2 text-gray-700 font-semibold">Nombre completo *</label>
                            <input
                              name="nombreCompleto"
                              value={perfil.nombreCompleto}
                              onChange={handleChange}
                              placeholder="Ej: María González"
                              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                formErrors[1]?.includes("nombreCompleto") ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                              }`}
                            />
                            {formErrors[1]?.includes("nombreCompleto") && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Este campo es obligatorio
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-2 text-gray-700 font-semibold">Correo electrónico *</label>
                            <input
                              name="correo"
                              type="email"
                              value={perfil.correo}
                              onChange={handleChange}
                              placeholder="correo@ejemplo.com"
                              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                formErrors[1]?.includes("correo") ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                              }`}
                            />
                            {formErrors[1]?.includes("correo") && (
                              <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-2 text-gray-700 font-semibold">Teléfono (con LADA) *</label>
                            <input
                              name="telefono"
                              type="tel"
                              value={perfil.telefono}
                              onChange={handleChange}
                              placeholder="+52 55 1234 5678"
                              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                formErrors[1]?.includes("telefono") ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                              }`}
                            />
                            {formErrors[1]?.includes("telefono") && (
                              <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <label className="block mb-2 text-gray-700 font-semibold">Ciudad y país de residencia *</label>
                            <input
                              name="ciudadPais"
                              value={perfil.ciudadPais}
                              onChange={handleChange}
                              placeholder="Ciudad de México, México"
                              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                formErrors[1]?.includes("ciudadPais") ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                              }`}
                            />
                            {formErrors[1]?.includes("ciudadPais") && (
                              <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 3: Formación académica mejorada */}
                    <div className="min-w-full px-4">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Formación Académica</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block mb-4 text-gray-700 font-semibold">Último grado académico obtenido *</label>
                            <div className="grid md:grid-cols-2 gap-3">
                              {["Técnico", "Licenciatura", "Maestría", "Doctorado", "Otro"].map((grado) => (
                                <label key={grado} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                                  perfil.ultimoGrado === grado ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                }`}>
                                  <input
                                    type="radio"
                                    name="ultimoGrado"
                                    value={grado}
                                    checked={perfil.ultimoGrado === grado}
                                    onChange={handleChange}
                                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700 font-medium">{grado}</span>
                                </label>
                              ))}
                            </div>
                            {formErrors[2]?.includes("ultimoGrado") && (
                              <p className="text-red-500 text-sm mt-2">Este campo es obligatorio</p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-2 text-gray-700 font-semibold">Área de estudios *</label>
                            <input
                              name="areaEstudios"
                              value={perfil.areaEstudios}
                              onChange={handleChange}
                              placeholder="Ej: Administración de Empresas, Ingeniería, Marketing..."
                              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                formErrors[2]?.includes("areaEstudios") ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                              }`}
                            />
                            {formErrors[2]?.includes("areaEstudios") && (
                              <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 4: Experiencia mejorada */}
                    <div className="min-w-full px-4">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Experiencia Profesional</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block mb-4 text-gray-700 font-semibold">Años de experiencia *</label>
                            <div className="grid md:grid-cols-2 gap-3">
                              {["Menos de 1 año", "1-3 años", "4-7 años", "Más de 8 años"].map((exp) => (
                                <label key={exp} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                                  perfil.anosExperiencia === exp ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                }`}>
                                  <input
                                    type="radio"
                                    name="anosExperiencia"
                                    value={exp}
                                    checked={perfil.anosExperiencia === exp}
                                    onChange={handleChange}
                                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700 font-medium">{exp}</span>
                                </label>
                              ))}
                            </div>
                            {formErrors[3]?.includes("anosExperiencia") && (
                              <p className="text-red-500 text-sm mt-2">Este campo es obligatorio</p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-4 text-gray-700 font-semibold">Experiencia con MIPYMES *</label>
                            <div className="space-y-3">
                              {[
                                "Sí, de forma recurrente", 
                                "Sí, pero no es mi enfoque principal", 
                                "No, mi experiencia es con grandes empresas", 
                                "Estoy comenzando en este mercado"
                              ].map((exp) => (
                                <label key={exp} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                                  perfil.experienciaMipymes === exp ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                }`}>
                                  <input
                                    type="radio"
                                    name="experienciaMipymes"
                                    value={exp}
                                    checked={perfil.experienciaMipymes === exp}
                                    onChange={handleChange}
                                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700 font-medium">{exp}</span>
                                </label>
                              ))}
                            </div>
                            {formErrors[3]?.includes("experienciaMipymes") && (
                              <p className="text-red-500 text-sm mt-2">Este campo es obligatorio</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 5: Especialidad profesional mejorada */}
                    <div className="min-w-full px-4">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Especialidad Profesional</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block mb-4 text-gray-700 font-semibold">
                              Selecciona hasta 3 áreas en las que tienes mayor experiencia *
                            </label>
                            <div className="grid md:grid-cols-2 gap-3">
                              {[
                                "Estrategia y Planeación", 
                                "Finanzas", 
                                "Recursos Humanos", 
                                "Marketing y Ventas", 
                                "Operaciones y Procesos", 
                                "Innovación y Tecnología", 
                                "Legal y Fiscal", 
                                "Sustentabilidad y Responsabilidad Social", 
                                "Consultoría Sectorial Especializada", 
                                "Desarrollo Personal y Organizacional"
                              ].map((area) => (
                                <label key={area} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                                  perfil.areasExperiencia.includes(area) ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                } ${perfil.areasExperiencia.length >= 3 && !perfil.areasExperiencia.includes(area) ? "opacity-50 cursor-not-allowed" : ""}`}>
                                  <input
                                    type="checkbox"
                                    name="areasExperiencia"
                                    value={area}
                                    checked={perfil.areasExperiencia.includes(area)}
                                    onChange={handleChange}
                                    disabled={perfil.areasExperiencia.length >= 3 && !perfil.areasExperiencia.includes(area)}
                                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700 font-medium text-sm">{area}</span>
                                </label>
                              ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              Seleccionadas: {perfil.areasExperiencia.length}/3
                            </p>
                            {formErrors[4]?.includes("areasExperiencia") && (
                              <p className="text-red-500 text-sm mt-2">Debes seleccionar al menos una área</p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-2 text-gray-700 font-semibold">
                              ¿Cuál ha sido uno de tus casos de éxito más representativos? *
                            </label>
                            <textarea
                              name="casoExito"
                              value={perfil.casoExito}
                              onChange={handleChange}
                              placeholder="Describe brevemente un proyecto o cliente exitoso donde hayas logrado resultados significativos..."
                              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                                formErrors[4]?.includes("casoExito") ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                              }`}
                              rows={4}
                            />
                            {formErrors[4]?.includes("casoExito") && (
                              <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 6: Estilo y metodología mejorado */}
                    <div className="min-w-full px-4">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Metodología de Trabajo</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block mb-4 text-gray-700 font-semibold">
                              ¿Qué tipo de acompañamiento ofreces actualmente? *
                            </label>
                            <div className="space-y-3">
                              {[
                                "Asesoría puntual (1-2 sesiones)", 
                                "Proyectos de mediano plazo", 
                                "Acompañamiento continuo (programas)", 
                                "Talleres / formación grupal"
                              ].map((tipo) => (
                                <label key={tipo} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                                  perfil.tipoAcompanamiento === tipo ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                }`}>
                                  <input
                                    type="radio"
                                    name="tipoAcompanamiento"
                                    value={tipo}
                                    checked={perfil.tipoAcompanamiento === tipo}
                                    onChange={handleChange}
                                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700 font-medium">{tipo}</span>
                                </label>
                              ))}
                            </div>
                            {formErrors[5]?.includes("tipoAcompanamiento") && (
                              <p className="text-red-500 text-sm mt-2">Este campo es obligatorio</p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-4 text-gray-700 font-semibold">¿Cómo prefieres trabajar? *</label>
                            <div className="grid md:grid-cols-2 gap-3">
                              {["100% virtual", "Mixto"].map((mod) => (
                                <label key={mod} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                                  perfil.modalidadTrabajo === mod ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                }`}>
                                  <input
                                    type="radio"
                                    name="modalidadTrabajo"
                                    value={mod}
                                    checked={perfil.modalidadTrabajo === mod}
                                    onChange={handleChange}
                                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700 font-medium">{mod}</span>
                                </label>
                              ))}
                            </div>
                            {formErrors[5]?.includes("modalidadTrabajo") && (
                              <p className="text-red-500 text-sm mt-2">Este campo es obligatorio</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 7: Disponibilidad mejorada */}
                    <div className="min-w-full px-4">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Disponibilidad y Tarifas</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block mb-4 text-gray-700 font-semibold">
                              ¿Cuál es tu disponibilidad semanal para atender emprendedores? *
                            </label>
                            <div className="grid md:grid-cols-2 gap-3">
                              {["1-3 hrs por semana", "4-8 hrs", "9-15 hrs", "Tiempo completo"].map((disp) => (
                                <label key={disp} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                                  perfil.disponibilidadSemanal === disp ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                }`}>
                                  <input
                                    type="radio"
                                    name="disponibilidadSemanal"
                                    value={disp}
                                    checked={perfil.disponibilidadSemanal === disp}
                                    onChange={handleChange}
                                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700 font-medium">{disp}</span>
                                </label>
                              ))}
                            </div>
                            {formErrors[6]?.includes("disponibilidadSemanal") && (
                              <p className="text-red-500 text-sm mt-2">Este campo es obligatorio</p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-4 text-gray-700 font-semibold">¿Tienes una tarifa estándar? *</label>
                            <div className="space-y-4">
                              <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                                perfil.tarifa.startsWith("Por hora") ? "border-blue-500 bg-blue-50" : "border-gray-200"
                              }`}>
                                <input
                                  type="radio"
                                  name="tarifaTipo"
                                  value="Por hora"
                                  checked={perfil.tarifa.startsWith("Por hora")}
                                  onChange={(e) => setPerfil(p => ({ ...p, tarifa: e.target.value }))}
                                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700 font-medium">Por hora</span>
                              </label>
                              {perfil.tarifa.startsWith("Por hora") && (
                                <input
                                  name="tarifa"
                                  value={perfil.tarifa.replace("Por hora", "").trim()}
                                  onChange={(e) => setPerfil(p => ({ ...p, tarifa: `Por hora ${e.target.value}` }))}
                                  placeholder="$ 500 MXN"
                                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ml-6"
                                />
                              )}
                              
                              <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                                perfil.tarifa.startsWith("Por paquete") ? "border-blue-500 bg-blue-50" : "border-gray-200"
                              }`}>
                                <input
                                  type="radio"
                                  name="tarifaTipo"
                                  value="Por paquete"
                                  checked={perfil.tarifa.startsWith("Por paquete")}
                                  onChange={(e) => setPerfil(p => ({ ...p, tarifa: e.target.value }))}
                                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700 font-medium">Por paquete</span>
                              </label>
                              {perfil.tarifa.startsWith("Por paquete") && (
                                <textarea
                                  name="tarifa"
                                  value={perfil.tarifa.replace("Por paquete", "").trim()}
                                  onChange={(e) => setPerfil(p => ({ ...p, tarifa: `Por paquete ${e.target.value}` }))}
                                  placeholder="Describe brevemente tus paquetes y precios..."
                                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ml-6 resize-none"
                                  rows={3}
                                />
                              )}
                            </div>
                            {formErrors[6]?.includes("tarifa") && (
                              <p className="text-red-500 text-sm mt-2">Este campo es obligatorio</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 8: Confirmación mejorada */}
                    <div className="min-w-full px-4">
                      <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-xl border border-gray-200">
                        <div className="text-center mb-6">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Casi terminamos!</h3>
                          <p className="text-gray-600">Configura la visibilidad de tu perfil y confirma tu información</p>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <label className="flex items-start space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                name="isVisibleInAsesoria"
                                checked={perfil.isVisibleInAsesoria}
                                onChange={handleChange}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div>
                                <span className="text-gray-800 font-medium">Hacer mi perfil visible públicamente</span>
                                <p className="text-sm text-gray-600 mt-1">
                                  Los emprendedores podrán ver tu perfil y contactarte directamente
                                </p>
                              </div>
                            </label>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <label className="flex items-start space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                name="confirmacionEntrevista"
                                checked={perfil.confirmacionEntrevista}
                                onChange={handleChange}
                                className={`mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                                  formErrors[7]?.includes("confirmacionEntrevista") ? "border-red-500" : ""
                                }`}
                              />
                              <div>
                                <span className="text-gray-800 font-medium">Confirmación y aceptación *</span>
                                <p className="text-sm text-gray-600 mt-1">
                                  Confirmo que la información proporcionada es verídica y acepto ser contactado para una entrevista de validación
                                </p>
                              </div>
                            </label>
                            {formErrors[7]?.includes("confirmacionEntrevista") && (
                              <p className="text-red-500 text-sm mt-2">Debes aceptar esta confirmación para continuar</p>
                            )}
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-start space-x-3">
                              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <div>
                                <h4 className="text-blue-800 font-medium">Próximos pasos</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                  Nuestro equipo revisará tu perfil y te contactaremos en las próximas 48 horas para completar el proceso de validación.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de navegación mejorados */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={prevCard}
                    disabled={currentCardIndex === 0}
                    className={`px-6 py-3 rounded-lg flex items-center space-x-2 font-medium transition-all duration-300 ${
                      currentCardIndex === 0 
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                        : "bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg transform hover:-translate-y-0.5"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Anterior</span>
                  </button>
                  
                  {currentCardIndex < totalCards - 1 ? (
                    <button
                      onClick={nextCard}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <span>Siguiente</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={submitPerfil}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{editingKey ? "Actualizar Perfil" : "Crear Perfil"}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sección de mentores con filtros mejorados */}
          {!showForm && (
            <div className="mt-12">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
                <h2 className="text-3xl font-bold text-gray-800">Mentores Disponibles</h2>
                
                {/* Filtros */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar mentor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  <select
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas las áreas</option>
                    {uniqueAreas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Mentores</p>
                      <p className="text-3xl font-bold text-blue-600">{filteredPerfiles.length}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Áreas Especializadas</p>
                      <p className="text-3xl font-bold text-purple-600">{uniqueAreas.length}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Conexiones Activas</p>
                      <p className="text-3xl font-bold text-green-600">24/7</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carrusel de perfiles mejorado */}
              {filteredPerfiles.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <Slider {...settings}>
                    {filteredPerfiles.map((p) => (
                      <div key={p._key} className="px-4">
                        <div
                          className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
                          onClick={() => handleSelectConsultant(p)}
                        >
                          {/* Avatar y ubicación */}
                          <div className="relative mb-4">
                            <img
                              src={p.profileImageUrl}
                              alt={p.nombreCompleto}
                              className="w-20 h-20 rounded-full mx-auto shadow-lg border-4 border-white group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                                <span>Online</span>
                              </span>
                            </div>
                          </div>

                          {/* Información básica */}
                          <div className="text-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                              {p.nombreCompleto}
                            </h3>
                            <div className="flex items-center justify-center text-gray-600 mb-2">
                              <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm">{p.ciudadPais}</span>
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              p.role === "MENTOR" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {p.role === "MENTOR" ? "Mentor Certificado" : "Emprendedor"}
                            </span>
                          </div>

                          {/* Experiencia */}
                          <div className="mb-4">
                            <div className="flex items-center justify-center mb-2">
                              <svg className="w-4 h-4 mr-1 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-semibold text-gray-700">Experiencia: {p.anosExperiencia}</span>
                            </div>
                            <p className="text-sm text-gray-600 text-center">{p.areaEstudios}</p>
                          </div>

                          {/* Áreas de especialidad */}
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-700 text-center mb-2">Especialidades:</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {p.areasExperiencia.slice(0, 2).map((area, index) => (
                                <span 
                                  key={index} 
                                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                >
                                  {area.length > 15 ? `${area.substring(0, 15)}...` : area}
                                </span>
                              ))}
                              {p.areasExperiencia.length > 2 && (
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                  +{p.areasExperiencia.length - 2}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Modalidad de trabajo */}
                          <div className="mb-4">
                            <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                              <div className="flex items-center">
                                <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                <span>{p.modalidadTrabajo}</span>
                              </div>
                              <div className="flex items-center">
                                <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span>{p.disponibilidadSemanal}</span>
                              </div>
                            </div>
                          </div>

                          {/* Botón de acción */}
                          <div className="text-center">
                            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform group-hover:scale-105 font-medium text-sm">
                              Ver Perfil Completo
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron mentores</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterArea 
                      ? "Intenta ajustar tus filtros de búsqueda" 
                      : "Aún no hay mentores disponibles en esta sección"
                    }
                  </p>
                  {(searchTerm || filterArea) && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterArea("");
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Limpiar Filtros
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Modal de detalles del consultor mejorado */}
          {selectedConsultant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header del modal */}
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                  <button
                    onClick={() => setSelectedConsultant(null)}
                    className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedConsultant.profileImageUrl}
                      alt={selectedConsultant.nombreCompleto}
                      className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                    />
                    <div>
                      <h2 className="text-2xl font-bold">{selectedConsultant.nombreCompleto}</h2>
                      <p className="text-blue-100">{selectedConsultant.areaEstudios}</p>
                      <div className="flex items-center mt-2">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-blue-100">{selectedConsultant.ciudadPais}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido del modal */}
                <div className="p-6 space-y-6">
                  {/* Información básica */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Experiencia</h4>
                      <p className="text-gray-600">{selectedConsultant.anosExperiencia}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Modalidad</h4>
                      <p className="text-gray-600">{selectedConsultant.modalidadTrabajo}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Disponibilidad</h4>
                      <p className="text-gray-600">{selectedConsultant.disponibilidadSemanal}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Tipo de acompañamiento</h4>
                      <p className="text-gray-600">{selectedConsultant.tipoAcompanamiento}</p>
                    </div>
                  </div>

                  {/* Áreas de experiencia */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Áreas de Especialidad</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedConsultant.areasExperiencia.map((area, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Caso de éxito */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Caso de Éxito</h4>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <p className="text-gray-700 italic">"{selectedConsultant.casoExito}"</p>
                    </div>
                  </div>

                  {/* Experiencia con MIPYMES */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Experiencia con MIPYMES</h4>
                    <p className="text-gray-600">{selectedConsultant.experienciaMipymes}</p>
                  </div>

                  {/* Tarifas */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Tarifas</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800 font-medium">{selectedConsultant.tarifa}</p>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="border-t pt-6">
                    {selectedConsultant.userId === user?.uid ? (
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            if (selectedConsultant && typeof selectedConsultant._key === "string") {
                              editPerfil(selectedConsultant as PerfilWithKey);
                              setSelectedConsultant(null);
                            }
                          }}
                          className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-all duration-300 font-medium flex items-center justify-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span>Editar Perfil</span>
                        </button>
                        <button
                          onClick={() => {
                            if (typeof selectedConsultant._key === "string") {
                              deletePerfil(selectedConsultant._key);
                              setSelectedConsultant(null);
                            }
                          }}
                          className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all duration-300 font-medium flex items-center justify-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L8.586 12l-1.293 1.293a1 1 0 101.414 1.414L10 13.414l1.293 1.293a1 1 0 001.414-1.414L11.414 12l1.293-1.293z" clipRule="evenodd" />
                          </svg>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <button
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium flex items-center justify-center space-x-2 shadow-lg"
                          onClick={() => alert(`Iniciando conexión con ${selectedConsultant.nombreCompleto}...`)}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <span>Contactar Mentor</span>
                        </button>
                        <button
                          className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-medium flex items-center justify-center space-x-2"
                          onClick={() => alert(`Guardando ${selectedConsultant.nombreCompleto} en favoritos...`)}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                          </svg>
                          <span>Guardar en Favoritos</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Asesoria;