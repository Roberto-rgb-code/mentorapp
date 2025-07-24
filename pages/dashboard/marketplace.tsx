// pages/dashboard/marketplace.tsx
import React, { useState } from 'react';
import PrivateLayout from '../../components/layout/PrivateLayout';
import { FaSearch, FaFilter, FaStar, FaEnvelope, FaTag, FaDollarSign, FaBuilding, FaUserTie, FaCheckCircle, FaChevronRight } from 'react-icons/fa';

const Marketplace = () => {
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el filtro de tipo de proveedor (All, Consultor, Empresa) - Ahora en el sidebar
  const [filterType, setFilterType] = useState('All');
  // Estado para el filtro de calificación mínima - Nuevo filtro en el sidebar
  const [minRating, setMinRating] = useState(0);
  // Estado para el modal de contacto (simulación)
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null); // Para saber a quién contactar

  const providers = [
    {
      name: 'Consultoría Estratégica López',
      type: 'Consultor',
      description: 'Especialista en estrategias de crecimiento, reestructuración organizacional y expansión de mercado para PYMES. Enfoque en resultados tangibles.',
      services: ['Estrategia de Crecimiento', 'Optimización de Procesos', 'Planificación de Negocios'],
      price: '$150/hora',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca8849d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    },
    {
      name: 'Marketing Digital Pro',
      type: 'Empresa',
      description: 'Agencia líder en marketing digital. Ofrecemos soluciones completas para aumentar tu visibilidad online y generar leads calificados.',
      services: ['SEO y SEM', 'Redes Sociales', 'Email Marketing', 'Content Marketing'],
      price: '$200/proyecto',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1557804506-669b367ed9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    },
    {
      name: 'Asesoría Financiera García',
      type: 'Consultor',
      description: 'Asesoría personalizada para la optimización de recursos financieros, gestión de inversiones y planificación de patrimonio para empresas y particulares.',
      services: ['Análisis Financiero', 'Inversiones', 'Planificación Fiscal'],
      price: '$120/hora',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1563986768494-42f02271a396?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    },
    {
      name: 'Tech Solutions S.A.',
      type: 'Empresa',
      description: 'Desarrollo de software a medida, implementación de sistemas ERP/CRM y consultoría en transformación digital. Innovación y eficiencia garantizadas.',
      services: ['Desarrollo Web/Móvil', 'Consultoría TI', 'Ciberseguridad'],
      price: '$300/proyecto',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1549692520-cb43b01851b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    },
    {
      name: 'Diseño Creativo Estudio',
      type: 'Empresa',
      description: 'Ofrecemos soluciones innovadoras en diseño gráfico, branding y desarrollo web para potenciar la imagen de tu marca.',
      services: ['Branding', 'Diseño Gráfico', 'Diseño Web UX/UI'],
      price: '$180/proyecto',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    },
    {
      name: 'Legal & Compliance Consultores',
      type: 'Consultor',
      description: 'Asesoría legal especializada en derecho corporativo, contratos, propiedad intelectual y compliance normativo para empresas.',
      services: ['Asesoría Legal', 'Propiedad Intelectual', 'Compliance'],
      price: '$160/hora',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1582213601509-f308a3d53696?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    },
  ];

  // Lógica de filtrado y búsqueda
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          provider.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          provider.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilterType = filterType === 'All' || provider.type === filterType;
    const matchesMinRating = provider.rating >= minRating;

    return matchesSearch && matchesFilterType && matchesMinRating;
  });

  const handleContactClick = (provider: any) => {
    setSelectedProvider(provider);
    setShowContactForm(true);
  };

  const handleCloseContactForm = () => {
    setShowContactForm(false);
    setSelectedProvider(null);
  };

  const handleSubmitContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Mensaje enviado a ${selectedProvider.name}. Te contactaremos pronto.`);
    handleCloseContactForm();
    // Aquí iría la lógica real para enviar el formulario
  };

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 animate-fade-in-down">
          Marketplace: Conecta con el Talento que Impulsa tu Negocio
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto text-center animate-fade-in animation-delay-200">
          Explora nuestra exclusiva red de consultores y empresas líderes. Encuentra servicios estratégicos y soluciones innovadoras para cada desafío.
        </p>

        {/* Barra de Búsqueda Principal */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-10 flex flex-col md:flex-row items-center gap-4 border border-blue-100">
          <div className="relative flex-grow w-full">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o servicio..."
              className="pl-10 pr-4 py-3 rounded-lg border border-gray-300 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md w-full md:w-auto flex items-center justify-center">
            <FaSearch className="mr-2" /> Buscar
          </button>
        </div>

        {/* Contenido Principal: Sidebar + Listado de Proveedores */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de Filtros */}
          <aside className="lg:w-1/4 bg-white p-6 rounded-xl shadow-lg border border-blue-100 h-fit sticky top-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FaFilter className="mr-3 text-blue-600" /> Filtros
            </h2>

            {/* Filtro por Tipo de Proveedor */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaTag className="mr-2 text-gray-500" /> Tipo de Proveedor
              </h3>
              <div className="flex flex-col space-y-2">
                {['All', 'Consultor', 'Empresa'].map((type) => (
                  <label key={type} className="flex items-center text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
                    <input
                      type="radio"
                      name="providerType"
                      value={type}
                      checked={filterType === type}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 transition-colors"
                    />
                    <span className="ml-2">{type === 'All' ? 'Todos' : type + 's'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro por Calificación Mínima */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaStar className="mr-2 text-gray-500" /> Calificación Mínima
              </h3>
              <div className="flex flex-col space-y-2">
                {[4.5, 4.0, 3.0, 0].map((rating) => (
                  <label key={rating} className="flex items-center text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
                    <input
                      type="radio"
                      name="minRating"
                      value={rating}
                      checked={minRating === rating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">
                      {rating === 0 ? 'Cualquiera' : `${rating} Estrellas o más`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Botón para aplicar filtros (si fueran complejos o con múltiples selecciones) */}
            {/* <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center">
              <FaFilter className="mr-2" /> Aplicar Filtros
            </button> */}
          </aside>

          {/* Listado de Proveedores */}
          <div className="lg:w-3/4">
            {filteredProviders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProviders.map((provider, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 flex flex-col"
                  >
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="w-full h-52 object-cover rounded-t-xl"
                    />
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{provider.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          {provider.type === 'Consultor' ? <FaUserTie className="mr-2 text-blue-500" /> : <FaBuilding className="mr-2 text-green-500" />}
                          <span>{provider.type}</span>
                          <span className="mx-2 text-gray-300">|</span>
                          <FaStar className="text-yellow-400 mr-1" />
                          <span>{provider.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-gray-700 text-base mb-4 line-clamp-3" title={provider.description}>
                          {provider.description}
                        </p>
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-800 text-sm mb-2">Servicios Destacados:</h4>
                          <div className="flex flex-wrap gap-2">
                            {provider.services.map((service, sIndex) => (
                              <span
                                key={sIndex}
                                className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full flex items-center"
                              >
                                <FaCheckCircle className="mr-1" /> {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xl font-bold text-blue-700 flex items-center">
                          <FaDollarSign className="mr-2 text-blue-500" /> {provider.price}
                        </p>
                        <button
                          onClick={() => handleContactClick(provider)}
                          className="bg-orange-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md flex items-center"
                        >
                          <FaEnvelope className="mr-2" /> Contactar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow-lg border border-blue-100">
                <p className="text-xl text-gray-600">No se encontraron proveedores que coincidan con tu búsqueda o filtros.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal/Formulario de Contacto (Simulación) */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md animate-scale-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Contactar a {selectedProvider?.name}</h3>
              <form onSubmit={handleSubmitContactForm}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Tu Nombre:</label>
                  <input type="text" id="name" name="name" className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" required />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Tu Email:</label>
                  <input type="email" id="email" name="email" className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" required />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">Tu Mensaje:</label>
                  <textarea id="message" name="message" rows={5} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="Describe tu proyecto o pregunta..." required></textarea>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    Enviar Mensaje
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseContactForm}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};

export default Marketplace;