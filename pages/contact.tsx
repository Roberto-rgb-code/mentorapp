import PublicLayout from '../components/layout/PublicLayout';

const Contact = () => {
  return (
    <PublicLayout>
      {/* Sección 1: Hero */}
      <section className="text-center py-12 bg-blue-100">
        <h1 className="text-4xl font-bold text-gray-800">Contáctanos</h1>
        <p className="mt-4 text-lg text-gray-600">Estamos aquí para ayudarte. Usa el formulario o nuestros detalles de contacto.</p>
      </section>

      {/* Sección 2: Formulario y Detalles */}
      <section className="py-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Envíanos un Mensaje</h2>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700">Nombre</label>
                <input type="text" className="w-full p-2 border rounded" placeholder="Tu nombre" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Correo Electrónico</label>
                <input type="email" className="w-full p-2 border rounded" placeholder="tu@ejemplo.com" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Mensaje</label>
                <textarea className="w-full p-2 border rounded" rows={4} placeholder="¿En qué podemos ayudarte?"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                Enviar
              </button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalles de Contacto</h2>
            <p className="text-gray-600">Correo: soporte@mentorapp.com</p>
            <p className="text-gray-600">Teléfono: +52 123 456 7890</p>
            <p className="text-gray-600">Dirección: Calle Ejemplo 123, Ciudad, País</p>
          </div>
        </div>
      </section>

      {/* Sección 3: Redes Sociales */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800">Síguenos en Redes Sociales</h2>
          <div className="mt-4 space-x-4">
            <a href="#" className="text-blue-600 hover:underline">Facebook</a>
            <a href="#" className="text-blue-600 hover:underline">Twitter</a>
            <a href="#" className="text-blue-600 hover:underline">LinkedIn</a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;