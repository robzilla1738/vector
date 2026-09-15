/**
 * Fixture data for the mocked bridge: realistic tabs, a run with steps and a
 * compact observation, a set with member progress. Deterministic so
 * screenshots are reproducible.
 */
import type { CompactObservation, PageSet, PageTarget, Run, SavedProgram, SetMember, StepRecord } from "@vector/contracts";

const T0 = Date.now() - 2_000; // "now" at load, so elapsed timers read sensibly

/** Inline SVG favicon — a letter on a brand colour, no network needed. */
export function favicon(letter: string, bg: string, fg = "#fff"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${bg}"/><text x="16" y="21.5" font-family="-apple-system,Inter,Helvetica,Arial" font-size="17" font-weight="700" text-anchor="middle" fill="${fg}">${letter}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface Site {
  url: string;
  title: string;
  letter: string;
  color: string;
}

export const SITES: Site[] = [
  { url: "https://github.com/vector-browser/vector/pull/3", title: "Vector Engine M0 — agent-first browser engine foundation · Pull Request #3", letter: "G", color: "#24292f" },
  { url: "https://linear.app/vector/issue/VEC-142/unified-command-bar", title: "VEC-142 Unified command bar — Linear", letter: "L", color: "#5e6ad2" },
  { url: "https://stripe.com/docs/api/checkout/sessions/create", title: "Create a Checkout Session | Stripe API Reference", letter: "S", color: "#635bff" },
  { url: "https://www.notion.so/vector/Shell-redesign-notes", title: "Shell redesign notes", letter: "N", color: "#111111" },
  { url: "https://news.ycombinator.com/", title: "Hacker News", letter: "Y", color: "#ff6600" },
  { url: "https://www.figma.com/design/vector-shell/Vector-Shell?node-id=12-4", title: "Vector Shell – Figma", letter: "F", color: "#a259ff" },
  { url: "https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver", title: "ResizeObserver - Web APIs | MDN", letter: "M", color: "#1b1b1b" },
  { url: "https://www.are.na/vector/browser-references", title: "Browser references — Are.na", letter: "A", color: "#4a4a4a" },
  { url: "https://vercel.com/vector/vector-web/deployments", title: "Deployments – vector-web – Vercel", letter: "▲", color: "#000000" },
  { url: "https://mail.google.com/mail/u/0/#inbox", title: "Inbox (12) - hello@vector.dev - Gmail", letter: "M", color: "#d93025" },
  { url: "https://calendar.google.com/calendar/u/0/r/week", title: "Google Calendar - Week of Sep 15, 2026", letter: "C", color: "#1a73e8" },
  { url: "https://en.wikipedia.org/wiki/Web_browser_engine", title: "Web browser engine - Wikipedia", letter: "W", color: "#3a3a3a" },
];

export function makePage(i: number, overrides: Partial<PageTarget> = {}): PageTarget {
  const s = SITES[i % SITES.length]!;
  const n = Math.floor(i / SITES.length);
  return {
    pageId: `page-${i + 1}`,
    backend: "vector",
    targetId: `t-${i + 1}`,
    url: n ? `${s.url}${s.url.includes("?") ? "&" : "?"}p=${n}` : s.url,
    title: n ? `${s.title} (${n + 1})` : s.title,
    favicon: favicon(s.letter, s.color),
    documentEpoch: 1,
    lastRevision: 3,
    viewStatus: "hidden",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: T0 - (i + 1) * 600_000,
    lastActiveAt: T0 - i * 60_000,
    loading: false,
    canGoBack: i % 2 === 0,
    canGoForward: false,
    ...overrides,
  };
}

export const RUN_ID = "run-7f3a";

export function makeRun(overrides: Partial<Run> = {}): Run {
  return {
    runId: RUN_ID,
    goal: "Find every open review comment on this PR that mentions accessibility and summarise what still needs to change",
    status: "running",
    pageIds: ["page-1", "page-2", "page-3"],
    config: { maxModelCalls: 20, modelId: "anthropic/claude-sonnet-4.5" },
    statusMessage: "Reading the second page of review comments",
    createdAt: T0 - 48_000,
    startedAt: T0 - 47_000,
    ...overrides,
  };
}

