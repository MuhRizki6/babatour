"""PDF rendering with ReportLab (pure Python — no system deps).

Generates a 3-page A4 PDF: cover/summary, day-by-day itinerary, terms+contact.
"""
from io import BytesIO
from typing import Dict, Any, List
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER


PRIMARY = colors.HexColor("#0A3B24")
ACCENT = colors.HexColor("#C49A45")
SURFACE = colors.HexColor("#F4F1EA")
MUTED = colors.HexColor("#5C605A")
BORDER = colors.HexColor("#D6D2C5")
TEXT = colors.HexColor("#1A1C19")


def _styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("title", parent=base["Title"], fontName="Times-Bold",
                                fontSize=20, textColor=PRIMARY, leading=24, spaceAfter=6, alignment=TA_LEFT),
        "subtitle": ParagraphStyle("subtitle", parent=base["BodyText"], fontName="Helvetica",
                                   fontSize=9, textColor=MUTED, spaceAfter=4),
        "section": ParagraphStyle("section", parent=base["Heading2"], fontName="Times-Bold",
                                  fontSize=12, textColor=colors.white, backColor=PRIMARY,
                                  borderPadding=6, leading=18, spaceBefore=14, spaceAfter=4),
        "sectionGold": ParagraphStyle("sectionGold", parent=base["Heading2"], fontName="Times-Bold",
                                      fontSize=12, textColor=colors.white, backColor=ACCENT,
                                      borderPadding=6, leading=18, spaceBefore=14, spaceAfter=4),
        "body": ParagraphStyle("body", parent=base["BodyText"], fontName="Helvetica",
                               fontSize=10, leading=14, textColor=TEXT),
        "small": ParagraphStyle("small", parent=base["BodyText"], fontName="Helvetica",
                                fontSize=8.5, leading=12, textColor=MUTED),
        "dayTitle": ParagraphStyle("dayTitle", parent=base["BodyText"], fontName="Times-Bold",
                                   fontSize=11, textColor=PRIMARY, leading=14),
        "dayNum": ParagraphStyle("dayNum", parent=base["BodyText"], fontName="Helvetica-Bold",
                                 fontSize=10, textColor=PRIMARY, leading=12),
        "meals": ParagraphStyle("meals", parent=base["BodyText"], fontName="Helvetica-Oblique",
                                fontSize=8.5, textColor=MUTED, leading=11),
        "brandName": ParagraphStyle("brandName", parent=base["BodyText"], fontName="Times-Bold",
                                    fontSize=12, textColor=PRIMARY, leading=14),
        "eyebrow": ParagraphStyle("eyebrow", parent=base["BodyText"], fontName="Helvetica-Bold",
                                  fontSize=8, textColor=ACCENT, leading=10, alignment=TA_LEFT),
        "endTitle": ParagraphStyle("endTitle", parent=base["BodyText"], fontName="Times-Bold",
                                   fontSize=14, textColor=PRIMARY, leading=18, alignment=TA_CENTER, spaceAfter=4),
    }


def _stars(n: int) -> str:
    try:
        return "*" * int(n or 0)
    except Exception:
        return ""


def _bullet_para(text: str, style) -> Paragraph:
    return Paragraph(f"&bull; {text}", style)


def _header_bar(brand: Dict[str, Any], subtitle: str, S) -> Table:
    logo_cell = Paragraph('<font color="#C49A45" face="Times-Bold" size="20">B</font>',
                          ParagraphStyle("l", fontName="Times-Bold", fontSize=20,
                                         textColor=ACCENT, alignment=TA_CENTER, leading=22))
    logo_tbl = Table([[logo_cell]], colWidths=[14*mm], rowHeights=[14*mm])
    logo_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PRIMARY),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOX", (0, 0), (-1, -1), 0, colors.transparent),
    ]))

    left = Table([
        [logo_tbl, [
            Paragraph(brand.get("fullName", ""), S["brandName"]),
            Paragraph(f"{brand.get('address','')} · {brand.get('phone','')}", S["small"]),
        ]],
    ], colWidths=[16*mm, None])
    left.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))

    right = [Paragraph(subtitle, S["eyebrow"])]

    bar = Table([[left, right]], colWidths=[None, 50*mm])
    bar.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("LINEBELOW", (0, 0), (-1, -1), 1.2, PRIMARY),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return bar


def _info_table(rows: List[List[str]], col_widths=None) -> Table:
    tbl = Table(rows, colWidths=col_widths)
    tbl.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
        ("BACKGROUND", (0, 0), (0, -1), SURFACE),
        ("TEXTCOLOR", (0, 0), (0, -1), PRIMARY),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return tbl


def _table_with_header(data: List[List[Any]], col_widths=None) -> Table:
    tbl = Table(data, colWidths=col_widths, repeatRows=1)
    tbl.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
        ("BACKGROUND", (0, 0), (-1, 0), SURFACE),
        ("TEXTCOLOR", (0, 0), (-1, 0), PRIMARY),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return tbl


