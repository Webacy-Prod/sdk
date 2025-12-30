import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Webacy SDK',
  tagline: 'Blockchain security and trading analysis toolkit',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://sdk.webacy.com',
  baseUrl: '/',

  organizationName: 'Webacy-Prod',
  projectName: 'webacy-sdk',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // TypeDoc plugin disabled due to version compatibility issues
  // TODO: Re-enable when typedoc-plugin-markdown 4.x is compatible
  // plugins: [
  //   [
  //     'docusaurus-plugin-typedoc',
  //     {
  //       entryPoints: ['../packages/sdk/src/index.ts'],
  //       tsconfig: '../tsconfig.base.json',
  //       out: 'api',
  //     },
  //   ],
  // ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Webacy-Prod/webacy-sdk/tree/main/docs-site/',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/webacy-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Webacy SDK',
      logo: {
        alt: 'Webacy Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://www.npmjs.com/package/@webacy/sdk',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/Webacy-Prod/webacy-sdk',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started/installation',
            },
            {
              label: 'Trading Analysis',
              to: '/guides/trading/holder-analysis',
            },
            {
              label: 'Threat Analysis',
              to: '/guides/threat/address-risk',
            },
          ],
        },
        {
          title: 'Packages',
          items: [
            {
              label: '@webacy/sdk',
              href: 'https://www.npmjs.com/package/@webacy/sdk',
            },
            {
              label: '@webacy/sdk-trading',
              href: 'https://www.npmjs.com/package/@webacy/sdk-trading',
            },
            {
              label: '@webacy/sdk-threat',
              href: 'https://www.npmjs.com/package/@webacy/sdk-threat',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Webacy',
              href: 'https://webacy.com',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/Webacy-Prod/webacy-sdk',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Webacy. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
