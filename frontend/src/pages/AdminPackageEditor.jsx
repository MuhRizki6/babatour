import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "../lib/api";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";

const EMPTY = {
  id: "", name: "", fullTitle: "", subtitle: "", headline: "",
  badge: "", badgeLong: "", duration: "", durasi: "",
  tipePaket: "Umroh", departures: "",
  departureDate: "", returnDate: "", departureCity: "",
  availableSeats: 0, priceFrom: "", airline: "",
  hotelMakkah: "", hotelMadinah: "",
  image: "", gallery: [],
  overview: "", routes: [],
  bonuses: [], pembimbing: "",
  highlights: [], includes: [], excludes: [], terms: [],
  hotels: [], flights: [], transports: [], itinerary: [],
  published: true, order: 99,
};

const linesToArr = (s) => (s || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
const arrToLines = (a) => (a || []).join("\n");

export default function AdminPackageEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const nav = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/admin/packages/${id}`)
      .then((r) => setForm({ ...EMPTY, ...r.data }))
      .catch(() => { toast.error("Package not found"); nav("/admin/packages"); })
      .finally(() => setLoadingItem(false));
  }, [id, isEdit, nav]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));
  const setArr = (k) => (e) => setForm((f) => ({ ...f, [k]: linesToArr(e.target.value) }));
  const setItinerary = (idx, key, val) => setForm((f) => {
    const it = [...(f.itinerary || [])];
    it[idx] = { ...it[idx], [key]: val };
    return { ...f, itinerary: it };
  });
  const setItineraryActs = (idx, val) => setItinerary(idx, "activities", linesToArr(val));
  const addItineraryDay = () => setForm((f) => ({ ...f, itinerary: [...(f.itinerary || []), { day: (f.itinerary?.length || 0) + 1, date: "", dayName: "", title: "", meals: "", activities: [] }] }));
  const removeItineraryDay = (i) => setForm((f) => ({ ...f, itinerary: f.itinerary.filter((_, k) => k !== i) }));

  const setHotel = (idx, key, val) => setForm((f) => {
    const arr = [...(f.hotels || [])];
    arr[idx] = { ...arr[idx], [key]: val };
    return { ...f, hotels: arr };
  });
  const addHotel = () => setForm((f) => ({ ...f, hotels: [...(f.hotels || []), { name: "", rating: 4, location: "", description: "", checkIn: "", checkOut: "", image: "" }] }));
  const removeHotel = (i) => setForm((f) => ({ ...f, hotels: f.hotels.filter((_, k) => k !== i) }));

  const setFlight = (idx, key, val) => setForm((f) => {
    const arr = [...(f.flights || [])];
    arr[idx] = { ...arr[idx], [key]: val };
    return { ...f, flights: arr };
  });
  const setFlightSub = (idx, side, key, val) => setForm((f) => {
    const arr = [...(f.flights || [])];
    arr[idx] = { ...arr[idx], [side]: { ...(arr[idx]?.[side] || {}), [key]: val } };
    return { ...f, flights: arr };
  });
  const addFlight = () => setForm((f) => ({ ...f, flights: [...(f.flights || []), { type: "Departure", airline: "", logo: "", from: { code: "", name: "", city: "" }, to: { code: "", name: "", city: "" }, departTime: "", arriveTime: "" }] }));
  const removeFlight = (i) => setForm((f) => ({ ...f, flights: f.flights.filter((_, k) => k !== i) }));

  const setBonus = (idx, key, val) => setForm((f) => {
    const arr = [...(f.bonuses || [])];
    arr[idx] = { ...arr[idx], [key]: val };
    return { ...f, bonuses: arr };
  });
  const addBonus = () => setForm((f) => ({ ...f, bonuses: [...(f.bonuses || []), { title: "", desc: "", image: "" }] }));
  const removeBonus = (i) => setForm((f) => ({ ...f, bonuses: f.bonuses.filter((_, k) => k !== i) }));

  const setTransport = (idx, key, val) => setForm((f) => {
    const arr = [...(f.transports || [])];
    arr[idx] = { ...arr[idx], [key]: val };
    return { ...f, transports: arr };
  });
  const addTransport = () => setForm((f) => ({ ...f, transports: [...(f.transports || []), { name: "", logo: "" }] }));
  const removeTransport = (i) => setForm((f) => ({ ...f, transports: f.transports.filter((_, k) => k !== i) }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.fullTitle?.trim()) {
      toast.error("Name and Full Title are required.");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, availableSeats: Number(form.availableSeats) || 0, order: Number(form.order) || 99 };
      if (isEdit) {
        await api.patch(`/admin/packages/${id}`, payload);
        toast.success("Package updated");
      } else {
        await api.post("/admin/packages", payload);
        toast.success("Package created");
      }
      nav("/admin/packages");
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (loadingItem) return <div className="p-12 text-center text-muted">Loading...</div>;

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto" data-testid="admin-pkg-editor">
      <Link to="/admin/packages" className="text-sm text-muted hover:text-accent inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to packages
      </Link>
      <h1 className="font-serif-display text-primary text-4xl mt-4">{isEdit ? "Edit Package" : "New Package"}</h1>

      <form onSubmit={onSubmit} className="mt-10 space-y-10">
        <Section title="Basic Info">
          <Field label="Package ID (URL slug)"><Input data-testid="pkg-id" value={form.id} onChange={set("id")} disabled={isEdit} placeholder="auto from name" /></Field>
          <Field label="Short Name *"><Input data-testid="pkg-name" value={form.name} onChange={set("name")} placeholder="Umroh VIP" /></Field>
          <Field label="Full Title *"><Input data-testid="pkg-fulltitle" value={form.fullTitle} onChange={set("fullTitle")} placeholder="Umroh VIP Maret 2026 12 Hari [start Batam]" /></Field>
          <Field label="Subtitle"><Input value={form.subtitle} onChange={set("subtitle")} /></Field>
          <Field label="Headline (route line)"><Input value={form.headline} onChange={set("headline")} placeholder="BATAM - SINGAPORE - JEDDAH" /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Badge (short)"><Input value={form.badge} onChange={set("badge")} placeholder="Premium" /></Field>
            <Field label="Badge (long)"><Input value={form.badgeLong} onChange={set("badgeLong")} /></Field>
          </div>
        </Section>

        <Section title="Trip Details">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Tipe Paket"><Input value={form.tipePaket} onChange={set("tipePaket")} /></Field>
            <Field label="Durasi (display)"><Input value={form.durasi} onChange={set("durasi")} placeholder="12 Hari" /></Field>
            <Field label="Duration (legacy short)"><Input value={form.duration} onChange={set("duration")} placeholder="12 Days" /></Field>
            <Field label="Maskapai"><Input value={form.airline} onChange={set("airline")} /></Field>
            <Field label="Departure Date (YYYY-MM-DD)"><Input value={form.departureDate} onChange={set("departureDate")} /></Field>
            <Field label="Return Date"><Input value={form.returnDate} onChange={set("returnDate")} /></Field>
            <Field label="Departure City"><Input value={form.departureCity} onChange={set("departureCity")} /></Field>
            <Field label="Departures (display schedule)"><Input value={form.departures} onChange={set("departures")} placeholder="Bulanan / Mar - May 2026" /></Field>
            <Field label="Available Seats"><Input type="number" value={form.availableSeats} onChange={set("availableSeats")} /></Field>
            <Field label="Price From"><Input value={form.priceFrom} onChange={set("priceFrom")} placeholder="Rp 39,500,000" /></Field>
            <Field label="Hotel Makkah (summary)"><Input value={form.hotelMakkah} onChange={set("hotelMakkah")} /></Field>
            <Field label="Hotel Madinah (summary)"><Input value={form.hotelMadinah} onChange={set("hotelMadinah")} /></Field>
            <Field label="Display order"><Input type="number" value={form.order} onChange={set("order")} /></Field>
            <Field label="Pembimbing"><Input value={form.pembimbing} onChange={set("pembimbing")} /></Field>
          </div>
        </Section>

        <Section title="Images & Gallery">
          <Field label="Hero Image URL"><Input value={form.image} onChange={set("image")} /></Field>
          <Field label="Gallery URLs (one per line)">
            <Textarea rows={5} value={arrToLines(form.gallery)} onChange={(e) => setForm((f) => ({ ...f, gallery: linesToArr(e.target.value) }))} placeholder="https://...jpg" />
          </Field>
        </Section>

        <Section title="Overview & Routes">
          <Field label="Overview"><Textarea rows={4} value={form.overview} onChange={set("overview")} /></Field>
          <Field label="Routes (one per line)"><Textarea rows={5} value={arrToLines(form.routes)} onChange={setArr("routes")} /></Field>
        </Section>

        <Section title="Includes / Excludes / Highlights / Terms (one per line)">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Includes"><Textarea rows={6} value={arrToLines(form.includes)} onChange={setArr("includes")} /></Field>
            <Field label="Excludes"><Textarea rows={6} value={arrToLines(form.excludes)} onChange={setArr("excludes")} /></Field>
            <Field label="Highlights"><Textarea rows={6} value={arrToLines(form.highlights)} onChange={setArr("highlights")} /></Field>
            <Field label="Terms"><Textarea rows={6} value={arrToLines(form.terms)} onChange={setArr("terms")} /></Field>
          </div>
        </Section>

        <Section title="Bonuses" onAdd={addBonus} addLabel="Add bonus">
          {(form.bonuses || []).map((b, i) => (
            <Card key={i} onRemove={() => removeBonus(i)}>
              <Field label="Title"><Input value={b.title || ""} onChange={(e) => setBonus(i, "title", e.target.value)} /></Field>
              <Field label="Description"><Textarea rows={2} value={b.desc || ""} onChange={(e) => setBonus(i, "desc", e.target.value)} /></Field>
              <Field label="Image URL"><Input value={b.image || ""} onChange={(e) => setBonus(i, "image", e.target.value)} /></Field>
            </Card>
          ))}
        </Section>

        <Section title="Hotels" onAdd={addHotel} addLabel="Add hotel">
          {(form.hotels || []).map((h, i) => (
            <Card key={i} onRemove={() => removeHotel(i)}>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Name"><Input value={h.name || ""} onChange={(e) => setHotel(i, "name", e.target.value)} /></Field>
                <Field label="Location"><Input value={h.location || ""} onChange={(e) => setHotel(i, "location", e.target.value)} /></Field>
                <Field label="Rating (1-5)"><Input type="number" value={h.rating || 4} onChange={(e) => setHotel(i, "rating", Number(e.target.value))} /></Field>
                <Field label="Image URL"><Input value={h.image || ""} onChange={(e) => setHotel(i, "image", e.target.value)} /></Field>
                <Field label="Check-in"><Input value={h.checkIn || ""} onChange={(e) => setHotel(i, "checkIn", e.target.value)} /></Field>
                <Field label="Check-out"><Input value={h.checkOut || ""} onChange={(e) => setHotel(i, "checkOut", e.target.value)} /></Field>
              </div>
              <Field label="Description"><Textarea rows={2} value={h.description || ""} onChange={(e) => setHotel(i, "description", e.target.value)} /></Field>
            </Card>
          ))}
        </Section>

        <Section title="Flights" onAdd={addFlight} addLabel="Add flight">
          {(form.flights || []).map((f, i) => (
            <Card key={i} onRemove={() => removeFlight(i)}>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Type"><Input value={f.type || ""} onChange={(e) => setFlight(i, "type", e.target.value)} placeholder="Departure / Arrival / Mid" /></Field>
                <Field label="Airline"><Input value={f.airline || ""} onChange={(e) => setFlight(i, "airline", e.target.value)} /></Field>
                <Field label="Logo URL"><Input value={f.logo || ""} onChange={(e) => setFlight(i, "logo", e.target.value)} /></Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-1">
                <Card titleAttr="From">
                  <Field label="Code"><Input value={f.from?.code || ""} onChange={(e) => setFlightSub(i, "from", "code", e.target.value)} /></Field>
                  <Field label="Airport Name"><Input value={f.from?.name || ""} onChange={(e) => setFlightSub(i, "from", "name", e.target.value)} /></Field>
                  <Field label="City"><Input value={f.from?.city || ""} onChange={(e) => setFlightSub(i, "from", "city", e.target.value)} /></Field>
                  <Field label="Depart Time"><Input value={f.departTime || ""} onChange={(e) => setFlight(i, "departTime", e.target.value)} /></Field>
                </Card>
                <Card titleAttr="To">
                  <Field label="Code"><Input value={f.to?.code || ""} onChange={(e) => setFlightSub(i, "to", "code", e.target.value)} /></Field>
                  <Field label="Airport Name"><Input value={f.to?.name || ""} onChange={(e) => setFlightSub(i, "to", "name", e.target.value)} /></Field>
                  <Field label="City"><Input value={f.to?.city || ""} onChange={(e) => setFlightSub(i, "to", "city", e.target.value)} /></Field>
                  <Field label="Arrive Time"><Input value={f.arriveTime || ""} onChange={(e) => setFlight(i, "arriveTime", e.target.value)} /></Field>
                </Card>
              </div>
            </Card>
          ))}
        </Section>

        <Section title="Transports" onAdd={addTransport} addLabel="Add transport">
          {(form.transports || []).map((t, i) => (
            <Card key={i} onRemove={() => removeTransport(i)}>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Name"><Input value={t.name || ""} onChange={(e) => setTransport(i, "name", e.target.value)} /></Field>
                <Field label="Logo URL"><Input value={t.logo || ""} onChange={(e) => setTransport(i, "logo", e.target.value)} /></Field>
              </div>
            </Card>
          ))}
        </Section>

        <Section title="Itinerary (Day by Day)" onAdd={addItineraryDay} addLabel="Add day">
          {(form.itinerary || []).map((d, i) => (
            <Card key={i} onRemove={() => removeItineraryDay(i)}>
              <div className="grid sm:grid-cols-4 gap-3">
                <Field label="Day"><Input value={d.day || ""} onChange={(e) => setItinerary(i, "day", e.target.value)} placeholder="1 or 1-3" /></Field>
                <Field label="Day Name"><Input value={d.dayName || ""} onChange={(e) => setItinerary(i, "dayName", e.target.value)} placeholder="Senin" /></Field>
                <Field label="Date"><Input value={d.date || ""} onChange={(e) => setItinerary(i, "date", e.target.value)} placeholder="15 Maret 2026" /></Field>
                <Field label="Meals"><Input value={d.meals || ""} onChange={(e) => setItinerary(i, "meals", e.target.value)} /></Field>
              </div>
              <Field label="Title"><Input value={d.title || ""} onChange={(e) => setItinerary(i, "title", e.target.value)} placeholder="BATAM - SINGAPORE" /></Field>
              <Field label="Activities (one per line)"><Textarea rows={4} value={arrToLines(d.activities)} onChange={(e) => setItineraryActs(i, e.target.value)} /></Field>
            </Card>
          ))}
        </Section>

        <Section title="Status">
          <div className="flex items-center gap-3 bg-surface rounded-xl p-4 border border-soft">
            <Switch checked={form.published} onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))} data-testid="pkg-published-switch" />
            <div>
              <div className="text-sm text-main">Publish on website</div>
              <div className="text-xs text-muted">If off, paket disembunyikan dari public.</div>
            </div>
          </div>
        </Section>

        <div className="flex items-center gap-3 sticky bottom-6 bg-[color:var(--bg)]/90 backdrop-blur p-4 border border-soft rounded-2xl shadow-xl z-10">
          <button type="submit" disabled={loading} data-testid="pkg-save-btn" className="bg-primary text-white hover:bg-primary/90 transition rounded-full px-8 py-3 text-sm font-medium flex items-center gap-2 disabled:opacity-60">
            {loading ? "Saving..." : (<>Save Package <Save className="w-4 h-4" /></>)}
          </button>
          <Link to="/admin/packages" className="text-sm text-muted hover:text-accent">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children, onAdd, addLabel }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif-display text-primary text-2xl">{title}</h2>
        {onAdd && (
          <button type="button" onClick={onAdd} className="text-sm border border-soft text-primary hover:bg-surface transition rounded-full px-4 py-2 flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> {addLabel || "Add"}
          </button>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-[0.18em] text-muted">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
function Card({ children, onRemove, titleAttr }) {
  return (
    <div className="relative bg-surface border border-soft rounded-2xl p-4 space-y-3">
      {titleAttr && <div className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">{titleAttr}</div>}
      {onRemove && (
        <button type="button" onClick={onRemove} className="absolute top-3 right-3 text-muted hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  );
}
