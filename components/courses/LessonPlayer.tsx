// components/courses/LessonPlayer.tsx
import React from 'react';
import { Leccion } from '../../types/Curso'; // Asegúrate de que la ruta sea correcta
import { FaExclamationTriangle, FaFileAlt, FaQuestionCircle, FaDownload } from 'react-icons/fa';

interface LessonPlayerProps {
  lesson: Leccion;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ lesson }) => {
  if (!lesson) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error:</p>
        <p>No se pudo cargar la información de la lección.</p>
      </div>
    );
  }

  // Renderiza el reproductor según el tipo de lección
  switch (lesson.tipo) {
    case 'video':
      if (!lesson.contenidoUrl) {
        return (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p className="font-bold">Advertencia:</p>
            <p>Este video no tiene una URL de contenido especificada.</p>
          </div>
        );
      }
      return (
        <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-md"> {/* 16:9 Aspect Ratio */}
          <video
            src={lesson.contenidoUrl}
            controls
            autoPlay
            className="absolute top-0 left-0 w-full h-full object-contain" // object-contain para que no se corte
            poster={lesson.imagenUrl || ''} // Puedes usar una miniatura si la tienes
          >
            Tu navegador no soporta el elemento de video.
          </video>
        </div>
      );

    case 'articulo':
      // Para un artículo, podrías renderizar contenido HTML o Markdown.
      // Por ahora, asumimos que 'contenidoUrl' apunta a un archivo de texto/markdown
      // o que 'contenidoTexto' tiene el contenido directamente.
      // Si usas markdown, necesitarás una librería como 'react-markdown'.
      return (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaFileAlt className="mr-3 text-green-600" /> Contenido del Artículo
          </h2>
          {lesson.contenidoTexto ? (
            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: lesson.contenidoTexto }}>
              {/* ¡ADVERTENCIA! Usar dangerouslySetInnerHTML es arriesgado con contenido de usuario no filtrado.
                  Asegúrate de sanear el HTML si permites a los instructores subir contenido arbitrario.
                  Alternativa: Usar una librería de renderizado de Markdown como react-markdown. */}
            </div>
          ) : lesson.contenidoUrl ? (
            <p className="text-gray-700">
              Contenido del artículo disponible en: <a href={lesson.contenidoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{lesson.contenidoUrl}</a>
            </p>
          ) : (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
              <p className="font-bold">Advertencia:</p>
              <p>Este artículo no tiene contenido o URL especificada.</p>
            </div>
          )}
        </div>
      );

    case 'quiz':
      // Para quizzes, esto sería una integración con un componente de quiz.
      // Por ahora, es un placeholder.
      return (
        <div className="bg-purple-50 p-6 rounded-lg shadow-md text-center">
          <FaQuestionCircle className="text-6xl text-purple-600 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-purple-800 mb-3">Quiz de la Lección</h2>
          <p className="text-purple-700 mb-4">
            Aquí iría la interfaz interactiva para realizar el quiz.
          </p>
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300">
            Iniciar Quiz
          </button>
        </div>
      );

    case 'descargable':
      // Para recursos descargables, simplemente se muestra un enlace de descarga.
      return (
        <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
          <FaDownload className="text-6xl text-blue-600 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-blue-800 mb-3">Recurso Descargable</h2>
          <p className="text-blue-700 mb-4">
            Haz clic en el botón para descargar el material de la lección.
          </p>
          {lesson.contenidoUrl ? (
            <a href={lesson.contenidoUrl} target="_blank" rel="noopener noreferrer">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center mx-auto">
                <FaDownload className="mr-2" /> Descargar Archivo
              </button>
            </a>
          ) : (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4" role="alert">
              <p className="font-bold">Advertencia:</p>
              <p>No hay URL de descarga especificada para este recurso.</p>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error:</p>
          <p>Tipo de lección no reconocido o no implementado.</p>
        </div>
      );
  }
};

export default LessonPlayer;