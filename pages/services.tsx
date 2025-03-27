import PublicLayout from '../components/layout/PublicLayout';
import Link from 'next/link';

const Services = () => {
  return (
    <PublicLayout>
      {/* Sección 1: Hero */}
      <section className="text-center py-12 bg-blue-100">
        <h1 className="text-4xl font-bold text-gray-800">Nuestros Servicios</h1>
        <p className="mt-4 text-lg text-gray-600">Descubre cómo podemos ayudarte a crecer tu negocio con mentoría experta.</p>
      </section>

      {/* Sección 2: Servicios Destacados */}
      <section className="py-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800">Mentoría 1:1</h2>
            <p className="mt-4 text-gray-600">Conéctate con mentores experimentados para sesiones personalizadas.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800">Talleres en Grupo</h2>
            <p className="mt-4 text-gray-600">Participa en talleres interactivos con otros emprendedores.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800">Recursos Exclusivos</h2>
            <p className="mt-4 text-gray-600">Accede a guías, plantillas y herramientas para tu negocio.</p>
          </div>
        </div>
      </section>

      {/* Sección 3: Ventajas */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800">¿Por qué elegirnos?</h2>
          <p className="mt-4 text-lg text-gray-600">Nuestra plataforma ofrece la mejor experiencia de mentoría.</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800">Mentores Verificados</h3>
              <p className="mt-2 text-gray-600">Profesionales con experiencia comprobada.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800">Flexibilidad</h3>
              <p className="mt-2 text-gray-600">Elige el horario y formato que prefieras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 4: CTA */}
      <section className="py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800">¿Listo para empezar?</h2>
          <p className="mt-4 text-lg text-gray-600">Regístrate hoy y comienza tu viaje hacia el éxito.</p>
          <Link href="/register" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
            Empezar Ahora
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Services;