import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";

const OPERATOR_MODE_KEY = "mzansimove_operator_mode";

export function useOperatorMode() {
  const [isOperator, setIsOperator] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOperatorStatus = async () => {
      try {
        const response = await fetch("/api/operator-status", { credentials: "include" });
        const data = await response.json();
        setIsOperator(data.isOperator);
        localStorage.setItem(OPERATOR_MODE_KEY, data.isOperator ? "true" : "false");
      } catch {
        const stored = localStorage.getItem(OPERATOR_MODE_KEY);
        setIsOperator(stored === "true");
      } finally {
        setIsLoading(false);
      }
    };
    checkOperatorStatus();
  }, []);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    setIsVerifying(true);
    try {
      const response = await apiRequest("POST", "/api/verify-operator-pin", { pin });
      const data = await response.json();
      
      if (data.success) {
        setIsOperator(true);
        localStorage.setItem(OPERATOR_MODE_KEY, "true");
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const exitOperatorMode = useCallback(async () => {
    try {
      await apiRequest("POST", "/api/exit-operator-mode", {});
    } catch {
    }
    setIsOperator(false);
    localStorage.removeItem(OPERATOR_MODE_KEY);
  }, []);

  return {
    isOperator,
    isVerifying,
    isLoading,
    verifyPin,
    exitOperatorMode,
  };
}
