"use client";

import { useState } from "react";
import { 
  Divide, 
  X, 
  Minus, 
  Plus, 
  Percent,
  RotateCcw,
  Equal,
  X as CloseIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { DialogClose } from "@/components/ui/dialog";

export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [secondaryDisplay, setSecondaryDisplay] = useState("");
  const [operation, setOperation] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [shouldReset, setShouldReset] = useState(false);
  
  const handleNumberClick = (num: string) => {
    if (display === "0" || shouldReset) {
      setDisplay(num);
      setShouldReset(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleDecimalClick = () => {
    if (shouldReset) {
      setDisplay("0.");
      setShouldReset(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOperationClick = (op: string) => {
    const currentValue = parseFloat(display);
    
    if (prevValue === null) {
      setPrevValue(currentValue);
      setSecondaryDisplay(`${currentValue} ${op}`);
    } else {
      const result = calculate();
      setPrevValue(result);
      setSecondaryDisplay(`${result} ${op}`);
    }
    
    setOperation(op);
    setShouldReset(true);
  };

  const calculate = () => {
    const currentValue = parseFloat(display);
    let result = 0;
    
    if (prevValue !== null && operation) {
      switch (operation) {
        case "+":
          result = prevValue + currentValue;
          break;
        case "-":
          result = prevValue - currentValue;
          break;
        case "×":
          result = prevValue * currentValue;
          break;
        case "÷":
          result = prevValue / currentValue;
          break;
        case "%":
          result = prevValue % currentValue;
          break;
        default:
          result = currentValue;
      }
    } else {
      result = currentValue;
    }
    
    return result;
  };

  const handleEqualsClick = () => {
    if (prevValue === null || !operation) return;
    
    const result = calculate();
    setDisplay(result.toString());
    setSecondaryDisplay(`${prevValue} ${operation} ${parseFloat(display)} =`);
    setPrevValue(null);
    setOperation(null);
    setShouldReset(true);
  };

  const handleClearClick = () => {
    setDisplay("0");
    setSecondaryDisplay("");
    setPrevValue(null);
    setOperation(null);
    setShouldReset(false);
  };

  const handlePlusMinusClick = () => {
    if (display !== "0") {
      setDisplay((parseFloat(display) * -1).toString());
    }
  };

  const handlePercentClick = () => {
    const value = parseFloat(display) / 100;
    setDisplay(value.toString());
  };

  const CalcButton = ({ 
    onClick, 
    children,
    variant = "default",
    size = "default",
    className,
  }: { 
    onClick: () => void; 
    children: React.ReactNode;
    variant?: "default" | "operator" | "function" | "equals";
    size?: "default" | "wide";
    className?: string;
  }) => {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className={cn(
          "flex items-center justify-center text-lg font-medium transition-colors rounded-full",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          size === "default" ? "h-16 w-16" : "h-16 w-auto col-span-2 px-8",
          variant === "default" && "bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700",
          variant === "function" && "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600",
          variant === "operator" && "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500",
          variant === "equals" && "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500",
          className
        )}
      >
        {children}
      </motion.button>
    );
  };

  // Formatage du display pour ajouter des séparateurs de milliers
  const formattedDisplay = () => {
    if (display.includes('.')) {
      const [whole, decimal] = display.split('.');
      return `${parseFloat(whole).toLocaleString('fr-FR')}${decimal ? ',' + decimal : ''}`;
    }
    return parseFloat(display).toLocaleString('fr-FR');
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden w-80">
      {/* En-tête avec affichage */}
      <div className="bg-white dark:bg-slate-800 px-6 pt-8 pb-6 relative">
        {/* Bouton de fermeture dans le coin supérieur droit */}
        <DialogClose className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
          <CloseIcon className="h-5 w-5" />
          <span className="sr-only">Fermer</span>
        </DialogClose>

        {/* Affichage secondaire (opérations précédentes) */}
        <div className="text-right text-sm text-slate-500 dark:text-slate-400 h-6 font-mono mb-1 overflow-hidden">
          {secondaryDisplay}
        </div>
        
        {/* Affichage principal */}
        <div className="text-right text-4xl font-semibold text-slate-900 dark:text-white overflow-x-auto scrollbar-hide">
          {formattedDisplay()}
        </div>
      </div>
      
      {/* Corps de la calculatrice avec les boutons */}
      <div className="p-4 grid grid-cols-4 gap-3 bg-slate-100 dark:bg-slate-900">
        {/* Ligne 1 */}
        <CalcButton variant="function" onClick={handleClearClick}>
          C
        </CalcButton>
        <CalcButton variant="function" onClick={handlePlusMinusClick}>
          +/-
        </CalcButton>
        <CalcButton variant="function" onClick={handlePercentClick}>
          <Percent className="h-5 w-5" />
        </CalcButton>
        <CalcButton variant="operator" onClick={() => handleOperationClick("÷")}>
          <Divide className="h-5 w-5" />
        </CalcButton>
        
        {/* Ligne 2 */}
        <CalcButton onClick={() => handleNumberClick("7")}>7</CalcButton>
        <CalcButton onClick={() => handleNumberClick("8")}>8</CalcButton>
        <CalcButton onClick={() => handleNumberClick("9")}>9</CalcButton>
        <CalcButton variant="operator" onClick={() => handleOperationClick("×")}>
          <X className="h-5 w-5" />
        </CalcButton>
        
        {/* Ligne 3 */}
        <CalcButton onClick={() => handleNumberClick("4")}>4</CalcButton>
        <CalcButton onClick={() => handleNumberClick("5")}>5</CalcButton>
        <CalcButton onClick={() => handleNumberClick("6")}>6</CalcButton>
        <CalcButton variant="operator" onClick={() => handleOperationClick("-")}>
          <Minus className="h-5 w-5" />
        </CalcButton>
        
        {/* Ligne 4 */}
        <CalcButton onClick={() => handleNumberClick("1")}>1</CalcButton>
        <CalcButton onClick={() => handleNumberClick("2")}>2</CalcButton>
        <CalcButton onClick={() => handleNumberClick("3")}>3</CalcButton>
        <CalcButton variant="operator" onClick={() => handleOperationClick("+")}>
          <Plus className="h-5 w-5" />
        </CalcButton>
        
        {/* Ligne 5 */}
        <CalcButton size="wide" onClick={() => handleNumberClick("0")}>
          0
        </CalcButton>
        <CalcButton onClick={handleDecimalClick}>,</CalcButton>
        <CalcButton variant="equals" onClick={handleEqualsClick}>
          <Equal className="h-5 w-5" />
        </CalcButton>
      </div>
    </div>
  );
} 