import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/router';

const Register = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [language, setLanguage] = useState('');
  const [motivation, setMotivation] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessStage, setBusinessStage] = useState('');
  const [interestAreas, setInterestAreas] = useState<string[]>([]);
  const [experienceAreas, setExperienceAreas] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dataConsent, setDataConsent] = useState(false);
  const [conductConsent, setConductConsent] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleRegister = async () => {
    if (!dataConsent || !conductConsent) {
      setError('Debes aceptar la política de privacidad y el código de conducta.');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Aquí puedes guardar datos adicionales en Firestore si lo deseas
      router.push('/dashboard/inicio');
    } catch (error) {
      setError('Error al registrarse. Verifica tus datos.');
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
                setRole('empresario');
                handleNext();
              }}
              className="w-full bg-blue-600 text-white p-3 rounded mb-4 hover:bg-blue-700"
            >
              Soy un empresario
            </button>
            <button
              onClick={() => {
                setRole('consultor');
                handleNext();
              }}
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
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
              className="w-full p-2 border rounded"
              placeholder="País o ciudad"
            />
            <button onClick={handleNext} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
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
              className="w-full p-2 border rounded"
              placeholder="+52 xxx-xxx-xxxx"
            />
            <button onClick={handleNext} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
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
              className="w-full p-2 border rounded"
            >
              <option value="">Selecciona</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="no_compartir">Prefiero no compartir</option>
            </select>
            <button onClick={handleNext} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
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
              className="w-full p-2 border rounded"
              placeholder="Ej. 1990"
            />
            <button onClick={handleNext} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
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
              className="w-full p-2 border rounded"
              placeholder="Ej. Español"
            />
            <button onClick={handleNext} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
              Siguiente
            </button>
          </div>
        );
      case 7:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {role === 'empresario' ? '¿Por qué empezaste tu negocio?' : '¿Por qué quieres ser consultor?'}
            </h2>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
            />
            <button onClick={handleNext} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
              Siguiente
            </button>
          </div>
        );
      case 8:
        if (role === 'empresario') {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">¿Cuál es el nombre de tu negocio?</h2>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button onClick={handleNext} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
                Siguiente
              </button>
            </div>
          );
        } else {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">Selecciona 3 áreas de experiencia</h2>
              <div className="space-y-2">
                {['Comercio electrónico', 'Finanzas', 'Derecho'].map((area) => (
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
              <button onClick={handleNext} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
                Siguiente
              </button>
            </div>
          );
        }
      case 9:
        if (role === 'empresario') {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">Etapa de tu negocio</h2>
              <select
                value={businessStage}
                onChange={(e) => setBusinessStage(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Selecciona</option>
                <option value="idea">Etapa de idea</option>
                <option value="operativo">Operativo</option>
              </select>
              <button onClick={handleNext} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
                Siguiente
              </button>
            </div>
          );
        } else {
          handleNext();
          return null;
        }
      case 10:
        if (role === 'empresario') {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">Selecciona 3 áreas de interés</h2>
              <div className="space-y-2">
                {['Comercio electrónico', 'Finanzas', 'Derecho'].map((area) => (
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
              <button onClick={handleNext} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
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
            <button onClick={handleNext} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
              Siguiente
            </button>
          </div>
        );
      case 12:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Reglas básicas</h2>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={conductConsent}
                onChange={(e) => setConductConsent(e.target.checked)}
              />
              <span className="ml-2">Acepto el Código de Conducta</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded mt-4"
              placeholder="Correo electrónico"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mt-4"
              placeholder="Contraseña"
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button onClick={handleRegister} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
              Registrarse
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {renderStep()}
        {step > 1 && (
          <button
            onClick={handleBack}
            className="w-full bg-gray-300 text-gray-800 p-2 rounded mt-4 hover:bg-gray-400"
          >
            Atrás
          </button>
        )}
      </div>
    </div>
  );
};

export default Register;