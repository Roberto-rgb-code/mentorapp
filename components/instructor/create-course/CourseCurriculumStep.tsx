// components/instructor/create-course/CourseCurriculumStep.tsx
import React, { useState, useRef } from 'react';
import { Curso, Seccion, Leccion } from '../../../types/Curso';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaVideo, FaFilePdf, FaImage, FaFile, FaSpinner, FaUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface CourseCurriculumStepProps {
  courseData: Partial<Curso>;
  handleChange: (field: string, value: any) => void;
}

const CourseCurriculumStep: React.FC<CourseCurriculumStepProps> = ({ courseData, handleChange }) => {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingLeccionId, setEditingLeccionId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newLeccionTitle, setNewLeccionTitle] = useState('');
  const [newLeccionTipo, setNewLeccionTipo] = useState<Leccion['tipo']>('video');
  const [newLeccionContenidoUrl, setNewLeccionContenidoUrl] = useState('');
  const [newLeccionDuracion, setNewLeccionDuracion] = useState(0);
  const [isUploading, setIsUploading] = useState<string | null>(null); // Track which upload is active

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});


  const generateUniqueId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const handleAddSection = () => {
    if (newSectionTitle.trim() === '') {
      toast.error('El título de la sección no puede estar vacío.');
      return;
    }
    const newSection: Seccion = {
      id: generateUniqueId(),
      titulo: newSectionTitle,
      orden: courseData.secciones?.length || 0,
      lecciones: [],
    };
    handleChange('secciones', [...(courseData.secciones || []), newSection]);
    setNewSectionTitle('');
    toast.success('Sección añadida.');
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = courseData.secciones?.filter(s => s.id !== sectionId)
      .map((s, index) => ({ ...s, orden: index })) || [];
    handleChange('secciones', updatedSections);
    toast.info('Sección eliminada.');
  };

  const handleEditSection = (sectionId: string, currentTitle: string) => {
    setEditingSectionId(sectionId);
    setNewSectionTitle(currentTitle);
  };

  const handleSaveSectionEdit = (sectionId: string) => {
    if (newSectionTitle.trim() === '') {
      toast.error('El título de la sección no puede estar vacío.');
      return;
    }
    const updatedSections = courseData.secciones?.map(s =>
      s.id === sectionId ? { ...s, titulo: newSectionTitle } : s
    ) || [];
    handleChange('secciones', updatedSections);
    setEditingSectionId(null);
    setNewSectionTitle('');
    toast.success('Título de sección actualizado.');
  };

  const handleCancelSectionEdit = () => {
    setEditingSectionId(null);
    setNewSectionTitle('');
  };

  const handleAddLeccion = (sectionId: string) => {
    if (newLeccionTitle.trim() === '' || !newLeccionTipo || newLeccionDuracion < 0) {
      toast.error('Por favor, completa el título, tipo y duración de la lección.');
      return;
    }

    const newLeccion: Leccion = {
      id: generateUniqueId(),
      titulo: newLeccionTitle,
      orden: 0, // Se ajustará al añadir a la sección
      tipo: newLeccionTipo,
      contenidoUrl: newLeccionContenidoUrl,
      duracion: newLeccionDuracion,
      recursosDescargables: [],
    };

    const updatedSections = courseData.secciones?.map(s => {
      if (s.id === sectionId) {
        const updatedLecciones = [...(s.lecciones || []), newLeccion];
        // Reordenar las lecciones dentro de la sección
        updatedLecciones.forEach((lec, idx) => lec.orden = idx);
        return { ...s, lecciones: updatedLecciones };
      }
      return s;
    }) || [];

    handleChange('secciones', updatedSections);
    // Reiniciar los campos de nueva lección
    setNewLeccionTitle('');
    setNewLeccionTipo('video');
    setNewLeccionContenidoUrl('');
    setNewLeccionDuracion(0);
    toast.success('Lección añadida.');
  };

  const handleDeleteLeccion = (sectionId: string, leccionId: string) => {
    const updatedSections = courseData.secciones?.map(s => {
      if (s.id === sectionId) {
        const updatedLecciones = s.lecciones?.filter(l => l.id !== leccionId)
          .map((l, index) => ({ ...l, orden: index })) || [];
        return { ...s, lecciones: updatedLecciones };
      }
      return s;
    }) || [];
    handleChange('secciones', updatedSections);
    toast.info('Lección eliminada.');
  };

  const handleEditLeccion = (sectionId: string, leccion: Leccion) => {
    setEditingSectionId(sectionId); // Usar sectionId para saber en qué sección se edita la lección
    setEditingLeccionId(leccion.id);
    // Cargar los datos de la lección a editar en los estados temporales
    setNewLeccionTitle(leccion.titulo);
    setNewLeccionTipo(leccion.tipo);
    setNewLeccionContenidoUrl(leccion.contenidoUrl || '');
    setNewLeccionDuracion(leccion.duracion || 0);
  };

  const handleSaveLeccionEdit = (sectionId: string, leccionId: string) => {
    if (newLeccionTitle.trim() === '' || !newLeccionTipo || newLeccionDuracion < 0) {
      toast.error('Por favor, completa todos los campos de la lección.');
      return;
    }

    const updatedSections = courseData.secciones?.map(s => {
      if (s.id === sectionId) {
        const updatedLecciones = s.lecciones?.map(l =>
          l.id === leccionId ? {
            ...l,
            titulo: newLeccionTitle,
            tipo: newLeccionTipo,
            contenidoUrl: newLeccionContenidoUrl,
            duracion: newLeccionDuracion,
          } : l
        ) || [];
        return { ...s, lecciones: updatedLecciones };
      }
      return s;
    }) || [];

    handleChange('secciones', updatedSections);
    // Resetear los estados de edición
    setEditingLeccionId(null);
    setEditingSectionId(null);
    setNewLeccionTitle('');
    setNewLeccionTipo('video');
    setNewLeccionContenidoUrl('');
    setNewLeccionDuracion(0);
    toast.success('Lección actualizada.');
  };

  const handleCancelLeccionEdit = () => {
    setEditingLeccionId(null);
    setEditingSectionId(null);
    setNewLeccionTitle('');
    setNewLeccionTipo('video');
    setNewLeccionContenidoUrl('');
    setNewLeccionDuracion(0);
  };

  const handleLeccionFileUpload = async (sectionId: string, leccionId: string, file: File | null, field: 'contenidoUrl' | 'recursosDescargables') => {
    if (!file) {
      toast.error('No se seleccionó ningún archivo.');
      return;
    }

    // Usar el ID de la lección para identificar qué input de carga está activo
    const uploadKey = `${sectionId}-${leccionId}-${field}`;
    setIsUploading(uploadKey);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir el archivo.');
      }

      const result = await response.json();
      toast.success('Archivo de lección subido exitosamente.');

      const updatedSections = courseData.secciones?.map(s => {
        if (s.id === sectionId) {
          const updatedLecciones = s.lecciones?.map(l => {
            if (l.id === leccionId) {
              if (field === 'contenidoUrl') {
                return { ...l, contenidoUrl: result.url };
              } else if (field === 'recursosDescargables') {
                const newResource = { nombre: file.name, url: result.url };
                return { ...l, recursosDescargables: [...(l.recursosDescargables || []), newResource] };
              }
            }
            return l;
          }) || [];
          return { ...s, lecciones: updatedLecciones };
        }
        return s;
      }) || [];

      handleChange('secciones', updatedSections);
      // Si estamos en modo "añadir nueva lección" (leccionId === 'new'), actualizamos el campo de URL temporal
      if (leccionId === 'new' && field === 'contenidoUrl') {
        setNewLeccionContenidoUrl(result.url);
      } else if (editingLeccionId === leccionId && field === 'contenidoUrl') {
        // Si estamos editando una lección, también actualizamos el campo temporal para que se refleje
        setNewLeccionContenidoUrl(result.url);
      }


    } catch (error: any) {
      console.error('Error al subir archivo de lección:', error);
      toast.error(error.message || `Error al subir el archivo para la lección.`);
    } finally {
      setIsUploading(null);
    }
  };

  const handleRemoveResource = (sectionId: string, leccionId: string, resourceUrl: string) => {
    const updatedSections = courseData.secciones?.map(s => {
      if (s.id === sectionId) {
        const updatedLecciones = s.lecciones?.map(l => {
          if (l.id === leccionId) {
            return {
              ...l,
              recursosDescargables: l.recursosDescargables?.filter(res => res.url !== resourceUrl) || [],
            };
          }
          return l;
        }) || [];
        return { ...s, lecciones: updatedLecciones };
      }
      return s;
    }) || [];
    handleChange('secciones', updatedSections);
    toast.info('Recurso eliminado.');
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Estructura del Curso</h2>
      <p className="text-700 mb-6">
        Organiza tu curso en secciones y añade lecciones. Cada lección debe tener un tipo de contenido y su URL.
      </p>

      {/* Añadir Nueva Sección */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Añadir Nueva Sección</h3>
        <div className="flex space-x-3">
          <input
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Título de la nueva sección (Ej: Introducción, Fundamentos, Casos de Estudio)"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
          <button
            onClick={handleAddSection}
            className="px-6 py-3 rounded-md font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center"
          >
            <FaPlus className="mr-2" /> Añadir Sección
          </button>
        </div>
      </div>

      {/* Lista de Secciones */}
      <div className="space-y-6">
        {courseData.secciones?.length === 0 && (
          <p className="text-gray-600 text-center py-4">Aún no hay secciones en tu curso. ¡Añade una para empezar!</p>
        )}
        {courseData.secciones?.map(section => (
          <div key={section.id} className="border border-gray-200 rounded-lg bg-white shadow-sm p-5">
            {editingSectionId === section.id && editingLeccionId === null ? ( // Condición para editar sección
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="text"
                  value={newSectionTitle} // Usa newSectionTitle para la edición de sección
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="flex-grow p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
                <button onClick={() => handleSaveSectionEdit(section.id)} className="text-green-600 hover:text-green-800 p-2"><FaCheck /></button>
                <button onClick={handleCancelSectionEdit} className="text-red-600 hover:text-red-800 p-2"><FaTimes /></button>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Sección {section.orden + 1}: {section.titulo}</h3>
                <div className="flex space-x-2">
                  <button onClick={() => handleEditSection(section.id, section.titulo)} className="text-blue-600 hover:text-blue-800 p-2"><FaEdit /></button>
                  <button onClick={() => handleDeleteSection(section.id)} className="text-red-600 hover:text-red-800 p-2"><FaTrash /></button>
                </div>
              </div>
            )}

            {/* Añadir Nueva Lección a esta Sección */}
            {/* Solo muestra el formulario de añadir lección si NO estamos editando una lección existente dentro de esta sección */}
            {editingLeccionId !== null && editingSectionId === section.id ? null : (
            <div className="mb-4 p-4 border border-gray-100 rounded-md bg-gray-50">
              <h4 className="text-lg font-medium text-gray-800 mb-3">Añadir Nueva Lección a "{section.titulo}"</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`leccionTitle-new-${section.id}`} className="block text-sm font-medium text-gray-700 mb-1">Título de la Lección</label>
                  <input
                    type="text"
                    id={`leccionTitle-new-${section.id}`}
                    value={newLeccionTitle} // Siempre usa newLeccionTitle para añadir
                    onChange={(e) => setNewLeccionTitle(e.target.value)}
                    placeholder="Ej: Introducción a React Hooks"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>
                <div>
                  <label htmlFor={`leccionType-new-${section.id}`} className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contenido</label>
                  <select
                    id={`leccionType-new-${section.id}`}
                    value={newLeccionTipo} // Siempre usa newLeccionTipo para añadir
                    onChange={(e) => setNewLeccionTipo(e.target.value as Leccion['tipo'])}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                  >
                    <option value="video">Video</option>
                    <option value="articulo">Artículo</option>
                    <option value="quiz">Quiz</option>
                    <option value="descargable">Descargable</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`leccionUrl-new-${section.id}`} className="block text-sm font-medium text-gray-700 mb-1">URL del Contenido</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      id={`leccionUrl-new-${section.id}`}
                      value={newLeccionContenidoUrl} // Siempre usa newLeccionContenidoUrl para añadir
                      onChange={(e) => setNewLeccionContenidoUrl(e.target.value)}
                      placeholder="Ej: https://tuvideo.com/leccion1.mp4"
                      className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                    <input
                      type="file"
                      ref={el => fileInputRefs.current[`new-leccion-content-${section.id}`] = el}
                      accept={newLeccionTipo === 'video' ? 'video/*' : newLeccionTipo === 'imagen' ? 'image/*' : newLeccionTipo === 'articulo' ? '.txt,.md,.html' : '*/*'}
                      onChange={(e) => handleLeccionFileUpload(section.id, 'new', e.target.files ? e.target.files[0] : null, 'contenidoUrl')}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRefs.current[`new-leccion-content-${section.id}`]?.click()}
                      disabled={isUploading === `${section.id}-new-contenidoUrl`}
                      className={`px-4 py-2 rounded-md font-semibold text-white transition-colors flex items-center ${
                        isUploading === `${section.id}-new-contenidoUrl` ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isUploading === `${section.id}-new-contenidoUrl` ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor={`leccionDuration-new-${section.id}`} className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
                  <input
                    type="number"
                    id={`leccionDuration-new-${section.id}`}
                    value={newLeccionDuracion} // Siempre usa newLeccionDuracion para añadir
                    onChange={(e) => setNewLeccionDuracion(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>
              </div>
              <button
                onClick={() => handleAddLeccion(section.id)}
                className="mt-4 w-full px-4 py-2 rounded-md font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Añadir Lección
              </button>
            </div>
            )}

            {/* Lista de Lecciones */}
            <ul className="space-y-3">
              {section.lecciones.length === 0 && (
                <li className="text-gray-500 text-center py-2">Aún no hay lecciones en esta sección.</li>
              )}
              {section.lecciones.map(leccion => (
                <li key={leccion.id} className="flex flex-col border border-gray-100 rounded-md p-3 bg-white shadow-sm">
                  {editingLeccionId === leccion.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                        <input
                          type="text"
                          value={newLeccionTitle} // Cuando se edita, usa newLeccionTitle que fue cargado en handleEditLeccion
                          onChange={(e) => setNewLeccionTitle(e.target.value)}
                          className="w-full p-2 border border-blue-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                          value={newLeccionTipo} // Cuando se edita, usa newLeccionTipo
                          onChange={(e) => setNewLeccionTipo(e.target.value as Leccion['tipo'])}
                          className="w-full p-2 border border-blue-300 rounded-md bg-white"
                        >
                          <option value="video">Video</option>
                          <option value="articulo">Artículo</option>
                          <option value="quiz">Quiz</option>
                          <option value="descargable">Descargable</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Contenido</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newLeccionContenidoUrl} // Cuando se edita, usa newLeccionContenidoUrl
                            onChange={(e) => setNewLeccionContenidoUrl(e.target.value)}
                            placeholder="URL del contenido"
                            className="flex-grow p-2 border border-blue-300 rounded-md"
                          />
                          <input
                            type="file"
                            ref={el => fileInputRefs.current[`edit-leccion-content-${leccion.id}`] = el}
                            accept={newLeccionTipo === 'video' ? 'video/*' : newLeccionTipo === 'imagen' ? 'image/*' : newLeccionTipo === 'articulo' ? '.txt,.md,.html' : '*/*'}
                            onChange={(e) => handleLeccionFileUpload(section.id, leccion.id, e.target.files ? e.target.files[0] : null, 'contenidoUrl')}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRefs.current[`edit-leccion-content-${leccion.id}`]?.click()}
                            disabled={isUploading === `${section.id}-${leccion.id}-contenidoUrl`}
                            className={`px-4 py-2 rounded-md font-semibold text-white transition-colors flex items-center ${
                              isUploading === `${section.id}-${leccion.id}-contenidoUrl` ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {isUploading === `${section.id}-${leccion.id}-contenidoUrl` ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                        <input
                          type="number"
                          value={newLeccionDuracion} // Cuando se edita, usa newLeccionDuracion
                          onChange={(e) => setNewLeccionDuracion(parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full p-2 border border-blue-300 rounded-md"
                        />
                      </div>
                      <div className="col-span-2 flex justify-end space-x-2 mt-2">
                        <button onClick={() => handleSaveLeccionEdit(section.id, leccion.id)} className="text-green-600 hover:text-green-800 p-2"><FaCheck /></button>
                        <button onClick={handleCancelLeccionEdit} className="text-red-600 hover:text-red-800 p-2"><FaTimes /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700 flex items-center">
                          {leccion.orden + 1}.{' '}
                          {leccion.tipo === 'video' && <FaVideo className="mr-1 text-red-500" />}
                          {leccion.tipo === 'articulo' && <FaFilePdf className="mr-1 text-blue-500" />}
                          {leccion.tipo === 'quiz' && <FaCheck className="mr-1 text-green-500" />}
                          {leccion.tipo === 'descargable' && <FaFile className="mr-1 text-purple-500" />}
                          {leccion.titulo} ({leccion.duracion} min)
                        </span>
                        <div className="flex space-x-2">
                          <button onClick={() => handleEditLeccion(section.id, leccion)} className="text-blue-600 hover:text-blue-800 p-2"><FaEdit /></button>
                          <button onClick={() => handleDeleteLeccion(section.id, leccion.id)} className="text-red-600 hover:text-red-800 p-2"><FaTrash /></button>
                        </div>
                      </div>
                      {leccion.contenidoUrl && (
                        <p className="text-sm text-gray-500 ml-6 break-all">URL: <a href={leccion.contenidoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{leccion.contenidoUrl}</a></p>
                      )}

                      {/* Recursos Descargables para la Lección */}
                      <div className="mt-2 ml-6">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Recursos Descargables:</h5>
                        {leccion.recursosDescargables && leccion.recursosDescargables.length > 0 ? (
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {leccion.recursosDescargables.map((resource, resIndex) => (
                              <li key={resource.url} className="flex justify-between items-center break-all"> {/* Usar resource.url como key es más seguro */}
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                  {resource.nombre}
                                </a>
                                <button
                                  onClick={() => handleRemoveResource(section.id, leccion.id, resource.url)}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                  title="Eliminar recurso"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">Ningún recurso.</p>
                        )}
                        <input
                          type="file"
                          ref={el => fileInputRefs.current[`resource-${leccion.id}`] = el}
                          onChange={(e) => handleLeccionFileUpload(section.id, leccion.id, e.target.files ? e.target.files[0] : null, 'recursosDescargables')}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRefs.current[`resource-${leccion.id}`]?.click()}
                          disabled={isUploading === `${section.id}-${leccion.id}-recursosDescargables`}
                          className={`mt-2 px-3 py-1 text-xs rounded-md font-semibold text-white transition-colors flex items-center ${
                            isUploading === `${section.id}-${leccion.id}-recursosDescargables` ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          {isUploading === `${section.id}-${leccion.id}-recursosDescargables` ? <FaSpinner className="animate-spin mr-1" /> : <FaPlus className="mr-1" />}
                          Añadir Recurso
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg text-purple-800">
        <h3 className="font-semibold text-lg mb-2">Consejos para la Estructura del Curso</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Divide tu curso en secciones lógicas y fáciles de seguir.</li>
          <li>Cada lección debe enfocarse en un tema específico.</li>
          <li>Asegúrate de que tus videos y materiales estén bien producidos y sean de alta calidad.</li>
        </ul>
      </div>
    </div>
  );
};

export default CourseCurriculumStep;