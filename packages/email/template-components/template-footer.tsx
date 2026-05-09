import { Trans } from '@lingui/react/macro';

import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';
import {
  APP_NAME,
  APP_PUBLISHER,
  APP_SOURCE_REPO_URL,
  IS_CODOUT_BRANDED_BUILD,
} from '@documenso/lib/constants/app-branding';

import { Link, Section, Text } from '../components';
import { useBranding } from '../providers/branding';

export type TemplateFooterProps = {
  isDocument?: boolean;
};

export const TemplateFooter = ({ isDocument = true }: TemplateFooterProps) => {
  const branding = useBranding();

  const poweredByHref = IS_CODOUT_BRANDED_BUILD()
    ? APP_SOURCE_REPO_URL
    : 'https://documen.so/mail-footer';

  return (
    <Section>
      {isDocument && !branding.brandingHidePoweredBy && (
        <Text className="my-4 text-base text-slate-400">
          <Trans>
            This document was sent using{' '}
            <Link className="text-[#4F46E5]" href={poweredByHref}>
              {APP_NAME}
            </Link>
            .
          </Trans>
        </Text>
      )}

      {branding.brandingEnabled && branding.brandingCompanyDetails && (
        <Text className="my-8 text-slate-400 text-sm">
          {branding.brandingCompanyDetails.split('\n').map((line, idx) => {
            return (
              <>
                {idx > 0 && <br />}
                {line}
              </>
            );
          })}
        </Text>
      )}

      {!branding.brandingEnabled && IS_CODOUT_BRANDED_BUILD() && (
        <Text className="my-8 text-slate-400 text-sm">
          {APP_PUBLISHER}
          <br />
          <Link className="text-slate-400" href={NEXT_PUBLIC_WEBAPP_URL()}>
            {NEXT_PUBLIC_WEBAPP_URL()}
          </Link>
        </Text>
      )}

      {!branding.brandingEnabled && !IS_CODOUT_BRANDED_BUILD() && (
        <Text className="my-8 text-slate-400 text-sm">
          Documenso, Inc.
          <br />
          2261 Market Street, #5211, San Francisco, CA 94114, USA
        </Text>
      )}
    </Section>
  );
};

export default TemplateFooter;
