import { useEffect, useState } from "react";
import { reportLoadError } from "../lib/formError";
import { ClipboardList, MessageSquare, ShoppingBag, Wrench } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { api, type DashboardStats } from "../lib/api";

export function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!token) return;
    api.dashboard(token).then(setStats).catch(reportLoadError);
  }, [token]);

  return (
    <div>
      <h1 className="font-heading text-3xl mb-8">Статистика сайта</h1>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard label="Новые заказы" value={stats?.ordersNew ?? 0} icon={<ShoppingBag size={20} />} />
        <StatCard label="Всего заказов" value={stats?.ordersTotal ?? 0} icon={<ClipboardList size={20} />} />
        <StatCard label="Отзывы на модерации" value={stats?.reviewsPending ?? 0} icon={<MessageSquare size={20} />} />
        <StatCard label="Заявки на установку" value={stats?.installationRequests ?? 0} icon={<Wrench size={20} />} />
      </div>
    </div>
  );
}
