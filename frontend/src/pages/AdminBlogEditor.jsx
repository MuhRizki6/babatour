import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "../lib/api";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { UploadButton } from "../components/UploadButton";

export default function AdminBlogEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    published: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await api.get("/admin/blog");
        const post = data.find((p) => p.id === id);
        if (post) {
          setForm({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || "",
            content: post.content,
            cover_image: post.cover_image || "",
            published: post.published,
          });
        } else {
          toast.error("Post not found");
          nav("/admin/blog");
        }
      } catch {
        toast.error("Failed to load");
      } finally {
        setLoadingPost(false);
      }
    })();
  }, [id, isEdit, nav]);

  const set = (k) => (e) => setForm({ ...form, [k]: e?.target ? e.target.value : e });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content required");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.patch(`/admin/blog/${id}`, form);
        toast.success("Article updated");
      } else {
        await api.post("/admin/blog", form);
        toast.success("Article created");
      }
      nav("/admin/blog");
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (loadingPost) {
    return <div className="p-12 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto" data-testid="admin-blog-editor">
      <Link to="/admin/blog" className="text-sm text-muted hover:text-accent inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to articles
      </Link>

      <h1 className="font-serif-display text-primary text-4xl mt-4">
        {isEdit ? "Edit Article" : "New Article"}
      </h1>

      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <div>
          <Label htmlFor="title" className="text-xs uppercase tracking-[0.18em] text-muted">Title *</Label>
          <Input
            id="title"
            data-testid="editor-title"
            value={form.title}
            onChange={set("title")}
            placeholder="Tips Persiapan Umroh Pertama Kali"
            className="mt-2 bg-surface border-soft rounded-xl h-12 font-serif-display text-lg"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label className="text-xs uppercase tracking-[0.18em] text-muted">Slug (URL)</Label>
            <Input
              data-testid="editor-slug"
              value={form.slug}
              onChange={set("slug")}
              placeholder="auto-generated from title"
              className="mt-2 bg-surface border-soft rounded-xl h-12"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.18em] text-muted">Cover Image URL</Label>
            <div className="flex gap-2 flex-wrap mt-2">
              <Input
                data-testid="editor-cover"
                value={form.cover_image}
                onChange={set("cover_image")}
                placeholder="https://..."
                className="bg-surface border-soft rounded-xl h-12 flex-1 min-w-[200px]"
              />
              <UploadButton testid="blog-cover-upload" label="Upload" onUploaded={(url) => setForm((f) => ({ ...f, cover_image: url }))} />
            </div>
            {form.cover_image && <img src={form.cover_image} alt="" className="mt-3 w-40 h-24 object-cover rounded-lg" />}
          </div>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-[0.18em] text-muted">Excerpt</Label>
          <Textarea
            data-testid="editor-excerpt"
            value={form.excerpt}
            onChange={set("excerpt")}
            placeholder="Short summary shown on blog list..."
            rows={2}
            className="mt-2 bg-surface border-soft rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs uppercase tracking-[0.18em] text-muted">Content (Markdown) *</Label>
          <Textarea
            data-testid="editor-content"
            value={form.content}
            onChange={set("content")}
            placeholder={`# Tips Persiapan Umroh\n\nLorem ipsum...`}
            rows={18}
            className="mt-2 bg-surface border-soft rounded-xl font-mono text-sm"
          />
          <p className="text-xs text-muted mt-2">
            Tip: Use Markdown — # for headings, **bold**, *italic*, - for list items.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface rounded-xl p-4 border border-soft">
          <Switch
            checked={form.published}
            onCheckedChange={(v) => setForm({ ...form, published: v })}
            data-testid="editor-published-switch"
          />
          <div>
            <div className="text-sm text-main">Publish immediately</div>
            <div className="text-xs text-muted">If off, saves as draft.</div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            data-testid="editor-save-btn"
            className="bg-primary text-white hover:bg-primary/90 transition rounded-full px-8 py-3 text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? "Saving..." : (<>Save Article <Save className="w-4 h-4" /></>)}
          </button>
          <Link to="/admin/blog" className="text-sm text-muted hover:text-accent">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
