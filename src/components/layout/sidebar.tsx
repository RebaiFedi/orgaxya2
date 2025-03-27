import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Wallet,
  History,
  Settings,
  FileText,
  Home,
  LogOut,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  PieChart,
  CreditCard,
  PiggyBank,
  Receipt,
  Building2,
  Shield,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  className?: string;
}

// Composant Separator moderne et minimaliste
const Separator = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center my-5 px-3", className)}>
    <div className="flex-grow h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-800"></div>
  </div>
);

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigationItems = [
    {
      title: "Tableau de bord",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
      isImplemented: true,
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: History,
      isActive: pathname === "/transactions",
      isImplemented: true,
    },
    {
      title: "Analyse",
      href: "#",
      icon: PieChart,
      isActive: false,
      isImplemented: false,
    },
    {
      title: "Budget",
      href: "#",
      icon: PiggyBank,
      isActive: false,
      isImplemented: false,
    },
    {
      title: "Rapports",
      href: "#",
      icon: Receipt,
      isActive: false,
      isImplemented: false,
    },
    {
      title: "Factures",
      href: "#",
      icon: CreditCard,
      isActive: false,
      isImplemented: false,
    },
    {
      title: "Entreprise",
      href: "#",
      icon: Building2,
      isActive: false,
      isImplemented: false,
    },
    {
      title: "Sécurité",
      href: "#",
      icon: Shield,
      isActive: false,
      isImplemented: false,
    },
    {
      title: "Messages",
      href: "#",
      icon: Mail,
      isActive: false,
      isImplemented: false,
    },
    {
      title: "Paramètres",
      href: "#",
      icon: Settings,
      isActive: false,
      isImplemented: false,
    },
  ];

  const renderNavItem = (item: {
    title: string, 
    href: string, 
    icon: any, 
    isActive: boolean,
    isImplemented: boolean,
    badge?: number,
  }) => (
    <TooltipProvider key={item.title} delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          {item.isImplemented ? (
            <Link
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 my-1 rounded-lg transition-all duration-200 relative overflow-hidden group",
                item.isActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-slate-200",
                isCollapsed ? "justify-center w-12 mx-auto" : ""
              )}
              onMouseEnter={() => setHoveredItem(item.title)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={cn(
                "flex items-center justify-center relative",
                item.isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"
              )}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <item.icon className={cn(
                    "transition-transform",
                    isCollapsed ? "h-5.5 w-5.5" : "h-5 w-5"
                  )} />
                </motion.div>
              </div>
              
              {!isCollapsed && (
                <span className={cn(
                  "ml-3 font-medium text-[14px] transition-all duration-200",
                  item.isActive ? "text-blue-600 dark:text-blue-400" : ""
                )}>
                  {item.title}
                </span>
              )}
              
              {!isCollapsed && item.badge && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-auto text-[10px] px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center rounded-full",
                    item.isActive 
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" 
                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
              
              {isCollapsed && item.badge && (
                <div className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] rounded-full bg-blue-500 text-[9px] text-white flex items-center justify-center font-medium">
                  {item.badge}
                </div>
              )}
              
              {item.isActive && !isCollapsed && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
              )}
            </Link>
          ) : (
            <div
              className={cn(
                "flex items-center px-4 py-3 my-1 rounded-lg relative overflow-hidden w-full",
                "text-slate-500 dark:text-slate-500",
                isCollapsed ? "justify-center w-12 mx-auto" : ""
              )}
              onMouseEnter={() => setHoveredItem(item.title)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex items-center justify-center relative text-slate-500 dark:text-slate-500">
                <item.icon className={cn(
                  "transition-transform",
                  isCollapsed ? "h-5.5 w-5.5" : "h-5 w-5"
                )} />
              </div>
              
              {!isCollapsed && (
                <span className="ml-3 font-medium text-[14px] transition-all duration-200">
                  {item.title}
                </span>
              )}
              
              {!isCollapsed && (
                <Badge 
                  variant="outline" 
                  className="ml-auto text-[10px] px-1.5 py-0.5 h-5 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                >
                  Bientôt
                </Badge>
              )}
            </div>
          )}
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" sideOffset={12} className="text-xs font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg shadow-lg">
            {item.title}
            {!item.isImplemented && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Bientôt
              </span>
            )}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="relative">
      <motion.div
        layout
        className={cn(
          "flex flex-col h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/50 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[70px]" : "w-[280px]",
          className
        )}
        style={{ 
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800/50">
          <AnimatePresence mode="wait" initial={false}>
            {!isCollapsed ? (
              <motion.div 
                key="expanded-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="relative flex items-center justify-center w-9 h-9">
                  <div className="absolute inset-0 bg-blue-500 dark:bg-blue-600 rounded-md opacity-10"></div>
                  <Wallet className="relative h-5 w-5 text-blue-600 dark:text-blue-500" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap tracking-tight">
                    Journal des Transactions
                  </h2>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Développé par Fedi pour Orgaxya</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="collapsed-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full flex justify-center"
              >
                <div className="relative flex items-center justify-center w-9 h-9">
                  <div className="absolute inset-0 bg-blue-500 dark:bg-blue-600 rounded-lg opacity-10"></div>
                  <Wallet className="relative h-4.5 w-4.5 text-blue-600 dark:text-blue-500" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className={cn(
          "flex-1 py-4 flex flex-col overflow-y-auto bg-white dark:bg-slate-950 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent",
          isCollapsed ? "px-2" : "px-3"
        )}>
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              renderNavItem(item)
            ))}
          </nav>

          <Separator className="mt-auto mb-3" />

          <div className={cn(
            "mx-2 mb-3 rounded-lg bg-slate-50 dark:bg-slate-900/50",
            isCollapsed ? "p-2 flex justify-center" : "p-3"
          )}>
            <AnimatePresence mode="wait" initial={false}>
              {!isCollapsed ? (
                <motion.div 
                  key="expanded-profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <div className="relative">
                    <div className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Fedi Rebai</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500">Administrateur</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-auto h-7 w-7 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/30"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  key="collapsed-profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <div className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Bouton toggle moderne et minimaliste */}
      <div 
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20"
      >
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center justify-center h-6 w-6 rounded-full transition-all duration-300 backdrop-blur-md",
            "bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20",
            "border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700",
            "shadow-md hover:shadow-lg",
            "transform hover:scale-110 active:scale-95"
          )}
          aria-label={isCollapsed ? "Développer le menu" : "Réduire le menu"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isCollapsed ? (
              <motion.div
                key="chevron-right"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
              </motion.div>
            ) : (
              <motion.div
                key="chevron-left"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronLeft className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