export function makeSteps(runId = RUN_ID, count = 6): StepRecord[] {
  const all: Omit<StepRecord, "runId">[] = [
    { stepId: "s1", pageId: "page-1", op: "navigate", inputs: { url: "https://github.com/vector-browser/vector/pull/3/files" }, expected: "Files tab opens", outcome: { stepId: "s1", op: "navigate", status: "ok", startedAt: T0 - 46_000, durationMs: 812, detail: "github.com/…/pull/3/files" }, startedAt: T0 - 46_000 },
    { stepId: "s2", pageId: "page-1", op: "waitFor", inputs: { condition: { kind: "settled" } }, outcome: { stepId: "s2", op: "waitFor", status: "ok", startedAt: T0 - 45_000, durationMs: 340 }, startedAt: T0 - 45_000 },
    { stepId: "s3", pageId: "page-1", op: "click", inputs: { target: "r18", obsArtifactId: "art-obs-1" }, expected: "Conversation tab shows all review threads", outcome: { stepId: "s3", op: "click", status: "ok", startedAt: T0 - 44_000, durationMs: 128, detail: "tab “Conversation”" }, startedAt: T0 - 44_000 },
    { stepId: "s4", pageId: "page-1", op: "extract", inputs: { fields: [{ name: "comments", selector: ".review-comment", all: true }], obsArtifactId: "art-obs-1" }, outcome: { stepId: "s4", op: "extract", status: "ok", startedAt: T0 - 43_000, durationMs: 96, detail: "23 comments", extracted: { comments: 23 } }, startedAt: T0 - 43_000 },
    { stepId: "s5", pageId: "page-1", op: "click", inputs: { target: "r41" }, expected: "Load more review comments", outcome: { stepId: "s5", op: "click", status: "failed", startedAt: T0 - 41_000, durationMs: 2_004, error: { code: "not_visible", message: "r41 “Load more…” is off-screen; scrolling first" } }, startedAt: T0 - 41_000 },
    { stepId: "s6", pageId: "page-1", op: "scroll", inputs: { direction: "down" }, outcome: { stepId: "s6", op: "scroll", status: "ok", startedAt: T0 - 39_000, durationMs: 210, detail: "↓ 1 viewport" }, startedAt: T0 - 39_000 },
    { stepId: "s7", pageId: "page-1", op: "click", inputs: { target: "r41", obsArtifactId: "art-obs-2" }, expected: "Load more review comments", outcome: { stepId: "s7", op: "click", status: "ok", startedAt: T0 - 38_000, durationMs: 151, detail: "button “Load more…”" }, startedAt: T0 - 38_000 },
    { stepId: "s8", pageId: "page-1", op: "extract", inputs: { fields: [{ name: "comments", selector: ".review-comment", all: true }], obsArtifactId: "art-obs-2" }, outcome: { stepId: "s8", op: "extract", status: "ok", startedAt: T0 - 36_000, durationMs: 88, detail: "31 comments", extracted: { comments: 31 } }, startedAt: T0 - 36_000 },
    { stepId: "s9", pageId: "page-1", op: "screenshot", inputs: {}, outcome: { stepId: "s9", op: "screenshot", status: "skipped", startedAt: T0 - 35_000, durationMs: 0, detail: "not needed — structured path succeeded" }, startedAt: T0 - 35_000 },
  ];
  return all.slice(0, count).map((s) => ({ ...s, runId }));
}

export const OBSERVATION: CompactObservation = {
  pageId: "page-1",
  url: "https://github.com/vector-browser/vector/pull/3",
  title: "Vector Engine M0 — agent-first browser engine foundation · Pull Request #3",
  documentEpoch: 1,
  revision: 4,
  text: [
    "# Vector Engine M0 — agent-first browser engine foundation · Pull Request #3",
    "url: https://github.com/vector-browser/vector/pull/3  viewport 1180×860  scroll 1240/6410",
    "",
    "## Headings",
    "- Vector Engine M0 — agent-first browser engine foundation #3",
    "- Conversation (31) · Commits (12) · Checks (8) · Files changed (46)",
    "- Review comments",
    "",
    "## Form fields",
    "- r3 textbox “Leave a comment” (empty)",
    "- r4 checkbox “Notify me” checked",
    "",
    "## Interactive",
    "r1 link “vector-browser / vector”",
    "r2 button “Code”",
    "r5 tab “Conversation” selected",
    "r6 tab “Commits”",
    "r7 tab “Checks”",
    "r8 tab “Files changed”",
    "r18 tab “Conversation”",
    "r22 link “@amelia — a11y: focus ring missing on the tab strip”",
    "r23 link “@jun — please add aria-selected to sidebar tabs”",
    "r24 link “@amelia — reduced-motion path skips the rail slide, good”",
    "r41 button “Load more…”",
    "r42 button “Resolve conversation”",
    "r43 button “Approve”",
    "",
    "## Text",
    "31 review comments · 4 unresolved · 2 mention accessibility …",
  ].join("\n"),
  refs: [
    { ref: "r1", role: "link", name: "vector-browser / vector" },
    { ref: "r2", role: "button", name: "Code" },
    { ref: "r3", role: "textbox", name: "Leave a comment" },
    { ref: "r4", role: "checkbox", name: "Notify me" },
    { ref: "r5", role: "tab", name: "Conversation" },
    { ref: "r6", role: "tab", name: "Commits" },
    { ref: "r7", role: "tab", name: "Checks" },
    { ref: "r8", role: "tab", name: "Files changed" },
    { ref: "r18", role: "tab", name: "Conversation" },
    { ref: "r22", role: "link", name: "@amelia — a11y: focus ring missing on the tab strip" },
    { ref: "r23", role: "link", name: "@jun — please add aria-selected to sidebar tabs" },
    { ref: "r24", role: "link", name: "@amelia — reduced-motion path skips the rail slide, good" },
    { ref: "r41", role: "button", name: "Load more…" },
    { ref: "r42", role: "button", name: "Resolve conversation" },
    { ref: "r43", role: "button", name: "Approve" },
  ],
};

