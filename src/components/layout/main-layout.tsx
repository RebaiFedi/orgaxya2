"use client";

import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Sun, 
  Moon,
  Menu,
  Settings,
  HelpCircle,
  User,
  LogOut,
  Calendar,
  Clock,
  Calculator as CalculatorIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { CalculatorDialog } from "@/components/ui/calculator-dialog";

// Composant moderne pour l'affichage de la date et l'heure
function ModernDateTime() {
  const [dateTime, setDateTime] = useState<string | null>(null);

  useEffect(() => {
    // Définir la date et l'heure initiales après le montage du composant
    updateDateTime();
    
    const timer = setInterval(() => {
      updateDateTime();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateDateTime = () => {
    const now = new Date();
    
    // Format plus élégant avec jour de la semaine, date, mois et année
    const formattedDate = format(now, "EEEE dd MMM yyyy", { locale: fr });
    const formattedTime = format(now, "HH:mm", { locale: fr });
    
    setDateTime(`${formattedDate} · ${formattedTime}`);
  };

  // Afficher un espace réservé jusqu'à ce que le composant soit monté côté client
  if (!dateTime) {
    return <div className="opacity-0">Chargement...</div>;
  }

  return (
    <div className="flex items-center gap-2.5 text-sm">
      <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
        <Calendar className="h-4 w-4" />
      </div>
      <div>
        <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">{dateTime}</span>
      </div>
    </div>
  );
}

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-950 dark:to-gray-900">
      {/* Sidebar */}
      <Sidebar className={cn("hidden md:flex", isMobileMenuOpen && "md:hidden")} />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="h-16 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Date et Heure (à gauche) */}
            <div className="hidden md:flex items-center">
              <ModernDateTime />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Calculatrice */}
              <CalculatorDialog />
              
              {/* Notifications */}
              <div className="relative">
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500"></div>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md h-9 w-9 relative">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>

              {/* Thème */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md h-9 w-9"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* Profil */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 px-2 py-1 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="relative h-8 w-8 rounded-md bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-600 rounded-l-md"></div>
                      <User className="h-4 w-4 relative z-10 text-blue-600 dark:text-blue-500" />
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">Fedi Rebai</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Administrateur</p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">Fedi Rebai</p>
                      <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                        rebaii@hotmail.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Aide</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
