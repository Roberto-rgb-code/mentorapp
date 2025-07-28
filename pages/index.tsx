// pages/index.tsx
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import HomePageLayout from '../components/layout/HomePageLayout';
import { useRouter } from 'next/router';
import { FaChartLine, FaBriefcase, FaUser, FaLightbulb, FaRocket } from 'react-icons/fa';

import ChatbotWidget from '../components/ChatbotWidget';

// IMPORTACIONES NECESARIAS PARA PARTICLESBACKGROUND EMBEBIDAS DIRECTAMENTE
import React, { useCallback, useMemo, useEffect } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

// Importaciones de todos los presets que vamos a usar
import { loadConfettiPreset } from 'tsparticles-preset-confetti';
import { loadFireworksPreset } from 'tsparticles-preset-fireworks';
import { loadBubblesPreset } from 'tsparticles-preset-bubbles';
import { loadStarsPreset } from 'tsparticles-preset-stars';
import { loadLinksPreset } from 'tsparticles-preset-links';
import { loadSnowPreset } from 'tsparticles-preset-snow';

import dynamic from 'next/dynamic';

// ======================================================================================
// COMPONENTE GENÉRICO DE PARTÍCULAS
// ======================================================================================
const ClientSideParticlesBackground = ({ options, id }: { options: any; id: string }) => {
  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
    if (id.includes("confetti")) await loadConfettiPreset(engine);
    else if (id.includes("fireworks")) await loadFireworksPreset(engine);
    else if (id.includes("bubbles")) await loadBubblesPreset(engine);
    else if (id.includes("stars")) await loadStarsPreset(engine);
    else if (id.includes("links")) await loadLinksPreset(engine);
    else if (id.includes("snow")) await loadSnowPreset(engine);
  }, [id]);

  const particlesLoaded = useCallback(async (container: any) => { }, [id]);

  useEffect(() => {
    console.log(`ClientSideParticlesBackground component mounted for ID: ${id}`);
    return () => console.log(`ClientSideParticlesBackground component unmounted for ID: ${id}`);
  }, [id]);

  return (
    <Particles
      id={id}
      init={particlesInit}
      loaded={particlesLoaded}
      options={options}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

// ======================================================================================
// DEFINICIONES DE OPCIONES DE PARTÍCULAS (CON MEJORAS EN COLORES Y ANIMACIONES)
// ======================================================================================

const BLUE_DARK = "#0A1F40";
const BLUE_MEDIUM = "#1E40AF";
const BLUE_LIGHT = "#ADD8E6";
const BLUE_ACCENT = "#4682B4";
const BLUE_VERY_LIGHT = "#E0F2F7";

// 1. Estilo "Awesome Network" (Hero Section)
const getNetworkParticlesOptions = () => ({
  fullScreen: { enable: false },
  background: { color: { value: BLUE_DARK } },
  fpsLimit: 120,
  interactivity: {
    events: { onClick: { enable: true, mode: "push" }, onHover: { enable: true, mode: "grab", parallax: { enable: true, force: 60, smooth: 10 } }, resize: true },
    modes: { grab: { distance: 200, links: { opacity: 1 } }, push: { quantity: 4 }, repulse: { distance: 100, duration: 0.4 } },
  },
  particles: {
    color: { value: BLUE_LIGHT },
    links: { color: BLUE_ACCENT, distance: 150, enable: true, opacity: 0.6, width: 1, triangles: { enable: true, color: { value: BLUE_MEDIUM }, opacity: 0.05 } },
    collisions: { enable: true },
    move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: true, speed: 1, straight: false },
    number: { density: { enable: true, area: 800 }, value: 60 },
    opacity: { value: { min: 0.3, max: 0.7 }, animation: { enable: true, speed: 1, sync: false, startValue: "random", destroy: "none" } },
    shape: { type: "circle" },
    size: { value: { min: 1, max: 3 }, animation: { enable: true, speed: 20, sync: false, startValue: "random", destroy: "none" } },
  },
  detectRetina: true,
});

