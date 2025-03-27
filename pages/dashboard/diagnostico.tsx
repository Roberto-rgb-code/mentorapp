// pages/dashboard/diagnostico.tsx
import { useRouter } from 'next/router';
import PrivateLayout from '../../components/layout/PrivateLayout';

const Diagnostico = () => {
  const router = useRouter();

  const handleSelectDiagnostico = (type: string) => {
    router.push(`/dashboard/diagnostico/${type}`);
  };

  return (
    <PrivateLayout>
      <h1 className="text-3xl font-bold text-gray-800">Diagnóstico</h1>
      <p className="mt-4 text-gray-600">Elige el tipo de diagnóstico que deseas realizar.</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-50 transition"
          onClick={() => handleSelectDiagnostico('basico')}
        >
          <h2 className="text-2xl font-bold text-gray-800">Diagnóstico Básico</h2>
          <p className="mt-2 text-gray-600">Ideal para emprendedores que están comenzando.</p>
        </div>
        <div
          className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-50 transition"
          onClick={() => handleSelectDiagnostico('empresarial')}
        >
          <h2 className="text-2xl font-bold text-gray-800">Diagnóstico Empresarial</h2>
          <p className="mt-2 text-gray-600">Para empresas establecidas que buscan crecer.</p>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Diagnostico;