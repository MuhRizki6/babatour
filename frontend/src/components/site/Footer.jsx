import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { BRAND, NAV_LINKS } from "../../data/content";

export const Footer = () => {
  return (
    <footer
      data-testid="site-footer"
      className="bg-primary text-white pt-20 pb-10"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="font-serif-display text-5xl md:text-6xl leading-tight">
              {BRAND.name}
              <span className="text-accent italic">.</span>
            </div>
            <p className="text-white/70 mt-5 max-w-md leading-relaxed">
              {BRAND.tagline}. Mengantar Anda menuju Tanah Suci dengan pelayanan
              terbaik, terpercaya, dan resmi Kemenag RI.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <a
                href={BRAND.facebook}
                target="_blank"
                rel="noreferrer"
                data-testid="footer-facebook-link"
                aria-label="Facebook"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-accent transition grid place-items-center"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noreferrer"
                data-testid="footer-instagram-link"
                aria-label="Instagram"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-accent transition grid place-items-center"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="text-xs uppercase tracking-[0.22em] text-accent font-semibold">
              Navigasi
            </div>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    data-testid={`footer-nav-${l.id}-link`}
                    className="text-white/75 hover:text-accent transition text-sm"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <div className="text-xs uppercase tracking-[0.22em] text-accent font-semibold">
              Kontak
            </div>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span className="text-white/80">{BRAND.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <a href={`tel:${BRAND.phoneRaw}`} className="text-white/80 hover:text-accent transition">
                  {BRAND.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <a href={`mailto:${BRAND.email}`} className="text-white/80 hover:text-accent transition break-all">
                  {BRAND.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-white/60">
          <div>
            © {new Date().getFullYear()} Baba Tour Umroh & Haji Khusus. All rights reserved.
          </div>
          <div>Penyelenggara Perjalanan Ibadah Umroh & Haji Khusus berizin Kemenag RI.</div>
        </div>
      </div>
    </footer>
  );
};
