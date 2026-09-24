import { AuxError, type ElementRef, EventTypes, type Observation, type ObservationContent, type ObservationDelta, newObservationId } from "@aux/contracts";
import type { PageLanes } from "./lanes.js";
import type { PageRegistry } from "./registry.js";
import { type LivePage, OBSERVATION_HISTORY, type ObserveReq, type ObservedRevision } from "./types.js";

/** Element fields a client sees; selectors and geometry stay in the ref registry. */
const elementView = ({ selector: _s, rect: _r, frame, ...rest }: ElementRef): Record<string, unknown> =>
  frame === "main" ? rest : { ...rest, frame };

/**
 * `sinceRevision` delta against a revision of the same document: elements
 * added (full), removed (refs), changed (ref + the fields that differ, null
 * for a field that went away) and the text lines added/removed.
 */
function structuralDelta(base: ObservedRevision, elements: Map<string, Record<string, unknown>>, text: string): ObservationDelta {
  const added: Record<string, unknown>[] = [];
  const changed: { ref: string; fields: Record<string, unknown> }[] = [];
  for (const [ref, el] of elements) {
    const prev = base.elements.get(ref);
    if (!prev) {
      added.push(el);
      continue;
    }
    const fields: Record<string, unknown> = {};
    for (const key of new Set([...Object.keys(prev), ...Object.keys(el)])) {
      if (JSON.stringify(prev[key]) !== JSON.stringify(el[key])) fields[key] = el[key] ?? null;
    }
    if (Object.keys(fields).length) changed.push({ ref, fields });
  }
  const removed = [...base.elements.keys()].filter((ref) => !elements.has(ref));
  return { sinceRevision: base.revision, added, removed, changed, textDelta: lineDelta(base.text, text) };
}

function lineDelta(before: string, after: string, cap = Infinity): { added: string[]; removed: string[] } {
  if (before === after) return { added: [], removed: [] };
  const a = before.split("\n").filter(Boolean);
  const b = after.split("\n").filter(Boolean);
  const inA = new Set(a);
  const inB = new Set(b);
  return { added: b.filter((l) => !inA.has(l)).slice(0, cap), removed: a.filter((l) => !inB.has(l)).slice(0, cap) };
}

const observeReqKey = (req: ObserveReq) =>
  `${req.scope ?? "full"}|${req.subtreeRef ?? ""}|${req.maxElements ?? 120}|${req.maxTextChars ?? 6000}`;

export class ObservationService {
  constructor(private pages: PageRegistry, private lanes: PageLanes) {}

  // ---------- observation ----------

  async observe(pageId: string, req: ObserveReq): Promise<Observation> {
    return this.lanes.enqueue(pageId, async () => {
      const dp = this.pages.driverPageLenient(pageId);
      const lp = this.pages.live.get(pageId);
      // Observation cache (plan A6): one small probe decides whether the
      // last observation is still exact. Same epoch, same request shape,
      // same fingerprint — nothing the walk could see has changed, so the
      // renderer is not re-walked and nothing is re-persisted.
      let fingerprint: string | undefined;
      // An explicit subtree can read a child frame whose DOM is outside the
      // main-document fingerprint. Re-read it instead of returning stale refs.
      if (req.scope !== "subtree" && dp.observeFingerprint && lp) {
        fingerprint = await dp.observeFingerprint().catch(() => undefined);
        const hit = lp.lastObs;
        if (
          fingerprint &&
          hit &&
          hit.fingerprint === fingerprint &&
          hit.reqKey === observeReqKey(req) &&
          hit.obs.documentEpoch === lp.target.documentEpoch
        ) {
          this.pages.deps.tracer?.incr("observe.cache_hit");
          const current = lp.history.find((h) => h.revision === hit.obs.revision);
          const delta = current ? this.deltaSince(lp, req, current) : undefined;
          return { ...hit.obs, observedAt: Date.now(), cached: true, changesSince: undefined, deltaFrom: undefined, delta };
        }
      }
    // console lines reach lp.consoleLines through onConsole; observations do not carry them
    return this.recordObservation(pageId, await dp.observe(req), req, fingerprint);
    });
  }

  /** Structural delta for `sinceRevision` — only against a revision of the same document. */
  private deltaSince(lp: LivePage, req: ObserveReq, current: ObservedRevision): ObservationDelta | undefined {
    if (req.sinceRevision === undefined) return undefined;
    const base = lp.history.find((h) => h.revision === req.sinceRevision);
    if (!base || base.epoch !== current.epoch || base.shape !== current.shape) return undefined;
    return structuralDelta(base, current.elements, current.text);
  }

