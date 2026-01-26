import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";

const DRIVER_MODE_KEY = "mzansimove_driver_mode";

export function useDriverMode() {
  const [isDriver, setIsDriver] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDriverStatus = async () => {
      try {
        const response = await fetch("/api/driver-status", { credentials: "include" });
        const data = await response.json();
        setIsDriver(data.isDriver);
        localStorage.setItem(DRIVER_MODE_KEY, data.isDriver ? "true" : "false");
      } catch {
        const stored = localStorage.getItem(DRIVER_MODE_KEY);
        setIsDriver(stored === "true");
      } finally {
        setIsLoading(false);
      }
    };
    checkDriverStatus();
  }, []);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    setIsVerifying(true);
    try {
      const response = await apiRequest("POST", "/api/verify-driver-pin", { pin });
      const data = await response.json();
      
      if (data.success) {
        setIsDriver(true);
        localStorage.setItem(DRIVER_MODE_KEY, "true");
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const exitDriverMode = useCallback(async () => {
    try {
      await apiRequest("POST", "/api/exit-driver-mode", {});
    } catch {
    }
    setIsDriver(false);
    localStorage.removeItem(DRIVER_MODE_KEY);
  }, []);

  return {
    isDriver,
    isVerifying,
    isLoading,
    verifyPin,
    exitDriverMode,
  };
}
