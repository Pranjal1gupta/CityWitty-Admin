"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CreditCard,
  Store,
  Building2,
  ShoppingBag,
  Receipt,
  MessageSquare,
  User,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronDown,
  Briefcase,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users & Cards", href: "/cards", icon: CreditCard },
  { name: "Merchants", href: "/merchants", icon: Store },
  { name: "Franchises", href: "/franchises", icon: Building2 },
  { name: "Ecommerce", href: "/ecommerce", icon: ShoppingBag },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Careers", href: "/careers", icon: Briefcase },
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Helper function to safely get sidebar state from localStorage
const getSidebarState = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved !== null ? JSON.parse(saved) : true;
  }
  return true;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getSidebarState());
  const { user, logout, timeRemaining, isWarning } = useAuth();
  const pathname = usePathname();

  // Save sidebar state whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
    }
  }, [sidebarCollapsed]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const [notificationCounts, setNotificationCounts] = useState({
    merchants: 0,
    cards: 0,
    franchises: 2,
    ecommerce: 8,
    transactions: 12,
    careers: 0, // will fetch dynamically
    feedback: 3,
  });
  

  useEffect(() => {
    async function fetchMerchantStats() {
      try {
        const response = await fetch("/api/merchants", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          const { pendingApprovals, inactiveMerchants } = data.stats || {};
          const merchantsCount =
            (pendingApprovals || 0) + (inactiveMerchants || 0);
          setNotificationCounts((prev) => ({
            ...prev,
            merchants: merchantsCount,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch merchant stats:", error);
      }
    }

    async function fetchCardStats() {
      try {
        const response = await fetch("/api/cards", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          const { blockedCards, expiredCards } = data.stats || {};
          const cardsCount = (blockedCards || 0) + (expiredCards || 0);
          setNotificationCounts((prev) => ({
            ...prev,
            cards: cardsCount,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch card stats:", error);
      }
    }

    async function fetchCareerStats() {
      try {
        const response = await fetch("/api/careers");
        if (response.ok) {
          const data = await response.json();
          // Count only pending applications
          const pendingCount =
            data.applications?.filter(
              (app: { status: string }) => app.status === "Pending"
            ).length || 0;

          setNotificationCounts((prev) => ({
            ...prev,
            careers: pendingCount,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch career stats:", error);
      }
    }

    // Initial fetch
    fetchMerchantStats();
    fetchCardStats();
    fetchCareerStats();

    // Polling every 5 seconds
    const interval = setInterval(() => {
      fetchMerchantStats();
      fetchCardStats();
      fetchCareerStats();
    }, 3000);

    return () => clearInterval(interval); // cleanup on unmount
  }, [pathname]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <Sidebar collapsed={false} onToggleCollapse={() => {}} />
          </div>
        </div>
      )}

      <div className="hidden md:flex md:flex-shrink-0">
        <div className={`flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-16" : "w-52"
        }`}>
          <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4AA8FF] md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="flex items-center h-16">
                    <h1 className="text-xl font-semibold text-gray-900 capitalize">
                      {pathname?.split("/")[1] || "Dashboard"}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6 gap-2">
              {/* Session Timer - Mobile View */}
              <div className="md:hidden flex items-center">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                  isWarning 
                    ? 'bg-red-50 text-red-600' 
                    : 'bg-gray-50 text-gray-600'
                }`}>
                  <Clock className={`h-3.5 w-3.5 ${isWarning ? 'text-red-500' : 'text-gray-500'}`} />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              </div>

              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4AA8FF] relative">
                <Bell className="h-6 w-6" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-xs">
                  {Object.values(notificationCounts).reduce((a, b) => a + b, 0)}
                </Badge>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-3 flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] text-white uppercase">
                        {user?.username
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 hidden md:block">
                      <p className="text-sm font-medium text-gray-700 capitalize">
                        {user?.username}
                      </p>
                      <p className="text-xs text-gray-500 uppercase">
                        {user?.role}
                      </p>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className={`transition-all duration-300 ${
              sidebarCollapsed 
                ? 'px-2 sm:px-3 md:px-4' 
                : 'max-w-7xl mx-auto px-4 sm:px-6 md:px-8'
            }`}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  function Sidebar({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
    return (
      <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white transition-all duration-300 ease-in-out">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className={`flex items-center flex-shrink-0 px-4 transition-all duration-300 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">CW</span>
              </div>
              {!collapsed && (
                <div className="ml-2 flex items-center overflow-hidden">
                  <span className="text-xl font-bold text-blue-500 whitespace-nowrap">City</span>
                  <span className="text-xl font-bold text-orange-500 whitespace-nowrap">Witty</span>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={onToggleCollapse}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
          
          {collapsed && (
            <button
              onClick={onToggleCollapse}
              className="mx-2 p-2 hover:bg-gray-100 rounded-md transition-colors mt-2"
              title="Expand sidebar"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 mx-auto" />
            </button>
          )}

          <nav className={`mt-5 flex-1 px-2 space-y-1 transition-all duration-300 ${collapsed ? 'px-1' : 'px-2'}`}>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const notificationCount = getNotificationCount(item.name);

              const linkContent = (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : ''}
                  className={`${
                    isActive
                      ? "bg-gradient-to-r from-[#4AA8FF]/10 to-[#0099ff]/10 text-[#4AA8FF] border-r-2 border-[#4AA8FF]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md relative transition-all duration-300 ${
                    collapsed ? 'justify-center' : ''
                  }`}
                >
                  <item.icon
                    className={`${
                      isActive
                        ? "text-[#4AA8FF]"
                        : "text-gray-400 group-hover:text-gray-500"
                    } flex-shrink-0 h-6 w-6 ${collapsed ? '' : 'mr-3'}`}
                  />
                  {!collapsed && (
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</span>
                  )}
                  {notificationCount > 0 && (
                    <>
                      <Badge className={`h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs animate-pulse ${
                        collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'
                      }`}>
                        {notificationCount}
                      </Badge>
                      <div className={`w-2 h-2 bg-[#0099ff] rounded-full animate-ping ${
                        collapsed ? 'absolute -bottom-0.5 -right-0.5' : 'absolute right-2'
                      }`}></div>
                    </>
                  )}
                </Link>
              );

              return linkContent;
            })}
          </nav>
        </div>
        
        <div className={`flex-shrink-0 flex border-t border-gray-200 p-4 transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'w-full'}`}>
            <Clock className={`h-5 w-5 flex-shrink-0 ${collapsed ? '' : 'mr-2'} ${isWarning ? 'text-red-500' : 'text-gray-500'}`} />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${isWarning ? 'text-red-600' : 'text-gray-600'}`}>
                  Session expires in
                </p>
                <p className={`text-sm font-semibold ${isWarning ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </p>
              </div>
            )}
            {collapsed && (
              <div className="text-center">
                <p className={`text-xs font-semibold leading-tight ${isWarning ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function getNotificationCount(page: string) {
    switch (page.toLowerCase()) {
      case "merchants":
        return notificationCounts.merchants;
      case "cards":
        return notificationCounts.cards;
      case "franchises":
        return notificationCounts.franchises;
      case "ecommerce":
        return notificationCounts.ecommerce;
      case "transactions":
        return notificationCounts.transactions;
      case "careers":
        return notificationCounts.careers;
      case "feedback":
        return notificationCounts.feedback;
      default:
        return 0;
    }
  }
}
