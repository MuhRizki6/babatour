import { MessageCircle } from "lucide-react";
import { BRAND } from "../../data/content";

export const FloatingWhatsApp = () => {
  const msg = encodeURIComponent(
    "Assalamualaikum Baba Tour, saya tertarik untuk konsultasi paket Umroh."
  );
  return (
    <a
      data-testid="floating-whatsapp-btn"
      href={`https://wa.me/${BRAND.phoneRaw}?text=${msg}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-24 md:bottom-6 right-6 z-50 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
      <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-500 text-white grid place-items-center shadow-xl hover:bg-green-600 transition group-hover:scale-105">
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
      </div>
    </a>
  );
};
