import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Input } from "../ui/input";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Mohon masukkan email yang valid.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/newsletter`, { email, name });
      setSubscribed(true);
      toast.success(data.alreadySubscribed ? "Anda sudah berlangganan!" : "Terima kasih, Anda berhasil berlangganan!");
    } catch {
      toast.error("Gagal mendaftar. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter" data-testid="newsletter-section" className="py-20 md:py-28 bg-primary text-white relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(196,154,69,0.18), transparent 70%)" }}
      />
      <div className="relative max-w-5xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6">
          <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4" /> Newsletter
          </div>
          <h2 className="font-serif-display text-3xl md:text-5xl mt-4 leading-tight">
            Jadilah yang pertama tahu paket baru
          </h2>
          <p className="text-white/75 mt-5 leading-relaxed">
            Dapatkan info kuota terbatas, paket promo, dan jadwal keberangkatan
            terbaru — langsung di email Anda, tanpa spam.
          </p>
        </div>

        <div className="lg:col-span-6">
          {subscribed ? (
            <div className="bg-white/5 border border-accent/40 rounded-2xl p-8 text-center" data-testid="newsletter-success">
              <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
              <div className="font-serif-display text-2xl mt-4">Terima kasih!</div>
              <p className="text-white/75 mt-2 text-sm">
                Anda akan menerima kabar paket terbaru dari Baba Tour.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} data-testid="newsletter-form" className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-6 md:p-7">
              <div className="grid gap-3">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama (opsional)"
                  data-testid="newsletter-name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl h-12"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@anda.com"
                    data-testid="newsletter-email"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl h-12 flex-1"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="newsletter-submit"
                    className="bg-accent text-white hover:bg-accent/90 transition rounded-xl px-6 h-12 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 whitespace-nowrap"
                  >
                    {loading ? "Mendaftar..." : (<>Berlangganan <ArrowRight className="w-4 h-4" /></>)}
                  </button>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  Dengan mendaftar, Anda setuju menerima email dari Baba Tour. Bisa berhenti kapan saja.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
