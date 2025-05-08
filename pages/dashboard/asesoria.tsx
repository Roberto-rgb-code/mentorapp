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

const Asesoria = () => {
  const { user } = useAuth();
  const [perfiles, setPerfiles] = useState<(PerfilData & { _key: string })[]>([]);
  const [mensaje, setMensaje] = useState<{ error?: string; success?: string }>({});
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<PerfilData | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [formErrors, setFormErrors] = useState<{ [key: number]: string[] }>({});

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
          .filter((d): d is PerfilData & { _key: string } => d !== null)
          .filter((d, index, self) => 
            index === self.findIndex((t) => t._key === d._key)
          );
        setPerfiles(filteredDatos);
      } catch (e) {
        console.error("Error al cargar perfiles:", e);
        setMensaje({ error: "Error al cargar perfiles." });
      }
    };
    fetchPerfiles();
  }, [user]);

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
        newPerfil[name] = value;
      } else {
        newPerfil[name] = value;
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
        // Foto de perfil es opcional
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

  // Validar todos los pasos y encontrar el primero con error
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
      setMensaje({ success: editingKey ? "Perfil actualizado." : "Perfil guardado." });
      setShowForm(false);
      setEditingKey(null);
      setPerfil(initialPerfil);
      setFile(null);
      setCurrentCardIndex(0);
    } catch (e) {
      console.error("Error al guardar perfil:", e);
      setMensaje({ error: "Error al guardar perfil." });
    }
  };

  // **Update**: Cargar datos para edición
  const editPerfil = (p: PerfilData & { _key: string }) => {
    setPerfil(p);
    setEditingKey(p._key);
    setShowForm(true);
    setCurrentCardIndex(0);
  };

  // **Delete**: Eliminar perfil
  const deletePerfil = async (Key: string) => {
    if (!confirm("¿Estás seguro de eliminar este perfil?")) return;
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!, Key }));
      setPerfiles((prev) => prev.filter((p) => p._key !== Key));
      setMensaje({ success: "Perfil eliminado." });
    } catch (e) {
      console.error("Error al eliminar perfil:", e);
      setMensaje({ error: "No se pudo eliminar el perfil." });
    }
  };

  // Seleccionar consultor para ver detalles
  const handleSelectConsultant = (consultant: PerfilData) => {
    setSelectedConsultant(consultant);
  };

  // Configuración del carrusel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const visiblePerfiles = perfiles.filter((p) => p.isVisibleInAsesoria);
  const totalCards = 8;

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
    if (currentCardIndex < totalCards - 1) setCurrentCardIndex(currentCardIndex + 1);
  };

  const prevCard = () => {
    if (currentCardIndex > 0) setCurrentCardIndex(currentCardIndex - 1);
  };

  return (
    <PrivateLayout>
      <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">Mentores para ti</h1>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Mentores para ti</h2>
          <button
            onClick={() => {
              setShowForm((v) => !v);
              if (showForm) {
                setEditingKey(null);
                setPerfil(initialPerfil);
                setFile(null);
                setCurrentCardIndex(0);
                setFormErrors({});
              }
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            {showForm ? "Cancelar" : "Subir mi perfil"}
          </button>
        </div>
        <p className="text-gray-600 mb-8">Las recomendaciones se basan en el perfil</p>

        {mensaje.error && <p className="text-red-500 text-center mt-4">{mensaje.error}</p>}
        {mensaje.success && <p className="text-green-500 text-center mt-4">{mensaje.success}</p>}

        {showForm && (
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto mb-12 border border-gray-200">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Registro de Consultores</h2>
            <div className="flex justify-center mb-6">
              {Array.from({ length: totalCards }, (_, i) => (
                <div
                  key={i}
                  className={`w-8 h-2 rounded-full mx-1 transition-all duration-300 ${
                    i === currentCardIndex ? "bg-blue-600" : "bg-gray-300"
                  } ${formErrors[i]?.length > 0 ? "bg-red-500" : ""}`}
                />
              ))}
            </div>
            <p className="text-center text-gray-600 mb-6">Paso {currentCardIndex + 1} de {totalCards}</p>
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
              >
                {/* Paso 1: Foto de perfil */}
                <div className="min-w-full px-4">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">1. Foto de Perfil</h3>
                    <div className="mb-4">
                      <label className="block mb-2 text-gray-600 font-medium">Sube tu foto de perfil (opcional):</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {perfil.profileImageUrl && (
                        <img
                          src={perfil.profileImageUrl}
                          alt="Foto de perfil"
                          className="w-32 h-32 rounded-full mx-auto mt-4 shadow-md"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Paso 2: Datos personales */}
                <div className="min-w-full px-4">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">2. Datos personales</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">Nombre completo *</label>
                        <input
                          name="nombreCompleto"
                          value={perfil.nombreCompleto}
                          onChange={handleChange}
                          className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors[1]?.includes("nombreCompleto") ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {formErrors[1]?.includes("nombreCompleto") && (
                          <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">Correo electrónico *</label>
                        <input
                          name="correo"
                          type="email"
                          value={perfil.correo}
                          onChange={handleChange}
                          className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors[1]?.includes("correo") ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {formErrors[1]?.includes("correo") && (
                          <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">Teléfono (con LADA) *</label>
                        <input
                          name="telefono"
                          type="tel"
                          value={perfil.telefono}
                          onChange={handleChange}
                          className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors[1]?.includes("telefono") ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {formErrors[1]?.includes("telefono") && (
                          <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">Ciudad y país de residencia *</label>
                        <input
                          name="ciudadPais"
                          value={perfil.ciudadPais}
                          onChange={handleChange}
                          className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors[1]?.includes("ciudadPais") ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {formErrors[1]?.includes("ciudadPais") && (
                          <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paso 3: Formación académica */}
                <div className="min-w-full px-4">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">3. Formación académica</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">Último grado académico obtenido *</label>
                        <div className="space-y-2">
                          {["Técnico", "Licenciatura", "Maestría", "Doctorado", "Otro"].map((grado) => (
                            <label key={grado} className="flex items-center">
                              <input
                                type="radio"
                                name="ultimoGrado"
                                value={grado}
                                checked={perfil.ultimoGrado === grado}
                                onChange={handleChange}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-gray-600">{grado}</span>
                            </label>
                          ))}
                        </div>
                        {formErrors[2]?.includes("ultimoGrado") && (
                          <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">Área de estudios *</label>
                        <input
                          name="areaEstudios"
                          value={perfil.areaEstudios}
                          onChange={handleChange}
                          className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors[2]?.includes("areaEstudios") ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {formErrors[2]?.includes("areaEstudios") && (
                          <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paso 4: Experiencia */}
                <div className="min-w-full px-4">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">4. Experiencia</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">Años de experiencia *</label>
                        <div className="space-y-2">
                          {["Menos de 1 año", "1-3 años", "4-7 años", "Más de 8 años"].map((exp) => (
                            <label key={exp} className="flex items-center">
                              <input
                                type="radio"
                                name="anosExperiencia"
                                value={exp}
                                checked={perfil.anosExperiencia === exp}
                                onChange={handleChange}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-gray-600">{exp}</span>
                            </label>
                          ))}
                        </div>
                        {formErrors[3]?.includes("anosExperiencia") && (
                          <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">Experiencia con MIPYMES *</label>
                        <div className="space-y-2">
                          {["Sí, de forma recurrente", "Sí, pero no es mi enfoque principal", "No, mi experiencia es con grandes empresas", "Estoy comenzando en este mercado"].map((exp) => (
                            <label key={exp} className="flex items-center">
                              <input
                                type="radio"
                                name="experienciaMipymes"
                                value={exp}
                                checked={perfil.experienciaMipymes === exp}
                                onChange={handleChange}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-gray-600">{exp}</span>
                            </label>
                          ))}
                        </div>
                        {formErrors[3]?.includes("experienciaMipymes") && (
                          <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paso 5: Especialidad profesional */}
                <div className="min-w-full px-4">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">5. Especialidad profesional</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">Selecciona hasta 3 áreas en las que tienes mayor experiencia *</label>
                        <div className="space-y-2">
                          {["Estrategia y Planeación", "Finanzas", "Recursos Humanos", "Marketing y Ventas", "Operaciones y Procesos", "Innovación y Tecnología", "Legal y Fiscal", "Sustentabilidad y Responsabilidad Social", "Consultoría Sectorial Especializada", "Desarrollo Personal y Organizacional"].map((area) => (
                            <label key={area} className="flex items-center">
                              <input
                                type="checkbox"
                                name="areasExperiencia"
                                value={area}
                                checked={perfil.areasExperiencia.includes(area)}
                                onChange={handleChange}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-gray-600">{area}</span>
                            </label>
                          ))}
                        </div>
                        {formErrors[4]?.includes("areasExperiencia") && (
                          <p className="text-red-500 text-sm mt-1">Debes seleccionar al menos una área</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">¿Cuál ha sido uno de tus casos de éxito más representativos? *</label>
                        <textarea
                          name="casoExito"
                          value={perfil.casoExito}
                          onChange={handleChange}
                          className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors[4]?.includes("casoExito") ? "border-red-500" : "border-gray-300"
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

                {/* Paso 6: Estilo y metodología de trabajo */}
                <div className="min-w-full px-4">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">6. Estilo y metodología de trabajo</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">¿Qué tipo de acompañamiento ofreces actualmente? *</label>
                        <div className="space-y-2">
                          {["Asesoría puntual (1-2 sesiones)", "Proyectos de mediano plazo", "Acompañamiento continuo (programas)", "Talleres / formación grupal"].map((tipo) => (
                            <label key={tipo} className="flex items-center">
                              <input
                                type="radio"
                                name="tipoAcompanamiento"
                                value={tipo}
                                checked={perfil.tipoAcompanamiento === tipo}
                                onChange={handleChange}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-gray-600">{tipo}</span>
                            </label>
                          ))}
                        </div>
                        {formErrors[5]?.includes("tipoAcompanamiento") && (
                          <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">¿Cómo prefieres trabajar? *</label>
                        <div className="space-y-2">
                          {["100% virtual", "Mixto"].map((mod) => (
                            <label key={mod} className="flex items-center">
                              <input
                                type="radio"
                                name="modalidadTrabajo"
                                value={mod}
                                checked={perfil.modalidadTrabajo === mod}
                                onChange={handleChange}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-gray-600">{mod}</span>
                            </label>
                          ))}
                        </div>
                        {formErrors[5]?.includes("modalidadTrabajo") && (
                          <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paso 7: Disponibilidad y condiciones */}
                <div className="min-w-full px-4">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">7. Disponibilidad y condiciones</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">¿Cuál es tu disponibilidad semanal para atender empresarios? *</label>
                        <div className="space-y-2">
                          {["1-3 hrs por semana", "4-8 hrs", "9-15 hrs", "Tiempo completo"].map((disp) => (
                            <label key={disp} className="flex items-center">
                              <input
                                type="radio"
                                name="disponibilidadSemanal"
                                value={disp}
                                checked={perfil.disponibilidadSemanal === disp}
                                onChange={handleChange}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-gray-600">{disp}</span>
                            </label>
                          ))}
                        </div>
                        {formErrors[6]?.includes("disponibilidadSemanal") && (
                          <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-gray-600 font-medium">¿Tienes una tarifa estándar? *</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="tarifa"
                              value="Por hora"
                              checked={perfil.tarifa === "Por hora"}
                              onChange={handleChange}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-600">Por hora</span>
                          </label>
                          {perfil.tarifa === "Por hora" && (
                            <input
                              name="tarifa"
                              value={perfil.tarifa}
                              onChange={handleChange}
                              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                formErrors[6]?.includes("tarifa") ? "border-red-500" : "border-gray-300"
                              }`}
                              placeholder="$ MXN"
                            />
                          )}
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="tarifa"
                              value="Por paquete"
                              checked={perfil.tarifa === "Por paquete"}
                              onChange={handleChange}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-600">Por paquete</span>
                          </label>
                          {perfil.tarifa === "Por paquete" && (
                            <textarea
                              name="tarifa"
                              value={perfil.tarifa}
                              onChange={handleChange}
                              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                formErrors[6]?.includes("tarifa") ? "border-red-500" : "border-gray-300"
                              }`}
                              rows={2}
                              placeholder="Describe brevemente..."
                            />
                          )}
                        </div>
                        {formErrors[6]?.includes("tarifa") && (
                          <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paso 8: Configuración y confirmación */}
                <div className="min-w-full px-4">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">8. Configuración y confirmación</h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isVisibleInAsesoria"
                          checked={perfil.isVisibleInAsesoria}
                          onChange={handleChange}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-gray-600">Quiero que mi perfil sea visible en la vista de Asesorías</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="confirmacionEntrevista"
                          checked={perfil.confirmacionEntrevista}
                          onChange={handleChange}
                          className={`mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            formErrors[7]?.includes("confirmacionEntrevista") ? "border-red-500" : ""
                          }`}
                        />
                        <span className="text-gray-600">Confirmo que la información proporcionada es verídica y acepto ser contactado para entrevista. *</span>
                      </label>
                      {formErrors[7]?.includes("confirmacionEntrevista") && (
                        <p className="text-red-500 text-sm mt-1">Debes aceptar esta confirmación para continuar</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de navegación */}
            <div className="flex justify-between mt-6">
              <button
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  currentCardIndex === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                } transition duration-300`}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Anterior
              </button>
              {currentCardIndex < totalCards - 1 ? (
                <button
                  onClick={nextCard}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
                >
                  Siguiente
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={submitPerfil}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300 flex items-center"
                >
                  {editingKey ? "Actualizar" : "Crear perfil"}
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Carrusel de perfiles */}
        {visiblePerfiles.length > 0 && (
          <Slider {...settings} className="mt-12">
            {visiblePerfiles.map((p) => (
              <div key={p._key} className="px-4">
                <div
                  className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition duration-300"
                  onClick={() => handleSelectConsultant(p)}
                >
                  <img
                    src={p.profileImageUrl}
                    alt={p.nombreCompleto}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                  <div className="flex justify-center items-center mb-2">
                    <svg className="w-4 h-4 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z"/>
                    </svg>
                    <p className="text-blue-600 text-center">{p.ciudadPais}</p>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 text-center mb-2">{p.nombreCompleto}</h2>
                  <p
                    className={`text-white px-2 py-1 rounded-full text-sm mx-auto block text-center mb-4 ${
                      p.role === "MENTOR" ? "bg-purple-500" : "bg-blue-500"
                    }`}
                  >
                    {p.role}
                  </p>
                  <div className="text-center mb-4">
                    <strong className="text-gray-700">Mis áreas de experiencia:</strong>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      {p.areasExperiencia.slice(0, 3).map((area, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm text-center"><strong>Por qué soy {p.role.toLowerCase()}:</strong> {p.motivacion}</p>
                </div>
              </div>
            ))}
          </Slider>
        )}

        {/* Modal de detalles del consultor */}
        {selectedConsultant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
              <div className="flex items-center mb-4">
                <img
                  src={selectedConsultant.profileImageUrl}
                  alt={selectedConsultant.nombreCompleto}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedConsultant.nombreCompleto}</h2>
                  <p className="text-gray-600 text-sm">{selectedConsultant.areaEstudios}</p>
                </div>
              </div>
              <p className="text-blue-600 text-sm mb-2">{selectedConsultant.ciudadPais}</p>
              <p
                className={`mb-2 text-white px-2 py-1 rounded-full text-sm ${
                  selectedConsultant.role === "MENTOR" ? "bg-purple-500" : "bg-blue-500"
                }`}
              >
                {selectedConsultant.role}
              </p>
              <div className="mb-4">
                <strong className="text-gray-700">Mis áreas de experiencia:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedConsultant.areasExperiencia.slice(0, 3).map((area, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4"><strong>Por qué soy {selectedConsultant.role.toLowerCase()}:</strong> {selectedConsultant.motivacion}</p>
              {selectedConsultant.userId === user?.uid ? (
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => {
                      editPerfil(selectedConsultant);
                      setSelectedConsultant(null);
                    }}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      deletePerfil(selectedConsultant._key);
                      setSelectedConsultant(null);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300 w-full mb-4"
                  onClick={() => alert(`Invitando a conectar con ${selectedConsultant.nombreCompleto}`)}
                >
                  Invitar a conectar
                </button>
              )}
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition duration-300 w-full"
                onClick={() => setSelectedConsultant(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};

export default Asesoria;