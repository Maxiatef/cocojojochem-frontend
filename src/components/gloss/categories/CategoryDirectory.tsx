import Link from 'next/link';
import { GlossPhoto } from './GlossPhoto';

export type DirectoryItem = {
  key: string;
  href: string;
  name: string;
  image: string;
  imageAlt: string;
  /** The small teal line above the name, e.g. "291 ingredients". */
  meta: string;
  text: string;
};

/** The prototype's `/categories` grid (`r-category-directory`). */
export function CategoryDirectory({ items }: { items: DirectoryItem[] }) {
  return (
    <div className="r-category-directory">
      {items.map((item) => (
        <Link key={item.key} href={item.href}>
          <GlossPhoto
            src={item.image}
            alt={item.imageAlt}
            width={430}
            height={300}
            sizes="(max-width: 480px) 100vw, (max-width: 1150px) 50vw, 430px"
          />
          <div>
            <span>{item.meta}</span>
            <h2>{item.name}</h2>
            <p>{item.text}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

/**
 * The compact image-topped tiles (`function-directory` in the gloss sheet),
 * for directories with too many entries for the large category cards.
 */
export function FunctionDirectory({ items }: { items: DirectoryItem[] }) {
  return (
    <div className="function-directory">
      {items.map((item) => (
        <Link key={item.key} href={item.href}>
          <GlossPhoto
            src={item.image}
            alt={item.imageAlt}
            width={320}
            height={170}
            sizes="(max-width: 760px) 50vw, 320px"
          />
          <div>
            <span>{item.meta}</span>
            <h2>{item.name}</h2>
            <p>{item.text}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
