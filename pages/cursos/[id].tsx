// pages/cursos/[id].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PublicLayout from '../../components/layout/PublicLayout'; // Asegúrate de la ruta correcta para tu layout público
import { Curso } from '../../types/Curso'; // Tu interfaz de Curso
import { toast } from 'react-toastify';
import { FaSpinner, FaChalkboardTeacher, FaClipboardList, FaCheckCircle, FaVideo, FaMoneyBillWave } from 'react-icons/fa'; // Iconos
import Image from 'next/image';

// Importa el componente CourseCurriculum, que crearemos a continuación
import CourseCurriculum from '../../components/courses/CourseCurriculum';

const CursoDetallePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Captura el ID o slug del curso de la URL
  const [course, setCourse] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return; // Espera a que el ID esté disponible en la URL

      setLoading(true);
      try {
        const response = await fetch(`/api/courses/${id}`); // Llama a tu API para obtener un curso específico
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('El curso no fue encontrado. Verifica el ID en la URL.'); // Mensaje más específico
          }
          throw new Error('Error al cargar los detalles del curso. Inténtalo de nuevo más tarde.'); // Mensaje más amigable
        }
        const data: Curso = await response.json();
        setCourse(data);
      } catch (err: any) {
        console.error('Error fetching course details:', err);
        setError(err.message || 'Hubo un problema al cargar los detalles del curso.');
        toast.error('No se pudieron cargar los detalles del curso.');
        // Opcional: Redirigir a una página 404 o a la lista de cursos si hay un error
        // router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, router]); // Se ejecuta cada vez que el ID de la URL cambia

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex justify-center items-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600" />
          <p className="ml-4 text-xl text-gray-700">Cargando detalles del curso...</p>
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col justify-center items-center text-red-600 p-4 text-center">
          <p className="text-3xl font-semibold mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/cursos')} // Sugerencia: Volver a la lista de cursos
            className="mt-6 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Explorar otros cursos
          </button>
        </div>
      </PublicLayout>
    );
  }

  if (!course) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex justify-center items-center text-gray-500">
          <p className="text-xl">El curso solicitado no está disponible.</p> {/* Mensaje más claro */}
        </div>
      </PublicLayout>
    );
  }

  // Si el curso no está publicado y no eres el instructor (o admin), podrías redirigir o mostrar un mensaje
  // if (!course.publicado /* && !currentUserIsInstructor */) {
  //   return (
  //     <PublicLayout>
  //       <div className="text-center py-20">
  //         <h2 className="text-2xl font-bold">Curso no disponible públicamente.</h2>
  //         <p className="text-gray-600 mt-2">Este curso aún no ha sido publicado o no tienes acceso.</p>
  //       </div>
  //     </PublicLayout>
  //   );
  // }

  return (
    <PublicLayout>
      <div className="bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Encabezado del Curso */}
          <div className="relative h-64 sm:h-80 lg:h-96 w-full">
            <Image
              src={course.imagenUrl || '/images/course-placeholder.jpg'}
              alt={course.titulo}
              layout="fill"
              objectFit="cover"
              className="object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight drop-shadow-lg">{course.titulo}</h1>
              <p className="mt-2 text-xl sm:text-2xl font-light drop-shadow-md">{course.descripcionCorta}</p>
            </div>
          </div>

          <div className="p-8 lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Columna Principal - Descripción y Curriculum */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Descripción General</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {course.descripcionLarga}
                </p>
              </div>

              {course.requisitos && course.requisitos.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaClipboardList className="mr-2 text-blue-500" />
                    Requisitos
                  </h2>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    {course.requisitos.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {course.loQueAprenderas && course.loQueAprenderas.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaCheckCircle className="mr-2 text-green-500" />
                    Lo que aprenderás
                  </h2>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    {course.loQueAprenderas.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sección del Currículum (Temario) */}
              <div className="mt-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaVideo className="mr-2 text-purple-500" />
                  Contenido del Curso
                </h2>
                {/* Aquí renderizamos el CourseCurriculum */}
                {/* Asumimos que CourseCurriculum recibe el array de secciones */}
                <CourseCurriculum sections={course.secciones} courseId={course.id as string} />
                {course.secciones.length === 0 && (
                  <p className="text-gray-500 italic">Este curso aún no tiene secciones ni lecciones añadidas.</p>
                )}
              </div>
            </div>

            {/* Columna Lateral - Instructor, Detalles y Acción */}
            <div className="lg:col-span-1 mt-8 lg:mt-0">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  <FaChalkboardTeacher className="mr-2" />
                  Instructor
                </h3>
                <p className="text-gray-700 text-lg font-semibold">{course.instructorNombre}</p>
                {/* Puedes añadir más detalles del instructor aquí, como biografía, otros cursos */}
              </div>

              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-green-800 mb-4">Detalles Rápidos</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><span className="font-semibold">Categoría:</span> {course.categoria}</li>
                  <li><span className="font-semibold">Nivel:</span> {course.nivel}</li>
                  <li><span className="font-semibold">Idioma:</span> {course.idioma}</li>
                  <li><span className="font-semibold">Duración:</span> {course.duracionEstimada} horas</li>
                </ul>
              </div>

              <div className="mt-6 text-center">
                <p className="text-4xl font-extrabold text-blue-700 mb-4 flex items-center justify-center">
                  <FaMoneyBillWave className="mr-3 text-blue-600" />
                  {course.precio.toLocaleString('es-MX', { style: 'currency', currency: course.moneda || 'MXN' })}
                </p>
                {/* Botón de Compra/Inscripción */}
                {/* TODO: Lógica para manejar la inscripción/compra (integración con Stripe) */}
                <button className="w-full py-4 bg-purple-600 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-purple-700 transition duration-300 transform hover:scale-105">
                  Inscribirme Ahora
                </button>
                <p className="text-sm text-gray-500 mt-3">Acceso de por vida.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CursoDetallePage;