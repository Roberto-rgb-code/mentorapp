// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'; // Importa User de Firebase como FirebaseUser para evitar conflicto de nombres
import { auth } from '@/lib/firebase'; // Asegúrate de que tu instancia de 'auth' de Firebase esté correctamente exportada aquí

// Define la interfaz para el objeto de usuario que tu hook devolverá
// Esta es tu interfaz personalizada para el usuario de la aplicación.
interface User {
  id: string; // Aquí es donde mapearemos firebaseUser.uid
  name: string; // Nombre a mostrar del usuario (displayName o parte del email)
  email: string | null;
  // Puedes añadir otros campos que necesites de tu usuario
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged es el listener de Firebase que se dispara cuando el estado de autenticación cambia.
    // Recibe el objeto de usuario de Firebase (FirebaseUser | null).
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Si hay un usuario autenticado de Firebase, creamos un objeto con nuestra interfaz 'User'
        // mapeando firebaseUser.uid a 'id'.
        setUser({
          id: firebaseUser.uid, // <--- ¡Esta es la clave! Mapeamos uid a id.
          // Prioriza displayName, si no existe, usa la parte del email antes del @, o "Usuario" como fallback.
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
          email: firebaseUser.email,
        });
      } else {
        // Si no hay usuario autenticado, establecemos el estado del usuario a null.
        setUser(null);
      }
      setLoading(false); // La carga inicial del estado de autenticación ha terminado.
    });

    // La función de limpieza se ejecuta cuando el componente que usa este hook se desmonta.
    // Esto es importante para evitar fugas de memoria y múltiples listeners.
    return () => unsubscribe();
  }, []); // El array de dependencias vacío asegura que este efecto se ejecute solo una vez al montar el componente.

  return { user, loading }; // Devuelve el objeto de usuario y el estado de carga.
};
