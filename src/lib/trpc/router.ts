import { z } from 'zod';
import { publicProcedure, router } from './server';
import { 
  getAllTransactions, 
  insertTransaction, 
  updateTransaction as updateDbTransaction, 
  deleteTransaction as deleteDbTransaction 
} from '../db/transactions';

// Schéma de validation pour les transactions
const transactionSchema = z.object({
  date: z.union([
    z.date(),
    z.string().transform((str) => new Date(str))
  ]),
  notes: z.string().min(1, "La description est requise"),
  debit: z.number().optional().default(0),
  credit: z.number().optional().default(0),
  category: z.string().optional(),
  paymentMethod: z.string().optional(),
});

const updateTransactionSchema = transactionSchema.extend({
  id: z.number(),
});

export const appRouter = router({
  // Récupérer toutes les transactions
  getTransactions: publicProcedure.query(async () => {
    return await getAllTransactions();
  }),
  
  // Ajouter une nouvelle transaction
  addTransaction: publicProcedure
    .input(transactionSchema)
    .mutation(async ({ input }) => {
      return await insertTransaction({
        date: input.date,
        notes: input.notes,
        debit: input.debit ? input.debit.toString() : "0.00",
        credit: input.credit ? input.credit.toString() : "0.00",
        category: input.category,
        paymentMethod: input.paymentMethod,
      });
    }),
  
  // Mettre à jour une transaction existante
  updateTransaction: publicProcedure
    .input(updateTransactionSchema)
    .mutation(async ({ input }) => {
      return await updateDbTransaction(input.id, {
        date: input.date,
        notes: input.notes,
        debit: input.debit ? input.debit.toString() : "0.00",
        credit: input.credit ? input.credit.toString() : "0.00",
        category: input.category,
        paymentMethod: input.paymentMethod,
      });
    }),
  
  // Supprimer une transaction
  deleteTransaction: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteDbTransaction(input.id);
    }),
});

export type AppRouter = typeof appRouter;
