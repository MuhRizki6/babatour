"""HTML→PDF rendering for package itinerary using WeasyPrint."""
from typing import Dict, Any
import html as _html


def _esc(s: Any) -> str:
    return _html.escape(str(s or ""), quote=True)


def _stars(n: int) -> str:
    return "★" * int(n or 0)


def _info_section_html(pkg: Dict[str, Any]) -> str:
    """Build the first page: summary + flights + hotels + includes/excludes."""
    rows = [
        ("Tipe Paket", pkg.get("tipePaket")),
        ("Durasi", pkg.get("durasi")),
        ("Maskapai", pkg.get("airline")),
        ("Keberangkatan", f"{pkg.get('departureDate','')} dari {pkg.get('departureCity','')}"),
        ("Kepulangan", pkg.get("returnDate")),
        ("Pembimbing", pkg.get("pembimbing")),
        ("Tersedia", f"{pkg.get('availableSeats','')} Pax"),
        ("Harga", f"<strong>Mulai dari {_esc(pkg.get('priceFrom',''))}</strong> per pax jamaah"),
    ]
    summary_rows = "".join(
        f"<tr><th>{_esc(k)}</th><td>{v if 'strong' in str(v) else _esc(v)}</td></tr>"
        for k, v in rows
    )

    flight_rows = "".join(
        f"""<tr>
              <td class='b'>{_esc('Berangkat' if f.get('type')=='Departure' else ('Pulang' if f.get('type')=='Arrival' else 'Transit'))}</td>
              <td>{_esc(f.get('airline',''))}</td>
              <td><strong>{_esc(f.get('from',{}).get('code',''))}</strong> — {_esc(f.get('from',{}).get('name',''))}<br><span class='meta'>{_esc(f.get('from',{}).get('city',''))} · {_esc(f.get('departTime',''))}</span></td>
              <td><strong>{_esc(f.get('to',{}).get('code',''))}</strong> — {_esc(f.get('to',{}).get('name',''))}<br><span class='meta'>{_esc(f.get('to',{}).get('city',''))} · {_esc(f.get('arriveTime',''))}</span></td>
            </tr>"""
        for f in pkg.get("flights", [])
    )

    hotel_rows = "".join(
        f"""<tr>
              <td class='b'>{_esc(h.get('name',''))}</td>
              <td>{_esc(h.get('location',''))}</td>
              <td>{_stars(h.get('rating',4))}</td>
              <td>{_esc(h.get('checkIn',''))}</td>
              <td>{_esc(h.get('checkOut',''))}</td>
            </tr>"""
        for h in pkg.get("hotels", [])
    )

    inc = "".join(f"<li>{_esc(i)}</li>" for i in pkg.get("includes", []))
    exc = "".join(f"<li>{_esc(i)}</li>" for i in pkg.get("excludes", []))

    return f"""
    <section class="page">
      <div class="brandBar">
        <div class="brandLeft">
          <div class="logo">B</div>
          <div>
            <div class="brandName">{_esc(pkg.get('_brand_name',''))}</div>
            <div class="meta">{_esc(pkg.get('_brand_address',''))} · {_esc(pkg.get('_brand_phone',''))}</div>
          </div>
        </div>
        <div class="brandRight">
          <div class="eyebrow">Tour Package</div>
          <div class="meta">Doc: {_esc(pkg.get('id','').upper())}</div>
        </div>
      </div>

      <h1 class="docTitle">{_esc(pkg.get('fullTitle',''))}</h1>
      <div class="meta tagline">Group {_esc(pkg.get('departureDate',''))} — Program {_esc(pkg.get('durasi',''))}</div>

      <h2 class="section">Ringkasan Paket</h2>
      <table class="t">
        <tbody>{summary_rows}</tbody>
      </table>

      <h2 class="section">Penerbangan</h2>
      <table class="t">
        <thead><tr><th>Jenis</th><th>Maskapai</th><th>Dari</th><th>Tujuan</th></tr></thead>
        <tbody>{flight_rows}</tbody>
      </table>

      <h2 class="section">Penginapan</h2>
      <table class="t">
        <thead><tr><th>Hotel</th><th>Lokasi</th><th>Rating</th><th>Check-in</th><th>Check-out</th></tr></thead>
        <tbody>{hotel_rows}</tbody>
      </table>

      <h2 class="section gold">Harga Termasuk</h2>
      <ul class="list">{inc}</ul>

      <h2 class="section gold">Harga Tidak Termasuk</h2>
      <ul class="list">{exc}</ul>
    </section>
    """


def _itinerary_section_html(pkg: Dict[str, Any]) -> str:
    rows = ""
    for d in pkg.get("itinerary", []):
        acts = "".join(f"<li>{_esc(a)}</li>" for a in d.get("activities", []))
        day_label = f"Hari Ke {_esc(d.get('day',''))}"
        date_label = f"{_esc(d.get('dayName','')) + ', ' if d.get('dayName','—') != '—' else ''}{_esc(d.get('date',''))}"
        rows += f"""
          <tr>
            <td class='dayHead'>
              <div class='dayNum'>{day_label}</div>
              <div class='meta'>{date_label}</div>
            </td>
            <td>
              <div class='dayTitle'>{_esc(d.get('title',''))}</div>
              <div class='meals'>{_esc(d.get('meals',''))}</div>
              <ul class='list'>{acts}</ul>
            </td>
          </tr>
        """

    return f"""
    <section class="page">
      <div class="brandBar">
        <div class="brandLeft">
          <div class="logo">B</div>
          <div>
            <div class="brandName">Itinerary — {_esc(pkg.get('fullTitle',''))}</div>
            <div class="meta">Group {_esc(pkg.get('departureDate',''))} — Program {_esc(pkg.get('durasi',''))}</div>
          </div>
        </div>
      </div>
      <h2 class="section">Kegiatan Harian</h2>
      <table class="t">
        <thead><tr><th style='width:22%'>Hari / Tanggal</th><th>Kegiatan</th></tr></thead>
        <tbody>{rows}</tbody>
      </table>
    </section>
    """


