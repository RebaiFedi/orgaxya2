"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/provider";
import { Transaction } from "@/types";
import { 
  Calendar, 
  ArrowDown, 
  ArrowUp,
  Save,
  Check,
  AlertCircle,
  Receipt,
  Euro,
  Banknote,
  CalendarDays,
  LayoutGrid,
  CreditCard,
  Landmark,
  ChevronRight,
  X
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DialogClose, DialogTitle } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Schéma de validation avec Zod
const transactionSchema = z.object({
  notes: z.string().min(1, "La description est requise"),
  debit: z.string().optional(),
  credit: z.string().optional(),
  date: z.date(),
  category: z.string().optional(),
  paymentMethod: z.string().optional(),
  transactionType: z.enum(["debit", "credit"])
}).refine((data) => {
  if (data.transactionType === 'debit') {
    const value = parseFloat(data.debit || '0');
    return value > 0;
  } else {
    const value = parseFloat(data.credit || '0');
    return value > 0;
  }
}, {
  message: "Veuillez saisir un montant valide",
  path: ["debit", "credit"]
});

type TransactionFormData = z.infer<typeof transactionSchema>;

type TransactionFormProps = {
  transaction?: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
};

export function TransactionForm({
  transaction,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const isEditing = !!transaction?.id;
  const [activeTab, setActiveTab] = useState<'details' | 'advanced'>('details');
  
  // Initialisation de react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    register,
    setError,
    clearErrors
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      notes: transaction?.notes || "",
      debit: transaction?.debit?.toString() || "",
      credit: transaction?.credit?.toString() || "",
      date: transaction?.date ? new Date(transaction.date) : new Date(),
      category: transaction?.category || "",
      paymentMethod: transaction?.paymentMethod || "",
      transactionType: transaction?.debit && parseFloat(transaction?.debit.toString()) > 0 ? "debit" : "credit"
    }
  });

  // Observer les valeurs pour les utiliser dans le rendu
  const transactionType = watch("transactionType");
  const date = watch("date");
  
  // Utiliser les hooks useMutation de tRPC
  const updateTransactionMutation = trpc.updateTransaction.useMutation({
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour:", error);
      setError("root.serverError", {
        type: "server",
        message: "Une erreur est survenue lors de la mise à jour"
      });
    },
  });
  
  const addTransactionMutation = trpc.addTransaction.useMutation({
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Erreur lors de l'ajout:", error);
      setError("root.serverError", {
        type: "server",
        message: "Une erreur est survenue lors de l'ajout"
      });
    },
  });
  
  // Vérifier si l'une des mutations est en cours d'exécution
  const isSubmitting = updateTransactionMutation.isLoading || addTransactionMutation.isLoading;

  const onSubmit: SubmitHandler<TransactionFormData> = (data) => {
    // Convertir les valeurs
    const debitValue = data.transactionType === 'debit' ? parseFloat(data.debit || '0') : 0;
    const creditValue = data.transactionType === 'credit' ? parseFloat(data.credit || '0') : 0;

    if (isEditing && transaction?.id) {
      updateTransactionMutation.mutate({
        id: transaction.id,
        date: data.date,
        notes: data.notes,
        debit: debitValue,
        credit: creditValue,
        category: data.category,
        paymentMethod: data.paymentMethod
      });
    } else {
      addTransactionMutation.mutate({
        date: data.date,
        notes: data.notes,
        debit: debitValue,
        credit: creditValue,
        category: data.category,
        paymentMethod: data.paymentMethod
      });
    }
  };

  const handleTypeChange = (type: 'debit' | 'credit') => {
    setValue('transactionType', type);
    if (type === 'debit') {
      setValue('credit', "");
    } else {
      setValue('debit', "");
    }
    // Effacer les erreurs de ces champs lors du changement de type
    clearErrors(["debit", "credit"]);
  };
  
  const handleUseTodayDate = () => {
    setValue('date', new Date());
  };

  // Vérifier si la date est valide avant le formatage
  const isValidDate = date instanceof Date && !isNaN(date.getTime());
  const formattedDate = isValidDate 
    ? format(date, "dd MMMM yyyy", { locale: fr })
    : "Date invalide";

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  // Categories suggestions
  const categories = [
    "Alimentation", "Transport", "Logement", "Loisirs", "Santé", 
    "Éducation", "Shopping", "Voyage", "Salaire", "Investissement"
  ];

  // Payment methods
  const paymentMethods = [
    "Carte bancaire", "Espèces", "Virement", "Chèque", "Prélèvement"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden border-0 dark:border-slate-800 ring-1 ring-gray-200 dark:ring-slate-700/50"
    >
      {/* En-tête avec fond animé */}
      <div className="relative">
        {/* Fond décoratif */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className={cn(
            "absolute inset-0 w-full h-full bg-gradient-to-br opacity-90",
            transactionType === 'debit' 
              ? "from-red-500 via-red-600 to-red-700" 
              : "from-emerald-500 via-emerald-600 to-emerald-700"
          )}/>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]"/>
          <div className="absolute bottom-0 left-1/2 w-full h-12 bg-white/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 opacity-30"/>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 opacity-50"/>
        </div>

        {/* Contenu de l'en-tête */}
        <div className="relative pt-7 pb-5 px-7 text-white">
          {/* Bouton de fermeture moderne */}
          <DialogClose asChild>
            <motion.button 
              type="button" 
              className="absolute right-5 top-5 p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/40"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </motion.button>
          </DialogClose>

          {isEditing && transaction?.id && (
            <div className="absolute right-14 top-7 text-xs font-mono bg-white/20 rounded-md px-2 py-1">
              #{transaction.id}
            </div>
          )}
          
          <div className="mb-4">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {isEditing ? "Modifier la transaction" : "Nouvelle transaction"}
            </DialogTitle>
            <p className="text-white/80 text-sm mt-1">
              {isEditing ? "Modifiez les détails de votre transaction" : "Ajoutez une nouvelle transaction à votre compte"}
            </p>
          </div>
          
          {/* Sélecteur de type de transaction */}
          <div className="flex bg-white/10 backdrop-blur-sm rounded-lg p-1 max-w-[270px] border border-white/20 shadow-md">
            <motion.button
              type="button"
              onClick={() => handleTypeChange('debit')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all duration-200",
                transactionType === 'debit' 
                  ? "bg-white text-red-600 shadow-sm" 
                  : "text-white hover:bg-white/10"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowUp className="h-4 w-4" />
              <span>Dépense</span>
            </motion.button>
            <motion.button
              type="button"
              onClick={() => handleTypeChange('credit')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all duration-200",
                transactionType === 'credit' 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-white hover:bg-white/10"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowDown className="h-4 w-4" />
              <span>Revenu</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="flex border-b border-gray-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={cn(
            "flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors",
            activeTab === 'details'
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          <span>Détails principaux</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('advanced')}
          className={cn(
            "flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors",
            activeTab === 'advanced'
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Landmark className="h-4 w-4" />
          <span>Options avancées</span>
        </button>
      </div>

      {/* Corps du formulaire */}
      <div className="px-7 pt-5 pb-6 bg-gray-50 dark:bg-slate-900">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence>
            {errors.root?.serverError && (
              <motion.div 
                {...fadeInUp}
                className="mb-5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                <span>{errors.root.serverError.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Panneau des détails principaux */}
          <AnimatePresence mode="wait">
            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Montant */}
                <div className="mb-5">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5">
                    Montant
                  </label>
                  <div className={cn(
                    "flex items-center rounded-lg h-11 overflow-hidden transition-all duration-200 dark:bg-slate-800 shadow-sm",
                    (transactionType === 'debit' && errors.debit) || (transactionType === 'credit' && errors.credit)
                      ? "ring-2 ring-red-200 dark:ring-red-500/30 border-red-300 dark:border-red-500/50" 
                      : "ring-1 ring-gray-200 dark:ring-slate-700 border-transparent",
                    transactionType === 'debit'
                      ? "bg-white focus-within:ring-red-300 dark:focus-within:ring-red-500/50" 
                      : "bg-white focus-within:ring-emerald-300 dark:focus-within:ring-emerald-500/50"
                  )}>
                    <div className={cn(
                      "w-11 h-full flex items-center justify-center",
                      transactionType === 'debit' 
                        ? "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400" 
                        : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400"
                    )}>
                      <Banknote className="h-4 w-4" />
                    </div>
                    {transactionType === 'debit' ? (
                      <Controller
                        name="debit"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            placeholder="0.00"
                            className={cn(
                              "border-none h-full text-base focus-visible:ring-0 px-4 bg-transparent dark:bg-slate-800",
                              "text-red-600 dark:text-red-400",
                              "placeholder:text-gray-400 dark:placeholder:text-slate-500"
                            )}
                          />
                        )}
                      />
                    ) : (
                      <Controller
                        name="credit"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            placeholder="0.00"
                            className={cn(
                              "border-none h-full text-base focus-visible:ring-0 px-4 bg-transparent dark:bg-slate-800",
                              "text-emerald-600 dark:text-emerald-400",
                              "placeholder:text-gray-400 dark:placeholder:text-slate-500"
                            )}
                          />
                        )}
                      />
                    )}
                    <div className="bg-gray-50 dark:bg-slate-700 h-full px-4 flex items-center text-gray-500 dark:text-slate-400 border-l border-gray-200 dark:border-slate-600 font-medium">
                      $
                    </div>
                  </div>
                  <AnimatePresence>
                    {((transactionType === 'debit' && errors.debit) || (transactionType === 'credit' && errors.credit)) && (
                      <motion.p 
                        {...fadeInUp}
                        className="mt-1 text-xs text-red-500 pl-1"
                      >
                        {(transactionType === 'debit' ? errors.debit?.message : errors.credit?.message) || "Veuillez saisir un montant valide"}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Description */}
                <div className="mb-5">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5">
                    Description
                  </label>
                  <div className={cn(
                    "flex items-center rounded-lg h-11 overflow-hidden transition-all duration-200 bg-white dark:bg-slate-800 shadow-sm",
                    errors.notes 
                      ? "ring-2 ring-red-200 dark:ring-red-500/30 border-red-300 dark:border-red-500/50" 
                      : "ring-1 ring-gray-200 dark:ring-slate-700 border-transparent focus-within:ring-blue-300 dark:focus-within:ring-blue-500/50"
                  )}>
                    <div className="w-11 h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="notes"
                          {...field}
                          placeholder="Description de la transaction..."
                          className="border-none h-full text-sm focus-visible:ring-0 bg-transparent dark:bg-slate-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                        />
                      )}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.notes && (
                      <motion.p 
                        {...fadeInUp}
                        className="mt-1 text-xs text-red-500 pl-1"
                      >
                        {errors.notes.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Date */}
                <div className="mb-3">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5">
                    Date
                  </label>
                  <div className="flex items-center rounded-lg h-11 overflow-hidden transition-all duration-200 bg-white dark:bg-slate-800 ring-1 ring-gray-200 dark:ring-slate-700 border-transparent focus-within:ring-blue-300 dark:focus-within:ring-blue-500/50 shadow-sm">
                    <div className="w-11 h-full flex items-center justify-center bg-violet-50 dark:bg-violet-900/20 text-violet-500 dark:text-violet-400">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <Controller
                      name="date"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="date"
                          type="date"
                          value={isValidDate ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            try {
                              const selectedDate = new Date(e.target.value);
                              // Vérifier si la date sélectionnée est valide
                              if (!isNaN(selectedDate.getTime())) {
                                field.onChange(selectedDate);
                              }
                            } catch (error) {
                              console.error("Erreur lors de la conversion de la date:", error);
                            }
                          }}
                          className="border-none h-full text-sm focus-visible:ring-0 bg-transparent dark:bg-slate-800 dark:text-white min-w-0 flex-1"
                        />
                      )}
                    />
                    <motion.button
                      type="button"
                      onClick={handleUseTodayDate}
                      whileTap={{ scale: 0.95 }}
                      className="h-full px-3 text-xs font-medium text-violet-600 dark:text-violet-400 transition-colors hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 bg-gray-50 dark:bg-slate-700 border-l border-gray-200 dark:border-slate-600"
                    >
                      Aujourd'hui
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 pl-1">
                    {formattedDate}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Panneau des options avancées */}
            {activeTab === 'advanced' && (
              <motion.div
                key="advanced"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Catégories */}
                <div className="mb-5">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5">
                    Catégorie
                  </label>
                  <div className="flex items-center rounded-lg h-11 overflow-hidden transition-all duration-200 bg-white dark:bg-slate-800 ring-1 ring-gray-200 dark:ring-slate-700 border-transparent focus-within:ring-purple-300 dark:focus-within:ring-purple-500/50 shadow-sm">
                    <div className="w-11 h-full flex items-center justify-center bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400">
                      <LayoutGrid className="h-4 w-4" />
                    </div>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="category"
                          {...field}
                          list="categories"
                          placeholder="Sélectionnez ou saisissez une catégorie..."
                          className="border-none h-full text-sm focus-visible:ring-0 bg-transparent dark:bg-slate-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                        />
                      )}
                    />
                    <datalist id="categories">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Moyen de paiement */}
                <div className="mb-5">
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5">
                    Moyen de paiement
                  </label>
                  <div className="flex items-center rounded-lg h-11 overflow-hidden transition-all duration-200 bg-white dark:bg-slate-800 ring-1 ring-gray-200 dark:ring-slate-700 border-transparent focus-within:ring-indigo-300 dark:focus-within:ring-indigo-500/50 shadow-sm">
                    <div className="w-11 h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <Controller
                      name="paymentMethod"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="paymentMethod"
                          {...field}
                          list="paymentMethods"
                          placeholder="Sélectionnez ou saisissez un moyen de paiement..."
                          className="border-none h-full text-sm focus-visible:ring-0 bg-transparent dark:bg-slate-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                        />
                      )}
                    />
                    <datalist id="paymentMethods">
                      {paymentMethods.map((method) => (
                        <option key={method} value={method} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Conseils */}
                <div className="mt-5 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30 p-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">Astuce</h4>
                      <p className="text-xs mt-1 text-blue-600 dark:text-blue-500">
                        Catégoriser vos transactions et spécifier le moyen de paiement vous aidera à mieux analyser vos dépenses et revenus.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Champ masqué pour le type de transaction */}
          <input type="hidden" {...register("transactionType")} />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800/80 mt-5">
            <DialogClose asChild>
              <motion.button 
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={onCancel}
                className="h-9 px-4 rounded-md bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-colors duration-200 font-medium text-sm shadow-sm"
              >
                Annuler
              </motion.button>
            </DialogClose>
            
            <motion.button 
              type="submit" 
              disabled={isSubmitting}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "h-9 px-4 rounded-md shadow-sm flex items-center gap-2 font-medium transition-all duration-200 text-sm",
                transactionType === 'debit' 
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white" 
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
                  <span>{isEditing ? "Modification..." : "Enregistrement..."}</span>
                </>
              ) : (
                <>
                  {isEditing ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>{isEditing ? "Mettre à jour" : "Enregistrer"}</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
