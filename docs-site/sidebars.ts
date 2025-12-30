import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/authentication',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      collapsed: false,
      items: [
        'guides/default-chain',
        'guides/error-handling',
        'guides/debugging',
      ],
    },
    {
      type: 'category',
      label: 'Trading Analysis',
      collapsed: false,
      items: [
        'guides/trading/holder-analysis',
        'guides/trading/trading-lite',
      ],
    },
    {
      type: 'category',
      label: 'Threat Analysis',
      collapsed: false,
      items: [
        'guides/threat/address-risk',
        'guides/threat/sanctions',
        'guides/threat/contract-analysis',
      ],
    },
  ],
};

export default sidebars;
