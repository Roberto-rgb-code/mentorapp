// pages/dashboard/diagnostico.tsx
import { useRouter } from 'next/router';
import PrivateLayout from '../../components/layout/PrivateLayout';
import { FaUserTie, FaBuilding } from 'react-icons/fa'; // Importa iconos de react-icons

const Diagnostico = () => {
  const router = useRouter();

  const handleSelectDiagnostico = (type: string) => {
    router.push(`/dashboard/diagnostico/${type}`);
  };

  return (
    <PrivateLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">
          Elige tu <span className="text-blue-600">Diagnóstico</span>
        </h1>
        <p className="mt-2 text-lg text-gray-700 text-center max-w-2xl mb-12">
          Selecciona el diagnóstico que mejor se adapte a tus necesidades para empezar a potenciar tu emprendimiento o empresa.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl w-full">
          {/* Tarjeta de Diagnóstico Básico */}
          <div
            className="flex flex-col items-center p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer
                       bg-gradient-to-br from-blue-500 to-blue-700 text-white"
            onClick={() => handleSelectDiagnostico('basico')}
            role="button" // Para accesibilidad
            tabIndex={0} // Para accesibilidad
            aria-label="Seleccionar Diagnóstico Básico para emprendedores"
          >
            <FaUserTie className="text-6xl mb-6 text-blue-200" /> {/* Ícono */}
            <h2 className="text-3xl font-bold mb-3 text-center">Diagnóstico <span className="underline">Emprendedor</span></h2>
            <p className="text-lg text-center opacity-90 mb-6">
              **Ideal para quienes inician.** Evalúa tu idea, fortalezas y áreas de oportunidad clave como emprendedor.
            </p>
            <button className="mt-4 px-8 py-3 bg-white text-blue-700 font-semibold rounded-full shadow-md hover:bg-blue-100 transition-colors duration-200">
              Empezar Aquí
            </button>
          </div>

          {/* Tarjeta de Diagnóstico Empresarial */}
          <div
            className="flex flex-col items-center p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer
                       bg-gradient-to-br from-purple-500 to-purple-700 text-white"
            onClick={() => handleSelectDiagnostico('empresarial')}
            role="button" // Para accesibilidad
            tabIndex={0} // Para accesibilidad
            aria-label="Seleccionar Diagnóstico Empresarial para empresas establecidas"
          >
            <FaBuilding className="text-6xl mb-6 text-purple-200" /> {/* Ícono */}
            <h2 className="text-3xl font-bold mb-3 text-center">Diagnóstico <span className="underline">Empresarial</span></h2>
            <p className="text-lg text-center opacity-90 mb-6">
              **Para empresas en crecimiento.** Analiza procesos, finanzas, marketing y escalabilidad.
            </p>
            <button className="mt-4 px-8 py-3 bg-white text-purple-700 font-semibold rounded-full shadow-md hover:bg-purple-100 transition-colors duration-200">
              Comenzar Ahora
            </button>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Diagnostico;