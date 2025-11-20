"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isSuperAdmin?: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  timeRemaining: number;
  isWarning: boolean;
  loginError: { reason?: string; inactiveUntil?: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 60 * 60; // timeout in seconds (1 hour)
const WARNING_THRESHOLD = 300; // Show warning at 5 minute remaining

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_TIMEOUT);
  const [isWarning, setIsWarning] = useState(false);
  const [loginError, setLoginError] = useState<{ reason?: string; inactiveUntil?: string } | null>(null);
  const router = useRouter();
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load user from localStorage on refresh
    const savedUser = localStorage.getItem("citywitty_admin_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Initialize session tracking when user logs in
  useEffect(() => {
    if (!user) return;

    const resetInactivityTimer = () => {
      // Clear existing timers
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      // Reset time and warning
      setTimeRemaining(SESSION_TIMEOUT);
      setIsWarning(false);

      // Set new inactivity timer
      inactivityTimerRef.current = setTimeout(() => {
        handleAutoLogout();
      }, SESSION_TIMEOUT * 1000);

      // Start countdown
      let remainingTime = SESSION_TIMEOUT;
      countdownIntervalRef.current = setInterval(() => {
        remainingTime -= 1;
        setTimeRemaining(remainingTime);

        // Show warning when 1 minute remaining
        if (remainingTime === WARNING_THRESHOLD) {
          setIsWarning(true);
          toast.warning("Your session will expire in 1 minute due to inactivity");
        }

        if (remainingTime <= 0) {
          clearInterval(countdownIntervalRef.current!);
        }
      }, 1000);
    };

    // Activity event listeners
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Initial timer setup
    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [user]);

  const handleAutoLogout = () => {
    setUser(null);
    localStorage.removeItem("citywitty_admin_user");
    toast.error("Session expired due to inactivity. Please log in again.");
    router.push("/login");
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.status === 403 && data.isInactive) {
        setLoginError({
          reason: data.reason,
          inactiveUntil: data.inactiveUntil,
        });
        return false;
      }

      if (res.ok && data.success) {
        const userData: User = {
          id: data.id,
          email: data.email,
          username: data.username,
          role: data.role || "admin",
          isSuperAdmin: data.isSuperAdmin || false,
          avatar: data.avatar || undefined,
        };

        setUser(userData);
        localStorage.setItem("citywitty_admin_user", JSON.stringify(userData));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setUser(null);
    localStorage.removeItem("citywitty_admin_user");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, timeRemaining, isWarning, loginError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
