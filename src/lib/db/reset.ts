import { createConnection } from ".";
import { transactions } from "./schema";

/**
 * Réinitialise la base de données en supprimant toutes les transactions
 */
export async function resetDatabase() {
  console.log("🔄 Réinitialisation de la base de données...");
  
  try {
    const db = await createConnection();
    
    // Supprimer toutes les transactions
    await db.delete(transactions);
    
    console.log("✅ Base de données réinitialisée avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation de la base de données:", error);
  }
} 