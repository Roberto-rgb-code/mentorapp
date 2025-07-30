// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase'; // Asegúrate de que 'auth' se exporte correctamente desde firebase.ts
import { onAuthStateChanged, User, signOut } from 'firebase/auth'; // Importa signOut

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>; // Añade la función logout aquí
}

// Inicializa el contexto con un valor por defecto que incluye una función logout vacía
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {}, // Función vacía por defecto
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Implementación de la función logout
  const logout = async () => {
    try {
      await signOut(auth);
      // Firebase automáticamente actualizará el estado del usuario a null
      // a través del onAuthStateChanged listener.
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Aquí podrías usar react-toastify para mostrar un error al usuario
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
