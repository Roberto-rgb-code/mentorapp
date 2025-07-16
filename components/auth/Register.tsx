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
import { auth, db } from "../../lib/firebase";
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";

// Lista de roles habilitados para registro
const ROLES_FINAL = [
  {
    value: "emprendedor",
    label: "PyME / Emprendedor",
    description: "Acceso freemium/premium, diagnóstico, cursos y comunidad.",
  },
  {
    value: "consultor",
    label: "Consultor Independiente",
    description: "Carga perfil experto, gestión de agenda, consultoría 1:1.",
  },
  {
    value: "empresa",
    label: "Empresa (Licenciataria)",
    description: "Acceso corporativo, métricas de empleados, equipos.",
  },
  {
    value: "universidad",
    label: "Universidad",
    description: "Gestión de usuarios institucional, seguimiento académico.",
  },
  {
    value: "gobierno",
    label: "Gobierno",
    description: "Reportes de impacto, acceso institucional, licenciamiento.",
  },
];

const INITIAL_USER_DATA = {
  fullName: "",
  email: "",
  phone: "",
  birthYear: "",
  language: "",
  gender: "",
  country: "",
  city: "",
  password: "",
  privacyConsent: false,
};

const Register = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [userData, setUserData] = useState({ ...INITIAL_USER_DATA });

  // Empresario/empresa/universidad/gobierno (campos base)
  const [motivation, setMotivation] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessRelationship, setBusinessRelationship] = useState("");
  const [businessStage, setBusinessStage] = useState("");
  const [mainChallenge, setMainChallenge] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [otherGoal, setOtherGoal] = useState("");
  const [previousAdvisory, setPreviousAdvisory] = useState("");
  const [supportAreas, setSupportAreas] = useState<string[]>([]);

  // Consultor
  const [ultimoGrado, setUltimoGrado] = useState("");
  const [otroGrado, setOtroGrado] = useState("");
  const [areaEstudios, setAreaEstudios] = useState("");
  const [anosExperiencia, setAnosExperiencia] = useState("");
  const [experienciaMipymes, setExperienciaMipymes] = useState("");
  const [colaboracionInstitucional, setColaboracionInstitucional] = useState("");
  const [areasExperiencia, setAreasExperiencia] = useState<string[]>([]);
  const [industrias, setIndustrias] = useState<string[]>([]);
  const [casoExito, setCasoExito] = useState("");
  const [intervencionPreferida, setIntervencionPreferida] = useState("");
  const [otraIntervencion, setOtraIntervencion] = useState("");
  const [acompanamiento, setAcompanamiento] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [herramientasDigitales, setHerramientasDigitales] = useState<string[]>([]);
  const [recursosPropios, setRecursosPropios] = useState("");
  const [reportesEstructurados, setReportesEstructurados] = useState("");
  const [horasSemanales, setHorasSemanales] = useState("");
  const [trabajoProyecto, setTrabajoProyecto] = useState("");
  const [tarifaTipo, setTarifaTipo] = useState("");
  const [tarifaHora, setTarifaHora] = useState("");
  const [tarifaPaquete, setTarifaPaquete] = useState("");
  const [motivacionConsultor, setMotivacionConsultor] = useState("");
  const [otraMotivacion, setOtraMotivacion] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [portafolio, setPortafolio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [referencias, setReferencias] = useState("");
  const [confirmacionEntrevista, setConfirmacionEntrevista] = useState(false);

  const [error, setError] = useState("");
  const router = useRouter();

  // Handle role selection directly from step 1
  const handleRoleSelection = (selectedRole: string) => {
    setRole(selectedRole);
    setStep(2); // Immediately move to the next step
    setError(""); // Clear any previous errors
  };

  const handleNext = () => {
    setError(""); // Clear previous errors

    // --- Common Validations ---
    if (step === 2) {
      const { fullName, email, phone, language, country, city, birthYear } = userData;
      if (!fullName || !email || !phone || !language || !country || !city || !birthYear) {
        setError("Por favor, completa todos los campos obligatorios del Paso 1: Sobre ti.");
        return;
      }
    }

    // --- Role-Specific Validations ---
    if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
      if (step === 3 && (!motivation || !businessName || !businessRelationship || !businessStage)) {
        setError("Por favor, completa todos los campos del Paso 2: Sobre tu Negocio/Institución.");
        return;
      }
      if (step === 4) {
        if ((goals.includes("Otro") && otherGoal.trim() === "") || (!mainChallenge || (goals.length === 0 && otherGoal.trim() === "") || !previousAdvisory)) {
          setError("Completa los retos, metas y experiencia previa del Paso 3: Retos y Metas. Si seleccionaste 'Otro' en metas, debes especificarla.");
          return;
        }
      }
      if (step === 5 && supportAreas.length < 1) {
        setError("Por favor, selecciona al menos una área de apoyo en el Paso 4: Áreas de Apoyo.");
        return;
      }
      if (step === 6) {
        if (!userData.password) {
          setError("La contraseña no puede estar vacía.");
          return;
        }
        if (userData.password.length < 8) {
          setError("La contraseña debe tener al menos 8 caracteres.");
          return;
        }
        if (!userData.privacyConsent) {
          setError("Debes aceptar el aviso de privacidad y los términos de uso.");
          return;
        }
      }
    } else if (role === "consultor") {
      if (step === 3) {
        if (!ultimoGrado || (ultimoGrado === "Otro" && otroGrado.trim() === "") || !areaEstudios || !anosExperiencia || !experienciaMipymes || !colaboracionInstitucional) {
          setError("Por favor, completa todos los campos de formación y experiencia en el Paso 2: Formación y Experiencia. Si seleccionaste 'Otro' en grado, debes especificarlo.");
          return;
        }
      }
      if (step === 4) {
        if (!casoExito || !intervencionPreferida || (intervencionPreferida === "Otro" && otraIntervencion.trim() === "") || areasExperiencia.length < 1) {
          setError("Por favor, completa los campos de especialidad profesional en el Paso 3: Especialidad Profesional. Selecciona al menos un área de experiencia.");
          return;
        }
      }
      if (step === 5) {
        if (!acompanamiento || !modalidad || herramientasDigitales.length < 1 || !recursosPropios || !reportesEstructurados) {
          setError("Por favor, completa todos los campos de estilo y metodología en el Paso 4: Estilo y Metodología.");
          return;
        }
      }
      if (step === 6) {
        if (!horasSemanales || !trabajoProyecto || !tarifaTipo || (tarifaTipo === "Por hora" && tarifaHora.trim() === "") || (tarifaTipo === "Por paquete" && tarifaPaquete.trim() === "") || !motivacionConsultor || (motivacionConsultor === "Otro" && otraMotivacion.trim() === "")) {
          setError("Por favor, completa todos los campos de disponibilidad y condiciones en el Paso 5: Disponibilidad y Condiciones.");
          return;
        }
      }
      if (step === 7 && (!curriculum || !referencias)) {
        setError("Por favor, completa los campos obligatorios de validaciones en el Paso 6: Validaciones (CV y Referencias).");
        return;
      }
      if (step === 8) {
        if (!confirmacionEntrevista || !userData.privacyConsent || !userData.email || !userData.password) {
          setError("Por favor, confirma la entrevista, acepta el aviso de privacidad y registra correo/contraseña en el Paso 7: Registro Final.");
          return;
        }
        if (!userData.password) {
          setError("La contraseña no puede estar vacía.");
          return;
        }
        if (userData.password.length < 8) {
          setError("La contraseña debe tener al menos 8 caracteres.");
          return;
        }
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const saveUserData = async (user: User) => {
    try {
      const baseData: any = {
        uid: user.uid,
        email: user.email || userData.email,
        role,
        fullName: userData.fullName,
        phone: userData.phone,
        birthYear: userData.birthYear,
        language: userData.language,
        gender: userData.gender,
        country: userData.country,
        city: userData.city,
        privacyConsent: userData.privacyConsent,
        createdAt: new Date().toISOString(),
      };
      if (
        ["emprendedor", "empresa", "universidad", "gobierno"].includes(role)
      ) {
        Object.assign(baseData, {
          motivation,
          businessName,
          businessRelationship,
          businessStage,
          mainChallenge,
          goals: goals.includes("Otro") && otherGoal ? [...goals.filter(g => g !== "Otro"), otherGoal] : goals,
          previousAdvisory,
          supportAreas,
        });
      } else if (role === "consultor") {
        Object.assign(baseData, {
          ultimoGrado: ultimoGrado === "Otro" ? otroGrado : ultimoGrado,
          areaEstudios,
          anosExperiencia,
          experienciaMipymes,
          colaboracionInstitucional,
          areasExperiencia,
          industrias,
          casoExito,
          intervencionPreferida: intervencionPreferida === "Otro" ? otraIntervencion : intervencionPreferida,
          acompanamiento,
          modalidad,
          herramientasDigitales,
          recursosPropios,
          reportesEstructurados,
          horasSemanales,
          trabajoProyecto,
          tarifa: tarifaTipo === "Por hora" ? tarifaHora : tarifaTipo === "Por paquete" ? tarifaPaquete : "Ajustable",
          motivacion: motivacionConsultor === "Otro" ? otraMotivacion : motivacionConsultor,
          curriculum,
          portafolio,
          linkedin,
          referencias,
          confirmacionEntrevista,
        });
      }
      await setDoc(doc(db, "users", user.uid), baseData);
    } catch (err: any) {
      setError("Error al guardar tus datos. Intenta de nuevo.");
    }
  };

  const handleRegister = async () => {
    // Re-run final step validation before registering
    if (
      (["emprendedor", "empresa", "universidad", "gobierno"].includes(role) && step === 6) ||
      (role === "consultor" && step === 8)
    ) {
      if (!userData.password || userData.password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
      if (!userData.privacyConsent) {
        setError("Debes aceptar el aviso de privacidad y los términos de uso.");
        return;
      }
      if (role === "consultor" && !confirmacionEntrevista) {
        setError("Debes confirmar tu disposición a una entrevista inicial.");
        return;
      }
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      await saveUserData(userCredential.user);
      router.push("/dashboard/inicio");
    } catch (err: any) {
      setError(err.message || "Error al registrarse. Verifica tus datos.");
    }
  };

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
        return;
    }

    try {
      const userCredential = await signInWithPopup(auth, provider);
      await saveUserData(userCredential.user);
      router.push("/dashboard/inicio");
    } catch (err: any) {
      setError(err.message || `Error al registrarse con ${providerName}.`);
    }
  };

  const getMaxSteps = () => {
    if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
      return 6;
    } else if (role === "consultor") {
      return 8;
    }
    return 1;
  };

  // Helper function to render step indicators
  const renderStepIndicator = () => {
    const totalSteps = getMaxSteps();
    const currentRoleSteps = role ? totalSteps - 1 : 0; // Exclude initial role selection step
    const displayStep = role ? step - 1 : 0; // Adjust for display purposes

    return (
      <div className="flex justify-center mb-6">
        {Array.from({ length: currentRoleSteps }).map((_, index) => (
          <div
            key={index}
            className={`w-6 h-1 mx-1 rounded-full transition-all duration-300
              ${displayStep > index ? "bg-blue-600" : "bg-gray-300"}
            `}
          ></div>
        ))}
      </div>
    );
  };


  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">¿Qué te trae a MentorApp?</h2>
            <div className="space-y-4">
              {ROLES_FINAL.map((rol) => (
                <button
                  key={rol.value}
                  onClick={() => handleRoleSelection(rol.value)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col items-start text-left"
                >
                  <span className="font-semibold text-lg">{rol.label}</span>
                  <span className="text-sm opacity-90 mt-1">{rol.description}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 1: Sobre ti</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Nombre completo</label>
                <input
                  type="text"
                  value={userData.fullName}
                  onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Correo electrónico</label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Número de teléfono 📞 (+ lada internacional)</label>
                <input
                  type="text"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="+52 55 1234 5678"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Año de nacimiento 🎂</label>
                <input
                  type="number"
                  value={userData.birthYear}
                  onChange={(e) => setUserData({ ...userData, birthYear: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="AAAA (Ej. 1990)"
                  min="1900"
                  max={new Date().getFullYear().toString()}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Idioma preferido para la plataforma 🌐</label>
                <select
                  value={userData.language}
                  onChange={(e) => setUserData({ ...userData, language: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                >
                  <option value="">Selecciona</option>
                  <option value="Español">Español</option>
                  <option value="Inglés">Inglés</option>
                  <option value="Francés">Francés</option>
                  <option value="Alemán">Alemán</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Género (opcional)</label>
                <div className="flex flex-wrap gap-4">
                  {["Mujer", "Hombre", "Prefiero no decirlo", "Otro"].map((genderOption) => (
                    <label key={genderOption} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value={genderOption}
                        checked={userData.gender === genderOption}
                        onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2 text-gray-800">{genderOption}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">País 🌍</label>
                <input
                  type="text"
                  value={userData.country}
                  onChange={(e) => setUserData({ ...userData, country: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Tu país de residencia"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Ciudad 🏙️</label>
                <input
                  type="text"
                  value={userData.city}
                  onChange={(e) => setUserData({ ...userData, city: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Tu ciudad"
                />
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white p-3 rounded-lg mt-6 font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
            >
              Siguiente
            </button>
          </div>
        );
      case 3:
        if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 2: Sobre tu Negocio/Institución</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Cuál es tu principal motivación?</label>
                  <textarea
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. Quiero crecer mi negocio, busco mentoría para mi equipo, etc."
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nombre de tu Negocio/Institución</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Nombre de tu empresa o institución"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Cuál es tu relación con la empresa/institución?</label>
                  <select
                    value={businessRelationship}
                    onChange={(e) => setBusinessRelationship(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Propietario">Propietario</option>
                    <option value="Gerente">Gerente</option>
                    <option value="Empleado">Empleado</option>
                    <option value="Fundador">Fundador</option>
                    <option value="Director">Director</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿En qué etapa se encuentra tu negocio/institución?</label>
                  <select
                    value={businessStage}
                    onChange={(e) => setBusinessStage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Idea">Idea</option>
                    <option value="Pre-lanzamiento">Pre-lanzamiento</option>
                    <option value="Lanzamiento">Lanzamiento</option>
                    <option value="Crecimiento temprano">Crecimiento temprano</option>
                    <option value="Crecimiento establecido">Crecimiento establecido</option>
                    <option value="Madurez">Madurez</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-3 rounded-lg mt-6 font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
              >
                Siguiente
              </button>
            </div>
          );
        } else if (role === "consultor") {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 2: Formación y Experiencia</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Último grado académico 🎓</label>
                  <select
                    value={ultimoGrado}
                    onChange={(e) => setUltimoGrado(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Licenciatura">Licenciatura</option>
                    <option value="Maestría">Maestría</option>
                    <option value="Doctorado">Doctorado</option>
                    <option value="Diplomado">Diplomado</option>
                    <option value="Carrera Técnica">Carrera Técnica</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {ultimoGrado === "Otro" && (
                    <input
                      type="text"
                      value={otroGrado}
                      onChange={(e) => setOtroGrado(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Especifica tu otro grado académico"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Área de estudios principal</label>
                  <input
                    type="text"
                    value={areaEstudios}
                    onChange={(e) => setAreaEstudios(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. Negocios, Ingeniería, Finanzas"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Años de experiencia profesional</label>
                  <input
                    type="number"
                    value={anosExperiencia}
                    onChange={(e) => setAnosExperiencia(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. 5"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Experiencia previa con MiPymes o emprendedores</label>
                  <select
                    value={experienciaMipymes}
                    onChange={(e) => setExperienciaMipymes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Sí, extensiva">Sí, extensiva (más de 5 años)</option>
                    <option value="Sí, moderada">Sí, moderada (2-5 años)</option>
                    <option value="Sí, limitada">Sí, limitada (menos de 2 años)</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Has colaborado con instituciones educativas, gobierno o cámaras empresariales?</label>
                  <select
                    value={colaboracionInstitucional}
                    onChange={(e) => setColaboracionInstitucional(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Sí, frecuentemente">Sí, frecuentemente</option>
                    <option value="Sí, ocasionalmente">Sí, ocasionalmente</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-3 rounded-lg mt-6 font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
              >
                Siguiente
              </button>
            </div>
          );
        }
        break;
      case 4:
        if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 3: Retos y Metas</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Cuál es tu principal reto actual?</label>
                  <textarea
                    value={mainChallenge}
                    onChange={(e) => setMainChallenge(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. Aumentar ventas, mejorar procesos, etc."
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Principales metas que buscas lograr con MentorApp (selecciona todas las que apliquen)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Crecimiento de ventas", "Optimización de procesos", "Acceso a financiamiento",
                      "Desarrollo de nuevos productos/servicios", "Expansión a nuevos mercados",
                      "Mejora de la estrategia de marketing", "Digitalización",
                      "Desarrollo de liderazgo", "Gestión de equipos", "Innovación",
                    ].map((goal) => (
                      <label key={goal} className="flex items-center cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                        <input
                          type="checkbox"
                          value={goal}
                          checked={goals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGoals([...goals, e.target.value]);
                            } else {
                              setGoals(goals.filter((g) => g !== e.target.value));
                            }
                          }}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        />
                        <span className="ml-2 text-gray-800">{goal}</span>
                      </label>
                    ))}
                    <label className="flex items-center cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                      <input
                        type="checkbox"
                        value="Otro"
                        checked={goals.includes("Otro")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGoals([...goals, "Otro"]);
                          } else {
                            setGoals(goals.filter((g) => g !== "Otro"));
                            setOtherGoal("");
                          }
                        }}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-gray-800">Otro</span>
                    </label>
                    {goals.includes("Otro") && (
                      <input
                        type="text"
                        value={otherGoal}
                        onChange={(e) => setOtherGoal(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2 col-span-full"
                        placeholder="Especifica otra meta"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Has recibido mentoría o asesoría previa?</label>
                  <select
                    value={previousAdvisory}
                    onChange={(e) => setPreviousAdvisory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Sí, formal">Sí, formal (programas estructurados)</option>
                    <option value="Sí, informal">Sí, informal (contactos personales)</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-3 rounded-lg mt-6 font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
              >
                Siguiente
              </button>
            </div>
          );
        } else if (role === "consultor") {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 3: Especialidad Profesional</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Áreas de experiencia principal (selecciona al menos una)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Estrategia y Planificación", "Finanzas y Contabilidad", "Marketing y Ventas",
                      "Operaciones y Logística", "Recursos Humanos", "Tecnología y Digitalización",
                      "Innovación y Desarrollo de Producto", "Legal y Regulatorio",
                      "Comercio Exterior", "Sustentabilidad y Responsabilidad Social",
                    ].map((area) => (
                      <label key={area} className="flex items-center cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                        <input
                          type="checkbox"
                          value={area}
                          checked={areasExperiencia.includes(area)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAreasExperiencia([...areasExperiencia, e.target.value]);
                            } else {
                              setAreasExperiencia(areasExperiencia.filter((a) => a !== e.target.value));
                            }
                          }}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        />
                        <span className="ml-2 text-gray-800">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Industrias en las que tienes experiencia (selecciona todas las que apliquen)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Tecnología", "Servicios", "Manufactura", "Comercio minorista",
                      "Alimentos y Bebidas", "Educación", "Salud", "Financiera",
                      "Turismo", "Agroindustria", "Consultoría", "Energía",
                    ].map((industria) => (
                      <label key={industria} className="flex items-center cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                        <input
                          type="checkbox"
                          value={industria}
                          checked={industrias.includes(industria)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setIndustrias([...industrias, e.target.value]);
                            } else {
                              setIndustrias(industrias.filter((i) => i !== e.target.value));
                            }
                          }}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        />
                        <span className="ml-2 text-gray-800">{industria}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Describe un caso de éxito relevante con un cliente o proyecto</label>
                  <textarea
                    value={casoExito}
                    onChange={(e) => setCasoExito(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Sé conciso pero claro"
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Tipo de intervención preferida</label>
                  <select
                    value={intervencionPreferida}
                    onChange={(e) => setIntervencionPreferida(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Mentoría 1:1">Mentoría 1:1</option>
                    <option value="Asesoría puntual">Asesoría puntual</option>
                    <option value="Talleres/Capacitación">Talleres/Capacitación</option>
                    <option value="Proyectos a largo plazo">Proyectos a largo plazo</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {intervencionPreferida === "Otro" && (
                    <input
                      type="text"
                      value={otraIntervencion}
                      onChange={(e) => setOtraIntervencion(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Especifica otra intervención"
                    />
                  )}
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-3 rounded-lg mt-6 font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
              >
                Siguiente
              </button>
            </div>
          );
        }
        break;
      case 5:
        if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 4: Áreas de Apoyo</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿En qué áreas te gustaría recibir apoyo? (selecciona al menos una)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Estrategia de Negocio", "Finanzas y Contabilidad", "Marketing Digital",
                      "Ventas y Comercialización", "Operaciones y Logística",
                      "Recursos Humanos y Talento", "Tecnología e Innovación",
                      "Desarrollo de Producto/Servicio", "Internacionalización",
                      "Aspectos Legales y Fiscales", "Sustentabilidad",
                    ].map((area) => (
                      <label key={area} className="flex items-center cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                        <input
                          type="checkbox"
                          value={area}
                          checked={supportAreas.includes(area)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSupportAreas([...supportAreas, e.target.value]);
                            } else {
                              setSupportAreas(supportAreas.filter((a) => a !== e.target.value));
                            }
                          }}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        />
                        <span className="ml-2 text-gray-800">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-3 rounded-lg mt-6 font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
              >
                Siguiente
              </button>
            </div>
          );
        } else if (role === "consultor") {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 4: Estilo y Metodología</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Enfoque de acompañamiento preferido</label>
                  <select
                    value={acompanamiento}
                    onChange={(e) => setAcompanamiento(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Directivo (guía paso a paso)">Directivo (guía paso a paso)</option>
                    <option value="Facilitador (exploración y descubrimiento)">Facilitador (exploración y descubrimiento)</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Modalidad de consultoría que ofreces</label>
                  <select
                    value={modalidad}
                    onChange={(e) => setModalidad(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Online">Online</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Herramientas digitales que utilizas habitualmente (selecciona todas las que apliquen)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Google Workspace", "Microsoft Office 365", "Zoom/Google Meet",
                      "Trello/Asana", "Miro/FigJam", "CRM (Salesforce, HubSpot)",
                      "ERP (SAP, Oracle)", "Software de contabilidad (QuickBooks)",
                      "Herramientas de marketing (Mailchimp)", "Ninguna en particular",
                    ].map((herramienta) => (
                      <label key={herramienta} className="flex items-center cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                        <input
                          type="checkbox"
                          value={herramienta}
                          checked={herramientasDigitales.includes(herramienta)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setHerramientasDigitales([...herramientasDigitales, e.target.value]);
                            } else {
                              setHerramientasDigitales(herramientasDigitales.filter((h) => h !== e.target.value));
                            }
                          }}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        />
                        <span className="ml-2 text-gray-800">{herramienta}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Cuentas con recursos propios (materiales, metodologías, plantillas) para tus intervenciones?</label>
                  <div className="flex flex-wrap gap-4">
                    {["Sí, extensivo", "Sí, limitado", "No"].map((option) => (
                      <label key={option} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value={option}
                          checked={recursosPropios === option}
                          onChange={(e) => setRecursosPropios(e.target.value)}
                          className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        />
                        <span className="ml-2 text-gray-800">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Estás dispuesto(a) a generar reportes estructurados de tus intervenciones?</label>
                  <div className="flex flex-wrap gap-4">
                    {["Sí", "No"].map((option) => (
                      <label key={option} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value={option}
                          checked={reportesEstructurados === option}
                          onChange={(e) => setReportesEstructurados(e.target.value)}
                          className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        />
                        <span className="ml-2 text-gray-800">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-3 rounded-lg mt-6 font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
              >
                Siguiente
              </button>
            </div>
          );
        }
        break;
      case 6:
        if (["emprendedor", "empresa", "universidad", "gobierno"].includes(role)) {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 5: Registro Final</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Crea tu contraseña</label>
                  <input
                    type="password"
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Contraseña (mínimo 8 caracteres)"
                  />
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={userData.privacyConsent}
                    onChange={(e) => setUserData({ ...userData, privacyConsent: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded mt-1 mr-2"
                  />
                  <label className="text-gray-700">Acepto el <a href="#" className="text-blue-600 hover:underline">aviso de privacidad</a> y los <a href="#" className="text-blue-600 hover:underline">términos de uso</a>.</label>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
              <button
                onClick={handleRegister}
                className="w-full bg-green-600 text-white p-3 rounded-lg mt-6 font-semibold hover:bg-green-700 transition duration-300 shadow-md hover:shadow-lg"
              >
                Registrarme
              </button>
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4 font-medium">O regístrate con:</p>
                <div className="flex justify-center space-x-6">
                  <button
                    onClick={() => handleSocialLogin("google")}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-full bg-white shadow-sm hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                    aria-label="Registrarse con Google"
                  >
                    <FaGoogle className="text-2xl text-red-500" />
                  </button>
                  <button
                    onClick={() => handleSocialLogin("facebook")}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-full bg-white shadow-sm hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                    aria-label="Registrarse con Facebook"
                  >
                    <FaFacebook className="text-2xl text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleSocialLogin("apple")}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-full bg-white shadow-sm hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                    aria-label="Registrarse con Apple"
                  >
                    <FaApple className="text-2xl text-gray-800" />
                  </button>
                </div>
              </div>
            </div>
          );
        } else if (role === "consultor") {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 5: Disponibilidad y Condiciones</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Horas semanales disponibles para MentorApp</label>
                  <input
                    type="number"
                    value={horasSemanales}
                    onChange={(e) => setHorasSemanales(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Ej. 5"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">¿Estás abierto(a) a proyectos a largo plazo?</label>
                  <div className="flex flex-wrap gap-4">
                    {["Sí", "No", "Depende del proyecto"].map((option) => (
                      <label key={option} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value={option}
                          checked={trabajoProyecto === option}
                          onChange={(e) => setTrabajoProyecto(e.target.value)}
                          className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        />
                        <span className="ml-2 text-gray-800">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Tipo de tarifa preferida</label>
                  <select
                    value={tarifaTipo}
                    onChange={(e) => setTarifaTipo(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Por hora">Por hora</option>
                    <option value="Por paquete">Por paquete</option>
                    <option value="Ajustable">Ajustable según proyecto</option>
                  </select>
                  {tarifaTipo === "Por hora" && (
                    <input
                      type="text"
                      value={tarifaHora}
                      onChange={(e) => setTarifaHora(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Tarifa por hora (ej. $50 USD/hr)"
                    />
                  )}
                  {tarifaTipo === "Por paquete" && (
                    <input
                      type="text"
                      value={tarifaPaquete}
                      onChange={(e) => setTarifaPaquete(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Tarifa por paquete (ej. $500 USD por proyecto)"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Principal motivación para unirte a MentorApp</label>
                  <select
                    value={motivacionConsultor}
                    onChange={(e) => setMotivacionConsultor(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Generar ingresos adicionales">Generar ingresos adicionales</option>
                    <option value="Compartir conocimiento">Compartir conocimiento</option>
                    <option value="Expandir mi red de contactos">Expandir mi red de contactos</option>
                    <option value="Acceder a nuevos proyectos">Acceder a nuevos proyectos</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {motivacionConsultor === "Otro" && (
                    <input
                      type="text"
                      value={otraMotivacion}
                      onChange={(e) => setOtraMotivacion(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-2"
                      placeholder="Especifica otra motivación"
                    />
                  )}
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-3 rounded-lg mt-6 font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
              >
                Siguiente
              </button>
            </div>
          );
        }
        break;
      case 7:
        if (role === "consultor") {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 6: Validaciones</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">URL a tu Curriculum Vitae (CV) o perfil profesional</label>
                  <input
                    type="text"
                    value={curriculum}
                    onChange={(e) => setCurriculum(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="https://drive.google.com/..."
                  />
                  <p className="text-sm text-gray-500 mt-1">Asegúrate de que el enlace sea público o compartible.</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">URL a tu portafolio de proyectos (opcional)</label>
                  <input
                    type="text"
                    value={portafolio}
                    onChange={(e) => setPortafolio(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="https://behance.net/..."
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">URL a tu perfil de LinkedIn (opcional)</label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="https://linkedin.com/in/tu-perfil"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Referencias profesionales (nombre y contacto, al menos 2)</label>
                  <textarea
                    value={referencias}
                    onChange={(e) => setReferencias(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Nombre 1: correo@ejemplo.com, Tel: +52 123 456 7890&#10;Nombre 2: contacto@otro.com, Tel: +1 987 654 3210"
                    rows={4}
                  ></textarea>
                  <p className="text-sm text-gray-500 mt-1">Nos pondremos en contacto con tus referencias para validar tu experiencia.</p>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-3 rounded-lg mt-6 font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
              >
                Siguiente
              </button>
            </div>
          );
        }
        break;
      case 8:
        if (role === "consultor") {
          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔹 Paso 7: Registro Final</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={confirmacionEntrevista}
                    onChange={(e) => setConfirmacionEntrevista(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded mt-1 mr-2"
                  />
                  <label className="text-gray-700">Confirmo que estoy dispuesto(a) a una entrevista inicial para validar mi perfil.</label>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Crea tu contraseña</label>
                  <input
                    type="password"
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Contraseña (mínimo 8 caracteres)"
                  />
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={userData.privacyConsent}
                    onChange={(e) => setUserData({ ...userData, privacyConsent: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded mt-1 mr-2"
                  />
                  <label className="text-gray-700">Acepto el <a href="#" className="text-blue-600 hover:underline">aviso de privacidad</a> y los <a href="#" className="text-blue-600 hover:underline">términos de uso</a>.</label>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
              <button
                onClick={handleRegister}
                className="w-full bg-green-600 text-white p-3 rounded-lg mt-6 font-semibold hover:bg-green-700 transition duration-300 shadow-md hover:shadow-lg"
              >
                Registrarme
              </button>
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4 font-medium">O regístrate con:</p>
                <div className="flex justify-center space-x-6">
                  <button
                    onClick={() => handleSocialLogin("google")}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-full bg-white shadow-sm hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                    aria-label="Registrarse con Google"
                  >
                    <FaGoogle className="text-2xl text-red-500" />
                  </button>
                  <button
                    onClick={() => handleSocialLogin("facebook")}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-full bg-white shadow-sm hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                    aria-label="Registrarse con Facebook"
                  >
                    <FaFacebook className="text-2xl text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleSocialLogin("apple")}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-full bg-white shadow-sm hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                    aria-label="Registrarse con Apple"
                  >
                    <FaApple className="text-2xl text-gray-800" />
                  </button>
                </div>
              </div>
            </div>
          );
        }
        break;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-700 p-4">
      <div className="relative bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg transition-all duration-500 ease-in-out transform scale-95 md:scale-100">
        {step > 1 && renderStepIndicator()} {/* Only show indicators after initial role selection */}
        {renderStep()}

        {(step > 1 && step <= getMaxSteps()) && ( // Dynamic "Atrás" button logic
          <button
            onClick={handleBack}
            className="w-full bg-gray-200 text-gray-800 p-3 rounded-lg mt-6 font-semibold hover:bg-gray-300 transition duration-300 shadow-sm hover:shadow-md"
          >
            Atrás
          </button>
        )}
        {error && <p className="text-red-500 text-sm mt-4 text-center animate-shake">{error}</p>}
      </div>
    </div>
  );
};

export default Register;