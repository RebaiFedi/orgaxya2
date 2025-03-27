"use client";

import { useState } from "react";
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel
} from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { trpc } from "@/lib/trpc/provider";
import { Transaction } from "@/types";
import { 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  MoreHorizontal,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  Receipt,
  CircleDollarSign,
  Filter,
  Info
} from "lucide-react";
import { Button } from "./ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";

interface TransactionsTableProps {
  transactions: Transaction[];
  onRefresh: () => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionsTable({
  transactions,
  onRefresh,
  onEdit,
}: TransactionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const columnHelper = createColumnHelper<Transaction>();
  
  const deleteTransactionMutation = trpc.deleteTransaction.useMutation({
    onSuccess: () => {
      onRefresh();
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression:", error);
    },
    onSettled: () => {
      setDeletingId(null);
    }
  });

  const renderSortIndicator = (column: any) => (
    <div className="ml-1 text-slate-500 dark:text-slate-400">
      {column.getIsSorted() === "asc" ? (
        <div className="h-3.5 w-3.5 flex flex-col items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mb-[1px]" />
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[3px] border-slate-400/30 dark:border-slate-600/30" />
        </div>
      ) : column.getIsSorted() === "desc" ? (
        <div className="h-3.5 w-3.5 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[3px] border-slate-400/30 dark:border-slate-600/30 mb-[1px]" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
        </div>
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </div>
  );

  const columns = [
    columnHelper.accessor("date", {
      header: ({ column }) => (
        <div className="flex items-center gap-1.5 group">
          <div className="text-blue-600 dark:text-blue-400 rounded-md bg-blue-100/40 dark:bg-blue-900/40 w-6 h-6 flex items-center justify-center">
            <CalendarDays className="h-3 w-3" />
          </div>
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium uppercase tracking-wide group-hover:text-slate-800 dark:group-hover:text-slate-200 text-slate-500 dark:text-slate-400 transition-colors flex items-center"
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
            <div className="grid place-items-center rounded-md bg-blue-50 dark:bg-blue-900/20 w-9 h-9 text-center">
              <span className="text-[10px] uppercase font-medium text-blue-600/80 dark:text-blue-400/80">
                {format(date, "MMM", { locale: fr })}
              </span>
              <span className="text-sm font-bold leading-none -mt-0.5 text-slate-800 dark:text-slate-200">
                {format(date, "dd", { locale: fr })}
              </span>
            </div>
            <div className="ml-3 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-1.5 py-0.5 rounded">
              {format(date, "yyyy", { locale: fr })}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("notes", {
      header: ({ column }) => (
        <div className="flex items-center gap-1.5 group">
          <div className="text-blue-600 dark:text-blue-400 rounded-md bg-blue-100/40 dark:bg-blue-900/40 w-6 h-6 flex items-center justify-center">
            <Receipt className="h-3 w-3" />
          </div>
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium uppercase tracking-wide group-hover:text-slate-800 dark:group-hover:text-slate-200 text-slate-500 dark:text-slate-400 transition-colors flex items-center"
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
                ? "bg-gradient-to-b from-red-500/30 to-red-600/70" 
                : "bg-gradient-to-b from-emerald-400/30 to-emerald-500/70"
            )} />
            <div className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">{value}</div>
          </div>
        );
      },
    }),
    columnHelper.accessor("debit", {
      header: ({ column }) => (
        <div className="flex items-center justify-end gap-1.5 group">
          <div className="text-red-600/70 dark:text-red-500/70 rounded-md bg-red-100/40 dark:bg-red-900/30 w-6 h-6 flex items-center justify-center">
            <ArrowUpCircle className="h-3 w-3" />
          </div>
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium uppercase tracking-wide group-hover:text-slate-800 dark:group-hover:text-slate-200 text-slate-500 dark:text-slate-400 transition-colors flex items-center"
          >
            Débit
            {renderSortIndicator(column)}
          </button>
        </div>
      ),
      cell: (info) => {
        const value = parseFloat(info.getValue());
        return value > 0 ? (
          <div className="text-right font-medium text-red-600 dark:text-red-500 flex items-center justify-end gap-2 pr-2">
            {value.toLocaleString("fr-FR", {
              style: "currency",
              currency: "USD",
            })}
          </div>
        ) : (
          <div className="text-right text-slate-400 dark:text-slate-500">—</div>
        );
      },
    }),
    columnHelper.accessor("credit", {
      header: ({ column }) => (
        <div className="flex items-center justify-end gap-1.5 group">
          <div className="text-emerald-600/70 dark:text-emerald-500/70 rounded-md bg-emerald-100/40 dark:bg-emerald-900/30 w-6 h-6 flex items-center justify-center">
            <ArrowDownCircle className="h-3 w-3" />
          </div>
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium uppercase tracking-wide group-hover:text-slate-800 dark:group-hover:text-slate-200 text-slate-500 dark:text-slate-400 transition-colors flex items-center"
          >
            Crédit
            {renderSortIndicator(column)}
          </button>
        </div>
      ),
      cell: (info) => {
        const value = parseFloat(info.getValue());
        return value > 0 ? (
          <div className="text-right font-medium text-emerald-600 dark:text-emerald-500 flex items-center justify-end gap-2 pr-2">
            {value.toLocaleString("fr-FR", {
              style: "currency",
              currency: "USD",
            })}
          </div>
        ) : (
          <div className="text-right text-slate-400 dark:text-slate-500">—</div>
        );
      },
    }),
    columnHelper.accessor("total", {
      header: ({ column }) => (
        <div className="flex items-center justify-end gap-1.5 group">
          <div className="text-blue-600 dark:text-blue-400 rounded-md bg-blue-100/40 dark:bg-blue-900/40 w-6 h-6 flex items-center justify-center">
            <CircleDollarSign className="h-3 w-3" />
          </div>
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium uppercase tracking-wide group-hover:text-slate-800 dark:group-hover:text-slate-200 text-slate-500 dark:text-slate-400 transition-colors flex items-center"
          >
            Solde
            {renderSortIndicator(column)}
          </button>
        </div>
      ),
      cell: (info) => {
        const value = info.getValue();
        return (
          <div className={cn(
            "text-right font-medium px-3 py-1.5 rounded",
            typeof value === 'number' 
              ? (value < 0 
                ? "text-destructive bg-destructive/5" 
                : "text-emerald-600 bg-emerald-500/5") 
              : "text-foreground"
          )}>
            {typeof value === 'number' ? value.toLocaleString("fr-FR", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2
            }) : "0,00 $"}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const transaction = info.row.original;
        const isDeleting = deletingId === transaction.id;
        
        return (
          <div className="flex justify-end">
            <TooltipProvider>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full opacity-50 hover:opacity-100 hover:bg-muted/50 transition-all"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs">Actions</TooltipContent>
                </Tooltip>
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
                    <Eye className="mr-2 h-3.5 w-3.5" />
                    <span>Voir détails</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer flex items-center text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(transaction);
                    }}
                  >
                    <Edit2 className="mr-2 h-3.5 w-3.5" />
                    <span>Modifier</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive flex items-center text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(transaction.id);
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Suppression...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        <span>Supprimer</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: currentPage,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) {
      setDeletingId(id);
      deleteTransactionMutation.mutate({ id });
    }
  };

  const pageCount = Math.ceil(transactions.length / pageSize);
  
  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden border border-border/50 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 px-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <div className="bg-muted w-5 h-5 rounded-md flex items-center justify-center">
              <Filter className="h-3 w-3" />
            </div>
            <span className="text-xs font-medium">{transactions.length} transactions</span>
            <Badge variant="outline" className="ml-1.5 font-mono text-[9px] py-0 h-4 px-1 border-border/40 text-muted-foreground font-normal">
              Triées par date
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs px-2.5 rounded-md gap-1.5 text-muted-foreground hover:text-foreground">
              <Filter className="h-3 w-3" />
              Filtrer
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md">
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Cliquez sur une transaction pour afficher les détails</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <Table className="w-full">
          <TableHeader className="bg-muted/10">
            <TableRow className="border-b-0 hover:bg-transparent">
              {table.getHeaderGroups().map((headerGroup) => (
                headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className={cn(
                      "h-9 px-4 text-xs font-normal",
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
                ))
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow 
                  key={row.id} 
                  className={cn(
                    "group transition-all hover:bg-muted/20 cursor-pointer border-b border-border/30 last:border-0",
                    index % 2 === 0 ? "bg-transparent" : "bg-muted/5"
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
                        "px-4 h-12",
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
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Aucune transaction</p>
                      <p className="text-xs">Ajoutez une nouvelle transaction pour commencer</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between px-1 pt-2">
          <div className="text-xs text-muted-foreground font-mono">
            <span className="hidden sm:inline">Lignes </span>{currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, transactions.length)}<span className="mx-1 opacity-50">/</span>{transactions.length}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setCurrentPage((old) => Math.max(old - 1, 0))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
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
                    pageIndex === currentPage && "pointer-events-none"
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
              className="h-7 w-7 rounded-md"
              onClick={() => setCurrentPage((old) => Math.min(old + 1, pageCount - 1))}
              disabled={currentPage === pageCount - 1}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Fenêtre modale pour afficher les détails d'une transaction */}
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
                              : "0,00 $"}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informations sur la catégorie et le moyen de paiement */}
                    <div>
                      <div className="grid grid-cols-2 gap-5">
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
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pied de fenêtre */}
                <div className="flex justify-end gap-3 py-4 px-6 border-t border-border/40 bg-muted/10">
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
                  <Button 
                    variant="default"
                    onClick={() => {
                      onEdit(selectedTransaction);
                      setShowDetails(false);
                    }}
                    className={cn(
                      "h-10 px-5 text-sm gap-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95",
                      parseFloat(selectedTransaction.debit) > 0 
                        ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white border-none" 
                        : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white border-none"
                    )}
                  >
                    <Edit2 className="h-4 w-4" />
                    Modifier
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
