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

| What | Files | Why | Revert |
| ---- | ----- | --- | ------ |
| `getDefaultUserLang()` | `packages/lib/constants/locales.ts` | Adds a runtime resolver: `pt-BR` when `NEXT_PUBLIC_CODOUT_BRANDED_BUILD=true`, otherwise the upstream `sourceLang` (`en`). | Remove the function. |
| `extractLocaleData` fallback | `packages/lib/utils/i18n.ts` | Falls back to `getDefaultUserLang()` instead of always `sourceLang`. Users with a browser `accept-language` matching any other supported locale (es, fr, de, …) still get their preferred language — the new default only applies when **no** locale match is found and the user has no cookie set. | Restore `APP_I18N_OPTIONS.sourceLang`. |

`APP_I18N_OPTIONS.sourceLang` itself is **not changed**. Lingui extracts
message keys from the codebase using that value, so flipping it would
confuse the translation toolchain. The codebase ships English source
strings; pt-BR users see the catalog at `packages/lib/translations/pt-BR/web.po`.

`APP_I18N_OPTIONS.defaultLocale` (`'en-US'`) is **not changed**. It is used
to format dates and numbers inside the audit-log and certificate PDFs.
Changing it would alter the formatting of historical documents at
re-render time, which is undesirable. Each user's preferred locale is
already passed through `setLocale()` at the relevant call sites; the
constant only matters when no user locale is available.

**Manual step before deploy**: run `npm run translate:extract && npm run translate:compile`
so that any new English strings introduced by this fork (Open Source
page, etc.) appear in `packages/lib/translations/pt-BR/web.po` for
translation. Until they are translated they will fall through to the
English source — visible only to pt-BR users on those specific pages.

## 5. Email templates — Phase E

| What | Files | Why | Revert |
| ---- | ----- | --- | ------ |
| Footer "Powered by" link target | `packages/email/template-components/template-footer.tsx` | Routes through `APP_NAME` and `APP_SOURCE_REPO_URL` when the Codout build flag is on; falls back to the upstream `documen.so/mail-footer` link otherwise. Inline color is now indigo `#4F46E5`. | Restore the hardcoded link/text. |
| Footer fallback company block | `packages/email/template-components/template-footer.tsx` | Adds a Codout variant (`APP_PUBLISHER` + the configured `NEXT_PUBLIC_WEBAPP_URL`) for the branded build. The upstream "Documenso, Inc. / 2261 Market Street …" block is preserved unchanged behind `!IS_CODOUT_BRANDED_BUILD()`. | Remove the new branch. |
| Self-signed "View plans" CTA | `packages/email/template-components/template-document-self-signed.tsx` | Was a hard link to `https://documenso.com/pricing`. Now only renders when `IS_BILLING_ENABLED()` is true and points to `${WEBAPP_URL}/settings/billing`. On the Codout build (billing disabled by default) the button disappears entirely. | Restore the hardcoded button. |
| Inline accent hex `#7AC455` → `#4F46E5` | `template-document-self-signed.tsx`, `template-document-recipient-signed.tsx`, `template-document-completed.tsx` | These three templates inlined the Documenso accent green directly (it does not flow through the Tailwind palette in email templates). Swapped to indigo. | Restore `#7AC455`. |
| Logo `alt` text | 17 templates + `template-document-image.tsx` | Generic `alt="Logo"` instead of `alt="Documenso Logo"`. Avoids a per-template `APP_NAME` import; visual brand still comes from the actual image. | `sed -i 's|alt="Logo"|alt="Documenso Logo"|g'` in `packages/email/templates/`. |
| Preview-default URLs | All templates with `… = 'https://documenso.com'` and `…@documenso.com` | These are dev/preview defaults exercised by `react-email`'s preview server when the template is rendered without props. Replaced with `https://example.com` / `@example.com` so a leak in production cannot ever surface a Documenso brand link. | `sed -i "s|'https://example.com'|'https://documenso.com'|g; s|@example.com|@documenso.com|g"`. |

**Pending manual step before deploy** (covered by Phase D notes too):

```bash
npm run translate:extract
npm run translate:compile
```

This re-extracts new strings (footer "sent using {APP_NAME}" wrapper,
Open Source page) and compiles the message catalogs, including pt-BR.
Until then, those specific strings render as the English source for
pt-BR users.

The binary `packages/email/static/logo.png` is still the upstream
Documenso green logo. Replace it with a real Codout Sign PNG (≥ 64 px
high, 4× density recommended) before launch — until then, all email
recipients see the Documenso logo while the surrounding text/links are
already Codout-branded. This is documented in CUSTOMIZATIONS.md §2's
"Pending manual work" list.

## 6. Feature gates behind `NEXT_PUBLIC_CODOUT_BRANDED_BUILD` — Phase F

A single helper, **`IS_SELF_HOSTED_PREMIUM()`** (in
`packages/lib/constants/app-branding.ts`), returns `true` when both
`NEXT_PUBLIC_CODOUT_BRANDED_BUILD=true` **and**
`NEXT_PUBLIC_FEATURE_BILLING_ENABLED` is unset/false. That is, it
identifies an AGPL self-hosted Codout build. Two thin wrappers in
`packages/lib/utils/feature-flags.ts` consume it:

- `isLiberatedClaimFlag(flag)` — true if the per-org claim is true OR if
  `IS_SELF_HOSTED_PREMIUM()`.
- `isLiberatedBillingGate(billingEnabled)` — same idea, for the existing
  `IS_BILLING_ENABLED` style of gate.

This was used at the gate sites — **not** by mutating the loaded
`organisationClaim` object — so that:

1. Database state stays semantically true (the org's claim is still
   "free", we just choose to honour the action anyway).
