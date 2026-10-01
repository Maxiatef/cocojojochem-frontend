'use client';

import { useEffect } from 'react';
import { customerApi } from '@/lib/customerApi';
import { decodeCustomerToken, getCustomerToken } from '@/lib/customerAuth';
import {
  COMPARE_EVENT,
  COMPARE_KEY,
  CompareItem,
  PROJECTS_EVENT,
  PROJECTS_KEY,
  Project,
  getCompare,
  getProjects,
  setWorkspaceChangeListener,
  write,
} from './stores';

/**
 * Keeps the comparison list and projects in step with the customer's account.
 *
 * - Guest: nothing leaves the browser.
 * - Signing in: the guest's browser copy is merged into the account
 *   (POST /workspace/merge), and the merged result replaces the local copy.
 * - Signed in: every change is saved to the account (debounced PUT).
 * - Signing out: the local copy is cleared, so the next person on a shared
 *   computer doesn't see it. It is still in the account.
 *
 * OWNER_KEY records whose data the local copy is. If a different customer
 * signs in on the same browser, the previous customer's leftovers are
 * dropped rather than merged into the new account.
 */
const OWNER_KEY = 'cocojojochem_workspace_owner';

interface Workspace {
  compare: CompareItem[];
  projects: Project[];
}

function currentUser(): string | null {
  const token = getCustomerToken();
  const sub = token ? decodeCustomerToken(token)?.sub : null;
  return sub != null ? String(sub) : null;
}

function apply(ws: Workspace) {
  write(COMPARE_KEY, COMPARE_EVENT, ws.compare, true);
  write(PROJECTS_KEY, PROJECTS_EVENT, ws.projects, true);
}

async function syncOnAuth() {
  const user = currentUser();
  const owner = localStorage.getItem(OWNER_KEY);

  if (!user) {
    if (owner) {
      localStorage.removeItem(OWNER_KEY);
      apply({ compare: [], projects: [] });
    }
    return;
  }

  try {
    let ws: Workspace;
    if (owner === user) {
      ws = await customerApi.get<Workspace>('/workspace');
    } else {
      // owner null = guest data worth keeping; another user's = discard.
      const local = owner ? { compare: [], projects: [] } : { compare: getCompare(), projects: getProjects() };
      ws = await customerApi.post<Workspace>('/workspace/merge', local);
    }
    localStorage.setItem(OWNER_KEY, user);
    apply(ws);
  } catch {
    // Offline or the API is down: keep working from the browser copy.
  }
}

const timers: Record<string, number | undefined> = {};

function push(key: string) {
  const user = currentUser();
  if (!user || localStorage.getItem(OWNER_KEY) !== user) return;
  window.clearTimeout(timers[key]);
  timers[key] = window.setTimeout(() => {
    const request =
      key === COMPARE_KEY
        ? customerApi.put('/workspace/compare', { items: getCompare() })
        : key === PROJECTS_KEY
          ? customerApi.put('/workspace/projects', { projects: getProjects() })
          : null;
    request?.catch(() => {
      /* the browser copy is intact; the next change or sign-in retries */
    });
  }, 600);
}

/** Mount once, in the storefront shell. */
export function useWorkspaceSync() {
  useEffect(() => {
    setWorkspaceChangeListener(push);
    syncOnAuth();
    window.addEventListener('customer-auth-changed', syncOnAuth);
    return () => {
      setWorkspaceChangeListener(null);
      window.removeEventListener('customer-auth-changed', syncOnAuth);
    };
  }, []);
}
