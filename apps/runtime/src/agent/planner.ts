import type { Observation } from "@vector/contracts";

/** Renders an observation into the compact text form the model reads. */
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
      if (e.disabled) bits.push("disabled");
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

export const PLANNER_SYSTEM = `You are Vector's planning model. You operate a real browser through a validated program schema — you never output prose reasoning or chain-of-thought.

You receive: the goal, the current page observation (refs like r12 address elements), and the outcomes of steps already executed.

You return ONE of:
- status="continue" + steps: a chunk of 1-8 meaningful operations executed locally without you. Stop the chunk at a decision boundary, an unpredictable navigation, or when the next action depends on results you have not seen.
- status="continue" + observationRequest: ask for a different observation scope when the current one lacks what you need.
- status="needs_input" + question: you are blocked on a human (credentials, captcha, ambiguous destructive choice).
- status="done" + result: the goal's verified end state is observable in the last outcomes/observation.

Rules:
- Target elements by ref ids (r7) from the LATEST observation. Refs die on navigation (document epoch change).
- Prefer fill/select/check over type+press for form fields.
- Search/filter boxes submit on Enter: after fill/type into one, press key "Enter" on that field — autocomplete popups often swallow or stale the submit-button click.
- For virtualized or infinite-scroll lists, use collectScroll (item selector + optional key/fields/limit) instead of scroll+extract loops — it dedupes by stable key across renders.
- Use waitFor with real conditions (textVisible, selector, urlMatches, response) — never fixed sleeps.
- After a submit/save, include an expect or waitFor that proves the outcome (e.g. textVisible "Saved").
- For extract, choose stable selectors you can see in the observation.
- Completion means a checked state, not a plausible claim: if you changed a record, read it back.
- When a step fails, change the MECHANISM — never retry the same action: press Enter instead of clicking a button, navigate directly to a URL you can construct (search results, pagination, item pages), or target with css:/text:/role= instead of a stale ref.
- If you can write the URL that satisfies the goal, navigate to it — never finish with "here is the link" for a page you could have opened. done means the answer is already in the observation or completed steps.
- Check COMPLETED STEPS before planning: if they already satisfy the goal, return status="done" with the result — never re-run steps that already succeeded.
- The OBSERVATION reflects the current page, including shadow-DOM content. If it already shows the data the goal asks for, answer from it — extract only for data beyond what the observation shows.
- Keep messages factual and short ("Edited record 17 status to In review").

Examples of finishing (note: done takes NO steps):
- GOAL "click Increment once and report the counter", OBSERVATION shows "shadow-counter: Increment 1", COMPLETED STEPS shows "click ok" →
  {"status":"done","message":"Counter is 1","result":{"counter":"1"}}
- GOAL "list the section headings", OBSERVATION headings line already lists them →
  {"status":"done","message":"Found 3 headings","result":{"headings":["Intro","Pricing","FAQ"]}}

A "continue" that only re-checks what the observation already shows is wasted work — prefer done.`;

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

export const VISION_SYSTEM = `You are Vector's vision fallback planner. You are looking at an actual screenshot of the page because the structured DOM observation did not yield enough to act on.

Return ONLY a JSON object matching the PlanChunk schema — no prose, no markdown fences. "message" (short factual status) is always required:
- {"status":"continue","message":"...","steps":[...]} to act, or
- {"status":"needs_input","message":"...","question":"..."} if blocked on a human, or
- {"status":"done","message":"...","result":{...}} if the goal is visibly complete.

Rules:
- Elements you can see but that have no ref must be targeted with clickPoint x/y pixel coordinates in the screenshot's coordinate space.
- Steps still validate against the same schema: clickPoint, scroll, press, fill (with a selector if one is obvious), navigate, waitFor, screenshot.
- Keep the chunk to 1-4 steps; stop at any unpredictable navigation.
- Never guess credentials or consent to destructive actions.`;

/** Prompt for the image-attached fallback call. The model sees the screenshot. */
export function buildVisionPrompt(input: {
  goal: string;
  url: string;
  lastError?: string;
  recentOutcomes: { stepId: string; op: string; status: string; detail?: string; extracted?: Record<string, unknown>; error?: { message: string } }[];
}): string {
  const parts: string[] = [`GOAL: ${input.goal}`, `URL: ${input.url}`];
  if (input.lastError) parts.push(`LAST FAILURE: ${input.lastError}`);
  if (input.recentOutcomes.length) {
    parts.push("COMPLETED STEPS (most recent last):");
    for (const o of input.recentOutcomes.slice(-12)) {
      parts.push(renderOutcome(o));
    }
  }
  parts.push("The attached screenshot is the current page. What are the next steps?");
  return parts.join("\n");
}

