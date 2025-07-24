// pages/api/courses/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../../../lib/dynamodb'; // Importa tu cliente de DynamoDB DocumentClient
import { Curso } from '../../../types/Curso';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Obtiene el ID del curso de la URL dinámica ([id])
  const TABLE_NAME = 'cursos'; // <<-- ¡VERIFICA ESTO! Asegúrate que este nombre coincida EXACTAMENTE con tu tabla en DynamoDB

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID de curso no válido o faltante.' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const command = new GetCommand({
          TableName: TABLE_NAME,
          Key: { id: id }, // <<-- ¡VERIFICA ESTO! Asegúrate que 'id' sea el nombre de tu clave de partición (Primary Key) en DynamoDB
        });

        const { Item } = await ddbDocClient.send(command);

        if (!Item) {
          console.log(`[API] Curso con ID "${id}" no encontrado en la tabla "${TABLE_NAME}".`); // Log más detallado
          return res.status(404).json({ message: 'Curso no encontrado.' });
        }

        // DynamoDB ya devuelve el item como un objeto plano.
        return res.status(200).json(Item as Curso);
      } catch (error: any) {
        console.error(`[API] Error al obtener el curso con ID "${id}" de DynamoDB:`, error);
        // Puedes dar más detalles del error en modo desarrollo:
        const errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor.';
        return res.status(500).json({ message: 'Error interno del servidor al obtener el curso.', error: errorMessage });
      }

    case 'PUT':
      try {
        // Autenticación y Autorización CRÍTICA aquí.
        // Asegúrate de que el usuario tiene permiso para modificar ESTE curso.

        const updatedFields = req.body;

        // Es buena práctica evitar que el ID o instructorId se modifiquen accidentalmente a través de un PUT,
        // ya que son parte de la clave o son inmutables.
        delete updatedFields.id;
        delete updatedFields.instructorId;
        delete updatedFields.fechaCreacion; // La fecha de creación no debería cambiar

        // Añadir la fecha de actualización
        updatedFields.fechaActualizacion = new Date().toISOString();

        // Construir la UpdateExpression para DynamoDB.
        let UpdateExpression = 'set ';
        const ExpressionAttributeNames: { [key: string]: string } = {};
        const ExpressionAttributeValues: { [key: string]: any } = {};
        let first = true;

        for (const key in updatedFields) {
          if (Object.prototype.hasOwnProperty.call(updatedFields, key)) {
            if (!first) UpdateExpression += ', ';
            UpdateExpression += `#${key} = :${key}`;
            ExpressionAttributeNames[`#${key}`] = key;
            ExpressionAttributeValues[`:${key}`] = updatedFields[key];
            first = false;
          }
        }

        const command = new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { id: id as string }, // Especifica el ID del item a actualizar
          UpdateExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
          ReturnValues: 'ALL_NEW', // Devuelve el ítem completo después de la actualización
        });

        const { Attributes } = await ddbDocClient.send(command);

        return res.status(200).json({ message: 'Curso actualizado exitosamente.', updatedCourse: Attributes as Curso });
      } catch (error: any) {
        console.error(`[API] Error al actualizar el curso con ID "${id}" en DynamoDB:`, error);
        const errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor.';
        return res.status(500).json({ message: 'Error interno del servidor al actualizar el curso.', error: errorMessage });
      }

    case 'DELETE':
      try {
        // Autenticación y Autorización CRÍTICA aquí.
        // Asegúrate de que el usuario tiene permiso para eliminar ESTE curso.

        await ddbDocClient.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { id: id as string }, // Especifica el ID del item a eliminar
        }));

        // Opcional: Si el curso tiene imágenes o videos en S3,
        // deberías añadir lógica aquí para eliminarlos de S3 también.
        // Esto requeriría el SDK de S3 y una configuración similar de credenciales.

        return res.status(200).json({ message: 'Curso eliminado exitosamente.' });
      } catch (error: any) {
        console.error(`[API] Error al eliminar el curso con ID "${id}" de DynamoDB:`, error);
        const errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor.';
        return res.status(500).json({ message: 'Error interno del servidor al eliminar el curso.', error: errorMessage });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}