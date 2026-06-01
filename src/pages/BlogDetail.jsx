import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { api } from "../lib/api";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { FloatingWhatsApp } from "../components/site/FloatingWhatsApp";

// Minimal markdown renderer (headings, bold, italic, lists, paragraphs, links)
function renderMarkdown(md) {
  if (!md) return "";
  const lines = md.split(/\r?\n/);
  const out = [];
  let inList = false;

  const inline = (s) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[(.+?)\]\((https?:[^\s)]+)\)/g, '<a href="$2" class="text-accent underline" target="_blank" rel="noreferrer">$1</a>');

  for (let raw of lines) {
    const line = raw.trim();
    if (/^-\s+/.test(line)) {
      if (!inList) { out.push("<ul class='list-disc pl-6 space-y-2 my-4 text-muted'>"); inList = true; }
      out.push(`<li>${inline(line.replace(/^-\s+/, ""))}</li>`);
      continue;
    } else if (inList) {
      out.push("</ul>");
      inList = false;
    }
    if (/^###\s/.test(line)) out.push(`<h3 class="font-serif-display text-primary text-2xl mt-8 mb-3">${inline(line.slice(4))}</h3>`);
    else if (/^##\s/.test(line)) out.push(`<h2 class="font-serif-display text-primary text-3xl mt-10 mb-4">${inline(line.slice(3))}</h2>`);
    else if (/^#\s/.test(line)) out.push(`<h1 class="font-serif-display text-primary text-4xl mt-10 mb-5">${inline(line.slice(2))}</h1>`);
    else if (line === "") out.push("<div class='h-3'></div>");
    else out.push(`<p class="text-muted leading-[1.85] my-3">${inline(line)}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    api
      .get(`/blog/public/${slug}`)
      .then((r) => {
        setPost(r.data);
        document.title = `${r.data.title} — Baba Tour`;
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    return () => {
      document.title = "Baba Tour Umroh & Haji Khusus | Sahabat Perjalanan Umroh Anda";
    };
  }, [slug]);

  return (
    <div className="bg-[color:var(--bg)] min-h-screen" data-testid="blog-detail-page">
      <Header />
      <article className="pt-36 pb-24">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <Link to="/blog" className="text-sm text-muted hover:text-accent inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> All articles
          </Link>

          {loading ? (
            <div className="text-center py-20 text-muted">Loading...</div>
          ) : notFound || !post ? (
            <div className="bg-surface border border-soft rounded-2xl p-12 mt-8 text-center">
              <div className="font-serif-display text-primary text-3xl">Artikel tidak ditemukan</div>
              <Link to="/blog" className="inline-block mt-5 text-accent hover:underline">← Kembali ke daftar artikel</Link>
            </div>
          ) : (
            <>
              <div className="mt-8 text-xs uppercase tracking-[0.22em] text-accent font-semibold flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
              </div>
              <h1 className="font-serif-display text-primary text-4xl md:text-5xl lg:text-6xl mt-4 leading-[1.1]">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-muted mt-5 text-lg leading-relaxed">{post.excerpt}</p>
              )}
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="mt-10 rounded-2xl w-full max-h-[480px] object-cover"
                />
              )}
              <div
                className="mt-10 prose-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
              />
            </>
          )}
        </div>
      </article>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
