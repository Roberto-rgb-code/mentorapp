// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth'; // Importa signOut y User como FirebaseUser
import { auth } from '../lib/firebase'; // Asegúrate de que la ruta a tu archivo firebase.ts sea correcta

// Define la interfaz para el objeto de usuario que tu hook devolverá
interface User {
  uid: string; // Firebase User ID
  displayName: string | null;
  email: string | null;
  // Puedes añadir otros campos que necesites de tu usuario
}

// Define la interfaz para el valor del contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>; // Función para cerrar sesión
}

// Crea el contexto con un valor por defecto que incluye una función logout vacía (para evitar errores al inicio)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define las props para el proveedor del contexto
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext: Configurando listener de estado de autenticación de Firebase.");
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        console.log("AuthContext: Usuario detectado:", firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
        });
      } else {
        console.log("AuthContext: Ningún usuario detectado.");
        setUser(null);
      }
      setLoading(false); // La carga inicial del estado de autenticación ha terminado
    });

    // Limpia la suscripción cuando el componente se desmonte
    return () => {
      console.log("AuthContext: Limpiando listener de estado de autenticación.");
      unsubscribe();
    };
  }, []); // El array de dependencias vacío asegura que este efecto se ejecute solo una vez al montar el componente

  // Implementación de la función logout
  const logout = async () => {
    console.log("AuthContext: Intentando cerrar sesión de Firebase (signOut).");
    try {
      await signOut(auth);
      // Firebase onAuthStateChanged se encargará de actualizar el estado 'user' a null automáticamente
      console.log("AuthContext: Cierre de sesión exitoso en Firebase.");
      // No redirigimos aquí, dejamos que el componente que llama (Navbar) lo haga si es necesario
    } catch (error) {
      console.error("AuthContext: Error al cerrar sesión:", error);
      throw error; // Propaga el error para que el componente que llama lo maneje (ej. Navbar)
    }
  };

  // El valor que se proporcionará a los componentes que usen este contexto
  const contextValue: AuthContextType = {
    user,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
