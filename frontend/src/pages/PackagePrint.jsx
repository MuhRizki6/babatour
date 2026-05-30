import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Printer, Download, ArrowLeft } from "lucide-react";
import { PACKAGES, BRAND } from "../data/content";
import { PACKAGE_DETAILS } from "../data/packageDetails";

export default function PackagePrint() {
  const { id } = useParams();
  const pkg = PACKAGES.find((p) => p.id === id);
  const det = PACKAGE_DETAILS[id];

  useEffect(() => {
    if (det) document.title = `Itinerary_${det.fullTitle.replace(/\s+/g, "_")}`;
    return () => {
      document.title = "Baba Tour Umroh & Haji Khusus";
    };
  }, [det]);

  if (!pkg || !det) return <Navigate to="/" replace />;

  return (
    <div className="print-shell">
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm 14mm; }
          html, body { background: #ffffff !important; }
          .no-print { display: none !important; }
          .print-page { page-break-after: always; }
          .print-page:last-child { page-break-after: auto; }
          a { color: #0A3B24 !important; text-decoration: none !important; }
          .print-shell { background: #ffffff !important; }
        }
        .print-shell {
          background: #f5f4f0;
          min-height: 100vh;
          font-family: 'Outfit', system-ui, sans-serif;
          color: #1A1C19;
          padding: 32px 0;
        }
        .print-page {
          background: #fff;
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto 24px;
          box-shadow: 0 16px 40px rgba(0,0,0,.08);
          padding: 18mm 16mm;
          position: relative;
        }
        @media (max-width: 900px) {
          .print-page { width: 100%; padding: 18px; box-shadow: none; min-height: auto; }
          .print-shell { padding: 0; }
        }
        h1.docTitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          color: #0A3B24;
          margin: 0;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }
        h2.section {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          color: #fff;
          background: #0A3B24;
          padding: 8px 14px;
          margin: 22px 0 0;
          border-radius: 6px;
          letter-spacing: .02em;
        }
        h2.section.gold { background: #C49A45; }
        table.docTable {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-top: 6px;
        }
        table.docTable th, table.docTable td {
          border: 1px solid #d6d2c5;
          padding: 8px 10px;
          vertical-align: top;
          text-align: left;
        }
        table.docTable thead th {
          background: #F4F1EA;
          color: #0A3B24;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }
        table.docTable .dayHead {
          background: #FBF8F1;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          color: #0A3B24;
          font-size: 14px;
        }
        .meta {
          font-size: 11px;
          color: #555;
          margin-top: 4px;
        }
        .brandBar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 2px solid #0A3B24;
          margin-bottom: 14px;
        }
        .logoB {
          width: 36px; height: 36px;
          background: #0A3B24; color: #C49A45;
          border-radius: 8px;
          display: grid; place-items: center;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700; font-size: 22px;
        }
        .footerNote {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #d6d2c5;
          font-size: 10px;
          color: #6b6f68;
          display: flex;
          justify-content: space-between;
        }
        ul.actList { margin: 6px 0 0; padding-left: 18px; }
        ul.actList li { font-size: 11.5px; line-height: 1.55; margin-bottom: 4px; }
        .meals { font-size: 11px; color: #5C605A; font-style: italic; margin-top: 4px; }
        .pageHeader {
          display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-50 bg-primary text-white shadow-md" style={{ marginTop: "-32px", marginBottom: "32px" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <Link
            to={`/packages/${id}`}
            data-testid="print-back-btn"
            className="inline-flex items-center gap-2 text-white/85 hover:text-accent transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke detail paket
          </Link>
          <div className="text-xs text-white/70 hidden md:block">
            Tip: gunakan tombol Print untuk menyimpan sebagai PDF
          </div>
          <button
            onClick={() => window.print()}
            data-testid="print-action-btn"
            className="bg-accent hover:bg-accent/90 transition rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download PDF / Print
          </button>
        </div>
      </div>

      {/* PAGE 1: Cover + Description */}
      <section className="print-page" data-testid="print-cover-page">
        <div className="brandBar">
          <div className="pageHeader">
            <div className="logoB">B</div>
            <div>
              <div className="font-serif-display" style={{ fontSize: 16, color: "#0A3B24", fontWeight: 600, fontFamily: "Cormorant Garamond, serif" }}>
                {BRAND.fullName}
              </div>
              <div className="meta">{BRAND.address} · {BRAND.phone}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="meta" style={{ color: "#C49A45", fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", fontSize: 10 }}>
              Tour Package
            </div>
            <div className="meta">Doc: {id.toUpperCase()}</div>
          </div>
        </div>

        <h1 className="docTitle">{det.fullTitle}</h1>
        <div className="meta" style={{ marginTop: 6 }}>
          Group {formatLong(det.departureDate)} — Program {det.durasi}
        </div>

        <h2 className="section">Ringkasan Paket</h2>
        <table className="docTable" style={{ marginTop: 6 }}>
          <tbody>
            <tr><th style={{ width: "30%" }}>Tipe Paket</th><td>{det.tipePaket}</td></tr>
            <tr><th>Durasi</th><td>{det.durasi}</td></tr>
            <tr><th>Maskapai</th><td>{pkg.airline}</td></tr>
            <tr><th>Keberangkatan</th><td>{formatLong(det.departureDate)} dari {det.departureCity}</td></tr>
            <tr><th>Kepulangan</th><td>{formatLong(det.returnDate)}</td></tr>
            <tr><th>Pembimbing</th><td>{det.pembimbing}</td></tr>
            <tr><th>Tersedia</th><td>{det.availableSeats} Pax</td></tr>
            <tr><th>Harga</th><td><strong>Mulai dari {pkg.priceFrom}</strong> per pax jamaah</td></tr>
          </tbody>
        </table>

        <h2 className="section">Penerbangan</h2>
        <table className="docTable" style={{ marginTop: 6 }}>
          <thead>
            <tr><th>Jenis</th><th>Maskapai</th><th>Dari</th><th>Tujuan</th></tr>
          </thead>
          <tbody>
            {det.flights.map((f, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600, color: "#0A3B24" }}>{f.type === "Departure" ? "Berangkat" : f.type === "Arrival" ? "Pulang" : "Transit"}</td>
                <td>{f.airline}</td>
                <td><strong>{f.from.code}</strong> — {f.from.name}<br /><span className="meta">{f.from.city} · {f.departTime}</span></td>
                <td><strong>{f.to.code}</strong> — {f.to.name}<br /><span className="meta">{f.to.city} · {f.arriveTime}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="section">Penginapan</h2>
        <table className="docTable" style={{ marginTop: 6 }}>
          <thead>
            <tr><th>Hotel</th><th>Lokasi</th><th>Rating</th><th>Check-in</th><th>Check-out</th></tr>
          </thead>
          <tbody>
            {det.hotels.map((h, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{h.name}</td>
                <td>{h.location}</td>
                <td>{"★".repeat(h.rating)}</td>
                <td>{h.checkIn}</td>
                <td>{h.checkOut}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="section gold">Harga Termasuk</h2>
        <ul className="actList" style={{ marginTop: 6 }}>
          {det.includes.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>

        <h2 className="section gold">Harga Tidak Termasuk</h2>
        <ul className="actList" style={{ marginTop: 6 }}>
          {det.excludes.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>

        <div className="footerNote">
          <div>{BRAND.fullName} · {BRAND.email}</div>
          <div>Page 1 — Generated from babatour.com</div>
        </div>
      </section>

      {/* PAGE 2+: Itinerary */}
      <section className="print-page" data-testid="print-itinerary-page">
        <div className="brandBar">
          <div className="pageHeader">
            <div className="logoB">B</div>
            <div>
              <div style={{ fontSize: 16, color: "#0A3B24", fontWeight: 600, fontFamily: "Cormorant Garamond, serif" }}>
                Itinerary — {det.fullTitle}
              </div>
              <div className="meta">Group {formatLong(det.departureDate)} — Program {det.durasi}</div>
            </div>
          </div>
        </div>

        <h2 className="section">Kegiatan Harian</h2>
        <table className="docTable" style={{ marginTop: 6 }}>
          <thead>
            <tr>
              <th style={{ width: "16%" }}>Hari / Tanggal</th>
              <th>Kegiatan</th>
            </tr>
          </thead>
          <tbody>
            {det.itinerary.map((d, i) => (
              <tr key={i}>
                <td>
                  <div style={{ fontWeight: 700, color: "#0A3B24" }}>Hari Ke {d.day}</div>
                  <div className="meta">{d.dayName !== "—" ? `${d.dayName}, ` : ""}{d.date}</div>
                </td>
                <td>
                  <div className="dayHead" style={{ background: "transparent", padding: 0, marginBottom: 4 }}>
                    {d.title}
                  </div>
                  <div className="meals">{d.meals}</div>
                  <ul className="actList">
                    {d.activities.map((a, k) => <li key={k}>{a}</li>)}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="footerNote">
          <div>{BRAND.fullName} · {BRAND.phone}</div>
          <div>Itinerary — Generated from babatour.com</div>
        </div>
      </section>

      {/* PAGE 3: Terms */}
      <section className="print-page" data-testid="print-terms-page">
        <div className="brandBar">
          <div className="pageHeader">
            <div className="logoB">B</div>
            <div>
              <div style={{ fontSize: 16, color: "#0A3B24", fontWeight: 600, fontFamily: "Cormorant Garamond, serif" }}>
                Syarat dan Ketentuan — {det.fullTitle}
              </div>
              <div className="meta">{BRAND.fullName}</div>
            </div>
          </div>
        </div>

        <h2 className="section">Syarat dan Ketentuan</h2>
        <ol className="actList" style={{ marginTop: 6, paddingLeft: 20 }}>
          {det.terms.map((t, i) => <li key={i} style={{ marginBottom: 6 }}>{t}</li>)}
        </ol>

        <h2 className="section gold">Keunggulan Paket</h2>
        <ul className="actList" style={{ marginTop: 6 }}>
          {det.highlights.map((h, i) => <li key={i}>{h}</li>)}
        </ul>

        <h2 className="section">Kontak Kami</h2>
        <table className="docTable" style={{ marginTop: 6 }}>
          <tbody>
            <tr><th style={{ width: "25%" }}>Nama</th><td>{BRAND.fullName}</td></tr>
            <tr><th>Alamat</th><td>{BRAND.address}, {BRAND.city}</td></tr>
            <tr><th>Telepon / WA</th><td>{BRAND.phone}</td></tr>
            <tr><th>Email</th><td>{BRAND.email}</td></tr>
            <tr><th>Facebook</th><td>{BRAND.facebook}</td></tr>
            <tr><th>Instagram</th><td>{BRAND.instagram}</td></tr>
          </tbody>
        </table>

        <div style={{ marginTop: 30, padding: 16, background: "#F4F1EA", borderRadius: 8, textAlign: "center" }}>
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 20, color: "#0A3B24", fontWeight: 600 }}>
            Bismillah, semoga menjadi Umroh yang mabrur. Aamiin.
          </div>
          <div className="meta" style={{ marginTop: 6 }}>Dokumen ini dihasilkan otomatis dari website {BRAND.fullName}.</div>
        </div>

        <div className="footerNote">
          <div>© {new Date().getFullYear()} {BRAND.fullName}</div>
          <div>Page 3 — Terms & Contact</div>
        </div>
      </section>
    </div>
  );
}

function formatLong(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}
