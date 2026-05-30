import { useState } from "react";
import axios from "axios";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { BRAND, PACKAGES } from "../../data/content";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    package_interest: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e?.target?.value ?? e });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Nama, email, dan nomor HP wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/inquiries`, form);
      setSent(true);
      toast.success("Pesan terkirim! Tim kami akan menghubungi Anda segera.");
      setForm({ name: "", email: "", phone: "", package_interest: "", message: "" });
    } catch (err) {
      toast.error("Gagal mengirim. Silakan coba lagi atau hubungi via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="py-24 md:py-32 bg-surface"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-10">
        {/* Left: details */}
        <div className="lg:col-span-5 bg-primary text-white rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -bottom-20 -right-16 w-72 h-72 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(196,154,69,0.25), transparent 70%)",
            }}
          />
          <div className="relative">
            <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">
              Hubungi Kami
            </div>
            <h2 className="font-serif-display text-4xl md:text-5xl mt-4 leading-tight">
              Mari memulai perjalanan suci Anda
            </h2>
            <p className="text-white/75 mt-5 leading-relaxed">
              Tim konsultan kami siap membantu memilih paket terbaik sesuai kebutuhan
              dan anggaran Anda. Konsultasi 100% gratis.
            </p>

            <div className="mt-10 space-y-5">
              <a
                href={`tel:${BRAND.phoneRaw}`}
                data-testid="contact-phone-link"
                className="flex items-start gap-4 group"
              >
                <div className="w-11 h-11 rounded-full bg-accent/20 grid place-items-center text-accent shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">
                    Telepon / WhatsApp
                  </div>
                  <div className="font-serif-display text-xl mt-0.5 group-hover:text-accent transition">
                    {BRAND.phone}
                  </div>
                </div>
              </a>

              <a
                href={`mailto:${BRAND.email}`}
                data-testid="contact-email-link"
                className="flex items-start gap-4 group"
              >
                <div className="w-11 h-11 rounded-full bg-accent/20 grid place-items-center text-accent shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">
                    Email
                  </div>
                  <div className="font-serif-display text-xl mt-0.5 break-all group-hover:text-accent transition">
                    {BRAND.email}
                  </div>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-accent/20 grid place-items-center text-accent shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">
                    Kantor Kami
                  </div>
                  <div className="font-serif-display text-xl mt-0.5">
                    {BRAND.address}
                  </div>
                  <div className="text-sm text-white/70 mt-1">{BRAND.city}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-7 bg-[color:var(--bg)] border border-soft rounded-3xl p-8 md:p-12">
          {sent ? (
            <div
              data-testid="contact-success-state"
              className="h-full min-h-[400px] flex flex-col items-center justify-center text-center"
            >
              <CheckCircle2 className="w-14 h-14 text-accent" />
              <h3 className="font-serif-display text-primary text-3xl mt-5">
                Terima kasih!
              </h3>
              <p className="text-muted mt-3 max-w-md">
                Pesan Anda telah kami terima. Tim konsultan Baba Tour akan menghubungi
                Anda dalam 1x24 jam, insya Allah.
              </p>
              <button
                onClick={() => setSent(false)}
                data-testid="contact-reset-btn"
                className="mt-8 border border-soft text-primary hover:bg-surface transition rounded-full px-6 py-3 text-sm font-medium"
              >
                Kirim Pesan Lain
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5" data-testid="contact-form">
              <div>
                <h3 className="font-serif-display text-primary text-3xl">
                  Kirim Pertanyaan Anda
                </h3>
                <p className="text-muted mt-2 text-sm">
                  Isi formulir di bawah ini, kami akan menghubungi Anda segera.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-xs uppercase tracking-[0.18em] text-muted">
                    Nama Lengkap *
                  </Label>
                  <Input
                    id="name"
                    data-testid="contact-name-input"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Nama Anda"
                    className="mt-2 bg-surface border-soft rounded-xl h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs uppercase tracking-[0.18em] text-muted">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="contact-email-input"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="anda@email.com"
                    className="mt-2 bg-surface border-soft rounded-xl h-12"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-xs uppercase tracking-[0.18em] text-muted">
                    Nomor WhatsApp *
                  </Label>
                  <Input
                    id="phone"
                    data-testid="contact-phone-input"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+62 ..."
                    className="mt-2 bg-surface border-soft rounded-xl h-12"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-[0.18em] text-muted">
                    Paket Diminati
                  </Label>
                  <Select
                    value={form.package_interest}
                    onValueChange={(v) => setForm({ ...form, package_interest: v })}
                  >
                    <SelectTrigger
                      data-testid="contact-package-select"
                      className="mt-2 bg-surface border-soft rounded-xl h-12"
                    >
                      <SelectValue placeholder="Pilih paket" />
                    </SelectTrigger>
                    <SelectContent>
                      {PACKAGES.map((p) => (
                        <SelectItem key={p.id} value={p.name}>
                          {p.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="Custom / Konsultasi">
                        Konsultasi Umum
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message" className="text-xs uppercase tracking-[0.18em] text-muted">
                  Pesan
                </Label>
                <Textarea
                  id="message"
                  data-testid="contact-message-input"
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Ceritakan kebutuhan perjalanan Anda..."
                  rows={5}
                  className="mt-2 bg-surface border-soft rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="contact-submit-btn"
                className="w-full bg-primary text-white hover:bg-primary/90 transition rounded-full px-8 py-4 font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? "Mengirim..." : (<>Kirim Pesan <Send className="w-4 h-4" /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
