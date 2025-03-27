"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionsTable } from "@/components/transactions-table";
import { trpc } from "@/lib/trpc/provider";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Plus, 
  PiggyBank, 
  Wallet, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CreditCard,
  BarChart3,
  DollarSign,
  FileSpreadsheet,
  Check
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types";
import { motion } from "framer-motion";
import * as XLSX from 'xlsx';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Utiliser useQuery pour récupérer les transactions
  const { data: transactionsData, refetch } = trpc.getTransactions.useQuery(undefined, {
    enabled: true,
    onSuccess: (data) => {
      setTransactions(data);
    },
    onError: (error) => {
      console.error("Erreur lors de la récupération des transactions:", error);
    }
  });

  // Fonction pour rafraîchir manuellement les transactions
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      await refetch();
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer l'édition d'une transaction
  const handleEdit = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setShowForm(true);
  };

  // Gérer le succès de soumission du formulaire
  const handleFormSuccess = () => {
    setShowForm(false);
    setCurrentTransaction(undefined);
    fetchTransactions();
  };

  // Gérer l'annulation du formulaire
  const handleFormCancel = () => {
    setShowForm(false);
    setCurrentTransaction(undefined);
  };

  // Calculer le solde actuel et les statistiques
  const currentBalance = transactions.length > 0 
    ? transactions[transactions.length - 1].total ?? 1000 
    : 1000; // Utiliser le solde initial si aucune transaction
  
  // Calculer total des dépenses et revenus du mois courant
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });
  
  const monthlyExpenses = currentMonthTransactions.reduce(
    (total, t) => total + parseFloat(t.debit), 
    0
  );
  
  const monthlyIncome = currentMonthTransactions.reduce(
    (total, t) => total + parseFloat(t.credit), 
    0
  );

  // Calculer tendance
  const previousMonthDate = new Date(currentDate);
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonth = previousMonthDate.getMonth();
  const previousYear = previousMonthDate.getFullYear();

  const previousMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === previousMonth && 
           transactionDate.getFullYear() === previousYear;
  });

  const previousMonthExpenses = previousMonthTransactions.reduce(
    (total, t) => total + parseFloat(t.debit), 
    0
  );

  const previousMonthIncome = previousMonthTransactions.reduce(
    (total, t) => total + parseFloat(t.credit), 
    0
  );

  const expensesTrend = previousMonthExpenses === 0 
    ? 100 
    : ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;
  
  const incomeTrend = previousMonthIncome === 0 
    ? 100 
    : ((monthlyIncome - previousMonthIncome) / previousMonthIncome) * 100;

  // Filtrer les transactions selon la recherche
  const filteredTransactions = transactions.filter(transaction => 
    transaction.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Formatage des dates pour l'affichage
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const currentMonthName = monthNames[currentMonth];

  // Fonction pour exporter les transactions en Excel
  const exportToExcel = () => {
    try {
      setIsExporting(true);
      
      // Préparation des données pour l'export
      const exportData = filteredTransactions.map(transaction => ({
        'ID': transaction.id,
        'Date': new Date(transaction.date).toLocaleDateString('fr-FR'),
        'Description': transaction.notes,
        'Catégorie': transaction.category || '-',
        'Méthode de paiement': transaction.paymentMethod || '-',
        'Débit (€)': parseFloat(transaction.debit) > 0 ? parseFloat(transaction.debit).toFixed(2) : '',
        'Crédit (€)': parseFloat(transaction.credit) > 0 ? parseFloat(transaction.credit).toFixed(2) : '',
        'Solde (€)': parseFloat(String(transaction.total || '0')).toFixed(2)
      }));
      
      // Création du workbook et worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      
      // Ajustement des largeurs de colonnes
      const colWidths = [
        { wch: 5 },    // ID
        { wch: 12 },   // Date
        { wch: 40 },   // Description
        { wch: 15 },   // Catégorie
        { wch: 20 },   // Méthode de paiement
        { wch: 12 },   // Débit
        { wch: 12 },   // Crédit
        { wch: 12 }    // Solde
      ];
      worksheet['!cols'] = colWidths;
      
      // Ajout de la feuille au classeur
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
      
      // Génération du fichier et déclenchement du téléchargement
      const fileName = `Transactions_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      // Animation de succès
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      setIsExporting(false);
      alert('Une erreur est survenue lors de l\'exportation. Veuillez réessayer.');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* En-tête avec titre et boutons d'action */}
        <div className="rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 relative">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute right-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent" />
          <div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-gradient-to-bl from-white/10 to-transparent -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr from-white/10 to-transparent translate-y-1/3 -translate-x-1/3 blur-xl" />

          <div className="relative z-10 p-5">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="space-y-2 text-white">
                <h1 className="text-2xl font-bold tracking-tight">
                  Tableau de bord financier
                </h1>
                <div className="flex items-center gap-2 text-blue-100">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{`${currentMonthName} ${currentYear}`}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button 
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  onClick={fetchTransactions}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn(
                    "h-4 w-4", 
                    isRefreshing && "animate-spin"
                  )} />
                </motion.button>
                
                <Dialog open={showForm} onOpenChange={setShowForm}>
                  <DialogTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-blue-600 font-medium shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nouvelle transaction</span>
                    </motion.button>
                  </DialogTrigger>
                  <DialogContent className="p-0 border-none max-w-lg bg-transparent shadow-none" hideCloseButton>
                    <TransactionForm
                      transaction={currentTransaction}
                      onSuccess={handleFormSuccess}
                      onCancel={handleFormCancel}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-blue-300/0 via-blue-300/30 to-blue-300/0 mt-auto" />
        </div>

        {/* Cartes de statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Carte de solde */}
          <motion.div
            whileHover={{ y: -3, boxShadow: "0 8px 20px -1px rgba(59, 130, 246, 0.3)" }}
            transition={{ duration: 0.2 }}
            className="rounded-lg overflow-hidden border-0 shadow-md bg-gradient-to-r from-blue-600 to-blue-500 text-white"
          >
            <div className="p-0">
              <div className="relative">
                <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-gradient-to-bl from-white/10 to-transparent -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 h-12 w-12 rounded-full bg-gradient-to-tr from-white/10 to-transparent translate-y-1/3 -translate-x-1/3"></div>
                <div className="p-5 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-blue-100 uppercase tracking-wider">Solde actuel</p>
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">
                    {currentBalance.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </h3>
                  <p className="text-xs text-blue-100 font-medium">
                    Mise à jour du {new Date().toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Carte de dépenses */}
          <motion.div
            whileHover={{ y: -3, boxShadow: "0 8px 20px -1px rgba(220, 38, 38, 0.3)" }}
            transition={{ duration: 0.2 }}
            className="rounded-lg overflow-hidden border-0 shadow-md bg-gradient-to-r from-red-600 to-red-500 text-white"
          >
            <div className="p-0">
              <div className="relative">
                <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-gradient-to-bl from-white/10 to-transparent -translate-y-1/3 translate-x-1/3"></div>
                <div className="p-5 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-red-100 uppercase tracking-wider">Dépenses</p>
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <ArrowUpRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">
                    {monthlyExpenses.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </h3>
                  <div className="flex items-center mt-1 text-xs font-medium">
                    {expensesTrend > 0 ? (
                      <>
                        <TrendingUp className="mr-1 h-3 w-3" />
                        <span>{`+${Math.abs(expensesTrend).toFixed(1)}% vs. mois dernier`}</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="mr-1 h-3 w-3" />
                        <span>{`-${Math.abs(expensesTrend).toFixed(1)}% vs. mois dernier`}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Carte de revenus */}
          <motion.div
            whileHover={{ y: -3, boxShadow: "0 8px 20px -1px rgba(16, 185, 129, 0.3)" }}
            transition={{ duration: 0.2 }}
            className="rounded-lg overflow-hidden border-0 shadow-md bg-gradient-to-r from-emerald-600 to-emerald-500 text-white"
          >
            <div className="p-0">
              <div className="relative">
                <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-gradient-to-bl from-white/10 to-transparent -translate-y-1/3 translate-x-1/3"></div>
                <div className="p-5 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Revenus</p>
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <ArrowDownRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">
                    {monthlyIncome.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </h3>
                  <div className="flex items-center mt-1 text-xs font-medium">
                    {incomeTrend > 0 ? (
                      <>
                        <TrendingUp className="mr-1 h-3 w-3" />
                        <span>{`+${Math.abs(incomeTrend).toFixed(1)}% vs. mois dernier`}</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="mr-1 h-3 w-3" />
                        <span>{`-${Math.abs(incomeTrend).toFixed(1)}% vs. mois dernier`}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Carte de balance */}
          <motion.div
            whileHover={{ y: -3, boxShadow: "0 8px 20px -1px rgba(124, 58, 237, 0.3)" }}
            transition={{ duration: 0.2 }}
            className="rounded-lg overflow-hidden border-0 shadow-md bg-gradient-to-r from-purple-600 to-purple-500 text-white"
          >
            <div className="p-0">
              <div className="relative">
                <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-gradient-to-bl from-white/10 to-transparent -translate-y-1/3 translate-x-1/3"></div>
                <div className="p-5 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-purple-100 uppercase tracking-wider">Bilan mensuel</p>
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">
                    {(monthlyIncome - monthlyExpenses).toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </h3>
                  <p className="text-xs text-purple-100 font-medium">
                    {monthlyIncome > monthlyExpenses 
                      ? "Excédent ce mois-ci" 
                      : "Déficit ce mois-ci"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section des transactions */}
        <div>
          <div className="mb-5 rounded-lg bg-white dark:bg-slate-950 border border-blue-100 dark:border-blue-800/30 p-6 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-sm">
                  <ArrowUpDown className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-200">Transactions récentes</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Gérez et consultez vos dernières opérations</p>
                </div>
              </div>
              
              <div className="flex sm:flex-row items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-3 py-2 h-9 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40 dark:hover:bg-emerald-900/40 transition-all duration-200 shadow-sm"
                  onClick={exportToExcel}
                  disabled={isExporting || filteredTransactions.length === 0}
                >
                  {isExporting ? (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {isExporting ? "Exporté !" : "Exporter"}
                  </span>
                </motion.button>
                
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher une transaction..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 h-9 bg-white dark:bg-slate-900 rounded-md border border-blue-100 dark:border-blue-800/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Affichage du tableau */}
            {isLoading ? (
              <div className="h-72 w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Chargement des transactions...</p>
                </div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="h-72 w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 max-w-sm text-center p-8">
                  <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <PiggyBank className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mt-2 text-slate-800 dark:text-slate-200">Aucune transaction trouvée</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {searchQuery 
                      ? "Aucune transaction ne correspond à votre recherche. Essayez d'autres termes."
                      : "Vous n'avez pas encore de transactions. Cliquez sur 'Nouvelle transaction' pour en ajouter une."}
                  </p>
                </div>
              </div>
            ) : (
              <TransactionsTable
                transactions={filteredTransactions}
                onRefresh={fetchTransactions}
                onEdit={handleEdit}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
