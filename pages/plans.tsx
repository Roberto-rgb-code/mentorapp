import PublicLayout from '../components/layout/PublicLayout';
import Link from 'next/link';

const Plans = () => {
  return (
    <PublicLayout>
      {/* Sección 1: Hero */}
      <section className="text-center py-12 bg-blue-100">
        <h1 className="text-4xl font-bold text-gray-800">Planes y Paquetes</h1>
        <p className="mt-4 text-lg text-gray-600">Elige el plan que mejor se adapte a tus necesidades.</p>
      </section>

      {/* Sección 2: Planes */}
      <section className="py-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-800">Básico</h2>
            <p className="mt-4 text-gray-600">Ideal para emprendedores nuevos.</p>
            <p className="mt-4 text-3xl font-bold text-blue-600">$29/mes</p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>Mentoría grupal</li>
              <li>Recursos básicos</li>
              <li>Soporte por correo</li>
            </ul>
            <Link href="/register" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
              Elegir Plan
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center border-2 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-800">Pro</h2>
            <p className="mt-4 text-gray-600">Para negocios en crecimiento.</p>
            <p className="mt-4 text-3xl font-bold text-blue-600">$59/mes</p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>Mentoría 1:1 (2 sesiones/mes)</li>
              <li>Talleres exclusivos</li>
              <li>Recursos avanzados</li>
            </ul>
            <Link href="/register" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
              Elegir Plan
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-800">Empresa</h2>
            <p className="mt-4 text-gray-600">Para empresas que quieren escalar.</p>
            <p className="mt-4 text-3xl font-bold text-blue-600">$99/mes</p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>Mentoría 1:1 ilimitada</li>
              <li>Todos los recursos</li>
              <li>Soporte prioritario</li>
            </ul>
            <Link href="/register" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
              Elegir Plan
            </Link>
          </div>
        </div>
      </section>

      {/* Sección 3: Consulta */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800">¿No estás seguro?</h2>
          <p className="mt-4 text-lg text-gray-600">Contáctanos para una consulta gratuita.</p>
          <Link href="/contact" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
            Contáctanos
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Plans;