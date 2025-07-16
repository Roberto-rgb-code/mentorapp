// components/layout/HomePageLayout.tsx
import React from 'react';
import PublicLayout from './PublicLayout'; // Asegúrate de que esta ruta sea correcta
import Link from 'next/link';
import { FaBullhorn } from 'react-icons/fa';

interface HomePageLayoutProps {
  children: React.ReactNode;
}

const HomePageLayout: React.FC<HomePageLayoutProps> = ({ children }) => {
  return (
    <>
      {/* Announcement Bar - Barra de Anuncios */}
      <div className="bg-blue-800 text-white text-center py-3 px-4 text-sm md:text-base font-medium flex items-center justify-center">
        <FaBullhorn className="mr-2 text-lg" />
        <span>¡Nueva función! Accede a nuestros <Link href="/dashboard/webinars" className="underline hover:text-blue-200 transition-colors duration-200">webinars exclusivos</Link> para potenciar tu estrategia.</span>
      </div>
      {/* PublicLayout contiene el Navbar y el resto del contenido de la página */}
      <PublicLayout>
        {children}
      </PublicLayout>
    </>
  );
};

export default HomePageLayout;