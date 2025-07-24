// pages/api/courses/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../../../lib/dynamodb'; // ¡Importa solo DynamoDB!
import { Curso } from '../../../types/Curso';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos

// NO DEBE HABER NINGUNA IMPORTACIÓN RELACIONADA CON FIREBASE/FIRESTORE AQUÍ
// por ejemplo, esto NO DEBE ESTAR:
// import { collection, getDocs, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
// import { db } from '../../../lib/firebase';
// import { cursosCollectionRef } from '../../../lib/firestore-collections';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const TABLE_NAME = 'cursos'; // Asegúrate que este nombre coincida EXACTAMENTE con tu tabla en DynamoDB

  if (req.method === 'GET') {
    try {
      // Obtener todos los cursos de la tabla 'cursos' en DynamoDB
      // NOTA: ScanCommand es simple para empezar, pero ineficiente para tablas grandes.
      // Considera usar QueryCommand con índices secundarios para mejor rendimiento.
      const { Items } = await ddbDocClient.send(new ScanCommand({ TableName: TABLE_NAME }));

      // Los elementos de DynamoDB ya vienen como objetos JSON planos.
      // Si quieres ordenar por fecha, asume que 'fechaCreacion' es un string ISO.
      const courses: Curso[] = (Items as Curso[] || []).sort((a, b) => {
        if (a.fechaCreacion && b.fechaCreacion) {
          return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
        }
        return 0; // No hay criterio de ordenación si las fechas no están presentes
      });

      return res.status(200).json(courses);
    } catch (error) {
      console.error("Error al obtener los cursos de DynamoDB:", error);
      return res.status(500).json({ message: 'Error interno del servidor al obtener los cursos.', error: (error as Error).message });
    }
  } else if (req.method === 'POST') {
    try {
      // En un entorno de producción, aquí DEBES implementar autenticación y autorización
      // para asegurar que solo los usuarios autorizados (ej. instructores) puedan crear cursos.

      const { instructorId, instructorNombre, ...newCourseData } = req.body;

      if (!instructorId || !instructorNombre) {
        return res.status(400).json({ message: 'Instructor ID y Nombre son requeridos.' });
      }

      const newCourseId = uuidv4(); // Genera un ID único para el curso (UUID)
      const timestamp = new Date().toISOString(); // Fecha actual en formato ISO 8601

      // Construye el objeto Curso que se va a guardar en DynamoDB.
      // Asegúrate de que todos los campos de tu interfaz 'Curso' estén inicializados,
      // incluso con valores por defecto, para evitar problemas de tipos o datos faltantes.
      const courseToSave: Curso = {
        id: newCourseId,
        titulo: newCourseData.titulo || '',
        descripcionCorta: newCourseData.descripcionCorta || '',
        descripcionLarga: newCourseData.descripcionLarga || '',
        categoria: newCourseData.categoria || '',
        nivel: newCourseData.nivel || '',
        idioma: newCourseData.idioma || '',
        duracionEstimada: newCourseData.duracionEstimada || 0,
        precio: newCourseData.precio || 0,
        moneda: newCourseData.moneda || 'MXN',
        imagenUrl: newCourseData.imagenUrl || '',
        videoIntroduccionUrl: newCourseData.videoIntroduccionUrl || '',
        requisitos: newCourseData.requisitos || [],
        loQueAprenderas: newCourseData.loQueAprenderas || [],
        secciones: newCourseData.secciones || [], // Asegura que 'secciones' sea un array vacío si no viene
        instructorId,
        instructorNombre,
        fechaCreacion: timestamp,
        fechaActualizacion: timestamp,
        publicado: newCourseData.publicado ?? false, // Por defecto 'false' si no se especifica
        numeroCalificaciones: newCourseData.numeroCalificaciones ?? 0,
        calificacionPromedio: newCourseData.calificacionPromedio ?? 0,
        // Si usas 'slug', asegúrate de generarlo o pasarlo aquí:
        // slug: newCourseData.slug || newCourseId, 
      };

      await ddbDocClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: courseToSave, // El objeto Curso completo
      }));

      return res.status(201).json(courseToSave); // Devuelve el objeto completo con el ID generado
    } catch (error) {
      console.error("Error al crear el curso en DynamoDB:", error);
      return res.status(500).json({ message: 'Error interno del servidor al crear el curso.', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}