def render_package_pdf(pkg: Dict[str, Any], brand: Dict[str, Any]) -> bytes:
    S = _styles()
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=14*mm, rightMargin=14*mm,
                            topMargin=12*mm, bottomMargin=14*mm,
                            title=pkg.get("fullTitle", "Itinerary"))

    story = []

    # ===== PAGE 1: Cover + Summary =====
    story.append(_header_bar(brand, f"TOUR PACKAGE<br/>Doc: {pkg.get('id','').upper()}", S))
    story.append(Spacer(1, 4))
    story.append(Paragraph(pkg.get("fullTitle", ""), S["title"]))
    story.append(Paragraph(f"Group {pkg.get('departureDate','')} — Program {pkg.get('durasi','')}", S["subtitle"]))

    story.append(Paragraph("Ringkasan Paket", S["section"]))
    summary_rows = [
        ["Tipe Paket", pkg.get("tipePaket", "")],
        ["Durasi", pkg.get("durasi", "")],
        ["Maskapai", pkg.get("airline", "")],
        ["Keberangkatan", f"{pkg.get('departureDate','')} dari {pkg.get('departureCity','')}"],
        ["Kepulangan", pkg.get("returnDate", "")],
        ["Pembimbing", pkg.get("pembimbing", "")],
        ["Tersedia", f"{pkg.get('availableSeats','')} Pax"],
        ["Harga", f"Mulai dari {pkg.get('priceFrom','')} per pax jamaah"],
    ]
    story.append(_info_table(summary_rows, col_widths=[45*mm, None]))

    # Flights
    story.append(Paragraph("Penerbangan", S["section"]))
    fl_rows = [["Jenis", "Maskapai", "Dari", "Tujuan"]]
    for f in pkg.get("flights", []):
        ftype = {"Departure": "Berangkat", "Arrival": "Pulang"}.get(f.get("type"), "Transit")
        frm = f.get("from") or {}
        to = f.get("to") or {}
        fl_rows.append([
            ftype,
            f.get("airline", ""),
            Paragraph(f"<b>{frm.get('code','')}</b> — {frm.get('name','')}<br/><font color='#5C605A' size='7'>{frm.get('city','')} · {f.get('departTime','')}</font>", S["body"]),
            Paragraph(f"<b>{to.get('code','')}</b> — {to.get('name','')}<br/><font color='#5C605A' size='7'>{to.get('city','')} · {f.get('arriveTime','')}</font>", S["body"]),
        ])
    story.append(_table_with_header(fl_rows, col_widths=[22*mm, 32*mm, None, None]))

    # Hotels
    story.append(Paragraph("Penginapan", S["section"]))
    h_rows = [["Hotel", "Lokasi", "Rating", "Check-in", "Check-out"]]
    for h in pkg.get("hotels", []):
        h_rows.append([h.get("name", ""), h.get("location", ""), _stars(h.get("rating", 4)),
                       h.get("checkIn", ""), h.get("checkOut", "")])
    story.append(_table_with_header(h_rows, col_widths=[None, 22*mm, 18*mm, 36*mm, 36*mm]))

    # Includes / Excludes
    story.append(Paragraph("Harga Termasuk", S["sectionGold"]))
    for it in pkg.get("includes", []):
        story.append(_bullet_para(it, S["body"]))
    story.append(Paragraph("Harga Tidak Termasuk", S["sectionGold"]))
    for it in pkg.get("excludes", []):
        story.append(_bullet_para(it, S["body"]))

    story.append(PageBreak())

    # ===== PAGE 2: Itinerary =====
    story.append(_header_bar(brand, f"ITINERARY<br/>{pkg.get('durasi','')}", S))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"Itinerary — {pkg.get('fullTitle','')}", S["title"]))

    story.append(Paragraph("Kegiatan Harian", S["section"]))
    it_rows = [["Hari / Tanggal", "Kegiatan"]]
    for d in pkg.get("itinerary", []):
        day_cell = [
            Paragraph(f"Hari Ke {d.get('day','')}", S["dayNum"]),
            Paragraph(f"{(d.get('dayName','') + ', ') if d.get('dayName','—') != '—' else ''}{d.get('date','')}", S["small"]),
        ]
        acts = [Paragraph(d.get("title", ""), S["dayTitle"]),
                Paragraph(d.get("meals", ""), S["meals"]),
                Spacer(1, 2)]
        for a in d.get("activities", []):
            acts.append(_bullet_para(a, S["body"]))
        it_rows.append([day_cell, acts])
    story.append(_table_with_header(it_rows, col_widths=[34*mm, None]))

    story.append(PageBreak())

    # ===== PAGE 3: Terms + Contact =====
    story.append(_header_bar(brand, f"TERMS &amp; CONTACT", S))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"Syarat dan Ketentuan — {pkg.get('fullTitle','')}", S["title"]))

    story.append(Paragraph("Syarat dan Ketentuan", S["section"]))
    for i, t in enumerate(pkg.get("terms", []), 1):
        story.append(Paragraph(f"{i}. {t}", S["body"]))

    story.append(Paragraph("Keunggulan Paket", S["sectionGold"]))
    for h in pkg.get("highlights", []):
        story.append(_bullet_para(h, S["body"]))

    story.append(Paragraph("Kontak Kami", S["section"]))
    contact_rows = [
        ["Nama", brand.get("fullName", "")],
        ["Alamat", brand.get("address", "")],
        ["Telepon / WA", brand.get("phone", "")],
        ["Email", brand.get("email", "")],
    ]
    story.append(_info_table(contact_rows, col_widths=[40*mm, None]))

    story.append(Spacer(1, 16))
    story.append(Paragraph("Bismillah, semoga menjadi Umroh yang mabrur. Aamiin.", S["endTitle"]))
    story.append(Paragraph(f"Dokumen ini dihasilkan otomatis dari website {brand.get('fullName','')}.",
                           ParagraphStyle("c", parent=S["small"], alignment=TA_CENTER)))

    doc.build(story)
    return buf.getvalue()
