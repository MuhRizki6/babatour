import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  Check, X, Star, Plane, Calendar, Users, MapPin, MessageCircle,
  Printer, Facebook, Twitter, Share2, ChevronLeft, Sparkles, Coffee,
  Gift, ChevronRight, ClipboardList,
} from "lucide-react";
import { BRAND } from "../data/content";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { FloatingWhatsApp } from "../components/site/FloatingWhatsApp";
import { GalleryCarousel } from "../components/site/GalleryCarousel";
import { usePackage, usePackages } from "../hooks/usePackages";
import { API_BASE } from "../lib/api";

export default function PackageDetail() {
  const { id } = useParams();
  const { pkg, loading, notFound } = usePackage(id);
  const { packages: others } = usePackages();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (pkg) document.title = `${pkg.fullTitle || pkg.name} — Baba Tour`;
    return () => { document.title = "Baba Tour Umroh & Haji Khusus | Sahabat Perjalanan Umroh Anda"; };
  }, [pkg]);

  if (loading) {
    return (
      <div className="bg-[color:var(--bg)] min-h-screen">
        <Header />
        <div className="pt-40 text-center text-muted">Memuat paket...</div>
      </div>
    );
  }
  if (notFound || !pkg) return <Navigate to="/" replace />;

  const waMsg = encodeURIComponent(
    `Assalamu'alaikum sahabat-sahabat,\n\nAda kabar gembira nih bagi yang sedang merencanakan ibadah Umroh!\n\n🕋 *${pkg.fullTitle}* 🕋\n\n📅 Keberangkatan: ${(pkg.departureCity || "").toUpperCase()}, ${pkg.departureDate}\n⏳ Durasi: ${pkg.durasi}\n\nDengan harga mulai dari ${pkg.priceFrom}.\n\nℹ️ Info lebih lanjut: ${window.location.href}`
  );
  const shareUrl = encodeURIComponent(window.location.href);
  const pdfUrl = `${API_BASE}/packages/${pkg.id}/pdf`;

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
          <Link to="/#packages" data-testid="package-back-link" className="inline-flex items-center gap-2 text-white/80 hover:text-accent transition text-sm">
            <ChevronLeft className="w-4 h-4" /> Kembali ke daftar paket
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-white text-[11px] uppercase tracking-[0.22em] font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" /> {pkg.badgeLong || pkg.badge}
          </div>
          <h1 className="font-serif-display text-white text-3xl sm:text-5xl lg:text-6xl mt-5 leading-[1.05] max-w-4xl">
            {pkg.fullTitle}
          </h1>
          <div className="mt-6 inline-flex items-center gap-2 text-white/85 text-sm bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full">
            <Users className="w-4 h-4 text-accent" /> Tersedia {pkg.availableSeats} Pax
          </div>
        </div>
      </section>

      {/* Info bar */}
      <section className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Info icon={Sparkles} label="Tipe Paket" value={pkg.tipePaket} />
          <Info icon={Calendar} label="Durasi" value={pkg.durasi} />
          <Info icon={Plane} label="Maskapai" value={pkg.airline} />
          <Info icon={MapPin} label="Keberangkatan" value={`${(pkg.departureCity || "").toUpperCase()} • ${shortDate(pkg.departureDate)}`} />
        </div>
      </section>

      {/* Main content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-14">

            {pkg.gallery && pkg.gallery.length > 0 && (
              <article data-testid="package-gallery">
                <Head eyebrow="Galeri" title="Foto Paket" />
                <div className="mt-6">
                  <GalleryCarousel images={pkg.gallery} alt={pkg.name} />
                </div>
              </article>
            )}

            <article data-testid="desc-section">
              <Head eyebrow="Deskripsi" title="Tentang Paket Ini" />
              <p className="text-muted mt-6 leading-relaxed">{pkg.overview}</p>

              <div className="mt-8 bg-surface border border-soft rounded-2xl p-7">
                <div className="font-serif-display text-primary text-2xl">{pkg.subtitle}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-accent mt-2 font-semibold">{pkg.headline}</div>
                <ul className="mt-6 space-y-2.5">
                  {(pkg.routes || []).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-main">
                      <ChevronRight className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            {(pkg.bonuses || []).length > 0 && (
              <article data-testid="bonus-section">
                <Head eyebrow="Bonus Khusus" title="Spesial untuk Anda" />
                <div className="mt-8 grid md:grid-cols-2 gap-5">
                  {pkg.bonuses.map((b, i) => (
                    <div key={i} className="bg-surface border border-soft rounded-2xl overflow-hidden lift">
                      {b.image && <div className="h-44 overflow-hidden"><img src={b.image} alt={b.title} className="w-full h-full object-cover" /></div>}
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

            <article className="bg-primary text-white rounded-2xl p-7 md:p-9">
              <div className="text-xs uppercase tracking-[0.22em] text-accent font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" /> Pembimbing Jamaah
              </div>
              <div className="font-serif-display text-2xl md:text-3xl mt-3">{pkg.pembimbing}</div>
            </article>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface border border-soft rounded-2xl p-7" data-testid="includes-card">
                <div className="text-xs uppercase tracking-[0.22em] text-emerald-700 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" /> Harga Termasuk
                </div>
                <ul className="mt-5 space-y-3">
                  {(pkg.includes || []).map((i, idx) => (
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
                  {(pkg.excludes || []).map((i, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-muted">
                      <X className="w-4 h-4 text-red-500/70 shrink-0 mt-0.5" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <article>
              <Head eyebrow="Keunggulan" title="Yang Membuat Berbeda" />
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {(pkg.highlights || []).map((h, i) => (
                  <div key={i} className="flex items-start gap-3 bg-surface border border-soft rounded-xl px-4 py-3">
                    <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-main">{h}</span>
                  </div>
                ))}
              </div>
            </article>

            <article data-testid="terms-section">
              <Head eyebrow="Syarat dan Ketentuan" title="Persyaratan Pendaftaran" />
              <div className="mt-6 bg-surface border border-soft rounded-2xl p-7">
                <ul className="space-y-3">
                  {(pkg.terms || []).map((t, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-main">
                      <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] grid place-items-center shrink-0 mt-0.5">{i + 1}</div>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <article data-testid="itinerary-section">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <Head eyebrow="Itinerari" title="Day-by-Day Perjalanan" />
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="print-itinerary-btn"
                  className="inline-flex items-center gap-2 border border-soft text-primary hover:bg-surface transition rounded-full px-5 py-2.5 text-sm self-start"
                >
                  <Printer className="w-4 h-4" /> Download Itinerary PDF
                </a>
              </div>

              <div className="mt-8 space-y-4">
                {(pkg.itinerary || []).map((d, i) => (
                  <div key={i} data-testid={`itinerary-day-${d.day}`} className="grid md:grid-cols-12 gap-5 bg-surface border border-soft rounded-2xl p-6">
                    <div className="md:col-span-2 flex md:flex-col items-center md:items-start gap-3 md:gap-1 md:border-r md:border-soft md:pr-5">
                      <div className="w-12 h-12 rounded-full bg-primary text-white grid place-items-center font-serif-display text-xl shrink-0">{d.day}</div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-accent font-semibold">Day {d.day}</div>
                        <div className="text-xs text-muted mt-0.5">{d.date}</div>
                      </div>
                    </div>
                    <div className="md:col-span-10">
                      <h3 className="font-serif-display text-primary text-xl leading-snug">Hari ke {d.day} — {d.title}</h3>
                      <div className="mt-2 text-xs text-muted flex items-center gap-1.5"><Coffee className="w-3.5 h-3.5 text-accent" /> {d.meals}</div>
                      <ul className="mt-4 space-y-2">
                        {(d.activities || []).map((a, k) => (
                          <li key={k} className="flex gap-2 text-sm text-main leading-relaxed">
                            <span className="text-accent mt-1.5">•</span><span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article data-testid="hotels-section">
              <Head eyebrow="Hotel" title="Akomodasi Selama Perjalanan" />
              <div className="mt-8 grid gap-6">
                {(pkg.hotels || []).map((h, i) => (
                  <div key={i} data-testid={`hotel-${i}`} className="bg-surface border border-soft rounded-2xl overflow-hidden grid md:grid-cols-12 lift">
                    {h.image && <div className="md:col-span-4 h-52 md:h-auto overflow-hidden"><img src={h.image} alt={h.name} className="w-full h-full object-cover" /></div>}
                    <div className={`p-6 md:p-7 ${h.image ? "md:col-span-8" : "md:col-span-12"}`}>
                      <div className="flex items-center gap-1 text-accent">
                        {[...Array(h.rating || 4)].map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-current" />)}
                      </div>
                      <h3 className="font-serif-display text-primary text-2xl mt-2">{h.name}</h3>
                      <div className="text-xs uppercase tracking-[0.2em] text-muted mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-accent" /> {h.location}
                      </div>
                      <p className="text-muted text-sm mt-4 leading-relaxed">{h.description}</p>
                      <div className="mt-5 pt-5 border-t border-soft grid grid-cols-2 gap-4 text-sm">
                        <div><div className="text-[10px] uppercase tracking-[0.18em] text-muted">Check-in</div><div className="text-primary mt-1 font-medium">{h.checkIn}</div></div>
                        <div><div className="text-[10px] uppercase tracking-[0.18em] text-muted">Check-out</div><div className="text-primary mt-1 font-medium">{h.checkOut}</div></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article data-testid="flights-section">
              <Head eyebrow="Maskapai" title="Jadwal Penerbangan" />
              <div className="mt-8 space-y-4">
                {(pkg.flights || []).map((f, i) => (
                  <div key={i} data-testid={`flight-${i}`} className="bg-surface border border-soft rounded-2xl p-6">
                    <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-soft">
                      {f.logo && <img src={f.logo} alt={f.airline} className="h-7 object-contain" />}
                      <div className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold">
                        {f.type === "Departure" ? "Keberangkatan" : f.type === "Arrival" ? "Kepulangan" : "Transit"}
                      </div>
                      <div className="text-sm text-muted">· {f.airline}</div>
                    </div>
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      <div>
                        <div className="font-serif-display text-primary text-4xl">{f.from?.code}</div>
                        <div className="font-medium text-main mt-1 text-sm">{f.from?.name}</div>
                        <div className="text-xs text-muted">{f.from?.city}</div>
                        <div className="text-xs text-primary mt-2 font-medium">{f.departTime}</div>
                      </div>
                      <div className="flex items-center justify-center text-accent"><Plane className="w-6 h-6 rotate-90 md:rotate-0" /></div>
                      <div className="md:text-right">
                        <div className="font-serif-display text-primary text-4xl">{f.to?.code}</div>
                        <div className="font-medium text-main mt-1 text-sm">{f.to?.name}</div>
                        <div className="text-xs text-muted">{f.to?.city}</div>
                        <div className="text-xs text-primary mt-2 font-medium">{f.arriveTime}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article data-testid="transport-section">
              <Head eyebrow="Transportasi" title="Armada Selama Perjalanan" />
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {(pkg.transports || []).map((t, i) => (
                  <div key={i} className="bg-surface border border-soft rounded-2xl p-5 flex items-center gap-4">
                    {t.logo && <img src={t.logo} alt={t.name} className="w-16 h-16 object-cover rounded-xl" />}
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-accent font-semibold">Transport</div>
                      <div className="font-serif-display text-primary text-lg mt-1">{t.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-5">
              <div className="bg-primary text-white rounded-3xl p-7 md:p-8 relative overflow-hidden">
                <div aria-hidden className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(196,154,69,0.22), transparent 70%)" }} />
                <div className="relative">
                  <div className="text-xs uppercase tracking-[0.22em] text-accent font-semibold">Mulai dari</div>
                  <div className="font-serif-display text-4xl md:text-5xl mt-2">{pkg.priceFrom}</div>
                  <div className="text-white/70 text-sm mt-1">per pax jamaah</div>
                  <div className="mt-5 flex items-center gap-1 text-accent">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    <span className="text-xs text-white/70 ml-2">4.9 / 5 dari jamaah</span>
                  </div>
                  <div className="mt-6 space-y-3">
                    <Link to="/#contact" data-testid="detail-daftar-btn" className="w-full bg-accent text-white hover:bg-accent/90 transition rounded-full px-6 py-3.5 text-sm font-medium block text-center">
                      Daftar Sekarang
                    </Link>
                    <a href={`https://wa.me/${BRAND.phoneRaw}?text=${waMsg}`} target="_blank" rel="noreferrer" data-testid="detail-wa-btn" className="w-full border border-white/30 text-white hover:bg-white/10 transition rounded-full px-6 py-3.5 text-sm font-medium flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Konsultasi WhatsApp
                    </a>
                    <a href={pdfUrl} target="_blank" rel="noreferrer" data-testid="detail-pdf-btn" className="w-full border border-accent/40 text-accent hover:bg-accent/10 transition rounded-full px-6 py-3 text-sm font-medium flex items-center justify-center gap-2">
                      <Printer className="w-4 h-4" /> Download PDF
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-soft rounded-2xl p-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted font-semibold flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> Bagikan</div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <ShareBtn href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} icon={Facebook} label="Facebook" />
                  <ShareBtn href={`https://twitter.com/intent/post?text=${encodeURIComponent(pkg.fullTitle || pkg.name)}&url=${shareUrl}`} icon={Twitter} label="Tweet" />
                  <ShareBtn href={`https://api.whatsapp.com/send?text=${waMsg}`} icon={MessageCircle} label="WhatsApp" />
                  <a href={pdfUrl} target="_blank" rel="noreferrer" data-testid="sidebar-pdf-btn" className="flex items-center justify-center gap-2 text-xs border border-soft rounded-full px-3 py-2.5 text-primary hover:bg-[color:var(--bg)] transition">
                    <Printer className="w-4 h-4" /> PDF
                  </a>
                </div>
              </div>

              {(others || []).filter((p) => p.id !== id).slice(0, 3).length > 0 && (
                <div className="bg-surface border border-soft rounded-2xl p-5">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted font-semibold flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> Paket Lainnya</div>
                  <div className="mt-4 space-y-3">
                    {(others || []).filter((p) => p.id !== id).slice(0, 3).map((p) => (
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
              )}
            </div>
          </aside>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-accent/20 grid place-items-center text-accent shrink-0"><Icon className="w-4 h-4" /></div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">{label}</div>
        <div className="text-sm text-white font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
function Head({ eyebrow, title }) {
  return (
    <div>
      <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">{eyebrow}</div>
      <h2 className="font-serif-display text-primary text-3xl md:text-4xl mt-3 leading-tight">{title}</h2>
    </div>
  );
}
function ShareBtn({ href, icon: Icon, label }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-xs border border-soft rounded-full px-3 py-2.5 text-primary hover:bg-[color:var(--bg)] transition">
      <Icon className="w-4 h-4" /> {label}
    </a>
  );
}
function shortDate(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}
