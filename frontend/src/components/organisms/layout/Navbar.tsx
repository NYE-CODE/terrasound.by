import { Link, useLocation } from "react-router";
import { Menu, Phone, ShoppingCart, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { MobileMenu } from "./MobileMenu";
import { useCart } from "../../../context/CartContext";
import { CONTACT_PHONE, CONTACT_PHONE_TEL } from "../../../lib/site";

export function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/catalogue", label: "Каталог" },
    { path: "/installation", label: "Установка" },
    { path: "/brands", label: "Бренды" },
    { path: "/blog", label: "Блог" },
  ];

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-300 ${
          scrolled || mobileMenuOpen ? "bg-background border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="font-heading text-2xl font-bold tracking-tight text-foreground">
              TerraSound
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-heading text-sm uppercase tracking-wider relative transition-colors duration-300 ${
                    location.pathname === link.path
                      ? "text-foreground after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-[2px] after:bg-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
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