export const PAST_RUNS: Run[] = [
  {
    runId: "run-2b11",
    goal: "Compare Checkout Session pricing modes and list which support subscriptions",
    status: "completed",
    pageIds: ["page-3"],
    config: { implementation: "program", routeReason: "saved program Stripe · compare pricing modes", modelCalls: 0 },
    statusMessage: "Done — 3 modes compared",
    result: { modes: ["payment", "setup", "subscription"], supports_subscriptions: ["subscription"] },
    createdAt: T0 - 3_600_000,
    startedAt: T0 - 3_600_000,
    endedAt: T0 - 3_590_000,
  },
  {
    runId: "run-9c02",
    goal: "Draft a reply to the deploy-failure thread with the log excerpt",
    status: "needs_input",
    pageIds: ["page-10"],
    statusMessage: "Which log excerpt should I quote — the build step or the runtime error?",
    createdAt: T0 - 7_200_000,
    startedAt: T0 - 7_190_000,
  },
  {
    runId: "run-4d77",
    goal: "Collect every ResizeObserver example on MDN into a table",
    status: "partially_completed",
    pageIds: ["page-7"],
    config: { modelCalls: 6 },
    statusMessage: "4 of 5 examples extracted — the last one is inside a live iframe",
    createdAt: T0 - 86_400_000,
    startedAt: T0 - 86_400_000,
    endedAt: T0 - 86_300_000,
  },
  {
    runId: "run-1a90",
    goal: "Book the 9:30 slot for Thursday",
    status: "failed",
    pageIds: ["page-11"],
    error: "The slot picker never became interactive (timeout 20s)",
    config: { modelCalls: 4 },
    createdAt: T0 - 172_800_000,
    startedAt: T0 - 172_800_000,
    endedAt: T0 - 172_700_000,
  },
];

export const PROGRAMS: SavedProgram[] = [
  { programId: "prog-1", name: "Stripe · compare pricing modes", siteKey: "stripe.com/docs", version: 3, parameters: [], stepsJson: "[]", useCount: 7, lastUsedAt: T0 - 3_600_000, createdAt: T0 - 9e8 },
  { programId: "prog-2", name: "GitHub · unresolved review threads", siteKey: "github.com/*/pull", version: 1, parameters: ["pr"], stepsJson: "[]", useCount: 2, lastUsedAt: T0 - 5e7, createdAt: T0 - 4e8 },
  { programId: "prog-3", name: "HN · top stories to table", siteKey: "news.ycombinator.com", version: 5, parameters: [], stepsJson: "[]", useCount: 19, lastUsedAt: T0 - 2e8, createdAt: T0 - 8e8 },
];

export const SET: PageSet = {
  setId: "set-pricing",
  name: "Competitor pricing pages",
  source: "urls",
  memberIds: Array.from({ length: 12 }, (_, i) => `m-${i + 1}`),
  createdAt: T0 - 600_000,
};

export const MEMBERS: SetMember[] = SET.memberIds.map((memberId, i) => ({
  memberId,
  setId: SET.setId,
  ordinal: i,
  url: `https://example-${i + 1}.com/pricing`,
  label: ["Linear", "Notion", "Figma", "Vercel", "Stripe", "Arc", "Raycast", "Superhuman", "Cron", "Warp", "Zed", "Loom"][i],
  status: i < 6 ? "completed" : i < 8 ? "running" : i === 8 ? "failed" : "queued",
  ...(i < 6 ? { resultId: `res-${i + 1}` } : {}),
  ...(i === 8 ? { error: "429 rate limited" } : {}),
}));

export const HISTORY = SITES.map((s, i) => ({ url: s.url, title: s.title, visitedAt: T0 - (i + 1) * 900_000 }));

export const BOOKMARKS = SITES.slice(0, 5).map((s) => ({ url: s.url, title: s.title }));
