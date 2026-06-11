import { Link, useLocation } from "react-router";
import { Menu, Phone, ShoppingCart, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { MobileMenu } from "./MobileMenu";
import { useCart } from "../../../context/CartContext";
import {
  activeNavLinkClass,
  inactiveNavLinkClass,
  isPrimaryNavLinkActive,
  primaryNavLinks,
} from "../../../lib/navLinks";
import { CONTACT_PHONE, CONTACT_PHONE_TEL, SITE_BRAND_TAGLINE, SITE_BRAND_TITLE } from "../../../lib/site";
import logo from "../../../assets/logo.png";

export function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[70] transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled || mobileMenuOpen
            ? "bg-background border-b border-border"
            : "max-lg:bg-background/85 max-lg:backdrop-blur-sm bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-[var(--site-header-height)]">
            <Link
              to="/"
              className="flex items-center gap-3 shrink-0 text-foreground"
              aria-label={`${SITE_BRAND_TITLE}. ${SITE_BRAND_TAGLINE}`}
            >
              <img src={logo} alt="" aria-hidden className="h-8 w-auto md:h-10" />
              <div className="hidden md:grid leading-tight">
                <span className="font-heading text-sm sm:text-base uppercase text-justify [text-align-last:justify] [text-justify:inter-character]">
                  {SITE_BRAND_TITLE}
                </span>
                <span className="font-heading text-[10px] sm:text-xs uppercase text-muted-foreground text-justify [text-align-last:justify] [text-justify:inter-character]">
                  {SITE_BRAND_TAGLINE}
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {primaryNavLinks.map((link) => {
                const isActive = isPrimaryNavLinkActive(location.pathname, link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={isActive ? "page" : undefined}
                    className={`font-heading text-sm uppercase tracking-wider relative transition-colors duration-300 ${
                      isActive ? activeNavLinkClass : inactiveNavLinkClass
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-6">
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="hidden lg:flex items-center gap-2 text-foreground hover:text-accent transition-colors duration-300"
              >
                <Phone size={20} />
                <span>{CONTACT_PHONE}</span>
              </a>
              <Link to="/cart" className="relative text-foreground hover:text-accent transition-colors duration-300">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-xs flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="md:hidden text-foreground p-2 -mr-2"
                aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}
