// pages/perfil.tsx
import { useAuth } from '../hooks/useAuth'; // Asegúrate de que este hook esté disponible
import PrivateLayout from '../components/layout/PrivateLayout'; // Un layout privado para usuarios autenticados

const Perfil = () => {
  const { user } = useAuth(); // Obtenemos la información del usuario autenticado

  // Si no hay usuario autenticado, mostramos un mensaje
  if (!user) {
    return <div>Debes iniciar sesión para ver tu perfil.</div>;
  }

  // Si hay usuario, mostramos su información
  return (
    <PrivateLayout>
      <h1 className="text-3xl font-bold text-gray-800">Perfil de Usuario</h1>
      <div className="mt-4">
        <p><strong>Nombre:</strong> {user.displayName || 'No especificado'}</p>
        <p><strong>Correo electrónico:</strong> {user.email}</p>
        {/* Puedes agregar más campos según la información que tengas */}
      </div>
    </PrivateLayout>
  );
};

export default Perfil;