// 2. Estilo "Bubbles" (Sección de Propuesta de Valor)
const getBubblesParticlesOptions = () => ({
  preset: "bubbles",
  fullScreen: { enable: false },
  background: { color: { value: BLUE_VERY_LIGHT } },
  particles: {
    color: { value: BLUE_MEDIUM },
    size: { value: { min: 10, max: 30 }, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
    move: { enable: true, speed: 0.3, direction: "top", random: false, straight: true, out_mode: "out" },
    opacity: { value: { min: 0.3, max: 0.7 }, anim: { enable: true, speed: 0.5, opacity_min: 0.1, sync: false } },
    links: { enable: false },
  },
  interactivity: {
    events: { onHover: { enable: true, mode: "bubble" }, onClick: { enable: true, mode: "push" } },
    modes: { bubble: { distance: 150, size: 40, duration: 2, opacity: 0.8 } },
  },
});

// 3. Estilo "Stars" (Sección de Diagnósticos Estratégicos)
const getStarsParticlesOptions = () => ({
  preset: "stars",
  fullScreen: { enable: false },
  background: { color: { value: BLUE_DARK } },
  particles: {
    color: { value: BLUE_LIGHT },
    size: { value: { min: 1, max: 3 }, random: true, anim: { enable: true, speed: 5, size_min: 0.1, sync: false } },
    opacity: { value: { min: 0.7, max: 1 }, anim: { enable: true, speed: 1, opacity_min: 0.5, sync: false } },
    move: { enable: true, speed: 0.2, direction: "none", random: true, straight: false, out_mode: "out" },
  },
  interactivity: { events: { onHover: { enable: true, mode: "grab" }, onClick: { enable: true, mode: "push" } } },
});

// 4. Estilo "Fireworks" (Sección de Fuegos Artificiales)
const getFireworksParticlesOptions = () => ({
  preset: "fireworks",
  fullScreen: { enable: false, zIndex: -1 },
  background: { color: { value: BLUE_DARK } },
  particles: {
    number: { value: 0 },
    color: { value: [BLUE_LIGHT, BLUE_ACCENT, "#64B5F6"] },
    shape: { type: "circle" },
    opacity: { value: 1, anim: { enable: true, speed: 0.2, opacity_min: 0.1, sync: false } },
    size: { value: 5, random: true, anim: { enable: true, speed: 2, size_min: 0.5, sync: false } },
    links: { enable: false },
    move: { enable: true, speed: 1, random: true, out_mode: "destroy" },
  },
  interactivity: { events: { onClick: { enable: true, mode: "explode" } } },
});

// 5. Estilo "Links" (Sección de Aceleración y Desarrollo)
const getLinksParticlesOptions = () => ({
  preset: "links",
  fullScreen: { enable: false },
  background: { color: { value: BLUE_VERY_LIGHT } },
  particles: {
    color: { value: BLUE_MEDIUM },
    links: { color: BLUE_LIGHT, distance: 150, enable: true, opacity: 0.5, width: 1 },
    number: { density: { enable: true, area: 800 }, value: 40 },
    move: { enable: true, speed: 0.3, direction: "none", random: true, straight: false, out_mode: "out" },
    opacity: { value: 0.6 },
    size: { value: { min: 1, max: 3 } },
  },
  interactivity: { events: { onHover: { enable: true, mode: "grab" }, onClick: { enable: true, mode: "push" } } },
});

// 6. Estilo "Snow" (Sección de Ecosistema de Oportunidades)
const getSnowParticlesOptions = () => ({
  preset: "snow",
  fullScreen: { enable: false },
  background: { color: { value: BLUE_MEDIUM } },
  particles: {
    color: { value: BLUE_VERY_LIGHT },
    shape: { type: "circle" },
    size: { value: { min: 2, max: 6 }, random: true },
    move: { enable: true, speed: 0.5, direction: "down", random: true, straight: false, out_mode: "out", bounce: false },
    opacity: { value: { min: 0.6, max: 1 }, random: true },
    links: { enable: false },
  },
  interactivity: { events: { onHover: { enable: true, mode: "bubble" }, onClick: { enable: true, mode: "push" } }, modes: { bubble: { distance: 100, size: 8, duration: 2, opacity: 0.3 } } },
});


// ======================================================================================
// DYNAMIC IMPORTS PARA CADA INSTANCIA DE PARTÍCULAS
// ======================================================================================

const DynamicNetworkParticles = dynamic(() => Promise.resolve(() => <ClientSideParticlesBackground id="network-particles" options={getNetworkParticlesOptions()} />), { ssr: false });
const DynamicBubblesParticles = dynamic(() => Promise.resolve(() => <ClientSideParticlesBackground id="bubbles-particles" options={getBubblesParticlesOptions()} />), { ssr: false });
const DynamicStarsParticles = dynamic(() => Promise.resolve(() => <ClientSideParticlesBackground id="stars-particles" options={getStarsParticlesOptions()} />), { ssr: false });
const DynamicFireworksParticles = dynamic(() => Promise.resolve(() => <ClientSideParticlesBackground id="fireworks-particles" options={getFireworksParticlesOptions()} />), { ssr: false });
const DynamicLinksParticles = dynamic(() => Promise.resolve(() => <ClientSideParticlesBackground id="links-particles" options={getLinksParticlesOptions()} />), { ssr: false });
const DynamicSnowParticles = dynamic(() => Promise.resolve(() => <ClientSideParticlesBackground id="snow-particles" options={getSnowParticlesOptions()} />), { ssr: false });

// ======================================================================================
// COMPONENTE HOME PRINCIPAL (CON AJUSTES DE COLOR DE TEXTO Y FONDOS DE SECCIÓN)
// ======================================================================================
const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleProtectedLink = (path: string) => {
    if (!user) {
      router.push('/login');
    } else {
      router.push(path);
    }
  };

  return (
    <HomePageLayout>
      {/* Hero Section - "Awesome Network" */}
      <section className="relative text-white py-28 md:py-40 text-center overflow-hidden shadow-md" style={{ backgroundColor: BLUE_DARK }}>
        <DynamicNetworkParticles />
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

      {/* Sección de Propuesta de Valor - "Bubbles" */}
      <section className="relative py-20 text-gray-800 overflow-hidden" style={{ minHeight: '400px', backgroundColor: BLUE_VERY_LIGHT }}>
        <DynamicBubblesParticles />
        <div className="max-w-6xl mx-auto relative z-10 text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-blue-700">Potencia tu Proyecto con Expertos</h2>
          <p className="text-lg md:text-xl mb-16 max-w-3xl mx-auto text-blue-800">
            En MentorApp, te ofrecemos una suite de soluciones integrales para cada fase de tu desarrollo empresarial, desde la ideación hasta la expansión global.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
              <FaChartLine className="text-6xl text-blue-500 mb-6" />
              <h3 className="text-2xl font-semibold mb-4 text-blue-700">Análisis Estratégico</h3>
              <p className="text-gray-700 text-center leading-relaxed">Diagnostica con precisión tu negocio e identifica oportunidades clave para un crecimiento sostenido.</p>
            </div>
            <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
              <FaBriefcase className="text-6xl text-blue-500 mb-6" />
              <h3 className="text-2xl font-semibold mb-4 text-blue-700">Mentoría de Alto Impacto</h3>
              <p className="text-gray-700 text-center leading-relaxed">Recibe acompañamiento personalizado de líderes sectoriales para superar retos y alcanzar tus metas.</p>
            </div>
            <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
              <FaLightbulb className="text-6xl text-blue-500 mb-6" />
              <h3 className="text-2xl font-semibold mb-4 text-blue-700">Capacitación Especializada</h3>
              <p className="text-gray-700 text-center leading-relaxed">Accede a una biblioteca de cursos y recursos para desarrollar habilidades críticas y mantener tu ventaja competitiva.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Diagnósticos Estratégicos - "Stars" */}
      <section className="relative py-20 text-white shadow-inner overflow-hidden" style={{ minHeight: '500px', backgroundColor: BLUE_DARK }}>
        <DynamicStarsParticles />
        <div className="max-w-6xl mx-auto relative z-10 text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-blue-200">Diagnósticos para la Toma de Decisiones</h2>
          <p className="text-lg md:text-xl text-gray-300 mb-16 max-w-3xl mx-auto">
            Herramientas robustas para evaluar la salud de tu negocio, identificar áreas de mejora y fundamentar tus estrategias de crecimiento.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center border border-blue-100">
              <FaChartLine className="text-7xl text-blue-600 mb-8" />
              <h3 className="text-3xl font-bold text-blue-700 mb-4">Análisis Fundacional</h3>
              <p className="text-gray-700 mb-10 text-center leading-relaxed text-lg">
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
              <h3 className="text-3xl font-bold text-blue-700 mb-4">Diagnóstico Corporativo Avanzado</h3>
              <p className="text-gray-700 mb-10 text-center leading-relaxed text-lg">
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

      {/* Sección de Fuegos Artificiales - "Fireworks" */}
      <section className="relative text-white py-20 overflow-hidden shadow-md" style={{ minHeight: '500px', backgroundColor: BLUE_DARK }}>
        <DynamicFireworksParticles />
        <div className="max-w-6xl mx-auto relative z-10 px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-blue-200">¡Un Futuro Brillante te Espera!</h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Prepárate para un lanzamiento espectacular y deja tu marca en el mundo empresarial.
          </p>
          <button
            onClick={() => handleProtectedLink('/dashboard/inversiones')}
            className="mt-10 bg-blue-400 text-white px-10 py-4 rounded-md text-lg font-semibold hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75"
          >
            Explora Oportunidades
          </button>
        </div>
      </section>

      {/* Sección de Aceleración y Desarrollo - "Links" */}
      <section className="relative py-20 bg-white text-gray-800 text-center overflow-hidden" style={{ minHeight: '400px', backgroundColor: BLUE_VERY_LIGHT }}>
        <DynamicLinksParticles />
        <div className="max-w-4xl mx-auto relative z-10 px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-blue-700">Acelera tu Desarrollo Profesional</h2>
          <p className="text-lg md:text-xl mb-12 text-blue-800">
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

      {/* Sección de Ecosistema de Oportunidades - "Snow" */}
      <section className="relative py-20 text-gray-800 overflow-hidden" style={{ minHeight: '400px', backgroundColor: BLUE_MEDIUM }}>
        <DynamicSnowParticles />
        <div className="max-w-6xl mx-auto relative z-10 text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">El Ecosistema Comercial de MentorApp</h2>
          <p className="text-lg md:text-xl text-blue-100 mb-16 max-w-3xl mx-auto">
            Un dinámico marketplace donde empresas y emprendedores convergen para ofrecer y encontrar servicios estratégicos, productos innovadores y alianzas de valor.
          </p>
          <button
            onClick={() => handleProtectedLink('/dashboard/marketplace')}
            className="bg-blue-600 text-white px-12 py-5 rounded-md text-xl font-bold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md focus:outline-none focus:ring-4 focus://ring-blue-300 focus:ring-opacity-75"
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
