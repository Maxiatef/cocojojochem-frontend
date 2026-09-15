import Link from 'next/link';

/**
 * Shared building blocks for the COCOJOJO "Scientific edition" design.
 *
 * Every value here traces to a published Figma variable or text style (file
 * rj57PsDgSsbo86iG4RC1SA, page 33:215) and is expressed through the `sci-*`
 * Tailwind tokens rather than raw hex, so a change upstream is a change in one
 * place — tailwind.config.ts.
 *
 * The design is specified at a fixed 1440px desktop width. These components
 * translate that to a fluid layout: the 1312px content column becomes a
 * max-width container, and the three-across card rows become responsive grids
 * that stack on narrow screens.
 */

/** 1440px frame minus the 64px gutters the design uses on every section. */
export function Container({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-[1440px] px-6 md:px-16 ${className}`}>{children}</div>;
}

/** The small tracked caps label that opens most sections. */
export function Eyebrow({
  children,
  tone = 'blue',
}: {
  children: React.ReactNode;
  tone?: 'blue' | 'accent' | 'white';
}) {
  const color =
    tone === 'accent' ? 'text-sci-accent' : tone === 'white' ? 'text-white' : 'text-sci-blue';
  return (
    <p className={`font-sci-body text-sci-eyebrow font-medium uppercase ${color}`}>{children}</p>
  );
}

export function SectionHeading({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`font-sci-heading text-[32px] font-semibold leading-[40px] text-sci-navy md:text-sci-heading ${className}`}
    >
      {children}
    </h2>
  );
}

export function Lead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-sci-body text-sci-body text-sci-muted ${className}`}>{children}</p>
  );
}

type ButtonVariant = 'accent' | 'navy' | 'outline';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  // The design's "Button/Orange" — teal in this edition. Navy label, because
  // the accent is light enough that white text fails contrast against it.
  accent: 'bg-sci-accent text-sci-navy hover:brightness-95',
  navy: 'bg-sci-navy text-white hover:bg-sci-deep',
  outline: 'border border-sci-border bg-white text-sci-navy hover:bg-sci-pale',
};

export function SciButton({
  href,
  variant = 'accent',
  children,
  className = '',
}: {
  href: string;
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-md px-6 py-4 font-sci-body text-sci-label font-medium transition ${BUTTON_STYLES[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

/** A quieter inline call to action — "Explore ingredients →". */
export function ArrowLink({
  href,
  children,
  tone = 'blue',
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  tone?: 'blue' | 'navy' | 'white';
  className?: string;
}) {
  const color =
    tone === 'navy' ? 'text-sci-navy' : tone === 'white' ? 'text-white' : 'text-sci-blue';
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 font-sci-body text-sci-label font-medium ${color} ${className}`}
    >
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

/**
 * The numbered card used by both the product portfolio and the documentation
 * row — same component in Figma ("Ingredient category"), same component here.
 */
export function IndexCard({
  href,
  index,
  title,
  description,
}: {
  href: string;
  index: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[110px] items-center gap-4 rounded-xl border border-sci-border bg-white p-6 transition hover:border-sci-blue hover:shadow-sm"
    >
      <span className="w-10 shrink-0 font-sci-body text-sci-label font-medium text-sci-blue">
        {index}
      </span>
      <span className="flex min-w-0 flex-col gap-2">
        <span className="font-sci-body text-[17px] font-medium leading-6 text-sci-navy">
          {title}
        </span>
        <span className="font-sci-body text-sci-label font-medium text-sci-muted">
          {description}
        </span>
      </span>
    </Link>
  );
}
