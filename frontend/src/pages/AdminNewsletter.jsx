import { useEffect, useState } from "react";
import { Mail, Trash2, Download, Users } from "lucide-react";
import { toast } from "sonner";
import { api, API_BASE } from "../lib/api";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../components/ui/alert-dialog";

export default function AdminNewsletter() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/admin/newsletter");
      setItems(data);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    try {
      await api.delete(`/admin/newsletter/${id}`);
      setItems((arr) => arr.filter((x) => x.id !== id));
      toast.success("Removed");
    } catch { toast.error("Failed to delete"); }
  };

  const exportCsv = async () => {
    try {
      const token = localStorage.getItem("baba_token");
      const res = await fetch(`${API_BASE}/admin/newsletter/export`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "newsletter_subscribers.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Export failed"); }
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto" data-testid="admin-newsletter-page">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">Audience</div>
          <h1 className="font-serif-display text-primary text-4xl md:text-5xl mt-3">Newsletter</h1>
          <p className="text-muted mt-2">Daftar email subscriber Baba Tour.</p>
        </div>
        <button onClick={exportCsv} data-testid="export-csv-btn" className="border border-soft text-primary hover:bg-surface transition rounded-full px-5 py-2.5 text-sm flex items-center gap-2 self-start">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="mt-8 bg-surface border border-soft rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-accent/15 grid place-items-center text-accent"><Users className="w-5 h-5" /></div>
        <div>
          <div className="font-serif-display text-primary text-3xl">{items.length}</div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted">Total Subscribers</div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {loading ? <div className="text-center py-12 text-muted">Loading...</div>
         : items.length === 0 ? (
          <div className="bg-surface border border-soft rounded-2xl p-12 text-center text-muted">No subscribers yet.</div>
         ) : items.map((s) => (
          <div key={s.id} data-testid={`sub-${s.id}`} className="bg-surface border border-soft rounded-2xl p-4 md:p-5 flex items-center gap-4">
            <Mail className="w-4 h-4 text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-main truncate">{s.email}</div>
              <div className="text-xs text-muted">{s.name || "—"} · {new Date(s.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button data-testid={`sub-del-${s.id}`} className="text-xs text-red-600 hover:text-red-800 border border-soft rounded-full px-3 py-2 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove subscriber?</AlertDialogTitle>
                  <AlertDialogDescription>{s.email} will be removed.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => remove(s.id)}>Remove</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
}
