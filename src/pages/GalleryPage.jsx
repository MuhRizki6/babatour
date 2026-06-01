import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ImageIcon, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { FloatingWhatsApp } from "../components/site/FloatingWhatsApp";
import { AlbumLightbox } from "../components/site/AlbumLightbox";

export default function GalleryPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    document.title = "Galeri Jamaah — Baba Tour";
    api.get("/albums/public")
      .then((r) => setAlbums(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => { document.title = "Baba Tour Umroh & Haji Khusus | Sahabat Perjalanan Umroh Anda"; };
  }, []);

  const openAlbum = (album, index = 0) => {
    setActiveAlbum(album);
    setStartIndex(index);
  };

  return (
    <div className="bg-[color:var(--bg)] min-h-screen" data-testid="gallery-page">
      <Header />

      <section className="pt-40 pb-14">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">Galeri</div>
            <h1 className="font-serif-display text-primary text-5xl sm:text-6xl mt-4 leading-tight">
              Album perjalanan jamaah Baba Tour
            </h1>
            <p className="text-muted mt-5 leading-relaxed">
              Jelajahi momen-momen sakral dan kebersamaan jamaah kami di Tanah Suci dan
              destinasi ziarah Islam. Klik salah satu album untuk melihat dokumentasi lengkap.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {loading ? (
            <div className="text-center py-20 text-muted">Memuat album...</div>
          ) : albums.length === 0 ? (
            <div className="bg-surface border border-soft rounded-2xl p-16 text-center">
              <ImageIcon className="w-12 h-12 text-accent mx-auto" />
              <div className="font-serif-display text-primary text-3xl mt-5">Belum ada album</div>
              <p className="text-muted mt-3">Album dokumentasi jamaah akan segera hadir.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((a) => (
                <button
                  key={a.id}
                  data-testid={`album-card-${a.slug}`}
                  onClick={() => openAlbum(a, 0)}
                  className="group text-left bg-surface border border-soft rounded-2xl overflow-hidden lift"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={a.cover_image || a.images?.[0]}
                      alt={a.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 bg-accent text-white text-[10px] uppercase tracking-[0.18em] font-semibold px-3 py-1.5 rounded-full">
                      {a.images?.length || 0} Foto
                    </div>
                    {a.event_date && (
                      <div className="absolute bottom-4 left-4 text-white text-xs font-medium">
                        {a.event_date}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="font-serif-display text-primary text-2xl leading-tight group-hover:text-accent transition">
                      {a.title}
                    </h2>
                    {a.description && (
                      <p className="text-muted text-sm mt-3 line-clamp-2 leading-relaxed">{a.description}</p>
                    )}
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:text-accent transition">
                      Lihat Album <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <AlbumLightbox
        open={!!activeAlbum}
        images={activeAlbum?.images || []}
        startIndex={startIndex}
        title={activeAlbum?.title || ""}
        onClose={() => setActiveAlbum(null)}
      />

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
