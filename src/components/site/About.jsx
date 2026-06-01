import { BadgeCheck, ShieldCheck, Heart } from "lucide-react";

export const About = () => {
  return (
    <section
      id="about"
      data-testid="about-section"
      className="py-24 md:py-32 bg-[color:var(--bg)]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <img
            src="https://images.pexels.com/photos/18360295/pexels-photo-18360295.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=700"
            alt="Masjid Nabawi"
            className="rounded-2xl w-full h-[520px] object-cover shadow-lg"
          />
          <img
            src="https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxrYWFiYSUyMG1lY2NhfGVufDB8fHx8MTc4MDE4MjY2NHww&ixlib=rb-4.1.0&q=85"
            alt="Kaaba"
            className="absolute -bottom-10 -right-6 rounded-2xl w-56 h-72 object-cover border-4 border-[color:var(--bg)] shadow-xl hidden md:block"
          />
          <div className="absolute top-6 left-6 bg-[color:var(--bg)]/95 backdrop-blur rounded-2xl px-5 py-4 shadow-lg">
            <div className="text-xs uppercase tracking-[0.18em] text-muted">
              Sejak 2013
            </div>
            <div className="font-serif-display text-primary text-2xl mt-1">
              5,000+ Jamaah
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">
            Tentang Kami
          </div>
          <h2 className="font-serif-display text-primary text-4xl sm:text-5xl mt-4 leading-tight">
            Sahabat Perjalanan Suci Anda dari Batam menuju Baitullah
          </h2>
          <p className="text-muted mt-6 leading-relaxed">
            Baba Tour Umroh & Haji Khusus adalah Penyelenggara Perjalanan Ibadah Umroh
            (PPIU) berizin resmi Kementerian Agama RI. Kami hadir untuk mendampingi
            setiap calon tamu Allah menunaikan ibadah dengan aman, nyaman, dan sesuai
            tuntunan syariah.
          </p>
          <p className="text-muted mt-4 leading-relaxed">
            Dengan tim pembimbing ulama berpengalaman, jaringan hotel premium dekat
            haram, dan komitmen pada pelayanan berkualitas — kami telah memberangkatkan
            ribuan jamaah dari Batam dan sekitarnya menuju Tanah Suci.
          </p>

          <div className="mt-10 grid sm:grid-cols-3 gap-5">
            {[
              { icon: BadgeCheck, t: "Berizin Resmi", d: "PPIU & PIHK Kemenag RI" },
              { icon: ShieldCheck, t: "Akreditasi A", d: "Standar internasional" },
              { icon: Heart, t: "Pelayanan Tulus", d: "Layanan personal & ramah" },
            ].map((item) => (
              <div
                key={item.t}
                data-testid={`about-trust-${item.t.toLowerCase().replace(/\s+/g, "-")}`}
                className="bg-surface border border-soft rounded-2xl p-5"
              >
                <item.icon className="w-6 h-6 text-accent" />
                <div className="font-serif-display text-primary text-lg mt-3">
                  {item.t}
                </div>
                <div className="text-xs text-muted mt-1">{item.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
