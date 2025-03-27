import { Bell, Moon, Sun, Calendar, HelpCircle, Menu, User, BarChart4, Settings, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HeaderProps {
  onToggleSidebar?: () => void;
  className?: string;
}

export function Header({ onToggleSidebar, className }: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [date, setDate] = useState<string>("");
  
  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    };
    setDate(now.toLocaleDateString('fr-FR', options));
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };
  
  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "h-16 flex items-center justify-between px-5 border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50 sticky top-0 z-30",
        className
      )}
      style={{
        boxShadow: "0 1px 10px rgba(0,0,0,0.03)"
      }}
    >
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-full bg-background shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
          onClick={onToggleSidebar}
        >
          <Menu className="h-4 w-4" />
        </motion.button>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 py-1.5 px-4 rounded-full bg-background/60 border border-gray-100/80 dark:border-gray-800/70 shadow-sm"
        >
          <div className="rounded-full bg-primary/10 p-1">
            <Calendar className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{date}</span>
        </motion.div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center h-9 w-9 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100/90 dark:border-gray-800/90 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-primary/90 flex items-center justify-center shadow-sm"
              >
                <span className="text-[10px] font-bold text-white">3</span>
              </motion.div>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl p-2 shadow-xl border-gray-100 dark:border-gray-800">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1 p-1">
                <p className="text-sm font-medium leading-none">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Vous avez 3 notifications non lues
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {[
                { icon: BarChart4, title: "Nouveau rapport disponible", desc: "Le rapport mensuel est prêt", time: "Il y a 10 minutes" },
                { icon: User, title: "Nouvel utilisateur", desc: "Un nouvel utilisateur s'est inscrit", time: "Il y a 20 minutes" },
                { icon: Settings, title: "Mise à jour système", desc: "Le système a été mis à jour", time: "Il y a 30 minutes" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 2 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <DropdownMenuItem className="cursor-pointer py-3 px-3 rounded-lg focus:bg-muted my-1.5">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                        <p className="text-xs text-primary">{item.time}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </motion.div>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center font-medium text-primary text-xs rounded-lg m-1 py-2">
              Voir toutes les notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center h-9 w-9 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100/90 dark:border-gray-800/90 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                aria-label="Aide"
              >
                <HelpCircle className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="rounded-lg py-1 px-2 text-[10px]">
              Centre d'aide
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="flex items-center justify-center h-9 w-9 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100/90 dark:border-gray-800/90 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                aria-label="Thème"
              >
                {theme === "dark" ? 
                  <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" /> : 
                  <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                }
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="rounded-lg py-1 px-2 text-[10px]">
              Changer de thème
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 pl-1.5 pr-3 h-9 rounded-full bg-gradient-to-r from-background to-background/95 shadow-sm border border-gray-100/90 dark:border-gray-800/90 hover:border-gray-200 dark:hover:border-gray-700 transition-all"
            >
              <Avatar className="h-6 w-6 border-2 border-primary/10">
                <AvatarImage src="/avatar.png" alt="Utilisateur Pro" />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">UP</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex items-center gap-1.5">
                <span className="text-xs font-medium">Utilisateur</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-gray-100 dark:border-gray-800">
            <div className="px-1 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarImage src="/avatar.png" alt="Utilisateur Pro" />
                  <AvatarFallback className="text-sm bg-primary/10 text-primary">UP</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none">Utilisateur Pro</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    pro@example.com
                  </p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="p-1">
              <DropdownMenuItem className="cursor-pointer rounded-lg p-2 flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm">Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg p-2 flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Settings className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm">Paramètres</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <div className="p-1">
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive rounded-lg p-2 flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <LogOut className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                </div>
                <span className="text-sm">Déconnexion</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
