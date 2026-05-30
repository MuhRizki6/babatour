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
- ✅ Backend pytest suite (all 7 tests pass)
- ✅ End-to-end tested via testing_agent_v3 (100% backend, 95% frontend)

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
