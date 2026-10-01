import Link from 'next/link';
import { FlaskConical, ShoppingBag } from 'lucide-react';

/** The prototype's `r-empty` block: icon, heading, one line, one action. */
export function EmptyState({
  title,
  text,
  href,
  label,
  icon = 'flask',
}: {
  title: string;
  text: string;
  href: string;
  label: string;
  icon?: 'cart' | 'flask';
}) {
  return (
    <div className="r-empty">
      {icon === 'cart' ? <ShoppingBag size={38} /> : <FlaskConical size={38} />}
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="r-btn r-primary" href={href}>
        {label}
      </Link>
    </div>
  );
}
