import { env } from '@documenso/lib/utils/env';

/**
 * Single source of truth for the user-facing brand identity.
 *
 * Everything is derived from a small set of env vars so that the binary can be
 * built once and reused: an upstream-equivalent build leaves
 * `NEXT_PUBLIC_CODOUT_BRANDED_BUILD` unset and gets the original Documenso
 * defaults; a Codout build sets it to `"true"` and gets the Codout Sign
 * branding. Individual values can still be overridden per environment via
 * `NEXT_PUBLIC_APP_NAME` and friends.
 *
 * Do NOT import this module from `packages/signing` or any cryptographic
 * pipeline — branding strings have no business near signature generation.
 */

export const IS_CODOUT_BRANDED_BUILD = (): boolean =>
  env('NEXT_PUBLIC_CODOUT_BRANDED_BUILD') === 'true';

const upstreamDefaults = {
  appName: 'Documenso',
  publisher: 'Documenso, Inc.',
  ogTitle: 'Documenso - The Open Source DocuSign Alternative',
  description:
    'Join Documenso, the open signing infrastructure, and get a 10x better signing experience. Sign in now and enjoy a faster, smarter, and more beautiful document signing process.',
  keywords:
    'Documenso, open source, DocuSign alternative, document signing, open signing infrastructure, open-source community, fast signing, beautiful signing, smart templates',
  sourceRepoUrl: 'https://github.com/documenso/documenso',
  supportEmail: 'support@documenso.com',
};

const codoutDefaults = {
  appName: 'Codout Sign',
  publisher: 'Codout',
  ogTitle: 'Codout Sign — Assinatura digital de documentos',
  description:
    'Codout Sign é a plataforma de assinatura digital de documentos da Codout. Envie, assine e armazene contratos com segurança, auditoria e validade jurídica.',
  keywords:
    'Codout Sign, Codout, assinatura digital, assinatura eletrônica, contratos, documentos, document signing, AGPL, open source',
  sourceRepoUrl: 'https://github.com/codout/documenso',
  supportEmail: 'suporte@codout.com',
};

const defaults = (): typeof upstreamDefaults =>
  IS_CODOUT_BRANDED_BUILD() ? codoutDefaults : upstreamDefaults;

const get = (envKey: string, fallback: string): string => {
  const value = env(envKey);

  return value && value.trim().length > 0 ? value : fallback;
};

export const APP_NAME = get('NEXT_PUBLIC_APP_NAME', defaults().appName);
export const APP_PUBLISHER = get('NEXT_PUBLIC_APP_PUBLISHER', defaults().publisher);
export const APP_OG_TITLE = get('NEXT_PUBLIC_APP_OG_TITLE', defaults().ogTitle);
export const APP_DESCRIPTION = get('NEXT_PUBLIC_APP_DESCRIPTION', defaults().description);
export const APP_KEYWORDS = get('NEXT_PUBLIC_APP_KEYWORDS', defaults().keywords);
export const APP_SOURCE_REPO_URL = get('NEXT_PUBLIC_SOURCE_REPO_URL', defaults().sourceRepoUrl);
export const APP_SUPPORT_EMAIL = get('NEXT_PUBLIC_SUPPORT_EMAIL', defaults().supportEmail);

export const UPSTREAM_PROJECT_NAME = 'Documenso';
export const UPSTREAM_REPO_URL = 'https://github.com/documenso/documenso';
