import { useEffect, useState } from "react";
import { Mail, Phone, MessageSquare, Trash2, RefreshCw, Users, Inbox, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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

const STATUS_STYLES = {
  new: "bg-amber-100 text-amber-900 border-amber-200",
  contacted: "bg-blue-100 text-blue-900 border-blue-200",
  converted: "bg-emerald-100 text-emerald-900 border-emerald-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function AdminInquiries() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: list }, { data: s }] = await Promise.all([
        api.get("/admin/inquiries"),
        api.get("/admin/stats"),
      ]);
      setItems(list);
      setStats(s);
    } catch (e) {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/admin/inquiries/${id}`, { status });
      setItems((prev) => prev.map((it) => (it.id === id ? data : it)));
      toast.success("Status updated");
      load();
    } catch {
      toast.error("Failed to update");
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/admin/inquiries/${id}`);
      setItems((prev) => prev.filter((it) => it.id !== id));
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = filter === "all" ? items : items.filter((it) => it.status === filter);

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto" data-testid="admin-inquiries-page">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">
            Dashboard
          </div>
          <h1 className="font-serif-display text-primary text-4xl md:text-5xl mt-3">
            Inquiries
          </h1>
          <p className="text-muted mt-2">
            Kelola permintaan informasi dari calon jamaah.
          </p>
        </div>
        <button
          onClick={load}
          data-testid="admin-refresh-btn"
          className="border border-soft text-primary hover:bg-surface transition rounded-full px-5 py-2.5 text-sm flex items-center gap-2 self-start"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Inbox, label: "Total Inquiries", value: stats?.total_inquiries ?? "—" },
          { icon: Users, label: "New", value: stats?.new_inquiries ?? "—" },
          { icon: CheckCircle2, label: "Converted", value: stats?.converted ?? "—" },
          { icon: FileText, label: "Blog Posts", value: stats?.blog_posts ?? "—" },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-soft rounded-2xl p-5">
            <s.icon className="w-5 h-5 text-accent" />
            <div className="font-serif-display text-primary text-3xl mt-3">{s.value}</div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="mt-10 flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.18em] text-muted">Filter:</span>
        {["all", "new", "contacted", "converted", "closed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            data-testid={`filter-${f}`}
            className={`text-xs uppercase tracking-[0.16em] px-3 py-1.5 rounded-full border transition ${
              filter === f
                ? "bg-primary text-white border-primary"
                : "bg-transparent text-muted border-soft hover:border-primary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface border border-soft rounded-2xl p-12 text-center text-muted">
            No inquiries yet.
          </div>
        ) : (
          filtered.map((it) => (
            <article
              key={it.id}
              data-testid={`inquiry-${it.id}`}
              className="bg-surface border border-soft rounded-2xl p-6 md:p-7"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="font-serif-display text-primary text-xl">{it.name}</div>
                    <span
                      className={`text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full border ${
                        STATUS_STYLES[it.status] || STATUS_STYLES.new
                      }`}
                    >
                      {it.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                    <a href={`mailto:${it.email}`} className="flex items-center gap-1.5 hover:text-accent">
                      <Mail className="w-3.5 h-3.5" /> {it.email}
                    </a>
                    <a href={`tel:${it.phone}`} className="flex items-center gap-1.5 hover:text-accent">
                      <Phone className="w-3.5 h-3.5" /> {it.phone}
                    </a>
                    {it.package_interest && (
                      <span className="text-accent font-medium">📋 {it.package_interest}</span>
                    )}
                  </div>
                  {it.message && (
                    <div className="mt-4 flex gap-2 text-sm text-main bg-[color:var(--bg)] rounded-xl p-4 border border-soft">
                      <MessageSquare className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>{it.message}</span>
                    </div>
                  )}
                  <div className="mt-3 text-xs text-muted">
                    {new Date(it.created_at).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>

                <div className="flex md:flex-col items-center gap-2 md:min-w-[180px]">
                  <Select value={it.status} onValueChange={(v) => updateStatus(it.id, v)}>
                    <SelectTrigger className="bg-[color:var(--bg)] border-soft rounded-full h-9 text-xs uppercase tracking-[0.14em]" data-testid={`status-select-${it.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        data-testid={`delete-btn-${it.id}`}
                        className="text-xs text-muted hover:text-red-600 flex items-center gap-1.5 px-3 py-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete inquiry?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove the inquiry from {it.name}. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(it.id)} data-testid={`confirm-delete-${it.id}`}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
