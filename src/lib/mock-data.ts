// Types
export type Transaction = {
  id: number;
  date: Date;
  notes: string;
  debit: string;
  credit: string;
  total?: number;
  category?: string;
  paymentMethod?: string;
};

// Base de données fictive pour les transactions
const transactions: Transaction[] = [
  {
    id: 1,
    date: new Date(2023, 6, 15),
    notes: "Salaire",
    debit: "0.00",
    credit: "2500.00",
    category: "Salaire",
    paymentMethod: "Virement"
  },
  {
    id: 2,
    date: new Date(2023, 6, 16),
    notes: "Loyer",
    debit: "800.00",
    credit: "0.00",
    category: "Logement",
    paymentMethod: "Prélèvement"
  },
  {
    id: 3,
    date: new Date(2023, 6, 17),
    notes: "Courses alimentaires",
    debit: "120.50",
    credit: "0.00",
    category: "Alimentation",
    paymentMethod: "Carte bancaire"
  },
  {
    id: 4,
    date: new Date(2023, 6, 18),
    notes: "Transport en commun",
    debit: "38.00",
    credit: "0.00",
    category: "Transport",
    paymentMethod: "Carte bancaire"
  },
  {
    id: 5,
    date: new Date(2023, 6, 20),
    notes: "Prime",
    debit: "0.00",
    credit: "350.00",
    category: "Salaire",
    paymentMethod: "Virement"
  },
  {
    id: 6,
    date: new Date(2023, 6, 22),
    notes: "Restaurant",
    debit: "45.80",
    credit: "0.00",
    category: "Loisirs",
    paymentMethod: "Carte bancaire"
  },
  {
    id: 7,
    date: new Date(2023, 6, 25),
    notes: "Remboursement santé",
    debit: "0.00",
    credit: "28.50",
    category: "Santé",
    paymentMethod: "Virement"
  },
  {
    id: 8,
    date: new Date(2023, 6, 28),
    notes: "Facture électricité",
    debit: "75.30",
    credit: "0.00",
    category: "Logement",
    paymentMethod: "Prélèvement"
  },
  {
    id: 9,
    date: new Date(2023, 6, 30),
    notes: "Achat vêtements",
    debit: "95.60",
    credit: "0.00",
    category: "Shopping",
    paymentMethod: "Carte bancaire"
  },
  {
    id: 10,
    date: new Date(2023, 7, 1),
    notes: "Facture téléphone",
    debit: "19.99",
    credit: "0.00",
    category: "Communication",
    paymentMethod: "Prélèvement"
  }
];

// Mock DB Operations
export const mockDb = {
  getTransactions: () => {
    return [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
  },
  
  addTransaction: (transaction: Omit<Transaction, "id">) => {
    const newId = Math.max(...transactions.map(t => t.id)) + 1;
    const newTransaction = {
      ...transaction,
      id: newId
    };
    transactions.push(newTransaction);
    return newTransaction;
  },
  
  updateTransaction: (transaction: Transaction) => {
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index === -1) {
      throw new Error("Transaction non trouvée");
    }
    transactions[index] = transaction;
    return transaction;
  },
  
  deleteTransaction: (id: number) => {
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error("Transaction non trouvée");
    }
    const deletedTransaction = transactions[index];
    transactions.splice(index, 1);
    return deletedTransaction;
  }
};
