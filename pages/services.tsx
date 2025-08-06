// pages/services.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import PrivateLayout from '@/components/layout/PrivateLayout'; // Ajusta la ruta si es necesario
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaChartLine, FaHandshake, FaGraduationCap, FaStore, FaUsers, FaUserPlus, FaArrowRight, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Importaciones para tsparticles
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

gsap.registerPlugin(ScrollTrigger);

// Datos de los servicios
const servicesData = [
  {
    id: 'diagnostics',
    title: 'Diagnósticos Estratégicos',
    description: 'Identificamos las fortalezas y áreas de oportunidad de tu negocio con análisis profundos y personalizados para trazar el camino al éxito.',
    icon: FaChartLine,
    color: 'from-blue-500 to-blue-700',
    details: [
      'Análisis FODA completo',
      'Evaluación de mercado y competencia',
      'Identificación de cuellos de botella',
      'Reportes ejecutivos detallados',
    ],
  },
  {
    id: 'mentoring',
    title: 'Mentoría de Alto Impacto',
    description: 'Conecta con mentores expertos que te guiarán paso a paso, brindándote conocimientos prácticos y estrategias probadas para superar desafíos.',
    icon: FaHandshake,
    color: 'from-purple-500 to-purple-700',
    details: [
      'Sesiones 1 a 1 personalizadas',
      'Planes de acción con seguimiento',
      'Acceso a red de contactos del mentor',
      'Desarrollo de habilidades de liderazgo',
    ],
  },
  {
    id: 'courses',
    title: 'Cursos Especializados',
    description: 'Accede a una biblioteca de cursos diseñados para potenciar tus habilidades empresariales, desde finanzas hasta marketing digital y gestión.',
    icon: FaGraduationCap,
    color: 'from-green-500 to-green-700',
    details: [
      'Cursos online a tu propio ritmo',
      'Contenido actualizado por expertos',
      'Certificaciones al finalizar',
      'Materiales descargables y ejercicios',
    ],
  },
  {
    id: 'ecosystem',
    title: 'Ecosistema Comercial',
    description: 'Expande tu red de negocios. Encuentra socios, proveedores y clientes potenciales dentro de nuestra vibrante comunidad empresarial.',
    icon: FaStore,
    color: 'from-yellow-500 to-yellow-700',
    details: [
      'Directorio de empresas y emprendedores',
      'Oportunidades de colaboración',
      'Foros de discusión y networking',
      'Acceso a eventos exclusivos de la industria',
    ],
  },
  {
    id: 'community',
    title: 'Comunidad Exclusiva',
    description: 'Forma parte de una comunidad de apoyo donde podrás compartir experiencias, resolver dudas y crecer junto a otros emprendedores.',
    icon: FaUsers,
    color: 'from-red-500 to-red-700',
    details: [
      'Grupos de interés por sector',
      'Sesiones de preguntas y respuestas en vivo',
      'Eventos de networking y meetups',
      'Intercambio de ideas y feedback constructivo',
    ],
  },
];

