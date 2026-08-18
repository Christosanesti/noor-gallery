# Traceability — Noor Gallery Murat pass

**Date:** 2026-08-17  
**Phase 1:** map findings to fixes  
**Phase 2 gate:** CONCERNS

| Req / risk | Test / probe | Status | Fix |
|------------|--------------|--------|-----|
| Unique GLB hero visible | Playwright: canvas present, no fallback copy | PASS | Local lights; drop GitHub HDR; `dynamic(..., { ssr: false })` |
| Featured collection images | naturalWidth > 0 for both cards | PASS | Seed URL repair + SafeImage |
| Public pages render RTL | `/` `/collections` `/about` `/contact` | PASS | Existing `lang=fa` `dir=rtl` |
| Collections filter/list | `/collections` 200, category chips | PASS | — |
| Collection detail gallery | `/collections/crystal-chandelier` 0 errors | PASS | Image URLs + lightbox a11y |
| Contact actions | `tel:` and `target=_blank` socials | PASS | contact + footer |
| Admin unauthenticated | redirect to sign-in | PASS | Clerk protect + SignIn `forceRedirectUrl=/admin` |
| Admin chrome | public header hidden on `/admin` | PASS | SiteChrome |
| Zod local GLB path | schema refine `/` or `http(s)` | PASS | `lib/validations` |
| Auth convention | `currentUser()` only in app auth helpers | PASS | `lib/auth/admin.ts` |
| Automated regression suite | Playwright/Vitest in repo | FAIL | Not scaffolded (TF remaining) |

## Gate decision

**CONCERNS** — P0 showroom bugs are green on live localhost and `bun run build` / `tsc` pass. Release of a test-gated pipeline is **not** claimed until TF/TA land a real suite.
