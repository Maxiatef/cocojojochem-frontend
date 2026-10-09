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
      src="/assets/cocojojo-logo-074856.svg"
      width={1722}
      height={709}
      alt={decorative ? "" : "COCOJOJO Chemical. The Science of CHANGE."}
      draggable={false}
    />
  );
}
