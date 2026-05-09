import { z } from 'zod';

import { IS_CODOUT_BRANDED_BUILD } from './app-branding';

export const SUPPORTED_LANGUAGE_CODES = ['de', 'en', 'fr', 'es', 'it', 'nl', 'pl', 'pt-BR', 'ja', 'ko', 'zh'] as const;

export type SupportedLanguageCodes = (typeof SUPPORTED_LANGUAGE_CODES)[number];

export const APP_I18N_OPTIONS = {
  supportedLangs: SUPPORTED_LANGUAGE_CODES,
  sourceLang: 'en',
  defaultLocale: 'en-US',
} as const;

/**
 * Runtime default language for users that do not have a stored cookie and
 * whose `accept-language` header has no supported match.
 *
 * On the Codout-branded build (`NEXT_PUBLIC_CODOUT_BRANDED_BUILD=true`)
 * this is `pt-BR`; otherwise it falls back to the upstream `sourceLang`
 * (`en`). `sourceLang` itself is unchanged because it is also the source
 * locale that Lingui extracts message keys from — touching it would
 * confuse the translation toolchain.
 */
export const getDefaultUserLang = (): SupportedLanguageCodes =>
  IS_CODOUT_BRANDED_BUILD() ? 'pt-BR' : APP_I18N_OPTIONS.sourceLang;

export const ZSupportedLanguageCodeSchema = z.enum(SUPPORTED_LANGUAGE_CODES).catch('en');
