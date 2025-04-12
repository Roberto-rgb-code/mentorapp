// components/layout/PrivateLayout.tsx
import Navbar from '../Navbar';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-6">{children}</main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        © 2023 MentorApp
      </footer>
    </div>
  );
};

export default PrivateLayout;