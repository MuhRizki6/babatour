import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ImageIcon } from "lucide-react";
import { api } from "../../lib/api";
import { AlbumLightbox } from "./AlbumLightbox";

export const Gallery = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAlbum, setActiveAlbum] = useState(null);

  useEffect(() => {
    api.get("/albums/public")
      .then((r) => setAlbums((r.data || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (albums.length === 0) return null;

  return (
    <section
      id="gallery"
      data-testid="gallery-section"
      className="py-24 md:py-32 bg-[color:var(--bg)]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">
              Galeri Jamaah
            </div>
            <h2 className="font-serif-display text-primary text-4xl sm:text-5xl mt-4 leading-tight">
              Momen indah para jamaah di Tanah Suci
            </h2>
            <p className="text-muted mt-5 max-w-lg">
              Dokumentasi perjalanan ibadah jamaah Baba Tour — klik untuk melihat album lengkap.
            </p>
          </div>
          <Link
            to="/gallery"
            data-testid="gallery-see-more-link"
            className="inline-flex items-center gap-2 border border-soft text-primary hover:bg-surface transition rounded-full px-6 py-3 text-sm font-medium self-start"
          >
            Lihat Galeri Lengkap <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {albums.map((a, i) => (
            <button
              key={a.id}
              data-testid={`gallery-album-${a.slug}`}
              onClick={() => setActiveAlbum(a)}
              className="group text-left relative overflow-hidden rounded-2xl bg-surface border border-soft aspect-square lift"
            >
              <img
                src={a.cover_image || a.images?.[0]}
                alt={a.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute top-3 right-3 bg-accent text-white text-[9px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> {a.images?.length || 0}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="font-serif-display text-white text-lg leading-tight line-clamp-2">
                  {a.title}
                </div>
                {a.event_date && (
                  <div className="text-white/75 text-xs mt-1">{a.event_date}</div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-primary hover:text-accent text-sm font-medium"
          >
            Lihat semua album <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <AlbumLightbox
        open={!!activeAlbum}
        images={activeAlbum?.images || []}
        startIndex={0}
        title={activeAlbum?.title || ""}
        onClose={() => setActiveAlbum(null)}
      />
    </section>
  );
};
