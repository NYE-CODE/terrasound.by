import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const POLL_INTERVAL_MS = 30_000;

interface AdminStatsContextValue {
  ordersNew: number;
  refreshOrdersNew: () => Promise<void>;
}

const AdminStatsContext = createContext<AdminStatsContextValue | null>(null);

export function AdminStatsProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [ordersNew, setOrdersNew] = useState(0);

  const refreshOrdersNew = useCallback(async () => {
    if (status !== "authenticated") {
      setOrdersNew(0);
      return;
    }

    try {
      const stats = await api.dashboard();
      setOrdersNew(stats.ordersNew);
    } catch {
      // Счётчик не критичен — оставляем последнее значение.
    }
  }, [status]);

  useEffect(() => {
    void refreshOrdersNew();

    if (status !== "authenticated") return;

    const timerId = window.setInterval(() => {
      void refreshOrdersNew();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [status, refreshOrdersNew]);

  const value = useMemo(
    () => ({
      ordersNew,
      refreshOrdersNew,
    }),
    [ordersNew, refreshOrdersNew],
  );

  return <AdminStatsContext.Provider value={value}>{children}</AdminStatsContext.Provider>;
}

export function useAdminStats() {
  const context = useContext(AdminStatsContext);
  if (!context) {
    throw new Error("useAdminStats must be used within AdminStatsProvider");
  }
  return context;
}
