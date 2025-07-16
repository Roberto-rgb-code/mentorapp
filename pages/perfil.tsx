// pages/perfil.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import PrivateLayout from "../components/layout/PrivateLayout";
import {
  FaUserCircle,
  FaEnvelope,
  FaBriefcase,
  FaMapMarkerAlt,
  FaGlobe,
  FaPhone,
  FaCalendarAlt,
  FaVenusMars,
  FaGraduationCap,
  FaHourglassHalf,
  FaIndustry,
  FaHandshake,
  FaTools, // Added this import
  FaFolderOpen, // Added this import
  FaFileAlt, // Added this import
  FaDollarSign, // Added this import
  FaLightbulb, // Added this import
  FaFilePdf, // Added this import
  FaLinkedin, // Added this import
  FaUsers, // Added this import
  FaBuilding, // Added for 'empresa'
  FaUniversity, // Added for 'universidad'
  FaLandmark, // Added for 'gobierno'
} from 'react-icons/fa';
import { motion } from "framer-motion"; // For subtle animations

const Perfil = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            setError("No se encontraron datos de perfil adicionales.");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError("Error al cargar tu perfil. Intenta de nuevo más tarde.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        // If user is null, they should be redirected by PrivateLayout or useAuth hook
      }
    };
    fetchProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-700 text-white">
        <p className="text-xl">Redirigiendo... Debes iniciar sesión para ver tu perfil.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <PrivateLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-gray-700 text-lg">Cargando tu información...</p>
        </div>
      </PrivateLayout>
    );
  }

  if (error) {
    return (
      <PrivateLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
          <p className="text-red-600 text-xl font-semibold">{error}</p>
          <p className="text-gray-600 mt-2">Por favor, intenta recargar la página.</p>
        </div>
      </PrivateLayout>
    );
  }

  const renderProfileDetail = (icon: React.ReactNode, label: string, value: string | number | string[] | React.ReactNode | undefined) => {
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) return null;

    let displayValue: React.ReactNode = value;
    if (Array.isArray(value)) {
      displayValue = value.join(", ");
    }

    return (
      <motion.div
        className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.01]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-blue-500 mr-3 text-xl">{icon}</div>
        <div>
          <strong className="text-gray-700 text-sm md:text-base">{label}:</strong>{" "}
          <span className="text-gray-900 text-base md:text-lg font-medium">{displayValue}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <PrivateLayout>
      <div className="container mx-auto p-4 md:p-8 bg-gray-50 rounded-xl shadow-lg animate-fade-in-up">
        <header className="flex items-center justify-between border-b pb-4 mb-6 md:mb-8">
          <motion.h1
            className="text-4xl font-extrabold text-gray-900 flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FaUserCircle className="mr-3 text-blue-600 text-4xl" /> Tu Perfil
          </motion.h1>
          {/* Future: Add an "Edit Profile" button here */}
          {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
            Editar Perfil
          </button> */}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Information */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center">
              <FaUserCircle className="mr-2 text-blue-500" /> Información General
            </h2>
            <div className="space-y-4">
              {renderProfileDetail(<FaUserCircle />, "Nombre Completo", profile?.fullName || user.displayName || "No especificado")}
              {renderProfileDetail(<FaEnvelope />, "Correo Electrónico", user.email)}
              {profile?.phone && renderProfileDetail(<FaPhone />, "Teléfono", profile.phone)}
              {profile?.birthYear && renderProfileDetail(<FaCalendarAlt />, "Año de Nacimiento", profile.birthYear)}
              {profile?.language && renderProfileDetail(<FaGlobe />, "Idioma Preferido", profile.language)}
              {profile?.gender && renderProfileDetail(<FaVenusMars />, "Género", profile.gender)}
              {renderProfileDetail(<FaBriefcase />, "Rol en MentorApp", profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "No especificado")}
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-500" /> Ubicación
            </h2>
            <div className="space-y-4">
              {profile?.country && renderProfileDetail(<FaGlobe />, "País", profile.country)}
              {profile?.city && renderProfileDetail(<FaMapMarkerAlt />, "Ciudad", profile.city)}
            </div>
          </div>

          {/* Role-Specific Information */}
          {profile?.role === "emprendedor" && (
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
                <FaBriefcase className="mr-2 text-green-500" /> Detalles de PyME / Emprendedor
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.businessName && renderProfileDetail(<FaHandshake />, "Nombre del Negocio", profile.businessName)}
                {profile?.businessRelationship && renderProfileDetail(<FaUserCircle />, "Relación con el Negocio", profile.businessRelationship)}
                {profile?.businessStage && renderProfileDetail(<FaHourglassHalf />, "Etapa del Negocio", profile.businessStage)}
                {profile?.motivation && renderProfileDetail(<FaBriefcase />, "Motivación Principal", profile.motivation)}
                {profile?.mainChallenge && renderProfileDetail(<FaBriefcase />, "Reto Principal", profile.mainChallenge)}
                {profile?.goals && profile.goals.length > 0 && renderProfileDetail(<FaCalendarAlt />, "Metas", profile.goals)}
                {profile?.previousAdvisory && renderProfileDetail(<FaHandshake />, "Asesoría Previa", profile.previousAdvisory)}
                {profile?.supportAreas && profile.supportAreas.length > 0 && renderProfileDetail(<FaBriefcase />, "Áreas de Apoyo", profile.supportAreas)}
              </div>
            </div>
          )}

          {profile?.role === "consultor" && (
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
                <FaGraduationCap className="mr-2 text-purple-500" /> Detalles de Consultor
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.ultimoGrado && renderProfileDetail(<FaGraduationCap />, "Último Grado Académico", profile.ultimoGrado)}
                {profile?.areaEstudios && renderProfileDetail(<FaGraduationCap />, "Área de Estudios", profile.areaEstudios)}
                {profile?.anosExperiencia && renderProfileDetail(<FaHourglassHalf />, "Años de Experiencia", profile.anosExperiencia)}
                {profile?.experienciaMipymes && renderProfileDetail(<FaBriefcase />, "Exp. con MiPymes", profile.experienciaMipymes)}
                {profile?.colaboracionInstitucional && renderProfileDetail(<FaHandshake />, "Colaboración Institucional", profile.colaboracionInstitucional)}
                {profile?.areasExperiencia && profile.areasExperiencia.length > 0 && renderProfileDetail(<FaBriefcase />, "Áreas de Experiencia", profile.areasExperiencia)}
                {profile?.industrias && profile.industrias.length > 0 && renderProfileDetail(<FaIndustry />, "Industrias", profile.industrias)}
                {profile?.casoExito && renderProfileDetail(<FaBriefcase />, "Caso de Éxito Relevante", profile.casoExito)}
                {profile?.intervencionPreferida && renderProfileDetail(<FaHandshake />, "Intervención Preferida", profile.intervencionPreferida)}
                {profile?.acompanamiento && renderProfileDetail(<FaHandshake />, "Enfoque de Acompañamiento", profile.acompanamiento)}
                {profile?.modalidad && renderProfileDetail(<FaMapMarkerAlt />, "Modalidad de Consultoría", profile.modalidad)}
                {profile?.herramientasDigitales && profile.herramientasDigitales.length > 0 && renderProfileDetail(<FaTools />, "Herramientas Digitales", profile.herramientasDigitales)}
                {profile?.recursosPropios && renderProfileDetail(<FaFolderOpen />, "Recursos Propios", profile.recursosPropios)}
                {profile?.reportesEstructurados && renderProfileDetail(<FaFileAlt />, "Reportes Estructurados", profile.reportesEstructurados)}
                {profile?.horasSemanales && renderProfileDetail(<FaHourglassHalf />, "Horas Semanales Disp.", profile.horasSemanales)}
                {profile?.trabajoProyecto && renderProfileDetail(<FaBriefcase />, "Proyectos Largo Plazo", profile.trabajoProyecto)}
                {profile?.tarifa && renderProfileDetail(<FaDollarSign />, "Tarifa Preferida", profile.tarifa)}
                {profile?.motivacion && renderProfileDetail(<FaLightbulb />, "Motivación para Unirse", profile.motivacion)}
                {profile?.curriculum && renderProfileDetail(<FaFilePdf />, "CV", <a href={profile.curriculum} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver CV</a>)}
                {profile?.portafolio && renderProfileDetail(<FaBriefcase />, "Portafolio", <a href={profile.portafolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Portafolio</a>)}
                {profile?.linkedin && renderProfileDetail(<FaLinkedin />, "LinkedIn", <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Perfil</a>)}
                {profile?.referencias && renderProfileDetail(<FaUsers />, "Referencias", profile.referencias)}
              </div>
            </div>
          )}

          {profile?.role === "empresa" && (
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-orange-700 mb-4 flex items-center">
                <FaBuilding className="mr-2 text-orange-500" /> Detalles de Empresa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.businessName && renderProfileDetail(<FaHandshake />, "Nombre de la Empresa", profile.businessName)}
                {profile?.businessRelationship && renderProfileDetail(<FaUserCircle />, "Tu Rol", profile.businessRelationship)}
                {profile?.businessStage && renderProfileDetail(<FaHourglassHalf />, "Etapa de la Empresa", profile.businessStage)}
                {profile?.motivation && renderProfileDetail(<FaBriefcase />, "Motivación Principal", profile.motivation)}
                {profile?.mainChallenge && renderProfileDetail(<FaBriefcase />, "Reto Principal", profile.mainChallenge)}
                {profile?.goals && profile.goals.length > 0 && renderProfileDetail(<FaCalendarAlt />, "Metas", profile.goals)}
                {profile?.previousAdvisory && renderProfileDetail(<FaHandshake />, "Asesoría Previa", profile.previousAdvisory)}
                {profile?.supportAreas && profile.supportAreas.length > 0 && renderProfileDetail(<FaBriefcase />, "Áreas de Apoyo", profile.supportAreas)}
              </div>
            </div>
          )}

          {profile?.role === "universidad" && (
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                <FaUniversity className="mr-2 text-red-500" /> Detalles de Universidad
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.businessName && renderProfileDetail(<FaUniversity />, "Nombre de la Universidad", profile.businessName)}
                {profile?.businessRelationship && renderProfileDetail(<FaUserCircle />, "Tu Rol", profile.businessRelationship)}
                {profile?.motivation && renderProfileDetail(<FaBriefcase />, "Motivación Principal", profile.motivation)}
                {profile?.mainChallenge && renderProfileDetail(<FaBriefcase />, "Reto Principal", profile.mainChallenge)}
                {profile?.goals && profile.goals.length > 0 && renderProfileDetail(<FaCalendarAlt />, "Metas", profile.goals)}
                {profile?.supportAreas && profile.supportAreas.length > 0 && renderProfileDetail(<FaBriefcase />, "Áreas de Apoyo", profile.supportAreas)}
              </div>
            </div>
          )}

          {profile?.role === "gobierno" && (
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center">
                <FaLandmark className="mr-2 text-gray-500" /> Detalles de Gobierno
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.businessName && renderProfileDetail(<FaLandmark />, "Entidad Gubernamental", profile.businessName)}
                {profile?.businessRelationship && renderProfileDetail(<FaUserCircle />, "Tu Rol", profile.businessRelationship)}
                {profile?.motivation && renderProfileDetail(<FaBriefcase />, "Motivación Principal", profile.motivation)}
                {profile?.mainChallenge && renderProfileDetail(<FaBriefcase />, "Reto Principal", profile.mainChallenge)}
                {profile?.goals && profile.goals.length > 0 && renderProfileDetail(<FaCalendarAlt />, "Metas", profile.goals)}
                {profile?.supportAreas && profile.supportAreas.length > 0 && renderProfileDetail(<FaBriefcase />, "Áreas de Apoyo", profile.supportAreas)}
              </div>
            </div>
          )}

        </div>
      </div>
    </PrivateLayout>
  );
};

export default Perfil;