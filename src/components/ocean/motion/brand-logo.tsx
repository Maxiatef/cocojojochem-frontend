import type { ImgHTMLAttributes } from "react";

/** One supplied identity shared by static, scroll and cinematic placements. */
export default function BrandLogo({
  className = "",
  decorative = false,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { decorative?: boolean }) {
  return (
    <img
      {...props}
      className={`cj-brand ${className}`}
      src="/assets/cocojojo-logo.png"
      srcSet="/assets/cocojojo-logo-860.png 860w, /assets/cocojojo-logo.png 1722w"
      sizes="(max-width: 860px) 100vw, 860px"
      width={1722}
      height={709}
      alt={decorative ? "" : "COCOJOJO Chemical. The Science of CHANGE."}
      draggable={false}
    />
  );
}
