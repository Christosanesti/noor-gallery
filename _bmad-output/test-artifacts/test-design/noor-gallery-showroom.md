# Test design — Noor Gallery showroom

**Scope:** system (public showroom + admin CMS)  
**Date:** 2026-08-17  
**Risk threshold:** P1+

## System under test

Farsi RTL chandelier gallery. Public: `/`, `/collections`, `/collections/[slug]`, `/about`, `/contact`. Unique 3D hero via `public/chandelier.glb`. Admin CMS behind Clerk (`/admin/*`, `/api/upload`). No prices/payments.

## Risk register

| ID | Area | Prob | Impact | Pri | Notes |
|----|------|------|--------|-----|-------|
| R1 | 3D hero fails (network HDR / GLB / SSR) | M | C | P0 | Unique brand surface |
| R2 | CMS images 404 / Next image optimizer | H | H | P0 | First impression of collections |
| R3 | Admin auth bypass / wrong user | L | C | P0 | Clerk + email allow-list |
| R4 | RTL/mobile nav unusable | M | H | P1 | Sheet, a11y name, tap targets |
| R5 | Gallery lightbox trap / no keyboard | M | M | P1 | RTL chevrons + Escape |
| R6 | Collection form rejects local GLB | M | M | P1 | Zod url() vs `/models/*.glb` |
| R7 | Destructive admin delete | M | H | P1 | Confirm dialog |
| R8 | Clerk redirect after sign-in | M | H | P1 | Must land on `/admin` |

## Coverage strategy

- **Unit:** Zod schemas (`modelGlbUrl` relative + https), `slugifyFa`
- **Component:** SafeImage fallback, lightbox keyboard, collection form slug sync
- **E2E (guest):** home hero canvas present; collections grid; about/contact content; admin redirects to sign-in
- **E2E (admin, later):** upload, publish toggle, settings — blocked on Clerk session
- **Out of scope:** payments, Pact, k6 load

## NFR plan

- RTL `dir=rtl` `lang=fa` on every public page
- 3D must not depend on GitHub/raw.githack at runtime
- Image optimizer failures must degrade to placeholder, not a broken `<img>`
- Admin chrome isolated from public header/footer
