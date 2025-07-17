// pages/dashboard/inicio.tsx
import PrivateLayout from '../../components/layout/PrivateLayout';
import ProfileCarousel from '../../components/ProfileCarousel';
import { SparklesIcon, UsersIcon, LightBulbIcon } from '@heroicons/react/24/outline'; // Ejemplo de íconos (asegúrate de tener @heroicons/react instalado)

const Inicio = () => {
  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> {/* Añadido padding responsivo */}
        
        {/* Sección de Bienvenida Mejorada */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg shadow-lg p-8 mb-10 transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <div className="flex items-center mb-4">
            <SparklesIcon className="h-10 w-10 mr-4 opacity-80" /> {/* Ícono destacado */}
            <h1 className="text-4xl font-extrabold">
              ¡Bienvenido a MentorApp!
            </h1>
          </div>
          <p className="text-xl opacity-90 leading-relaxed">
            Tu plataforma para conectar con mentes brillantes y acelerar tu crecimiento. Explora perfiles, encuentra inspiración y potencia tus proyectos.
          </p>
        </div>

        {/* Sección de Contenido Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10"> {/* Diseño de columnas para estadísticas o llamados a la acción */}
          
          {/* Tarjeta 1: Conecta con Mentores */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-3">
              <UsersIcon className="h-8 w-8 text-blue-500 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Conecta con Mentores</h2>
            </div>
            <p className="text-gray-600 mb-4">Encuentra expertos en diversas áreas listos para compartir su conocimiento.</p>
            <a href="/mentores" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              Explorar Mentores 
              <span className="ml-1 text-lg">→</span>
            </a>
          </div>

          {/* Tarjeta 2: Inspírate con Emprendedores */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-3">
              <LightBulbIcon className="h-8 w-8 text-purple-500 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Inspírate con Emprendedores</h2>
            </div>
            <p className="text-gray-600 mb-4">Descubre historias de éxito y proyectos innovadores que te motivarán.</p>
            <a href="/emprendedores" className="text-purple-600 hover:text-purple-800 font-medium flex items-center">
              Ver Emprendedores 
              <span className="ml-1 text-lg">→</span>
            </a>
          </div>

          {/* Tarjeta 3: Guía Rápida o Novedades */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-3">
              <SparklesIcon className="h-8 w-8 text-green-500 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Novedades y Tips</h2>
            </div>
            <p className="text-gray-600 mb-4">Mantente al día con las últimas noticias y consejos para tu desarrollo.</p>
            <a href="/blog" className="text-green-600 hover:text-green-800 font-medium flex items-center">
              Leer Blog 
              <span className="ml-1 text-lg">→</span>
            </a>
          </div>
        </div>

        {/* Carrusel de Perfiles (Manteniendo tu componente existente) */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Perfiles Destacados</h2>
        <p className="text-gray-600 mb-8">Una selección de mentores y emprendedores que te pueden interesar.</p>
        <ProfileCarousel />

      </div>
    </PrivateLayout>
  );
};

export default Inicio;