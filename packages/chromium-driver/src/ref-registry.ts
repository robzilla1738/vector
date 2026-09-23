import { isElementRef, type ElementRef, type SelectorStrategy } from "@aux/contracts";

/**
 * Refs live and die with a document epoch. Navigation wipes them; DOM
 * mutation alone does not — locators are re-resolved lazily at action time.
 */
export class RefRegistry {
  private byPage = new Map<string, Map<string, ElementRef>>();
  private generation = new Map<string, number>();

  /**
   * A full observation replaces the page's refs: a ref it did not return is
   * gone from the page's live map too, and must fail as detached rather than
   * fall back to an old selector. Subtree/expand passes merge (`replace: false`).
   */
  register(pageId: string, elements: ElementRef[], opts: { replace?: boolean } = {}): void {
    const map = (opts.replace ? undefined : this.byPage.get(pageId)) ?? new Map<string, ElementRef>();
    for (const el of elements) map.set(el.ref, el);
    this.byPage.set(pageId, map);
    this.generation.set(pageId, (this.generation.get(pageId) ?? 0) + 1);
  }

  /** Document/observation generation. Stale callers must not reuse old refs. */
  epoch(pageId: string): number {
    return this.generation.get(pageId) ?? 0;
  }

  resolve(pageId: string, ref: string, epoch?: number): ElementRef | undefined {
    if (epoch !== undefined && this.generation.get(pageId) !== epoch) return undefined;
    return this.byPage.get(pageId)?.get(ref);
  }

  has(pageId: string, ref: string): boolean {
    return this.byPage.get(pageId)?.has(ref) ?? false;
  }

  clear(pageId: string): void {
    this.byPage.delete(pageId);
    this.generation.delete(pageId);
  }

  /** First unused ref number, so a merged pass never reuses a live ref. */
  nextRef(pageId: string): number {
    let max = 0;
    for (const ref of this.byPage.get(pageId)?.keys() ?? []) {
      const n = Number(ref.slice(1));
      if (Number.isFinite(n) && n > max) max = n;
    }
    return max + 1;
  }

  /** All registered refs for a page (used by expandRef fallbacks). */
  all(pageId: string): ElementRef[] {
    return [...(this.byPage.get(pageId)?.values() ?? [])];
  }
}

/**
 * Turn a step `target` string into a resolution plan. Targets can be
 * observation refs ("r12"), explicit selectors ("css:...", "xpath=...",
 * "text=...", "role=button[name=Save]"), or bare CSS.
 */
export function parseTarget(
  target: string,
): { kind: "ref"; ref: string } | { kind: "selector"; strategy: SelectorStrategy } {
  if (isElementRef(target)) return { kind: "ref", ref: target };
  if (target.startsWith("css:")) return { kind: "selector", strategy: { css: target.slice(4) } };
  if (target.startsWith("xpath:")) return { kind: "selector", strategy: { xpath: `xpath=${target.slice(6)}` } };
  if (target.startsWith("text:")) return { kind: "selector", strategy: { text: target.slice(5) } };
  const roleMatch = /^role=([a-zA-Z]+)(?:\[name=(.+)\])?$/.exec(target);
  if (roleMatch) {
    return {
      kind: "selector",
      strategy: { role: { role: roleMatch[1]!, name: roleMatch[2] } },
    };
  }
  return { kind: "selector", strategy: { css: target } };
}
