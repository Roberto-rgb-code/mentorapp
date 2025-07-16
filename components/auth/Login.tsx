// components/auth/Login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase"; // Ensure auth and db are correctly initialized and exported here
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";

// --- Helper function to redirect based on user role ---
const redirectByRole = async (user: User, router: ReturnType<typeof useRouter>) => {
  if (!user) return;
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const role = userData?.role;

      // Ensure consistency with roles defined in Register.tsx
      if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
        router.push("/dashboard/inicio"); // Or a specific dashboard for these roles
      } else if (role === "consultor") {
        router.push("/dashboard/consultor");
      } else {
        // Fallback for any unexpected role or missing role
        router.push("/dashboard/inicio");
      }
    } else {
      // If user data doesn't exist in Firestore after login (e.g., social login for a new user)
      // This case should ideally be handled during registration, but as a fallback
      // consider pushing to a profile completion page or default dashboard.
      console.warn("User document not found in Firestore after login for UID:", user.uid);
      router.push("/dashboard/inicio"); // Default if no role found
    }
  } catch (e: any) {
    console.error("Error redirecting by role:", e);
    // Even if redirection fails, push to a default dashboard to avoid a stuck state
    router.push("/dashboard/inicio");
  }
};

// --- Main Login Component ---
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Handle email and password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear previous errors

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await redirectByRole(userCredential.user, router);
    } catch (err: any) {
      console.error("Firebase Auth Error during email/password login:", err.code, err.message);

      let userFriendlyMessage = "Error al iniciar sesión. Verifica tus credenciales.";
      if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        userFriendlyMessage = "Correo electrónico o contraseña incorrectos. Por favor, inténtalo de nuevo.";
      } else if (err.code === 'auth/network-request-failed') {
        userFriendlyMessage = "Problema de conexión: Asegúrate de tener una conexión a internet estable.";
      } else if (err.code === 'auth/too-many-requests') {
        userFriendlyMessage = "Has realizado demasiados intentos fallidos. Por favor, intenta de nuevo más tarde o utiliza la opción 'Olvidaste tu contraseña'.";
      }
      setError(userFriendlyMessage);
    }
  };

  // Handle social logins
  const handleSocialLogin = async (providerName: string) => {
    let provider;
    switch (providerName) {
      case "google":
        provider = new GoogleAuthProvider();
        break;
      case "facebook":
        provider = new FacebookAuthProvider();
        break;
      case "apple":
        provider = new OAuthProvider("apple.com");
        provider.addScope("email");
        provider.addScope("name");
        break;
      default:
        setError("Proveedor de autenticación no reconocido.");
        return;
    }

    setError(""); // Clear previous errors
    try {
      const userCredential = await signInWithPopup(auth, provider);
      // For social logins, if it's a new user, you might need a separate step
      // to collect additional profile data (like role) before redirection.
      // Assuming existing users have a role or new users get a default.
      await redirectByRole(userCredential.user, router);
    } catch (err: any) {
      console.error(`Firebase Auth Error with ${providerName} login:`, err.code, err.message);

      let userFriendlyMessage = `Error al iniciar sesión con ${providerName}.`;
      if (err.code === 'auth/network-request-failed') {
        userFriendlyMessage = "Problema de conexión: Asegúrate de tener una conexión a internet estable.";
      } else if (err.code === 'auth/popup-closed-by-user') {
        userFriendlyMessage = "La ventana de inicio de sesión fue cerrada por el usuario.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        userFriendlyMessage = "La solicitud de ventana emergente fue cancelada. Por favor, intenta de nuevo.";
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        userFriendlyMessage = "Ya existe una cuenta con el mismo correo electrónico pero con un proveedor diferente. Intenta iniciar sesión con tu método original.";
      }
      setError(userFriendlyMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 p-4">
      <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-md animate-fade-in">
        <h2 className="text-3xl font-bold text-blue-800 mb-2 text-center">¡Bienvenido!</h2>
        <p className="text-gray-600 mb-6 text-center">Por favor, inicia sesión en tu cuenta</p>

        {error && (
          <p className="text-red-600 text-center mb-4 p-3 bg-red-100 border border-red-300 rounded-lg animate-shake">
            {error}
          </p>
        )}

        {/* Email and Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="example@domain.com"
              required
              aria-label="Correo Electrónico"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="••••••••"
              required
              aria-label="Contraseña"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
          >
            Iniciar Sesión
          </button>
          <p className="text-right mt-2">
          <a href="/reset-password" className="text-blue-600 hover:underline font-semibold">
              ¿Olvidaste tu contraseña?
          </a>
          </p>
        </form>

        {/* "Or" Separator */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-gray-500 font-medium">o</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleSocialLogin("google")}
            className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 shadow-sm text-gray-700 font-medium"
            aria-label="Iniciar sesión con Google"
          >
            <FaGoogle className="text-red-500 mr-2 text-xl" /> Google
          </button>
          <button
            onClick={() => handleSocialLogin("facebook")}
            className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 shadow-sm text-gray-700 font-medium"
            aria-label="Iniciar sesión con Facebook"
          >
            <FaFacebook className="text-blue-600 mr-2 text-xl" /> Facebook
          </button>
          <button
            onClick={() => handleSocialLogin("apple")}
            className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 shadow-sm text-gray-700 font-medium"
            aria-label="Iniciar sesión con Apple"
          >
            <FaApple className="text-black mr-2 text-xl" /> Apple
          </button>
        </div>

        <p className="mt-6 text-center text-gray-600">
          ¿No tienes cuenta?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-blue-600 hover:underline font-semibold"
          >
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;