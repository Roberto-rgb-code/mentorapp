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

// Interfaz para los datos del curso
interface CursoData {
  userId: string;
  titulo: string;
  descripcion: string;
  videoUrl?: string;
  createdAt: string;
}

const Cursos = () => {
  const { user } = useAuth();
  const [cursos, setCursos] = useState<(CursoData & { _key: string })[]>([]);
  const [filteredCursos, setFilteredCursos] = useState<(CursoData & { _key: string })[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCurso, setSelectedCurso] = useState<(CursoData & { _key: string }) | null>(null);
  const [mensaje, setMensaje] = useState<{ error?: string; success?: string }>({});
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Estado inicial del curso
  const initialCurso: CursoData = {
    userId: user?.uid || "",
    titulo: "",
    descripcion: "",
    videoUrl: "",
    createdAt: new Date().toISOString(),
  };
  const [curso, setCurso] = useState<CursoData>(initialCurso);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Cargar cursos desde S3
  useEffect(() => {
    if (!user) {
      setMensaje({ error: "Inicia sesión primero." });
      return;
    }
    const fetchCursos = async () => {
      try {
        const list = await s3.send(
          new ListObjectsV2Command({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!, Prefix: "cursos/" })
        );
        const items = list.Contents?.map((i) => i.Key!).filter(Boolean) || [];
        const datos = await Promise.all(
          items.map(async (Key) => {
            if (!Key.endsWith('.json')) return null;
            try {
              const res = await s3.send(new GetObjectCommand({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!, Key }));
              const body = await res.Body?.transformToString('utf-8');
              if (body) {
                const data = JSON.parse(body) as CursoData;
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
          .filter((d): d is CursoData & { _key: string } => d !== null)
          .filter((d, index, self) => index === self.findIndex((t) => t._key === d._key));
        setCursos(uniqueDatos);
        setFilteredCursos(uniqueDatos);
        // Seleccionar el primer curso por defecto si existe
        if (uniqueDatos.length > 0) {
          setSelectedCurso(uniqueDatos[0]);
        }
      } catch (e) {
        console.error("Error al cargar cursos:", e);
        setMensaje({ error: "Error al cargar cursos." });
      }
    };
    fetchCursos();
  }, [user]);

  // Filtrar cursos según el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCursos(cursos);
      if (cursos.length > 0 && !selectedCurso) {
        setSelectedCurso(cursos[0]);
      }
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = cursos.filter(
      (c) =>
        c.titulo.toLowerCase().includes(lowerSearchTerm) ||
        c.descripcion.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredCursos(filtered);
    if (filtered.length > 0) {
      setSelectedCurso(filtered[0]);
    } else {
      setSelectedCurso(null);
    }
  }, [searchTerm, cursos]);

  // Manejar cambios en el formulario
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurso((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  // Manejar cambios en el término de búsqueda
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Subir video a S3
  const uploadVideo = async (file: File) => {
    try {
      const Key = `cursos/videos/${user!.uid}-${Date.now()}-${file.name}`;
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
      console.error("Error al subir video:", e);
      throw e;
    }
  };

  // Validar campos requeridos
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!curso.titulo) errors.titulo = "El título es obligatorio";
    if (!curso.descripcion) errors.descripcion = "La descripción es obligatoria";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Crear o actualizar curso
  const submitCurso = async () => {
    if (!user) {
      setMensaje({ error: "Inicia sesión primero." });
      return;
    }
    if (!validateForm()) {
      setMensaje({ error: "Por favor, completa todos los campos obligatorios." });
      return;
    }
    try {
      if (videoFile) {
        curso.videoUrl = await uploadVideo(videoFile);
      }
      const Key = editingKey || `cursos/${user.uid}-${Date.now()}.json`;
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
          Key,
          Body: JSON.stringify({ ...curso, userId: user.uid, createdAt: new Date().toISOString() }),
          ContentType: "application/json",
          ContentEncoding: "utf-8",
        })
      );
      setCursos((prev) =>
        editingKey
          ? prev.map((c) => (c._key === Key ? { ...curso, _key: Key } : c))
          : [...prev, { ...curso, _key: Key }]
      );
      setMensaje({ success: editingKey ? "Curso actualizado." : "Curso guardado." });
      setShowForm(false);
      setEditingKey(null);
      setCurso(initialCurso);
      setVideoFile(null);
      setFormErrors({});
      // Seleccionar el curso recién creado/actualizado
      setSelectedCurso({ ...curso, _key: Key });
    } catch (e) {
      console.error("Error al guardar curso:", e);
      setMensaje({ error: "Error al guardar curso." });
    }
  };

  // Editar curso
  const editCurso = (c: CursoData & { _key: string }) => {
    setCurso(c);
    setEditingKey(c._key);
    setShowForm(true);
    setVideoFile(null);
  };

  // Eliminar curso
  const deleteCurso = async (Key: string) => {
    if (!confirm("¿Estás seguro de eliminar este curso?")) return;
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!, Key }));
      setCursos((prev) => {
        const updatedCursos = prev.filter((c) => c._key !== Key);
        if (selectedCurso?._key === Key) {
          setSelectedCurso(updatedCursos.length > 0 ? updatedCursos[0] : null);
        }
        return updatedCursos;
      });
      setFilteredCursos((prev) => {
        const updatedFiltered = prev.filter((c) => c._key !== Key);
        if (selectedCurso?._key === Key) {
          setSelectedCurso(updatedFiltered.length > 0 ? updatedFiltered[0] : null);
        }
        return updatedFiltered;
      });
      setMensaje({ success: "Curso eliminado." });
    } catch (e) {
      console.error("Error al eliminar curso:", e);
      setMensaje({ error: "No se pudo eliminar el curso." });
    }
  };

  return (
    <PrivateLayout>
      <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen flex flex-col md:flex-row">
        {/* Sidebar con el catálogo de cursos */}
        <div className="md:w-1/3 lg:w-1/4 bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-6 md:mb-0 md:mr-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Catálogo de Cursos</h2>
          {/* Barra de búsqueda */}
          <div className="relative mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar cursos..."
              className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          {/* Lista de cursos en el catálogo */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {filteredCursos.length > 0 ? (
              filteredCursos.map((c) => (
                <div
                  key={c._key}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition duration-200 ${
                    selectedCurso?._key === c._key
                      ? "bg-blue-100 border-l-4 border-blue-500"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCurso(c)}
                >
                  <h3 className="text-lg font-medium text-gray-800">{c.titulo}</h3>
                  <p className="text-sm text-gray-600 truncate">{c.descripcion}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center">No se encontraron cursos.</p>
            )}
          </div>
        </div>

        {/* Área principal para detalles del curso y formulario */}
        <div className="md:w-2/3 lg:w-3/4 flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-blue-900">Cursos</h1>
            <button
              onClick={() => {
                setShowForm((v) => !v);
                if (showForm) {
                  setEditingKey(null);
                  setCurso(initialCurso);
                  setVideoFile(null);
                  setFormErrors({});
                }
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              {showForm ? "Cancelar" : "Agregar Curso"}
            </button>
          </div>

          {mensaje.error && <p className="text-red-500 text-center mt-4">{mensaje.error}</p>}
          {mensaje.success && <p className="text-green-500 text-center mt-4">{mensaje.success}</p>}

          {showForm && (
            <div className="bg-white p-8 rounded-xl shadow-lg mb-12 border border-gray-200">
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                {editingKey ? "Editar Curso" : "Agregar Nuevo Curso"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-600 font-medium">Título del Curso *</label>
                  <input
                    name="titulo"
                    value={curso.titulo}
                    onChange={handleChange}
                    className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.titulo ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.titulo && <p className="text-red-500 text-sm mt-1">{formErrors.titulo}</p>}
                </div>
                <div>
                  <label className="block mb-2 text-gray-600 font-medium">Descripción del Curso *</label>
                  <textarea
                    name="descripcion"
                    value={curso.descripcion}
                    onChange={handleChange}
                    className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.descripcion ? "border-red-500" : "border-gray-300"
                    }`}
                    rows={4}
                  />
                  {formErrors.descripcion && <p className="text-red-500 text-sm mt-1">{formErrors.descripcion}</p>}
                </div>
                <div>
                  <label className="block mb-2 text-gray-600 font-medium">Video del Curso (opcional)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {curso.videoUrl && !videoFile && (
                    <video
                      src={curso.videoUrl}
                      controls
                      className="mt-4 w-full max-w-md mx-auto rounded-lg shadow-md"
                    />
                  )}
                </div>
                <button
                  onClick={submitCurso}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300 w-full mt-4 flex items-center justify-center"
                >
                  {editingKey ? "Actualizar Curso" : "Crear Curso"}
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Detalles del curso seleccionado */}
          {!showForm && selectedCurso && (
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{selectedCurso.titulo}</h2>
              {selectedCurso.videoUrl && (
                <video
                  src={selectedCurso.videoUrl}
                  controls
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              <p className="text-gray-600 mb-4">{selectedCurso.descripcion}</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => editCurso(selectedCurso)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteCurso(selectedCurso._key)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                >
                  Eliminar
                </button>
              </div>
            </div>
          )}

          {!showForm && !selectedCurso && (
            <p className="text-gray-600 text-center">Selecciona un curso del catálogo para ver sus detalles.</p>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Cursos;