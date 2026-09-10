// Carrier deep links, so a customer holding a tracking number can jump
// straight to the carrier's own page instead of copying it by hand.
//
// Kept in sync with the backend's getTrackingUrl() in email.service.ts —
// the shipping-confirmation email builds the same links, and the two must
// agree or the email and the site would point at different places.
const CARRIER_TRACKING_URLS: Record<string, (n: string) => string> = {
  ups: (n) => `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}`,
  usps: (n) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(n)}`,
  fedex: (n) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`,
  dhl: (n) => `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(n)}`,
  dhl_express: (n) => `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(n)}`,
  ontrac: (n) => `https://www.ontrac.com/trackres.asp?tracking_number=${encodeURIComponent(n)}`,
};

const CARRIER_LABELS: Record<string, string> = {
  ups: 'UPS',
  usps: 'USPS',
  fedex: 'FedEx',
  dhl: 'DHL',
  dhl_express: 'DHL Express',
  ontrac: 'OnTrac',
  other: 'Carrier',
};

/**
 * A link to the carrier's tracking page, or null when we can't build one.
 *
 * Returns null for 'other' — our own sentinel for a manually entered carrier
 * we don't model — rather than guessing a URL that would 404.
 */
export function carrierTrackingUrl(
  carrierCode: string | null | undefined,
  trackingNumber: string | null | undefined,
): string | null {
  if (!carrierCode || !trackingNumber) return null;
  const build = CARRIER_TRACKING_URLS[carrierCode.toLowerCase()];
  return build ? build(trackingNumber) : null;
}

/** Display name for a carrier code, falling back to the code itself. */
export function carrierLabel(carrierCode: string | null | undefined): string {
  if (!carrierCode) return 'Carrier';
  return CARRIER_LABELS[carrierCode.toLowerCase()] || carrierCode.toUpperCase();
}
