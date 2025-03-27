import { eq } from "drizzle-orm";
import { createConnection } from ".";
import { transactions } from "./schema";

// Vérifie qu'on est bien côté serveur
const isServer = typeof window === 'undefined';

// Solde initial de 1000€ comme spécifié dans le scénario
const INITIAL_BALANCE = 1000;

export async function getAllTransactions() {
  if (!isServer) {
    throw new Error("Cette fonction ne peut être exécutée que côté serveur");
  }
  
  const db = await createConnection();
  const result = await db.select().from(transactions).orderBy(transactions.date);
  
  // Calculer les soldes après chaque transaction
  let total = INITIAL_BALANCE; // Commence avec le solde initial
  const transactionsWithBalance = result.map((transaction) => {
    const debit = parseFloat(transaction.debit?.toString() || "0");
    const credit = parseFloat(transaction.credit?.toString() || "0");
    
    total = total - debit + credit;
    
    return {
      ...transaction,
      debit: transaction.debit?.toString() || "0.00",
      credit: transaction.credit?.toString() || "0.00",
      total
    };
  });
  
  return transactionsWithBalance;
}

export async function getTransactionById(id: number) {
  if (!isServer) {
    throw new Error("Cette fonction ne peut être exécutée que côté serveur");
  }
  
  const db = await createConnection();
  const result = await db.select().from(transactions).where(eq(transactions.id, id));
  return result[0];
}

export async function insertTransaction(data: {
  date: Date;
  notes: string;
  debit: string;
  credit: string;
  category?: string;
  paymentMethod?: string;
}) {
  if (!isServer) {
    throw new Error("Cette fonction ne peut être exécutée que côté serveur");
  }
  
  const db = await createConnection();
  const result = await db.insert(transactions).values({
    date: data.date,
    notes: data.notes,
    debit: data.debit,
    credit: data.credit,
    category: data.category,
    paymentMethod: data.paymentMethod,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return { id: result[0].insertId, ...data };
}

export async function updateTransaction(id: number, data: {
  date: Date;
  notes: string;
  debit: string;
  credit: string;
  category?: string;
  paymentMethod?: string;
}) {
  if (!isServer) {
    throw new Error("Cette fonction ne peut être exécutée que côté serveur");
  }
  
  const db = await createConnection();
  await db.update(transactions)
    .set({
      date: data.date,
      notes: data.notes,
      debit: data.debit,
      credit: data.credit,
      category: data.category,
      paymentMethod: data.paymentMethod,
      updatedAt: new Date()
    })
    .where(eq(transactions.id, id));
  
  return { id, ...data };
}

export async function deleteTransaction(id: number) {
  if (!isServer) {
    throw new Error("Cette fonction ne peut être exécutée que côté serveur");
  }
  
  const db = await createConnection();
  await db.delete(transactions).where(eq(transactions.id, id));
  return { id };
} 