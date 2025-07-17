// components/Navbar.tsx
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth'; // Asumo que este hook te da el 'user' de Firebase
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase'; // Asegúrate de que 'auth' esté correctamente inicializado aquí
import { useRouter } from 'next/router';
import { useState } from 'react';

const Navbar = () => {
  const { user } = useAuth(); // Obtiene el objeto de usuario de tu hook de autenticación
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar la visibilidad del menú móvil

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await signOut(auth); // Cierra la sesión del usuario en Firebase
      router.push('/login'); // Redirige al usuario a la página de inicio de sesión
      setIsOpen(false); // Cierra el menú móvil después de cerrar sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aquí podrías añadir una notificación al usuario (ej. con una librería de toast)
    }
  };

  // Clases CSS para los enlaces de navegación, aplicando estilo activo si la ruta coincide
  const navLinkClasses = (href: string) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
      router.pathname === href
        ? 'bg-blue-700 text-white' // Estilo para el enlace activo
        : 'text-blue-100 hover:bg-blue-700 hover:text-white' // Estilo normal y al pasar el ratón
    }`;

  // Clases CSS para los botones de navegación (usados en el menú móvil para "Cerrar Sesión" y "Empezar Aquí")
  const navButtonClasses = (isPrimary = false) =>
    `w-full text-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isPrimary
        ? 'bg-white text-blue-600 hover:bg-blue-100' // Estilo para el botón primario
        : 'bg-red-600 text-white hover:bg-red-700' // Estilo para el botón de cerrar sesión
    }`;

  // Función para obtener el nombre a mostrar del usuario
  const getUserDisplayName = () => {
    // 1. Prioridad: user.displayName (establecido durante el registro o actualización de perfil)
    if (user && user.displayName) {
      // Opcional: Mostrar solo el primer nombre (ej. "Kevin" de "Kevin Truiz")
      return user.displayName.split(' ')[0];
      // Si quieres el nombre completo como "Kevin Truiz": return user.displayName;
    }
    // 2. Segunda opción: Parte del email antes del @ (ej. "kevin.truiz" de "kevin.truiz@ejemplo.com")
    if (user && user.email) {
      return user.email.split('@')[0];
    }
    // 3. Fallback: "Usuario" genérico si no hay displayName ni email útil
    return 'Usuario';
  };

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y nombre de la aplicación */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-white text-2xl font-extrabold tracking-tight">
              MentorApp
            </Link>
          </div>

          {/* Enlaces de escritorio (visibles en pantallas medianas y grandes) */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              // Si el usuario está autenticado, muestra estos enlaces
              <>
                <Link href="/dashboard/inicio" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium">Inicio</Link>
                <Link href="/dashboard/asesoria" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium">Asesoría</Link>
                <Link href="/dashboard/cursos" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium">Cursos</Link>
                <Link href="/dashboard/marketplace" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium">Marketplace</Link>
                <Link href="/plans" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium">Paquetes</Link>
                <Link href="/services" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium">Servicios</Link>
                <Link href="/contact" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium">Contacto</Link>
                {/* Nuevo enlace para la vista "Ayuda" - visible para usuarios autenticados */}
                <Link href="/dashboard/ayuda" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium">Ayuda</Link>

                {/* Menú desplegable para Perfil y opciones de usuario */}
                <div className="relative group">
                  <button className="text-white bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    Hola, {getUserDisplayName()} {/* Muestra "Hola, [Nombre del Usuario]" */}
                    {/* Icono de flecha hacia abajo */}
                    <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {/* Contenido del menú desplegable */}
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link href="/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mi Perfil</Link>
                    {/* CONFIRMADO: "Mi Diagnóstico" está aquí, dentro del dropdown */}
                    <Link href="/dashboard/diagnostico" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mi Diagnóstico</Link>
                    <div className="border-t border-gray-100 my-1"></div> {/* Separador visual */}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Cerrar Sesión</button>
                  </div>
                </div>
              </>
            ) : (
              // Si el usuario NO está autenticado, muestra estos enlaces
              <div className="flex items-center space-x-4">
                <Link href="/plans" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium">Planes y Paquetes</Link>
                <Link href="/services" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium">Servicios</Link>
                <Link href="/contact" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium">Contacto</Link>
                {/* Nuevo enlace para la vista "Ayuda" - visible para usuarios NO autenticados */}
                <Link href="/ayuda" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium">Ayuda</Link>
                <Link href="/login" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium">Iniciar Sesión</Link>
                <Link href="/register" className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors duration-200">
                  Empezar Aquí
                </Link>
              </div>
            )}
          </div>

          {/* Botón de menú móvil (visible en pantallas pequeñas) */}
          <div className="-mr-2 flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)} // Alterna el estado del menú móvil
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isOpen ? 'true' : 'false'}
            >
              <span className="sr-only">Abrir menú principal</span>
              {/* Icono de hamburguesa o de cierre (X) según el estado del menú */}
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil (se muestra/oculta según el estado 'isOpen') */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user ? (
            // Enlaces para usuarios autenticados en el menú móvil
            <>
              <Link href="/dashboard/inicio" className={navLinkClasses("/dashboard/inicio")} onClick={() => setIsOpen(false)}>Inicio</Link>
              <Link href="/dashboard/asesoria" className={navLinkClasses("/dashboard/asesoria")} onClick={() => setIsOpen(false)}>Asesoría</Link>
              <Link href="/dashboard/cursos" className={navLinkClasses("/dashboard/cursos")} onClick={() => setIsOpen(false)}>Cursos</Link>
              <Link href="/dashboard/marketplace" className={navLinkClasses("/dashboard/marketplace")} onClick={() => setIsOpen(false)}>Marketplace</Link>
              <Link href="/plans" className={navLinkClasses("/plans")} onClick={() => setIsOpen(false)}>Paquetes</Link>
              <Link href="/services" className={navLinkClasses("/services")} onClick={() => setIsOpen(false)}>Servicios</Link>
              <Link href="/contact" className={navLinkClasses("/contact")} onClick={() => setIsOpen(false)}>Contacto</Link>
              {/* Nuevo enlace para la vista "Ayuda" - visible para usuarios autenticados */}
              <Link href="/dashboard/ayuda" className={navLinkClasses("/dashboard/ayuda")} onClick={() => setIsOpen(false)}>Ayuda</Link>
              <div className="border-t border-blue-700 my-2"></div> {/* Separador */}
              <Link href="/perfil" className={navLinkClasses("/perfil")} onClick={() => setIsOpen(false)}>Mi Perfil</Link>
              {/* CONFIRMADO: "Mi Diagnóstico" está aquí, dentro del menú móvil */}
              <Link href="/dashboard/diagnostico" className={navLinkClasses("/dashboard/diagnostico")} onClick={() => setIsOpen(false)}>Mi Diagnóstico</Link>
              <button onClick={handleLogout} className={navButtonClasses()}>Cerrar Sesión</button>
            </>
          ) : (
            // Enlaces para usuarios NO autenticados en el menú móvil
            <>
              <Link href="/plans" className={navLinkClasses("/plans")} onClick={() => setIsOpen(false)}>Planes y Paquetes</Link>
              <Link href="/services" className={navLinkClasses("/services")} onClick={() => setIsOpen(false)}>Servicios</Link>
              <Link href="/contact" className={navLinkClasses("/contact")} onClick={() => setIsOpen(false)}>Contacto</Link>
              {/* Nuevo enlace para la vista "Ayuda" - visible para usuarios NO autenticados */}
              <Link href="/ayuda" className={navLinkClasses("/ayuda")} onClick={() => setIsOpen(false)}>Ayuda</Link>
              <div className="border-t border-blue-700 my-2"></div> {/* Separador */}
              <Link href="/login" className={navLinkClasses("/login")} onClick={() => setIsOpen(false)}>Iniciar Sesión</Link>
              <Link href="/register" className={navButtonClasses(true)} onClick={() => setIsOpen(false)}>Empezar Aquí</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;