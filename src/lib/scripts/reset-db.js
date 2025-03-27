// Script pour réinitialiser la base de données au démarrage
const path = require('path');
const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

async function resetDatabase() {
  console.log("🔄 Réinitialisation de la base de données au démarrage...");
  
  try {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }
    
    const connection = await mysql.createConnection(connectionString);
    const db = drizzle(connection, { mode: 'default' });
    
    // Définir la table des transactions
    const transactions = {
      name: 'transactions'
    };
    
    // Supprimer toutes les transactions
    await db.delete(transactions);
    
    console.log("✅ Base de données réinitialisée avec succès");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation de la base de données:", error);
    process.exit(1);
  }
}

resetDatabase(); 