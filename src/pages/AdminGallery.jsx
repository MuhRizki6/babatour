import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit3, Trash2, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../components/ui/alert-dialog";

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { data } = await api.get("/admin/albums"); setItems(data); }
    catch { toast.error("Failed to load albums"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const togglePublish = async (a) => {
    try {
      await api.patch(`/admin/albums/${a.id}`, { ...a, published: !a.published });
      toast.success(a.published ? "Unpublished" : "Published"); load();
    } catch { toast.error("Failed"); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/admin/albums/${id}`);
      setItems((arr) => arr.filter((x) => x.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto" data-testid="admin-gallery-page">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">Media</div>
          <h1 className="font-serif-display text-primary text-4xl md:text-5xl mt-3">Gallery Albums</h1>
          <p className="text-muted mt-2">Kelola album foto perjalanan jamaah.</p>
        </div>
        <Link to="/admin/gallery/new" data-testid="admin-album-new-btn" className="bg-primary text-white hover:bg-primary/90 transition rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" /> New Album
        </Link>
      </div>

      <div className="mt-10 grid gap-4">
        {loading ? <div className="text-center py-12 text-muted">Loading...</div>
         : items.length === 0 ? (
          <div className="bg-surface border border-soft rounded-2xl p-12 text-center">
            <ImageIcon className="w-10 h-10 text-accent mx-auto" />
            <div className="font-serif-display text-primary text-2xl mt-4">No albums yet</div>
            <Link to="/admin/gallery/new" className="inline-flex bg-primary text-white hover:bg-primary/90 transition rounded-full px-6 py-3 text-sm font-medium items-center gap-2 mt-5">
              <Plus className="w-4 h-4" /> Create Album
            </Link>
          </div>
         ) : items.map((a) => (
          <article key={a.id} data-testid={`album-row-${a.id}`} className="bg-surface border border-soft rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-start">
            {a.cover_image && <img src={a.cover_image} alt={a.title} className="w-full md:w-40 h-32 object-cover rounded-xl" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full border ${a.published ? "bg-emerald-100 text-emerald-900 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                  {a.published ? "Published" : "Draft"}
                </span>
                <span className="text-xs text-muted">{a.images?.length || 0} photos</span>
                {a.event_date && <span className="text-xs text-muted">· {a.event_date}</span>}
              </div>
              <h3 className="font-serif-display text-primary text-2xl mt-2">{a.title}</h3>
              <p className="text-muted text-sm mt-1.5 line-clamp-2">{a.description}</p>
              <div className="text-xs text-muted mt-2">/gallery → {a.slug}</div>
            </div>
            <div className="flex md:flex-col gap-2">
              <button onClick={() => togglePublish(a)} className="text-xs text-primary hover:text-accent border border-soft rounded-full px-3 py-2 flex items-center gap-1.5">
                {a.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {a.published ? "Unpublish" : "Publish"}
              </button>
              <Link to={`/admin/gallery/${a.id}/edit`} data-testid={`album-edit-${a.id}`} className="text-xs text-primary hover:text-accent border border-soft rounded-full px-3 py-2 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button data-testid={`album-del-${a.id}`} className="text-xs text-red-600 hover:text-red-800 border border-soft rounded-full px-3 py-2 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete album?</AlertDialogTitle>
                    <AlertDialogDescription>"{a.title}" will be removed.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => remove(a.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