/**
 * The run is ending under a guard — the model may not act again. It must
 * either report the best answer the evidence supports or ask a human for
 * the missing piece. Keeps near-miss runs from dying with a bare error.
 */
export const FINAL_ANSWER_SYSTEM = `You are Vector's planner making its LAST decision for a run. The action loop has stopped — you cannot execute any more steps.

Return ONLY a JSON object:
- {"status":"done","message":"...","result":{...}} — answer the goal as completely as the observation and completed steps allow. Put the actual answer values in result. If the goal was only partly met, still return done with what you found.
- {"status":"needs_input","message":"...","question":"..."} — only if the goal is truly blocked on a human (credentials, missing information you cannot guess).

Never return steps. Never return continue. Base the answer on the evidence — do not claim actions you did not take.`;

export function buildFinalAnswerPrompt(input: {
  goal: string;
  observation: Observation;
  recentOutcomes: { stepId: string; op: string; status: string; detail?: string; extracted?: Record<string, unknown>; error?: { message: string } }[];
  reason: string;
  context?: string;
}): string {
  const parts: string[] = [`GOAL: ${input.goal}`];
  if (input.context) parts.push(`EARLIER IN THIS SESSION: ${input.context}`);
  parts.push(`STOPPED BECAUSE: ${input.reason}`);
  parts.push("", "=== FINAL OBSERVATION ===", renderObservation(input.observation));
  if (input.recentOutcomes.length) {
    parts.push("", "=== COMPLETED STEPS (most recent last) ===");
    for (const o of input.recentOutcomes.slice(-24)) parts.push(renderOutcome(o));
  }
  parts.push("", "Answer the goal now — done or needs_input only.");
  return parts.join("\n");
}

/** One completed-step line for the prompt — includes extracted data so the
 * planner can see what an extract step actually returned. Values are trimmed
 * per field so one large blob can't hide the others. */
function renderOutcome(o: { op: string; status: string; detail?: string; extracted?: Record<string, unknown>; error?: { message: string } }): string {
  let line = `  ${o.op} ${o.status}`;
  if (o.detail) line += ` — ${o.detail.slice(0, 400)}`;
  if (o.extracted && Object.keys(o.extracted).length) {
    const trimmed = Object.fromEntries(
      Object.entries(o.extracted).map(([k, v]) => {
        const s = typeof v === "string" ? v : JSON.stringify(v);
        return [k, s.length > 500 ? `${s.slice(0, 500)}…` : s];
      }),
    );
    line += ` → ${JSON.stringify(trimmed)}`;
  }
  if (o.error) line += ` — ERROR ${o.error.message}`;
  return line;
}

/** Pull the first balanced JSON object out of a text response. */
export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  if (start < 0) return undefined;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) {
      try {
        return JSON.parse(text.slice(start, i + 1));
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

export function buildPlannerPrompt(input: {
  goal: string;
  observations: Observation[];
  recentOutcomes: { stepId: string; op: string; status: string; detail?: string; extracted?: Record<string, unknown>; error?: { message: string } }[];
  pageIds: string[];
  repairNote?: string;
  context?: string;
}): string {
  const parts: string[] = [`GOAL: ${input.goal}`];
  if (input.context) parts.push(`EARLIER IN THIS SESSION: ${input.context}`);
  if (input.pageIds.length) {
    const current = input.observations[0]?.pageId;
    parts.push(`PAGES: ${input.pageIds.join(", ")} — currently observing ${current ?? "none"}; set pageId to work on another`);
  }
  if (input.repairNote)
    parts.push(
      `REPAIR: the previous chunk failed — ${input.repairNote}. Do NOT retry the same mechanism — use a different one: press Enter inside the field instead of clicking a submit button, navigate directly to a URL you can construct, or target the element with css:/text:/role= instead of a stale ref.`,
    );
  for (const obs of input.observations) {
    parts.push("", "=== OBSERVATION ===", renderObservation(obs));
  }
  if (input.recentOutcomes.length) {
    parts.push("", "=== COMPLETED STEPS (most recent last) ===");
    for (const o of input.recentOutcomes.slice(-24)) {
      parts.push(renderOutcome(o));
    }
  }
  return parts.join("\n");
}
