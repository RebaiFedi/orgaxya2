import { int, mysqlTable, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

export const transactions = mysqlTable("transactions", {
  id: int("id").primaryKey().autoincrement(),
  date: timestamp("date").notNull().defaultNow(),
  notes: varchar("notes", { length: 255 }).notNull(),
  debit: decimal("debit", { precision: 10, scale: 2 }).default("0.00"),
  credit: decimal("credit", { precision: 10, scale: 2 }).default("0.00"),
  category: varchar("category", { length: 100 }),
  paymentMethod: varchar("payment_method", { length: 100 }),
  total: decimal("total", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
