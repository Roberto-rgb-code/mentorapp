// pages/dashboard/asesoria.tsx
import PrivateLayout from '../../components/layout/PrivateLayout';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useState } from 'react';

const Asesoria = () => {
  const [selectedConsultant, setSelectedConsultant] = useState(null);

  const consultants = [
    {
      id: 1,
      name: 'Eric',
      role: 'MENTOR',
      location: 'USA',
      description:
        'Eric, un emprendedor con experiencia y súper mentor, valora la preparación. Ha creado y vendido cuatro empresas, por lo que motiva a sus mentees a llegar listos para aprovechar cada sesión.',
      image: '/images/eric.jpg',
    },
    {
      id: 2,
      name: 'María',
      role: 'ENTREPRENEUR',
      location: 'MEXICO',
      description:
        'Después de 18 años en la industria de la comida mexicana, Adriana enfrentó retos tras la pandemia. Sus mentores la ayudaron a plantear su estrategia y recuperar confianza en su negocio.',
      image: '/images/maria.jpg',
    },
    {
      id: 3,
      name: 'Carrie',
      role: 'ENTREPRENEUR',
      location: 'USA',
      description:
        'Carrie, experta en salud cerebral y coaching, tenía problemas con su marketing. Con la ayuda de mentores en Micrommentor, mejoró su sitio web, fortaleció su marca y ahora se promociona con seguridad.',
      image: '/images/carrie.jpg',
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const handleSelectConsultant = (consultant: any) => {
    setSelectedConsultant(consultant);
  };

  return (
    <PrivateLayout>
      <h1 className="text-3xl font-bold text-gray-800">Asesoría</h1>
      <p className="mt-4 text-gray-600">Conoce a nuestros consultores expertos.</p>
      <Slider {...settings} className="mt-8">
        {consultants.map((consultant) => (
          <div key={consultant.id} className="px-4">
            <div
              className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition"
              onClick={() => handleSelectConsultant(consultant)}
            >
              <img
                src={consultant.image}
                alt={consultant.name}
                className="w-24 h-24 rounded-full mx-auto"
              />
              <p className="text-blue-600 mt-2">{consultant.location}</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">{consultant.name}</h2>
              <p
                className={`mt-2 ${
                  consultant.role === 'MENTOR' ? 'bg-yellow-500' : 'bg-purple-500'
                } text-white px-2 py-1 rounded inline-block`}
              >
                {consultant.role}
              </p>
              <p className="text-gray-600 mt-4 text-sm">{consultant.description}</p>
            </div>
          </div>
        ))}
      </Slider>

      {selectedConsultant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-3xl font-bold text-gray-800">{selectedConsultant.name}</h2>
            <p
              className={`mt-2 ${
                selectedConsultant.role === 'MENTOR' ? 'bg-yellow-500' : 'bg-purple-500'
              } text-white px-2 py-1 rounded inline-block`}
            >
              {selectedConsultant.role}
            </p>
            <p className="text-gray-600 mt-2">{selectedConsultant.location}</p>
            <p className="text-gray-600 mt-4">{selectedConsultant.description}</p>
            {/* Aquí puedes agregar más detalles como experiencia o testimonios */}
            <button
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setSelectedConsultant(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </PrivateLayout>
  );
};

export default Asesoria;