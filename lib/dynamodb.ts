// lib/dynamodb.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_DYNAMODB_REGION, // Correcto: sin NEXT_PUBLIC_
  credentials: {
    accessKeyId: process.env.AWS_DYNAMODB_ACCESS_KEY_ID!, // Correcto: sin NEXT_PUBLIC_
    secretAccessKey: process.env.AWS_DYNAMODB_SECRET_ACCESS_KEY!, // Correcto: sin NEXT_PUBLIC_
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

export { ddbDocClient };