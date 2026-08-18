# NFR evidence audit — Noor Gallery

**Date:** 2026-08-17  
**Mode:** NR (Create)  
**Sources:** live `localhost:3000`, source review, `bun run build`, `bunx tsc --noEmit`

## Performance

| Check | Evidence | Status |
|-------|----------|--------|
| Home 3D | Canvas 536×536 after dropping remote HDR; GLB `/chandelier.glb` 200 | PASS |
| Images | Next optimizer 200 for repaired Unsplash IDs | PASS |
| Build | `next build` compiled in ~4.7s, 13 routes | PASS |
| Remote HDR | `Environment preset="city"` 429 from GitHub — removed | FIXED |

## Security

| Check | Evidence | Status |
|-------|----------|--------|
| Admin routes | `proxy.ts` `auth.protect()` on `/admin` and `/api/upload` | PASS |
| Guest `/admin` | 307 → `/sign-in?redirect_url=.../admin` | PASS |
| Upload API | `assertAdminApi` + `currentUser()` | PASS |
| Clerk | Dev keys warning local-only | CONCERNS |

## Reliability

| Check | Evidence | Status |
|-------|----------|--------|
| 3D error boundary | SceneErrorBoundary + client-only dynamic import | PASS |
| Broken images | SafeImage `onError` placeholder | PASS |
| Seed repair | Dead Unsplash IDs rewritten on seed | PASS |

## Accessibility / i18n

| Check | Evidence | Status |
|-------|----------|--------|
| `html[dir=rtl][lang=fa]` | Confirmed | PASS |
| Mobile menu name | `aria-label="باز کردن منو"` | PASS |
| Lightbox | Escape, backdrop, RTL prev/next labels | PASS |
| Select value | `text-start` instead of `text-left` | PASS |

## Verdict

**CONCERNS** — production NFRs for the showroom hero/images are restored; automated NFR suite (Lighthouse/k6) not present.
