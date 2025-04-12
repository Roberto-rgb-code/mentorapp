// components/auth/Register.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase"; // Asegúrate de que `db` (Firestore) esté exportado desde firebase.ts
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";

const Register = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [language, setLanguage] = useState("");
  const [motivation, setMotivation] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessStage, setBusinessStage] = useState("");
  const [interestAreas, setInterestAreas] = useState<string[]>([]);
  const [experienceAreas, setExperienceAreas] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dataConsent, setDataConsent] = useState(false);
  const [conductConsent, setConductConsent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleNext = () => {
    // Validar campos antes de avanzar
    if (step === 1 && !role) {
      setError("Por favor, selecciona un rol.");
      return;
    }
    if (step === 2 && !location) {
      setError("Por favor, ingresa tu ubicación.");
      return;
    }
    if (step === 3 && !phone) {
      setError("Por favor, ingresa tu número de teléfono.");
      return;
    }
    if (step === 4 && !gender) {
      setError("Por favor, selecciona tu género.");
      return;
    }
    if (step === 5 && !birthYear) {
      setError("Por favor, ingresa tu año de nacimiento.");
      return;
    }
    if (step === 6 && !language) {
      setError("Por favor, ingresa tu idioma preferido.");
      return;
    }
    if (step === 7 && !motivation) {
      setError("Por favor, ingresa tu motivación.");
      return;
    }
    if (step === 8 && role === "empresario" && !businessName) {
      setError("Por favor, ingresa el nombre de tu negocio.");
      return;
    }
    if (step === 8 && role === "consultor" && experienceAreas.length < 1) {
      setError("Por favor, selecciona al menos una área de experiencia.");
      return;
    }
    if (step === 9 && role === "empresario" && !businessStage) {
      setError("Por favor, selecciona la etapa de tu negocio.");
      return;
    }
    if (step === 10 && role === "empresario" && interestAreas.length < 1) {
      setError("Por favor, selecciona al menos una área de interés.");
      return;
    }
    if (step === 11 && !dataConsent) {
      setError("Debes aceptar la política de privacidad.");
      return;
    }
    setError(""); // Limpiar errores si la validación pasa
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  // Guardar datos del usuario en Firestore
  const saveUserData = async (user: User) => {
    try {
      const userData = {
        uid: user.uid,
        email: user.email || email,
        role,
        location,
        phone,
        gender,
        birthYear,
        language,
        motivation,
        businessName: role === "empresario" ? businessName : null,
        businessStage: role === "empresario" ? businessStage : null,
        interestAreas: role === "empresario" ? interestAreas : [],
        experienceAreas: role === "consultor" ? experienceAreas : [],
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", user.uid), userData);
    } catch (err: any) {
      console.error("Error al guardar datos del usuario:", err);
      setError("Error al guardar tus datos. Por favor, intenta de nuevo.");
    }
  };

  // Registro con email y contraseña
  const handleRegister = async () => {
    if (!dataConsent || !conductConsent) {
      setError("Debes aceptar la política de privacidad y el código de conducta.");
      return;
    }
    if (!email || !password) {
      setError("Por favor, ingresa tu correo y contraseña.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserData(userCredential.user);
      router.push("/dashboard/inicio");
    } catch (err: any) {
      setError(err.message || "Error al registrarse. Verifica tus datos.");
    }
  };

  // Registro con Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await saveUserData(userCredential.user);
      router.push("/dashboard/inicio");
    } catch (err: any) {
      setError(err.message || "Error al registrarse con Google.");
    }
  };

  // Registro con Facebook
  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await saveUserData(userCredential.user);
      router.push("/dashboard/inicio");
    } catch (err: any) {
      setError(err.message || "Error al registrarse con Facebook.");
    }
  };

  // Registro con Apple
  const handleAppleLogin = async () => {
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await saveUserData(userCredential.user);
      router.push("/dashboard/inicio");
    } catch (err: any) {
      setError(err.message || "Error al registrarse con Apple.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">¿Qué te trae a MentorApp?</h2>
            <button
              onClick={() => {
                setRole("empresario");
                handleNext();
              }}
              className="w-full bg-blue-600 text-white p-3 rounded mb-4 hover:bg-blue-700 transition"
            >
              Soy un empresario
            </button>
            <button
              onClick={() => {
                setRole("consultor");
                handleNext();
              }}
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
            >
              Soy un consultor
            </button>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">¿Dónde vives?</h2>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="País o ciudad"
            />
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
            >
              Siguiente
            </button>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">¿Cuál es tu número de teléfono?</h2>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+52 xxx-xxx-xxxx"
            />
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
            >
              Siguiente
            </button>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">¿Cuál es tu género?</h2>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="no_compartir">Prefiero no compartir</option>
            </select>
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
            >
              Siguiente
            </button>
          </div>
        );
      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">¿En qué año naciste?</h2>
            <input
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej. 1990"
            />
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
            >
              Siguiente
            </button>
          </div>
        );
      case 6:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">¿Cuál es tu idioma preferido?</h2>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej. Español"
            />
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
            >
              Siguiente
            </button>
          </div>
        );
      case 7:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {role === "empresario" ? "¿Por qué empezaste tu negocio?" : "¿Por qué quieres ser consultor?"}
            </h2>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
            >
              Siguiente
            </button>
          </div>
        );
      case 8:
        if (role === "empresario") {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">¿Cuál es el nombre de tu negocio?</h2>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
              >
                Siguiente
              </button>
            </div>
          );
        } else {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">Selecciona 3 áreas de experiencia</h2>
              <div className="space-y-2">
                {["Comercio electrónico", "Finanzas", "Derecho"].map((area) => (
                  <label key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={experienceAreas.includes(area)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExperienceAreas([...experienceAreas, area]);
                        } else {
                          setExperienceAreas(experienceAreas.filter((a) => a !== area));
                        }
                      }}
                    />
                    <span className="ml-2">{area}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
              >
                Siguiente
              </button>
            </div>
          );
        }
      case 9:
        if (role === "empresario") {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">Etapa de tu negocio</h2>
              <select
                value={businessStage}
                onChange={(e) => setBusinessStage(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona</option>
                <option value="idea">Etapa de idea</option>
                <option value="operativo">Operativo</option>
              </select>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
              >
                Siguiente
              </button>
            </div>
          );
        } else {
          handleNext();
          return null;
        }
      case 10:
        if (role === "empresario") {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">Selecciona 3 áreas de interés</h2>
              <div className="space-y-2">
                {["Comercio electrónico", "Finanzas", "Derecho"].map((area) => (
                  <label key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={interestAreas.includes(area)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setInterestAreas([...interestAreas, area]);
                        } else {
                          setInterestAreas(interestAreas.filter((a) => a !== area));
                        }
                      }}
                    />
                    <span className="ml-2">{area}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
              >
                Siguiente
              </button>
            </div>
          );
        } else {
          handleNext();
          return null;
        }
      case 11:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Consentimiento de datos</h2>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={dataConsent}
                onChange={(e) => setDataConsent(e.target.checked)}
              />
              <span className="ml-2">He leído y acepto la Política de Privacidad</span>
            </label>
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
            >
              Siguiente
            </button>
          </div>
        );
      case 12:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Reglas básicas y Registro</h2>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={conductConsent}
                onChange={(e) => setConductConsent(e.target.checked)}
              />
              <span className="ml-2">Acepto el Código de Conducta</span>
            </label>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Regístrate con tu correo</h3>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Correo electrónico"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contraseña"
              />
              <button
                onClick={handleRegister}
                className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
              >
                Registrarse con Correo
              </button>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-center">O regístrate con</h3>
              <div className="flex justify-between gap-3">
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center flex-1 bg-white border border-gray-300 p-3 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Registrarse con Google"
                >
                  <FaGoogle className="text-red-500 mr-2" /> Google
                </button>
                <button
                  onClick={handleFacebookLogin}
                  className="flex items-center justify-center flex-1 bg-white border border-gray-300 p-3 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Registrarse con Facebook"
                >
                  <FaFacebook className="text-blue-600 mr-2" /> Facebook
                </button>
                <button
                  onClick={handleAppleLogin}
                  className="flex items-center justify-center flex-1 bg-white border border-gray-300 p-3 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Registrarse con Apple"
                >
                  <FaApple className="text-black mr-2" /> Apple
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {renderStep()}
        {step > 1 && (
          <button
            onClick={handleBack}
            className="w-full bg-gray-300 text-gray-800 p-2 rounded mt-4 hover:bg-gray-400 transition"
          >
            Atrás
          </button>
        )}
      </div>
    </div>
  );
};

export default Register;