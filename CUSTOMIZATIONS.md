# Codout Sign — Fork Customizations

This file is the **authoritative log** of every change this fork makes on top
of upstream Documenso. The goal is to keep merges with upstream tractable: if
a file appears here, expect a conflict and resolve in favour of the
documented intent below (unless upstream changed semantics).

> Format: each entry says **what**, **why**, **files**, and **how to revert**.
> Update this file in the same commit as the change.

## 0. Conventions

- Brand name in user-facing surfaces: **Codout Sign** (no dot).
- Public URL: **https://sign.codout.com**.
- Build flag: **`NEXT_PUBLIC_CODOUT_BRANDED_BUILD`** (`"true"` to enable).
  When unset/false, the build behaves as upstream Documenso CE.
- Primary brand color: **`#4F46E5`** (indigo-600 family).
- Default instance locale: **`pt-BR`**.
- Telemetry default: **disabled** in `.env.example` (`DOCUMENSO_DISABLE_TELEMETRY=true`).

## 1. Documentation & legal — Phase A

| What | Files | Why | Revert |
| ---- | ----- | --- | ------ |
| Fork notice & AGPL §13 source link | `NOTICE.md` (new) | Required by AGPL when running as a network service. | Delete file. |
| README rewrite for Codout Sign | `README.md` | Reflect the actual product. Original kept in upstream history. | `git checkout upstream/main -- README.md` |
| This change log | `CUSTOMIZATIONS.md` (new) | Track every fork-specific delta. | Delete file. |
| Azure Container Apps deploy guide | `DEPLOY_AZURE.md` (new) | Production deployment reference. | Delete file. |
| Security policy | `SECURITY.md` (new) | Disclosure channel for the fork. | Delete file. |
| `.env.example` additions | `.env.example` | Document Codout-specific vars; default telemetry off. | Revert section markers `# [[CODOUT]]`. |
| `.gitignore` hardening | `.gitignore` | Prevent committing certs/p12/base64 secrets. | Remove the `# codout` block. |

## 2. Branding (visual) — Phase B

| What | Files | Why | Revert |
| ---- | ----- | --- | ------ |
| Indigo theme tokens | `packages/ui/styles/theme.css` (`--primary`, `--primary-foreground`, `--ring`, `--field-card`, `--field-card-border`, `--new-primary-*`, dark variants) | Replace Documenso green (`hsl(95 71% 67%)`) with Codout indigo (`hsl(244 75% 59%)` / `#4F46E5`). | `git checkout upstream/main -- packages/ui/styles/theme.css` |
| Tailwind palette re-aliased | `packages/tailwind-config/index.cjs` | The codebase has many `bg-documenso-*` / `text-documenso-700` utility usages. Re-aliasing the `documenso` palette to indigo updates them all without a class rename. Added a parallel `codout` palette for new code. | Restore the original Documenso green hex values. |
| Web manifest brand | `apps/remix/public/site.webmanifest` | Name, short_name and `theme_color` (`#4F46E5`). | Same as above. |
| HTML meta tags | `apps/remix/app/utils/meta.ts` | Replaced hardcoded "Documenso", description, keywords, OG/Twitter tags with `APP_*` constants. | Restore literal strings. |
| Brand constants module | `packages/lib/constants/app-branding.ts` (new) | Single source of truth for brand strings. Honours `NEXT_PUBLIC_CODOUT_BRANDED_BUILD` and per-key overrides (`NEXT_PUBLIC_APP_NAME`, etc.). When the flag is off, the upstream Documenso strings are used verbatim. | Delete the file and inline strings. |
| SVG placeholder logo | `packages/assets/logo.svg` (new) | Codout Sign wordmark + mark. **Placeholder** — replace with the real brand asset before launch. | Delete file. |
| SVG placeholder favicon | `apps/remix/public/icon.svg` (new) | Single-glyph "C" favicon in indigo. Wired in `root.tsx` via `<link rel="icon" type="image/svg+xml">`. | Remove the link tag and delete file. |
| Favicon link priority | `apps/remix/app/root.tsx` | Adds the SVG icon link before the PNG fallbacks so modern browsers pick it up. | Remove the new line. |
| Open Source page (AGPL §13) | `apps/remix/app/routes/_unauthenticated+/open-source.tsx` (new) | Public attribution page with link to this fork and to upstream. Required by AGPL when running as a network service. | Delete file. |
| Footer link to Open Source | `apps/remix/app/routes/_unauthenticated+/_layout.tsx` | Surfaces the source link from every public-facing page. | Revert layout file. |

**Pending manual work** (cannot generate from a CLI without ImageMagick):
the binary placeholders are still the upstream Documenso green PNG/JPG files:

- `apps/remix/public/favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`
- `apps/remix/public/opengraph-image.jpg`
- `packages/assets/logo.png`, `packages/assets/logo_icon.png`, `packages/assets/static/logo.png`
- `packages/email/static/logo.png` (used by email templates — see Phase E)

