import { Link, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, Phone } from "lucide-react";
import { useSiteContact } from "../../../context/SiteContactContext";
import { isPrimaryNavLinkActive, primaryNavLinks } from "../../../lib/navLinks";
import { useEffect, useRef } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const contact = useSiteContact();
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
        <div className="fixed inset-0 z-[65] md:hidden" role="dialog" aria-modal="true" aria-label="Мобильное меню">
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
            className="absolute inset-x-0 top-[var(--site-header-height)] mx-4"
          >
            <div className="bg-card border border-card-border rounded-lg shadow-2xl overflow-hidden">
              <nav className="divide-y divide-border">
                {primaryNavLinks.map((link) => {
                  const isActive = isPrimaryNavLinkActive(location.pathname, link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={onClose}
                      aria-current={isActive ? "page" : undefined}
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
                  href={`tel:${contact.phoneTel}`}
                  className="flex items-center gap-3 text-foreground hover:text-accent transition-colors"
                >
                  <Phone size={18} className="shrink-0" />
                  {contact.phone}
                </a>
                <a
                  href={contact.addressMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors"
                >
                  <MapPin size={18} className="shrink-0" />
                  {contact.address}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
