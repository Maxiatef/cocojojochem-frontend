import { ArrowLink, Container, Eyebrow, SciButton } from '@/components/scientific/primitives';

/**
 * "The right chemistry. For what's next." — Figma 33:236.
 *
 * The artwork is a 12-second silent film (1440x720 — the design frame's own
 * size), looping as the section background. Its left half is flat dark navy
 * and the molecules sit in the right third, which is why the copy can stay
 * where it is and still read cleanly over it.
 *
 * The four stacked SVG layers it replaced are still here, and still exported
 * from Figma rather than redrawn. They are the `prefers-reduced-motion`
 * fallback: perpetual motion behind a page is exactly what that setting is
 * for, so anyone who asks for stillness gets the static composition instead of
 * nothing. The `motion-reduce:` / `motion-safe:` pairs below are what switch
 * between them, with no JavaScript involved.
 *
 * Layer positions are the design's own pixel offsets against its 1440x720
 * frame, expressed as percentages so the composition holds as the viewport
 * changes.
 *
 * Below `lg` the backdrop is dropped — at phone widths the molecules would sit
 * behind the headline and cost legibility for decoration — and the artwork is
 * re-laid as a block underneath the copy, which is where the mobile design
 * puts it (Figma 8:219). The film is cropped to its right side there, since a
 * 2:1 frame shown whole on a phone would be mostly empty navy.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-r from-sci-deep to-[#0b3556]">
      {/* The film. `muted` + `playsInline` are what make autoplay legal on
          iOS and in Chrome; the file carries no audio track at all. */}
      <video
        aria-hidden
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover motion-safe:lg:block"
      >
        <source src="/scientific/hero-molecular.mp4" type="video/mp4" />
      </video>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden motion-reduce:lg:block"
      >
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

      <Container className="relative flex min-h-[520px] flex-col justify-center py-10 md:min-h-[650px] md:py-[88px]">
        <div className="flex max-w-[760px] flex-col gap-6">
          <Eyebrow tone="accent">Your next formula starts here</Eyebrow>

          <h1 className="font-sci-heading text-[40px] font-semibold leading-[48px] tracking-[-1.4px] text-white sm:text-[56px] sm:leading-[64px] sm:tracking-[-1px] lg:text-sci-hero">
            The right chemistry.
            <br />
            For what&rsquo;s next.
          </h1>

          <p className="font-sci-body text-sci-body text-white">
            Quality chemicals. Exceptional ingredients.
            <br />
            A partner who sees your potential.
          </p>

          {/* Stacked on mobile, as the design has them — side by side they
              leave the text link hanging off the button's baseline at 342px. */}
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
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

        {/* Mobile artwork — the same layers, re-anchored to the orbit's own
            box so the cluster is self-contained instead of bleeding off the
            right edge the way the desktop backdrop deliberately does. */}
        {/* Cropped to the right of the frame, where the molecules are. */}
        <video
          aria-hidden
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="mt-10 hidden aspect-[4/3] w-full rounded-xl object-cover object-[78%_50%] motion-safe:block lg:motion-safe:hidden"
        >
          <source src="/scientific/hero-molecular.mp4" type="video/mp4" />
        </video>

        <div
          aria-hidden
          className="relative mt-10 hidden aspect-[918/871] w-full overflow-hidden motion-reduce:block lg:motion-reduce:hidden"
        >
          <img
            src="/scientific/hero-teal-glow.svg"
            alt=""
            className="absolute left-[24.3%] top-[12.6%] w-[60%] max-w-none opacity-90"
          />
          <img
            src="/scientific/hero-orbit-1.svg"
            alt=""
            className="absolute inset-0 h-full w-full max-w-none"
          />
          <img
            src="/scientific/hero-orbit-2.svg"
            alt=""
            className="absolute left-[11.4%] top-[18.6%] h-[59%] w-[61.4%] max-w-none"
          />
          <img
            src="/scientific/hero-molecule-distant.svg"
            alt=""
            className="absolute left-[2.9%] top-[64.2%] w-[37.1%] max-w-none"
          />
          <img
            src="/scientific/hero-molecule-front.svg"
            alt=""
            className="absolute left-[14.4%] top-[22.4%] w-[67.2%] max-w-none"
          />
        </div>
      </Container>
    </section>
  );
}
