import { ChevronRight, BadgeCheck, Plane, Star } from "lucide-react";
import { BRAND } from "../../data/content";

export const Hero = () => {
  return (
    <section
      id="home"
      data-testid="hero-section"
      className="relative min-h-[100vh] flex items-end pt-24 pb-16 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/34498854/pexels-photo-34498854.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1300&w=1880"
          alt="Kaaba Mecca"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        <div className="grain" />
      </div>

      <div className="relative max-w-7xl w-full mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-8 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-xs uppercase tracking-[0.22em] mb-8">
            <BadgeCheck className="w-4 h-4 text-accent" />
            Biro Perjalanan Umroh Berizin Resmi Kemenag RI
          </div>
          <h1 className="font-serif-display text-white text-[42px] sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
            {BRAND.fullName.split("&")[0].trim()}
            <span className="block text-accent italic">& Haji Khusus</span>
          </h1>
          <p className="mt-6 max-w-xl text-white/85 text-lg leading-relaxed">
            {BRAND.tagline}. Mendampingi setiap langkah ibadah Anda dengan tuntunan
            syariah, kenyamanan, dan ketenangan hati — dari Batam menuju Tanah Suci.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#packages"
              data-testid="hero-packages-cta"
              className="bg-accent text-white hover:bg-accent/90 transition-colors rounded-full px-8 py-4 font-medium flex items-center gap-2"
            >
              Lihat Paket Umroh <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="#contact"
              data-testid="hero-konsultasi-cta"
              className="border border-white/40 text-white hover:bg-white/10 transition-colors rounded-full px-8 py-4 font-medium"
            >
              Konsultasi Gratis
            </a>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6 max-w-xl">
            <div data-testid="hero-stat-1">
              <div className="font-serif-display text-white text-4xl">5K+</div>
              <div className="text-white/70 text-xs uppercase tracking-[0.18em] mt-1">
                Jamaah Berangkat
              </div>
            </div>
            <div data-testid="hero-stat-2">
              <div className="font-serif-display text-white text-4xl">12+</div>
              <div className="text-white/70 text-xs uppercase tracking-[0.18em] mt-1">
                Tahun Berpengalaman
              </div>
            </div>
            <div data-testid="hero-stat-3">
              <div className="font-serif-display text-white text-4xl">A</div>
              <div className="text-white/70 text-xs uppercase tracking-[0.18em] mt-1">
                Akreditasi Kemenag
              </div>
            </div>
          </div>
        </div>

        {/* floating card */}
        <div className="lg:col-span-4 hidden lg:block">
          <div className="bg-[color:var(--bg)]/95 backdrop-blur-xl border border-white/30 rounded-3xl p-7 lift">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-accent font-semibold">
              <Plane className="w-4 h-4" /> Keberangkatan Terdekat
            </div>
            <div className="font-serif-display text-2xl text-primary mt-3">
              Umrah Awal Tahun 2026
            </div>
            <div className="text-sm text-muted mt-1">
              12 hari • Hotel Bintang 5 • Direct Flight
            </div>
            <div className="mt-5 flex items-center gap-1 text-accent">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="text-xs text-muted ml-2">4.9 / 5 dari 1,200+ ulasan</span>
            </div>
            <div className="mt-6 pt-6 border-t border-soft flex items-center justify-between">
              <div>
                <div className="text-xs text-muted">Mulai dari</div>
                <div className="font-serif-display text-primary text-2xl">
                  Rp 39.5jt
                </div>
              </div>
              <a
                href="#contact"
                data-testid="hero-floating-cta"
                className="bg-primary text-white hover:bg-primary/90 transition rounded-full px-5 py-3 text-sm font-medium"
              >
                Daftar
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
