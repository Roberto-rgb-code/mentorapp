// pages/index.tsx
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import HomePageLayout from '../components/layout/HomePageLayout'; // Importa el nuevo layout
import { useRouter } from 'next/router';
import { FaChartLine, FaBriefcase, FaUser, FaLightbulb, FaRocket } from 'react-icons/fa'; // Se añadió FaRocket

// Importar el widget del chatbot
import ChatbotWidget from '../components/ChatbotWidget';

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Función para manejar la navegación a rutas protegidas
  const handleProtectedLink = (path: string) => {
    if (!user) {
      router.push('/login'); // Redirige al login si el usuario no está autenticado
    } else {
      router.push(path); // Navega a la ruta si el usuario está autenticado
    }
  };

  return (
    <HomePageLayout> {/* Usamos el nuevo layout que incluye la barra de anuncios */}
      {/* Hero Section - Sección principal de bienvenida */}
      <section className="relative bg-blue-700 text-white py-28 md:py-40 text-center overflow-hidden shadow-md">
        <div className="max-w-6xl mx-auto relative z-10 px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-up">
            MentorApp: Tu Plataforma para la <span className="text-blue-200">Innovación Empresarial</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto opacity-90 animate-fade-in animation-delay-300">
            Conecta con una red de expertos globales, accede a herramientas estratégicas y desbloquea el potencial de crecimiento de tu proyecto.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={() => router.push(user ? '/dashboard/inicio' : '/register')}
              className="bg-white text-blue-700 px-12 py-5 rounded-md text-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75"
            >
              {user ? 'Acceder a mi Panel' : 'Comienza Gratis'}
            </button>
            <Link href="/about"
              className="bg-transparent border-2 border-white text-white px-12 py-5 rounded-md text-xl font-bold hover:bg-white hover:text-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-75"
            >
              Conoce Nuestra Propuesta
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de Propuesta de Valor */}
      <section className="py-20 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Potencia tu Proyecto con Expertos</h2>
          <p className="text-lg md:text-xl mb-16 max-w-3xl mx-auto text-gray-600">
            En MentorApp, te ofrecemos una suite de soluciones integrales para cada fase de tu desarrollo empresarial, desde la ideación hasta la expansión global.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center p-8 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <FaChartLine className="text-6xl text-blue-500 mb-6" />
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Análisis Estratégico</h3>
              <p className="text-gray-600 text-center leading-relaxed">Diagnostica con precisión tu negocio e identifica oportunidades clave para un crecimiento sostenido.</p>
            </div>
            <div className="flex flex-col items-center p-8 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <FaBriefcase className="text-6xl text-blue-500 mb-6" />
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Mentoría de Alto Impacto</h3>
              <p className="text-gray-600 text-center leading-relaxed">Recibe acompañamiento personalizado de líderes sectoriales para superar retos y alcanzar tus metas.</p>
            </div>
            <div className="flex flex-col items-center p-8 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <FaLightbulb className="text-6xl text-blue-500 mb-6" />
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Capacitación Especializada</h3>
              <p className="text-gray-600 text-center leading-relaxed">Accede a una biblioteca de cursos y recursos para desarrollar habilidades críticas y mantener tu ventaja competitiva.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Diagnósticos Estratégicos */}
      <section className="py-20 bg-blue-50 text-gray-800 shadow-inner">
        <div className="max-w-6xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Diagnósticos para la Toma de Decisiones</h2>
          <p className="text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Herramientas robustas para evaluar la salud de tu negocio, identificar áreas de mejora y fundamentar tus estrategias de crecimiento.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center border border-blue-100">
              <FaChartLine className="text-7xl text-blue-600 mb-8" />
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Análisis Fundacional</h3>
              <p className="text-gray-600 mb-10 text-center leading-relaxed text-lg">
                Ideal para **startups y PYMES**. Evalúa la infraestructura y el potencial de mercado para una base sólida.
              </p>
              <button
                onClick={() => handleProtectedLink('/dashboard/diagnostico/basico')}
                className="bg-blue-600 text-white px-10 py-4 rounded-md text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75 w-full md:w-auto"
              >
                Inicia tu Evaluación
              </button>
            </div>
            <div className="bg-white p-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center border border-blue-100">
              <FaBriefcase className="text-7xl text-blue-600 mb-8" />
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Diagnóstico Corporativo Avanzado</h3>
              <p className="text-gray-600 mb-10 text-center leading-relaxed text-lg">
                Diseñado para **empresas en expansión**. Optimiza procesos, diversifica mercados y maximiza la rentabilidad.
              </p>
              <button
                onClick={() => handleProtectedLink('/dashboard/diagnostico/empresarial')}
                className="bg-blue-600 text-white px-10 py-4 rounded-md text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75 w-full md:w-auto"
              >
                Accede al Diagnóstico Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Aceleración y Desarrollo */}
      <section className="py-20 bg-white text-gray-800 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Acelera tu Desarrollo Profesional</h2>
          <p className="text-lg md:text-xl mb-12 text-gray-600">
            Conecta con una élite de mentores y sumérgete en programas de formación de vanguardia diseñados para catapultar tu carrera y tu negocio.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={() => handleProtectedLink('/dashboard/asesoria')}
              className="bg-blue-600 text-white px-10 py-4 rounded-md text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75"
            >
              <FaUser className="inline-block mr-3 text-xl" /> Solicitar Mentoría
            </button>
            <button
              onClick={() => handleProtectedLink('/dashboard/cursos')}
              className="bg-blue-600 text-white px-10 py-4 rounded-md text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75"
            >
              <FaRocket className="inline-block mr-3 text-xl" /> Explorar Programas
            </button>
          </div>
        </div>
      </section>

      {/* Sección de Ecosistema de Oportunidades */}
      <section className="py-20 bg-blue-50 text-gray-800">
        <div className="max-w-6xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">El Ecosistema Comercial de MentorApp</h2>
          <p className="text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Un dinámico marketplace donde empresas y emprendedores convergen para ofrecer y encontrar servicios estratégicos, productos innovadores y alianzas de valor.
          </p>
          <button
            onClick={() => handleProtectedLink('/dashboard/marketplace')}
            className="bg-blue-600 text-white px-12 py-5 rounded-md text-xl font-bold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75"
          >
            Descubre Oportunidades
          </button>
        </div>
      </section>

      {/* Renderiza el ChatbotWidget flotante en la esquina inferior derecha */}
      <ChatbotWidget />
    </HomePageLayout>
  );
};

export default Home;