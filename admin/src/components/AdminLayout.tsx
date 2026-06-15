import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  ChevronDown,
  Contact,
  Grid3x3,
  Images,
  KeyRound,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Megaphone,
  MessageSquare,
  Package,
  Star,
  Tag,
  Wrench,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const dashboardItem: NavItem = {
  to: "/",
  label: "Статистика сайта",
  icon: LayoutDashboard,
  end: true,
};

const standaloneItems: NavItem[] = [
  { to: "/services", label: "Услуги", icon: Wrench },
  { to: "/blog", label: "Блог", icon: BookOpen },
];

const navGroups: NavGroup[] = [
  {
    id: "catalog",
    label: "Каталог",
    items: [
      { to: "/categories", label: "Категории", icon: Grid3x3 },
      { to: "/attributes", label: "Атрибуты", icon: ListFilter },
      { to: "/products", label: "Товары", icon: Package },
      { to: "/brands", label: "Бренды", icon: Tag },
      { to: "/reviews/product", label: "Отзывы о товарах", icon: MessageSquare },
    ],
  },
  {
    id: "content",
    label: "Контент сайта",
    items: [
      { to: "/portfolio", label: "Наши работы", icon: Images },
      { to: "/reviews/service", label: "Отзывы о магазине", icon: Star },
      { to: "/settings/contact", label: "Контакты сайта", icon: Contact },
      { to: "/settings/announcement", label: "Бегущая строка", icon: Megaphone },
      { to: "/settings/stats", label: "Наши достижения", icon: BarChart3 },
      { to: "/settings/product-highlights", label: "Преимущества товара", icon: BadgeCheck },
    ],
  },
];

const passwordItem: NavItem = {
  to: "/settings/password",
  label: "Смена пароля",
  icon: KeyRound,
};

function isNavItemActive(pathname: string, { to, end }: NavItem) {
  if (end) {
    return pathname === to;
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function isGroupActive(pathname: string, items: NavItem[]) {
  return items.some((item) => isNavItemActive(pathname, item));
}

function navLinkClass(isActive: boolean) {
  return `flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
    isActive
      ? "bg-[var(--accent)] text-[#0e0e0f] font-medium"
      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[#222]"
  }`;
}

function SidebarNavLink({
  item,
  nested = false,
}: {
  item: NavItem;
  nested?: boolean;
}) {
  const { to, label, icon: Icon, end } = item;

  return (
    <NavLink to={to} end={end} className={({ isActive }) => `${navLinkClass(isActive)} ${nested ? "pl-9" : ""}`}>
      <>
        <Icon size={18} className="shrink-0" />
        <span className="flex-1 min-w-0 truncate">{label}</span>
      </>
    </NavLink>
  );
}

function SidebarNavGroup({
  group,
  open,
  onToggle,
}: {
  group: NavGroup;
  open: boolean;
  onToggle: () => void;
}) {
  const { pathname } = useLocation();
  const groupActive = isGroupActive(pathname, group.items);

  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-2 px-3 py-2 rounded text-xs font-heading uppercase tracking-wider transition-colors ${
          groupActive
            ? "text-[var(--foreground)]"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
        aria-expanded={open}
      >
        <span>{group.label}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="mt-1 space-y-1">
          {group.items.map((item) => (
            <SidebarNavLink key={item.to} item={item} nested />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AdminLayout() {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.map((group) => [group.id, isGroupActive(pathname, group.items)])),
  );

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const group of navGroups) {
        if (isGroupActive(pathname, group.items)) {
          next[group.id] = true;
        }
      }
      return next;
    });
  }, [pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--card)] p-6 flex flex-col">
        <div className="mb-10">
          <div className="font-heading text-2xl font-bold">TerraSound</div>
          <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mt-1">
            Панель администратора
          </div>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto">
          <SidebarNavLink item={dashboardItem} />

          {standaloneItems.map((item) => (
            <SidebarNavLink key={item.to} item={item} />
          ))}

          {navGroups.map((group) => (
            <SidebarNavGroup
              key={group.id}
              group={group}
              open={openGroups[group.id] ?? false}
              onToggle={() => toggleGroup(group.id)}
            />
          ))}
        </nav>

        <div className="mt-4 space-y-1 border-t border-[var(--border)] pt-4">
          <SidebarNavLink item={passwordItem} />

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[#222] transition-colors"
          >
            <LogOut size={18} />
            Выйти
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
