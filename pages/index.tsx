import PublicLayout from '../components/layout/PublicLayout';
import Link from 'next/link';

const Home = () => {
  return (
    <PublicLayout>
      {/* Sección 1: Hero */}
      <section className="text-center py-20 bg-blue-100">
        <h1 className="text-5xl font-bold text-gray-800">Conecta con Mentores Expertos</h1>
        <p className="mt-4 text-xl text-gray-600">Impulsa tu negocio con la guía de profesionales experimentados.</p>
        <Link href="/register" className="mt-8 inline-block bg-blue-600 text-white px-8 py-4 rounded hover:bg-blue-700">
          Empezar Ahora
        </Link>
      </section>

      {/* Sección 2: Beneficios */}
      <section className="py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800">¿Por qué MentorApp?</h2>
          <p className="mt-4 text-lg text-gray-600">Descubre los beneficios de unirte a nuestra comunidad.</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800">Mentoría Personalizada</h3>
              <p className="mt-2 text-gray-600">Recibe consejos adaptados a tus necesidades específicas.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800">Red de Contactos</h3>
              <p className="mt-2 text-gray-600">Conéctate con otros emprendedores y mentores.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800">Recursos Exclusivos</h3>
              <p className="mt-2 text-gray-600">Accede a herramientas y guías para tu éxito.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 3: Testimonios */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800">Testimonios</h2>
          <p className="mt-4 text-lg text-gray-600">Escucha lo que dicen nuestros usuarios.</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-gray-600">"MentorApp transformó mi negocio. ¡Recomendado!"</p>
              <p className="mt-2 font-bold text-gray-800">- Juan Pérez, Emprendedor</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-gray-600">"La mentoría fue clave para mi éxito."</p>
              <p className="mt-2 font-bold text-gray-800">- María Gómez, CEO</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 4: Llamada a la Acción */}
      <section className="py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800">¿Listo para comenzar?</h2>
          <p className="mt-4 text-lg text-gray-600">Únete a MentorApp y lleva tu negocio al siguiente nivel.</p>
          <Link href="/register" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
            Regístrate Ahora
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;