"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { 
  ArrowUpDown, 
  BookText, 
  Calendar,
  Search,
  Plus,
  RefreshCw,
  FileDown,
  Filter,
  BookOpen,
  SlidersHorizontal,
  ChevronsDown,
  ArrowDownCircle,
  ArrowUpCircle,
  CircleDollarSign,
  Info,
  CalendarDays,
  Receipt,
  ChevronUp,
  Check
} from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transaction-form";
import { Transaction } from "@/types";
import { trpc } from "@/lib/trpc/provider";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 10;

  // Récupérer les transactions
  const { data: transactionsData, refetch } = trpc.getTransactions.useQuery(undefined, {
    enabled: true,
    onSuccess: (data) => {
      setTransactions(data);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Erreur lors de la récupération des transactions:", error);
      setIsLoading(false);
    }
  });

  // Mutation pour supprimer une transaction
  const deleteTransactionMutation = trpc.deleteTransaction.useMutation({
    onSuccess: () => {
      fetchTransactions();
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression:", error);
    }
  });

  // Fonction pour rafraîchir les transactions
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

  // Gérer le succès du formulaire
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

  // Supprimer une transaction
  const handleDelete = async (id: number) => {
    try {
      deleteTransactionMutation.mutate({ id });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Filtrer les transactions selon la recherche
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction =>
      transaction.notes.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  // Helper pour les colonnes de la table
  const columnHelper = createColumnHelper<Transaction>();

  // Indicateur de tri
  const renderSortIndicator = (column: any) => (
    <div className="ml-1 text-muted-foreground">
      {column.getIsSorted() === "asc" ? (
        <div className="h-3.5 w-3.5 flex flex-col items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-primary mb-[1px]" />
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[3px] border-foreground/30" />
        </div>
      ) : column.getIsSorted() === "desc" ? (
        <div className="h-3.5 w-3.5 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[3px] border-foreground/30 mb-[1px]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </div>
  );

  // Définir les colonnes
  const columns = [
    columnHelper.accessor("date", {
      header: ({ column }) => (
        <div className="flex items-center gap-1.5 group">
          <div className="text-muted-foreground rounded-md bg-muted/40 w-6 h-6 flex items-center justify-center">
            <CalendarDays className="h-3 w-3" />
          </div>
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium uppercase tracking-wide group-hover:text-foreground text-muted-foreground/80 transition-colors flex items-center"
          >
            Date
            {renderSortIndicator(column)}
          </button>
        </div>
      ),
      cell: (info) => {
        const date = new Date(info.getValue());
        return (
          <div className="flex items-center py-1">
            <div className="grid place-items-center rounded-md bg-muted/30 w-9 h-9 text-center">
              <span className="text-[10px] uppercase font-medium text-muted-foreground/80">
                {format(date, "MMM", { locale: fr })}
              </span>
              <span className="text-sm font-bold leading-none -mt-0.5">
                {format(date, "dd", { locale: fr })}
              </span>
            </div>
            <div className="ml-3 text-xs font-medium text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded">
              {format(date, "yyyy", { locale: fr })}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("notes", {
      header: ({ column }) => (
        <div className="flex items-center gap-1.5 group">
          <div className="text-muted-foreground rounded-md bg-muted/40 w-6 h-6 flex items-center justify-center">
            <Receipt className="h-3 w-3" />
          </div>
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium uppercase tracking-wide group-hover:text-foreground text-muted-foreground/80 transition-colors flex items-center"
          >
            Description
            {renderSortIndicator(column)}
          </button>
        </div>
      ),
      cell: (info) => {
        const value = info.getValue();
        const transaction = info.row.original;
        const isDebit = parseFloat(transaction.debit) > 0;
        
        return (
          <div className="flex items-center gap-3 py-1">
            <div className={cn(
              "w-0.5 h-10 self-stretch rounded-full",
              isDebit 
                ? "bg-gradient-to-b from-destructive/30 to-destructive/70" 
                : "bg-gradient-to-b from-emerald-400/30 to-emerald-500/70"
            )} />
            <div className="max-w-xs truncate font-medium">{value}</div>
          </div>
        );
      },
    }),
    columnHelper.accessor("debit", {
      header: ({ column }) => (
        <div className="flex items-center justify-end gap-1.5 group">
          <div className="text-destructive/70 rounded-md bg-destructive/10 w-6 h-6 flex items-center justify-center">
            <ArrowUpCircle className="h-3 w-3" />
          </div>
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium uppercase tracking-wide group-hover:text-foreground text-muted-foreground/80 transition-colors flex items-center"
          >
            Débit
            {renderSortIndicator(column)}
          </button>
        </div>
      ),
      cell: (info) => {
        const value = parseFloat(info.getValue() || "0");
        return !isNaN(value) && value > 0 ? (
          <div className="text-right font-medium text-destructive/90 flex items-center justify-end gap-2 pr-2">
            {value.toLocaleString("fr-FR", {
              style: "currency",
              currency: "USD",
            })}
          </div>
        ) : (
          <div className="text-right text-muted-foreground">—</div>
        );
      },
    }),
    columnHelper.accessor("credit", {
      header: ({ column }) => (
        <div className="flex items-center justify-end gap-1.5 group">
          <div className="text-emerald-600/70 rounded-md bg-emerald-500/10 w-6 h-6 flex items-center justify-center">
            <ArrowDownCircle className="h-3 w-3" />
          </div>
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium uppercase tracking-wide group-hover:text-foreground text-muted-foreground/80 transition-colors flex items-center"
          >
            Crédit
            {renderSortIndicator(column)}
          </button>
        </div>
      ),
      cell: (info) => {
        const value = parseFloat(info.getValue() || "0");
        return !isNaN(value) && value > 0 ? (
          <div className="text-right font-medium text-emerald-600/90 flex items-center justify-end gap-2 pr-2">
            {value.toLocaleString("fr-FR", {
              style: "currency",
              currency: "USD",
            })}
          </div>
        ) : (
          <div className="text-right text-muted-foreground">—</div>
        );
      },
    }),
    columnHelper.accessor("total", {
      header: ({ column }) => (
        <div className="flex items-center justify-end gap-1.5 group">
          <div className="text-muted-foreground rounded-md bg-muted/40 w-6 h-6 flex items-center justify-center">
            <CircleDollarSign className="h-3 w-3" />
          </div>
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium uppercase tracking-wide group-hover:text-foreground text-muted-foreground/80 transition-colors flex items-center"
          >
            Solde
            {renderSortIndicator(column)}
          </button>
        </div>
      ),
      cell: (info) => {
        const valueRaw = info.getValue();
        const value = valueRaw !== null && valueRaw !== undefined ? parseFloat(String(valueRaw)) : null;
        return (
          <div className={cn(
            "text-right font-medium pr-2",
            value !== null && !isNaN(value) ? (
              value < 0 ? "text-destructive/90" : "text-emerald-600/90" 
            ) : "text-muted-foreground"
          )}>
            {value !== null && !isNaN(value) 
              ? value.toLocaleString("fr-FR", { style: "currency", currency: "USD" }) 
              : "1 000,00 $"}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => (
        <div className="flex items-center justify-center">
          <div className="text-muted-foreground rounded-md bg-muted/40 w-6 h-6 flex items-center justify-center">
            <SlidersHorizontal className="h-3 w-3" />
          </div>
        </div>
      ),
      cell: (info) => {
        const transaction = info.row.original;
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Options de transaction
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center text-sm mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTransaction(transaction);
                    setShowDetails(true);
                  }}
                >
                  <Info className="mr-2 h-3.5 w-3.5" />
                  <span>Voir détails</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(transaction);
                  }}
                >
                  <Filter className="mr-2 h-3.5 w-3.5" />
                  <span>Modifier</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center text-sm text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(transaction.id);
                  }}
                >
                  <Plus className="mr-2 h-3.5 w-3.5 rotate-45" />
                  <span>Supprimer</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ];

  // Configurer le tableau
  const table = useReactTable({
    data: filteredTransactions,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(filteredTransactions.length / pageSize),
  });

  // Calcul des pages pour la pagination
  const pageCount = Math.ceil(filteredTransactions.length / pageSize);

  // Fonction pour exporter les données au format CSV
  const exportTransactions = () => {
    try {
      setIsExporting(true);
      
      // Créer l'en-tête du CSV
      const headers = ["Date", "Description", "Catégorie", "Méthode de paiement", "Débit", "Crédit", "Total"];
      
      // Formatter les données des transactions
      const csvData = transactions.map(transaction => {
        const date = new Date(transaction.date);
        const formattedDate = format(date, "dd/MM/yyyy", { locale: fr });
        const debit = parseFloat(transaction.debit) > 0 ? parseFloat(transaction.debit).toLocaleString("fr-FR", { minimumFractionDigits: 2 }) : "";
        const credit = parseFloat(transaction.credit) > 0 ? parseFloat(transaction.credit).toLocaleString("fr-FR", { minimumFractionDigits: 2 }) : "";
        const total = transaction.total?.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) || "";
        const category = transaction.category || "";
        const paymentMethod = transaction.paymentMethod || "";
        
        return [
          formattedDate,
          transaction.notes,
          category,
          paymentMethod,
          debit,
          credit,
          total
        ];
      });
      
      // Combiner l'en-tête et les données
      const csvContent = [
        headers.join(";"),
        ...csvData.map(row => row.join(";"))
      ].join("\n");
      
      // Créer un blob pour le téléchargement
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      // Créer un lien pour le téléchargement et cliquer dessus
      const link = document.createElement("a");
      const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm", { locale: fr });
      const filename = `journal_transactions_${timestamp}.csv`;
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Afficher un toast de confirmation
      toast.success("Exportation réussie", {
        description: `Le fichier ${filename} a été téléchargé`,
        duration: 3000,
        icon: <Check className="h-4 w-4 text-green-500" />
      });
      
      // Nettoyer l'URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setIsExporting(false);
      }, 100);
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      setIsExporting(false);
      
      // Afficher un toast d'erreur
      toast.error("Échec de l'exportation", {
        description: "Une erreur est survenue lors de l'exportation des données",
        duration: 3000
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 overflow-hidden">
        {/* En-tête de page avec design amélioré */}
        <div className="rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 relative">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute right-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent" />
          <div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-gradient-to-bl from-white/10 to-transparent -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr from-white/10 to-transparent translate-y-1/3 -translate-x-1/3 blur-xl" />

          <div className="relative z-10 p-5">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="space-y-2 text-white">
                <h1 className="text-2xl font-bold tracking-tight">
                  Journal des Transactions
                </h1>
                <div className="flex items-center gap-2 text-blue-100">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Suivez et gérez toutes vos transactions</span>
                </div>
              </div>
              
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
                  <DialogTitle className="sr-only">
                    {currentTransaction ? "Modifier la transaction" : "Nouvelle transaction"}
                  </DialogTitle>
                  {showForm && (
                    <TransactionForm
                      transaction={currentTransaction}
                      onSuccess={handleFormSuccess}
                      onCancel={handleFormCancel}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-blue-300/0 via-blue-300/30 to-blue-300/0 mt-auto" />
        </div>

        {/* Cards d'aperçu statistique */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <CircleDollarSign className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">
                    {(() => {
                      // Calculer le solde actuel dynamiquement comme dans la page d'accueil
                      if (transactions.length > 0) {
                        // Trier les transactions par date
                        const sortedTransactions = [...transactions].sort(
                          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                        );
                        // Récupérer le solde de la dernière transaction
                        const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
                        if (lastTransaction.total !== undefined && lastTransaction.total !== null) {
                          return lastTransaction.total.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "USD",
                          });
                        }
                      }
                      // Valeur par défaut - solde initial de 1000€
                      return "1 000,00 $";
                    })()}
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
                    <p className="text-xs font-medium text-red-100 uppercase tracking-wider">Total des débits</p>
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <ArrowUpCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">
                    {transactions.reduce((total, transaction) => {
                      const debitValue = parseFloat(transaction.debit || "0");
                      return isNaN(debitValue) ? total : total + debitValue;
                    }, 0).toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </h3>
                  <p className="text-xs text-red-100 font-medium">
                    Total de toutes les transactions
                  </p>
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
                    <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Total des crédits</p>
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <ArrowDownCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">
                    {transactions.reduce((total, transaction) => {
                      const creditValue = parseFloat(transaction.credit || "0");
                      return isNaN(creditValue) ? total : total + creditValue;
                    }, 0).toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </h3>
                  <p className="text-xs text-emerald-100 font-medium">
                    Total de toutes les transactions
                  </p>
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
                    <p className="text-xs font-medium text-purple-100 uppercase tracking-wider">Transactions</p>
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <CalendarDays className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">
                    {transactions.length}
                  </h3>
                  <p className="text-xs text-purple-100 font-medium">
                    Nombre total de transactions
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Interface du tableau de transactions */}
        <div className="mb-5 rounded-lg bg-white dark:bg-slate-950 border border-blue-100 dark:border-blue-800/30 p-6 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-sm">
                <ArrowUpDown className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-200">Historique des transactions</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gérez et consultez toutes vos opérations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 rounded-md shadow-sm border-blue-100 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all duration-200"
                      onClick={fetchTransactions}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs bg-white dark:bg-slate-900 font-medium shadow-lg border border-blue-100 dark:border-blue-800/30">
                    Rafraîchir les données
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 rounded-md shadow-sm border-blue-100 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all duration-200"
                      onClick={exportTransactions}
                      disabled={isExporting || transactions.length === 0}
                    >
                      {isExporting ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      ) : (
                        <FileDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs bg-white dark:bg-slate-900 font-medium shadow-lg border border-blue-100 dark:border-blue-800/30">
                    Exporter les données
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 rounded-md shadow-sm border-blue-100 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all duration-200"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs bg-white dark:bg-slate-900 font-medium shadow-lg border border-blue-100 dark:border-blue-800/30">
                    Filtrer les transactions
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 rounded-md shadow-sm border-blue-100 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all duration-200"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs bg-white dark:bg-slate-900 font-medium shadow-lg border border-blue-100 dark:border-blue-800/30">
                    Options d'affichage
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
            <div className="overflow-x-auto w-full rounded-lg border border-blue-100 dark:border-blue-800/30">
              <Table>
                <TableHeader className="bg-blue-50/50 dark:bg-blue-900/10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-b border-blue-100 dark:border-blue-800/30 hover:bg-transparent">
                      {headerGroup.headers.map((header) => (
                        <TableHead 
                          key={header.id}
                          className={cn(
                            "px-4 py-3.5 h-11 text-slate-600 dark:text-slate-300",
                            header.column.id === "actions" && "w-10",
                            ["debit", "credit", "total"].includes(header.column.id) && "text-right"
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row, index) => (
                      <TableRow 
                        key={row.id} 
                        className={cn(
                          "group transition-all hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer border-b border-blue-100 dark:border-blue-800/30 last:border-0",
                          index % 2 === 0 ? "bg-transparent" : "bg-slate-50/50 dark:bg-slate-900/5"
                        )}
                        onClick={() => {
                          setSelectedTransaction(row.original);
                          setShowDetails(true);
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell 
                            key={cell.id}
                            className={cn(
                              "px-4 h-14 text-slate-700 dark:text-slate-300",
                              cell.column.id === "actions" && "w-10",
                              ["debit", "credit", "total"].includes(cell.column.id) && "text-right",
                              cell.column.id === "notes" && "max-w-xs"
                            )}
                            onClick={(e) => {
                              if (cell.column.id === "actions") {
                                e.stopPropagation();
                              }
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-slate-500 dark:text-slate-400"
                      >
                        Aucun résultat trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination plus moderne */}
          {filteredTransactions.length > 0 && (
            <div className="flex items-center justify-between mt-5 px-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span className="hidden sm:inline">Lignes </span>{currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, filteredTransactions.length)}<span className="mx-1 opacity-50">/</span>{filteredTransactions.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setCurrentPage((old) => Math.max(old - 1, 0))}
                  disabled={currentPage === 0}
                >
                  <ChevronUp className="h-3.5 w-3.5 rotate-90" />
                </Button>
                {Array.from({ length: Math.min(5, pageCount) }).map((_, i) => {
                  const pageIndex = currentPage < 2
                    ? i
                    : currentPage > pageCount - 3
                      ? pageCount - 5 + i
                      : currentPage - 2 + i;
                  
                  if (pageIndex >= pageCount) return null;
                  
                  return (
                    <Button
                      key={pageIndex}
                      variant={pageIndex === currentPage ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-7 w-7 text-xs p-0 rounded-md font-mono",
                        pageIndex === currentPage ? "bg-blue-600 text-white" : "text-slate-700 dark:text-slate-300 border-blue-100 dark:border-blue-800/30"
                      )}
                      onClick={() => setCurrentPage(pageIndex)}
                    >
                      {pageIndex + 1}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setCurrentPage((old) => Math.min(old + 1, pageCount - 1))}
                  disabled={currentPage === pageCount - 1}
                >
                  <ChevronUp className="h-3.5 w-3.5 -rotate-90" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails amélioré */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden rounded-xl border-none shadow-xl">
          {selectedTransaction && (
            <>
              <DialogTitle className="sr-only">
                Détails de la transaction: {selectedTransaction.notes}
              </DialogTitle>
              
              <div className="overflow-hidden">
                {/* En-tête avec dégradé */}
                <div className={cn(
                  "px-6 pt-5 pb-5 relative",
                  parseFloat(selectedTransaction.debit) > 0 
                    ? "bg-gradient-to-r from-red-600/90 to-red-500" 
                    : "bg-gradient-to-r from-emerald-600/90 to-emerald-500"
                )}>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0aDN2M2gtM3pNNTEgNjhoM3YzaC0zek0xNyAxN2gzdjNoLTN6TTM0IDVoM3YzaC0zeiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-1">
                      <Badge 
                        variant={parseFloat(selectedTransaction.debit) > 0 ? "destructive" : "default"} 
                        className={cn(
                          "rounded-md px-2.5 py-0.5 gap-1.5 h-5 border-none",
                          parseFloat(selectedTransaction.debit) > 0 
                            ? "bg-white/20 text-white hover:bg-white/30" 
                            : "bg-white/20 text-white hover:bg-white/30"
                        )}
                      >
                        {parseFloat(selectedTransaction.debit) > 0 ? (
                          <>
                            <ArrowUpCircle className="h-3 w-3" />
                            <span className="text-[10px] font-medium">Débit</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownCircle className="h-3 w-3" /> 
                            <span className="text-[10px] font-medium">Crédit</span>
                          </>
                        )}
                      </Badge>
                      <div className="text-[10px] text-white/70 bg-white/10 py-0.5 px-1.5 rounded backdrop-blur-sm font-mono">
                        #{selectedTransaction.id}
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-1">
                      {selectedTransaction.notes}
                    </h2>
                    
                    <div className="flex items-center gap-1.5 text-xs text-white/80">
                      <CalendarDays className="h-3 w-3" />
                      {format(new Date(selectedTransaction.date), "PPPP", { locale: fr })}
                    </div>
                    
                    {/* Montant principal */}
                    <div className="mt-5 mb-1">
                      <div className="text-3xl font-bold text-white flex items-center">
                        {parseFloat(selectedTransaction.debit) > 0 
                          ? parseFloat(selectedTransaction.debit).toLocaleString("fr-FR", {
                              style: "currency",
                              currency: "USD",
                            }) 
                          : parseFloat(selectedTransaction.credit).toLocaleString("fr-FR", {
                              style: "currency",
                              currency: "USD",
                            })}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contenu principal */}
                <div className="bg-card px-6 pt-6 pb-3">
                  <div className="grid gap-5">
                    {/* Détails financiers */}
                    <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <ArrowUpCircle className="h-3 w-3 text-destructive/70" />
                            Débit
                          </div>
                          <div className={cn(
                            "text-sm font-semibold",
                            parseFloat(selectedTransaction.debit) > 0 ? "text-destructive" : ""
                          )}>
                            {parseFloat(selectedTransaction.debit) > 0 
                              ? parseFloat(selectedTransaction.debit).toLocaleString("fr-FR", {
                                  style: "currency",
                                  currency: "USD",
                                }) 
                              : "—"}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <ArrowDownCircle className="h-3 w-3 text-emerald-600/70" />
                            Crédit
                          </div>
                          <div className={cn(
                            "text-sm font-semibold",
                            parseFloat(selectedTransaction.credit) > 0 ? "text-emerald-600" : ""
                          )}>
                            {parseFloat(selectedTransaction.credit) > 0 
                              ? parseFloat(selectedTransaction.credit).toLocaleString("fr-FR", {
                                  style: "currency",
                                  currency: "USD",
                                }) 
                              : "—"}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <CircleDollarSign className="h-3 w-3" />
                            Solde après
                          </div>
                          <div className={cn(
                            "text-sm font-semibold", 
                            selectedTransaction.total !== undefined && selectedTransaction.total < 0 
                              ? "text-destructive" 
                              : "text-emerald-600"
                          )}>
                            {selectedTransaction.total !== undefined 
                              ? selectedTransaction.total.toLocaleString("fr-FR", {
                                  style: "currency",
                                  currency: "USD",
                                }) 
                              : "1 000,00 $"}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informations sur la catégorie et le moyen de paiement */}
                    {(selectedTransaction.category || selectedTransaction.paymentMethod) && (
                      <div>
                        <div className="grid grid-cols-2 gap-5">
                          {selectedTransaction.category && (
                            <div className="bg-muted/20 rounded-lg border border-border/40 p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-7 w-7 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                                    <path d="M11 17h4"></path><path d="M11 19h7"></path><path d="M11 15h10"></path><path d="M11 13h10"></path>
                                    <path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
                                    <path d="M7 8a1 1 0 1 1 -2 0a1 1 0 0 1 2 0"></path>
                                    <path d="M7 12a1 1 0 1 1 -2 0a1 1 0 0 1 2 0"></path>
                                    <path d="M7 16a1 1 0 1 1 -2 0a1 1 0 0 1 2 0"></path>
                                  </svg>
                                </div>
                                <div className="text-sm font-semibold">Catégorie</div>
                              </div>
                              <div className={cn(
                                "px-3 py-1.5 bg-background rounded border border-border/40 text-sm font-medium",
                                !selectedTransaction.category && "text-muted-foreground italic"
                              )}>
                                {selectedTransaction.category || "Non spécifiée"}
                              </div>
                            </div>
                          )}
                          
                          {selectedTransaction.paymentMethod && (
                            <div className="bg-muted/20 rounded-lg border border-border/40 p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-7 w-7 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                    <line x1="2" y1="10" x2="22" y2="10"></line>
                                  </svg>
                                </div>
                                <div className="text-sm font-semibold">Moyen de paiement</div>
                              </div>
                              <div className={cn(
                                "px-3 py-1.5 bg-background rounded border border-border/40 text-sm font-medium",
                                !selectedTransaction.paymentMethod && "text-muted-foreground italic"
                              )}>
                                {selectedTransaction.paymentMethod || "Non spécifié"}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Pied de fenêtre */}
                <div className="flex justify-between items-center gap-3 py-4 px-6 border-t border-border/40 bg-muted/10">
                  <Button 
                    variant="secondary"
                    onClick={() => setShowDetails(false)}
                    className={cn(
                      "h-10 px-5 text-sm gap-2 rounded-full border-0 transition-all duration-200 hover:scale-105 active:scale-95 shadow-none",
                      parseFloat(selectedTransaction.debit) > 0 
                        ? "bg-red-50/50 hover:bg-red-100/50 text-red-600 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400" 
                        : "bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-600 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 dark:text-emerald-400"
                    )}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 opacity-70">
                      <path d="M18 6 6 18"/>
                      <path d="m6 6 12 12"/>
                    </svg>
                    Fermer
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        handleDelete(selectedTransaction.id);
                        setShowDetails(false);
                      }}
                      className="h-10 px-5 text-sm gap-2 rounded-full border text-destructive border-destructive/20 hover:bg-destructive/10 hover:scale-105 transition-all duration-200 active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 opacity-70">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      Supprimer
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => {
                        handleEdit(selectedTransaction);
                        setShowDetails(false);
                      }}
                      className={cn(
                        "h-10 px-5 text-sm gap-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95",
                        parseFloat(selectedTransaction.debit) > 0 
                          ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white border-none" 
                          : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white border-none"
                      )}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                        <path d="m15 5 4 4"></path>
                      </svg>
                      Modifier
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
} 