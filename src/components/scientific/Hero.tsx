import { ArrowLink, Container, Eyebrow, SciButton } from '@/components/scientific/primitives';

/**
 * "The right chemistry. For what's next." — Figma 33:236.
 *
 * The artwork is four stacked SVG layers over a navy gradient: a diffuse teal
 * glow, the orbit lines, and two glass molecules at different depths. They are
 * exported from Figma rather than redrawn — the vector data is the design.
 *
 * Positions are the design's own pixel offsets against its 1440x720 frame,
 * expressed as percentages so the composition holds as the viewport changes.
 * The whole layer is hidden below `lg`: at phone widths the molecules would sit
 * behind the headline and cost legibility for decoration.
 *
 * The Figma frame marks these layers as animated. Motion is deliberately not
 * implemented yet — see `get_motion_context` on node 37:428 for the keyframe
 * data when we add it.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-r from-sci-deep to-[#0b3556]">
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
        <img
          src="/scientific/hero-teal-glow.svg"
          alt=""
          className="absolute left-[61%] top-0 w-[42%] max-w-none opacity-90"
        />
        <img
          src="/scientific/hero-orbit-1.svg"
          alt=""
          className="absolute left-[44%] top-[-17%] h-[134%] w-[70%] max-w-none"
        />
        <img
          src="/scientific/hero-orbit-2.svg"
          alt=""
          className="absolute left-[52%] top-[8%] h-[79%] w-[43%] max-w-none"
        />
        <img
          src="/scientific/hero-molecule-distant.svg"
          alt=""
          className="absolute left-[46%] top-[69%] w-[26%] max-w-none"
        />
        <img
          src="/scientific/hero-molecule-front.svg"
          alt=""
          className="absolute left-[54%] top-[13%] w-[47%] max-w-none"
        />
      </div>

      <Container className="relative flex min-h-[650px] flex-col justify-center py-20 md:py-[88px]">
        <div className="flex max-w-[760px] flex-col gap-6">
          <Eyebrow tone="accent">Your next formula starts here</Eyebrow>

          <h1 className="font-sci-heading text-[44px] font-semibold leading-[52px] tracking-[-1px] text-white sm:text-[56px] sm:leading-[64px] lg:text-sci-hero">
            The right chemistry.
            <br />
            For what&rsquo;s next.
          </h1>

          <p className="font-sci-body text-sci-body text-white">
            Quality chemicals. Exceptional ingredients.
            <br />
            A partner who sees your potential.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <SciButton href="/products" variant="accent">
              Explore our products →
            </SciButton>
            <ArrowLink href="/about" tone="white">
              Discover our solutions
            </ArrowLink>
          </div>

          <p className="font-sci-body text-sci-label font-medium text-[#adc6d8]">
            From a first formulation to full-scale production.
          </p>
        </div>
      </Container>
    </section>
  );
}
