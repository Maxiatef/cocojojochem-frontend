import services from '@/lib/ocean/data/service-data.json';

/** One service pathway from the reference's service-data.json. */
export type Service = {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  image: string;
  group: string;
  offerings: string[];
  steps: string[][];
  include: string[];
  sources?: { title: string; url: string }[];
};

/** Every service, in the reference's order (reference support-pages.tsx `serviceLinks`). */
export const serviceLinks: Service[] = Object.entries(services).map(([slug, s]) => ({ slug, ...(s as Omit<Service, 'slug'>) }));

export const findService = (slug: string) => serviceLinks.find((s) => s.slug === slug);

/** The project-inquiry link a service page's CTAs go to (our /contact form). */
export const serviceInquiryHref = (s: Service) =>
  '/contact?subject=' + encodeURIComponent(s.title + ' project inquiry');
