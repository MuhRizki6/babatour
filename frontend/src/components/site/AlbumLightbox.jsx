import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export const AlbumLightbox = ({ open, images = [], startIndex = 0, title = "", onClose }) => {
  const [active, setActive] = useState(startIndex);

  useEffect(() => { if (open) setActive(startIndex); }, [open, startIndex]);

  const prev = useCallback(() => setActive((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length]);
  const next = useCallback(() => setActive((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, prev, next]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/95 backdrop-blur grid place-items-center p-4 md:p-8 animate-in fade-in"
      data-testid="album-lightbox"
    >
      <button
        className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center transition z-10"
        onClick={onClose}
        data-testid="lightbox-close"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {title && (
        <div className="absolute top-4 left-4 md:top-6 md:left-6 max-w-md">
          <div className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">Album</div>
          <div className="font-serif-display text-white text-xl md:text-2xl mt-1">{title}</div>
        </div>
      )}

      <button
        onClick={prev}
        data-testid="lightbox-prev"
        className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/25 text-white grid place-items-center transition z-10"
        aria-label="Previous"
      >
        <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
      </button>
      <button
        onClick={next}
        data-testid="lightbox-next"
        className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/25 text-white grid place-items-center transition z-10"
        aria-label="Next"
      >
        <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
      </button>

      <img
        src={images[active]}
        alt={`${title} ${active + 1}`}
        data-testid={`lightbox-image-${active}`}
        className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
      />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="bg-white/10 backdrop-blur text-white text-xs px-4 py-2 rounded-full font-medium">
          {active + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail rail */}
      <div className="absolute bottom-20 inset-x-0 px-4 hidden md:flex justify-center">
        <div className="flex gap-2 overflow-x-auto max-w-3xl py-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              data-testid={`lightbox-thumb-${i}`}
              className={`shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition ${
                i === active ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
