import type { PageTarget } from "@aux/contracts";

/** Entity order includes worker/peek pages; human tab placement remains in Layout. */
export interface PageCollection {
  byId: Record<string, PageTarget | undefined>;
  allIds: string[];
}

function samePage(previous: PageTarget, next: PageTarget): boolean {
  return (
    previous === next ||
    (Object.keys(previous).length === Object.keys(next).length &&
      Object.entries(next).every(([key, value]) => {
        const prior = previous[key as keyof PageTarget];
        return (
          Object.is(prior, value) ||
          (!!prior &&
            !!value &&
            typeof prior === "object" &&
            typeof value === "object" &&
            JSON.stringify(prior) === JSON.stringify(value))
        );
      }))
  );
}

export function normalizePages(items: readonly PageTarget[], previous?: PageCollection): PageCollection {
  const byId: PageCollection["byId"] = Object.create(null);
  const allIds: string[] = [];
  for (const page of items) {
    if (!Object.hasOwn(byId, page.pageId)) allIds.push(page.pageId);
    const prior = previous?.byId[page.pageId];
    byId[page.pageId] = prior && samePage(prior, page) ? prior : page;
  }
  const sameOrder =
    previous &&
    allIds.length === previous.allIds.length &&
    allIds.every((id, i) => id === previous.allIds[i]);
  if (sameOrder && allIds.every((id) => byId[id] === previous.byId[id])) return previous;
  return { byId, allIds: sameOrder ? previous.allIds : allIds };
}

/** A transient ordered projection for collection operations and wire payloads. */
export function orderedPages(pages: PageCollection): PageTarget[] {
  return pages.allIds.map((id) => pages.byId[id]!);
}

export function putPage(pages: PageCollection, page: PageTarget): PageCollection {
  if (pages.byId[page.pageId] && samePage(pages.byId[page.pageId]!, page)) return pages;
  return {
    byId: Object.assign(Object.create(null), pages.byId, { [page.pageId]: page }),
    allIds: pages.byId[page.pageId] ? pages.allIds : [...pages.allIds, page.pageId],
  };
}

export function removePage(pages: PageCollection, pageId: string): PageCollection {
  if (!pages.byId[pageId]) return pages;
  const byId = Object.assign(Object.create(null), pages.byId);
  delete byId[pageId];
  return { byId, allIds: pages.allIds.filter((id) => id !== pageId) };
}
