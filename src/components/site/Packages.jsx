import { Check, MapPin, Plane, Calendar, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePackages } from "../../hooks/usePackages";

export const Packages = () => {
  const { packages, loading } = usePackages();

  return (
    <section
      id="packages"
      data-testid="packages-section"
      className="py-24 md:py-32 bg-surface"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-2xl">
          <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">
            Paket Perjalanan
          </div>
          <h2 className="font-serif-display text-primary text-4xl sm:text-5xl mt-4 leading-tight">
            Pilih paket yang menemani perjalanan suci Anda
          </h2>
          <p className="text-muted mt-5 leading-relaxed">
            Berbagai pilihan paket umroh dan haji khusus yang dirancang untuk
            menunjang kekhusyukan ibadah.
          </p>
        </div>

        {loading ? (
          <div className="mt-16 text-center text-muted">Memuat paket...</div>
        ) : (
          <div className="mt-16 grid md:grid-cols-2 gap-7">
            {packages.map((p) => (
              <article
                key={p.id}
                data-testid={`package-${p.id}-card`}
                className="bg-[color:var(--bg)] border border-soft rounded-2xl overflow-hidden lift"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-accent text-white text-[11px] uppercase tracking-[0.18em] font-semibold px-3 py-1.5 rounded-full">
                    {p.badge}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-[color:var(--bg)]/95 backdrop-blur rounded-full px-4 py-2 text-xs">
                    <span className="text-muted">Mulai dari</span>{" "}
                    <span className="font-serif-display text-primary text-base ml-1">
                      {p.priceFrom}
                    </span>
                  </div>
                </div>

                <div className="p-7 md:p-9">
                  <h3 className="font-serif-display text-primary text-3xl">{p.name}</h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      {p.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <Plane className="w-3.5 h-3.5 text-accent" />
                      {p.airline}
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      {p.departures}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-soft space-y-2 text-sm">
                    <div className="flex gap-2 text-main">
                      <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>{p.hotelMakkah}</span>
                    </div>
                    <div className="flex gap-2 text-main">
                      <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>{p.hotelMadinah}</span>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-2.5">
                    {(p.includes || []).slice(0, 4).map((inc) => (
                      <li
                        key={inc}
                        className="flex items-start gap-2.5 text-sm text-muted"
                      >
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex items-center gap-3">
                    <Link
                      to={`/packages/${p.id}`}
                      data-testid={`package-${p.id}-detail`}
                      className="bg-primary text-white hover:bg-primary/90 transition rounded-full px-6 py-3 text-sm font-medium flex-1 text-center inline-flex items-center justify-center gap-2"
                    >
                      Lihat Detail <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href={`https://wa.me/6282392156538?text=Halo%20Baba%20Tour,%20saya%20tertarik%20dengan%20paket%20${encodeURIComponent(p.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      data-testid={`package-${p.id}-wa`}
                      className="border border-soft text-primary hover:bg-surface transition rounded-full px-6 py-3 text-sm font-medium"
                    >
                      Tanya
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
