// pages/_app.tsx
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify'; // Importa ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Importa los estilos CSS de react-toastify
import ChatbotWidget from '@/components/ChatbotWidget'; // ¡Importa el ChatbotWidget!

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      {/* Añade ToastContainer aquí, generalmente al final del componente principal */}
      <ToastContainer
        position="bottom-right" // Posición de las notificaciones
        autoClose={5000}        // Duración en milisegundos antes de que se cierren automáticamente
        hideProgressBar={false} // Mostrar o no la barra de progreso
        newestOnTop={false}     // Si las notificaciones nuevas aparecen arriba o abajo
        closeOnClick            // Cerrar notificación al hacer clic
        rtl={false}             // Soporte de texto de derecha a izquierda
        pauseOnFocusLoss        // Pausar autoClose si la ventana pierde el foco
        draggable               // Permitir arrastrar las notificaciones
        pauseOnHover            // Pausar autoClose al pasar el ratón por encima
      />
      {/* ¡Aquí es donde añades el ChatbotWidget para que aparezca en todas las páginas! */}
      <ChatbotWidget />
    </AuthProvider>
  );
}

export default MyApp;
