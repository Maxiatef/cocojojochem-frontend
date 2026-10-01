import Link from 'next/link';
import type { FaqItem } from './faqData';

/** The prototype's `r-faq` accordion: native <details>, no script needed. */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="r-faq">
      {items.map((item) => (
        <details key={item.id} id={`faq-${item.id}`}>
          <summary>{item.question}</summary>
          <p>
            {item.answer}
            {item.link && (
              <>
                {' '}
                <Link className="r-faq-link" href={item.link.href}>
                  {item.link.label}
                </Link>
              </>
            )}
          </p>
        </details>
      ))}
    </div>
  );
}
