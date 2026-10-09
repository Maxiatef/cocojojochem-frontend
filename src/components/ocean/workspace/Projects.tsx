'use client';

import { useEffect, useState } from 'react';
import { FolderPlus } from 'lucide-react';
import {
  deleteProject,
  notify,
  updateProject,
  useCompare,
  useProjects,
  useSavedReferences,
  type ProjectItem,
} from '@/lib/gloss/stores';
import { productHref } from '@/lib/ocean/store-types';
import { useSavedProducts } from '@/components/gloss/workspace/useSavedProducts';
import { addItemsToProject, createProjectWith } from '@/components/gloss/workspace/projectItems';

/**
 * The reference `Projects()` (store-client.tsx) on our projects store
 * (localStorage, synced to the signed-in account). "Wishlist" is our saved
 * products plus saved supplier references.
 */
export function Projects() {
  const projects = useProjects();
  const compare = useCompare();
  const savedRefs = useSavedReferences();
  const { products: saved, loading } = useSavedProducts();
  const [name, setName] = useState('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const loaded = mounted && !loading;
  const wishlist: ProjectItem[] = [
    ...saved.map((p) => ({ slug: p.slug, name: p.name })),
    ...savedRefs.filter((r) => !saved.some((p) => p.slug === r.slug)).map((r) => ({ slug: r.slug, name: r.name })),
  ];
  const comparison: ProjectItem[] = compare.map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <>
      <form
        className="r-project-create"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !loaded) return;
          createProjectWith(name.trim(), wishlist);
          setName('');
        }}
      >
        <label className="r-field">
          New project name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            placeholder="For example, daily hydrating serum"
          />
        </label>
        <button className="r-btn r-primary" disabled={!loaded}>
          <FolderPlus size={18} />
          Create from wishlist
        </button>
      </form>
      <p className="r-fine">New projects include the items currently in your wishlist.</p>
      <div className="r-project-grid">
        {mounted &&
          projects.map((p) => (
            <article className="r-project" key={p.id}>
              <h2>{p.name}</h2>
              <p>{p.items.length} saved items</p>
              <ul>
                {p.items.map((item) => (
                  <li key={item.slug}>
                    <a href={productHref(item)}>{item.name || item.slug}</a>
                  </li>
                ))}
              </ul>
              <label className="r-field">
                Project notes
                <textarea
                  defaultValue={p.notes}
                  rows={4}
                  maxLength={4000}
                  onBlur={(e) => {
                    if (e.target.value === p.notes) return;
                    updateProject(p.id, { notes: e.target.value });
                    notify('Notes saved');
                  }}
                />
              </label>
              <div className="r-project-actions">
                <button type="button" onClick={() => addItemsToProject(p.id, wishlist)}>
                  Add current wishlist
                </button>
                {comparison.length > 0 && (
                  <button type="button" onClick={() => addItemsToProject(p.id, comparison)}>
                    Add current comparison
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Remove this project? Your wishlist and cart will stay saved.')) deleteProject(p.id);
                  }}
                >
                  Remove project
                </button>
              </div>
            </article>
          ))}
      </div>
      {mounted && !projects.length && (
        <p className="r-muted-panel">Name a project to bring your shortlist and development notes together.</p>
      )}
    </>
  );
}
