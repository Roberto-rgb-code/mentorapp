// pages/api/courses/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../../../lib/dynamodb'; // Importa tu cliente de DynamoDB DocumentClient
import { Curso } from '../../../types/Curso';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Obtiene el ID del curso de la URL dinámica ([id])
  const TABLE_NAME = 'cursos'; // <<-- ¡VERIFICA ESTO! Asegúrate que este nombre coincida EXACTAMENTE con tu tabla en DynamoDB

  console.log(`[API /api/courses/${id}] Recibida solicitud ${req.method} para ID: ${id}`);

  if (!id || typeof id !== 'string') {
    console.warn(`[API /api/courses/${id}] ID de curso no válido o faltante: ${id}`);
    return res.status(400).json({ message: 'ID de curso no válido o faltante.' });
  }

  switch (req.method) {
    case 'GET':
      try {
        console.log(`[API GET /api/courses/${id}] Intentando obtener curso de la tabla "${TABLE_NAME}" con clave { id: "${id}" }`);
        const command = new GetCommand({
          TableName: TABLE_NAME,
          Key: { id: id }, // <<-- ¡VERIFICA ESTO! Asegúrate que 'id' sea el nombre de tu clave de partición (Primary Key) en DynamoDB
        });

        const { Item } = await ddbDocClient.send(command);

        if (!Item) {
          console.log(`[API GET /api/courses/${id}] Curso con ID "${id}" no encontrado en la tabla "${TABLE_NAME}".`);
          return res.status(404).json({ message: 'Curso no encontrado.' });
        }

        console.log(`[API GET /api/courses/${id}] Curso encontrado:`, Item);
        return res.status(200).json(Item as Curso);
      } catch (error: any) {
        console.error(`[API GET /api/courses/${id}] Error al obtener el curso de DynamoDB:`, error);
        const errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor.';
        return res.status(500).json({ message: 'Error interno del servidor al obtener el curso.', error: errorMessage });
      }

    case 'PUT':
      try {
        console.log(`[API PUT /api/courses/${id}] Intentando actualizar curso con ID: ${id}`);
        const updatedFields = req.body;

        delete updatedFields.id;
        delete updatedFields.instructorId;
        delete updatedFields.fechaCreacion;

        updatedFields.fechaActualizacion = new Date().toISOString();

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

        console.log(`[API PUT /api/courses/${id}] UpdateExpression: ${UpdateExpression}`);
        console.log(`[API PUT /api/courses/${id}] ExpressionAttributeNames:`, ExpressionAttributeNames);
        console.log(`[API PUT /api/courses/${id}] ExpressionAttributeValues:`, ExpressionAttributeValues);

        const command = new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { id: id as string },
          UpdateExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
          ReturnValues: 'ALL_NEW',
        });

        const { Attributes } = await ddbDocClient.send(command);

        console.log(`[API PUT /api/courses/${id}] Curso actualizado exitosamente:`, Attributes);
        return res.status(200).json({ message: 'Curso actualizado exitosamente.', updatedCourse: Attributes as Curso });
      } catch (error: any) {
        console.error(`[API PUT /api/courses/${id}] Error al actualizar el curso en DynamoDB:`, error);
        const errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor.';
        return res.status(500).json({ message: 'Error interno del servidor al actualizar el curso.', error: errorMessage });
      }

    case 'DELETE':
      try {
        console.log(`[API DELETE /api/courses/${id}] Intentando eliminar curso con ID: ${id}`);
        await ddbDocClient.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { id: id as string },
        }));

        console.log(`[API DELETE /api/courses/${id}] Curso eliminado exitosamente.`);
        return res.status(200).json({ message: 'Curso eliminado exitosamente.' });
      } catch (error: any) {
        console.error(`[API DELETE /api/courses/${id}] Error al eliminar el curso de DynamoDB:`, error);
        const errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor.';
        return res.status(500).json({ message: 'Error interno del servidor al eliminar el curso.', error: errorMessage });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      console.warn(`[API /api/courses/${id}] Método ${req.method} no permitido.`);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
