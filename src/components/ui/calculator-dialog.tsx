"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle
} from "@/components/ui/dialog";
import { Calculator } from "@/components/ui/calculator";
import { Calculator as CalculatorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CalculatorDialog() {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md h-9 w-9"
        >
          <CalculatorIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      
      <AnimatePresence>
        {open && (
          <DialogContent 
            forceMount 
            className="p-0 border-none rounded-2xl bg-transparent max-w-sm overflow-hidden shadow-2xl"
            hideCloseButton
          >
            <DialogTitle className="sr-only">Calculatrice</DialogTitle>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <Calculator />
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
} 