import { ArrowLink, Container, Eyebrow, SciButton } from '@/components/scientific/primitives';
import { HeroVideo } from '@/components/scientific/HeroVideo';

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
 * Below `md` the desktop backdrop is replaced by the phone composition from
 * Figma 33:353 (page "Scientific edition — complete duplicate" → 02 — Homepage
 * / Mobile): the same artwork, but oversized and anchored so it bleeds off the
 * left and bottom edges with only the molecule cluster in frame. See the block
 * near the end of this file for the offsets and where they come from.
 *
 * It previously rendered a rounded aspect-[4/3] crop stacked under the copy,
 * which is not what the mobile frame shows — that read as a photo card rather
 * than as the section's backdrop.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-r from-sci-deep to-[#0b3556]">
      {/* The film. `muted` + `playsInline` are what make autoplay legal on
          iOS and in Chrome; the file carries no audio track at all. */}
      <HeroVideo src="/scientific/hero-molecular.mp4" className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover motion-safe:md:block" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden motion-reduce:md:block"
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

      {/* The mobile frame top-aligns its copy (Hero copy at y=52 of an 800
          tall hero); centring it is what let the text drift down into the
          artwork as the copy got shorter at wider phone widths. Desktop keeps
          the centred composition it was built with. */}
      <Container className="relative flex min-h-[min(800px,205vw)] flex-col justify-start py-10 md:min-h-[650px] md:justify-center md:py-[88px]">
        <div className="flex max-w-[760px] flex-col gap-6">
          <Eyebrow tone="accent">Your next formula starts here</Eyebrow>

          <h1 className="font-sci-heading text-[40px] font-semibold leading-[48px] tracking-[-1.4px] text-white sm:text-[56px] sm:leading-[64px] sm:tracking-[-1px] lg:text-sci-hero">
            The right chemistry.
            <br />
            For what&rsquo;s next.
          </h1>

          <p className="font-sci-body text-sci-body text-white">
            Quality chemicals. Exceptional ingredients. As a result, we source the best for your formulations.
            <br />
            Above all, a partner who sees your potential.
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
            In particular, from a first formulation to full-scale production. In short, we support
            your journey from concept to market.
          </p>
        </div>

      </Container>

      {/* Mobile artwork (Figma 33:353, "Scientific edition — complete
          duplicate" → 02 — Homepage / Mobile).

          The design does NOT put a boxed image under the copy, which is what
          this used to render — a rounded aspect-[4/3] crop that read as a
          photo card and swamped the section. The artwork is a background:
          1100x550 on a 390x800 frame, anchored at x=-650 / y=430, so it bleeds
          off the left and bottom edges and only the molecule cluster shows.

          Sizes come from the frame, as a share of the artwork's own box so the
          caps below can't break the alignment:
            width  1100/390 = 282.05% of the section, capped at the frame's
                              own 1100px
            right  60/1100  =   5.45% of the artwork  (the frame crops the art
                              at x=1040 of 1100, i.e. 60px past the right edge)
            over   180/550  =  32.72% of the artwork  (the 980 - 800 bottom
                              overhang)

          Anchored from the RIGHT, not the left. Left-anchoring reproduces the
          frame at 390px too, but once the width cap bites it pins a fixed
          1100px of artwork to the left edge, so everything past 390px opens up
          dead navy on the right. Anchoring right keeps the molecule cluster
          where the frame puts it and reveals more of the artwork's left side
          as the viewport grows, which is also the direction the desktop
          composition goes. At 390px both give left = -650, the frame's value.

          The height cap matters too: the section caps at 800px, so without a
          matching cap the artwork outgrows it and the molecules climb over the
          body copy — which is what went wrong between 500px and 767px. Both
          cap at 390px, so from there up the artwork stays 1100x550 with its
          visible top at y=430 in an 800px section.

          The mask exists because the asset is a video with its background
          baked in, while the frame's artwork is transparent vector sitting on
          the hero's navy. Covering only the lower part of the section, the
          video's top edge would otherwise draw a hard horizontal seam across
          the copy. Fading its first quarter blends it into the gradient. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 w-[282.05%] max-w-[1100px] translate-x-[5.45%] translate-y-[32.72%] md:hidden"
      >
        <div className="relative aspect-[2/1] w-full [mask-image:linear-gradient(to_bottom,transparent_0%,#000_24%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_24%)]">
          <HeroVideo src="/scientific/hero-molecular.mp4" className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden" />

          {/* Reduced-motion fallback. The box is 2:1 like the desktop frame,
              so the layers keep their original percentage offsets. */}
          <div className="absolute inset-0 hidden motion-reduce:block">
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
        </div>
      </div>

    </section>
  );
}
