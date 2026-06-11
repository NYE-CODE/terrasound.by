export const primaryNavLinks = [
  { path: "/catalogue", label: "Каталог" },
  { path: "/installation", label: "Услуги" },
  { path: "/about", label: "О нас" },
  { path: "/brands", label: "Бренды" },
  { path: "/blog", label: "Блог" },
] as const;

export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isPrimaryNavLinkActive(pathname: string, linkPath: string): boolean {
  const current = normalizePathname(pathname);
  const target = normalizePathname(linkPath);

  if (target === "/blog") {
    return current === "/blog" || current.startsWith("/blog/");
  }

  return current === target;
}

export const activeNavLinkClass =
  "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent";

export const inactiveNavLinkClass = "text-muted-foreground hover:text-foreground";
