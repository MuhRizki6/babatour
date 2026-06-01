import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export const GalleryCarousel = ({ images = [], alt = "" }) => {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  if (!images || images.length === 0) return null;

  const prev = () => setActive((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActive((i) => (i + 1) % images.length);

  return (
    <div data-testid="gallery-carousel">
      <div className="relative overflow-hidden rounded-2xl bg-surface border border-soft">
        <img
          src={images[active]}
          alt={`${alt} ${active + 1}`}
          onClick={() => setZoom(true)}
          className="w-full h-[400px] md:h-[480px] object-cover cursor-zoom-in transition-opacity duration-300"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              data-testid="carousel-prev"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[color:var(--bg)]/90 backdrop-blur grid place-items-center text-primary hover:bg-[color:var(--bg)] transition"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              data-testid="carousel-next"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[color:var(--bg)]/90 backdrop-blur grid place-items-center text-primary hover:bg-[color:var(--bg)] transition"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              data-testid={`carousel-thumb-${i}`}
              className={`aspect-[4/3] overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-accent" : "border-transparent hover:border-soft"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur grid place-items-center p-6 cursor-zoom-out"
          onClick={() => setZoom(false)}
          data-testid="gallery-lightbox"
        >
          <button
            className="absolute top-6 right-6 text-white/80 hover:text-white"
            onClick={(e) => { e.stopPropagation(); setZoom(false); }}
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={images[active]}
            alt={alt}
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
