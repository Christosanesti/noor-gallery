# TEA — Murat mode run 2026-08-17

**Project:** noor-gallery (Next.js 16 chandelier showroom, Farsi RTL, Bun)  
**Agent:** Murat (TEA v1.23.1) / BMad Core v6.11.0  
**Owner:** Nawid  
**Verdict:** CONCERNS (P0 UI bugs fixed; no committed automated suite yet)

## Installation

```bash
bunx bmad-method install \
  --directory /home/nawid/Projects/noor-gallery \
  --modules tea \
  --tools cursor \
  --user-name "Nawid" \
  --communication-language English \
  --document-output-language English \
  --output-folder _bmad-output \
  --set tea.test_stack_type=fullstack \
  --set tea.tea_use_playwright_utils=true \
  --set tea.tea_browser_automation=auto \
  --set tea.test_framework=auto \
  --yes
```

**Created:**
- `_bmad/` — BMad Core + TEA module configs/scripts
- `.agents/skills/bmad-tea` and 9 TEA workflow skills (+ core skills)
- `_bmad-output/test-artifacts/`

**Invoke next time:** in Cursor chat say `talk to Murat` / `$bmad-tea`, then a menu code (`TD`, `TA`, `NR`, …) or a workflow skill name such as `$bmad-testarch-test-design`.

## Modes exercised

| Code | Workflow | What ran | Result |
|------|----------|----------|--------|
| TMT | Teach Me Testing | Applied TEA risk/pyramid principles to this showroom; did **not** run the 7-session academy | Skipped as curriculum |
| TD | Test Design | Risk-based plan for public pages, 3D hero, admin CMS | Artifact written |
| TF | Framework | Assessed stack: no Playwright project yet; live audit used Playwright MCP instead of scaffolding `@playwright/test` | Recommend later |
| CI | CI/CD | No GitHub Actions/GitLab CI in repo | Recommend later |
| AT | ATDD | Red-phase acceptance criteria for P0 bugs, then implemented to green | Bugs fixed |
| TA | Automate | Live browser audit: `/`, `/collections`, `/about`, `/contact`, `/collections/crystal-chandelier`, `/admin`→sign-in, mobile 390px | 0 console errors after fixes |
| GATE | Release gate | Routed NR + TR; no merge of workflows | CONCERNS |
| RV | Test review | No existing unit/e2e suite to score | Gap documented |
| NR | NFR audit | RTL, 3D reliability, Clerk, images, a11y | Artifact written |
| TR | Trace | Requirements → findings → fixes | Artifact written |

## P0/P1 findings (fixed)

1. Featured/collection Unsplash URLs 404 through `/_next/image`
2. Hero `Environment preset="city"` fetched GitHub HDR and 429’d, killing the unique GLB
3. 3D Canvas SSR-hydrated without a client-only boundary
4. Lightbox had no Escape/backdrop/keyboard nav
5. Admin used `auth()`; project convention is `currentUser()`
6. `modelGlbUrl` Zod `.url()` rejected local `/chandelier.glb` paths
7. Mobile menu had no accessible name; sheet opened from physical left in RTL
8. Public header/footer wrapped the admin CMS
9. Gallery upload button inside `<label>` was unreliable
10. Collection delete had no confirm dialog
11. Sign-in ignored admin redirect after login

## Remaining (honest)

- No Playwright/Vitest suite in-repo (TF/TA generate-from-scratch still open)
- Clerk development keys warning in local
- THREE.Clock deprecation from drei (upstream)
- Admin CMS not E2E-tested while signed in (Clerk session required)
