// pages/api/courses/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PutCommand, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"; // Agrega QueryCommand
import { ddbDocClient } from '../../../lib/dynamodb';
import { Curso } from '../../../types/Curso';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const TABLE_NAME = 'cursos'; // Asegúrate que este nombre coincida EXACTAMENTE con tu tabla en DynamoDB

  console.log(`[API /api/courses] Recibida solicitud ${req.method}`);

  if (req.method === 'GET') {
    try {
      const { instructorId } = req.query;

      let command;
      if (instructorId) {
        // Si se proporciona instructorId, usa QueryCommand
        console.log(`[API GET /api/courses] Obteniendo cursos para instructorId: ${instructorId}`);
        command = new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'instructorId-index', // <<-- ¡IMPORTANTE! Asegúrate de tener un GSI llamado 'instructorId-index'
          KeyConditionExpression: 'instructorId = :instructorId',
          ExpressionAttributeValues: {
            ':instructorId': instructorId as string,
          },
        });
      } else {
        // Si no hay instructorId, escanea todos los cursos (para la vista pública)
        console.log(`[API GET /api/courses] Escaneando todos los cursos de la tabla "${TABLE_NAME}".`);
        command = new ScanCommand({ TableName: TABLE_NAME });
      }

      const { Items } = await ddbDocClient.send(command);

      const courses: Curso[] = (Items as Curso[] || []).sort((a, b) => {
        if (a.fechaCreacion && b.fechaCreacion) {
          return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
        }
        return 0;
      });

      console.log(`[API GET /api/courses] Cursos encontrados: ${courses.length}`);
      return res.status(200).json(courses);
    } catch (error: any) {
      console.error("[API GET /api/courses] Error al obtener los cursos de DynamoDB:", error);
      return res.status(500).json({ message: 'Error interno del servidor al obtener los cursos.', error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      console.log(`[API POST /api/courses] Intentando crear nuevo curso.`);
      const { instructorId, instructorNombre, ...newCourseData } = req.body;

      if (!instructorId || !instructorNombre) {
        console.warn(`[API POST /api/courses] Instructor ID o Nombre faltante. instructorId: ${instructorId}, instructorNombre: ${instructorNombre}`);
        return res.status(400).json({ message: 'Instructor ID y Nombre son requeridos.' });
      }

      const newCourseId = uuidv4();
      const timestamp = new Date().toISOString();

      const courseToSave: Curso = {
        id: newCourseId,
        titulo: newCourseData.titulo || '',
        descripcionCorta: newCourseData.descripcionCorta || '',
        descripcionLarga: newCourseData.descripcionLarga || '',
        categoria: newCourseData.categoria || '',
        nivel: newCourseData.nivel || 'todos',
        idioma: newCourseData.idioma || 'Español',
        duracionEstimada: newCourseData.duracionEstimada || 0,
        precio: newCourseData.precio || 0,
        moneda: newCourseData.moneda || 'MXN',
        imagenUrl: newCourseData.imagenUrl || '',
        videoIntroduccionUrl: newCourseData.videoIntroduccionUrl || '',
        requisitos: newCourseData.requisitos || [],
        loQueAprenderas: newCourseData.loQueAprenderas || [],
        secciones: newCourseData.secciones || [],
        instructorId,
        instructorNombre,
        fechaCreacion: timestamp,
        fechaActualizacion: timestamp,
        publicado: newCourseData.publicado ?? false,
        numeroCalificaciones: newCourseData.numeroCalificaciones ?? 0,
        calificacionPromedio: newCourseData.calificacionPromedio ?? 0,
      };

      console.log(`[API POST /api/courses] Guardando nuevo curso con ID: ${newCourseId}`);
      await ddbDocClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: courseToSave,
      }));

      console.log(`[API POST /api/courses] Curso creado exitosamente:`, courseToSave);
      return res.status(201).json(courseToSave);
    } catch (error: any) {
      console.error("[API POST /api/courses] Error al crear el curso en DynamoDB:", error);
      return res.status(500).json({ message: 'Error interno del servidor al crear el curso.', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    console.warn(`[API /api/courses] Método ${req.method} no permitido.`);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
