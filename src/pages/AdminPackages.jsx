import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit3, Trash2, ExternalLink, Eye, EyeOff, Printer } from "lucide-react";
import { toast } from "sonner";
import { api, API_BASE } from "../lib/api";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../components/ui/alert-dialog";

export default function AdminPackages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/packages");
      setItems(data);
    } catch { toast.error("Failed to load packages"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const togglePublish = async (p) => {
    try {
      await api.patch(`/admin/packages/${p.id}`, { ...p, published: !p.published });
      toast.success(p.published ? "Unpublished" : "Published");
      load();
    } catch { toast.error("Failed to update"); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/admin/packages/${id}`);
      setItems((arr) => arr.filter((x) => x.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto" data-testid="admin-packages-page">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">Catalog</div>
          <h1 className="font-serif-display text-primary text-4xl md:text-5xl mt-3">Packages</h1>
          <p className="text-muted mt-2">Kelola paket Umroh & Haji yang ditampilkan di website.</p>
        </div>
        <Link to="/admin/packages/new" data-testid="admin-pkg-new-btn" className="bg-primary text-white hover:bg-primary/90 transition rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" /> New Package
        </Link>
      </div>

      <div className="mt-10 grid gap-4">
        {loading ? <div className="text-center py-12 text-muted">Loading...</div>
        : items.length === 0 ? (
          <div className="bg-surface border border-soft rounded-2xl p-12 text-center">
            <div className="font-serif-display text-primary text-2xl">No packages yet</div>
            <p className="text-muted mt-2 mb-6">Create your first package.</p>
            <Link to="/admin/packages/new" className="inline-flex bg-primary text-white hover:bg-primary/90 transition rounded-full px-6 py-3 text-sm font-medium items-center gap-2">
              <Plus className="w-4 h-4" /> Create Package
            </Link>
          </div>
        ) : items.map((p) => (
          <article key={p.id} data-testid={`pkg-row-${p.id}`} className="bg-surface border border-soft rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-5 items-start">
            {p.image && <img src={p.image} alt={p.name} className="w-full md:w-40 h-32 object-cover rounded-xl" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full border ${p.published ? "bg-emerald-100 text-emerald-900 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                  {p.published ? "Published" : "Draft"}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-accent">{p.badge}</span>
                <span className="text-xs text-muted">· {p.duration}</span>
                <span className="text-xs text-muted">· {p.airline}</span>
              </div>
              <h3 className="font-serif-display text-primary text-2xl mt-2 truncate">{p.fullTitle || p.name}</h3>
              <p className="text-muted text-sm mt-1.5 line-clamp-2">{p.overview}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                <span>ID: <code>{p.id}</code></span>
                <span>{p.priceFrom}</span>
                <span>{p.availableSeats} Pax</span>
              </div>
            </div>
            <div className="flex md:flex-col gap-2">
              <Link to={`/packages/${p.id}`} target="_blank" className="text-xs text-primary hover:text-accent border border-soft rounded-full px-3 py-2 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> View
              </Link>
              <a href={`${API_BASE}/packages/${p.id}/pdf`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:text-accent border border-soft rounded-full px-3 py-2 flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5" /> PDF
              </a>
              <button onClick={() => togglePublish(p)} data-testid={`pkg-toggle-${p.id}`} className="text-xs text-primary hover:text-accent border border-soft rounded-full px-3 py-2 flex items-center gap-1.5">
                {p.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {p.published ? "Unpublish" : "Publish"}
              </button>
              <Link to={`/admin/packages/${p.id}/edit`} data-testid={`pkg-edit-${p.id}`} className="text-xs text-primary hover:text-accent border border-soft rounded-full px-3 py-2 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button data-testid={`pkg-del-${p.id}`} className="text-xs text-red-600 hover:text-red-800 border border-soft rounded-full px-3 py-2 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete package?</AlertDialogTitle>
                    <AlertDialogDescription>"{p.name}" will be permanently removed.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => remove(p.id)}>Delete</AlertDialogAction>
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
