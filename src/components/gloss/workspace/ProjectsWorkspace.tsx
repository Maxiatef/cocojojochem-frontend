'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderPlus, X } from 'lucide-react';
import {
  deleteProject,
  notify,
  Project,
  ProjectItem,
  removeFromProject,
  updateProject,
  useCompare,
  useProjects,
} from '@/lib/gloss/stores';
import { useSavedProducts } from './useSavedProducts';
import { addItemsToProject, createProjectWith } from './projectItems';

/** The prototype's project workspace (fn K), on our localStorage projects store. */
export function ProjectsWorkspace() {
  const projects = useProjects();
  const compare = useCompare();
  const { products: saved, loading: savedLoading } = useSavedProducts();
  const [name, setName] = useState('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const ready = mounted && !savedLoading;
  const wishlistItems: ProjectItem[] = saved.map((p) => ({ slug: p.slug, name: p.name }));
  const compareItems: ProjectItem[] = compare.map((c) => ({ slug: c.slug, name: c.name }));

  function create(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !ready) return;
    createProjectWith(name, wishlistItems);
    setName('');
  }

  return (
    <>
      <form className="r-project-create" onSubmit={create}>
        <div className="r-field">
          <label htmlFor="new-project-name">New project name</label>
          <input
            id="new-project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            placeholder="For example, daily hydrating serum"
          />
        </div>
        <button type="submit" className="r-btn r-primary" disabled={!ready}>
          <FolderPlus size={18} />
          Create from wishlist
        </button>
      </form>
      <p className="r-fine">
        New projects include the ingredients currently in your <Link href="/saved">wishlist</Link>. Projects are kept
        in this browser.
      </p>

      {mounted && (
        <div className="r-project-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} wishlistItems={wishlistItems} compareItems={compareItems} />
          ))}
        </div>
      )}

      {mounted && !projects.length && (
        <p className="r-muted-panel">Name a project to bring your shortlist and development notes together.</p>
      )}
    </>
  );
}

function ProjectCard({
  project,
  wishlistItems,
  compareItems,
}: {
  project: Project;
  wishlistItems: ProjectItem[];
  compareItems: ProjectItem[];
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(project.name);
  const notesId = 'project-notes-' + project.id;
  const nameId = 'project-name-' + project.id;
  const count = project.items.length;

  function saveName(e: FormEvent) {
    e.preventDefault();
    const next = draft.trim();
    if (next && next !== project.name) {
      updateProject(project.id, { name: next });
      notify('Project renamed');
    }
    setRenaming(false);
  }

  return (
    <article className="r-project">
      {renaming ? (
        <form className="r-project-rename" onSubmit={saveName}>
          <div className="r-field">
            <label htmlFor={nameId}>Project name</label>
            <input
              id={nameId}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              required
              maxLength={80}
              autoFocus
            />
          </div>
          <button type="submit" className="r-btn r-primary r-small">
            Save
          </button>
          <button
            type="button"
            className="r-text-button"
            onClick={() => {
              setDraft(project.name);
              setRenaming(false);
            }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <h2>{project.name}</h2>
      )}
      <p>
        {count} saved {count === 1 ? 'ingredient' : 'ingredients'}
      </p>
      {count > 0 && (
        <ul>
          {project.items.map((item) => (
            <li key={item.slug}>
              <Link href={'/products/' + item.slug}>{item.name || item.slug}</Link>
              <button
                type="button"
                className="r-icon-button"
                aria-label={`Remove ${item.name || item.slug} from ${project.name}`}
                onClick={() => removeFromProject(project.id, item.slug)}
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="r-field">
        <label htmlFor={notesId}>Project notes</label>
        <textarea
          id={notesId}
          defaultValue={project.notes}
          rows={4}
          maxLength={4000}
          onBlur={(e) => {
            if (e.target.value === project.notes) return;
            updateProject(project.id, { notes: e.target.value });
            notify('Notes saved');
          }}
        />
      </div>
      <div className="r-project-actions">
        <button
          type="button"
          disabled={!wishlistItems.length}
          onClick={() => addItemsToProject(project.id, wishlistItems)}
        >
          Add current wishlist
        </button>
        <button
          type="button"
          disabled={!compareItems.length}
          onClick={() => addItemsToProject(project.id, compareItems)}
        >
          Add current comparison
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft(project.name);
            setRenaming(true);
          }}
        >
          Rename
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('Remove this project? Your wishlist and cart will stay saved.')) deleteProject(project.id);
          }}
        >
          Remove project
        </button>
      </div>
    </article>
  );
}