The SVG favicon takes precedence in modern browsers, so the immediate visual
impact of the leftover PNGs is minimal. Replace each before public launch.

## 3. Brand strings (constants) — Phase C

| What | Files | Why | Revert |
| ---- | ----- | --- | ------ |
| Email `FROM_NAME` / `FROM_ADDRESS` defaults | `packages/lib/constants/email.ts` | Wire to `APP_NAME`; default address falls back to `noreply@sign.codout.com` when the Codout flag is set. Env vars still win. | Restore literal `'Documenso'` / `'noreply@documenso.com'`. |
| `IDENTITY_PROVIDER_NAME.DOCUMENSO` label | `packages/lib/constants/auth.ts` | The DB enum value `DOCUMENSO` is immutable (migrations), but the **display label** maps to `APP_NAME`. | Restore `'Documenso'` literal. |
| Document-flow "from" dropdown | `packages/ui/primitives/template-flow/add-template-settings.tsx`, `packages/ui/primitives/document-flow/add-subject.tsx` | The `-1` sentinel renders the platform default sender — should show the Codout name. | Restore `Documenso` literal. |
| TOTP issuer | `packages/lib/server-only/2fa/setup-2fa.ts` | What appears in authenticator apps when registering 2FA. New registrations show "Codout Sign". Existing registrations keep showing the previous label until re-registered (this is cosmetic and does not invalidate codes). | Restore `'Documenso'` literal. |
| WebAuthn `rpName` | `packages/lib/utils/authenticator.ts` | Display name in the OS prompt during passkey registration. `rpId` (the host) is unchanged, so existing passkeys continue to work. | Restore `'Documenso'` literal. |
| Forgot/reset password mailers | `packages/lib/server-only/auth/send-forgot-password.ts`, `send-reset-password.ts` | These two were duplicating the env fallback logic. Now they delegate to the centralised `FROM_NAME`/`FROM_ADDRESS` from `constants/email.ts`. | Inline the env reads. |
| `SUPPORT_EMAIL` indirection | `packages/lib/constants/app.ts` | Now reads from `APP_SUPPORT_EMAIL` (which honours `NEXT_PUBLIC_SUPPORT_EMAIL` and the build flag). | Restore the inline literal. |
| Embed completion fallback name | `apps/remix/app/components/embed/embed-document-completed.tsx` | When `name` prop is missing, show `APP_NAME` instead of `'Documenso'`. | Restore the literal. |

**Not changed in this phase** (deliberate):

- The `IdentityProvider` Prisma enum value `DOCUMENSO`. Renaming it would
  require a migration that renames a string value across every existing
  user row — too risky for the cosmetic gain.
- `<Trans>...Documenso...</Trans>` strings in the English UI. These are
  translation **keys**; they get replaced by the pt-BR catalog (Phase D)
  for the default user locale and only appear if a user explicitly
  switches to en. Leaving the en source unchanged keeps the upstream
  Lingui catalog merge clean.
- `packages/lib/server-only/license/license-client.ts` (license server URL).
  Override at runtime via `INTERNAL_OVERRIDE_LICENSE_SERVER_URL`.

## 4. Default locale — Phase D

_To be populated when Phase D ships._

## 5. Email templates — Phase E

_To be populated when Phase E ships._

## 6. Feature gates behind `NEXT_PUBLIC_CODOUT_BRANDED_BUILD` — Phase F

_To be populated when Phase F ships. Each gate documented as: file:line, what
it gates, what we change, and the legal/operational rationale._

## 7. Docker — Phase G

_To be populated when Phase G ships._

## 8. CI/CD — Phase H

_To be populated when Phase H ships._

## Files that intentionally remain untouched

- `packages/signing/**` — PDF cryptographic signing pipeline.
- `packages/prisma/migrations/**` — DB migrations are immutable history.
- `packages/auth/**` — authentication flows.
- `packages/lib/server-only/license/license-client.ts` — license verification.
  We only set `INTERNAL_OVERRIDE_LICENSE_SERVER_URL` via env, never patch.
- `packages/lib/constants/document-audit-logs.ts` — audit log enums.

If you find yourself wanting to edit one of these, **open an issue first** in
this repository and document the rationale here before merging.

## Merging from upstream

Recommended flow when pulling new upstream releases:

```bash
git remote add upstream https://github.com/documenso/documenso.git  # once
git fetch upstream
git checkout -b chore/upstream-merge-YYYYMMDD
git merge upstream/main
# resolve conflicts; for each conflict in a file listed above,
# keep the Codout intent and update line numbers in this file.
npm install
npm run lint
npx tsc --noEmit
npm run translate:compile
# smoke-test login, send-document, sign flow before merging to main.
```

If a merge touches `packages/signing/` or migrations, treat it as a release
candidate and run the full E2E suite (`npm run test:e2e`) before deploy.
