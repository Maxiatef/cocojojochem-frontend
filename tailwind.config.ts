import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9f0',
          100: '#dcf1dc',
          200: '#b9e3ba',
          300: '#8ccd8f',
          400: '#5cb161',
          500: '#3a9640',
          600: '#2b7a30',
          700: '#246229',
          800: '#204e25',
          900: '#1b4120',
        },
        // COCOJOJO "Scientific edition" design system, from the Figma file's
        // published variables (page 33:215). The only storefront palette —
        // the previous sand/olive design was removed once the rebrand covered
        // every page. Still namespaced under `sci` because the admin keeps its
        // own `brand` green.
        //
        // NOTE ON `accent`: this is `--orange` in Figma. The Scientific edition
        // re-skinned the value to teal (#53e0d0) without renaming the variable,
        // so the Figma name is actively misleading. Named by ROLE here — if the
        // variable is ever renamed upstream the value still maps cleanly.
        sci: {
          navy: '#0b2945',
          deep: '#051c30',
          blue: '#1465bb',
          accent: '#53e0d0',
          pale: '#f1f7fb',
          muted: '#536b7e',
          border: '#d7e5f0',
        },
      },
      fontFamily: {
        // Scientific edition: Manrope for headings and the wordmark, DM Sans
        // for body copy, navigation, forms and labels.
        'sci-heading': ['var(--font-sci-heading)', 'system-ui', 'sans-serif'],
        'sci-body': ['var(--font-sci-body)', 'system-ui', 'sans-serif'],
      },
      // The Figma text styles, so a section can say `text-sci-heading` instead
      // of restating a size/leading pair that then drifts from the design.
      fontSize: {
        'sci-eyebrow': ['11px', { lineHeight: '16px', letterSpacing: '1.6px' }],
        'sci-label': ['14px', { lineHeight: '20px' }],
        'sci-body': ['16px', { lineHeight: '26px' }],
        'sci-subheading': ['26px', { lineHeight: '34px' }],
        'sci-heading': ['42px', { lineHeight: '51px' }],
        'sci-display': ['52px', { lineHeight: '60px' }],
        'sci-hero': ['72px', { lineHeight: '82px', letterSpacing: '-2.16px' }],
      },
    },
  },
  plugins: [],
};

export default config;
