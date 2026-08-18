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
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        storefront: ['var(--font-storefront)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
