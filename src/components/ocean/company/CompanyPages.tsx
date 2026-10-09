/* eslint-disable @next/next/no-img-element */
import { ArrowUpRight, FileText, FlaskConical, Package } from 'lucide-react';
import BrandLogo from '@/components/ocean/motion/brand-logo';
import { HomeMotion } from '@/components/ocean/motion/home-motion';
import CompanyMotion from '@/components/ocean/motion/company-motion';
import type { Testimonial } from '@/lib/types';
import { serviceInquiryHref, serviceLinks, type Service } from './services';

/**
 * The ocean design's company pages (reference company-pages.tsx and the
 * ServicePage of support-pages.tsx), markup unchanged: the animated
 * /services card deck, the /about story and each /services/<slug> page.
 * The shell supplies the cinematic intro, the e-company-shell wrapper and
 * (on /services) the ServicesFinale. Service CTAs go to our /contact form.
 */

function MolecularDrift() {
  return (
    <div className="e-molecular-drift" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div className={'e-drift-piece e-drift-piece-' + i} key={i}>
          <img src="/assets/footer-blue-molecules.webp" alt="" width={420} height={270} loading="lazy" />
        </div>
      ))}
    </div>
  );
}

function Hero({ about = false }: { about?: boolean }) {
  return (
    <section data-e-live className={'e-hero ' + (about ? 'e-hero-about' : 'e-hero-services')}>
      <MolecularDrift />
      <div className="e-hero-grid r-wrap">
        <div className="e-hero-copy">
          <span className="e-kicker">{about ? 'About COCOJOJO' : 'From concept to scale'}</span>
          <h1>
            {about ? (
              <>
                <span>Curiosity,</span>
                <span>meet</span>
                <span className="e-ink-blue">chemistry.</span>
              </>
            ) : (
              <>
                <span>Expertise</span>
                <span>for your</span>
                <span className="e-ink-blue">next step.</span>
              </>
            )}
          </h1>
          <p>
            {about
              ? 'Connecting ingredients, formulation ideas and the people who turn them into products.'
              : 'From custom formulation and blending to private label, packaging and testing. Find the next step for your project.'}
          </p>
          <a className="e-pill" href={about ? '#our-story' : '#our-services'}>
            {about ? 'Explore our story' : 'Explore our services'}
          </a>
        </div>
        <div className="e-hero-scene" aria-hidden="true">
          <div className="e-orbit-lines">
            <i />
            <i />
            <i />
          </div>
          <span className="e-scene-word">{about ? 'CHEMISTRY' : 'POSSIBILITY'}</span>
          <div className="e-hero-object">
            <img
              src={about ? '/assets/footer-blue-molecules.webp' : '/assets/services-sculpture.webp'}
              alt=""
              width={about ? 1564 : 1536}
              height={about ? 1006 : 1024}
              {...({ fetchpriority: 'high' } as object)}
            />
          </div>
          <div className="e-glass-label">
            <span>
              <BrandLogo decorative />
            </span>
            <span>{about ? 'Nature. Science. Possibility.' : 'Source. Formulate. Create.'}</span>
          </div>
        </div>
      </div>
      <div className="e-hero-bottom r-wrap">
        <span>{about ? 'Our story' : 'Our services'}</span>
        <div />
        <a href={about ? '#our-story' : '#our-services'}>Scroll to explore</a>
      </div>
    </section>
  );
}

