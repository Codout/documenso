# Security Policy — Codout Sign fork

## Reporting a vulnerability

This repository is a public fork of Documenso. Vulnerability reports should
be triaged based on **where the bug lives**:

- **Bug exists in upstream Documenso** (any code in
  `packages/signing`, `packages/auth`, `packages/lib/server-only/`,
  Prisma migrations, or any file that hasn't been modified by this fork —
  see `CUSTOMIZATIONS.md` for the exhaustive list of fork-only changes):
  please report to upstream first at
  https://github.com/documenso/documenso/security/advisories/new
  and CC `security@codout.com` so we can coordinate.

- **Bug exists in fork-only code** (anything listed in `CUSTOMIZATIONS.md`,
  the deploy pipeline, branded UI, or the GHCR image):
  email **`security@codout.com`**.

We aim to acknowledge reports within **72 hours** and to ship a fix or
mitigation within **14 days** for high/critical issues.

Please do **not** open public GitHub issues for vulnerabilities.

## Scope

| In scope | Out of scope |
| -------- | ------------ |
| `https://sign.codout.com` (production instance) | Anything served from `documenso.com` (upstream) |
| The Docker image `ghcr.io/codout/documenso-codout` | Marketing pages |
| Source in this repository on `main` | Forks of this fork |

## Things we explicitly do not modify

This fork **does not patch** the cryptographic signing pipeline, audit log
generation, or authentication flows. If the report concerns those areas, it
is by definition an upstream bug. See `CUSTOMIZATIONS.md` § "Files that
intentionally remain untouched".

## Operational practices

- No secrets, certificates, or connection strings are committed. The
  signing certificate is provided to the runtime via
  `NEXT_PRIVATE_SIGNING_LOCAL_FILE_CONTENTS` (base64 P12) as a secret on
  Azure Container Apps.
- `.env.example` ships only placeholder values.
- Production telemetry to upstream Documenso is **disabled by default**
  (`DOCUMENSO_DISABLE_TELEMETRY=true`).
- The GHCR image is rebuilt for each tagged release; `latest` is not used as
  a deployment target.

## Responsible disclosure

We follow the standard 90-day responsible disclosure window. Reporters are
credited in the release notes unless they request anonymity.
