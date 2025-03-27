// pages/dashboard/inicio.tsx
import PrivateLayout from '../../components/layout/PrivateLayout';
import ProfileCarousel from '../../components/ProfileCarousel';

const Inicio = () => {
  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Bienvenido a MentorApp
        </h1>
        <p className="text-gray-600 mb-8">
          Aquí puedes encontrar mentores y emprendedores destacados para inspirarte.
        </p>
        <ProfileCarousel />
      </div>
    </PrivateLayout>
  );
};

export default Inicio;