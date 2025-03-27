import { createConnection } from ".";
import { transactions } from "./schema";

async function seed() {
  console.log("🌱 Début du processus de seeding...");
  try {
    const db = await createConnection();
    
    // Vérifier si la base de données contient déjà des données
    const existingTransactions = await db.select().from(transactions);
    if (existingTransactions.length > 0) {
      console.log("La base de données contient déjà des transactions. Skip seeding.");
      return;
    }
    
    // Données initiales pour les transactions
    const seedData = [
      {
        date: new Date(2023, 6, 15),
        notes: "Salaire",
        debit: "0.00",
        credit: "2500.00",
        category: "Salaire",
        paymentMethod: "Virement",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date: new Date(2023, 6, 16),
        notes: "Loyer",
        debit: "800.00",
        credit: "0.00",
        category: "Logement",
        paymentMethod: "Prélèvement",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date: new Date(2023, 6, 17),
        notes: "Courses alimentaires",
        debit: "120.50",
        credit: "0.00",
        category: "Alimentation",
        paymentMethod: "Carte bancaire",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date: new Date(2023, 6, 18),
        notes: "Transport en commun",
        debit: "38.00",
        credit: "0.00",
        category: "Transport",
        paymentMethod: "Carte bancaire",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date: new Date(2023, 6, 20),
        notes: "Prime",
        debit: "0.00",
        credit: "350.00",
        category: "Salaire",
        paymentMethod: "Virement",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date: new Date(2023, 6, 22),
        notes: "Restaurant",
        debit: "45.80",
        credit: "0.00",
        category: "Loisirs",
        paymentMethod: "Carte bancaire",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date: new Date(2023, 6, 25),
        notes: "Remboursement santé",
        debit: "0.00",
        credit: "28.50",
        category: "Santé",
        paymentMethod: "Virement",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date: new Date(2023, 6, 28),
        notes: "Facture électricité",
        debit: "75.30",
        credit: "0.00",
        category: "Logement",
        paymentMethod: "Prélèvement",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date: new Date(2023, 6, 30),
        notes: "Achat vêtements",
        debit: "95.60",
        credit: "0.00",
        category: "Shopping",
        paymentMethod: "Carte bancaire",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date: new Date(2023, 7, 1),
        notes: "Facture téléphone",
        debit: "19.99",
        credit: "0.00",
        category: "Communication",
        paymentMethod: "Prélèvement",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insérer les données
    for (const transaction of seedData) {
      await db.insert(transactions).values(transaction);
    }
    
    console.log("✅ Seeding terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
  }
}

// Exécuter le seed si le script est exécuté directement
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Erreur fatale:", error);
      process.exit(1);
    });
}

export default seed; 