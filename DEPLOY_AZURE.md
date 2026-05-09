# Deploy Codout Sign on Azure Container Apps

End-to-end runbook for the production deploy at https://sign.codout.com.

> Premise: Codout Sign is a fork of Documenso CE running self-hosted on
> Azure. We use Azure Container Apps for the runtime, Azure Database for
> PostgreSQL Flexible Server for data, AWS SES for email, and a local P12
> signing certificate provided as a base64 secret. Storage is database-backed
> by default; switch to S3 only when document volume justifies it.

## 1. Prerequisites

- Azure CLI ≥ 2.55 (`az login`)
- An Azure subscription and resource group
- A built and pushed image: `ghcr.io/codout/documenso-codout:<tag>`
  (see `.github/workflows/codout-build.yml`)
- A signing certificate `cert.p12` and its passphrase (locally; never commit)
- AWS SES verified domain and SMTP credentials
- DNS control over `sign.codout.com`

## 2. Required environment variables

Configure these as **Container Apps secrets** (for sensitive values) or
**environment variables** (for public values). The full inventory lives in
`.env.example`; the table below is the production minimum.

### Required

| Variable | Source | Notes |
| -------- | ------ | ----- |
| `NEXTAUTH_SECRET` | secret | `openssl rand -hex 32` |
| `NEXT_PRIVATE_ENCRYPTION_KEY` | secret | `openssl rand -hex 32` — **never** rotate without re-encrypting data |
| `NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY` | secret | `openssl rand -hex 32` |
| `NEXT_PUBLIC_WEBAPP_URL` | env | `https://sign.codout.com` |
| `NEXT_PRIVATE_INTERNAL_WEBAPP_URL` | env | Same as above for ACA single-revision deploys |
| `NEXT_PRIVATE_DATABASE_URL` | secret | Pooled URL from PG Flexible Server |
| `NEXT_PRIVATE_DIRECT_DATABASE_URL` | secret | Direct (non-pooled) URL for migrations |
| `NEXT_PRIVATE_SIGNING_TRANSPORT` | env | `local` |
| `NEXT_PRIVATE_SIGNING_LOCAL_FILE_CONTENTS` | secret | Base64-encoded P12 contents — **see §5** |
| `NEXT_PRIVATE_SIGNING_PASSPHRASE` | secret | P12 passphrase |
| `NEXT_PRIVATE_SMTP_TRANSPORT` | env | `smtp-auth` |
| `NEXT_PRIVATE_SMTP_HOST` | env | e.g. `email-smtp.us-east-1.amazonaws.com` |
| `NEXT_PRIVATE_SMTP_PORT` | env | `587` |
| `NEXT_PRIVATE_SMTP_SECURE` | env | leave empty for STARTTLS on 587 |
| `NEXT_PRIVATE_SMTP_USERNAME` | secret | SES SMTP user |
| `NEXT_PRIVATE_SMTP_PASSWORD` | secret | SES SMTP password |
| `NEXT_PRIVATE_SMTP_FROM_NAME` | env | `Codout Sign` |
| `NEXT_PRIVATE_SMTP_FROM_ADDRESS` | env | `noreply@sign.codout.com` (must be SES-verified) |
| `DOCUMENSO_DISABLE_TELEMETRY` | env | `true` |
| `NEXT_PUBLIC_CODOUT_BRANDED_BUILD` | env | `true` |

### Recommended

| Variable | Source | Notes |
| -------- | ------ | ----- |
| `PORT` | env | `3000` |
| `NEXT_PRIVATE_JOBS_PROVIDER` | env | `local` to start; switch to `inngest` for reminders |
| `NEXT_PUBLIC_DOCUMENT_SIZE_UPLOAD_LIMIT` | env | `25` (MB) |
| `NEXT_PRIVATE_SIGNING_TIMESTAMP_AUTHORITY` | env | TSA URL for LTV (e.g. `http://timestamp.digicert.com`) |

> **Do not** put any of these in the image. Container Apps reads them at
> runtime from the revision spec.

## 3. PostgreSQL Flexible Server

```bash
RG=rg-codout-sign
LOC=brazilsouth
PG=codout-sign-pg

az postgres flexible-server create \
  --resource-group $RG \
  --name $PG \
  --location $LOC \
  --tier Burstable --sku-name Standard_B2s \
  --storage-size 64 \
  --version 16 \
  --admin-user codoutadmin \
  --admin-password "<strong-pass>" \
  --public-access "<your-ip>"

# Required Postgres extensions
az postgres flexible-server parameter set \
  --resource-group $RG --server-name $PG \
  --name azure.extensions --value pgcrypto,pg_trgm

# Restart so the parameter takes effect
az postgres flexible-server restart -g $RG -n $PG
```

