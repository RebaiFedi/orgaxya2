import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Fonction pour créer la connexion à la base de données
export async function createConnection() {
  // Vérifier qu'on est côté serveur
  if (typeof window !== 'undefined') {
    throw new Error("Cette fonction ne peut être exécutée que côté serveur");
  }

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }
  
  const connection = await mysql.createConnection(connectionString);
  return drizzle(connection, { schema, mode: 'default' });
}

// Version synchrone pour les contextes où await n'est pas possible
let _connection: ReturnType<typeof drizzle> | null = null;

export function getDbConnection() {
  // Vérifier qu'on est côté serveur
  if (typeof window !== 'undefined') {
    throw new Error("Cette fonction ne peut être exécutée que côté serveur");
  }

  if (!_connection) {
    throw new Error("Database connection not initialized. Call initDb() first.");
  }
  return _connection;
}

export async function initDb() {
  // Vérifier qu'on est côté serveur
  if (typeof window !== 'undefined') {
    throw new Error("Cette fonction ne peut être exécutée que côté serveur");
  }

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }
  
  const connection = await mysql.createConnection(connectionString);
  _connection = drizzle(connection, { schema, mode: 'default' });
  return _connection;
}
