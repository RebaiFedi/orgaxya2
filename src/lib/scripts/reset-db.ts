// Script pour réinitialiser la base de données au démarrage
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";
import * as dotenv from "dotenv";
import path from "path";

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function resetDatabase() {
  console.log("🔄 Réinitialisation de la base de données au démarrage...");
  
  try {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }
    
    const connection = await mysql.createConnection(connectionString);
    const db = drizzle(connection, { schema, mode: 'default' });
    
    // Supprimer toutes les transactions
    await db.delete(schema.transactions);
    
    console.log("✅ Base de données réinitialisée avec succès");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation de la base de données:", error);
    process.exit(1);
  }
}

resetDatabase(); 