import Link from 'next/link';
import { useAuth } from '../hooks/useAuth'; // Hook para manejar la autenticación
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase'; // Configuración de Firebase
import { useRouter } from 'next/router';

const Navbar = () => {
  const { user } = useAuth(); // Verifica si hay un usuario logueado
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cierra la sesión
      router.push('/login'); // Redirige al login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="text-2xl font-bold">
        <Link href="/">MentorApp</Link>
      </div>
      <div className="flex space-x-6 items-center">
        {/* Vistas públicas (siempre visibles) */}
        <Link href="/plans" className="hover:underline">Planes y Paquetes</Link>
        <Link href="/services" className="hover:underline">Servicios</Link>
        <Link href="/contact" className="hover:underline">Contacto</Link>

        {/* Si el usuario está logueado, muestra vistas privadas y botones */}
        {user && (
          <>
            <Link href="/dashboard/inicio" className="hover:underline">Inicio</Link>
            <Link href="/dashboard/diagnostico" className="hover:underline">Diagnóstico</Link>
            <Link href="/dashboard/asesoria" className="hover:underline">Asesoría</Link>
            <Link href="/dashboard/cursos" className="hover:underline">Cursos</Link>
            <Link href="/dashboard/marketplace" className="hover:underline">Marketplace</Link>
            <Link href="/perfil" className="hover:underline">Perfil</Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </>
        )}
        {/* Si no está logueado, muestra opciones de login/registro */}
        {!user && (
          <>
            <Link href="/login" className="hover:underline">Iniciar Sesión</Link>
            <Link href="/register" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100">
              Empezar Aquí
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;