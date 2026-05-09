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

_To be populated when Phase B ships._

## 3. Brand strings (constants) — Phase C

_To be populated when Phase C ships._

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
