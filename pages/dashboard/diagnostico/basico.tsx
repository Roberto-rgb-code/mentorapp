// pages/dashboard/diagnostico/basico.tsx
import PrivateLayout from '../../../components/layout/PrivateLayout';

const DiagnosticoBasico = () => {
  return (
    <PrivateLayout>
      <h1 className="text-3xl font-bold text-gray-800">Diagnóstico Básico</h1>
      <p className="mt-4 text-gray-600">
        Aquí se mostrará el formulario o contenido para el diagnóstico básico.
      </p>
      {/* Puedes agregar más contenido aquí, como un formulario */}
    </PrivateLayout>
  );
};

export default DiagnosticoBasico;