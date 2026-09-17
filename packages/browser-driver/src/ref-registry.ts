import type { ElementRef, SelectorStrategy } from "@vector/contracts";

/**
 * Refs live and die with a document epoch. Navigation wipes them; DOM
 * mutation alone does not — locators are re-resolved lazily at action time.
 */
export class RefRegistry {
  private byPage = new Map<string, Map<string, ElementRef>>();
  private generation = new Map<string, number>();

  register(pageId: string, elements: ElementRef[]): void {
    const map = new Map<string, ElementRef>();
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
  if (/^r\d+$/.test(target)) return { kind: "ref", ref: target };
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
