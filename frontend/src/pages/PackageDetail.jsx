import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  Check, X, Star, Plane, Calendar, Users, MapPin, MessageCircle,
  Printer, Facebook, Twitter, Share2, ChevronLeft, Sparkles, Coffee, ClipboardList,
  BedDouble, Bus, ChevronRight, Gift,
} from "lucide-react";
import { PACKAGES, BRAND } from "../data/content";
import { PACKAGE_DETAILS } from "../data/packageDetails";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { FloatingWhatsApp } from "../components/site/FloatingWhatsApp";

const fmtRupiah = (s) => s; // already pre-formatted

export default function PackageDetail() {
  const { id } = useParams();
  const pkg = PACKAGES.find((p) => p.id === id);
  const det = PACKAGE_DETAILS[id];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (pkg) document.title = `${det?.fullTitle || pkg.name} — Baba Tour`;
    return () => {
      document.title = "Baba Tour Umroh & Haji Khusus | Sahabat Perjalanan Umroh Anda";
    };
  }, [pkg, det]);

  if (!pkg || !det) return <Navigate to="/" replace />;

  const waMsg = encodeURIComponent(
    `Assalamu'alaikum sahabat-sahabat,\n\nAda kabar gembira nih bagi yang sedang merencanakan ibadah Umroh!\n\n🕋 *${det.fullTitle}* 🕋\n\n📅 Keberangkatan: ${det.departureCity.toUpperCase()}, ${det.departureDate}\n🏨 Akomodasi: Hotel ${det.hotels[0]?.rating || 4} bintang\n⏳ Durasi: ${det.durasi}\n\nDengan harga mulai dari ${pkg.priceFrom}, Anda bisa merasakan keindahan ibadah dengan kenyamanan yang terjamin!\n\nℹ️ Info lebih lanjut: ${window.location.href}`
  );
  const shareUrl = encodeURIComponent(window.location.href);

  return (
    <div className="bg-[color:var(--bg)] min-h-screen" data-testid="package-detail-page">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-16">
          <Link
            to="/#packages"
            data-testid="package-back-link"
            className="inline-flex items-center gap-2 text-white/80 hover:text-accent transition text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke daftar paket
          </Link>

          <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-white text-[11px] uppercase tracking-[0.22em] font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" /> {pkg.badge}
          </div>

          <h1 className="font-serif-display text-white text-3xl sm:text-5xl lg:text-6xl mt-5 leading-[1.05] max-w-4xl">
            {det.fullTitle}
          </h1>

          <div className="mt-6 inline-flex items-center gap-2 text-white/85 text-sm bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full">
            <Users className="w-4 h-4 text-accent" /> Tersedia {det.availableSeats} Pax
          </div>
        </div>
      </section>

      {/* Quick info bar */}
      <section className="bg-primary text-white -mt-px">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <InfoCell icon={Sparkles} label="Tipe Paket" value={det.tipePaket} />
          <InfoCell icon={Calendar} label="Durasi" value={det.durasi} />
          <InfoCell icon={Plane} label="Maskapai" value={pkg.airline} />
          <InfoCell icon={MapPin} label="Keberangkatan" value={`${det.departureCity.toUpperCase()} • ${formatShortDate(det.departureDate)}`} />
        </div>
      </section>

      {/* Main content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-14">
            {/* Description */}
            <article data-testid="desc-section">
              <SectionHead eyebrow="Deskripsi" title="Tentang Paket Ini" />
              <p className="text-muted mt-6 leading-relaxed">{det.overview}</p>

              <div className="mt-8 bg-surface border border-soft rounded-2xl p-7">
                <div className="font-serif-display text-primary text-2xl">{det.subtitle}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-accent mt-2 font-semibold">
                  {det.headline}
                </div>
                <ul className="mt-6 space-y-2.5">
                  {det.routes.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-main">
                      <ChevronRight className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            {/* Bonuses */}
            {det.bonuses.length > 0 && (
              <article data-testid="bonus-section">
                <SectionHead eyebrow="Bonus Khusus" title="Spesial untuk Anda" />
                <div className="mt-8 grid md:grid-cols-2 gap-5">
                  {det.bonuses.map((b, i) => (
                    <div key={i} className="bg-surface border border-soft rounded-2xl overflow-hidden lift">
                      <div className="h-44 overflow-hidden">
                        <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-accent" />
                          <div className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">Bonus</div>
                        </div>
                        <h3 className="font-serif-display text-primary text-xl mt-2 leading-tight">{b.title}</h3>
                        <p className="text-muted text-sm mt-2 leading-relaxed">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )}

            {/* Pembimbing */}
            <article className="bg-primary text-white rounded-2xl p-7 md:p-9 relative overflow-hidden">
              <div className="text-xs uppercase tracking-[0.22em] text-accent font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" /> Pembimbing Jamaah
              </div>
              <div className="font-serif-display text-2xl md:text-3xl mt-3">{det.pembimbing}</div>
            </article>

            {/* Includes / Excludes */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface border border-soft rounded-2xl p-7" data-testid="includes-card">
                <div className="text-xs uppercase tracking-[0.22em] text-emerald-700 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" /> Harga Termasuk
                </div>
                <ul className="mt-5 space-y-3">
                  {det.includes.map((i, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-main">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-surface border border-soft rounded-2xl p-7" data-testid="excludes-card">
                <div className="text-xs uppercase tracking-[0.22em] text-red-700 font-semibold flex items-center gap-2">
                  <X className="w-4 h-4" /> Harga Tidak Termasuk
                </div>
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

            {/* Highlights */}
            <article>
              <SectionHead eyebrow="Keunggulan / Kelebihan" title="Yang Membuat Berbeda" />
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {det.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 bg-surface border border-soft rounded-xl px-4 py-3">
                    <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-main">{h}</span>
                  </div>
                ))}
              </div>
            </article>

            {/* Terms */}
            <article data-testid="terms-section">
              <SectionHead eyebrow="Syarat dan Ketentuan" title="Persyaratan Pendaftaran" />
              <div className="mt-6 bg-surface border border-soft rounded-2xl p-7">
                <ul className="space-y-3">
                  {det.terms.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-main">
                      <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] grid place-items-center shrink-0 mt-0.5">{i + 1}</div>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            {/* Itinerary */}
            <article data-testid="itinerary-section">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <SectionHead eyebrow="Itinerari" title="Day-by-Day Perjalanan" />
                <Link
                  to={`/print/packages/${id}`}
                  data-testid="print-itinerary-btn"
                  className="inline-flex items-center gap-2 border border-soft text-primary hover:bg-surface transition rounded-full px-5 py-2.5 text-sm self-start"
                >
                  <Printer className="w-4 h-4" /> Print Itinerary
                </Link>
              </div>

              <div className="mt-8 space-y-4">
                {det.itinerary.map((d, i) => (
                  <div key={i} data-testid={`itinerary-day-${d.day}`} className="grid md:grid-cols-12 gap-5 bg-surface border border-soft rounded-2xl p-6">
                    <div className="md:col-span-2 flex md:flex-col items-center md:items-start gap-3 md:gap-1 md:border-r md:border-soft md:pr-5">
                      <div className="w-12 h-12 rounded-full bg-primary text-white grid place-items-center font-serif-display text-xl shrink-0">
                        {d.day}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-accent font-semibold">Day {d.day}</div>
                        <div className="text-xs text-muted mt-0.5">{d.date}</div>
                      </div>
                    </div>
                    <div className="md:col-span-10">
                      <h3 className="font-serif-display text-primary text-xl leading-snug">
                        Hari ke {d.day} — {d.title}
                      </h3>
                      <div className="mt-2 text-xs text-muted flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-accent" /> {d.meals}
                      </div>
                      <ul className="mt-4 space-y-2">
                        {d.activities.map((a, k) => (
                          <li key={k} className="flex gap-2 text-sm text-main leading-relaxed">
                            <span className="text-accent mt-1.5">•</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Hotels */}
            <article data-testid="hotels-section">
              <SectionHead eyebrow="Hotel" title="Akomodasi Selama Perjalanan" />
              <div className="mt-8 grid gap-6">
                {det.hotels.map((h, i) => (
                  <div key={i} data-testid={`hotel-${i}`} className="bg-surface border border-soft rounded-2xl overflow-hidden grid md:grid-cols-12 gap-0 lift">
                    <div className="md:col-span-4 h-52 md:h-auto overflow-hidden">
                      <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="md:col-span-8 p-6 md:p-7">
                      <div className="flex items-center gap-1 text-accent">
                        {[...Array(h.rating)].map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-current" />)}
                      </div>
                      <h3 className="font-serif-display text-primary text-2xl mt-2">{h.name}</h3>
                      <div className="text-xs uppercase tracking-[0.2em] text-muted mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-accent" /> {h.location}
                      </div>
                      <p className="text-muted text-sm mt-4 leading-relaxed">{h.description}</p>
                      <div className="mt-5 pt-5 border-t border-soft grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.18em] text-muted">Check-in</div>
                          <div className="text-primary mt-1 font-medium">{h.checkIn}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.18em] text-muted">Check-out</div>
                          <div className="text-primary mt-1 font-medium">{h.checkOut}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Flights */}
            <article data-testid="flights-section">
              <SectionHead eyebrow="Maskapai" title="Jadwal Penerbangan" />
              <div className="mt-8 space-y-4">
                {det.flights.map((f, i) => (
                  <div key={i} data-testid={`flight-${i}`} className="bg-surface border border-soft rounded-2xl p-6">
                    <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-soft">
                      <img src={f.logo} alt={f.airline} className="h-7 object-contain" />
                      <div className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold">
                        {f.type === "Departure" ? "Keberangkatan" : f.type === "Arrival" ? "Kepulangan" : "Penerbangan"}
                      </div>
                      <div className="text-sm text-muted">· {f.airline}</div>
                    </div>
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      <div>
                        <div className="font-serif-display text-primary text-4xl">{f.from.code}</div>
                        <div className="font-medium text-main mt-1 text-sm">{f.from.name}</div>
                        <div className="text-xs text-muted">{f.from.city}</div>
                        <div className="text-xs text-primary mt-2 font-medium">{f.departTime}</div>
                      </div>
                      <div className="flex items-center justify-center text-accent">
                        <Plane className="w-6 h-6 rotate-90 md:rotate-0" />
                      </div>
                      <div className="md:text-right">
                        <div className="font-serif-display text-primary text-4xl">{f.to.code}</div>
                        <div className="font-medium text-main mt-1 text-sm">{f.to.name}</div>
                        <div className="text-xs text-muted">{f.to.city}</div>
                        <div className="text-xs text-primary mt-2 font-medium">{f.arriveTime}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Transport */}
            <article data-testid="transport-section">
              <SectionHead eyebrow="Transportasi" title="Armada Selama Perjalanan" />
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {det.transports.map((t, i) => (
                  <div key={i} className="bg-surface border border-soft rounded-2xl p-5 flex items-center gap-4">
                    <img src={t.logo} alt={t.name} className="w-16 h-16 object-cover rounded-xl" />
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-accent font-semibold">Transport</div>
                      <div className="font-serif-display text-primary text-lg mt-1">{t.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* Sticky CTA */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-5">
              <div className="bg-primary text-white rounded-3xl p-7 md:p-8 relative overflow-hidden">
                <div
                  aria-hidden
                  className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(196,154,69,0.22), transparent 70%)" }}
                />
                <div className="relative">
                  <div className="text-xs uppercase tracking-[0.22em] text-accent font-semibold">Mulai dari</div>
                  <div className="font-serif-display text-4xl md:text-5xl mt-2">{fmtRupiah(pkg.priceFrom)}</div>
                  <div className="text-white/70 text-sm mt-1">per pax jamaah</div>

                  <div className="mt-5 flex items-center gap-1 text-accent">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    <span className="text-xs text-white/70 ml-2">4.9 / 5 dari jamaah</span>
                  </div>

                  <div className="mt-6 space-y-3">
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

                  <div className="mt-6 pt-6 border-t border-white/10 space-y-2.5 text-sm">
                    <Bullet icon={Users}>Tersedia {det.availableSeats} Pax</Bullet>
                    <Bullet icon={Calendar}>{det.durasi}</Bullet>
                    <Bullet icon={Plane}>{pkg.airline}</Bullet>
                    <Bullet icon={MapPin}>{det.departureCity}, {formatShortDate(det.departureDate)}</Bullet>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="bg-surface border border-soft rounded-2xl p-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted font-semibold flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> Bagikan Paket Ini
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <ShareBtn href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} icon={Facebook} label="Facebook" />
                  <ShareBtn href={`https://twitter.com/intent/post?text=${encodeURIComponent(det.fullTitle)}&url=${shareUrl}`} icon={Twitter} label="Tweet" />
                  <ShareBtn href={`https://api.whatsapp.com/send?text=${waMsg}`} icon={MessageCircle} label="WhatsApp" />
                  <Link
                    to={`/print/packages/${id}`}
                    data-testid="sidebar-print-btn"
                    className="flex items-center justify-center gap-2 text-xs border border-soft rounded-full px-3 py-2.5 text-primary hover:bg-[color:var(--bg)] transition"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </Link>
                </div>
              </div>

              {/* Other packages */}
              <div className="bg-surface border border-soft rounded-2xl p-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted font-semibold flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5" /> Paket Lainnya
                </div>
                <div className="mt-4 space-y-3">
                  {PACKAGES.filter((p) => p.id !== id).slice(0, 3).map((p) => (
                    <Link key={p.id} to={`/packages/${p.id}`} className="flex items-center gap-3 group">
                      <img src={p.image} alt={p.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-accent">{p.duration}</div>
                        <div className="font-serif-display text-primary text-sm leading-tight group-hover:text-accent transition truncate">{p.name}</div>
                        <div className="text-xs text-muted">{p.priceFrom}</div>
                      </div>
                    </Link>
                  ))}
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

function InfoCell({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-accent/20 grid place-items-center text-accent shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">{label}</div>
        <div className="text-sm text-white font-medium truncate">{value}</div>
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title }) {
  return (
    <div>
      <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">{eyebrow}</div>
      <h2 className="font-serif-display text-primary text-3xl md:text-4xl mt-3 leading-tight">{title}</h2>
    </div>
  );
}

function Bullet({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-2 text-white/85">
      <Icon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function ShareBtn({ href, icon: Icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-center gap-2 text-xs border border-soft rounded-full px-3 py-2.5 text-primary hover:bg-[color:var(--bg)] transition"
    >
      <Icon className="w-4 h-4" /> {label}
    </a>
  );
}

function formatShortDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}
