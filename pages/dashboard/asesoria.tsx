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
        // Step 0 (profile picture) is optional, so it's always valid here conceptually
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
        if (!perfil.motivacion) missingFields.push("motivacion"); // Added 'motivacion' as required for step 7 based on form
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
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Experiencia Laboral</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block mb-2 text-gray-700 font-semibold">Años de experiencia relevante *</label>
                            <input
                              name="anosExperiencia"
                              type="number"
                              value={perfil.anosExperiencia}
                              onChange={handleChange}
                              placeholder="Ej: 5"
                              min="0"
                              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                formErrors[3]?.includes("anosExperiencia") ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                              }`}
                            />
                            {formErrors[3]?.includes("anosExperiencia") && (
                              <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-2 text-gray-700 font-semibold">Experiencia específica con MIPYMES (ej. proyectos, asesorías) *</label>
                            <textarea
                              name="experienciaMipymes"
                              value={perfil.experienciaMipymes}
                              onChange={handleChange}
                              rows={4}
                              placeholder="Describe brevemente tu experiencia con micro, pequeñas y medianas empresas..."
                              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                formErrors[3]?.includes("experienciaMipymes") ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                              }`}
                            ></textarea>
                            {formErrors[3]?.includes("experienciaMipymes") && (
                              <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 5: Especialidad y Caso de Éxito */}
                    <div className="min-w-full px-4">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Especialidad y Casos de Éxito</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block mb-4 text-gray-700 font-semibold">Áreas de experiencia y fortaleza (selecciona una o más) *</label>
                            <div className="grid md:grid-cols-2 gap-3">
                              {[
                                "Administración y Operaciones", "Finanzas y Contabilidad", "Marketing y Ventas",
                                "Recursos Humanos", "Tecnología y Digitalización", "Logística y Cadena de Suministro",
                                "Legal y Cumplimiento", "Innovación y Desarrollo de Productos", "Sustentabilidad y RSE",
                                "Comercio Exterior", "Transformación Digital", "Estrategia de Negocio"
                              ].map((area) => (
                                <label key={area} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                                  perfil.areasExperiencia.includes(area) ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                }`}>
                                  <input
                                    type="checkbox"
                                    name="areasExperiencia"
                                    value={area}
                                    checked={perfil.areasExperiencia.includes(area)}
                                    onChange={handleChange}
                                    className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700 font-medium">{area}</span>
                                </label>
                              ))}
                            </div>
                            {formErrors[4]?.includes("areasExperiencia") && (
                              <p className="text-red-500 text-sm mt-2">Debes seleccionar al menos una área.</p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-2 text-gray-700 font-semibold">Comparte un caso de éxito o proyecto relevante donde hayas generado un impacto significativo *</label>
                            <textarea
                              name="casoExito"
                              value={perfil.casoExito}
                              onChange={handleChange}
                              rows={4}
                              placeholder="Describe el reto, tu rol, las acciones tomadas y los resultados obtenidos..."
                              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                formErrors[4]?.includes("casoExito") ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                              }`}
                            ></textarea>
                            {formErrors[4]?.includes("casoExito") && (
                              <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 6: Tipo y Modalidad de Acompañamiento */}
                    <div className="min-w-full px-4">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Metodología de Acompañamiento</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block mb-4 text-gray-700 font-semibold">Tipo de acompañamiento que ofreces *</label>
                            <div className="grid md:grid-cols-2 gap-3">
                              {["Mentoría (guía, consejo)", "Consultoría (soluciones específicas)", "Coaching (desarrollo de habilidades)", "Mixto"].map((tipo) => (
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
                            <label className="block mb-4 text-gray-700 font-semibold">Modalidad de trabajo preferida *</label>
                            <div className="grid md:grid-cols-2 gap-3">
                              {["Presencial", "Remoto", "Híbrido"].map((modalidad) => (
                                <label key={modalidad} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                                  perfil.modalidadTrabajo === modalidad ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                }`}>
                                  <input
                                    type="radio"
                                    name="modalidadTrabajo"
                                    value={modalidad}
                                    checked={perfil.modalidadTrabajo === modalidad}
                                    onChange={handleChange}
                                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700 font-medium">{modalidad}</span>
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

                    {/* Paso 7: Disponibilidad y Tarifa */}
                    <div className="min-w-full px-4">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Disponibilidad y Tarifa</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block mb-2 text-gray-700 font-semibold">Disponibilidad semanal aproximada (horas) *</label>
                            <input
                              name="disponibilidadSemanal"
                              type="text" // Cambiado a text para flexibilidad, podrías validarlo como número si solo quieres horas exactas
                              value={perfil.disponibilidadSemanal}
                              onChange={handleChange}
                              placeholder="Ej: 5-10 horas/semana, Martes y Jueves por la tarde"
                              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                formErrors[6]?.includes("disponibilidadSemanal") ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                              }`}
                            />
                            {formErrors[6]?.includes("disponibilidadSemanal") && (
                              <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-2 text-gray-700 font-semibold">Tarifa por hora o por sesión (opcional, o indica "A convenir") *</label>
                            <input
                              name="tarifa"
                              type="text"
                              value={perfil.tarifa}
                              onChange={handleChange}
                              placeholder="Ej: $50 USD/hora, $200 USD/sesión, A convenir"
                              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                formErrors[6]?.includes("tarifa") ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                              }`}
                            />
                            {formErrors[6]?.includes("tarifa") && (
                              <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 8: Motivación y Confirmación */}
                    <div className="min-w-full px-4">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Motivación y Confirmación</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block mb-2 text-gray-700 font-semibold">¿Por qué te gustaría ser mentor en esta plataforma? *</label>
                            <textarea
                              name="motivacion"
                              value={perfil.motivacion}
                              onChange={handleChange}
                              rows={4}
                              placeholder="Comparte tu motivación para guiar a emprendedores..."
                              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                formErrors[7]?.includes("motivacion") ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                              }`}
                            ></textarea>
                            {formErrors[7]?.includes("motivacion") && (
                              <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                            )}
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="confirmacionEntrevista"
                              checked={perfil.confirmacionEntrevista}
                              onChange={handleChange}
                              className={`h-5 w-5 text-blue-600 rounded focus:ring-blue-500 ${
                                formErrors[7]?.includes("confirmacionEntrevista") ? "border-red-500" : "border-gray-300"
                              }`}
                            />
                            <label htmlFor="confirmacionEntrevista" className="ml-3 text-gray-700 font-semibold">
                              Confirmo que la información proporcionada es verídica y acepto ser contactado para una entrevista inicial. *
                            </label>
                          </div>
                          {formErrors[7]?.includes("confirmacionEntrevista") && (
                            <p className="text-red-500 text-sm mt-1">Debes aceptar los términos para continuar.</p>
                          )}
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="isVisibleInAsesoria"
                              checked={perfil.isVisibleInAsesoria}
                              onChange={handleChange}
                              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="isVisibleInAsesoria" className="ml-3 text-gray-700 font-semibold">
                              Quiero que mi perfil sea visible para emprendedores una vez aprobado.
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de navegación del formulario */}
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevCard}
                    disabled={currentCardIndex === 0}
                    className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Anterior
                  </button>
                  {currentCardIndex < totalCards - 1 && (
                    <button
                      type="button"
                      onClick={nextCard}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg transform hover:scale-105"
                    >
                      Siguiente
                      <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  {currentCardIndex === totalCards - 1 && (
                    <button
                      onClick={submitPerfil}
                      className="flex items-center px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300 shadow-lg transform hover:scale-105 font-semibold text-lg"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H5zm-1 9v-1h12v1H4zm1-8h10V6H5V5z" />
                      </svg>
                      {editingKey ? "Actualizar Perfil" : "Enviar Registro"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Secciones de la vista hardcodeada */}
          {!showForm && (
            <div className="space-y-12">
              {/* Sección: Sistema de Booking de Sesiones */}
              <section id="booking-system" className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                  1. Sistema de Booking de Sesiones
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">Agendar Nueva Sesión</h3>
                    <div className="mb-4">
                      <label htmlFor="session-type" className="block text-gray-700 text-sm font-medium mb-2">Tipo de Sesión:</label>
                      <select id="session-type" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="consultoria">Consultoría General</option>
                        <option value="desarrollo">Desarrollo Profesional</option>
                        <option value="tecnica">Asesoría Técnica</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="session-date" className="block text-gray-700 text-sm font-medium mb-2">Fecha:</label>
                      <input type="date" id="session-date" value="2025-08-15" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-6">
                      <label htmlFor="session-time" className="block text-gray-700 text-sm font-medium mb-2">Hora:</label>
                      <input type="time" id="session-time" value="10:00" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md font-semibold">
                      Buscar Disponibilidad
                    </button>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">Tus Próximas Sesiones</h3>
                    <div className="space-y-3">
                      <p className="text-gray-700"><strong className="text-blue-700">Sesión:</strong> Consultoría de Negocios</p>
                      <p className="text-gray-700"><strong className="text-blue-700">Consultor:</strong> Dr. Alex Rivera</p>
                      <p className="text-gray-700"><strong className="text-blue-700">Fecha y Hora:</strong> 15 de Agosto, 2025 - 10:00 AM</p>
                    </div>
                    <button className="mt-6 w-full bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition-all duration-300 shadow-md font-semibold">
                      Cancelar Sesión
                    </button>
                  </div>
                </div>
              </section>

              {/* Sección: Algoritmo de Matching con Consultores */}
              <section id="consultant-matching" className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                  2. Algoritmo de Matching con Consultores
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">Consultores Recomendados</h3>
                    <ul className="space-y-4">
                      {/* Aquí se mostrarán los perfiles cargados y filtrados */}
                      {filteredPerfiles.length > 0 ? (
                        <Slider {...settings}>
                          {filteredPerfiles.map((perfil) => (
                            <div key={perfil._key} className="p-2">
                              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col items-center text-center">
                                <img
                                  src={perfil.profileImageUrl || "/images/default-profile.jpg"}
                                  alt={perfil.nombreCompleto}
                                  className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-400"
                                />
                                <h4 className="text-lg font-bold text-gray-800 mb-1">{perfil.nombreCompleto}</h4>
                                <p className="text-sm text-gray-600 mb-2">{perfil.areaEstudios}</p>
                                <div className="flex justify-center text-yellow-500 mb-3">
                                  {/* Hardcoded stars for now, replace with dynamic rating later */}
                                  <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                                </div>
                                <p className="text-xs text-gray-500 italic mb-4">
                                  "{perfil.motivacion.substring(0, 70)}..." {/* Show snippet */}
                                </p>
                                <button
                                  onClick={() => handleSelectConsultant(perfil)}
                                  className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 transition-colors duration-300 shadow-md"
                                >
                                  Ver Perfil
                                </button>
                                {/* Botones de edición/eliminación si el usuario es administrador o el dueño del perfil */}
                                {user?.role === "ADMIN" && (
                                  <div className="mt-3 flex gap-2">
                                    <button
                                      onClick={() => editPerfil(perfil)}
                                      className="bg-yellow-500 text-white px-3 py-1 rounded-md text-xs hover:bg-yellow-600 transition-colors"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => deletePerfil(perfil._key)}
                                      className="bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </Slider>
                      ) : (
                        <p className="text-center text-gray-500">No hay mentores disponibles que coincidan con los criterios.</p>
                      )}
                    </ul>
                    <p className="text-sm text-gray-600 mt-4 text-center">Basado en tus preferencias y historial.</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">Filtrar Consultores</h3>
                    <div className="mb-4">
                      <label htmlFor="search-term" className="block text-gray-700 text-sm font-medium mb-2">Buscar por nombre, área o ciudad:</label>
                      <input
                        type="text"
                        id="search-term"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Ej: Marketing, María, Guadalajara"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mb-6">
                      <label htmlFor="filter-area" className="block text-gray-700 text-sm font-medium mb-2">Filtrar por Área de Experiencia:</label>
                      <select
                        id="filter-area"
                        value={filterArea}
                        onChange={(e) => setFilterArea(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todas las áreas</option>
                        {uniqueAreas.map((area) => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => { /* Implement filtering logic, currently done via state */ }}
                      className="w-full bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-all duration-300 shadow-md font-semibold"
                    >
                      Aplicar Filtros
                    </button>
                  </div>
                </div>
              </section>

              {/* Detalles del consultor seleccionado (condicional) */}
              {selectedConsultant && (
                <section id="consultant-details" className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    Detalles del Consultor: {selectedConsultant.nombreCompleto}
                  </h2>
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <img
                      src={selectedConsultant.profileImageUrl || "/images/default-profile.jpg"}
                      alt={selectedConsultant.nombreCompleto}
                      className="w-40 h-40 rounded-full object-cover border-4 border-blue-300 shadow-lg"
                    />
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-blue-700 mb-2">{selectedConsultant.nombreCompleto}</h3>
                      <p className="text-gray-700 mb-1"><strong>Correo:</strong> {selectedConsultant.correo}</p>
                      <p className="text-gray-700 mb-1"><strong>Teléfono:</strong> {selectedConsultant.telefono}</p>
                      <p className="text-gray-700 mb-1"><strong>Ubicación:</strong> {selectedConsultant.ciudadPais}</p>
                      <p className="text-gray-700 mb-1"><strong>Último Grado:</strong> {selectedConsultant.ultimoGrado} en {selectedConsultant.areaEstudios}</p>
                      <p className="text-gray-700 mb-1"><strong>Años Experiencia:</strong> {selectedConsultant.anosExperiencia}</p>
                      <p className="text-gray-700 mb-1"><strong>Experiencia MIPYMES:</strong> {selectedConsultant.experienciaMipymes}</p>
                      <p className="text-gray-700 mb-1"><strong>Áreas de Expertise:</strong> {selectedConsultant.areasExperiencia.join(', ')}</p>
                      <p className="text-gray-700 mb-1"><strong>Caso de Éxito:</strong> {selectedConsultant.casoExito}</p>
                      <p className="text-gray-700 mb-1"><strong>Tipo de Acompañamiento:</strong> {selectedConsultant.tipoAcompanamiento}</p>
                      <p className="text-gray-700 mb-1"><strong>Modalidad de Trabajo:</strong> {selectedConsultant.modalidadTrabajo}</p>
                      <p className="text-gray-700 mb-1"><strong>Disponibilidad Semanal:</strong> {selectedConsultant.disponibilidadSemanal}</p>
                      <p className="text-gray-700 mb-4"><strong>Tarifa:</strong> {selectedConsultant.tarifa}</p>
                      <p className="text-gray-800 italic mb-4">"{selectedConsultant.motivacion}"</p>
                      <button
                        onClick={() => setSelectedConsultant(null)}
                        className="bg-gray-400 text-white px-6 py-3 rounded-full hover:bg-gray-500 transition-all duration-300 shadow-md font-semibold"
                      >
                        Cerrar Detalles
                      </button>
                      <button
                        onClick={() => alert(`Agendando sesión con ${selectedConsultant.nombreCompleto}`)}
                        className="ml-4 bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-all duration-300 shadow-md font-semibold"
                      >
                        Agendar Sesión
                      </button>
                    </div>
                  </div>
                </section>
              )}


              {/* Sección: Interfaz de Agenda y Disponibilidad (Hardcoded para diseño) */}
              <section id="agenda-availability" className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                  3. Interfaz de Agenda y Disponibilidad
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">Mi Calendario de Sesiones</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 text-center">
                      <div className="bg-green-100 text-green-800 p-3 rounded-lg cursor-pointer hover:bg-green-200 transition-colors duration-200">Mañana (9:00 AM)</div>
                      <div className="bg-red-100 text-red-800 p-3 rounded-lg cursor-not-allowed opacity-70">Mañana (10:00 AM)</div>
                      <div className="bg-green-100 text-green-800 p-3 rounded-lg cursor-pointer hover:bg-green-200 transition-colors duration-200">Mañana (11:00 AM)</div>
                      <div className="bg-green-100 text-green-800 p-3 rounded-lg cursor-pointer hover:bg-green-200 transition-colors duration-200">Tarde (2:00 PM)</div>
                      <div className="bg-red-100 text-red-800 p-3 rounded-lg cursor-not-allowed opacity-70">Tarde (3:00 PM)</div>
                      <div className="bg-green-100 text-green-800 p-3 rounded-lg cursor-pointer hover:bg-green-200 transition-colors duration-200">Tarde (4:00 PM)</div>
                      <div className="bg-green-100 text-green-800 p-3 rounded-lg cursor-pointer hover:bg-green-200 transition-colors duration-200">Viernes (9:00 AM)</div>
                      <div className="bg-red-100 text-red-800 p-3 rounded-lg cursor-not-allowed opacity-70">Viernes (10:00 AM)</div>
                    </div>
                    <p className="mt-4 text-sm text-gray-600 text-center">
                      Slots verdes: disponibles. Slots rojos: reservados.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">Establecer mi Disponibilidad (Consultor)</h3>
                    <div className="mb-4">
                      <label htmlFor="start-date" className="block text-gray-700 text-sm font-medium mb-2">Fecha de Inicio:</label>
                      <input type="date" id="start-date" value="2025-08-01" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="end-date" className="block text-gray-700 text-sm font-medium mb-2">Fecha de Fin:</label>
                      <input type="date" id="end-date" value="2025-08-31" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-6">
                      <label htmlFor="available-times" className="block text-gray-700 text-sm font-medium mb-2">Horarios Disponibles (ej. 9:00-13:00, 15:00-18:00):</label>
                      <input type="text" id="available-times" value="09:00-13:00, 15:00-18:00" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button className="w-full bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-all duration-300 shadow-md font-semibold">
                      Actualizar Disponibilidad
                    </button>
                  </div>
                </div>
              </section>

              {/* Sección: Notificaciones para Citas (Hardcoded para diseño) */}
              <section id="notifications" className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                  4. Notificaciones para Citas
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">Notificaciones Recientes</h3>
                    <div className="space-y-3">
                      <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-lg flex justify-between items-center shadow-sm">
                        <span className="text-yellow-800">Recordatorio: Sesión con Dr. Rivera mañana a las 10 AM.</span>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 transition-colors">Ver</button>
                      </div>
                      <div className="bg-blue-100 border border-blue-300 p-3 rounded-lg flex justify-between items-center shadow-sm">
                        <span className="text-blue-800">Nueva solicitud de sesión de Juan Pérez.</span>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 transition-colors">Ver</button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4 text-center">Configura tus preferencias de notificación.</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">Configuración de Notificaciones</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input type="checkbox" id="email-notif" defaultChecked className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                        <label htmlFor="email-notif" className="ml-3 text-gray-700 font-medium">Notificaciones por Email</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="sms-notif" className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                        <label htmlFor="sms-notif" className="ml-3 text-gray-700 font-medium">Notificaciones por SMS</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="inapp-notif" defaultChecked className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                        <label htmlFor="inapp-notif" className="ml-3 text-gray-700 font-medium">Notificaciones en la Aplicación</label>
                      </div>
                    </div>
                    <button className="mt-6 w-full bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-all duration-300 shadow-md font-semibold">
                      Guardar Preferencias
                    </button>
                  </div>
                </div>
              </section>

              {/* Sección: Vista de Historial de Asesorías (Hardcoded para diseño) */}
              <section id="history-view" className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                  5. Vista de Historial de Asesorías
                </h2>
                <div className="grid md:grid-cols-1 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-green-800 mb-4">Mis Asesorías Anteriores</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
                        <p className="text-gray-700"><strong className="text-blue-700">Sesión:</strong> Planificación Estratégica</p>
                        <p className="text-gray-700"><strong className="text-blue-700">Consultor:</strong> Dr. Alex Rivera</p>
                        <p className="text-gray-700"><strong className="text-blue-700">Fecha:</strong> 20 de Julio, 2025</p>
                        <p className="text-gray-700 mb-3"><strong className="text-blue-700">Estado:</strong> <span className="text-green-600 font-semibold">Completada</span></p>
                        <div className="flex space-x-3">
                          <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 transition-colors shadow-md">Ver Detalles</button>
                          <button className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm hover:bg-yellow-600 transition-colors shadow-md">Dejar Reseña</button>
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
                        <p className="text-gray-700"><strong className="text-blue-700">Sesión:</strong> Introducción a AWS Cloud</p>
                        <p className="text-gray-700"><strong className="text-blue-700">Consultor:</strong> Lic. Sofía García</p>
                        <p className="text-gray-700"><strong className="text-blue-700">Fecha:</strong> 10 de Julio, 2025</p>
                        <p className="text-gray-700 mb-3"><strong className="text-blue-700">Estado:</strong> <span className="text-green-600 font-semibold">Completada</span></p>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 transition-colors shadow-md">Ver Detalles</button>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
                        <p className="text-gray-700"><strong className="text-blue-700">Sesión:</strong> Revisión de CV</p>
                        <p className="text-gray-700"><strong className="text-blue-700">Consultor:</strong> Mtro. Carlos López</p>
                        <p className="text-gray-700"><strong className="text-blue-700">Fecha:</strong> 01 de Julio, 2025</p>
                        <p className="text-gray-700 mb-3"><strong className="text-blue-700">Estado:</strong> <span className="text-green-600 font-semibold">Completada</span></p>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 transition-colors shadow-md">Ver Detalles</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        <footer className="text-center py-8 text-gray-600 text-sm border-t border-gray-200 mt-12 bg-white shadow-inner">
          <p>&copy; 2025 Sistema de Booking de Sesiones. Todos los derechos reservados.</p>
        </footer>
      </div>
    </PrivateLayout>
  );
};

export default Asesoria;