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
        // Storefront-only palette (references: warm cream + deep olive skincare
        // brand aesthetic). Kept separate from `brand` so the admin dashboard's
        // existing green identity is untouched.
        sand: {
          50: '#fbf9f4',
          100: '#f4eee1',
          200: '#eae0cb',
          300: '#ded0b2',
          400: '#c9b998',
        },
        olive: {
          50: '#f4f1e8',
          100: '#e3e6d3',
          300: '#a9b389',
          500: '#6f7f52',
          600: '#56653e',
          700: '#3e4a2e',
          800: '#313b25',
          950: '#1c2216',
        },
        ink: {
          DEFAULT: '#211d16',
          soft: '#6e6658',
        },
        // COCOJOJO "Scientific edition" design system, from the Figma file's
        // published variables (page 33:215). Namespaced under `sci` so it can
        // live alongside the existing sand/olive storefront palette while the
        // rebrand is rolled out page by page.
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
        display: ['var(--font-display)', 'serif'],
        storefront: ['var(--font-storefront)', 'sans-serif'],
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
