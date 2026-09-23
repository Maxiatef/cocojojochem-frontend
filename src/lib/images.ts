/**
 * Hosts next/image may resize. Must match images.remotePatterns in
 * next.config.js — next/image throws on any other host, so callers check
 * first and pass anything else through unoptimised rather than crash.
 */
const OPTIMISABLE_HOSTS = ['static.cocojojo.com', 'images.unsplash.com'];

export function isOptimisable(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && OPTIMISABLE_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}
