import { z } from "zod";

/**
 * A ref is a stable-within-a-document handle to an interactive element.
 * It resolves through the ref registry to locator strategies, never to a
 * raw node id that outlives navigation.
 */
export const SelectorStrategySchema = z.object({
  /** e.g. role=button[name="Save"] — preferred when available. */
  role: z
    .object({ role: z.string(), name: z.string().optional() })
    .optional(),
  /** CSS selector path; `>>` segments may pierce open shadow roots. */
  css: z.string().optional(),
  /** XPath fallback. */
  xpath: z.string().optional(),
  /** Text-based fallback. */
  text: z.string().optional(),
});
export type SelectorStrategy = z.infer<typeof SelectorStrategySchema>;

export const ElementRefSchema = z.object({
  ref: z.string(),
  frame: z.string().default("main").describe("frame key within the page, 'main' for top frame"),
  tag: z.string(),
  role: z.string().optional(),
  name: z.string().optional(),
  text: z.string().optional(),
  type: z.string().optional(),
  value: z.string().optional(),
  checked: z.boolean().optional(),
  selected: z.string().optional(),
  href: z.string().optional(),
  placeholder: z.string().optional(),
  disabled: z.boolean().optional(),
  /** `<select>` / listbox choices (labels, capped) so the model can pick without a second look (A10). */
  options: z.array(z.string()).optional(),
  /** aria-expanded / open `<details>`; only present when the element has the state. */
  expanded: z.boolean().optional(),
  /** aria-pressed toggle state. */
  pressed: z.boolean().optional(),
  /** currently the document's active element */
  focused: z.boolean().optional(),
  required: z.boolean().optional(),
  /** outside the viewport (needs a scroll before a click lands) */
  offscreen: z.boolean().optional(),
  /** covered at its centre point by another element (overlay, sticky bar) */
  occluded: z.boolean().optional(),
  /** Frame keys from the top document to this element's frame. */
  frameChain: z.array(z.string()).optional(),
  /** Shadow roots between this node and the light tree. */
  shadowDepth: z.number().int().optional(),
  /** Nearest scrollable ancestor ref. */
  scrollContainer: z.string().optional(),
  /** Ref of the element covering this one at its centre. */
  occludedBy: z.string().optional(),
  /** attached but not shown (Full only) */
  hidden: z.boolean().optional(),
  /** accessible description (Full only) */
  description: z.string().optional(),
  /** expanded state names (Full only, engine) */
  states: z.array(z.string()).optional(),
  rect: z
    .object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() })
    .optional(),
  selector: SelectorStrategySchema.default({}),
});
export type ElementRef = z.infer<typeof ElementRefSchema>;

export const FormFieldSchema = z.object({
  ref: z.string(),
  label: z.string().optional(),
  name: z.string().optional(),
  type: z.string(),
  value: z.string().optional(),
  required: z.boolean().optional(),
  valid: z.boolean().optional(),
  validationMessage: z.string().optional(),
});
export type FormField = z.infer<typeof FormFieldSchema>;

export const TableBlockSchema = z.object({
  ref: z.string(),
  caption: z.string().optional(),
  columns: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  totalRows: z.number().optional(),
  truncated: z.boolean(),
});
export type TableBlock = z.infer<typeof TableBlockSchema>;

export const FrameInfoSchema = z.object({
  frame: z.string(),
  url: z.string(),
  name: z.string().optional(),
  sameOrigin: z.boolean(),
});
export type FrameInfo = z.infer<typeof FrameInfoSchema>;

export const ObservationContentSchema = z.object({
  url: z.string(),
  title: z.string(),
  viewport: z.object({ width: z.number(), height: z.number(), scale: z.number() }),
  scroll: z.object({ x: z.number(), y: z.number(), maxY: z.number() }),
  frames: z.array(FrameInfoSchema),
  /** Compact structural text the model reads. */
  text: z.string(),
  headings: z.array(z.string()),
  elements: z.array(ElementRefSchema),
  formFields: z.array(FormFieldSchema),
  tables: z.array(TableBlockSchema),
  links: z.array(z.object({ ref: z.string(), text: z.string(), href: z.string() })),
  dialogs: z.array(z.object({ type: z.string(), message: z.string() })),
  /** Page `console.*` lines captured since the last navigation. */
  console: z
    .array(z.object({ level: z.string(), message: z.string(), atMs: z.number().optional() }))
    .optional(),
  /** True when content was cut to fit the budget. */
  truncated: z.boolean(),
  stats: z.object({
    elementsTotal: z.number(),
    elementsShown: z.number(),
    textChars: z.number(),
    approxTokens: z.number(),
  }),
});
export type ObservationContent = z.infer<typeof ObservationContentSchema>;

export const ObservationDeltaSchema = z
  .object({
    added: z.array(z.unknown()).optional(),
    removed: z.array(z.string()).optional(),
    updated: z.array(z.unknown()).optional(),
  })
  .passthrough();
export type ObservationDelta = z.infer<typeof ObservationDeltaSchema>;

export const ObservationSchema = z.object({
  protocolVersion: z.literal(1).optional(),
  observationId: z.string(),
  pageId: z.string(),
  documentEpoch: z.number(),
  revision: z.number(),
  observedAt: z.number(),
  scope: z.enum(["full", "forms", "links", "tables", "subtree"]),
  content: ObservationContentSchema,
  /** Human/model-readable field-level diff vs the previous revision. */
  changesSince: z.array(z.string()).optional(),
  /** Structured element delta (Full). */
  delta: ObservationDeltaSchema.optional(),
  /** §8.5 — the observationId this delta applies to; absent on a first observation. */
  deltaFrom: z.string().optional(),
  /** Served from the observation cache: the page fingerprint was unchanged since this observation was taken (plan A6). */
  cached: z.boolean().optional(),
});
export type Observation = z.infer<typeof ObservationSchema>;

/**
 * `format: "compact"` wire form (speed P0-2): the rendered text the internal
 * planner reads plus a minimal ref list. No css/xpath/rect — those stay
 * server-side in the ref registry; a ref is all a client needs to act.
 */
export const CompactObservationSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string(),
  documentEpoch: z.number(),
  revision: z.number(),
  /** compact rendering: header, headings, form fields, one line per ref, tables, text */
  text: z.string(),
  refs: z.array(z.object({ ref: z.string(), role: z.string().optional(), name: z.string().optional() })),
});
export type CompactObservation = z.infer<typeof CompactObservationSchema>;

export const ObservationFormatSchema = z.enum(["full", "compact"]);
export type ObservationFormat = z.infer<typeof ObservationFormatSchema>;

export const ObservationRequestSchema = z.object({
  scope: z.enum(["full", "forms", "links", "tables", "subtree"]).default("full"),
  subtreeRef: z.string().optional(),
  maxElements: z.number().int().positive().default(120),
  maxTextChars: z.number().int().positive().default(6000),
  maxTokens: z.number().int().positive().default(3000),
  sinceRevision: z.number().optional(),
  format: ObservationFormatSchema.optional(),
});
export type ObservationRequest = z.infer<typeof ObservationRequestSchema>;
