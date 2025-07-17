import PublicLayout from '../components/layout/PublicLayout';
import Link from 'next/link';

const Contact = () => {
  return (
    <PublicLayout>
      {/* Sección 1: Hero mejorada */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
          ¡Hablemos!
        </h1>
        <p className="mt-4 text-xl max-w-2xl mx-auto opacity-90">
          Ya sea que tengas una pregunta, quieras saber más sobre nuestros servicios, o simplemente saludar, estamos listos para ayudarte.
        </p>
      </section>

      {/* Sección 2: Formulario y Detalles con diseño mejorado */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Columna del Formulario */}
            <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 animate-fade-in-up">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">Envíanos un Mensaje</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 text-lg font-medium mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                    placeholder="Escribe tu nombre aquí"
                    aria-label="Tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 text-lg font-medium mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                    placeholder="tu@ejemplo.com"
                    aria-label="Tu correo electrónico"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-gray-700 text-lg font-medium mb-2">Mensaje</label>
                  <textarea
                    id="message"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                    rows={6}
                    placeholder="¿Cómo podemos ayudarte hoy?"
                    aria-label="Tu mensaje"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-700 text-white py-3 rounded-lg text-xl font-semibold hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>

            {/* Columna de Detalles de Contacto */}
            <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 animate-fade-in-up delay-200">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">Información de Contacto</h2>
              <div className="space-y-6 text-lg text-gray-700">
                <div className="flex items-center">
                  <span className="text-blue-600 mr-4 text-3xl">📧</span> {/* Icono de correo */}
                  <div>
                    <h3 className="font-semibold">Correo Electrónico</h3>
                    <a href="mailto:soporte@mentorapp.com" className="text-blue-600 hover:underline">soporte@mentorapp.com</a>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-600 mr-4 text-3xl">📞</span> {/* Icono de teléfono */}
                  <div>
                    <h3 className="font-semibold">Teléfono</h3>
                    <a href="tel:+521234567890" className="text-blue-600 hover:underline">+52 123 456 7890</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-4 text-3xl">📍</span> {/* Icono de ubicación */}
                  <div>
                    <h3 className="font-semibold">Nuestra Oficina</h3>
                    <p>Calle Ejemplo 123, Colonia Centro</p>
                    <p>Tlaquepaque, Jalisco, México</p>
                  </div>
                </div>
              </div>

              {/* Mapa de Google Maps (Iframe) */}
              <div className="mt-10 rounded-lg overflow-hidden shadow-md">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.910815197022!2d-103.3240212!3d20.6321946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8428b2b7b5c8f8d9%3A0x6b1d8e1c6b1d8e1c!2sTlaquepaque%2C%20Jalisco%2C%20Mexico!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus" // Reemplaza con la dirección real y genera un iframe de Google Maps
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  aria-label="Ubicación de nuestra oficina en Google Maps"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 3: Redes Sociales mejorada */}
      <section className="py-16 bg-blue-700 text-white text-center shadow-inner">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Conéctate con Nosotros</h2>
          <p className="text-xl max-w-xl mx-auto mb-8 opacity-90">
            Síguenos en nuestras redes para mantenerte al día con las últimas noticias, consejos y recursos para tu emprendimiento.
          </p>
          <div className="flex justify-center space-x-6 text-4xl">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Facebook" className="hover:text-blue-200 transition-colors duration-300">
              {/* Reemplaza con iconos SVG o de una librería (ej. Font Awesome, Heroicons) */}
              📘
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Twitter" className="hover:text-blue-200 transition-colors duration-300">
              🐦
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en LinkedIn" className="hover:text-blue-200 transition-colors duration-300">
              👔
            </a>
            {/* Agrega más redes sociales si es necesario */}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;