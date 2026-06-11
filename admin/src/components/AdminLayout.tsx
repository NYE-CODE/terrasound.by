import { NavLink, Outlet } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  Grid3x3,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  BarChart3,
  Images,
  KeyRound,
  ListFilter,
  Star,
  Tag,
  Wrench,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Дашборд", icon: LayoutDashboard, end: true },
  { to: "/categories", label: "Категории", icon: Grid3x3 },
  { to: "/attributes", label: "Атрибуты", icon: ListFilter },
  { to: "/products", label: "Товары", icon: Package },
  { to: "/services", label: "Услуги", icon: Wrench },
  { to: "/brands", label: "Бренды", icon: Tag },
  { to: "/blog", label: "Блог", icon: BookOpen },
  { to: "/portfolio", label: "Наши работы", icon: Images },
  { to: "/orders", label: "Заказы", icon: ClipboardList },
  { to: "/reviews/product", label: "Отзывы о товарах", icon: MessageSquare },
  { to: "/reviews/service", label: "Отзывы о магазине", icon: Star },
  { to: "/installation", label: "Заявки на установку", icon: Wrench },
  { to: "/settings/stats", label: "Статистика сайта", icon: BarChart3 },
  { to: "/settings/password", label: "Смена пароля", icon: KeyRound },
];

export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--card)] p-6 flex flex-col">
        <div className="mb-10">
          <div className="font-heading text-2xl font-bold">TerraSound</div>
          <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mt-1">
            Панель администратора
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                  isActive
                    ? "bg-[var(--accent)] text-[#0e0e0f] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[#222]"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[#222] transition-colors"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
