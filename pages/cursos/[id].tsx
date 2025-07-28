// pages/cursos/[id].tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image'; // Importa el componente Image
import { Curso, Seccion, Leccion, RecursoDescargable } from '@/types/Curso';
import PrivateLayout from '@/components/layout/PrivateLayout'; // Usamos PrivateLayout para la navegación superior
import { FaPlayCircle, FaFileDownload, FaChevronDown, FaChevronUp, FaStar, FaUserCircle, FaClock, FaLanguage, FaPuzzlePiece, FaCheckCircle, FaInfoCircle, FaSpinner } from 'react-icons/fa'; // Importa FaSpinner

const CourseDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Obtiene el ID del curso de la URL
  const [course, setCourse] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<Leccion | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');

  useEffect(() => {
    if (id) {
      const fetchCourse = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/courses/${id}`);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido.' }));
            throw new Error(errorData.message || `No se pudo cargar el curso con ID: ${id}`);
          }
          const data: Curso = await response.json();
          setCourse(data);
          // Establecer la primera lección del primer curso como activa por defecto
          if (data.secciones && data.secciones.length > 0 && data.secciones[0].lecciones && data.secciones[0].lecciones.length > 0) {
            setActiveLesson(data.secciones[0].lecciones[0]);
            setOpenSections(new Set([data.secciones[0].id])); // Abre la primera sección por defecto
          }
        } catch (err: any) {
          setError(err.message || 'Error al cargar los detalles del curso.');
          console.error("Error fetching course details:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id]); // Se re-ejecuta si el ID del curso cambia

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => {
      const newOpenSections = new Set(prev);
      if (newOpenSections.has(sectionId)) {
        newOpenSections.delete(sectionId);
      } else {
        newOpenSections.add(sectionId);
      }
      return newOpenSections;
    });
  };

  if (loading) {
    return (
      <PrivateLayout>
        <div className="flex justify-center items-center min-h-screen-minus-navbar bg-gray-100">
          <FaSpinner className="animate-spin text-6xl text-blue-500" />
          <p className="ml-4 text-xl text-gray-700">Cargando curso...</p>
        </div>
      </PrivateLayout>
    );
  }

  if (error || !course) {
    return (
      <PrivateLayout>
        <div className="flex flex-col justify-center items-center min-h-screen-minus-navbar bg-gray-100 text-red-600">
          <p className="text-2xl mb-4">Error: {error || "Curso no encontrado."}</p>
          <Link href="/dashboard/cursos" className="text-blue-600 hover:underline">
            Volver a la lista de cursos
          </Link>
        </div>
      </PrivateLayout>
    );
  }

  // Calcular duración total del curso
  const totalDurationMinutes = course.secciones?.reduce((accSec, section) => {
    return accSec + (section.lecciones?.reduce((accLec, lesson) => accLec + (lesson.duracionMinutos || 0), 0) || 0);
  }, 0) || 0;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  return (
    <PrivateLayout>
      <Head>
        <title>{course.titulo} | MentorApp</title>
      </Head>
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Columna Izquierda: Detalles del Curso */}
            <div className="md:w-2/3">
              <h1 className="text-4xl font-bold mb-4">{course.titulo}</h1>
              <p className="text-xl mb-4 opacity-90">{course.descripcionCorta}</p>
              <div className="flex items-center text-sm mb-4">
                <span className="text-yellow-400 flex items-center mr-2">
                  {course.calificacionPromedio?.toFixed(1) || '0.0'} <FaStar className="ml-1" />
                </span>
                <span className="opacity-80">({course.numeroCalificaciones || 0} calificaciones)</span>
                <span className="mx-3">•</span>
                <span className="opacity-80">Creado por <Link href={`/instructor/${course.instructorId}`} className="text-blue-300 hover:underline">{course.instructorNombre}</Link></span>
              </div>
              <div className="flex items-center text-sm opacity-80 mb-4">
                <FaClock className="mr-2" /> Última actualización: {new Date(course.fechaActualizacion!).toLocaleDateString()}
                <span className="mx-3">•</span>
                <FaLanguage className="mr-2" /> {course.idioma}
              </div>
              <div className="mt-6 flex items-center space-x-4">
                <button className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg">
                  Inscribirse ahora - {course.moneda} {course.precio?.toFixed(2)}
                </button>
                <button className="bg-gray-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-600 transition-colors">
                  Añadir al carrito
                </button>
              </div>
            </div>

            {/* Columna Derecha: Video de Introducción (o imagen) */}
            <div className="md:w-1/3 flex justify-center items-center relative rounded-lg overflow-hidden shadow-xl">
              {course.videoIntroduccionUrl ? (
                <video
                  src={course.videoIntroduccionUrl}
                  controls
                  className="w-full h-auto max-h-64 object-cover"
                  poster={course.imagenUrl} // Usa la imagen como poster
                >
                  Tu navegador no soporta la etiqueta de video.
                </video>
              ) : course.imagenUrl ? (
                <div className="relative w-full h-64"> {/* Contenedor para Image con fill */}
                  <Image
                    src={course.imagenUrl}
                    alt={course.titulo || 'Imagen del curso'}
                    fill // Usa fill para que la imagen ocupe el espacio del padre
                    style={{ objectFit: 'cover' }} // Controla cómo la imagen se ajusta
                    className="rounded-lg" // Clases de Tailwind para redondeo
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-700 flex items-center justify-center text-gray-400 text-xl">
                  
                </div>
              )}
              {/* Contenido flotante sobre el video/imagen */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="text-white text-sm">
                  <p className="font-bold text-xl mb-2">Este curso incluye:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{formatDuration(totalDurationMinutes)} de video bajo demanda</li>
                    <li>{course.secciones?.reduce((acc, sec) => acc + (sec.lecciones?.length || 0), 0)} lecciones</li>
                    <li>{course.secciones?.reduce((acc, sec) => acc + (sec.lecciones?.reduce((accRes, lec) => accRes + (lec.recursosDescargables?.length || 0), 0) || 0), 0)} recursos descargables</li>
                    <li>Acceso de por vida</li>
                    <li>Acceso en dispositivos móviles y TV</li>
                    <li>Certificado de finalización</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal del Curso */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white shadow-lg rounded-b-lg">
        {/* Tabs de Navegación */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Descripción general
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg ${
                activeTab === 'curriculum'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contenido del curso
            </button>
            <button
              onClick={() => setActiveTab('instructor')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg ${
                activeTab === 'instructor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Instructor
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reseñas
            </button>
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Lo que aprenderás */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Lo que aprenderás</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                {course.loQueAprenderas?.map((item, index) => (
                  item.trim() && (
                    <li key={index} className="flex items-start text-gray-700">
                      <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>

            {/* Descripción */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Descripción</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {course.descripcionLarga}
              </p>
            </div>

            {/* Requisitos */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Requisitos</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {course.requisitos?.map((req, index) => (
                  req.trim() && <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contenido del Curso</h2>
            <div className="text-gray-600 text-sm mb-4">
              {course.secciones?.length} secciones • {course.secciones?.reduce((acc, sec) => acc + (sec.lecciones?.length || 0), 0)} lecciones • {formatDuration(totalDurationMinutes)} de duración total
            </div>

            {course.secciones?.map(section => (
              <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center">
                    {openSections.has(section.id) ? (
                      <FaChevronUp className="text-blue-600 mr-3" />
                    ) : (
                      <FaChevronDown className="text-gray-500 mr-3" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-800">{section.titulo}</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {section.lecciones?.length || 0} lecciones • {formatDuration(section.lecciones?.reduce((acc, lec) => acc + (lec.duracionMinutos || 0), 0) || 0)}
                  </span>
                </div>
                {openSections.has(section.id) && (
                  <div className="border-t border-gray-200 bg-white">
                    {section.lecciones?.map(lesson => (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 cursor-pointer ${
                          activeLesson?.id === lesson.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-800'
                        }`}
                        onClick={() => setActiveLesson(lesson)}
                      >
                        <div className="flex items-center">
                          <FaPlayCircle className="mr-3 text-blue-500" />
                          <span className="font-medium">{lesson.titulo}</span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDuration(lesson.duracionMinutos || 0)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'instructor' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sobre el Instructor</h2>
            <div className="flex items-center space-x-4">
              <FaUserCircle className="text-6xl text-gray-500" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{course.instructorNombre}</h3>
                <p className="text-gray-600 text-sm">Instructor en MentorApp</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {/* Aquí podrías cargar una descripción más detallada del instructor desde otra API si la tuvieras */}
              El instructor {course.instructorNombre} es un experto en su campo con años de experiencia, dedicado a compartir sus conocimientos para impulsar el éxito de sus estudiantes.
            </p>
            {/* Si tuvieras un perfil de instructor más detallado, podrías enlazarlo aquí */}
            <Link href={`/instructor/${course.instructorId}`} className="text-blue-600 hover:underline font-semibold">
              Ver perfil del instructor
            </Link>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Reseñas de Estudiantes</h2>
            {course.numeroCalificaciones === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-lg">Aún no hay reseñas para este curso.</p>
              </div>
            ) : (
              // Aquí iría la lógica para mapear y mostrar reseñas reales
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-gray-700">Calificación promedio: <span className="font-bold text-yellow-500">{course.calificacionPromedio?.toFixed(1)} <FaStar /></span> ({course.numeroCalificaciones} reseñas)</p>
                {/* Ejemplo de reseña (simulada) */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center mb-2">
                    <FaUserCircle className="text-3xl text-gray-400 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-800">Estudiante Anónimo</p>
                      <span className="text-yellow-500 text-sm">★★★★★</span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">"¡Excelente curso! Aprendí muchísimo y el instructor es muy claro."</p>
                  <p className="text-xs text-gray-500 mt-1">Hace 2 días</p>
                </div>
                {/* Más reseñas aquí */}
              </div>
            )}
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};

export default CourseDetailPage;