Then in `psql`, in the **target database**:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

> If you skip the `azure.extensions` parameter, `prisma migrate deploy` will
> fail with **P3018** when it hits the migration that creates `pgcrypto` or
> `pg_trgm`. This is the most common deploy failure.

## 4. Container Apps environment

```bash
ENV=codout-sign-env
APP=codout-sign-app

az containerapp env create -g $RG -n $ENV --location $LOC

az containerapp create \
  --resource-group $RG \
  --name $APP \
  --environment $ENV \
  --image ghcr.io/codout/documenso-codout:<tag> \
  --target-port 3000 --ingress external \
  --min-replicas 1 --max-replicas 3 \
  --cpu 1.0 --memory 2.0Gi
```

Then attach the secrets:

```bash
az containerapp secret set -g $RG -n $APP --secrets \
  nextauth-secret="$(openssl rand -hex 32)" \
  encryption-key="$(openssl rand -hex 32)" \
  encryption-secondary-key="$(openssl rand -hex 32)" \
  database-url="postgres://...?sslmode=require" \
  database-direct-url="postgres://...?sslmode=require" \
  signing-passphrase="<p12-pass>" \
  signing-base64="$(base64 -w0 cert.p12)" \
  smtp-username="<ses-user>" smtp-password="<ses-pass>"

az containerapp update -g $RG -n $APP \
  --set-env-vars \
    NEXTAUTH_SECRET=secretref:nextauth-secret \
    NEXT_PRIVATE_ENCRYPTION_KEY=secretref:encryption-key \
    NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY=secretref:encryption-secondary-key \
    NEXT_PRIVATE_DATABASE_URL=secretref:database-url \
    NEXT_PRIVATE_DIRECT_DATABASE_URL=secretref:database-direct-url \
    NEXT_PRIVATE_SIGNING_TRANSPORT=local \
    NEXT_PRIVATE_SIGNING_LOCAL_FILE_CONTENTS=secretref:signing-base64 \
    NEXT_PRIVATE_SIGNING_PASSPHRASE=secretref:signing-passphrase \
    NEXT_PRIVATE_SMTP_TRANSPORT=smtp-auth \
    NEXT_PRIVATE_SMTP_HOST=email-smtp.us-east-1.amazonaws.com \
    NEXT_PRIVATE_SMTP_PORT=587 \
    NEXT_PRIVATE_SMTP_USERNAME=secretref:smtp-username \
    NEXT_PRIVATE_SMTP_PASSWORD=secretref:smtp-password \
    NEXT_PRIVATE_SMTP_FROM_NAME='Codout Sign' \
    NEXT_PRIVATE_SMTP_FROM_ADDRESS=noreply@sign.codout.com \
    NEXT_PUBLIC_WEBAPP_URL=https://sign.codout.com \
    NEXT_PRIVATE_INTERNAL_WEBAPP_URL=https://sign.codout.com \
    DOCUMENSO_DISABLE_TELEMETRY=true \
    NEXT_PUBLIC_CODOUT_BRANDED_BUILD=true
```

### Health and readiness probes

```bash
az containerapp update -g $RG -n $APP \
  --probes-yaml - <<'YAML'
- type: liveness
  httpGet: { path: /api/health, port: 3000 }
  initialDelaySeconds: 30
  periodSeconds: 30
  failureThreshold: 6
- type: readiness
  httpGet: { path: /api/health, port: 3000 }
  initialDelaySeconds: 10
  periodSeconds: 10
YAML
```

`/api/health` returns `200` for `ok` or `warning` and `500` for `error`.
A `warning` is acceptable at startup if the certificate is still being read
(see Troubleshooting). For the certificate alone, hit `/api/certificate-status`.

## 5. Signing certificate (P12 via base64)

Generate the base64 string locally **without line breaks**:

```bash
# Linux/macOS
base64 -w0 cert.p12 > cert.p12.base64

# macOS (no -w flag)
base64 -i cert.p12 -o cert.p12.base64
tr -d '\n' < cert.p12.base64 > cert.p12.base64.tmp && mv cert.p12.base64.tmp cert.p12.base64
```

Pass the contents (not the file path) to `NEXT_PRIVATE_SIGNING_LOCAL_FILE_CONTENTS`.
Do **not** mount it as a file — Container Apps secrets are env-var-only.

The runtime decoder lives at
`packages/signing/transports/local.ts:6-10`. It treats
`NEXT_PRIVATE_SIGNING_LOCAL_FILE_CONTENTS` as authoritative; only if unset
does it fall back to `NEXT_PRIVATE_SIGNING_LOCAL_FILE_PATH`.

## 6. Custom domain and TLS

Container Apps issues a free managed certificate for any custom domain.