function TypeRibbon({ about = false }: { about?: boolean }) {
  const phrase = about ? 'Curiosity meets chemistry.' : 'From concept to scale.';
  return (
    <div className="e-type-ribbon" data-e-live aria-hidden="true">
      <div className="e-ribbon-scroll">
        <div className="e-ribbon-loop">
          {[0, 1].map((i) => (
            <div className="e-ribbon-group" key={i}>
              <span>{phrase}</span>
              <span className="e-ribbon-star">✳</span>
              <span className="e-ribbon-outline">{phrase}</span>
              <span className="e-ribbon-star">✳</span>
            </div>
          ))}
        </div>
      </div>
      <div className="e-ribbon-sub">
        <div>
          {[0, 1].map((i) => (
            <span key={i}>
              {about
                ? 'NATURE · SCIENCE · POSSIBILITY · NATURE · SCIENCE · POSSIBILITY ·'
                : 'SOURCE · FORMULATE · CREATE · SOURCE · FORMULATE · CREATE ·'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const featuredServices = ['formulation', 'private-label', 'custom-blending', 'testing-analysis']
  .map((slug) => serviceLinks.find((s) => s.slug === slug))
  .filter((s): s is Service => Boolean(s));
const serviceGroups = Array.from(new Set(serviceLinks.map((s) => s.group)));
const groupId = (group: string) => 'services-' + group.toLowerCase().replace(/[^a-z]+/g, '-');

export function ServicesExperience() {
  return (
    <>
      <HomeMotion />
      <div className="e-company e-services">
        <CompanyMotion key="services" />
        <Hero />
        <nav className="e-service-nav r-wrap" aria-label="Explore our services">
          {featuredServices.map((s, i) => (
            <a href={'#service-' + s.slug} key={s.slug}>
              <span>0{i + 1}</span>
              {s.title}
            </a>
          ))}
        </nav>
        <div className="svc-all-link r-wrap">
          <a className="r-text-link" href="#all-services">
            Browse all {serviceLinks.length} services <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
        <TypeRibbon />
        <section
          className="e-services-collection e-slide-deck r-wrap"
          data-e-deck
          id="our-services"
          aria-label="Our services"
        >
          <div className="e-deck-pin">
            <div className="e-deck-meta" aria-hidden="true">
              <span>Explore our expertise</span>
              <span className="e-deck-counter">01 / {String(featuredServices.length).padStart(2, '0')}</span>
            </div>
            <div className="e-deck-viewport">
              <div className="e-deck-track">
                {featuredServices.map((s, i) => (
                  <article
                    data-e-reveal
                    tabIndex={-1}
                    className={'e-service-card e-service-card-' + i}
                    id={'service-' + s.slug}
                    key={s.slug}
                  >
                    <div className="e-service-body" data-e-tilt>
                      <div className="e-service-photo" data-e-parallax>
                        <img
                          src={'/assets/ingredients/' + s.image + '.webp'}
                          alt={s.title + ' representative cosmetic ingredient texture'}
                          width={660}
                          height={680}
                          loading="lazy"
                        />
                        <span className="e-service-number">0{i + 1}</span>
                        <span className="e-photo-caption">{s.eyebrow}</span>
                      </div>
                      <div className="e-service-copy">
                        <span className="e-kicker">
                          <BrandLogo /> <span>0{i + 1}</span>
                        </span>
                        <h2>{s.title}</h2>
                        <p>{s.intro}</p>
                        <a className="e-pill" href={'/services/' + s.slug}>
                          Explore service
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="e-deck-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        </section>
        <section className="r-wrap svc-directory" id="all-services" aria-labelledby="svc-heading">
          <div className="svc-directory-head">
            <div>
              <span className="e-kicker">Every stage, connected</span>
              <h2 id="svc-heading">
                What comes next
                <br />
                for your product?
              </h2>
            </div>
            <p>
              Explore {serviceLinks.length} service pathways, from your first ingredient question to a production and
              supply plan. Start with the area you need, then share your project brief.
            </p>
          </div>
          <nav className="svc-jump" aria-label="Service groups">
            {serviceGroups.map((group) => (
              <a href={'#' + groupId(group)} key={group}>
                {group}
              </a>
            ))}
          </nav>
          {serviceGroups.map((group) => (
            <section className="svc-group" key={group} id={groupId(group)} aria-label={group}>
              <h3>
                {group}
                <span>{String(serviceLinks.filter((s) => s.group === group).length).padStart(2, '0')} services</span>
              </h3>
              <div className="r-services-grid">
                {serviceLinks
                  .filter((s) => s.group === group)
                  .map((s) => (
                    <a href={'/services/' + s.slug} key={s.slug}>
                      <ArrowUpRight size={21} aria-hidden="true" />
                      <h4>{s.title}</h4>
                      <p>{s.intro}</p>
                      <span>Explore service</span>
                    </a>
                  ))}
              </div>
            </section>
          ))}
          <div className="svc-scope">
            Every project starts with a scope review. Availability, delivery arrangements, specialist partners, testing
            requirements and commercial terms are confirmed before work begins. Private label and manufacturing projects
            are subject to our{' '}
            <a href="/legal/wholesale-b2b-private-label-custom-manufacturing-terms">
              Wholesale, B2B, Private Label and Custom Manufacturing Terms
            </a>
            .
          </div>
        </section>
      </div>
    </>
  );
}

const values = [
  {
    Icon: FileText,
    title: 'Details you can trace.',
    copy: 'Review published sources and request documentation for the exact material you buy.',
  },
  {
    Icon: FlaskConical,
    title: 'Room to create.',
    copy: 'Explore ingredients, compare their properties and keep your development ideas organized.',
  },
  {
    Icon: Package,
    title: 'A conversation about scale.',
    copy: 'Discuss preferred packs, bulk supply, formulation and manufacturing needs with the team.',
  },
];

export function AboutExperience({ testimonials = [] }: { testimonials?: Testimonial[] }) {
  return (
    <>
      <HomeMotion />
      <div className="e-company e-about">
        <CompanyMotion key="about" />
        <Hero about />
        <TypeRibbon about />
        <section data-e-live className="e-story r-wrap" id="our-story" aria-labelledby="e-story-heading">
          <div className="e-story-visual" data-e-parallax data-e-reveal>
            <img
              src="/assets/ingredients/oils.webp"
              alt="Representative botanical oils and laboratory glassware"
              width={700}
              height={650}
              loading="lazy"
            />
            <div className="e-story-date" aria-hidden="true">
              1998
            </div>
            <span className="e-photo-caption">Our story</span>
          </div>
          <div className="e-story-copy" data-e-reveal>
            <span className="e-kicker">Our story</span>
            <h2 id="e-story-heading">
              From ingredient expertise
              <br />
              <span>to everyday possibility.</span>
            </h2>
            <p>
              COCOJOJO describes its beginnings in 1998, supplying ingredients and developing products for industry
              clients before extending its work to consumers.
            </p>
            <p>
              This store brings ingredient shopping and technical research together, with a clear source for published
              information and a direct path to ask about your project.
            </p>
            <a className="e-pill e-pill-outline" href="https://cocojojo.com/about">
              Read the official company story
            </a>
          </div>
        </section>
        <section data-e-live className="e-values-section" aria-label="What matters to us">
          <MolecularDrift />
          <div className="e-values r-wrap">
            {values.map(({ Icon, title, copy }, i) => (
              <article className="e-value-card" data-e-reveal key={title}>
                <div className="e-value-surface" data-e-tilt>
                  <div className="e-value-top">
                    <Icon size={31} strokeWidth={1.3} aria-hidden="true" />
                    <span>0{i + 1}</span>
                  </div>
                  <h2>{title}</h2>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="e-values-word" aria-hidden="true">
            Possibility.
          </div>
        </section>
        {/* Ours, not the reference's: the testimonials published in admin
            Settings → Testimonials. Rendered only when there are some. */}
        {testimonials.length > 0 && (
          <section className="e-quotes r-wrap" aria-labelledby="e-quotes-heading">
            <span className="e-kicker">In their words</span>
            <h2 id="e-quotes-heading">Trusted by the brands, salons and formulators we supply.</h2>
            <div className="e-quotes-grid">
              {testimonials.map((t) => (
                <figure key={t.id}>
                  <blockquote>
                    <p>“{t.quote}”</p>
                  </blockquote>
                  <figcaption>
                    <strong>{t.authorName}</strong>
                    {t.company && <span>{t.company}</span>}
                    {t.result && <small>{t.result}</small>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

/** /services/<slug> — reference support-pages.tsx ServicePage, inside r-legacy-support. */
export function ServiceDetail({ s }: { s: Service }) {
  const inquiry = serviceInquiryHref(s);
  return (
    <div className="r-legacy-support">
      <section className="service-detail-hero">
        <div className="wrap">
          <div>
            <div className="eyebrow">{s.eyebrow}</div>
            <h1>{s.title}.</h1>
            <p>{s.intro}</p>
            <a className="btn btn-primary" href={inquiry}>
              Discuss your project
            </a>
          </div>
          <img
            src={'/assets/ingredients/' + s.image + '.webp'}
            alt="Representative cosmetic ingredient texture"
            width={600}
            height={500}
          />
        </div>
      </section>
      <section className="wrap section">
        <div className="eyebrow">Explore the scope</div>
        <h2>Ways we can discuss your project.</h2>
        <ul className="svc-offerings">
          {s.offerings.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="svc-scope">
          Scope, feasibility, minimum quantities, testing providers, responsibilities and timing are confirmed in a
          project proposal before work begins.
        </p>
        {s.slug === 'packaging-filling' && (
          <a className="btn btn-secondary" href="/packaging">
            Browse packaging formats
          </a>
        )}
      </section>
      <section className="wrap section">
        <div className="section-head">
          <h2>A clearer path forward.</h2>
          <a href="/services" className="text-link">
            All services
          </a>
        </div>
        <div className="service-process-grid">
          {s.steps.map(([title, description], i) => (
            <article key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="wrap service-brief">
        <div>
          <div className="eyebrow">Make the first conversation useful</div>
          <h2>
            What to include
            <br />
            in your brief.
          </h2>
          <p>A few details help us understand the product you want to create.</p>
        </div>
        <div>
          {s.include.map((x, i) => (
            <p key={x}>
              <span>{i + 1}</span>
              {x}
            </p>
          ))}
          <a href={inquiry} className="btn btn-primary">
            Prepare your project inquiry
          </a>
        </div>
      </section>
      <section className="wrap section">
        <h2>Explore more possibilities.</h2>
        <div className="support-link-grid">
          {serviceLinks
            .filter((x) => x.slug !== s.slug)
            .sort((a, b) => Number(b.group === s.group) - Number(a.group === s.group))
            .slice(0, 6)
            .map((x) => (
              <a href={'/services/' + x.slug} key={x.slug}>
                <FlaskConical size={25} aria-hidden="true" />
                <h3>{x.title}</h3>
                <p>{x.eyebrow}</p>
                <span>Explore service</span>
              </a>
            ))}
        </div>
      </section>
    </div>
  );
}
