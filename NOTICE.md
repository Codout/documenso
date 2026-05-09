# NOTICE

This repository (`codout/documenso`) is a **public fork** of
[**Documenso Community Edition**](https://github.com/documenso/documenso),
maintained by **Codout** for use as the back-end of **Codout Sign**
(https://sign.codout.com).

The fork is, and will remain, **public** and licensed under the
**GNU Affero General Public License v3.0 (AGPL-3.0)**, the same license used
by the upstream project. See [`LICENSE`](./LICENSE) for the full text.

## Upstream attribution

- Upstream project: https://github.com/documenso/documenso
- Upstream copyright: © Documenso, Inc. and Documenso contributors
- Upstream trademarks: "Documenso" and the Documenso logo are trademarks of
  Documenso, Inc. **They are not used to identify Codout Sign.** This fork
  does not claim affiliation with or endorsement by Documenso, Inc.

The Documenso name and brand have been replaced in user-facing surfaces of
this fork (UI, emails, metadata) with the **Codout Sign** brand. All
attribution required by AGPL-3.0 — copyright notices, license file, code
authorship, and the public source link — is preserved.

## Source availability (AGPL §13)

Because Codout Sign is operated as a network service at
https://sign.codout.com, AGPL §13 requires that users of the service can
obtain the **Corresponding Source** of the version they interact with.

The source for the running version is published at:

- https://github.com/codout/documenso

A link to this repository is exposed inside the application at
**`/open-source`**.

## What this fork changes vs upstream

A complete, file-by-file log of customizations is kept in
[`CUSTOMIZATIONS.md`](./CUSTOMIZATIONS.md). At a high level:

- Visual rebrand to "Codout Sign" (logos, favicons, theme color, metadata)
- Default instance locale set to `pt-BR`
- Email templates updated for Codout Sign tone and footer
- Self-hosted feature defaults gated behind `NEXT_PUBLIC_CODOUT_BRANDED_BUILD`
  (preserves the original behaviour when the flag is off)
- Azure Container Apps deployment documentation
- GHCR build pipeline (`ghcr.io/codout/documenso-codout`)

What this fork **does not** change:

- Cryptographic signing pipeline (`packages/signing/`)
- Database schema and migrations (`packages/prisma/migrations/`)
- Authentication flows (`packages/auth/`)
- Audit log generation
- License verification client (only the default server URL is left intact;
  it can be overridden with `INTERNAL_OVERRIDE_LICENSE_SERVER_URL`)

## Trademarks

"Codout" and "Codout Sign" are trademarks of Codout. The AGPL grants
copyright permissions but does **not** grant trademark rights. If you fork
this repository, you must remove or replace the Codout marks in your own
distribution.

## Contact

Issues and pull requests for fork-specific behaviour: this repository.
Bugs that also affect upstream Documenso should be reported at
https://github.com/documenso/documenso/issues.
