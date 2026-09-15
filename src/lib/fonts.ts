import localFont from 'next/font/local';

/**
 * The "Scientific edition" typefaces, shared by every route group that uses
 * the design system.
 *
 * These used to be declared inline in `(scientific)/layout.tsx`. They moved
 * here when the admin dashboard was rebranded: `/admin` is its own top-level
 * route, outside that group, so it had no access to the `--font-sci-*`
 * variables and would have fallen back to system-ui. Declaring them twice
 * would have produced two `@font-face` families for the same file.
 *
 * Both faces are variable fonts — one file each, covering every weight the
 * design uses (Manrope ExtraBold 800 for the wordmark down to DM Sans Regular
 * 400 for body copy).
 */

export const sciHeading = localFont({
  src: '../fonts/Manrope-Variable.ttf',
  weight: '200 800',
  variable: '--font-sci-heading',
  display: 'swap',
});

export const sciBody = localFont({
  src: '../fonts/DMSans-Variable.ttf',
  weight: '100 900',
  variable: '--font-sci-body',
  display: 'swap',
});

/** Drop onto a root element to expose both font variables to its subtree. */
export const SCI_FONT_VARS = `${sciHeading.variable} ${sciBody.variable}`;
