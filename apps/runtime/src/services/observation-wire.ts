import type { CompactObservation, ElementRef, FormField, Observation } from "@aux/contracts";
import { compactObservation } from "./observation-render.js";

/**
 * API forms of an observation (speed P0-2). Selectors, xpaths and rects stay
 * server-side in the ref registry — a ref is all a client needs to act — so
 * the full wire form drops them along with every field that repeats another:
 * `frame: "main"`, the `links` summary of anchor elements, and the type and
 * required flag of form fields whose element carries them. Console lines are served by
 * `pages.console`, not observations.
 */
export function wireObservation(
  obs: Observation,
  format?: "full" | "compact",
): Observation | { observation: CompactObservation } {
  if (format === "compact") return { observation: obs.delta ? compactDelta(obs) : compactObservation(obs) };
  return slimObservation(obs);
}

export function slimObservation(obs: Observation): Observation {
  const c = obs.content;
  const byRef = new Map<string, ElementRef>();
  const elements = c.elements.map((e) => {
    byRef.set(e.ref, e);
    const { selector: _selector, rect: _rect, frame, ...rest } = e;
    return (frame === "main" ? rest : { ...rest, frame }) as ElementRef;
  });
  const formFields = c.formFields.map((f) => {
    const e = f.ref ? byRef.get(f.ref) : undefined;
    if (!e) return f;
    // label and value stay: clients read a form's state from formFields alone
    const out: FormField = { ref: f.ref, label: f.label, name: f.name, value: f.value };
    if (f.type !== (e.type ?? (e.tag === "input" ? "text" : e.tag))) out.type = f.type;
    if (!!f.required !== !!e.required) out.required = f.required;
    if (f.valid !== undefined) out.valid = f.valid;
    if (f.validationMessage) out.validationMessage = f.validationMessage;
    return out;
  });
  const { links: _links, console: _console, ...content } = c;
  return { ...obs, content: { ...content, elements, formFields } as Observation["content"] };
}

type ElementView = Partial<ElementRef> & { ref: string };

function elementLine(e: ElementView): string {
  const bits = [e.role ?? e.tag ?? "element"];
  if (e.name) bits.push(JSON.stringify(e.name));
  if (e.value !== undefined)
    bits.push(`value=${e.type === "password" ? "{handle}" : JSON.stringify(e.value)}`);
  if (e.checked !== undefined) bits.push(`checked=${e.checked}`);
  if (e.selected !== undefined) bits.push(`selected=${JSON.stringify(e.selected)}`);
  if (e.href) bits.push(`href=${e.href}`);
  for (const flag of ["focused", "required", "disabled", "offscreen", "occluded"] as const)
    if (e[flag]) bits.push(flag);
  if (e.frame && e.frame !== "main") bits.push(`@${e.frame}`);
  return `${e.ref} ${bits.join(" ")}`;
}

/** Compact rendering of a `sinceRevision` delta: only what changed since the caller's revision. */
function compactDelta(obs: Observation): CompactObservation {
  const d = obs.delta!;
  const added = (d.added ?? []) as ElementView[];
  const changed = d.changed ?? [];
  const text = d.textDelta ?? { added: [], removed: [] };
  const lines = [
    `page: ${obs.pageId}`,
    `document: ${obs.documentEpoch}  revision: ${obs.revision}  changes since revision: ${d.sinceRevision}`,
    `url: ${obs.content.url}`,
    `title: ${obs.content.title}`,
  ];
  if (!added.length && !d.removed?.length && !changed.length && !text.added.length && !text.removed.length)
    lines.push("no changes");
  if (added.length) lines.push("added:", ...added.map((e) => `  ${elementLine(e)}`));
  if (d.removed?.length) lines.push(`removed: ${d.removed.join(" ")}`);
  if (changed.length) {
    lines.push("changed:");
    for (const { ref, fields } of changed)
      lines.push(
        `  ${ref} ${Object.entries(fields)
          .map(([k, v]) => `${k}=${v === null ? "(none)" : JSON.stringify(v)}`)
          .join(" ")}`,
      );
  }
  if (text.added.length || text.removed.length)
    lines.push("text:", ...text.added.map((l) => `  + ${l}`), ...text.removed.map((l) => `  - ${l}`));
  const touched = new Set([...added.map((e) => e.ref), ...changed.map((c) => c.ref)]);
  const refs = obs.content.elements
    .filter((e) => touched.has(e.ref))
    .map((e) => ({ ref: e.ref, ...(e.role ? { role: e.role } : {}), ...(e.name ? { name: e.name } : {}) }));
  return {
    pageId: obs.pageId,
    url: obs.content.url,
    title: obs.content.title,
    documentEpoch: obs.documentEpoch,
    revision: obs.revision,
    text: lines.join("\n"),
    refs,
    sinceRevision: d.sinceRevision,
  };
}
