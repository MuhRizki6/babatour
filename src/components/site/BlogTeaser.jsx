import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { api } from "../../lib/api";

export const BlogTeaser = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/blog/public")
      .then((r) => setPosts(r.data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (posts.length === 0) return null;

  return (
    <section
      id="blog"
      data-testid="blog-teaser-section"
      className="py-24 md:py-32 bg-surface"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">
              Artikel Terbaru
            </div>
            <h2 className="font-serif-display text-primary text-4xl sm:text-5xl mt-4 leading-tight">
              Wawasan & cerita perjalanan
            </h2>
          </div>
          <Link
            to="/blog"
            data-testid="blog-teaser-all-link"
            className="inline-flex items-center gap-2 border border-soft text-primary hover:bg-[color:var(--bg)] transition rounded-full px-6 py-3 text-sm self-start"
          >
            Semua artikel <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link
              key={p.id}
              to={`/blog/${p.slug}`}
              data-testid={`teaser-${p.slug}`}
              className="group bg-[color:var(--bg)] border border-soft rounded-2xl overflow-hidden lift"
            >
              {p.cover_image ? (
                <div className="h-48 overflow-hidden">
                  <img
                    src={p.cover_image}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="h-48 bg-primary/5 grid place-items-center text-primary/20 font-serif-display text-6xl">
                  ✦
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(p.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                </div>
                <h3 className="font-serif-display text-primary text-xl mt-3 leading-tight group-hover:text-accent transition line-clamp-2">
                  {p.title}
                </h3>
                {p.excerpt && (
                  <p className="text-muted text-sm mt-2 line-clamp-2">{p.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
