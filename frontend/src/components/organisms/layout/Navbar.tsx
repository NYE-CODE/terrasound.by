import { Link, useLocation } from "react-router";
import { Menu, Phone, ShoppingCart, X } from "lucide-react";
import { useState, useCallback } from "react";
import { MobileMenu } from "./MobileMenu";
import { useCart } from "../../../context/CartContext";
import {
  activeNavLinkClass,
  inactiveNavLinkClass,
  isPrimaryNavLinkActive,
  primaryNavLinks,
} from "../../../lib/navLinks";
import { useSiteContact } from "../../../context/SiteContactContext";
import { SITE_BRAND_TAGLINE, SITE_BRAND_TITLE } from "../../../lib/site";
import { SiteLogoWordmark } from "../../molecules/SiteLogoWordmark";
import logo from "../../../assets/logo.png";
import { LOGO_HEIGHT, LOGO_WIDTH } from "../../../lib/brandAssets";

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items } = useCart();
  const contact = useSiteContact();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <>
      <nav className="bg-background border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-[var(--site-header-height)]">
            <Link
              to="/"
              className="flex items-center gap-3 shrink-0 text-foreground"
              aria-label={`${SITE_BRAND_TITLE}. ${SITE_BRAND_TAGLINE}`}
            >
              <img
                src={logo}
                alt=""
                aria-hidden
                width={LOGO_WIDTH}
                height={LOGO_HEIGHT}
                className="h-8 w-auto md:h-10"
              />
              <SiteLogoWordmark title={SITE_BRAND_TITLE} tagline={SITE_BRAND_TAGLINE} />
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
              <div className="hidden lg:flex items-center gap-1.5 shrink-0">
                <Phone size={20} className="shrink-0 text-foreground" aria-hidden />
                <div className="flex flex-col items-start gap-0">
                  <a
                    href={`tel:${contact.phoneTel}`}
                    className="text-foreground hover:text-accent transition-colors duration-300"
                  >
                    {contact.phone}
                  </a>
                  <Link
                    to={{ pathname: "/installation", hash: "#consultation" }}
                    className="text-[10px] font-heading uppercase tracking-wider text-accent hover:text-accent/80 transition-colors duration-300"
                  >
                    Обратный звонок
                  </Link>
                </div>
              </div>
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
