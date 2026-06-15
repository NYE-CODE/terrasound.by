import { Link, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { isPrimaryNavLinkActive, primaryNavLinks } from "../../../lib/navLinks";
import { useEffect, useRef } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const location = useLocation();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    onCloseRef.current();
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[65] md:hidden pointer-events-none"
          role="dialog"
          aria-modal="true"
          aria-label="Мобильное меню"
        >
          <motion.button
            type="button"
            aria-label="Закрыть меню"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute inset-0 top-[var(--site-header-stack-height)] bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto absolute inset-x-0 top-[var(--site-header-stack-height)] bg-card border-b border-border shadow-lg"
          >
            <nav
              className="divide-y divide-border overflow-y-auto"
              style={{ maxHeight: "calc(100dvh - var(--site-header-stack-height))" }}
            >
              {primaryNavLinks.map((link) => {
                const isActive = isPrimaryNavLinkActive(location.pathname, link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={`block px-6 py-4 font-heading text-base uppercase tracking-wider transition-colors duration-200 ${
                      isActive
                        ? "text-accent bg-accent/5"
                        : "text-foreground hover:text-accent hover:bg-secondary/30"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
