// pages/nosotros.tsx
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const NosotrosPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-inter">
      <Head>
        <title>Nosotros - MentorApp</title>
        <meta name="description" content="Conoce más sobre MentorApp: Nuestra misión, visión y valores." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-grow">
        {/* Sección de Encabezado Principal */}
        <section className="relative py-20 px-4 md:px-8 bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {/* Patrón de fondo sutil */}
            <svg className="w-full h-full" fill="none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
              <pattern id="pattern-zigzag" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M4 0 L6 0 L6 10 L4 10 L4 0 Z M0 4 L0 6 L10 6 L10 4 L0 4 Z" fill="rgba(255,255,255,0.05)"/>
              </pattern>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-zigzag)"/>
            </svg>
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg animate-fade-in-down">
              Conoce MentorApp
            </h1>
            <p className="text-xl md:text-2xl font-light leading-relaxed opacity-90 animate-fade-in-up">
              Potenciando la innovación empresarial a través del conocimiento y la conexión.
            </p>
          </div>
        </section>

        {/* Sección de Misión, Visión, Valores */}
        <section className="py-16 px-4 md:px-8 bg-white">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Misión */}
            <div className="p-8 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <h2 className="text-3xl font-bold text-blue-800 mb-4">Nuestra Misión</h2>
              <p className="text-gray-700 leading-relaxed">
                Empoderar a emprendedores y empresas con las herramientas, conocimientos y conexiones necesarias para innovar, crecer y transformar sus ideas en realidades exitosas.
              </p>
            </div>
            {/* Visión */}
            <div className="p-8 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <h2 className="text-3xl font-bold text-blue-800 mb-4">Nuestra Visión</h2>
              <p className="text-gray-700 leading-relaxed">
                Ser la plataforma líder global en mentoría y recursos para la innovación empresarial, creando un ecosistema donde el aprendizaje continuo y la colaboración impulsen el desarrollo sostenible.
              </p>
            </div>
            {/* Valores */}
            <div className="p-8 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <h2 className="text-3xl font-bold text-blue-800 mb-4">Nuestros Valores</h2>
              <ul className="list-disc list-inside text-left text-gray-700 space-y-2">
                <li><span className="font-semibold text-blue-700">Innovación:</span> Búsqueda constante de nuevas soluciones.</li>
                <li><span className="font-semibold text-blue-700">Excelencia:</span> Compromiso con la calidad y el impacto.</li>
                <li><span className="font-semibold text-blue-700">Colaboración:</span> Creemos en el poder del trabajo en equipo.</li>
                <li><span className="font-semibold text-blue-700">Integridad:</span> Actuar con honestidad y transparencia.</li>
                <li><span className="font-semibold text-blue-700">Empoderamiento:</span> Fomentar el crecimiento personal y profesional.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sección de Quiénes Somos / Historia */}
        <section className="py-16 px-4 md:px-8 bg-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-6">¿Quiénes Somos?</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              MentorApp nació de la necesidad de cerrar la brecha entre el talento emprendedor y los recursos que pueden transformar una idea en un negocio próspero. Fundada en [Año de Fundación, ej., 2023], nuestra plataforma ha crecido para convertirse en un hub dinámico donde expertos de diversas industrias comparten su sabiduría, y los aspirantes a líderes empresariales encuentran el camino hacia el éxito.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Creemos firmemente que el acceso a mentoría de calidad, capacitación relevante y una red de contactos sólida son pilares fundamentales para la innovación en el mundo actual. En MentorApp, estamos comprometidos a ser ese puente.
            </p>
          </div>
        </section>

        {/* Sección de Llamada a la Acción (CTA) */}
        <section className="py-16 px-4 md:px-8 bg-gradient-to-tl from-purple-600 to-indigo-700 text-white text-center shadow-inner">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-extrabold mb-6">Únete a la Comunidad MentorApp</h2>
            <p className="text-xl leading-relaxed mb-8 opacity-90">
              Ya seas un emprendedor buscando orientación o un experto deseoso de compartir tu experiencia, MentorApp es tu lugar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/register" className="bg-white text-purple-700 px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                Empezar Ahora
              </Link>
              <Link href="/contact" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-white hover:text-purple-700 transition-all duration-300 transform hover:scale-105">
                Contáctanos
              </Link>
            </div>
          </div>
        </section>
      </main>
      {/* Ya no hay referencia al Footer aquí */}
    </div>
  );
};

export default NosotrosPage;