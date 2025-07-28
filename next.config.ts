// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'mi-primer-bucket-2025-mentorapp.s3.us-east-2.amazonaws.com', // ¡TU BUCKET S3!
      's3.amazonaws.com', // Un dominio genérico de S3 para mayor compatibilidad
      // Añade cualquier otro dominio de donde cargues imágenes, como 'firebasestorage.googleapis.com'
    ],
  },
  // La sección 'rewrites' que causaba el problema ha sido eliminada o comentada.
  // Si no tienes un backend externo en el puerto 5000, esta configuración no es necesaria
  // y de hecho, impide que tus API Routes de Next.js funcionen.
};

module.exports = nextConfig;