2. Reverts and merges from upstream are tractable: each gate site has
   exactly one wrapped boolean.

| Gate | File / line | Liberated? | Rationale |
| ---- | ----------- | ---------- | --------- |
| Document/recipient/template plan limits | `packages/ee/server-only/limits/server.ts:46` | **already by upstream** | The existing `if (!IS_BILLING_ENABLED())` short-circuits to `SELFHOSTED_PLAN_LIMITS`. No change needed. |
| Custom email domains (create) | `packages/trpc/server/enterprise-router/create-organisation-email-domain.ts:28,50` | **yes** | Operator may want senders from their own domain. |
| Custom email domains (read for sending) | `packages/lib/server-only/email/get-email-context.ts:221` | **yes** | Outbound delivery honours configured domains. |
| Organisation authentication portal — read | `packages/trpc/server/enterprise-router/get-organisation-authentication-portal.ts:68` | **yes** | Self-hosted needs first-class SSO. |
| Organisation authentication portal — update | `packages/trpc/server/enterprise-router/update-organisation-authentication-portal.ts:28,50` | **yes** | Same. |
| Embedded authoring | `packages/trpc/server/embedding-router/create-embedding-presign-token.ts:34-52` | **already by upstream** | The gate is already wrapped in `if (IS_BILLING_ENABLED())` — bypassed on self-host. No change needed. |
| `hidePoweredBy` (footer / certificate) | per-org claim | **not changed** | The Codout-branded footer (Phase E) is honest self-attribution; let orgs configure their own white-label preference. |
| 21 CFR Part 11 reauthentication | `packages/lib/server-only/recipient/{create,update}-envelope-recipients.ts`, `set-{document,template}-recipients.ts`, `envelope/{create,update}-envelope.ts` | **NOT liberated** | This is a **regulatory** gate, not a monetisation one. 21 CFR Part 11 (FDA electronic records / signatures) requires explicit operator opt-in per organisation because it changes legal weight of audit logs and signatures. The right way to enable it is via the per-org claim, even on self-host. |
| HIPAA | (no direct code gate found in this audit) | **NOT liberated** | Same reasoning. If a future upstream commit adds a HIPAA gate, leave it tied to the per-org claim. |

| What | Files | Why | Revert |
| ---- | ----- | --- | ------ |
| `IS_SELF_HOSTED_PREMIUM` helper | `packages/lib/constants/app-branding.ts` | Single source of truth for the self-hosted premium signal. | Delete the function. |
| `isLiberatedClaimFlag` / `isLiberatedBillingGate` | `packages/lib/utils/feature-flags.ts` (new) | Thin wrappers used at gate sites. | Delete the file. |
| `create-organisation-email-domain.ts` | wraps two gates | See above. | Restore raw `if (!IS_BILLING_ENABLED())` and `if (!flags.emailDomains)`. |
| `get-email-context.ts` | wraps `getAllowedEmails` claim check | See above. | Restore raw flag read. |
| `get-organisation-authentication-portal.ts` | wraps claim check | See above. | Restore raw flag read. |
| `update-organisation-authentication-portal.ts` | wraps two gates | See above. | Restore raw `IS_BILLING_ENABLED` and flag read. |

## 7. Docker — Phase G

| What | Files | Why | Revert |
| ---- | ----- | --- | ------ |
| Brand-aware startup banner | `docker/start.sh` | Banner, "useful links" block and server-start log read from `NEXT_PUBLIC_CODOUT_BRANDED_BUILD`. When unset, the banner is the upstream Documenso text verbatim. Also stops emitting the false-negative warning when `NEXT_PRIVATE_SIGNING_LOCAL_FILE_CONTENTS` is set (the pure-base64 deploy mode). | Restore the original printf block. |
| `NEXT_PUBLIC_CODOUT_BRANDED_BUILD` build arg | `docker/Dockerfile` (installer stage) | The flag must be present at build time so module-level constants like `APP_NAME` resolve correctly during SSR. Pass `--build-arg NEXT_PUBLIC_CODOUT_BRANDED_BUILD=true` when building the Codout image. | Remove the ARG/ENV block. |

The runner stage was **not** modified — encryption-key, telemetry-key
and other secrets continue to be passed through environment variables
at runtime, never baked. The Codout build flag is intentionally a
public, non-secret value baked at build time.

## 8. CI/CD — Phase H

| What | Files | Why | Revert |
| ---- | ----- | --- | ------ |
| GHCR build pipeline | `.github/workflows/codout-build.yml` (new) | Codout-fork-only build/push to `ghcr.io/codout/documenso-codout`. Runs lint + tsc before publishing. Tags by 12-char git SHA always; tags `codout-v*` produce `<tag>` and `latest` aliases. Multi-arch (amd64 + arm64) via Docker Buildx. The Codout brand flag is passed as `--build-arg NEXT_PUBLIC_CODOUT_BRANDED_BUILD=true`. | Delete the file. |

The upstream `publish.yml` is **not modified**. It continues to push
`documenso/documenso` to DockerHub + GHCR under the upstream namespace
when triggered. Codout's pipeline is fully additive.

**Repository requirements before the workflow can succeed:**

1. The `codout` GitHub organisation/user must allow GHCR package writes
   for this repository. By default `permissions: packages: write` plus
   `${{ secrets.GITHUB_TOKEN }}` is enough; no extra PAT is needed.
2. After the first push, the GHCR package is private. To pull from
   Azure Container Apps, either:
   - mark the package public in
     `https://github.com/users/codout/packages/container/documenso-codout/settings`
     (recommended for AGPL fork transparency), or
   - configure ACA with a registry pull secret containing a GitHub PAT
     with `read:packages`.
3. The `quality` job runs `npm run lint` and `tsc --noEmit`. If either
   fails the image is not built.

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
