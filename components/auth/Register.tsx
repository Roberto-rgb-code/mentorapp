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

const Register = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  // Datos compartidos (para ambos roles)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [language, setLanguage] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // Datos específicos para empresario
  const [motivation, setMotivation] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessRelationship, setBusinessRelationship] = useState("");
  const [businessStage, setBusinessStage] = useState("");
  const [mainChallenge, setMainChallenge] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [otherGoal, setOtherGoal] = useState("");
  const [previousAdvisory, setPreviousAdvisory] = useState("");
  const [supportAreas, setSupportAreas] = useState<string[]>([]);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  // Datos específicos para consultor
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
  const [recursosPropios, setRecursosPropios] = useState<string[]>([]);
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

  const router = useRouter();

  const handleNext = () => {
    // Validaciones antes de avanzar
    if (step === 1 && !role) {
      setError("Por favor, selecciona un rol.");
      return;
    }
    if (step === 2) {
      if (!fullName) {
        setError("Por favor, ingresa tu nombre completo.");
        return;
      }
      if (!email) {
        setError("Por favor, ingresa tu correo electrónico.");
        return;
      }
      if (!phone) {
        setError("Por favor, ingresa tu número de teléfono.");
        return;
      }
      if (!language) {
        setError("Por favor, selecciona tu idioma preferido.");
        return;
      }
      if (!country) {
        setError("Por favor, ingresa tu país.");
        return;
      }
      if (!city) {
        setError("Por favor, ingresa tu ciudad.");
        return;
      }
    }
    if (role === "empresario") {
      if (step === 3) {
        if (!motivation) {
          setError("Por favor, describe qué te motivó a comenzar tu negocio.");
          return;
        }
        if (!businessName) {
          setError("Por favor, ingresa el nombre de tu negocio.");
          return;
        }
        if (!businessRelationship) {
          setError("Por favor, selecciona tu relación con el negocio.");
          return;
        }
        if (!businessStage) {
          setError("Por favor, selecciona la etapa de tu negocio.");
          return;
        }
      }
      if (step === 4) {
        if (!mainChallenge) {
          setError("Por favor, describe el principal reto de tu negocio.");
          return;
        }
        if (goals.length === 0 && !otherGoal) {
          setError("Por favor, selecciona al menos una meta o escribe una meta personalizada.");
          return;
        }
        if (!previousAdvisory) {
          setError("Por favor, indica si has recibido asesoría empresarial anteriormente.");
          return;
        }
      }
      if (step === 5 && supportAreas.length < 1) {
        setError("Por favor, selecciona al menos una área de apoyo.");
        return;
      }
      if (step === 6 && !privacyConsent) {
        setError("Debes aceptar el Aviso de Privacidad.");
        return;
      }
      if (step === 6 && !email && !password) {
        setError("Por favor, ingresa tu correo y contraseña.");
        return;
      }
    } else if (role === "consultor") {
      if (step === 3) {
        if (!ultimoGrado) {
          setError("Por favor, selecciona tu último grado académico.");
          return;
        }
        if (ultimoGrado === "Otro" && !otroGrado) {
          setError("Por favor, especifica tu grado académico.");
          return;
        }
        if (!areaEstudios) {
          setError("Por favor, ingresa tu área de estudios.");
          return;
        }
        if (!anosExperiencia) {
          setError("Por favor, indica tus años de experiencia en consultoría.");
          return;
        }
        if (!experienciaMipymes) {
          setError("Por favor, indica tu experiencia con MIPYMES y emprendedores.");
          return;
        }
        if (!colaboracionInstitucional) {
          setError("Por favor, indica si has colaborado con programas institucionales.");
          return;
        }
      }
      if (step === 4) {
        if (areasExperiencia.length < 1) {
          setError("Por favor, selecciona al menos una área de experiencia.");
          return;
        }
        if (!casoExito) {
          setError("Por favor, describe un caso de éxito representativo.");
          return;
        }
        if (!intervencionPreferida) {
          setError("Por favor, selecciona el tipo de intervención que prefieres.");
          return;
        }
        if (intervencionPreferida === "Otro" && !otraIntervencion) {
          setError("Por favor, especifica el tipo de intervención.");
          return;
        }
      }
      if (step === 5) {
        if (!acompanamiento) {
          setError("Por favor, selecciona el tipo de acompañamiento que ofreces.");
          return;
        }
        if (!modalidad) {
          setError("Por favor, selecciona cómo prefieres trabajar.");
          return;
        }
        if (herramientasDigitales.length < 1) {
          setError("Por favor, selecciona al menos una herramienta digital.");
          return;
        }
        if (recursosPropios.length < 1) {
          setError("Por favor, selecciona al menos un recurso propio.");
          return;
        }
        if (!reportesEstructurados) {
          setError("Por favor, indica si te sientes cómodo generando reportes.");
          return;
        }
      }
      if (step === 6) {
        if (!horasSemanales) {
          setError("Por favor, selecciona tu disponibilidad semanal.");
          return;
        }
        if (!trabajoProyecto) {
          setError("Por favor, indica si aceptas trabajar por proyecto o paquete de horas.");
          return;
        }
        if (!tarifaTipo) {
          setError("Por favor, indica si tienes una tarifa estándar.");
          return;
        }
        if (tarifaTipo === "Por hora" && !tarifaHora) {
          setError("Por favor, ingresa tu tarifa por hora.");
          return;
        }
        if (tarifaTipo === "Por paquete" && !tarifaPaquete) {
          setError("Por favor, describe tu tarifa por paquete.");
          return;
        }
        if (!motivacionConsultor) {
          setError("Por favor, selecciona tu motivación principal.");
          return;
        }
        if (motivacionConsultor === "Otro" && !otraMotivacion) {
          setError("Por favor, especifica tu motivación.");
          return;
        }
      }
      if (step === 7) {
        if (!curriculum) {
          setError("Por favor, proporciona un enlace o archivo de tu currículum.");
          return;
        }
        if (!referencias) {
          setError("Por favor, indica si estás dispuesto a proporcionar referencias.");
          return;
        }
      }
      if (step === 8 && !confirmacionEntrevista) {
        setError("Debes confirmar que la información es verídica y aceptar ser contactado para entrevista.");
        return;
      }
      if (step === 8 && !email && !password) {
        setError("Por favor, ingresa tu correo y contraseña.");
        return;
      }
    }
    setError("");
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
        fullName,
        phone,
        birthYear,
        language,
        gender,
        country,
        city,
        createdAt: new Date().toISOString(),
      };
      if (role === "empresario") {
        Object.assign(userData, {
          motivation,
          businessName,
          businessRelationship,
          businessStage,
          mainChallenge,
          goals: otherGoal ? [...goals, otherGoal] : goals,
          previousAdvisory,
          supportAreas,
        });
      } else if (role === "consultor") {
        Object.assign(userData, {
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
      await setDoc(doc(db, "users", user.uid), userData);
    } catch (err: any) {
      console.error("Error al guardar datos del usuario:", err);
      setError("Error al guardar tus datos. Por favor, intenta de nuevo.");
    }
  };

  // Registro con email y contraseña
  const handleRegister = async () => {
    if (!privacyConsent) {
      setError("Debes aceptar el Aviso de Privacidad.");
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
            <h2 className="text-2xl font-bold mb-4">🔹 Paso 1: Sobre ti</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Nombre completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre completo"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Correo electrónico"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Número de teléfono 📞 (+ lada internacional)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+52 xxx-xxx-xxxx"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Idioma preferido para la plataforma 🌐</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona</option>
                <option value="Español">Español</option>
                <option value="Inglés">Inglés</option>
                <option value="Francés">Francés</option>
                <option value="Alemán">Alemán</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Género (opcional)</label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Mujer"
                    checked={gender === "Mujer"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <span className="ml-2">Mujer</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Hombre"
                    checked={gender === "Hombre"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <span className="ml-2">Hombre</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Prefiero no decirlo"
                    checked={gender === "Prefiero no decirlo"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <span className="ml-2">Prefiero no decirlo</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Otro"
                    checked={gender === "Otro"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <span className="ml-2">Otro</span>
                </label>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">País 🌍</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="País"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Ciudad 🏙️</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ciudad"
              />
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
            >
              Siguiente
            </button>
          </div>
        );
      case 3:
        if (role === "empresario") {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">🔹 Paso 2: Sobre tu negocio</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">¿Qué te motivó a comenzar tu negocio? ✍️</label>
                <textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe tu motivación..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nombre de tu negocio 🏷️</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre de tu negocio"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">¿Cuál es tu relación con el negocio?</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Soy el dueño(a)"
                      checked={businessRelationship === "Soy el dueño(a)"}
                      onChange={(e) => setBusinessRelationship(e.target.value)}
                    />
                    <span className="ml-2">Soy el dueño(a)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Soy socio(a)"
                      checked={businessRelationship === "Soy socio(a)"}
                      onChange={(e) => setBusinessRelationship(e.target.value)}
                    />
                    <span className="ml-2">Soy socio(a)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Soy colaborador(a)"
                      checked={businessRelationship === "Soy colaborador(a)"}
                      onChange={(e) => setBusinessRelationship(e.target.value)}
                    />
                    <span className="ml-2">Soy colaborador(a)</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">¿En qué etapa se encuentra actualmente tu negocio?</label>
                <select
                  value={businessStage}
                  onChange={(e) => setBusinessStage(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona</option>
                  <option value="Ideación">Ideación – Tengo la idea, pero aún no he validado el mercado</option>
                  <option value="Validación">Validación – Estoy probando si hay demanda o interés real</option>
                  <option value="Puesta en marcha">Puesta en marcha – Ya inicié operaciones, aunque sea informalmente</option>
                  <option value="Formalización">Formalización – Estoy constituyendo mi negocio de forma legal</option>
                  <option value="Crecimiento">Crecimiento – El negocio ya opera y estoy buscando expandirme</option>
                  <option value="Reinvención o salida">Reinvención o salida – Estoy cambiando de rumbo o considerando cerrar</option>
                </select>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
              >
                Siguiente
              </button>
            </div>
          );
        } else if (role === "consultor") {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">🔹 2. Formación y Experiencia</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Último grado académico obtenido</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Licenciatura"
                      checked={ultimoGrado === "Licenciatura"}
                      onChange={() => setUltimoGrado("Licenciatura")}
                    />
                    <span className="ml-2">Licenciatura</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Maestría"
                      checked={ultimoGrado === "Maestría"}
                      onChange={() => setUltimoGrado("Maestría")}
                    />
                    <span className="ml-2">Maestría</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Doctorado"
                      checked={ultimoGrado === "Doctorado"}
                      onChange={() => setUltimoGrado("Doctorado")}
                    />
                    <span className="ml-2">Doctorado</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Otro"
                      checked={ultimoGrado === "Otro"}
                      onChange={() => setUltimoGrado("Otro")}
                    />
                    <span className="ml-2">Otro</span>
                  </label>
                  {ultimoGrado === "Otro" && (
                    <input
                      type="text"
                      value={otroGrado}
                      onChange={(e) => setOtroGrado(e.target.value)}
                      className="ml-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Especifica el grado"
                    />
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Área de estudios</label>
                <input
                  type="text"
                  value={areaEstudios}
                  onChange={(e) => setAreaEstudios(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej. Administración de Empresas"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Años de experiencia en consultoría</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="<1 año"
                      checked={anosExperiencia === "<1 año"}
                      onChange={() => setAnosExperiencia("<1 año")}
                    />
                    <span className="ml-2">{"<1 año"}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="1-3 años"
                      checked={anosExperiencia === "1-3 años"}
                      onChange={() => setAnosExperiencia("1-3 años")}
                    />
                    <span className="ml-2">1-3 años</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="4-7 años"
                      checked={anosExperiencia === "4-7 años"}
                      onChange={() => setAnosExperiencia("4-7 años")}
                    />
                    <span className="ml-2">4-7 años</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value=">8 años"
                      checked={anosExperiencia === ">8 años"}
                      onChange={() => setAnosExperiencia(">8 años")}
                    />
                    <span className="ml-2">{">8 años"}</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">¿Tienes experiencia con MIPYMES y emprendedores?</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Sí, recurrente"
                      checked={experienciaMipymes === "Sí, recurrente"}
                      onChange={() => setExperienciaMipymes("Sí, recurrente")}
                    />
                    <span className="ml-2">Sí, recurrente</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Sí, ocasional"
                      checked={experienciaMipymes === "Sí, ocasional"}
                      onChange={() => setExperienciaMipymes("Sí, ocasional")}
                    />
                    <span className="ml-2">Sí, ocasional</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="No, grandes empresas"
                      checked={experienciaMipymes === "No, grandes empresas"}
                      onChange={() => setExperienciaMipymes("No, grandes empresas")}
                    />
                    <span className="ml-2">No, grandes empresas</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Comenzando"
                      checked={experienciaMipymes === "Comenzando"}
                      onChange={() => setExperienciaMipymes("Comenzando")}
                    />
                    <span className="ml-2">Comenzando</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">¿Has colaborado con programas institucionales?</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Sí"
                      checked={colaboracionInstitucional === "Sí"}
                      onChange={() => setColaboracionInstitucional("Sí")}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="No"
                      checked={colaboracionInstitucional === "No"}
                      onChange={() => setColaboracionInstitucional("No")}
                    />
                    <span className="ml-2">No</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Interesado"
                      checked={colaboracionInstitucional === "Interesado"}
                      onChange={() => setColaboracionInstitucional("Interesado")}
                    />
                    <span className="ml-2">Interesado</span>
                  </label>
                </div>
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
        return null;
      case 4:
        if (role === "empresario") {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">🔹 Paso 3: Detección inicial de necesidades</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  ¿Cuál es el principal reto de tu negocio actualmente? (Ej. no vendo lo suficiente, no tengo estructura, no entiendo mis finanzas) ✍️
                </label>
                <textarea
                  value={mainChallenge}
                  onChange={(e) => setMainChallenge(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe el principal reto..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">¿Qué esperas lograr en los próximos 6 meses con ayuda de la plataforma?</label>
                <div className="space-y-2">
                  {[
                    "Vender más",
                    "Tener claridad en mis finanzas",
                    "Mejorar mi estructura y procesos",
                    "Formalizar legalmente mi negocio",
                    "Conectar con expertos",
                  ].map((goal) => (
                    <label key={goal} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={goals.includes(goal)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGoals([...goals, goal]);
                          } else {
                            setGoals(goals.filter((g) => g !== goal));
                          }
                        }}
                      />
                      <span className="ml-2">{goal}</span>
                    </label>
                  ))}
                  <div className="mt-2">
                    <label className="block text-gray-700 mb-2">Otro:</label>
                    <input
                      type="text"
                      value={otherGoal}
                      onChange={(e) => setOtherGoal(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Especifica otra meta..."
                    />
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">¿Has recibido asesoría empresarial anteriormente?</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Sí"
                      checked={previousAdvisory === "Sí"}
                      onChange={(e) => setPreviousAdvisory(e.target.value)}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="No"
                      checked={previousAdvisory === "No"}
                      onChange={(e) => setPreviousAdvisory(e.target.value)}
                    />
                    <span className="ml-2">No</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="No estoy seguro"
                      checked={previousAdvisory === "No estoy seguro"}
                      onChange={(e) => setPreviousAdvisory(e.target.value)}
                    />
                    <span className="ml-2">No estoy seguro</span>
                  </label>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
              >
                Siguiente
              </button>
            </div>
          );
        } else if (role === "consultor") {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">🔹 3. Especialidad Profesional</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Áreas de experiencia (selecciona al menos 1)</label>
                <div className="space-y-2">
                  {["Estrategia", "Finanzas", "Marketing", "Operaciones", "Innovación", "Legal"].map((area) => (
                    <label key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={areasExperiencia.includes(area)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAreasExperiencia([...areasExperiencia, area]);
                          } else {
                            setAreasExperiencia(areasExperiencia.filter((a) => a !== area));
                          }
                        }}
                      />
                      <span className="ml-2">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Industrias</label>
                <div className="space-y-2">
                  {["Salud", "Educación", "Comercio", "Tecnología"].map((industria) => (
                    <label key={industria} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={industrias.includes(industria)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setIndustrias([...industrias, industria]);
                          } else {
                            setIndustrias(industrias.filter((i) => i !== industria));
                          }
                        }}
                      />
                      <span className="ml-2">{industria}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Caso de éxito ✍️</label>
                <textarea
                  value={casoExito}
                  onChange={(e) => setCasoExito(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe tu caso de éxito..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Intervención preferida</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Diagnósticos"
                      checked={intervencionPreferida === "Diagnósticos"}
                      onChange={() => setIntervencionPreferida("Diagnósticos")}
                    />
                    <span className="ml-2">Diagnósticos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Implementación"
                      checked={intervencionPreferida === "Implementación"}
                      onChange={() => setIntervencionPreferida("Implementación")}
                    />
                    <span className="ml-2">Implementación</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Mentorías"
                      checked={intervencionPreferida === "Mentorías"}
                      onChange={() => setIntervencionPreferida("Mentorías")}
                    />
                    <span className="ml-2">Mentorías</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Capacitación"
                      checked={intervencionPreferida === "Capacitación"}
                      onChange={() => setIntervencionPreferida("Capacitación")}
                    />
                    <span className="ml-2">Capacitación</span>
                  </label>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Otro"
                        checked={intervencionPreferida === "Otro"}
                        onChange={() => setIntervencionPreferida("Otro")}
                      />
                      <span className="ml-2">Otro:</span>
                    </label>
                    {intervencionPreferida === "Otro" && (
                      <input
                        type="text"
                        value={otraIntervencion}
                        onChange={(e) => setOtraIntervencion(e.target.value)}
                        className="ml-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Especifica el tipo de intervención"
                      />
                    )}
                  </div>
                </div>
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
        return null;
      case 5:
        if (role === "empresario") {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">🔹 Paso 4: Áreas en las que te gustaría recibir apoyo</h2>
              <p className="text-gray-600 mb-4">Selecciona hasta 3 opciones</p>
              <div className="space-y-2">
                {[
                  "Estrategia y Planeación",
                  "Finanzas",
                  "Recursos Humanos",
                  "Marketing y Ventas",
                  "Operaciones y Procesos",
                  "Innovación y Tecnología",
                  "Legal y Fiscal",
                  "Sustentabilidad y Responsabilidad Social",
                  "Consultoría Sectorial Especializada",
                  "Desarrollo Personal y Organizacional",
                ].map((area) => (
                  <label key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={supportAreas.includes(area)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (supportAreas.length < 3) {
                            setSupportAreas([...supportAreas, area]);
                          } else {
                            setError("Puedes seleccionar hasta 3 áreas de apoyo.");
                          }
                        } else {
                          setSupportAreas(supportAreas.filter((a) => a !== area));
                          setError("");
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
        } else if (role === "consultor") {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">🔹 4. Estilo y Metodología</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Tipo de acompañamiento</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Puntual"
                      checked={acompanamiento === "Puntual"}
                      onChange={() => setAcompanamiento("Puntual")}
                    />
                    <span className="ml-2">Puntual</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Mediano plazo"
                      checked={acompanamiento === "Mediano plazo"}
                      onChange={() => setAcompanamiento("Mediano plazo")}
                    />
                    <span className="ml-2">Mediano plazo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Continuo"
                      checked={acompanamiento === "Continuo"}
                      onChange={() => setAcompanamiento("Continuo")}
                    />
                    <span className="ml-2">Continuo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Talleres"
                      checked={acompanamiento === "Talleres"}
                      onChange={() => setAcompanamiento("Talleres")}
                    />
                    <span className="ml-2">Talleres</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Modalidad</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="100% virtual"
                      checked={modalidad === "100% virtual"}
                      onChange={() => setModalidad("100% virtual")}
                    />
                    <span className="ml-2">100% virtual</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Mixto"
                      checked={modalidad === "Mixto"}
                      onChange={() => setModalidad("Mixto")}
                    />
                    <span className="ml-2">Mixto</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Herramientas digitales (selecciona al menos 1)</label>
                <div className="space-y-2">
                  {["Google Workspace/Office", "Zoom/Meet", "Excel/Power BI"].map((herramienta) => (
                    <label key={herramienta} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={herramientasDigitales.includes(herramienta)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setHerramientasDigitales([...herramientasDigitales, herramienta]);
                          } else {
                            setHerramientasDigitales(herramientasDigitales.filter((h) => h !== herramienta));
                          }
                        }}
                      />
                      <span className="ml-2">{herramienta}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Recursos propios (selecciona al menos 1)</label>
                <div className="space-y-2">
                  {["Plantillas", "Formatos", "Manuales"].map((recurso) => (
                    <label key={recurso} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={recursosPropios.includes(recurso)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRecursosPropios([...recursosPropios, recurso]);
                          } else {
                            setRecursosPropios(recursosPropios.filter((r) => r !== recurso));
                          }
                        }}
                      />
                      <span className="ml-2">{recurso}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">¿Te sientes cómodo generando reportes estructurados?</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Sí"
                      checked={reportesEstructurados === "Sí"}
                      onChange={() => setReportesEstructurados("Sí")}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Con plantillas"
                      checked={reportesEstructurados === "Con plantillas"}
                      onChange={() => setReportesEstructurados("Con plantillas")}
                    />
                    <span className="ml-2">Con plantillas</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="No, oral"
                      checked={reportesEstructurados === "No, oral"}
                      onChange={() => setReportesEstructurados("No, oral")}
                    />
                    <span className="ml-2">No, oral</span>
                  </label>
                </div>
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
        return null;
      case 6:
        if (role === "empresario") {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">🔹 Paso final: Confirmación de privacidad</h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                />
                <span className="ml-2">
                  He leído y acepto el Aviso de Privacidad y autorizo el tratamiento de mis datos conforme a la política de MentorApp.
                </span>
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
        } else if (role === "consultor") {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">🔹 5. Disponibilidad y Condiciones</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Horas semanales</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="1-3 hrs"
                      checked={horasSemanales === "1-3 hrs"}
                      onChange={() => setHorasSemanales("1-3 hrs")}
                    />
                    <span className="ml-2">1-3 hrs</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="4-8 hrs"
                      checked={horasSemanales === "4-8 hrs"}
                      onChange={() => setHorasSemanales("4-8 hrs")}
                    />
                    <span className="ml-2">4-8 hrs</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="9-15 hrs"
                      checked={horasSemanales === "9-15 hrs"}
                      onChange={() => setHorasSemanales("9-15 hrs")}
                    />
                    <span className="ml-2">9-15 hrs</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Completo"
                      checked={horasSemanales === "Completo"}
                      onChange={() => setHorasSemanales("Completo")}
                    />
                    <span className="ml-2">Completo</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Trabajo por proyecto/paquete</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Sí"
                      checked={trabajoProyecto === "Sí"}
                      onChange={() => setTrabajoProyecto("Sí")}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="No"
                      checked={trabajoProyecto === "No"}
                      onChange={() => setTrabajoProyecto("No")}
                    />
                    <span className="ml-2">No</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Depende"
                      checked={trabajoProyecto === "Depende"}
                      onChange={() => setTrabajoProyecto("Depende")}
                    />
                    <span className="ml-2">Depende</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Tarifa</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Por hora"
                      checked={tarifaTipo === "Por hora"}
                      onChange={() => setTarifaTipo("Por hora")}
                    />
                    <span className="ml-2">Por hora: $</span>
                    {tarifaTipo === "Por hora" && (
                      <input
                        type="text"
                        value={tarifaHora}
                        onChange={(e) => setTarifaHora(e.target.value)}
                        className="ml-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="MXN"
                      />
                    )}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Por paquete"
                      checked={tarifaTipo === "Por paquete"}
                      onChange={() => setTarifaTipo("Por paquete")}
                    />
                    <span className="ml-2">Por paquete:</span>
                  </label>
                  {tarifaTipo === "Por paquete" && (
                    <textarea
                      value={tarifaPaquete}
                      onChange={(e) => setTarifaPaquete(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Describe brevemente..."
                    />
                  )}
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Ajustable"
                      checked={tarifaTipo === "Ajustable"}
                      onChange={() => setTarifaTipo("Ajustable")}
                    />
                    <span className="ml-2">Ajustable</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Motivación</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Ampliar clientes"
                      checked={motivacionConsultor === "Ampliar clientes"}
                      onChange={() => setMotivacionConsultor("Ampliar clientes")}
                    />
                    <span className="ml-2">Ampliar clientes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Apoyar emergentes"
                      checked={motivacionConsultor === "Apoyar emergentes"}
                      onChange={() => setMotivacionConsultor("Apoyar emergentes")}
                    />
                    <span className="ml-2">Apoyar emergentes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Diversificar ingresos"
                      checked={motivacionConsultor === "Diversificar ingresos"}
                      onChange={() => setMotivacionConsultor("Diversificar ingresos")}
                    />
                    <span className="ml-2">Diversificar ingresos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Colaborar"
                      checked={motivacionConsultor === "Colaborar"}
                      onChange={() => setMotivacionConsultor("Colaborar")}
                    />
                    <span className="ml-2">Colaborar</span>
                  </label>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Otro"
                        checked={motivacionConsultor === "Otro"}
                        onChange={() => setMotivacionConsultor("Otro")}
                      />
                      <span className="ml-2">Otro:</span>
                    </label>
                    {motivacionConsultor === "Otro" && (
                      <input
                        type="text"
                        value={otraMotivacion}
                        onChange={(e) => setOtraMotivacion(e.target.value)}
                        className="ml-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Especifica tu motivación..."
                      />
                    )}
                  </div>
                </div>
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
        return null;
      case 7:
        if (role === "consultor") {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">🔹 6. Validaciones</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Currículum (PDF/enlace) 📎</label>
                <input
                  type="text"
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Subir archivo o enlace"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Portafolio (opcional) 📎</label>
                <input
                  type="text"
                  value={portafolio}
                  onChange={(e) => setPortafolio(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Subir archivo o enlace"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">LinkedIn (opcional) 🔗</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enlace a LinkedIn"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">¿Estarías dispuesto a proporcionar referencias?</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Sí"
                      checked={referencias === "Sí"}
                      onChange={() => setReferencias("Sí")}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="No"
                      checked={referencias === "No"}
                      onChange={() => setReferencias("No")}
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
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
        return null;
      case 8:
        if (role === "consultor") {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">🔹 7. Confirmación Final</h2>
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={confirmacionEntrevista}
                  onChange={(e) => setConfirmacionEntrevista(e.target.checked)}
                />
                <span className="ml-2">
                  Confirmo que la información proporcionada es verídica y acepto ser contactado para entrevista.
                </span>
              </label>
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                />
                <span className="ml-2">
                  He leído y acepto el Aviso de Privacidad y autorizo el tratamiento de mis datos conforme a la política de MentorApp.
                </span>
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
                  Enviar registro de consultor
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
        }
        return null;
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