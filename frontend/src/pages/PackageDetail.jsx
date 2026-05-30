import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ChevronLeft, Check, X, MapPin, Plane, Calendar, Sparkles, Star, MessageCircle } from "lucide-react";
import { PACKAGES, BRAND } from "../data/content";
import { PACKAGE_DETAILS } from "../data/packageDetails";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { FloatingWhatsApp } from "../components/site/FloatingWhatsApp";

export default function PackageDetail() {
  const { id } = useParams();
  const pkg = PACKAGES.find((p) => p.id === id);
  const det = PACKAGE_DETAILS[id];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (pkg) document.title = `${pkg.name} — Baba Tour Umroh & Haji Khusus`;
    return () => {
      document.title = "Baba Tour Umroh & Haji Khusus | Sahabat Perjalanan Umroh Anda";
    };
  }, [pkg]);

  if (!pkg || !det) return <Navigate to="/" replace />;

  const waMsg = encodeURIComponent(`Assalamualaikum Baba Tour, saya tertarik dengan paket ${pkg.name}. Mohon informasi lebih detail.`);

  return (
    <div className="bg-[color:var(--bg)] min-h-screen" data-testid="package-detail-page">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <Link
            to="/#packages"
            className="inline-flex items-center gap-2 text-white/80 hover:text-accent transition text-sm"
            data-testid="package-back-link"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke daftar paket
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-xs uppercase tracking-[0.22em] font-semibold">
            {pkg.badge}
          </div>
          <h1 className="font-serif-display text-white text-4xl sm:text-6xl mt-5 leading-[1.05] max-w-3xl">
            {pkg.name}
          </h1>
          <div className="mt-6 flex flex-wrap gap-5 text-white/85 text-sm">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" /> {pkg.duration}</span>
            <span className="flex items-center gap-2"><Plane className="w-4 h-4 text-accent" /> {pkg.airline}</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> {pkg.departures}</span>
          </div>
        </div>
      </section>

      {/* Main grid */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-10">
          {/* Left: content */}
          <div className="lg:col-span-8 space-y-14">
            {/* Overview */}
            <div data-testid="package-overview">
              <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">Overview</div>
              <h2 className="font-serif-display text-primary text-3xl mt-3">Tentang Paket Ini</h2>
              <p className="text-muted mt-5 leading-relaxed">{det.overview}</p>
            </div>

            {/* Highlights */}
            <div data-testid="package-highlights">
              <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">Highlights</div>
              <h2 className="font-serif-display text-primary text-3xl mt-3">Yang Anda Dapatkan</h2>
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {det.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 bg-surface border border-soft rounded-2xl p-4">
                    <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-main">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            <div data-testid="package-itinerary">
              <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">Itinerary</div>
              <h2 className="font-serif-display text-primary text-3xl mt-3">Day-by-Day Perjalanan</h2>
              <div className="mt-8 relative">
                <div className="absolute left-[26px] top-2 bottom-2 w-px bg-soft" />
                {det.itinerary.map((d, i) => (
                  <div key={i} className="relative pl-16 pb-8" data-testid={`itinerary-day-${d.day}`}>
                    <div className="absolute left-0 top-0 w-[54px] h-[54px] rounded-full bg-primary text-white grid place-items-center font-serif-display text-lg shadow-lg">
                      {d.day}
                    </div>
                    <div className="bg-surface border border-soft rounded-2xl p-6">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">
                        Day {d.day}
                      </div>
                      <h3 className="font-serif-display text-primary text-xl mt-1">{d.title}</h3>
                      <p className="text-muted mt-2 text-sm leading-relaxed">{d.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Includes/Excludes */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface border border-soft rounded-2xl p-7" data-testid="package-includes">
                <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">Includes</div>
                <h3 className="font-serif-display text-primary text-2xl mt-2">Sudah Termasuk</h3>
                <ul className="mt-5 space-y-3">
                  {pkg.includes.map((i, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-main">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-surface border border-soft rounded-2xl p-7" data-testid="package-excludes">
                <div className="text-sm uppercase tracking-[0.22em] text-red-700 font-semibold">Excludes</div>
                <h3 className="font-serif-display text-primary text-2xl mt-2">Tidak Termasuk</h3>
                <ul className="mt-5 space-y-3">
                  {det.excludes.map((i, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-muted">
                      <X className="w-4 h-4 text-red-500/70 shrink-0 mt-0.5" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Sticky CTA card */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 bg-primary text-white rounded-3xl p-8 relative overflow-hidden">
              <div
                aria-hidden
                className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(196,154,69,0.22), transparent 70%)" }}
              />
              <div className="relative">
                <div className="text-xs uppercase tracking-[0.22em] text-accent font-semibold">Harga Mulai</div>
                <div className="font-serif-display text-5xl mt-2">{pkg.priceFrom}</div>
                <div className="text-white/70 text-sm mt-1">per jamaah · subject to availability</div>

                <div className="flex items-center gap-1 text-accent mt-5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  <span className="text-xs text-white/70 ml-2">4.9 / 5 dari jamaah</span>
                </div>

                <div className="mt-7 space-y-3">
                  <Link
                    to="/#contact"
                    data-testid="detail-daftar-btn"
                    className="w-full bg-accent text-white hover:bg-accent/90 transition rounded-full px-6 py-3.5 text-sm font-medium block text-center"
                  >
                    Daftar Sekarang
                  </Link>
                  <a
                    href={`https://wa.me/${BRAND.phoneRaw}?text=${waMsg}`}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="detail-wa-btn"
                    className="w-full border border-white/30 text-white hover:bg-white/10 transition rounded-full px-6 py-3.5 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> Konsultasi WhatsApp
                  </a>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-white/85">{pkg.hotelMakkah}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-white/85">{pkg.hotelMadinah}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
