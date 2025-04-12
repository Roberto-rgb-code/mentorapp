// components/auth/Login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Inicio de sesión con email y contraseña
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard/inicio");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  // Inicio de sesión con Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard/inicio");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google.");
    }
  };

  // Inicio de sesión con Facebook
  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard/inicio");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Facebook.");
    }
  };

  // Inicio de sesión con Apple
  const handleAppleLogin = async () => {
    const provider = new OAuthProvider("apple.com");
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard/inicio");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Apple.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">¡Bienvenido!</h2>
        <p className="text-gray-600 mb-6">Por favor, inicia sesión en tu cuenta</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Formulario de email y contraseña */}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@domain.com"
              required
              aria-label="Correo Electrónico"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
              aria-label="Contraseña"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Iniciar Sesión
          </button>
          <p className="text-right mt-2">
            <a href="#" className="text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </p>
        </form>

        {/* Separador "o" */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-gray-500">o</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Botones de proveedores sociales */}
        <div className="flex justify-between">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-1/3 bg-white border border-gray-300 p-2 rounded hover:bg-gray-100"
            aria-label="Iniciar sesión con Google"
          >
            <FaGoogle className="text-red-500 mr-2" /> Google
          </button>
          <button
            onClick={handleFacebookLogin}
            className="flex items-center justify-center w-1/3 bg-white border border-gray-300 p-2 rounded hover:bg-gray-100"
            aria-label="Iniciar sesión con Facebook"
          >
            <FaFacebook className="text-blue-600 mr-2" /> Facebook
          </button>
          <button
            onClick={handleAppleLogin}
            className="flex items-center justify-center w-1/3 bg-white border border-gray-300 p-2 rounded hover:bg-gray-100"
            aria-label="Iniciar sesión con Apple"
          >
            <FaApple className="text-black mr-2" /> Apple
          </button>
        </div>

        <p className="mt-4 text-center">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;