def _terms_section_html(pkg: Dict[str, Any]) -> str:
    terms = "".join(f"<li>{_esc(t)}</li>" for t in pkg.get("terms", []))
    highs = "".join(f"<li>{_esc(h)}</li>" for h in pkg.get("highlights", []))
    contact_rows = [
        ("Nama", pkg.get("_brand_name", "")),
        ("Alamat", pkg.get("_brand_address", "")),
        ("Telepon / WA", pkg.get("_brand_phone", "")),
        ("Email", pkg.get("_brand_email", "")),
    ]
    contact_html = "".join(
        f"<tr><th>{_esc(k)}</th><td>{_esc(v)}</td></tr>" for k, v in contact_rows
    )
    return f"""
    <section class="page">
      <div class="brandBar">
        <div class="brandLeft">
          <div class="logo">B</div>
          <div>
            <div class="brandName">Syarat & Ketentuan — {_esc(pkg.get('fullTitle',''))}</div>
            <div class="meta">{_esc(pkg.get('_brand_name',''))}</div>
          </div>
        </div>
      </div>
      <h2 class="section">Syarat dan Ketentuan</h2>
      <ol class="list ol">{terms}</ol>

      <h2 class="section gold">Keunggulan Paket</h2>
      <ul class="list">{highs}</ul>

      <h2 class="section">Kontak Kami</h2>
      <table class="t"><tbody>{contact_html}</tbody></table>

      <div class="endQuote">
        <div class="endTitle">Bismillah, semoga menjadi Umroh yang mabrur. Aamiin.</div>
        <div class="meta">Dokumen ini dihasilkan otomatis dari website {_esc(pkg.get('_brand_name',''))}.</div>
      </div>
    </section>
    """


PDF_CSS = """
  @page { size: A4; margin: 14mm 14mm 18mm 14mm; }
  body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1A1C19; font-size: 11px; line-height: 1.5; }
  .page { page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .brandBar { display: flex; align-items: center; justify-content: space-between;
              padding-bottom: 10px; border-bottom: 2px solid #0A3B24; margin-bottom: 14px; }
  .brandLeft { display: flex; align-items: center; gap: 10px; }
  .brandRight { text-align: right; }
  .logo { width: 32px; height: 32px; background: #0A3B24; color: #C49A45;
          border-radius: 6px; display: inline-block; font-family: 'Georgia', serif;
          font-weight: 700; font-size: 22px; text-align: center; line-height: 32px; }
  .brandName { font-family: 'Georgia', serif; font-size: 14px; color: #0A3B24; font-weight: 700; }
  .meta { color: #555; font-size: 10px; }
  .eyebrow { color: #C49A45; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; font-size: 9px; }
  h1.docTitle { font-family: 'Georgia', serif; font-size: 22px; color: #0A3B24; margin: 0; line-height: 1.15; }
  .tagline { margin-top: 4px; }
  h2.section { font-family: 'Georgia', serif; font-size: 13px; color: #fff;
               background: #0A3B24; padding: 7px 12px; margin: 18px 0 4px;
               border-radius: 5px; letter-spacing: .02em; font-weight: 700; }
  h2.section.gold { background: #C49A45; }
  table.t { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 4px; }
  table.t th, table.t td { border: 1px solid #d6d2c5; padding: 6px 9px; vertical-align: top; text-align: left; }
  table.t thead th { background: #F4F1EA; color: #0A3B24; font-weight: 700;
                     font-size: 9.5px; text-transform: uppercase; letter-spacing: .08em; }
  .b { font-weight: 700; color: #0A3B24; }
  .dayHead { background: #FBF8F1; }
  .dayNum { font-weight: 700; color: #0A3B24; font-size: 11px; }
  .dayTitle { font-family: 'Georgia', serif; font-weight: 700; color: #0A3B24; font-size: 12px; margin-bottom: 3px; }
  .meals { font-size: 10px; color: #5C605A; font-style: italic; margin-bottom: 4px; }
  ul.list, ol.list { margin: 4px 0 0 16px; padding: 0; }
  ul.list li, ol.list li { font-size: 10.5px; margin-bottom: 3px; }
  .endQuote { margin-top: 24px; padding: 14px; background: #F4F1EA; border-radius: 6px; text-align: center; }
  .endTitle { font-family: 'Georgia', serif; font-size: 16px; color: #0A3B24; font-weight: 700; margin-bottom: 4px; }
"""


def render_package_pdf(pkg: Dict[str, Any], brand: Dict[str, Any]) -> bytes:
    from weasyprint import HTML, CSS

    # inject brand context
    pkg = {**pkg,
           "_brand_name": brand.get("fullName"),
           "_brand_address": brand.get("address"),
           "_brand_phone": brand.get("phone"),
           "_brand_email": brand.get("email")}

    body = (
        _info_section_html(pkg) +
        _itinerary_section_html(pkg) +
        _terms_section_html(pkg)
    )
    html_doc = f"<!doctype html><html><head><meta charset='utf-8'><title>Itinerary</title></head><body>{body}</body></html>"
    return HTML(string=html_doc).write_pdf(stylesheets=[CSS(string=PDF_CSS)])
