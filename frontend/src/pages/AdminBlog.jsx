import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Edit3, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/blog");
      setPosts(data);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      await api.delete(`/admin/blog/${id}`);
      setPosts((p) => p.filter((x) => x.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const togglePublish = async (post) => {
    try {
      const { data } = await api.patch(`/admin/blog/${post.id}`, {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.cover_image,
        published: !post.published,
      });
      setPosts((p) => p.map((x) => (x.id === data.id ? data : x)));
      toast.success(data.published ? "Published" : "Unpublished");
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto" data-testid="admin-blog-page">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">
            Content
          </div>
          <h1 className="font-serif-display text-primary text-4xl md:text-5xl mt-3">
            Articles
          </h1>
          <p className="text-muted mt-2">
            Bagikan artikel, panduan, dan berita seputar umrah & haji.
          </p>
        </div>
        <Link
          to="/admin/blog/new"
          data-testid="admin-blog-new-btn"
          className="bg-primary text-white hover:bg-primary/90 transition rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> New Article
        </Link>
      </div>

      <div className="mt-10 grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="bg-surface border border-soft rounded-2xl p-12 text-center">
            <div className="font-serif-display text-primary text-2xl">No articles yet</div>
            <p className="text-muted mt-2 mb-6">Create your first article to share with jamaah.</p>
            <Link
              to="/admin/blog/new"
              className="inline-flex bg-primary text-white hover:bg-primary/90 transition rounded-full px-6 py-3 text-sm font-medium items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Article
            </Link>
          </div>
        ) : (
          posts.map((p) => (
            <article
              key={p.id}
              data-testid={`post-${p.id}`}
              className="bg-surface border border-soft rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-5 items-start"
            >
              {p.cover_image && (
                <img
                  src={p.cover_image}
                  alt={p.title}
                  className="w-full md:w-40 h-32 object-cover rounded-xl"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full border ${
                      p.published
                        ? "bg-emerald-100 text-emerald-900 border-emerald-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {p.published ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs text-muted">
                    {new Date(p.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  </span>
                </div>
                <h3 className="font-serif-display text-primary text-2xl mt-2 truncate">{p.title}</h3>
                <p className="text-muted text-sm mt-1.5 line-clamp-2">{p.excerpt}</p>
                <div className="text-xs text-muted mt-2">/blog/{p.slug}</div>
              </div>
              <div className="flex md:flex-col gap-2">
                <button
                  onClick={() => togglePublish(p)}
                  data-testid={`toggle-publish-${p.id}`}
                  className="text-xs text-primary hover:text-accent border border-soft rounded-full px-3 py-2 flex items-center gap-1.5"
                >
                  {p.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {p.published ? "Unpublish" : "Publish"}
                </button>
                <Link
                  to={`/admin/blog/${p.id}/edit`}
                  data-testid={`edit-${p.id}`}
                  className="text-xs text-primary hover:text-accent border border-soft rounded-full px-3 py-2 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      data-testid={`delete-post-${p.id}`}
                      className="text-xs text-red-600 hover:text-red-800 border border-soft rounded-full px-3 py-2 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete article?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{p.title}" will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(p.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
