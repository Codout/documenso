import { Trans } from '@lingui/react/macro';
import { Link } from 'react-router';

import {
  APP_NAME,
  APP_SOURCE_REPO_URL,
  UPSTREAM_PROJECT_NAME,
  UPSTREAM_REPO_URL,
} from '@documenso/lib/constants/app-branding';
import { Button } from '@documenso/ui/primitives/button';

import { appMetaTags } from '~/utils/meta';

export const meta = () => appMetaTags();

export default function OpenSourcePage() {
  return (
    <div>
      <article className="prose dark:prose-invert">
        <h1>
          <Trans>Open Source</Trans>
        </h1>

        <p>
          <Trans>
            {APP_NAME} is built on top of {UPSTREAM_PROJECT_NAME}, an open
            source document signing platform licensed under the GNU Affero
            General Public License v3.0 (AGPL-3.0).
          </Trans>
        </p>

        <p>
          <Trans>
            Because {APP_NAME} is operated as a network service, the AGPL
            requires that the source code of the version you are interacting
            with is made available to you. The corresponding source for this
            instance is published publicly:
          </Trans>
        </p>

        <ul>
          <li>
            <strong>
              <Trans>This fork (running on this server):</Trans>
            </strong>{' '}
            <a href={APP_SOURCE_REPO_URL} target="_blank" rel="noreferrer">
              {APP_SOURCE_REPO_URL}
            </a>
          </li>
          <li>
            <strong>
              <Trans>Upstream project:</Trans>
            </strong>{' '}
            <a href={UPSTREAM_REPO_URL} target="_blank" rel="noreferrer">
              {UPSTREAM_REPO_URL}
            </a>
          </li>
        </ul>

        <h2>
          <Trans>License</Trans>
        </h2>
        <p>
          <Trans>
            The full text of the AGPL-3.0 license is available in the{' '}
            <a
              href={`${APP_SOURCE_REPO_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noreferrer"
            >
              LICENSE
            </a>{' '}
            file of the source repository.
          </Trans>
        </p>

        <h2>
          <Trans>Trademarks</Trans>
        </h2>
        <p>
          <Trans>
            "{UPSTREAM_PROJECT_NAME}" is a trademark of its respective owner
            and is referenced here for attribution only. {APP_NAME} is a
            product of Codout and is not affiliated with or endorsed by the
            upstream project.
          </Trans>
        </p>
      </article>

      <div className="mt-8">
        <Button asChild>
          <Link to="/">
            <Trans>Back home</Trans>
          </Link>
        </Button>
      </div>
    </div>
  );
}
