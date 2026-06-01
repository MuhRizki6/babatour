import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { api } from "../lib/api";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { FloatingWhatsApp } from "../components/site/FloatingWhatsApp";

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Articles — Baba Tour Umroh & Haji Khusus";
    api
      .get("/blog/public")
      .then((r) => setPosts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => {
      document.title = "Baba Tour Umroh & Haji Khusus | Sahabat Perjalanan Umroh Anda";
    };
  }, []);

  return (
    <div className="bg-[color:var(--bg)] min-h-screen" data-testid="blog-list-page">
      <Header />

      <section className="pt-40 pb-12">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">Articles</div>
          <h1 className="font-serif-display text-primary text-5xl sm:text-6xl mt-4 leading-tight">
            Cerita, panduan, dan kabar terbaru
          </h1>
          <p className="text-muted mt-5 max-w-2xl leading-relaxed">
            Wawasan, tips persiapan, dan kabar perjalanan ibadah jamaah Baba Tour Umroh
            & Haji Khusus.
          </p>
        </div>
      </section>

      <section className="pb-32">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          {loading ? (
            <div className="text-center py-20 text-muted">Memuat artikel...</div>
          ) : posts.length === 0 ? (
            <div className="bg-surface border border-soft rounded-2xl p-16 text-center">
              <div className="font-serif-display text-primary text-3xl">Belum ada artikel</div>
              <p className="text-muted mt-3">
                Artikel akan segera hadir. Sementara itu, ikuti kami di Instagram & Facebook.
              </p>
            </div>
          ) : (
            <div className="grid gap-8">
              {posts.map((p, i) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  data-testid={`blog-card-${p.slug}`}
                  className="group grid md:grid-cols-12 gap-6 bg-surface border border-soft rounded-2xl overflow-hidden lift"
                >
                  {p.cover_image && (
                    <div className="md:col-span-5 h-56 md:h-auto overflow-hidden">
                      <img
                        src={p.cover_image}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className={`p-7 md:p-10 flex flex-col justify-center ${p.cover_image ? "md:col-span-7" : "md:col-span-12"}`}>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(p.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
                    </div>
                    <h2 className="font-serif-display text-primary text-2xl md:text-3xl mt-3 leading-tight group-hover:text-accent transition">
                      {p.title}
                    </h2>
                    {p.excerpt && (
                      <p className="text-muted mt-3 leading-relaxed line-clamp-3">{p.excerpt}</p>
                    )}
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:text-accent transition">
                      Baca selengkapnya <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
