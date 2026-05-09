import { i18n, type MessageDescriptor } from '@lingui/core';

import {
  APP_DESCRIPTION,
  APP_KEYWORDS,
  APP_NAME,
  APP_OG_TITLE,
  APP_PUBLISHER,
} from '@documenso/lib/constants/app-branding';
import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';

export const appMetaTags = (title?: MessageDescriptor) => {
  return [
    {
      title: title ? `${i18n._(title)} - ${APP_NAME}` : APP_NAME,
    },
    {
      name: 'description',
      content: APP_DESCRIPTION,
    },
    {
      name: 'keywords',
      content: APP_KEYWORDS,
    },
    {
      name: 'author',
      content: APP_PUBLISHER,
    },
    {
      name: 'robots',
      content: 'index, follow',
    },
    {
      property: 'og:title',
      content: APP_OG_TITLE,
    },
    {
      property: 'og:description',
      content: APP_DESCRIPTION,
    },
    {
      property: 'og:image',
      content: `${NEXT_PUBLIC_WEBAPP_URL()}/opengraph-image.jpg`,
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:description',
      content: APP_DESCRIPTION,
    },
    {
      name: 'twitter:image',
      content: `${NEXT_PUBLIC_WEBAPP_URL()}/opengraph-image.jpg`,
    },
  ];
};
