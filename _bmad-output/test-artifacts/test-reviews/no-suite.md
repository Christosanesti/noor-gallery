# Test review — Noor Gallery

**Date:** 2026-08-17  
**Mode:** RV

No unit, component, or Playwright specs existed in the repository at audit time.

**Score:** N/A (nothing to review)

**DoD gaps:**
- No `playwright.config.*`
- No `*.spec.ts` / `*.test.ts`
- Automation this pass was live Playwright MCP against `localhost:3000`, which is evidence, not a repeatable suite

**Recommendation:** next Murat session run `TF` then `TA` to scaffold `@playwright/test` guest smokes for `/`, `/collections`, `/contact`, and admin redirect.
