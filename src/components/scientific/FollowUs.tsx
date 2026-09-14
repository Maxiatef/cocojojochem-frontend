import {
  FacebookIcon,
  InstagramIcon,
  PinterestIcon,
  TikTokIcon,
  TwitterIcon,
} from '@/components/icons';

/**
 * The "Follow Us" card, carried across from the COCOJOJO retail site's
 * contact page (`cocojojo.com/wholesale/contact-us`) and restyled to the
 * Scientific edition.
 *
 * The accounts are the company's real ones, so the URLs are copied verbatim
 * from that source rather than reconstructed from the handles — two of them
 * carry campaign query strings that are load-bearing for their analytics.
 */

const SOCIALS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/CocojojoOrganic',
    icon: FacebookIcon,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/cocojojoorganic/',
    icon: InstagramIcon,
  },
  {
    label: 'Pinterest',
    href: 'https://www.pinterest.com/cocojojoorganic/?redirect_mongo_id=642da4d04bf58a095493cb87&utm_source=Springbot&utm_medium=Email&utm_campaign=642da4d04bf58a095493cb88',
    icon: PinterestIcon,
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@cocojojo_official',
    icon: TikTokIcon,
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com/cocojojollc?s=21&t=EQG7cTFi_ZPtXescvxZoTg',
    icon: TwitterIcon,
  },
];

export function FollowUs({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-4 border border-sci-border bg-white p-6 ${className}`}>
      <h3 className="font-sci-heading text-[17px] font-semibold leading-6 text-sci-navy">
        Follow Us
      </h3>

      {/* A list, not a row of loose links: these are five items of the same
          kind, and a screen reader should be told how many before reading
          them. `gap-3` with `flex-wrap` keeps all five on one line at 320px. */}
      <ul className="flex flex-wrap gap-3">
        {SOCIALS.map((social) => (
          <li key={social.label}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${social.label} — opens in a new tab`}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-sci-pale text-sci-blue transition hover:bg-sci-blue hover:text-white"
            >
              <social.icon className="h-[18px] w-[18px]" />
            </a>
          </li>
        ))}
      </ul>

      <p className="font-sci-body text-sci-label text-sci-muted">
        Stay updated with our latest products, tips, and exclusive offers!
      </p>
    </div>
  );
}
