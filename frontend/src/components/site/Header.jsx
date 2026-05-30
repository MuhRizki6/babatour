import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { BRAND, NAV_LINKS } from "../../data/content";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[color:var(--bg)]/85 backdrop-blur-xl border-b border-soft"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        <a href="#home" data-testid="logo-link" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-white grid place-items-center font-serif-display text-2xl">
            B
          </div>
          <div className="leading-tight">
            <div className="font-serif-display text-xl text-primary">{BRAND.name}</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted">
              Umroh & Haji Khusus
            </div>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              data-testid={`nav-${l.id}-link`}
              className="text-sm text-main hover:text-accent transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href={`tel:${BRAND.phoneRaw}`}
            data-testid="header-call-btn"
            className="flex items-center gap-2 text-sm text-main hover:text-accent transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden xl:inline">{BRAND.phone}</span>
          </a>
          <a
            href="#contact"
            data-testid="header-cta-btn"
            className="bg-primary text-white hover:bg-primary/90 transition-colors rounded-full px-6 py-3 text-sm font-medium"
          >
            Daftar Sekarang
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-label="menu"
          data-testid="mobile-menu-toggle"
          className="lg:hidden p-2 text-primary"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-soft bg-[color:var(--bg)]">
          <div className="px-6 py-6 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                data-testid={`mobile-nav-${l.id}-link`}
                onClick={() => setOpen(false)}
                className="text-base text-main hover:text-accent"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
              data-testid="mobile-header-cta-btn"
              onClick={() => setOpen(false)}
              className="bg-primary text-white text-center rounded-full px-6 py-3 text-sm font-medium"
            >
              Daftar Sekarang
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
