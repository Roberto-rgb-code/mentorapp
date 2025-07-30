// components/Navbar.tsx
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth'; // Usando alias @/
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-toastify'; // Importa toast para notificaciones

const Navbar = () => {
  const { user, logout } = useAuth(); // Obtén la función logout del contexto
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout(); // Llama a la función logout del AuthContext
      toast.success('Sesión cerrada exitosamente.'); // Notificación de éxito
      router.push('/login');
      setIsOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión. Inténtalo de nuevo.'); // Notificación de error
    }
  };

  // Clases para enlaces de navegación principales
  const navLinkClasses = (href: string) =>
    `relative block px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out
    ${
      router.pathname === href
        ? 'bg-blue-700 text-white shadow-inner' // Estilo para enlace activo
        : 'text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-md' // Estilo para enlace inactivo
    }
    transform hover:scale-105`; // Efecto de escala al pasar el ratón

  // Clases para botones en el menú móvil
  const navButtonClasses = (isPrimary = false) =>
    `w-full text-center px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 shadow-md
    ${
      isPrimary
        ? 'bg-white text-blue-600 hover:bg-blue-100'
        : 'bg-red-600 text-white hover:bg-red-700'
    }
    transform hover:scale-105`;

  const getUserDisplayName = () => {
    if (user && user.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user && user.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-xl relative z-50 font-inter"> {/* Fondo degradado y sombra más profunda */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center"> {/* Centrar verticalmente los ítems */}
          {/* Logo y nombre de la aplicación */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-white text-3xl font-extrabold tracking-tight hover:text-blue-100 transition-colors duration-200">
                MentorApp
            </Link>
          </div>

          {/* Enlaces de escritorio (visibles en pantallas medianas y grandes) */}
          <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4"> {/* Espaciado ajustado */}
            {user ? (
              <>
                <Link href="/dashboard/inicio" className={navLinkClasses("/dashboard/inicio")}>Inicio</Link>
                <Link href="/dashboard/asesoria" className={navLinkClasses("/dashboard/asesoria")}>Asesoría</Link>
                <Link href="/dashboard/cursos" className={navLinkClasses("/dashboard/cursos")}>Cursos</Link>
                <Link href="/dashboard/marketplace" className={navLinkClasses("/dashboard/marketplace")}>Marketplace</Link>
                <Link href="/plans" className={navLinkClasses("/plans")}>Paquetes</Link>
                <Link href="/services" className={navLinkClasses("/services")}>Servicios</Link>
                <Link href="/contact" className={navLinkClasses("/contact")}>Contacto</Link>
                {/* Ayuda AHORA SOLO PARA USUARIOS LOGUEADOS */}
                <Link href="/dashboard/ayuda" className={navLinkClasses("/dashboard/ayuda")}>Ayuda</Link>
                <Link href="/dashboard/diagnostico" className={navLinkClasses("/dashboard/diagnostico")}>Diagnóstico</Link>

                {/* Menú desplegable para Perfil y cerrar sesión */}
                <div className="relative group">
                  <button className="text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                    Hola, {getUserDisplayName()}
                    <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform scale-95 group-hover:scale-100 origin-top-right z-50">
                    <Link href="/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-200">Mi Perfil</Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-200">Cerrar Sesión</button>
                  </div>
                </div>
              </>
            ) : (
              // Enlaces para usuarios NO logueados (Ayuda ya no está aquí)
              <>
                <Link href="/plans" className={navLinkClasses("/plans")}>Planes y Paquetes</Link>
                <Link href="/services" className={navLinkClasses("/services")}>Servicios</Link>
                <Link href="/contact" className={navLinkClasses("/contact")}>Contacto</Link>
                {/* Puedes añadir un enlace a la página "Nosotros" aquí si quieres que sea visible públicamente */}
                <Link href="/nosotros" className={navLinkClasses("/nosotros")}>Nosotros</Link>

                <Link href="/login" className="text-white hover:text-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 bg-blue-700 hover:bg-blue-800 shadow-md">Iniciar Sesión</Link> {/* Botón de login destacado */}
                <Link href="/register" className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors duration-200 shadow-md">
                  Empezar Aquí
                </Link>
              </>
            )}
          </div>

          {/* Botón de menú móvil */}
          <div className="-mr-2 flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
              aria-controls="mobile-menu"
              aria-expanded={isOpen ? 'true' : 'false'}
            >
              <span className="sr-only">Abrir menú principal</span>
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

      {/* Menú móvil */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-blue-700`} id="mobile-menu"> {/* Fondo para el menú móvil */}
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user ? (
            <>
              <Link href="/dashboard/inicio" className={navLinkClasses("/dashboard/inicio")} onClick={() => setIsOpen(false)}>Inicio</Link>
              <Link href="/dashboard/asesoria" className={navLinkClasses("/dashboard/asesoria")} onClick={() => setIsOpen(false)}>Asesoría</Link>
              <Link href="/dashboard/cursos" className={navLinkClasses("/dashboard/cursos")} onClick={() => setIsOpen(false)}>Cursos</Link>
              <Link href="/dashboard/marketplace" className={navLinkClasses("/dashboard/marketplace")} onClick={() => setIsOpen(false)}>Marketplace</Link>
              <Link href="/plans" className={navLinkClasses("/plans")} onClick={() => setIsOpen(false)}>Paquetes</Link>
              <Link href="/services" className={navLinkClasses("/services")} onClick={() => setIsOpen(false)}>Servicios</Link>
              <Link href="/contact" className={navLinkClasses("/contact")} onClick={() => setIsOpen(false)}>Contacto</Link>
              {/* Ayuda AHORA SOLO PARA USUARIOS LOGUEADOS (en móvil) */}
              <Link href="/dashboard/ayuda" className={navLinkClasses("/dashboard/ayuda")} onClick={() => setIsOpen(false)}>Ayuda</Link>
              <Link href="/dashboard/diagnostico" className={navLinkClasses("/dashboard/diagnostico")} onClick={() => setIsOpen(false)}>Mi Diagnóstico</Link>
              <div className="border-t border-blue-600 my-2"></div> {/* Separador más oscuro */}
              <Link href="/perfil" className={navLinkClasses("/perfil")} onClick={() => setIsOpen(false)}>Mi Perfil</Link>
              <button onClick={handleLogout} className={navButtonClasses()}>Cerrar Sesión</button>
            </>
          ) : (
            // Enlaces para usuarios NO logueados (Ayuda ya no está aquí en móvil)
            <>
              <Link href="/plans" className={navLinkClasses("/plans")} onClick={() => setIsOpen(false)}>Planes y Paquetes</Link>
              <Link href="/services" className={navLinkClasses("/services")} onClick={() => setIsOpen(false)}>Servicios</Link>
              <Link href="/contact" className={navLinkClasses("/contact")} onClick={() => setIsOpen(false)}>Contacto</Link>
              <Link href="/nosotros" className={navLinkClasses("/nosotros")} onClick={() => setIsOpen(false)}>Nosotros</Link> {/* Agregado también para móvil */}
              <div className="border-t border-blue-600 my-2"></div> {/* Separador más oscuro */}
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
