import type { CompactObservation, Observation } from "@vector/contracts";

/**
 * Renders an observation into the compact text form the model reads. Shared
 * by the internal planner prompt and the `format: "compact"` API/MCP path
 * (speed P0-2) so external agents get the same 5–10× smaller view.
 */
export function renderObservation(obs: Observation): string {
  const c = obs.content;
  const scope = obs.scope ?? "full";
  const lines: string[] = [
    `page: ${obs.pageId}`,
    `document: ${obs.documentEpoch}  revision: ${obs.revision}  scope: ${scope}`,
    `url: ${c.url}`,
    `title: ${c.title}`,
    `viewport: ${c.viewport.width}x${c.viewport.height} @${c.viewport.scale}x  scroll: y=${c.scroll.y}/${c.scroll.maxY}`,
  ];
  if (c.frames.length > 1)
    lines.push(`frames: ${c.frames.map((f) => `${f.frame}${f.sameOrigin ? "" : " (cross-origin)"}=${f.url}`).join(" | ")}`);
  lines.push("");
  if (c.headings.length) lines.push(`headings: ${c.headings.join(" · ")}`);

  // Scoped observations show only the requested section — the planner asked
  // for it because the full view lacked what it needed; dumping everything
  // back re-buries the signal.
  const want = {
    fields: scope === "full" || scope === "forms" || scope === "subtree",
    elements: scope === "full" || scope === "subtree",
    tables: scope === "full" || scope === "tables" || scope === "subtree",
    text: scope === "full" || scope === "subtree",
  };
  if (scope === "links" && c.links.length) {
    lines.push("links:");
    for (const l of c.links) lines.push(`  ${l.ref} ${JSON.stringify(l.text ?? "")} → ${l.href}`);
  }
  if (want.fields && c.formFields.length) {
    lines.push("form fields:");
    for (const f of c.formFields)
      lines.push(
        `  ${f.ref ?? "-"} ${f.type} ${f.label ?? f.name ?? ""}=${JSON.stringify(f.value ?? "")}${f.required ? " required" : ""}${f.valid === false ? ` INVALID(${f.validationMessage ?? ""})` : ""}`,
      );
  }
  if (want.elements && c.elements.length) {
    lines.push("elements:");
    for (const e of c.elements) {
      const bits = [e.role ?? e.tag];
      if (e.name) bits.push(JSON.stringify(e.name));
      if (e.value !== undefined) bits.push(`value=${JSON.stringify(e.value)}`);
      if (e.checked !== undefined) bits.push(`checked=${e.checked}`);
      if (e.selected !== undefined) bits.push(`selected=${JSON.stringify(e.selected)}`);
      if (e.href) bits.push(`href=${e.href}`);
      if (e.options?.length) bits.push(`options=[${e.options.map((o) => JSON.stringify(o)).join("|")}]`);
      if (e.expanded !== undefined) bits.push(`expanded=${e.expanded}`);
      if (e.pressed !== undefined) bits.push(`pressed=${e.pressed}`);
      if (e.focused) bits.push("focused");
      if (e.required) bits.push("required");
      if (e.disabled) bits.push("disabled");
      if (e.offscreen) bits.push("offscreen");
      if (e.occluded) bits.push("occluded");
      if (e.frame !== "main") bits.push(`@${e.frame}`);
      lines.push(`  ${e.ref} ${bits.join(" ")}`);
    }
  }
  if (want.tables && c.tables.length) {
    for (const t of c.tables) {
      lines.push(`table ${t.ref} cols=[${t.columns.join(" | ")}] rows=${t.totalRows ?? t.rows.length}${t.truncated ? " (truncated)" : ""}:`);
      for (const r of t.rows) lines.push(`  ${r.join(" | ")}`);
    }
  }
  if (want.text && c.text) {
    lines.push("text:");
    lines.push(collapseRepetitiveLines(c.text));
  }
  if (obs.changesSince?.length) {
    lines.push("changes since previous revision:");
    for (const ch of obs.changesSince) lines.push(`  ${ch}`);
  }
  if (c.truncated)
    lines.push(`[truncated — ${c.stats.elementsTotal} elements total, showing ${c.stats.elementsShown}; request scope="subtree" or forms/links/tables]`);
  return lines.join("\n");
}

/**
 * The wire form for `format: "compact"`: the rendered text plus a minimal ref
 * list. Selectors, xpath and rects stay server-side in the RefRegistry — a
 * ref is all a client needs to act.
 */
export function compactObservation(obs: Observation): CompactObservation {
  const refs: CompactObservation["refs"] = obs.content.elements.map((e) => {
    const r: CompactObservation["refs"][number] = { ref: e.ref };
    if (e.role) r.role = e.role;
    if (e.name) r.name = e.name;
    return r;
  });
  return {
    pageId: obs.pageId,
    url: obs.content.url,
    title: obs.content.title,
    documentEpoch: obs.documentEpoch,
    revision: obs.revision,
    text: renderObservation(obs),
    refs,
  };
}

/**
 * Collapse runs of near-identical text lines (virtualized rows, repeated
 * items) into a count — small models drown in 300 near-duplicate lines and
 * miss the signal around them. Lines are grouped by their digit-stripped
 * shape; a run of 3+ becomes "… N more like this".
 */
function collapseRepetitiveLines(text: string): string {
  const lines = text.split("\n");
  const shape = (l: string) => l.replace(/\d+/g, "#").replace(/\s+/g, " ").trim();
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const s = shape(lines[i]!);
    if (!s) {
      out.push(lines[i]!);
      i++;
      continue;
    }
    let j = i;
    while (j < lines.length && shape(lines[j]!) === s) j++;
    const run = j - i;
    if (run >= 4) {
      out.push(lines[i]!, lines[i + 1]!, `… ${run - 2} more lines like this`);
    } else {
      for (let k = i; k < j; k++) out.push(lines[k]!);
    }
    i = j;
  }
  return out.join("\n");
}
