# Baba Tour Umroh & Haji Khusus — Landing Page

## Original Problem Statement
Create a landing page similar to hadiyyaumrah.com for "Baba Tour Umroh & Haji Khusus" (Batam-based Umrah/Hajj travel agency).

## Brand
- Name: Baba Tour Umroh & Haji Khusus
- Tagline: Sahabat Perjalanan Umroh Anda
- Phone: +62 823 9215 6538
- Email: babatour.batam@gmail.com
- Address: Ruko Mega Legenda 2 Blok B2 No 26, Batam
- Socials: Facebook + Instagram

## Architecture
- Frontend: React 19 + Tailwind + Shadcn UI components (Accordion, Select, Input, Textarea), Sonner toasts, lucide-react icons, Cormorant Garamond + Outfit fonts
- Backend: FastAPI (Python) with `/api` prefix
- DB: MongoDB (`inquiries` collection)
- Single-page landing scrollable via anchors

## User Persona
Indonesian Muslim families/individuals (mostly mobile) researching umrah/hajj packages from Batam; they value trust, official accreditation, hotel proximity to haram, transparent pricing.

## Core Requirements (Static)
- Sections: Hero, About, Packages, Why Us, Gallery, Testimonials, FAQ, Contact, Footer
- Functional inquiry form persisting to MongoDB
- Floating WhatsApp CTA
- English/Indonesian mixed content
- Premium religious-travel aesthetic (warm sand + deep emerald + gold)

## Implemented (2025-12)
- ✅ Hero w/ Kaaba image, brand H1, stats, floating package card
- ✅ About section w/ trust badges
- ✅ 4 Packages (Umrah Ekonomi/VIP/Plus Turki/Haji Khusus) w/ price, hotel, includes, CTAs
- ✅ Why Us — 8 service cards on dark emerald section
- ✅ Gallery — 6-image grid w/ hover zoom
- ✅ Testimonials — 4 cards w/ avatar + rating
- ✅ FAQ — Shadcn Accordion (6 items)
- ✅ Contact form (POST /api/inquiries → MongoDB) w/ success state
- ✅ Footer (links, contact, FB/IG)
- ✅ Floating WhatsApp pulsing button
- ✅ Mobile responsive with hamburger menu

## Iteration 3 (2025-12) — Hadiyya-style Package Detail + PDF/Print
- ✅ Redesigned `/packages/:id` to match hadiyyaumrah.com style: hero with availability, quick-info bar (tipe/durasi/maskapai/keberangkatan), full description with route bullets, Bonus cards with images, Pembimbing card, Includes/Excludes side-by-side, Highlights pills, numbered Terms, day-by-day itinerary cards with date + meals + activities, Hotel cards (rating + check-in/out + description), Flight cards with airline logos + airport codes + times, Transport logos, sticky pricing CTA with WA/Print/Share buttons
- ✅ New `/print/packages/:id` route (PackagePrint.jsx) — A4-sized print pages with @page rules, summary table, flight table, hotel table, includes/excludes, day-by-day itinerary table, terms, contact info. "Download PDF / Print" button triggers `window.print()` for native browser PDF save.
- ✅ Expanded packageDetails.js: 4 packages, each with 9-26 day itineraries, multiple hotels, multi-leg flights, bonuses with images
- ✅ Tested: 100% (60/60 frontend assertions)

## Iteration 2 (2025-12) — Admin, Blog, Package Details
- ✅ JWT-based admin auth (`/api/auth/login`, `/api/auth/me`) with bcrypt + 7-day token, seeded admin from env (idempotent)
- ✅ Admin dashboard at `/admin` — stats cards + inquiries CRUD (status: new/contacted/converted/closed) + delete with AlertDialog
- ✅ Admin blog CRUD at `/admin/blog` + `/admin/blog/new` + `/admin/blog/:id/edit` (title, slug, excerpt, content markdown, cover image, publish toggle)
- ✅ Package detail pages `/packages/:id` with day-by-day itinerary, highlights, includes/excludes, sticky CTA card (4 packages each with custom itinerary)
- ✅ Public blog at `/blog` and `/blog/:slug` with markdown rendering
- ✅ Homepage BlogTeaser section (3 latest posts)
- ✅ SEO meta tags (OG, Twitter card), Schema.org TravelAgency JSON-LD, inline SVG favicon
- ✅ ProtectedRoute redirects unauthenticated /admin → /admin/login
- ✅ Cross-page navigation with Header handling /# anchor scrolls
- ✅ End-to-end tested: 100% backend (22/22), 100% frontend admin + public flows

## Endpoints
- GET /api/ — health
- POST /api/inquiries — save inquiry (name, email, phone, package_interest, message)
- GET /api/inquiries — list (sorted desc)

## Backlog / Next Tasks
P1:
- Admin dashboard route `/admin/inquiries` w/ basic auth to view leads
- Detail page per package (`/packages/:id`) with full itinerary, day-by-day
- WhatsApp deep-link prefilled with package selection
P2:
- Multi-language toggle (EN/ID)
- Blog/articles section
- Newsletter signup integration
- Schema.org TravelAgency markup for SEO
- Open Graph / favicon for brand
