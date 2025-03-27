/**
 * Types centralisés pour l'application FinancePro
 */

// Définition du type Transaction pour l'application
export type Transaction = {
  id: number;
  date: string;
  notes: string;
  debit: string;
  credit: string;
  total?: number;
  category?: string | null;
  paymentMethod?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
