/**
 * Runs the real Yoast engine (`yoastseo`, the package behind the WordPress
 * plugin) against a product draft.
 *
 * WHY THIS IS IN THE BROWSER, not the API
 * ---------------------------------------
 * Two of Yoast's assessments are genuinely DOM-bound: `titleWidth` measures the
 * SEO title's rendered PIXEL width via `helpers.measureTextWidth`, which calls
 * `document.getElementById`. Run server-side it throws, and skipping it makes
 * Yoast report "Please create an SEO title" on a product that has one. The
 * engine was written to run in the editor, so that is where it runs.
 *
 * It sits ALONGSIDE our own analyser rather than replacing it. They answer
 * different questions:
 *   - Yoast   — is this well-written prose that reads well and targets a term?
 *   - ours    — is this a complete catalogue record? (INCI, CAS, duplicate
 *               titles across the catalogue, length windows we actually use)
 * Yoast cannot see the other 18 products, so it can never catch a duplicate
 * title; ours cannot judge readability. Neither is redundant.
 *
 * LICENSING: `yoastseo` is GPL-3.0. It is imported only by the admin product
 * editor and only via dynamic import, so it is not part of the storefront
 * bundle. See the note in the SEO panel.
 */

export type YoastRating = 'good' | 'ok' | 'bad' | 'feedback' | '';

export interface YoastResult {
  id: string;
  /** Yoast's own 0–9 per-assessment score. */
  score: number;
  rating: YoastRating;
  /** Feedback text, with Yoast's marketing links stripped. */
  text: string;
  /**
   * True when the assessment cannot meaningfully pass for a catalogue product
   * page — see IRRELEVANT below. Shown, but set apart from the real to-do list.
   */
  notApplicable: boolean;
}

export interface YoastAnalysis {
  /**
   * `available: false` means no focus keyphrase is set, so the SEO score is
   * meaningless — see SENTINEL_SCORE. Results are still returned so the panel
   * can list what is waiting on a keyphrase.
   */
  seo: { score: number; rating: YoastRating; results: YoastResult[]; available: boolean };
  readability: { score: number; rating: YoastRating; results: YoastResult[] };
}

export interface YoastInput {
  name: string;
  slug: string;
  shortDescription?: string;
  chemicalDescriptions?: string;
  focusKeyphrase?: string;
  seoTitle?: string;
  metaDescription?: string;
  imageCount?: number;
  imagesWithAlt?: number;
}

/**
 * Assessments that will never pass on a product page, because the thing they
 * look for does not exist in this content model. They are reported separately
 * rather than hidden — Yoast's score still counts them, and pretending
 * otherwise would inflate the number.
 */
const IRRELEVANT = new Set([
  // Product descriptions are plain prose fields with no link editor.
  'internalLinks',
  'externalLinks',
  'textCompetingLinks',
  // Yoast wants subheadings and 300+ words — blog thresholds. An ingredient
  // page that hits 300 words is usually padded.
  'subheadingsTooLong',
  'singleH1',
]);

/**
 * Yoast signals "this assessment cannot run" by returning a large NEGATIVE
 * score rather than by omitting the result: `keyphraseLength` returns -999 and
 * `keyphraseDensity` -50 when no keyphrase is set. Its own
 * `calculateOverallScore()` then averages those sentinels in as if they were
 * real marks, which is how a page with no keyphrase produces a score of -698.
 *
 * WordPress never shows that number — with no keyphrase the plugin greys the
 * bullet out and says "not available". We do the same, and additionally clamp
 * the final percentage, so no future sentinel can produce a nonsense score.
 *
 * Genuine bad marks are small negatives (`textLength` returns -20 for a short
 * text) and must still count, so the cutoff sits between the two.
 */
const SENTINEL_SCORE = -50;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Yoast parses HTML, not plain text — it counts paragraphs and sentences and
 * reads `<img alt>`. Our description fields are plain text with blank lines, so
 * they are wrapped into paragraphs, and the gallery is represented as image
 * tags so the image assessments reflect the real product.
 */
function buildHtml(input: YoastInput): string {
  const body = [input.shortDescription, input.chemicalDescriptions].filter(Boolean).join('\n\n');

  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, ' ')}</p>`)
    .join('');

  const total = input.imageCount ?? 0;
  const withAlt = Math.min(input.imagesWithAlt ?? 0, total);
  const images = Array.from({ length: total }, (_, i) =>
    i < withAlt
      ? `<img src="product-${i}.jpg" alt="${escapeHtml(input.name)}" />`
      : `<img src="product-${i}.jpg" alt="" />`,
  ).join('');

  return images + paragraphs;
}

/** Yoast's copy links to yoast.com for every assessment; strip the markup. */
function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * The engine is ~8MB of source with language data for every locale it supports,
 * so it is imported once, lazily, and cached — never at module load, which
 * would pull it into the page's initial JavaScript.
 */
let enginePromise: Promise<{
  Paper: typeof import('yoastseo').Paper;
  SeoAssessor: typeof import('yoastseo').SeoAssessor;
  ContentAssessor: typeof import('yoastseo').ContentAssessor;
  interpreters: typeof import('yoastseo').interpreters;
  helpers: typeof import('yoastseo').helpers;
  Researcher: typeof import('yoastseo/build/languageProcessing/languages/en/Researcher').default;
}> | null = null;

async function loadEngine() {
  if (!enginePromise) {
    enginePromise = (async () => {
      const [yoast, researcher] = await Promise.all([
        import('yoastseo'),
        import('yoastseo/build/languageProcessing/languages/en/Researcher'),
      ]);
      return {
        Paper: yoast.Paper,
        SeoAssessor: yoast.SeoAssessor,
        ContentAssessor: yoast.ContentAssessor,
        interpreters: yoast.interpreters,
        helpers: yoast.helpers,
        Researcher: researcher.default,
      };
    })().catch((err) => {
      // Don't cache a failed load — a transient chunk error should be
      // retryable on the next keystroke rather than dead for the session.
      enginePromise = null;
      throw err;
    });
  }
  return enginePromise;
}

export async function analyzeWithYoast(input: YoastInput): Promise<YoastAnalysis> {
  const { Paper, SeoAssessor, ContentAssessor, interpreters, helpers, Researcher } =
    await loadEngine();

  const title = input.seoTitle?.trim() || input.name;

  const paper = new Paper(buildHtml(input), {
    keyword: input.focusKeyphrase?.trim() || '',
    title,
    // The whole reason this runs client-side: a real pixel measurement.
    titleWidth: helpers.measureTextWidth(title),
    description: input.metaDescription?.trim() || '',
    slug: input.slug,
    locale: 'en_US',
  });

  // One researcher per paper — it caches research keyed to the paper it was
  // constructed with, so reusing it across drafts returns stale results.
  const researcher = new Researcher(paper);

  const collect = (assessor: InstanceType<typeof SeoAssessor>) => {
    assessor.assess(paper);
    const score = Math.max(0, Math.min(100, assessor.calculateOverallScore()));
    return {
      score,
      rating: interpreters.scoreToRating(score),
      results: assessor.getValidResults().map((r) => ({
        id: r._identifier,
        score: r.score,
        rating: interpreters.scoreToRating(r.score),
        text: plainText(r.text),
        notApplicable: IRRELEVANT.has(r._identifier),
      })),
    };
  };

  const seo = collect(new SeoAssessor(researcher, {}));

  return {
    // Readability never depends on a keyphrase, so it is always meaningful.
    readability: collect(new ContentAssessor(researcher, {})),
    seo: {
      ...seo,
      available: !seo.results.some((r) => r.score <= SENTINEL_SCORE),
    },
  };
}
