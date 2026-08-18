import Link from 'next/link';
import { NewsletterForm } from '@/components/storefront/NewsletterForm';
import { Reveal } from '@/components/storefront/Reveal';
import { ArrowRightIcon, FlaskIcon, LeafIcon, MailIcon, ShieldCheckIcon } from '@/components/icons';

export const metadata = {
  title: 'About Us — CocoJojoChem Wholesale',
  description: 'Wholesale cosmetic ingredient sourcing built for formulators, brands, and manufacturers.',
};

const STATS = [
  { value: '41', label: 'Ingredient Categories' },
  { value: '94', label: 'Functional Classifications' },
  { value: '5', label: 'Certification Standards' },
  { value: 'GMP', label: 'Aligned Sourcing' },
];

const STORY_POINTS = [
  'Wholesale raw material and bulk ingredient sourcing',
  'Real INCI documentation, specs, and safety data where available',
  'Skincare, hair care, and body care actives, oils, butters, and extracts',
  'Transparent bulk pricing across gallon and kilogram tiers',
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-sand-100 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">About Us</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
            Wholesale ingredients, <span className="italic text-olive-700">built on access.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-soft">
            CocoJojoChem exists to give formulators, brands, and manufacturers direct access to
            the raw materials they need — with transparent pricing, real documentation, and no
            minimum-order gatekeeping.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-px overflow-hidden bg-sand-200 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white px-4 py-8 text-center">
              <p className="font-display text-3xl text-olive-700">{s.value}</p>
              <p className="mt-1 text-xs text-ink-soft">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Our Story</p>
            <h2 className="mt-2 font-display text-3xl text-ink">
              Direct access to the sourcing that formulators actually need.
            </h2>
            <ul className="mt-6 space-y-3">
              {STORY_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-ink-soft">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive-600" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={80} className="space-y-5 text-sm leading-relaxed text-ink-soft">
            <p>
              CocoJojoChem was built around a simple idea: brands, labs, and independent
              formulators shouldn't have to choose between quality and access. Bulk ingredient
              sourcing has traditionally favored large accounts with deep purchasing power — we
              built our catalog to work at wholesale scale without shutting out smaller orders.
            </p>
            <p>
              Every ingredient in our catalog is organized by real chemical category and
              functional role, so you can find exactly what a formulation calls for — whether
              that's a specific INCI name, a CAS number, or a function like humectant or
              emulsifier — rather than digging through generic product listings.
            </p>
            <p>
              We price transparently across bulk size tiers, keep documentation attached to the
              ingredients that need it, and treat every order — large or small — as a chance to
              earn a long-term supply relationship, not a one-time transaction.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-sand-200 bg-sand-100 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 sm:grid-cols-3 sm:px-6">
          {[
            { icon: LeafIcon, title: 'Sourced With Intention', body: 'Ingredients chosen for purity and traceability, not just cost.' },
            { icon: ShieldCheckIcon, title: 'Documented, Not Guessed', body: 'SDS and COA paperwork accompanies the ingredients that need it.' },
            { icon: FlaskIcon, title: 'Formulator-Grade', body: 'Consistent, INCI-accurate ingredients, order after order.' },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div className="bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center bg-sand-100 text-olive-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg text-ink">{item.title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Work With Us</p>
        <h2 className="mt-2 font-display text-3xl text-ink">
          Explore products, ingredients, and sourcing support.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 bg-olive-800 px-6 py-3 text-sm font-medium text-white transition hover:bg-olive-700"
          >
            Shop Products
            <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/contact"
            className="border-b border-ink pb-0.5 text-sm font-medium text-ink transition hover:border-olive-700 hover:text-olive-700"
          >
            Contact Our Team
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden bg-olive-950 py-20" style={{ backgroundColor: '#1c2216' }}>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5">
            <MailIcon className="h-5 w-5 text-olive-300" />
          </div>
          <h2 className="mt-6 font-display text-4xl text-white">
            Wholesale <span className="italic text-olive-300">Updates</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-sand-100/60">
            Restock alerts, bulk supply notes, and manufacturing updates — straight to your inbox.
          </p>
          <div className="mt-8 flex justify-center">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
