import { Link, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, Phone } from "lucide-react";
import { ADDRESS, CONTACT_PHONE, CONTACT_PHONE_TEL } from "../../../lib/site";
import { useEffect, useRef } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { path: "/catalogue", label: "Каталог" },
  { path: "/installation", label: "Услуги" },
  { path: "/about", label: "О нас" },
  { path: "/brands", label: "Бренды" },
  { path: "/blog", label: "Блог" },
];

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
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Мобильное меню">
          <motion.button
            type="button"
            aria-label="Закрыть меню"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-20 mx-4"
          >
            <div className="bg-card border border-card-border rounded-lg shadow-2xl overflow-hidden">
              <nav className="divide-y divide-border">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={onClose}
                      className={`block px-6 py-5 font-heading text-lg uppercase tracking-wider transition-colors duration-200 ${
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

              <div className="px-6 py-5 bg-secondary/20 space-y-3 text-sm">
                <a
                  href={`tel:${CONTACT_PHONE_TEL}`}
                  className="flex items-center gap-3 text-foreground hover:text-accent transition-colors"
                >
                  <Phone size={18} className="shrink-0" />
                  {CONTACT_PHONE}
                </a>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin size={18} className="shrink-0" />
                  {ADDRESS}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
