import { VectorError, type SelectorStrategy } from "@vector/contracts";

/**
 * Structural subset of Playwright's Locator/Frame used by ref resolution —
 * kept minimal so the resolution order can be unit-tested with fakes.
 */
export interface LocatorLike {
  count(): Promise<number>;
  filter(opts: { visible: boolean }): LocatorLike;
}

export interface FrameLike<L extends LocatorLike = LocatorLike> {
  locator(selector: string): L;
  getByRole(role: never, opts: { name?: string; exact: boolean }): L;
  getByText(text: string, opts: { exact: boolean }): L;
}

export interface LocatorAttempt<L extends LocatorLike = LocatorLike> {
  loc: L;
  /** `path` strategies (css/xpath) identify one node; `semantic` ones search. */
  kind: "path" | "semantic";
  label: string;
}

/**
 * Build resolution attempts in speed/precision order (speed P0-3): the
 * unique paths computed at observe time first (css, then xpath), then the
 * semantic role/text searches — those are the slowest Playwright locators
 * and a substring name match ("Save" vs "Save draft") makes them spuriously
 * ambiguous. Semantic attempts only run when every path attempt matched
 * zero elements (the DOM moved under the ref).
 */
export function locatorAttempts<L extends LocatorLike>(frame: FrameLike<L>, strategy: SelectorStrategy): LocatorAttempt<L>[] {
  const attempts: LocatorAttempt<L>[] = [];
  if (strategy.css) attempts.push({ loc: frame.locator(strategy.css), kind: "path", label: "css" });
  if (strategy.xpath) attempts.push({ loc: frame.locator(strategy.xpath), kind: "path", label: "xpath" });
  if (strategy.role) {
    attempts.push({
      loc: frame.getByRole(strategy.role.role as never, { name: strategy.role.name, exact: false }),
      kind: "semantic",
      label: "role",
    });
  }
  if (strategy.text) attempts.push({ loc: frame.getByText(strategy.text, { exact: false }), kind: "semantic", label: "text" });
  if (attempts.length === 0) throw new VectorError("invalid_params", "Empty selector strategy");
  return attempts;
}

/**
 * Pick the locator that identifies exactly one element. A multi-match is
 * narrowed to visible elements before being declared ambiguous. Path
 * attempts run first; semantic attempts are consulted only if no path
 * attempt matched anything.
 */
export async function selectUniqueLocator<L extends LocatorLike>(
  attempts: LocatorAttempt<L>[],
  target: string,
): Promise<L> {
  let lastErr: unknown = null;
  // holder object — assigned inside tryOne, so a bare `let` would be narrowed to null at the throw site
  const state: { ambiguous: { label: string; count: number } | null } = { ambiguous: null };
  const tryOne = async (a: LocatorAttempt<L>): Promise<L | "none" | "ambiguous"> => {
    try {
      const count = await a.loc.count();
      if (count === 1) return a.loc;
      if (count === 0) return "none";
      // narrow to the single visible match rather than failing blind
      const visible = a.loc.filter({ visible: true }) as L;
      if ((await visible.count()) === 1) return visible;
      state.ambiguous ??= { label: a.label, count };
      return "ambiguous";
    } catch (e) {
      if (e instanceof VectorError) throw e;
      lastErr = e;
      return "none";
    }
  };
  const paths = attempts.filter((a) => a.kind === "path");
  const semantic = attempts.filter((a) => a.kind === "semantic");
  for (const a of paths) {
    const r = await tryOne(a);
    if (r !== "none" && r !== "ambiguous") return r;
  }
  if (!state.ambiguous) {
    for (const a of semantic) {
      const r = await tryOne(a);
      if (r !== "none" && r !== "ambiguous") return r;
    }
  }
  if (state.ambiguous) {
    throw new VectorError(
      "target_ambiguous",
      `Target "${target}" matched ${state.ambiguous.count} elements (${state.ambiguous.label}) — re-observe or use a more specific selector`,
    );
  }
  throw new VectorError(
    "target_detached",
    `Target "${target}" did not match any element${lastErr ? ` (${String(lastErr)})` : ""}`,
  );
}
