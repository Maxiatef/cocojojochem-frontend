import { redirect } from 'next/navigation';

/**
 * The wishlist moved to /saved, which works the same for guests and signed-in
 * customers. Old links (account menu, bookmarks, emails) land there.
 * Still noindex: the /account layout sets robots for this route.
 */
export default function AccountWishlistRedirect() {
  redirect('/saved');
}
