'use client';

import { createProject, getProjects, notify, ProjectItem, updateProject } from '@/lib/gloss/stores';

/**
 * Add several ingredients to a project in one write (and one toast), skipping
 * any already in it. `addToProject` handles one item at a time, which would
 * mean one toast per ingredient for a four-column comparison.
 */
export function addItemsToProject(id: string, items: ProjectItem[]) {
  const project = getProjects().find((p) => p.id === id);
  if (!project) return;
  const fresh = items.filter((i) => !project.items.some((x) => x.slug === i.slug));
  if (!fresh.length) {
    notify(`Already in ${project.name}`);
    return;
  }
  updateProject(id, { items: [...project.items, ...fresh] });
  notify(`${fresh.length} ${fresh.length === 1 ? 'ingredient' : 'ingredients'} added to ${project.name}`);
}

/** Create a project already holding `items`. */
export function createProjectWith(name: string, items: ProjectItem[]) {
  const project = createProject(name);
  if (items.length) updateProject(project.id, { items });
  return project;
}
