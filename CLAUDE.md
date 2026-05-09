# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Documenso is an open-source DocuSign alternative. See `ARCHITECTURE.md` for a deeper diagram-driven overview and `CODE_STYLE.md` for full code conventions; this file summarizes the parts agents need most.

## Common Commands

Run from the repo root unless noted.

- `npm run d` — full bootstrap (install, docker up, migrate, seed, dev). Use this for first-time setup.
- `npm run dev` — start the Remix app on http://localhost:3000 (compiles Lingui first).
- `npm run dx:up` / `npm run dx:down` — bring the dev Postgres + Inbucket + MinIO stack up/down (`docker/development/compose.yml`).
- `npm run lint` / `npm run lint:fix` — Biome check (also runs format).
- `npm run translate:compile` — required after pulling new translation messages; `npm run translate:extract` regenerates message catalogs.
- `npm run prisma:migrate-dev` / `npm run prisma:seed` / `npm run prisma:studio` — wrap Prisma scripts in `@documenso/prisma` with `with:env`.
- `npm run with:env -- <cmd>` — run any command with `.env` and `.env.local` loaded (Turbo subprocesses do not see env vars otherwise).

Type checking and tests:

- `npx tsc --noEmit` (per package) — fast type check. **Do not run `npm run build` to verify changes** unless asked; full builds take ~2 minutes.
- `npm run test:dev -w @documenso/app-tests` — single Playwright E2E run (dev mode, requires the dev server running).
- `npm run test-ui:dev -w @documenso/app-tests` — Playwright UI mode.
- `npm run test:e2e` — full CI E2E run; spins up its own server via `start-server-and-test`. Filter with `E2E_TEST_PATH=<path>` env var.

## Monorepo Layout

npm workspaces + Turborepo. The single deployable app is `apps/remix`; everything else is a library it imports.

- `apps/remix` — main app: a React Router v7 (Remix) UI served by a Hono server. `server/router.ts` mounts all API surfaces; routes live under `app/routes/` with Remix's `+` folder convention (`_authenticated+`, `_unauthenticated+`, `_recipient+` for signing flows).
- `apps/openpage-api` (port 3003) and `apps/docs` (port 3002) are separate apps with their own dev scripts.
- `packages/lib` — core business logic, split into `server-only/`, `client-only/`, `universal/`, plus `jobs/` (background work).
- `packages/trpc` — tRPC routers; serves both `/api/trpc/*` (internal, session auth) and `/api/v2/*` via `trpc-to-openapi` (public, token or session auth). Routers are organized as `<domain>-router/<action>.ts` + `<action>.types.ts`.
- `packages/api` — legacy REST API V1 at `/api/v1/*` using `ts-rest`. Deprecated but maintained.
- `packages/prisma` — Prisma schema + generated client; also exposes a Kysely instance via `prisma-extension-kysely` for typed raw queries.
- `packages/auth` — Arctic OAuth + WebAuthn/Passkeys.
- `packages/signing` — PDF signing strategies (`local` P12 cert, `gcloud-hsm`).
- `packages/email` — React Email templates + mailer with multiple transports.
- `packages/ui` — Shadcn/Radix/Tailwind component library.
- `packages/ee` — Enterprise-only features.
- `packages/app-tests` — Playwright E2E suite, run only by name (`-w @documenso/app-tests`).

## Architectural Patterns to Know

- **Swappable providers via env (ts-pattern).** Storage (`NEXT_PUBLIC_UPLOAD_TRANSPORT`: `database` | `s3`), signing (`NEXT_PRIVATE_SIGNING_TRANSPORT`: `local` | `gcloud-hsm`), email (`NEXT_PRIVATE_SMTP_TRANSPORT`: `smtp-auth` | `smtp-api` | `resend` | `mailchannels`), jobs (`NEXT_PRIVATE_JOBS_PROVIDER`: `local` | `bullmq` | `inngest`). When touching one provider, mirror behavior across the others or the swap breaks.
- **Background jobs.** `triggerJob({ name, payload })` dispatches; handlers live under `packages/lib/jobs/definitions/`. The default `local` provider uses Postgres and does **not** support scheduled jobs (e.g. reminders) — those need `inngest`.
- **API surfaces (mounted in `apps/remix/server/router.ts`).**
  - `/api/v1/*` — ts-rest (deprecated).
  - `/api/v2/*`, `/api/v2-beta/*` — tRPC OpenAPI; only `GET` and `POST` are allowed in OpenAPI meta.
  - `/api/trpc/*` — internal tRPC for the web client.
  - `/api/jobs/*` — job handler endpoints.
- **tRPC route file convention.** One route per file: `<domain>-router/<verb-name>.ts` plus `<verb-name>.types.ts` containing `Z<Name>RequestSchema` / `Z<Name>ResponseSchema` and OpenAPI meta. `create` requests put `id` and data at the top level; `update` requests put `id` at top level and the updates under `data`. Prefer verbs `get` / `getMany` / `find` / `create` / `update` / `delete`.
- **Errors.** Throw `AppError` (with `AppErrorCode`) on the server. On the client, `AppError.parseError(err)` to read structured codes/messages. tRPC handlers can return `AppError.toRestAPIError(err)`.

## Code Style Highlights

The full guide is in `CODE_STYLE.md`. Non-obvious or load-bearing rules:

- Prefer `type` over `interface`. Prefix Zod schemas with `Z`, derived types with `T` (`ZFooSchema` → `TFooSchema`).
- Always arrow functions (`export const foo = () => {}`); never classes.
- **Never use `'use client'`** (this is Remix, not Next.js).
- **Never write 1-line if statements** — always use braces.
- Directories: `lowercase-with-dashes`. Components: named exports.
- Booleans get auxiliary verbs: `isLoading`, `hasError`, `canEdit`, `shouldRender`.
- Lucide icons use longhand names (`HomeIcon`, not `Home`).
- Forms: `react-hook-form` + Zod, wrap inputs in `<Form>`/`<FormItem>` and a `<fieldset disabled={isLoading}>`.
- Use `ts-pattern`'s `match(...).exhaustive()` for enum/union switching.

## Translations (Lingui)

- JSX: `<Trans>string</Trans>` from `@lingui/react/macro`.
- TS: ``t`string` `` macro; get `t` via `const { t } = useLingui()` from `@lingui/react/macro`. Strings stored in module-level constants must use the `t` macro.
- After editing message strings, run `npm run translate:compile` (or extract+compile) before the dev server picks them up.

## Remix / React Router v7

- Route param/loader types come from generated `Route` namespaces: `(params: Route.Params)`, `(loaderData: Route.LoaderData)`.
- **Return data directly from loaders — do not call `json()`**. For data with `Date` / `Decimal` / similar, use `superLoaderJson`.

## Local Dev Services

When `npm run dx:up` is running:

- App: http://localhost:3000
- Inbucket (captures all outgoing email): http://localhost:9000
- MinIO console (S3): http://localhost:9001
- Postgres: `localhost:54320`
