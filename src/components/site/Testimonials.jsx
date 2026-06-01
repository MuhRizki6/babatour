import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "../../data/content";

export const Testimonials = () => {
  return (
    <section
      id="testimonials"
      data-testid="testimonials-section"
      className="py-24 md:py-32 bg-surface"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-2xl mb-14">
          <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">
            Cerita Jamaah
          </div>
          <h2 className="font-serif-display text-primary text-4xl sm:text-5xl mt-4 leading-tight">
            Apa kata mereka tentang Baba Tour?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <article
              key={t.name}
              data-testid={`testimonial-${i}`}
              className="bg-[color:var(--bg)] border border-soft rounded-2xl p-8 md:p-10 lift relative"
            >
              <Quote className="absolute top-7 right-7 w-10 h-10 text-accent/30" />
              <div className="flex items-center gap-1 text-accent mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-main leading-relaxed text-[15px] md:text-base">
                “{t.quote}”
              </p>
              <div className="mt-7 pt-6 border-t border-soft flex items-center gap-4">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-serif-display text-primary text-lg">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted uppercase tracking-[0.15em] mt-0.5">
                    {t.package}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
