/**
 * Task-specific page query (Gate F). Binds role/name/tag against a fresh
 * observation. Refs from a previous layout are not required to match.
 */
import type { ObservationContent } from "@vector/contracts";

export interface PageQuery {
  role?: string;
  nameIncludes?: string;
  tag?: string;
  exactOrigin?: string;
}

export interface QueryHit {
  ref: string;
  role?: string;
  name?: string;
  tag: string;
}

export function queryPage(obs: ObservationContent, query: PageQuery, url?: string): QueryHit | undefined {
  if (query.exactOrigin) {
    const href = url ?? obs.url;
    try {
      if (new URL(href).origin !== query.exactOrigin) return undefined;
    } catch {
      return undefined;
    }
  }
  const hit = obs.elements.find((e) => {
    if (query.role && e.role !== query.role) return false;
    if (query.tag && e.tag !== query.tag) return false;
    if (query.nameIncludes && !(e.name ?? "").includes(query.nameIncludes)) return false;
    return true;
  });
  if (!hit) return undefined;
  return { ref: hit.ref, role: hit.role, name: hit.name, tag: hit.tag };
}

export function queryAll(obs: ObservationContent, query: PageQuery, url?: string): QueryHit[] {
  if (query.exactOrigin) {
    const href = url ?? obs.url;
    try {
      if (new URL(href).origin !== query.exactOrigin) return [];
    } catch {
      return [];
    }
  }
  return obs.elements
    .filter((e) => {
      if (query.role && e.role !== query.role) return false;
      if (query.tag && e.tag !== query.tag) return false;
      if (query.nameIncludes && !(e.name ?? "").includes(query.nameIncludes)) return false;
      return true;
    })
    .map((e) => ({ ref: e.ref, role: e.role, name: e.name, tag: e.tag }));
}
