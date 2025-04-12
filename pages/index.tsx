// pages/index.tsx
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import PublicLayout from '../components/layout/PublicLayout';
import { useRouter } from 'next/router';
import { useState } from 'react';

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ text: string; sender: string }[]>([
    { text: '¡Hola! Soy Grok, tu asistente en MentorApp. ¿En qué puedo ayudarte hoy? Puedo sugerirte servicios como asesorías, cursos, diagnósticos o el marketplace.', sender: 'assistant' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleProtectedLink = (path: string) => {
    if (!user) {
      router.push('/login');
    } else {
      router.push(path);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Agregar mensaje del usuario al chat
    const newMessage = { text: chatInput, sender: 'user' };
    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      // Hacer solicitud al backend del chatbot
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: chatInput, messages: chatMessages }),
      });

      const data = await response.json();
      if (response.ok) {
        // Agregar respuesta del chatbot al chat
        setChatMessages((prev) => [...prev, { text: data.reply, sender: 'assistant' }]);
      } else {
        setChatMessages((prev) => [...prev, { text: 'Lo siento, hubo un error al procesar tu mensaje.', sender: 'assistant' }]);
      }
    } catch (error) {
      setChatMessages((prev) => [...prev, { text: 'Error al conectar con el chatbot. Intenta de nuevo más tarde.', sender: 'assistant' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">Impulsa tu Negocio con MentorApp</h1>
          <p className="text-xl mb-8 animate-fade-in animation-delay-200">
            Conecta con mentores, accede a cursos y descubre oportunidades en nuestro marketplace.
          </p>
          <button
            onClick={() => router.push(user ? '/dashboard/inicio' : '/register')}
            className="bg-yellow-500 text-gray-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-400 transition transform hover:scale-105"
          >
            {user ? 'Ir al Dashboard' : 'Regístrate Ahora'}
          </button>
        </div>
        <div className="absolute inset-0 bg-blue-900 opacity-50"></div>
      </section>

      {/* Diagnósticos Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Evalúa tu Negocio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Diagnóstico Básico</h3>
              <p className="text-gray-600 mb-6">
                Ideal para emprendedores que están comenzando. Evalúa los fundamentos de tu negocio.
              </p>
              <button
                onClick={() => handleProtectedLink('/dashboard/diagnostico/basico')}
                className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
              >
                Realizar Diagnóstico
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Diagnóstico Empresarial</h3>
              <p className="text-gray-600 mb-6">
                Perfecto para empresas establecidas que buscan crecer y optimizar.
              </p>
              <button
                onClick={() => handleProtectedLink('/dashboard/diagnostico/empresarial')}
                className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
              >
                Realizar Diagnóstico
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Asesoría Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Conecta con Mentores Expertos</h2>
          <p className="text-gray-600 mb-6">
            Recibe asesoría personalizada de profesionales con experiencia en tu industria.
          </p>
          <button
            onClick={() => handleProtectedLink('/dashboard/asesoria')}
            className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition transform hover:scale-105"
          >
            Explorar Asesorías
          </button>
        </div>
      </section>

      {/* Cursos Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Aprende con Nuestros Cursos</h2>
          <p className="text-gray-600 mb-6">
            Mejora tus habilidades con cursos en línea diseñados para emprendedores y empresas.
          </p>
          <button
            onClick={() => handleProtectedLink('/dashboard/cursos')}
            className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition transform hover:scale-105"
          >
            Ver Cursos
          </button>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Descubre el Marketplace</h2>
          <p className="text-gray-600 mb-6">
            Un tianguis de consultores y empresas donde puedes encontrar servicios y oportunidades.
          </p>
          <button
            onClick={() => handleProtectedLink('/dashboard/marketplace')}
            className="bg-orange-600 text-white px-6 py-3 rounded-full hover:bg-orange-700 transition transform hover:scale-105"
          >
            Visitar Marketplace
          </button>
        </div>
      </section>

      {/* Chatbot Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            ¿No Sabes por Dónde Empezar? ¡Pregúntale a Grok!
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <div className="h-96 overflow-y-auto mb-4 p-4 border border-gray-200 rounded-lg">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <span
                    className={`inline-block p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.text}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="text-center text-gray-500">Cargando...</div>
              )}
            </div>
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Escribe tu mensaje aquí..."
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;