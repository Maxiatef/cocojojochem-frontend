/**
 * `yoastseo` ships a `types` field in its package.json that points at a
 * directory it does not actually publish, so TypeScript resolves the import to
 * nothing. These are hand-written declarations for the small surface we use.
 *
 * Kept deliberately narrow: adding a member here should mean we actually call
 * it, so an upstream rename surfaces as a compile error rather than as a
 * silently-undefined value at runtime.
 */
declare module 'yoastseo' {
  export class Paper {
    constructor(
      text: string,
      attributes?: {
        keyword?: string;
        synonyms?: string;
        title?: string;
        titleWidth?: number;
        description?: string;
        slug?: string;
        permalink?: string;
        locale?: string;
      },
    );
  }

  export interface YoastAssessmentResult {
    /** 0–9. Yoast's own per-assessment scale, not a percentage. */
    score: number;
    /** Assessment id, e.g. "textLength", "keyphraseDensity". */
    _identifier: string;
    /** Feedback copy. Contains anchor tags pointing at yoast.com. */
    text: string;
  }

  export class Assessor {
    constructor(researcher: unknown, options?: Record<string, unknown>);
    assess(paper: Paper): void;
    calculateOverallScore(): number;
    getValidResults(): YoastAssessmentResult[];
  }

  export class SeoAssessor extends Assessor {}
  export class ContentAssessor extends Assessor {}

  export const interpreters: {
    scoreToRating(score: number): 'good' | 'ok' | 'bad' | 'feedback' | '';
  };

  export const helpers: {
    /** Measures rendered pixel width — requires a DOM, browser only. */
    measureTextWidth(text: string): number;
  };
}

declare module 'yoastseo/build/languageProcessing/languages/en/Researcher' {
  export default class Researcher {
    constructor(paper: unknown);
  }
}