```bash
az containerapp hostname add -g $RG -n $APP --hostname sign.codout.com
az containerapp hostname bind -g $RG -n $APP --hostname sign.codout.com \
  --environment $ENV --validation-method CNAME
```

Add the suggested CNAME / TXT records in your DNS provider, then bind.

## 7. Domain verification for SES

`NEXT_PRIVATE_SMTP_FROM_ADDRESS` must use a domain that is **verified** in
SES, with DKIM. Until then, SES rejects with `554 Message rejected`.

## 8. Troubleshooting (known failure modes)

### Prisma `P3018` — `extension "pgcrypto" does not exist`

Cause: `azure.extensions` server parameter does not include `pgcrypto`,
so `CREATE EXTENSION` is denied even with admin credentials.
Fix: §3 above. Then `psql` and `CREATE EXTENSION pgcrypto;`.
Rerun `prisma migrate deploy` from the container or `npm run prisma:migrate-deploy`.

### Prisma `P3018` — `extension "pg_trgm" does not exist`

Same cause as above; same fix but for `pg_trgm`.

### Prisma `P3009` — failed migration left in `_prisma_migrations`

A previous migration crashed mid-flight (commonly P3018). Prisma marks it
failed and refuses to continue.
Fix: after fixing the underlying cause (extensions), run

```sql
UPDATE _prisma_migrations
SET finished_at = now(), logs = NULL, rolled_back_at = NULL
WHERE migration_name = '<the_failed_migration>'
  AND finished_at IS NULL;
```

then `prisma migrate deploy` again. Verify schema with `prisma db pull`
in a scratch DB before applying to production.

### SES `535 Authentication Credentials Invalid`

Cause: using the IAM access key/secret instead of the **SMTP** credentials.
Fix: AWS Console → SES → SMTP settings → "Create SMTP credentials".
Use the generated SMTP user/pass for `NEXT_PRIVATE_SMTP_USERNAME` and
`NEXT_PRIVATE_SMTP_PASSWORD`. The IAM user is also subject to a sandbox
review until production access is granted.

### Git Bash converts `/subscriptions/...` to a Windows path

When running `az` commands on Windows under Git Bash, MSYS rewrites paths
that start with `/`. Symptom: `az role assignment` complaining about a
path like `C:/Program Files/Git/subscriptions/...`.
Fix: prefix the path with `MSYS_NO_PATHCONV=1`:

```bash
MSYS_NO_PATHCONV=1 az role assignment create --scope /subscriptions/.../resourceGroups/...
```

The same trick fixes `/C=BR/...` certificate subjects in `openssl`.

### "Certificate not found" at startup but `/api/certificate-status` says `true`

`docker/start.sh` only checks **file** existence at the path, not the
base64 env var. If `NEXT_PRIVATE_SIGNING_LOCAL_FILE_CONTENTS` is set, the
runtime decodes it correctly even though the startup banner warns.
To verify, hit `https://sign.codout.com/api/certificate-status` — if
`isAvailable: true`, signing is working. The banner is a known false
negative when using base64 mode.

### `PKCS#12 integrity broken` / `mac verify error`

Cause #1: `NEXT_PRIVATE_SIGNING_PASSPHRASE` is wrong.
Cause #2: the base64 string was line-wrapped (paste from a UI added `\n`).
Fix: regenerate with `base64 -w0` (or strip newlines) and re-set the secret.
Verify locally before deploying:

```bash
echo "$BASE64" | base64 -d > /tmp/cert.p12
openssl pkcs12 -in /tmp/cert.p12 -noout -passin pass:"$PASS"
```

If the local check passes but deploy fails, your secret has a `\n`.

## 9. Smoke-test checklist after deploy

- [ ] `https://sign.codout.com/api/health` → `200 ok`
- [ ] `https://sign.codout.com/api/certificate-status` → `isAvailable: true`
- [ ] Sign up a test user, confirmation email arrives via SES
- [ ] Upload a 1-page PDF, send to a recipient
- [ ] Recipient receives signing email, signs, document is sealed
- [ ] Download the signed PDF and verify the signature in Adobe Reader
  ("Signature is valid"). If TSA is configured, also check the timestamp.
- [ ] `/open-source` page resolves and links to this repository

## 10. Logs

Container Apps streams stdout/stderr to Log Analytics. Useful queries:

```kusto
ContainerAppConsoleLogs_CL
| where ContainerAppName_s == "codout-sign-app"
| where Log_s contains "P3018" or Log_s contains "P3009"
| order by TimeGenerated desc
```

For application-level logs, set `NEXT_PRIVATE_LOGGER_FILE_PATH` only if you
also configure a sidecar to ship that file — otherwise leave it unset and
rely on stdout.
