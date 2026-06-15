import { useEffect, useState } from "react";
import { reportLoadError } from "../lib/formError";
import { MessageSquare } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { api, type DashboardStats } from "../lib/api";

export function DashboardPage() {
  const { status } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    api.dashboard().then(setStats).catch(reportLoadError);
  }, [status]);

  return (
    <div>
      <h1 className="font-heading text-3xl mb-8">Статистика сайта</h1>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label="Отзывы на модерации"
          value={stats?.reviewsPending ?? 0}
          icon={<MessageSquare size={20} />}
        />
      </div>
    </div>
  );
}
