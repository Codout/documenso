# Codout Sign

Codout Sign is the document-signing back-end for the Codout product family,
running at **https://sign.codout.com**.

This repository is a **public fork of [Documenso CE](https://github.com/documenso/documenso)**
maintained by Codout, licensed under **AGPL-3.0**. See [`NOTICE.md`](./NOTICE.md)
for the upstream attribution and source-availability statement (AGPL §13),
and [`CUSTOMIZATIONS.md`](./CUSTOMIZATIONS.md) for the full log of changes
on top of upstream.

> Codout Sign is **not** a Documenso product, is not affiliated with
> Documenso, Inc., and does not use the Documenso name or logo for product
> identification. The "Documenso" mark only appears in legally required
> attribution (LICENSE, NOTICE, source code authorship).

## Status

| Surface | URL |
| ------- | --- |
| Production | https://sign.codout.com |
| Source (this fork) | https://github.com/codout/documenso |
| Upstream | https://github.com/documenso/documenso |
| Image | `ghcr.io/codout/documenso-codout` |

## Quickstart (local development)

The fork uses the same dev stack as upstream Documenso:

```bash
npm run d        # full bootstrap: install + docker up + migrate + seed + dev
# or, step by step:
npm run dx:up    # start Postgres, Inbucket (mail), MinIO (S3) via docker compose
npm run prisma:migrate-dev
npm run prisma:seed
npm run translate:compile
npm run dev
```

Open http://localhost:3000. Inbucket (captures all outgoing mail) is at
http://localhost:9000.

For the deeper architecture diagram and code conventions see
[`ARCHITECTURE.md`](./ARCHITECTURE.md), [`CODE_STYLE.md`](./CODE_STYLE.md),
and [`CLAUDE.md`](./CLAUDE.md).

## Production deploy (Azure Container Apps)

The full runbook is in [`DEPLOY_AZURE.md`](./DEPLOY_AZURE.md). Topics covered:

- Required environment variables and Container Apps secrets
- PostgreSQL Flexible Server with `pgcrypto` and `pg_trgm` extensions
- AWS SES SMTP transport
- P12 signing certificate via base64 env var
- Custom domain + managed TLS
- Health checks (`/api/health`, `/api/certificate-status`)
- Troubleshooting: Prisma `P3018` / `P3009`, SES `535`, Git Bash path
  mangling, base64 line-wrap corruption, false-negative startup banner

## Build flag

This fork honors a single public build flag to enable the Codout-specific
defaults (visual branding, default locale `pt-BR`, self-hosted feature
defaults):

```env
NEXT_PUBLIC_CODOUT_BRANDED_BUILD=true
```

When unset (or `false`), the build behaves as upstream Documenso CE. This
flag is **public** (build-time) and contains no secret material. Server-only
behavioural toggles are documented per-feature in `CUSTOMIZATIONS.md`.

## Tech stack

Same as upstream:

- TypeScript, React 18, React Router v7 (Remix)
- Hono server, tRPC + ts-rest APIs
- PostgreSQL, Prisma, Kysely
- Tailwind, Radix UI, Shadcn UI
- Lingui (i18n), React Email
- Playwright (E2E)
- Turborepo, npm workspaces

## License

This fork inherits **GNU AGPL-3.0** from upstream. See [`LICENSE`](./LICENSE).
The Codout marks ("Codout", "Codout Sign", and the Codout Sign logo) are
trademarks of Codout and are **not** covered by the AGPL grant. If you fork
this repository, replace the Codout marks with your own.

## Reporting issues

- **Bug in fork-specific code** (anything in `CUSTOMIZATIONS.md`):
  open an issue here.
- **Bug also affects upstream Documenso** (signing pipeline, auth,
  migrations, core business logic): report at
  https://github.com/documenso/documenso/issues and link the issue here.
- **Security**: see [`SECURITY.md`](./SECURITY.md).
