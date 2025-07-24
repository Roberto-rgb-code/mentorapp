// components/instructor/create-course/CourseReviewPublishStep.tsx
import React from 'react';
import { Curso } from '../../../types/Curso'; // Asegúrate de que la ruta sea correcta
import { FaCheckCircle, FaExclamationTriangle, FaSave, FaSpinner } from 'react-icons/fa';

interface CourseReviewPublishStepProps {
  courseData: Partial<Curso>;
  onPublish: () => void; // Función para publicar el curso
  isSaving: boolean; // Indica si se está guardando/publicando
}

const CourseReviewPublishStep: React.FC<CourseReviewPublishStepProps> = ({ courseData, onPublish, isSaving }) => {
  // Simple validación para mostrar si el curso está "listo" para publicar
  const isCourseReady =
    courseData.titulo &&
    courseData.descripcionLarga &&
    courseData.imagenUrl &&
    (courseData.secciones && courseData.secciones.length > 0 && courseData.secciones.every(s => s.titulo && s.lecciones.length > 0)) &&
    (courseData.precio !== undefined && courseData.precio > 0);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Enviar para Revisión y Publicación</h2>
      <p className="text-gray-700 mb-6">
        ¡Casi has terminado! Revisa todos los detalles de tu curso antes de enviarlo para su revisión y posible publicación.
      </p>

      <div className="mb-8 p-6 border rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumen del Curso</h3>
        <ul className="space-y-2 text-gray-700">
          <li><strong>Título:</strong> {courseData.titulo || 'No definido'}</li>
          <li><strong>Categoría:</strong> {courseData.categoria || 'No definida'}</li>
          <li><strong>Nivel:</strong> {courseData.nivel || 'No definido'}</li>
          <li><strong>Idioma:</strong> {courseData.idioma || 'No definido'}</li>
          <li><strong>Precio:</strong> {courseData.precio !== undefined ? `${courseData.moneda || 'MXN'} ${courseData.precio}` : 'No definido'}</li>
          <li><strong>Secciones:</strong> {courseData.secciones?.length || 0}</li>
          <li><strong>Estado:</strong> {courseData.publicado ? <span className="text-green-600">Publicado</span> : <span className="text-yellow-600">Borrador</span>}</li>
          {/* Puedes añadir más detalles del resumen aquí */}
        </ul>

        <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Verificación de Publicación</h3>
            {isCourseReady ? (
                <div className="flex items-center text-green-600 font-semibold text-lg">
                    <FaCheckCircle className="mr-2 text-2xl" /> El curso parece listo para publicar.
                </div>
            ) : (
                <div className="text-red-600 font-semibold text-lg bg-red-50 border border-red-200 p-4 rounded-md">
                    <FaExclamationTriangle className="inline-block mr-2 text-2xl" /> El curso no cumple con los requisitos mínimos para ser publicado.
                    <p className="text-sm mt-2">Asegúrate de haber completado:</p>
                    <ul className="list-disc list-inside text-sm ml-4 mt-1">
                        {!courseData.titulo && <li>Título del curso</li>}
                        {!courseData.descripcionLarga && <li>Descripción larga del curso</li>}
                        {!courseData.imagenUrl && <li>URL de la imagen de portada</li>}
                        {(!courseData.secciones || courseData.secciones.length === 0 || courseData.secciones.some(s => !s.titulo || s.lecciones.length === 0)) && <li>Al menos una sección con lecciones válidas</li>}
                        {(courseData.precio === undefined || courseData.precio <= 0) && <li>Un precio válido (mayor a 0)</li>}
                    </ul>
                </div>
            )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onPublish}
          disabled={isSaving || !isCourseReady} // Deshabilitar si no está listo o si ya está guardando
          className={`flex items-center px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
            isSaving || !isCourseReady
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-purple-700 hover:bg-purple-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {isSaving ? (
            <>
              <FaSpinner className="animate-spin mr-3 text-xl" /> Publicando Curso...
            </>
          ) : (
            <>
              <FaSave className="mr-3 text-xl" /> Publicar Curso Ahora
            </>
          )}
        </button>
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
        <h3 className="font-semibold text-lg mb-2">¿Qué pasa después de publicar?</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Tu curso estará visible para los estudiantes en el marketplace.</li>
          <li>Podrás ver estadísticas de rendimiento y ventas en tu panel de instructor.</li>
          <li>Podrás editar el curso en cualquier momento si necesitas hacer cambios.</li>
        </ul>
      </div>
    </div>
  );
};

export default CourseReviewPublishStep;