const Services = () => {
  const serviceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  // Función de inicialización de tsparticles
  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  // Opciones para las partículas de fondo globales (ahora únicas)
  const globalParticlesOptions = {
    background: {
      color: {
        value: "#1a202c", // Un gris oscuro que combina con el fondo
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "push",
        },
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#00bcd4", // Color azul cian para las partículas
      },
      links: {
        color: "#4dd0e1", // Un poco más claro para las líneas
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  };

  useEffect(() => {
    // Animación para el hero section
    gsap.fromTo(
      '.hero-services-title',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out' }
    );
    gsap.fromTo(
      '.hero-services-description',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.4, delay: 0.4, ease: 'power3.out' }
    );
    gsap.fromTo(
      '.hero-services-cta',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1.2, delay: 0.8, ease: 'elastic.out(1, 0.8)' }
    );

    // Animación de aparición para cada tarjeta de servicio al hacer scroll
    serviceRefs.current.forEach((el, index) => {
      if (el) {
        gsap.fromTo(
          el,
          { opacity: 0, y: 100, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    // Animación para el CTA final de registro
    gsap.fromTo(
      '.final-cta-section',
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.final-cta-section',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  const toggleDetails = (id: string) => {
    setExpandedService(expandedService === id ? null : id);
  };

  return (
    <PrivateLayout>
      {/* Keyframes para el efecto de flotación del botón */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>

      <div className="relative min-h-screen bg-gray-900 text-gray-100 font-inter overflow-hidden">
        {/* Configuración de Particles.js para el fondo global (ahora cubre toda la pantalla) */}
        <Particles
          id="tsparticles-global"
          init={particlesInit}
          options={globalParticlesOptions}
          className="absolute inset-0 z-0" // Asegura que ocupe todo el espacio y esté detrás del contenido
        />

        {/* Contenido principal */}
        <div className="relative z-10"> {/* Este div asegura que todo el contenido esté encima de las partículas */}
          {/* Hero Section para Servicios */}
          {/* Eliminamos el gradiente de fondo del hero para que las partículas globales sean visibles */}
          <section className="min-h-[80vh] flex items-center justify-center text-center overflow-hidden shadow-2xl relative">
            {/* Overlay para mejor contraste sobre las partículas globales */}
            {/* Este div estará encima de las partículas globales y debajo del contenido del hero */}
            <div className="absolute inset-0 bg-black/60 z-0"></div>
            {/* El patrón de fondo abstracto se ha eliminado para no interferir con las partículas */}

            <div className="relative z-10 p-4 max-w-5xl mx-auto"> {/* Contenido del hero, encima del overlay */}
              <h1 className="hero-services-title text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
                Nuestras <span className="text-blue-400">Soluciones</span> Integrales
              </h1>
              <p className="hero-services-description text-xl md:text-2xl text-indigo-200 mb-10 max-w-3xl mx-auto">
                Descubre cómo MentorApp impulsa tu negocio con estrategias personalizadas y el apoyo de una comunidad experta.
              </p>
              <div className="hero-services-cta">
                <Link href="#services-grid" className="inline-block bg-yellow-400 text-blue-900 font-bold py-4 px-12 rounded-full text-lg md:text-xl shadow-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 ease-in-out animate-float">
                  Explorar Servicios
                </Link>
              </div>
            </div>
          </section>

          {/* Grid de Servicios */}
          <section id="services-grid" className="py-16 md:py-24 px-4 container mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-blue-300 mb-12 md:mb-16">
              Servicios a tu Medida
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {servicesData.map((service, index) => (
                <motion.div
                  key={service.id}
                  ref={(el) => { serviceRefs.current[index] = el; }}
                  className={`service-card bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden flex flex-col cursor-pointer`}
                  whileHover={{ scale: 1.03, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)" }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={() => toggleDetails(service.id)}
                >
                  <div className={`p-8 bg-gradient-to-br ${service.color} text-white flex flex-col items-center justify-center text-center h-48`}>
                    <service.icon className="text-6xl mb-4 drop-shadow-md" />
                    <h3 className="text-3xl font-bold mb-2 leading-tight">{service.title}</h3>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <p className="text-gray-300 text-lg mb-4 flex-grow">{service.description}</p>
                    {expandedService === service.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="mt-4 pt-4 border-t border-gray-700"
                      >
                        <h4 className="text-xl font-semibold text-blue-400 mb-3">Beneficios Clave:</h4>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                          {service.details.map((detail, i) => (
                            <li key={i} className="flex items-center">
                              <FaArrowRight className="text-blue-400 text-sm mr-2 flex-shrink-0" /> {detail}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                    <button
                      className="mt-6 self-center bg-blue-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center justify-center"
                    >
                      {expandedService === service.id ? (
                        <>
                          Ver Menos <FaChevronUp className="ml-2" />
                        </>
                      ) : (
                        <>
                          Más Detalles <FaChevronDown className="ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Sección de Registro - Call to Action Final */}
          <section className="final-cta-section py-16 md:py-24 bg-gradient-to-r from-fuchsia-700 to-purple-800 text-center shadow-inner-2xl rounded-3xl mx-4 md:mx-auto max-w-6xl mb-16 p-8 md:p-12 relative z-10">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                ¡Impulsa tu Negocio Hoy Mismo!
              </h2>
              <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto mb-10">
                Regístrate en MentorApp y comienza a transformar tus ideas en éxito con el apoyo de nuestra comunidad y expertos.
              </p>
              <Link href="/register" className="inline-block bg-white text-purple-800 font-bold py-4 px-12 rounded-full text-lg md:text-xl shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 ease-in-out">
                <FaUserPlus className="inline-block mr-3" /> Regístrate Ahora
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Services;
