// components/courses/CourseCard.tsx
import React from 'react';
import Link from 'next/link'; // Para navegar a la página de detalles del curso
import { FaStar } from 'react-icons/fa'; // Importa el icono de estrella

// Asumiendo que tienes una interfaz Curso definida en types/Curso.ts
interface Curso {
  id: string;
  titulo: string;
  descripcionCorta: string;
  imagenUrl: string;
  instructorNombre: string;
  precio: number;
  moneda: string;
  calificacionPromedio?: number; // Opcional, si lo implementas
  numeroCalificaciones?: number; // Opcional, si lo implementas
  // Añade aquí cualquier otro campo que quieras mostrar en la tarjeta
}

interface CourseCardProps {
  curso: Curso;
}

const CourseCard: React.FC<CourseCardProps> = ({ curso }) => {
  return (
    <Link href={`/cursos/${curso.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Imagen del curso */}
        <div className="relative w-full h-40 overflow-hidden">
          <img
            src={curso.imagenUrl || 'https://via.placeholder.com/400x250?text=Curso+Imagen'}
            alt={curso.titulo}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Contenido de la tarjeta */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{curso.titulo}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{curso.descripcionCorta}</p>
          <p className="text-xs text-gray-500 mb-2">{curso.instructorNombre}</p>

          {/* Calificación (Opcional, si se implementa) */}
          {curso.calificacionPromedio !== undefined && curso.numeroCalificaciones !== undefined && (
            <div className="flex items-center text-sm text-yellow-500 mb-2">
              <span className="font-bold mr-1">{curso.calificacionPromedio.toFixed(1)}</span>
              <FaStar />
              <span className="text-gray-500 ml-2">({curso.numeroCalificaciones})</span>
            </div>
          )}

          {/* Precio */}
          <div className="mt-auto pt-2"> {/* Empuja el precio al final */}
            <p className="text-lg font-bold text-gray-900">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: curso.moneda }).format(curso.precio)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;