/**
 * Counts errors a caller deliberately swallows (best-effort CDP setup,
 * cosmetic re-application, background persistence) so they stay visible in
 * browser health without logging. Process-neutral: the regular process wires
 * the sink to its health recorder; the private process leaves it off.
 */
let sink: (site: string) => void = () => {};

export function setSwallowedSink(next: (site: string) => void) { sink = next; }
export function noteSwallowed(site: string) { sink(site); }
