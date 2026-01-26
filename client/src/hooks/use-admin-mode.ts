import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";

const ADMIN_MODE_KEY = "mzansimove_admin_mode";

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/admin-status", { credentials: "include" });
        const data = await response.json();
        setIsAdmin(data.isAdmin);
        localStorage.setItem(ADMIN_MODE_KEY, data.isAdmin ? "true" : "false");
      } catch {
        const stored = localStorage.getItem(ADMIN_MODE_KEY);
        setIsAdmin(stored === "true");
      } finally {
        setIsLoading(false);
      }
    };
    checkAdminStatus();
  }, []);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    setIsVerifying(true);
    try {
      const response = await apiRequest("POST", "/api/verify-admin-pin", { pin });
      const data = await response.json();
      
      if (data.success) {
        setIsAdmin(true);
        localStorage.setItem(ADMIN_MODE_KEY, "true");
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const exitAdminMode = useCallback(async () => {
    try {
      await apiRequest("POST", "/api/exit-admin-mode", {});
    } catch {
    }
    setIsAdmin(false);
    localStorage.removeItem(ADMIN_MODE_KEY);
  }, []);

  return {
    isAdmin,
    isVerifying,
    isLoading,
    verifyPin,
    exitAdminMode,
  };
}
