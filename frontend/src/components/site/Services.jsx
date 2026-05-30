import {
  ShieldCheck,
  UsersRound,
  BedDouble,
  BadgeCheck,
  Clock,
  Sofa,
  Sparkles,
  Gift,
} from "lucide-react";
import { SERVICES } from "../../data/content";

const ICONS = {
  ShieldCheck,
  UsersRound,
  BedDouble,
  BadgeCheck,
  Clock,
  Sofa,
  Sparkles,
  Gift,
};

export const Services = () => {
  return (
    <section
      id="services"
      data-testid="services-section"
      className="py-24 md:py-32 bg-primary text-white relative overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(196,154,69,0.18), transparent 70%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-12 gap-10 items-end mb-16">
          <div className="lg:col-span-7">
            <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">
              Kenapa Baba Tour?
            </div>
            <h2 className="font-serif-display text-white text-4xl sm:text-5xl mt-4 leading-tight">
              Setiap detail dirancang untuk kekhusyukan ibadah Anda
            </h2>
          </div>
          <p className="lg:col-span-5 text-white/75 leading-relaxed">
            Kami percaya umroh dan haji bukan sekadar perjalanan — namun panggilan suci
            yang patut dilayani dengan sepenuh hati. Inilah komitmen kami untuk Anda.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s, i) => {
            const Icon = ICONS[s.icon] || ShieldCheck;
            return (
              <div
                key={s.title}
                data-testid={`service-card-${i}`}
                className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-7 lift hover:bg-white/[0.08] hover:border-accent/40 transition"
              >
                <div className="w-11 h-11 rounded-full bg-accent/15 grid place-items-center text-accent">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-serif-display text-2xl mt-5">{s.title}</div>
                <div className="text-white/70 text-sm mt-2 leading-relaxed">
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
