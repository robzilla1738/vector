import { SYSTEM_PROMPT } from "./system-prompt.js";

/**
 * System prompt assembly (S5): the base prompt plus a conditional-docs
 * registry (03-C). Each doc declares `requiredFor` — included only when its
 * requirement holds in this context, so the prompt never teaches surfaces
 * the run cannot use.
 */
export interface ConditionalDoc {
  id: string;
  requiredFor: (ctx: PromptContext) => boolean;
  /** Doc text or a loader evaluated lazily when required. */
  doc: string | (() => string);
}

export interface PromptContext {
  /** The run claims a page → page tools are live. */
  hasPage: boolean;
  /** Web egress configured for this run. */
  webEnabled: boolean;
  /** WebMCP tool surface negotiated on the page (S4 flag; REPL rides S5). */
  webmcp?: boolean;
}

export const CONDITIONAL_DOCS: ConditionalDoc[] = [
  {
    id: "page-tools",
    requiredFor: (ctx) => ctx.hasPage,
    doc: `## Page tools
- \`snapshot\` returns the current observation: accessibility-first tree text where elements carry [ref=…] markers, plus fields, links, tables, dialogs and any truncation guidance. Call it after navigation, after consequential actions, and whenever page state may have drifted.
- \`act\` executes a batch of program steps on the active page. Batches report partial failures — read which step failed before re-planning. Setter steps (fill/type/check/uncheck/select) record the control's prior value in the ledger. A step the ledger marks \`uncertain\` must never be retried: re-observe and re-plan instead.`,
  },
  {
    id: "web-tools",
    requiredFor: (ctx) => ctx.webEnabled,
    doc: `## Web tools
- \`webfetch\` reads a public page without cookies; private-network destinations are denied and every destination is decided by policy before dispatch.
- \`websearch\` searches the web; cite the URLs it returns when using the results.`,
  },
  {
    id: "suspensions",
    requiredFor: () => true,
    doc: `## Suspensions and confirmations
- \`ask_user_question\` parks the turn until the user answers — call it only when the answer changes what you do next, and alone (no other tool call in the same turn).
- \`request_action_confirmation\` produces a user-facing review artifact for consequential work: call it alone, once, after the work is verified.`,
  },
  {
    id: "webmcp",
    requiredFor: (ctx) => ctx.webmcp === true,
    doc: `## Site tools (WebMCP)
This page exposes site-authored tools. Call \`page.webmcp.tools()\` to list them and \`page.webmcp.call(name, input)\` to run one. Write-capable site tools require approval like any other consequential action; read-only tools run directly.`,
  },
];

export function buildSystemPrompt(ctx: PromptContext): string {
  const docs = CONDITIONAL_DOCS.filter((doc) => {
    try {
      return doc.requiredFor(ctx);
    } catch {
      return false;
    }
  }).map((doc) => (typeof doc.doc === "string" ? doc.doc : doc.doc()).trim());
  return [SYSTEM_PROMPT.trim(), ...docs].join("\n\n");
}
