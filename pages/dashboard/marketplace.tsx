// pages/dashboard/marketplace.tsx
import PrivateLayout from '../../components/layout/PrivateLayout';

const Marketplace = () => {
  const providers = [
    {
      name: 'Consultoría Estratégica López',
      type: 'Consultor',
      description: 'Especialista en estrategias de crecimiento para PYMES.',
      price: '$150/hora',
      image: '/images/consultor1.jpg',
    },
    {
      name: 'Marketing Digital Pro',
      type: 'Empresa',
      description: 'Servicios de marketing digital para aumentar tu presencia online.',
      price: '$200/proyecto',
      image: '/images/empresa1.jpg',
    },
    {
      name: 'Asesoría Financiera García',
      type: 'Consultor',
      description: 'Asesoría financiera para optimizar tus recursos.',
      price: '$120/hora',
      image: '/images/consultor2.jpg',
    },
    {
      name: 'Tech Solutions S.A.',
      type: 'Empresa',
      description: 'Soluciones tecnológicas para digitalizar tu negocio.',
      price: '$300/proyecto',
      image: '/images/empresa2.jpg',
    },
  ];

  return (
    <PrivateLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Marketplace - Tianguis de Consultores y Empresas</h1>
        <p className="text-gray-600 mb-8">
          Explora servicios ofrecidos por consultores y empresas para impulsar tu negocio.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.map((provider, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
              <img
                src={provider.image}
                alt={provider.name}
                className="w-full h-48 object-cover rounded-t-lg mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800">{provider.name}</h3>
              <p className="text-sm text-gray-500">{provider.type}</p>
              <p className="text-gray-600 mt-2">{provider.description}</p>
              <p className="text-gray-800 font-bold mt-2">{provider.price}</p>
              <button className="mt-4 w-full bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition">
                Contactar
              </button>
            </div>
          ))}
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Marketplace;