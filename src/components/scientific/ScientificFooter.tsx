import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/scientific/primitives';

/** COCOJOJO "Scientific edition" footer (Figma 33:322). */

const COLUMNS = [
  {
    heading: 'Explore',
    links: [
      { label: 'All ingredients', href: '/products' },
      { label: 'Industries', href: '/functions' },
      { label: 'Solutions & services', href: '/about' },
      { label: 'Technical resources', href: '/a-z' },
    ],
  },
  {
    heading: 'Connect',
    links: [
      { label: 'Our company', href: '/about' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Request a quote', href: '/quote-request' },
    ],
  },
];

export function ScientificFooter() {
  return (
    <footer className="bg-sci-deep text-white">
      <Container className="flex flex-col gap-10 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-6">
            <Link href="/" aria-label="COCOJOJO Chemical — home" className="w-fit">
              {/* Rendered as a solid white silhouette: the artwork is dark
                  navy, which on this near-black footer is all but invisible.
                  `brightness-0` crushes every colour to black, `invert` flips
                  that to white — transparency is untouched, so only the mark
                  itself is recoloured. */}
              <Image
                src="/brand/cocojojo-logo.png"
                alt="COCOJOJO Chemical"
                width={991}
                height={396}
                sizes="180px"
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="font-sci-body text-sci-body">
              The right chemistry.
              <br />
              For what&rsquo;s next.
            </p>
            <p className="font-sci-body text-sci-body">California, United States</p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading} className="flex flex-col gap-5">
              <p className="font-sci-body text-sci-eyebrow font-medium">{column.heading}</p>
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-sci-body text-sci-body hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <a
          href="https://cocojojo.com/wholesale"
          target="_blank"
          rel="noopener noreferrer"
          className="font-sci-body text-sci-label font-medium hover:underline"
        >
          Visit the official COCOJOJO wholesale website ↗
        </a>

        <p className="font-sci-body text-sci-eyebrow font-medium">
          © {new Date().getFullYear()} COCOJOJO. Chemicals &amp; ingredients.
        </p>
      </Container>
    </footer>
  );
}
