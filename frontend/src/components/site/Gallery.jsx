import { GALLERY } from "../../data/content";

export const Gallery = () => {
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
          </div>
          <p className="text-muted max-w-md">
            Dokumentasi perjalanan ibadah jamaah Baba Tour bersama keluarga dan
            sahabat — semoga menjadi inspirasi untuk perjalanan Anda berikutnya.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {GALLERY.map((src, i) => (
            <div
              key={i}
              data-testid={`gallery-item-${i}`}
              className={`group relative overflow-hidden rounded-2xl ${
                i === 0 || i === 5 ? "lg:row-span-2 lg:col-span-1 aspect-[3/4]" : "aspect-square"
              }`}
            >
              <img
                src={src}
                alt={`Pilgrim moment ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