  /**
   * Stamp an `ObservationContent` with ids/revision/epoch, diff it against
   * the previous one, persist and announce it.
   */
  recordObservation(pageId: string, content: ObservationContent, req: ObserveReq, fingerprint?: string): Observation {
    const lp = this.pages.live.get(pageId);
    if (!lp) throw new AuxError("target_detached", `page ${pageId} detached during observation`);
    const revision = (this.pages.revCounters.get(pageId) ?? lp.target.lastRevision) + 1;
    this.pages.revCounters.set(pageId, revision);
    lp.target.lastRevision = revision;
    lp.target.url = content.url;
    lp.target.title = content.title;
    // `sinceRevision` picks the observation the caller last saw as the diff
    // base (falls back to the most recent one when it has aged out)
    const base =
      req.sinceRevision !== undefined ? (lp.history.find((h) => h.revision === req.sinceRevision) ?? lp.history.at(-1)) : lp.history.at(-1);
    const changesSince = this.diffObservations(base, content);
    const deltaFrom = lp.lastObservationId;
    const fields = new Map(content.formFields.map((f) => [f.label ?? f.name ?? f.ref ?? "?", f.value ?? ""]));
    const current: ObservedRevision = {
      revision,
      epoch: lp.target.documentEpoch,
      shape: `${req.scope ?? "full"}|${req.subtreeRef ?? ""}`,
      text: content.text,
      fields,
      elements: new Map(content.elements.map((e) => [e.ref, elementView(e)])),
    };
    const delta = this.deltaSince(lp, req, current);
    lp.history.push(current);
    if (lp.history.length > OBSERVATION_HISTORY) lp.history.splice(0, lp.history.length - OBSERVATION_HISTORY);
    const obs: Observation = {
      observationId: newObservationId(),
      pageId,
      ...(this.pages.deps.profileId ? { profileId: this.pages.deps.profileId } : {}),
      documentEpoch: lp.target.documentEpoch,
      revision,
      observedAt: Date.now(),
      scope: req.scope ?? "full",
      content,
      changesSince: changesSince.length ? changesSince : undefined,
      deltaFrom: changesSince.length ? deltaFrom : undefined,
      delta,
    };
    lp.lastObservationId = obs.observationId;
    lp.lastObs = fingerprint ? { fingerprint, reqKey: observeReqKey(req), obs } : undefined;
    this.pages.deps.repo.defer(`obs:${obs.observationId}`, () =>
      this.pages.deps.repo.saveObservation({
        observationId: obs.observationId,
        pageId,
        epoch: obs.documentEpoch,
        revision,
        observedAt: obs.observedAt,
        scope: obs.scope,
        json: JSON.stringify(obs),
      }),
    );
    this.pages.persist(lp);
    this.pages.deps.events.emit(EventTypes.Observation, {
      pageId,
      revision,
      epoch: obs.documentEpoch,
      approxTokens: content.stats.approxTokens,
    });
    return obs;
  }

  private diffObservations(base: { text: string; fields: Map<string, string> } | undefined, next: ObservationContent): string[] {
    const changes: string[] = [];
    if (!base) return changes;
    if (base.text !== next.text) {
      const { added, removed } = lineDelta(base.text, next.text, 5);
      for (const l of added) changes.push(`+ ${l.slice(0, 120)}`);
      for (const l of removed) changes.push(`- ${l.slice(0, 120)}`);
      if (!added.length && !removed.length) changes.push("page text changed");
    }
    {
      for (const f of next.formFields) {
        const key = f.label ?? f.name ?? f.ref ?? "?";
        const prev = base.fields.get(key);
        const cur = f.value ?? "";
        if (prev !== undefined && prev !== cur) changes.push(`${key}: "${prev}" -> "${cur}"`);
      }
    }
    return changes;
  }

  /** Structured fields from the current observation, plus CSS extract specs. */
  async extract(
    pageId: string,
    fields?: Array<string | { name: string; selector?: string; attribute?: string; all?: boolean }>,
  ): Promise<{ pageId: string; documentEpoch: number; revision: number; fields: Record<string, unknown> }> {
    const obs = await this.observe(pageId, {});
    const { picked, css } = pickExtractFields(obs.content, fields);
    if (css.length) {
      const extra = await this.pages.driverPageLenient(pageId).extract(css);
      Object.assign(picked, extra);
    }
    return { pageId, documentEpoch: obs.documentEpoch, revision: obs.revision, fields: picked };
  }
}

const EXTRACT_KEYS = new Set([
  "url",
  "title",
  "text",
  "headings",
  "elements",
  "formFields",
  "tables",
  "links",
  "dialogs",
  "console",
  "viewport",
  "scroll",
  "frames",
]);

function pickExtractFields(
  content: ObservationContent,
  fields?: Array<string | { name: string; selector?: string; attribute?: string; all?: boolean }>,
): {
  picked: Record<string, unknown>;
  css: { name: string; selector?: string; attribute?: string; all?: boolean }[];
} {
  const picked: Record<string, unknown> = {};
  const css: { name: string; selector?: string; attribute?: string; all?: boolean }[] = [];
  if (!fields?.length) {
    picked.url = content.url;
    picked.title = content.title;
    picked.text = content.text;
    picked.headings = content.headings;
    picked.formFields = content.formFields;
    picked.tables = content.tables;
    picked.links = content.links;
    picked.dialogs = content.dialogs;
    return { picked, css };
  }
  for (const field of fields) {
    if (typeof field !== "string") {
      if (field.selector) css.push(field);
      else {
        const value = valueForExtractName(content, field.name);
        if (value !== undefined) picked[field.name] = value;
        else css.push(field);
      }
      continue;
    }
    picked[field] = valueForExtractName(content, field) ?? null;
  }
  return { picked, css };
}

function valueForExtractName(content: ObservationContent, name: string): unknown {
  if (EXTRACT_KEYS.has(name)) return content[name as keyof ObservationContent];
  const el = content.elements.find((e) => e.ref === name || e.name === name);
  if (el) return el;
  const form = content.formFields.find((f) => f.ref === name || f.label === name || f.name === name);
  if (form) return form;
  const link = content.links.find((l) => l.ref === name || l.text === name);
  if (link) return link;
  return undefined;
}
