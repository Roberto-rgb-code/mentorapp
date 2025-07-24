// components/instructor/create-course/CourseLandingPageStep.tsx
import React, { useRef, useState } from 'react';
import { Curso } from '../../../types/Curso';
import { toast } from 'react-toastify';
import { FaUpload, FaSpinner } from 'react-icons/fa';

interface CourseLandingPageStepProps {
  courseData: Partial<Curso>;
  handleChange: (field: string, value: any) => void;
}

const CourseLandingPageStep: React.FC<CourseLandingPageStepProps> = ({ courseData, handleChange }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const handleFileUpload = async (file: File | null, type: 'image' | 'video') => {
    if (!file) {
      toast.error('No se seleccionó ningún archivo.');
      return;
    }

    if (type === 'image') setIsUploadingImage(true);
    else setIsUploadingVideo(true);

    const formData = new FormData();
    formData.append('file', file); // 'file' es el nombre que espera tu API Route

    try {
      const response = await fetch('/api/upload', { // Llama a tu nueva API Route
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir el archivo.');
      }

      const result = await response.json();
      toast.success('Archivo subido exitosamente.');

      if (type === 'image') {
        handleChange('imagenUrl', result.url);
      } else {
        handleChange('videoIntroduccionUrl', result.url);
      }
    } catch (error: any) {
      console.error('Error al subir archivo:', error);
      toast.error(error.message || `Error al subir el ${type}.`);
    } finally {
      if (type === 'image') setIsUploadingImage(false);
      else setIsUploadingVideo(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Página de Inicio del Curso</h2>
      <p className="text-gray-700 mb-6">
        Configura los elementos que los estudiantes verán antes de inscribirse en tu curso.
      </p>

      {/* Título del Curso */}
      <div className="mb-6">
        <label htmlFor="titulo" className="block text-lg font-medium text-gray-700 mb-2">
          Título del Curso
        </label>
        <input
          type="text"
          id="titulo"
          value={courseData.titulo || ''}
          onChange={(e) => handleChange('titulo', e.target.value)}
          placeholder="Ej: Curso Completo de Desarrollo Web con React y Node.js"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          maxLength={80}
        />
        <p className="text-sm text-gray-500 mt-1">Máximo 80 caracteres. Un título claro y conciso es clave.</p>
      </div>

      {/* Descripción Corta del Curso */}
      <div className="mb-6">
        <label htmlFor="descripcionCorta" className="block text-lg font-medium text-gray-700 mb-2">
          Descripción Corta del Curso
        </label>
        <textarea
          id="descripcionCorta"
          value={courseData.descripcionCorta || ''}
          onChange={(e) => handleChange('descripcionCorta', e.target.value)}
          rows={3}
          placeholder="Una breve descripción que aparecerá en los resultados de búsqueda y listados."
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-y"
          maxLength={160}
        ></textarea>
        <p className="text-sm text-gray-500 mt-1">Máximo 160 caracteres. Despierta el interés rápidamente.</p>
      </div>

      {/* Descripción Larga del Curso */}
      <div className="mb-6">
        <label htmlFor="descripcionLarga" className="block text-lg font-medium text-gray-700 mb-2">
          Descripción Larga del Curso
        </label>
        <textarea
          id="descripcionLarga"
          value={courseData.descripcionLarga || ''}
          onChange={(e) => handleChange('descripcionLarga', e.target.value)}
          rows={8}
          placeholder="Proporciona una descripción detallada y atractiva de tu curso. Mínimo 200 caracteres para SEO."
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-y"
          minLength={200}
        ></textarea>
        <p className="text-sm text-gray-500 mt-1">Mínimo 200 caracteres. Detalla lo que el estudiante aprenderá y por qué tu curso es ideal.</p>
      </div>

      {/* Imagen de Portada del Curso */}
      <div className="mb-6">
        <label htmlFor="imagenUrl" className="block text-lg font-medium text-gray-700 mb-2">
          Imagen de Portada del Curso
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            id="imagenUrl"
            value={courseData.imagenUrl || ''}
            onChange={(e) => handleChange('imagenUrl', e.target.value)}
            placeholder="URL de la imagen (ej: https://tuserverdor.com/imagen.jpg)"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files ? e.target.files[0] : null, 'image')}
            className="hidden"
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImage}
            className={`px-6 py-3 rounded-md font-semibold flex items-center ${
              isUploadingImage ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            } text-white transition-colors`}
          >
            {isUploadingImage ? <FaSpinner className="animate-spin mr-2" /> : <FaUpload className="mr-2" />}
            {isUploadingImage ? 'Subiendo...' : 'Subir Imagen'}
          </button>
        </div>
        {courseData.imagenUrl && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
            <img src={courseData.imagenUrl} alt="Vista previa" className="max-w-xs h-auto rounded-md shadow-md" />
          </div>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Una imagen clara y atractiva que represente tu curso. Se recomienda una resolución de 1280x720px.
        </p>
      </div>

      {/* Video de Introducción del Curso (Opcional) */}
      <div className="mb-6">
        <label htmlFor="videoIntroduccionUrl" className="block text-lg font-medium text-gray-700 mb-2">
          Video de Introducción del Curso (Opcional)
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            id="videoIntroduccionUrl"
            value={courseData.videoIntroduccionUrl || ''}
            onChange={(e) => handleChange('videoIntroduccionUrl', e.target.value)}
            placeholder="URL del video (ej: https://tuserverdor.com/intro.mp4)"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            onChange={(e) => handleFileUpload(e.target.files ? e.target.files[0] : null, 'video')}
            className="hidden"
          />
          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={isUploadingVideo}
            className={`px-6 py-3 rounded-md font-semibold flex items-center ${
              isUploadingVideo ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            } text-white transition-colors`}
          >
            {isUploadingVideo ? <FaSpinner className="animate-spin mr-2" /> : <FaUpload className="mr-2" />}
            {isUploadingVideo ? 'Subiendo...' : 'Subir Video'}
          </button>
        </div>
        {courseData.videoIntroduccionUrl && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
            <video controls src={courseData.videoIntroduccionUrl} className="max-w-md h-auto rounded-md shadow-md" />
          </div>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Un video corto y persuasivo que invite a los estudiantes a inscribirse (máx. 2 minutos, 1920x1080px recomendado).
        </p>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
        <h3 className="font-semibold text-lg mb-2">Consejos para una Página de Inicio Atractiva</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>El título y la descripción son clave para el SEO y la captación.</li>
          <li>Usa una imagen de alta calidad que represente el contenido del curso.</li>
          <li>Un video de introducción conciso puede aumentar las inscripciones.</li>
        </ul>
      </div>
    </div>
  );
};

export default CourseLandingPageStep;