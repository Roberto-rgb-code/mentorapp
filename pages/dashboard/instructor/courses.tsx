// pages/dashboard/instructor/courses.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaPlusCircle } from 'react-icons/fa'; // Para el icono de "Crear"

// Asume la misma interfaz Curso que en CursosPage.tsx
interface Curso {
  id: string;
  titulo: string;
  descripcionCorta: string;
  imagenUrl: string;
  instructorNombre: string;
  precio: number;
  moneda: string;
  publicado: boolean; // Para saber si el curso está publicado
  // Añade aquí cualquier otro campo que el instructor necesite ver
}

const InstructorCoursesPage: React.FC = () => {
  const [myCourses, setMyCourses] = useState<Curso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // **IMPORTANTE:** En una aplicación real, instructorId debe venir del contexto de autenticación del usuario.
  // Por ahora, usaremos el mismo ID hardcodeado que en CourseForm para que puedas ver los cursos que crees.
  const instructorId = 'some-instructor-id'; // ¡REEMPLAZAR CON ID REAL DEL USUARIO AUTENTICADO!

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        // Modificaremos la API de cursos para que pueda filtrar por instructorId
        // Por ahora, obtendremos todos y filtraremos en el cliente (temporalmente para prueba)
        const response = await fetch('/api/courses'); // Llama a la API general de cursos
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Curso[] = await response.json();
        // Filtra los cursos que pertenecen a este instructor
        const filtered = data.filter(curso => curso.instructorId === instructorId);
        setMyCourses(filtered);
      } catch (e: any) {
        console.error("Error al cargar los cursos del instructor:", e);
        setError("Error al cargar tus cursos: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorCourses();
  }, [instructorId]); // Se re-ejecuta si el instructorId cambia (aunque por ahora es fijo)

  if (loading) {
    return <div className="text-center p-8">Cargando tus cursos...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mis Cursos</h1>
        <Link href="/dashboard/instructor/crear" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center transition-colors duration-300">
          <FaPlusCircle className="mr-2" /> Nuevo Curso
        </Link>
      </div>

      {myCourses.length === 0 ? (
        <div className="text-center text-gray-600 text-lg p-10 border border-dashed border-gray-300 rounded-lg">
          <p className="mb-4">No tienes cursos publicados aún. ¡Es hora de crear uno!</p>
          <Link href="/dashboard/instructor/crear" className="text-blue-600 hover:underline font-semibold">
            Comienza tu primer curso aquí.
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Título</th>
                <th className="py-3 px-6 text-left">Estado</th>
                <th className="py-3 px-6 text-left">Precio</th>
                <th className="py-3 px-6 text-left">Calificación</th>
                <th className="py-3 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {myCourses.map(curso => (
                <tr key={curso.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center">
                      <img src={curso.imagenUrl || 'https://via.placeholder.com/50x30?text=Curso'} alt={curso.titulo} className="w-12 h-8 rounded mr-3 object-cover" />
                      <Link href={`/cursos/${curso.id}`} className="font-medium text-blue-600 hover:underline">
                        {curso.titulo}
                      </Link>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold ${
                      curso.publicado ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {curso.publicado ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: curso.moneda }).format(curso.precio)}
                  </td>
                  <td className="py-3 px-6 text-left flex items-center">
                    {curso.calificacionPromedio?.toFixed(1) || 'N/A'} {curso.calificacionPromedio !== undefined && <FaStar className="ml-1 text-yellow-500" />}
                    <span className="ml-1 text-gray-500">({curso.numeroCalificaciones || 0})</span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center space-x-2">
                      {/* Estos botones serían para editar, ver, etc. */}
                      <Link href={`/dashboard/instructor/editar/${curso.id}`} className="w-4 mr-2 transform hover:scale-110 text-purple-600">
                        {/* Icono de editar o texto */} Editar
                      </Link>
                      <button onClick={() => alert(`Eliminar curso: ${curso.titulo}`)} className="w-4 mr-2 transform hover:scale-110 text-red-600">
                        {/* Icono de eliminar o texto */} Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InstructorCoursesPage;