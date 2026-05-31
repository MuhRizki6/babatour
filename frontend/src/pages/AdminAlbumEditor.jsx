import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "../lib/api";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { UploadButton } from "../components/UploadButton";

const EMPTY = {
  title: "", slug: "", description: "", cover_image: "",
  images: [], event_date: "", published: true, order: 99,
};

export default function AdminAlbumEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const nav = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [newImg, setNewImg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/admin/albums/${id}`)
      .then((r) => setForm({ ...EMPTY, ...r.data }))
      .catch(() => { toast.error("Album not found"); nav("/admin/gallery"); })
      .finally(() => setLoadingItem(false));
  }, [id, isEdit, nav]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const addImage = () => {
    const url = newImg.trim();
    if (!url) return;
    setForm((f) => ({ ...f, images: [...(f.images || []), url], cover_image: f.cover_image || url }));
    setNewImg("");
  };

  const removeImage = (i) => {
    setForm((f) => {
      const next = (f.images || []).filter((_, k) => k !== i);
      const cover = f.cover_image === (f.images || [])[i] ? (next[0] || "") : f.cover_image;
      return { ...f, images: next, cover_image: cover };
    });
  };

  const setCover = (src) => setForm((f) => ({ ...f, cover_image: src }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if ((form.images || []).length === 0) { toast.error("Add at least one image"); return; }
    setLoading(true);
    try {
      const payload = { ...form, order: Number(form.order) || 99 };
      if (isEdit) {
        await api.patch(`/admin/albums/${id}`, payload);
        toast.success("Album updated");
      } else {
        await api.post("/admin/albums", payload);
        toast.success("Album created");
      }
      nav("/admin/gallery");
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (loadingItem) return <div className="p-12 text-center text-muted">Loading...</div>;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto" data-testid="admin-album-editor">
      <Link to="/admin/gallery" className="text-sm text-muted hover:text-accent inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to gallery
      </Link>
      <h1 className="font-serif-display text-primary text-4xl mt-4">{isEdit ? "Edit Album" : "New Album"}</h1>

      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <div>
          <Label className="text-xs uppercase tracking-[0.18em] text-muted">Title *</Label>
          <Input data-testid="album-title" value={form.title} onChange={set("title")} placeholder="Umroh VIP Maret 2026" className="mt-2 bg-surface border-soft rounded-xl h-12 font-serif-display text-lg" />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label className="text-xs uppercase tracking-[0.18em] text-muted">Slug (URL)</Label>
            <Input value={form.slug} onChange={set("slug")} placeholder="auto from title" className="mt-2 bg-surface border-soft rounded-xl h-12" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.18em] text-muted">Event Date</Label>
            <Input value={form.event_date} onChange={set("event_date")} placeholder="Maret 2026" className="mt-2 bg-surface border-soft rounded-xl h-12" />
          </div>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-[0.18em] text-muted">Description</Label>
          <Textarea data-testid="album-desc" rows={3} value={form.description} onChange={set("description")} className="mt-2 bg-surface border-soft rounded-xl" />
        </div>

        <div>
          <Label className="text-xs uppercase tracking-[0.18em] text-muted">Album Images</Label>
          <div className="mt-3 flex gap-2 flex-wrap">
            <Input
              value={newImg}
              onChange={(e) => setNewImg(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
              placeholder="https://image-url.jpg"
              data-testid="album-add-image-input"
              className="bg-surface border-soft rounded-xl h-12 flex-1 min-w-[250px]"
            />
            <button type="button" onClick={addImage} data-testid="album-add-image-btn" className="bg-primary text-white hover:bg-primary/90 transition rounded-xl px-5 h-12 text-sm font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add URL
            </button>
            <UploadButton
              testid="album-upload-btn"
              label="Upload"
              onUploaded={(url) => setForm((f) => ({ ...f, images: [...(f.images || []), url], cover_image: f.cover_image || url }))}
            />
          </div>
          <p className="text-xs text-muted mt-2">Tip: Upload langsung dari komputer (JPG/PNG/WebP, max 10MB) atau paste URL.</p>

          {form.images.length > 0 && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {form.images.map((src, i) => (
                <div key={i} className="relative group" data-testid={`album-image-${i}`}>
                  <img src={src} alt="" className={`w-full aspect-square object-cover rounded-xl border-2 ${form.cover_image === src ? "border-accent" : "border-transparent"}`} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition rounded-xl grid place-items-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setCover(src)} className="bg-accent text-white text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full" title="Set as cover">
                        {form.cover_image === src ? "Cover" : "Set Cover"}
                      </button>
                      <button type="button" onClick={() => removeImage(i)} className="bg-red-600 text-white p-1.5 rounded-full" data-testid={`album-remove-image-${i}`}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {form.cover_image === src && (
                    <div className="absolute top-2 left-2 bg-accent text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">Cover</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-5 items-end">
          <div>
            <Label className="text-xs uppercase tracking-[0.18em] text-muted">Display order</Label>
            <Input type="number" value={form.order} onChange={set("order")} className="mt-2 bg-surface border-soft rounded-xl h-12" />
          </div>
          <div className="flex items-center gap-3 bg-surface rounded-xl p-4 border border-soft">
            <Switch checked={form.published} onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))} data-testid="album-published-switch" />
            <div>
              <div className="text-sm text-main">Publish</div>
              <div className="text-xs text-muted">Show on /gallery</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading} data-testid="album-save-btn" className="bg-primary text-white hover:bg-primary/90 transition rounded-full px-8 py-3 text-sm font-medium flex items-center gap-2 disabled:opacity-60">
            {loading ? "Saving..." : (<>Save Album <Save className="w-4 h-4" /></>)}
          </button>
          <Link to="/admin/gallery" className="text-sm text-muted hover:text-accent">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
