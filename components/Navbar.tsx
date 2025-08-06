// components/Navbar.tsx
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth'; // Usando alias @/
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaUserCircle, FaSignOutAlt, FaCog, FaBars, FaTimes, FaDollarSign } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    console.log("Navbar: Click en Cerrar Sesión. Iniciando proceso de logout.");
    setDropdownOpen(false);
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente.');
      console.log("Navbar: Sesión cerrada, redirigiendo a /login");
      router.push('/login');
    } catch (error) {
      console.error('Navbar: Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión. Inténtalo de nuevo.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Clases para enlaces de navegación principales con efecto de subrayado
  const navLinkClasses = (href: string) =>
    `relative block px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out
    ${
      router.pathname === href
        ? 'text-white bg-blue-600 shadow-inner' // Enlace activo
        : 'text-blue-100 hover:text-white group' // Enlace inactivo con grupo para hover
    }
    transform hover:scale-105`;

  // Estilo para el subrayado animado en hover
  const underlineHoverEffect = `
    .group:after {
      content: '';
      position: absolute;
      width: 0%;
      height: 2px;
      display: block;
      margin-top: 5px;
      right: 0;
      background: #fff;
      transition: width 0.3s ease;
    }
    .group:hover:after {
      width: 100%;
      left: 0;
      background: #fff;
    }
    .group:hover {
      background-color: rgba(255, 255, 255, 0.1); /* Fondo sutil en hover */
      border-radius: 0.5rem;
    }
  `;

  // Estilos de botón Uiverse para "Iniciar Sesión" y "Empezar Aquí"
  const uiverseButtonPublic = `
    .uiverse-button {
      position: relative;
      background-color: #ffffff;
      padding: 0.75rem 1.5rem;
      border-radius: 9999px; /* Fully rounded */
      font-size: 0.875rem; /* text-sm */
      font-weight: 600; /* font-semibold */
      color: #2563eb; /* blue-600 */
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      border: none;
    }

    .uiverse-button:hover {
      background-color: #eff6ff; /* blue-50 */
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
    }

    .uiverse-button.primary {
      background-color: #2563eb; /* blue-600 */
      color: #ffffff;
    }

    .uiverse-button.primary:hover {
      background-color: #1d4ed8; /* blue-700 */
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
    }
  `;


  const getUserDisplayName = () => {
    if (user && user.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user && user.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  if (loading) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-blue-700 shadow-xl relative z-50 font-inter">
      <style jsx>{`
        ${underlineHoverEffect}
        ${uiverseButtonPublic}
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-white text-3xl font-extrabold tracking-tight hover:text-blue-100 transition-colors duration-200">
                MentorApp
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4">
            {user ? (
              <>
                <Link href="/dashboard/inicio" className={navLinkClasses("/dashboard/inicio")}>Inicio</Link>
                <Link href="/dashboard/mentoria" className={navLinkClasses("/dashboard/mentoria")}>Mentoría</Link>
                <Link href="/dashboard/cursos" className={navLinkClasses("/dashboard/cursos")}>Cursos</Link>
                <Link href="/dashboard/marketplace" className={navLinkClasses("/dashboard/marketplace")}>Marketplace</Link>
                <Link href="/plans" className={navLinkClasses("/plans")}>Planes y Paquetes</Link>
                <Link href="/dashboard/ayuda" className={navLinkClasses("/dashboard/ayuda")}>Ayuda</Link>
                <Link href="/dashboard/diagnostico" className={navLinkClasses("/dashboard/diagnostico")}>Diagnóstico</Link>
                <Link href="/dashboard/pagos" className={navLinkClasses("/dashboard/pagos")}>Pagos</Link> {/* Movido al final */}

                <div className="relative group" ref={dropdownRef}>
                  <button
                    className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    disabled={isLoggingOut}
                  >
                    <FaUserCircle className="mr-2" /> Hola, {getUserDisplayName()}
                    <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-300 ease-in-out transform scale-100 origin-top-right z-50">
                      <Link href="/perfil" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-200" onClick={() => setDropdownOpen(false)}>
                        <FaCog className="mr-2" /> Mi Perfil
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-200"
                        disabled={isLoggingOut}
                      >
                        <FaSignOutAlt className="mr-2" /> {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/" className={navLinkClasses("/")}>Inicio</Link>
                <Link href="/services" className={navLinkClasses("/services")}>Servicios</Link>
                <Link href="/community" className={navLinkClasses("/community")}>Comunidad</Link>

                <button
                  onClick={() => router.push('/login')}
                  className="uiverse-button"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="uiverse-button primary"
                >
                  Empezar Aquí
                </button>
              </>
            )}
          </div>

          <div className="-mr-2 flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen ? 'true' : 'false'}
            >
              <span className="sr-only">Abrir menú principal</span>
              {!mobileMenuOpen ? (
                <FaBars className="block h-6 w-6" />
              ) : (
                <FaTimes className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden absolute top-0 left-0 w-full h-screen bg-blue-700 bg-opacity-95 flex flex-col items-center justify-center space-y-8 z-40">
          <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 text-white focus:outline-none">
            <FaTimes size={30} />
          </button>

          {user ? (
            <>
              <Link href="/dashboard/inicio" className="text-white text-3xl font-bold hover:text-blue-200 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
              <Link href="/dashboard/mentoria" className="text-white text-3xl font-bold hover:text-blue-200 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Mentoría</Link>
              <Link href="/dashboard/cursos" className="text-white text-3xl font-bold hover:text-blue-200 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Cursos</Link>
              <Link href="/dashboard/marketplace" className="text-white text-3xl font-bold hover:text-blue-200 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Marketplace</Link>
              <Link href="/plans" className="text-white text-3xl font-bold hover:text-blue-200 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Planes y Paquetes</Link>
              <Link href="/dashboard/ayuda" className="text-white text-3xl font-bold hover:text-blue-200 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Ayuda</Link>
              <Link href="/dashboard/diagnostico" className="text-white text-3xl font-bold hover:text-blue-200 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Mi Diagnóstico</Link>
              <Link href="/dashboard/pagos" className="text-white text-3xl font-bold hover:text-blue-200 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Pagos</Link>
              <div className="border-t border-blue-500 w-2/3 my-4"></div>
              <Link href="/perfil" className="text-white text-3xl font-bold hover:text-blue-200 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Mi Perfil</Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold text-xl hover:bg-red-700 transition-colors duration-200 shadow-lg"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Cerrando...
                  </div>
                ) : (
                  "Cerrar Sesión"
                )}
              </button>
            </>
          ) : (
            <>
              <Link href="/" className="text-white text-3xl font-bold hover:text-blue-200 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
              <Link href="/services" className="text-white text-3xl font-bold hover:text-blue-200 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Servicios</Link>
              <Link href="/community" className="text-white text-3xl font-bold hover:text-blue-200 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Comunidad</Link>
              <div className="border-t border-blue-500 w-2/3 my-4"></div>
              <button
                onClick={() => { router.push('/login'); setMobileMenuOpen(false); }}
                className="uiverse-button"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => { router.push('/register'); setMobileMenuOpen(false); }}
                className="uiverse-button primary"
              >
                Empezar Aquí
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
