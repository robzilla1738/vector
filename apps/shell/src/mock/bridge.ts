import { conversationReplyText } from "@aux/contracts/conversation-reply-text";
import {
  AuxError,
  MethodSchemas,
  ResultSchemas,
  GenerateResultParamsSchema,
  GeneratedResultSpecSchema,
  type GeneratedResult,
  type GeneratedResultSpec,
} from "@aux/contracts";
import { HostMethods } from "@aux/contracts/host-methods";
import { createMockHost } from "../host/mock.generated";
import { workFixtures } from "./work";
import { mockDocument } from "./documents";
import { connectorFixtures } from "./connectors";
import { steppedZoomLevel } from "@aux/contracts/page-zoom";
import { DEFAULT_SEARCH_ENGINE } from "@aux/contracts/search-engine";
import { MODEL_REGISTRY } from "@aux/contracts/model-registry";
import { workspaceMemoryText } from "@aux/contracts/memory-context";
/**
 * Scripted AuxBridge for `vite --mode mock`. Runs the whole shell in a
 * plain browser without the native host or runtime — for visual review, screenshot
 * baselines, and poking at states that are hard to reproduce live.
 *
 * Scenario is chosen by URL query:
 *   ?scenario=start         no tabs — start page
 *   ?scenario=browsing      6 tabs, Google unfiled and active (default)
 *   ?scenario=run           6 tabs + a live run with steps and an observation, rail open
 *   ?scenario=takeover      run scenario with the human holding the page
 *   ?scenario=needs-input   run scenario waiting on a question
 *   ?scenario=set           a set mapping over 12 members
 *   ?scenario=generated     versioned office or chart result (&generatedKind=csv|xlsx|docx|pptx|chart)
 *   ?scenario=many          45 tabs
 *   ?scenario=disconnected  runtime unreachable → degraded banner
 *   ?scenario=connectors    reviewed Calendar and MCP settings
 *   &theme=dark|light  &layout=horizontal|vertical  &sidebar=expanded|rail
 *   &live=1 (stream new steps)
 */
import type {
  CommandRankingEntry,
  MethodName,
  Download,
  BrowsingMemoryPage,
  BrowsingMemoryPolicy,
  ContentMemoryPolicy,
  WorkspaceMemory,
  ConversationImage,
  ConversationSummary,
  RunMessage,
  BrowserSpace,
  PageTarget,
  Run,
  StepRecord,
  AuxEvent,
  ZapRule,
  PluginSkillGrant,
} from "@aux/contracts";
import { normalizeCommandRankingQuery } from "@aux/contracts/command-ranking-query";
import { OrganizationCommitSchema, type OrganizationSnapshot } from "@aux/contracts/organization";
import type { BrowserExtension, AuxBridge, OmniboxResult } from "../bridge";
import { DEFAULT_SPACE } from "../workspace";
import {
  BOOKMARKS,
  HISTORY,
  MEMBERS,
  OBSERVATION,
  PAST_RUNS,
  PROGRAMS,
  RUN_ID,
  SET,
  SIDEBAR_TABS,
  makePage,
  makeRun,
  makeSteps,
} from "./fixtures";

type Listener<T> = (v: T) => void;

export function installMockBridge(q: URLSearchParams) {
  let spellCheckEnabled = true;
  let startupPreferences: { mode: "new-tab" | "continue" | "pages" | "continue-and-pages"; urls: string[] } =
    { mode: "continue", urls: [] };
  let selectedLanguages = ["en-US", "en"];
  let automaticPictureInPicture: "ask" | "allow" | "block" = "ask";
  let keepRuntimeInBackground = false;
  let defaultPageZoom = 100;
  let recoveryTabs =
    q.get("recovery") === "1"
      ? [
          {
            pageId: "saved-fixture-tab",
            title: "Saved project research",
            url: "https://example.com/research",
            windowId: "main",
            error: "The browser connection was interrupted while restoring this tab.",
            retrying: false,
          },
        ]
      : [];
  let bookmarks: { url: string; title: string; folderPath?: string[] }[] = [...BOOKMARKS];
  const bookmarkFolders: string[][] = [];
  const queuedMessages = new Map<string, RunMessage>();
  const imageReferences = new Map<string, { image: ConversationImage; dataUrl: string }[]>();
  const imageList = (chatId: string) => ({
    chatId,
    images: (imageReferences.get(chatId) ?? []).map((item) => item.image),
  });
  const conversationSpaces = new Map<string, string | null>();
  const memoryNotes = new Map<string, WorkspaceMemory>();
  const browsingMemory = new Map<
    string,
    { workspaceId: string; policy: BrowsingMemoryPolicy; pages: BrowsingMemoryPage[] }
  >();
  const contentMemory = new Map<string, ContentMemoryPolicy>();
  const inlineCaptures = new Map<
    string,
    { pageId: string; url: string; documentEpoch: number; drafted: boolean }
  >();
  const customCss = new Map<string, { css: string; updatedAt: number }>();
  let zapRules: ZapRule[] = [];
  let rankingChoices: CommandRankingEntry[] = [];
  let documentSelection: { selectionId: string; file: Awaited<ReturnType<typeof mockDocument>> } | null =
    null;
  let organization: OrganizationSnapshot = { revision: 0, layout: null };
  const organizationListeners = new Set<(revision: number) => void>();
  let history = [...HISTORY];
  const zoomLevels = new Map<string, number>();
  const zoomListeners = new Set<(payload: Record<string, never>) => void>();
  let spaces: BrowserSpace[] = [
    { ...DEFAULT_SPACE, workspaceId: `workspace:${DEFAULT_SPACE.id}`, archived: false },
  ];
  let pluginSkillGrants: PluginSkillGrant[] = [];
  const scenario = q.get("scenario") ?? "browsing";
  type DictationEvent = Parameters<Parameters<AuxBridge["onDictation"]>[0]>[0];
  const dictationListeners = new Set<(event: DictationEvent) => void>();
  const dictationEvent = (event: DictationEvent) => dictationListeners.forEach((listener) => listener(event));

  let extensions: BrowserExtension[] =
    scenario === "extensions"
      ? [
          {
            key: "synthetic-reader",
            name: "Synthetic reading helper",
            version: "1.0.0",
            permissions: ["storage", "https://example.com/*"],
            enabled: true,
            loaded: true,
            managed: true,
            source: "managed",
          },
          {
            key: "synthetic-disabled",
            name: "Synthetic disabled helper",
            version: "1.0.0",
            permissions: [],
            enabled: false,
            loaded: false,
            managed: true,
            source: "managed",
          },
        ]
      : [];
  let downloads: Download[] =
    scenario === "downloads"
      ? [
          {
            id: "download-active",
            filename: "Project assets.zip",
            path: "/tmp/Project assets.zip",
            state: "progressing",
            size: 4000000,
            totalBytes: 16000000,
            startedAt: Date.now(),
            canCancel: true,
            canResume: false,
          },
          {
            id: "download-done",
            filename: "Research report.pdf",
            path: "/tmp/Research report.pdf",
            state: "completed",
            size: 840000,
            startedAt: Date.now() - 10000,
            endedAt: Date.now() - 9000,
          },
          {
            id: "download-failed",
            filename: "Quarterly comparison.xlsx",
            path: "/tmp/Quarterly comparison.xlsx",
            sourceUrl: "https://example.com/report.xlsx",
            state: "interrupted",
            size: 400,
            startedAt: Date.now() - 20000,
            endedAt: Date.now() - 19000,
          },
          {
            id: "download-cancelled",
            filename: "Previous export.csv",
            path: "/tmp/Previous export.csv",
            state: "cancelled",
            size: 0,
            startedAt: Date.now() - 30000,
            endedAt: Date.now() - 29000,
          },
        ]
      : [];
  const live = q.get("live") === "1";
  const theme = q.get("theme") ?? "dark";
  if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
  const sidebar = q.get("sidebar");
  if (sidebar) localStorage.setItem("aux.sidebar", sidebar);
  else localStorage.removeItem("aux.sidebar");
  localStorage.setItem(
    "aux.layout.v1",
    JSON.stringify({
      spaces: [DEFAULT_SPACE],
      activeSpaceId: DEFAULT_SPACE.id,
      tabSpace: {},
      order: ["page-1", "page-2", "page-3", "page-4", "page-6", "page-5"],
      pins: { [DEFAULT_SPACE.id]: BOOKMARKS },
      folders: [
        { id: "folder-dev", name: "Dev", spaceId: DEFAULT_SPACE.id, collapsed: false },
        { id: "folder-social", name: "Social", spaceId: DEFAULT_SPACE.id, collapsed: true },
        { id: "folder-design", name: "Design", spaceId: DEFAULT_SPACE.id, collapsed: true },
        { id: "folder-rhema", name: "Rhema", spaceId: DEFAULT_SPACE.id, collapsed: true },
        { id: "folder-ai", name: "AI", spaceId: DEFAULT_SPACE.id, collapsed: true },
      ],
      tabFolder: {
        "page-1": "folder-dev",
        "page-2": "folder-dev",
        "page-3": "folder-dev",
        "page-4": "folder-dev",
        "page-6": "folder-social",
      },
    }),
  );
  localStorage.setItem("aux.sb-w", q.get("sbw") ?? "260");
  localStorage.setItem("aux.rail-w", q.get("railw") ?? "380");
  if (q.get("rail")) localStorage.setItem("aux.mock.rail", q.get("rail")!);
  else localStorage.removeItem("aux.mock.rail");

  // ---- state ----
  let seq = 100;
  const eventListeners = new Set<Listener<AuxEvent>>();
  const loadingListeners = new Set<Listener<{ pageId: string; loading: boolean }>>();
  const emit = (type: string, payload: Record<string, unknown>, runId?: string) => {
    const ev: AuxEvent = {
      seq: ++seq,
      streamId: "mock",
      type,
      payload,
      ts: Date.now(),
      ...(runId ? { runId } : {}),
    };
    for (const l of eventListeners) l(ev);
  };

  const tabCount = scenario === "start" ? 0 : scenario === "many" ? 45 : 6;
  let pages: PageTarget[] =
    tabCount === 6
      ? SIDEBAR_TABS.map((s, i) => makePage(i, {}, s))
      : Array.from({ length: tabCount }, (_, i) => makePage(i));
  let activePageId: string | null = pages[4]?.pageId ?? pages[0]?.pageId ?? null;
  const withRun = ["run", "takeover", "needs-input"].includes(scenario);
  const startRequests = new Map<string, { signature: string; runId: string | null }>();
  let runs: Run[] = [...PAST_RUNS];
  const resultFormat = q.get("resultFormat") ?? "markdown";
  const resultFixture = {
    artifactId: "mock-report",
    runId: "mock-report-run",
    chatId: "mock-report-chat",
    filename: `comparison.${resultFormat === "csv" ? "csv" : resultFormat === "json" ? "json" : "md"}`,
    mediaType:
      resultFormat === "csv" ? "text/csv" : resultFormat === "json" ? "application/json" : "text/markdown",
    byteLength: 180,
    createdAt: Date.now(),
    conversationTitle: "Compare browser choices",
    turnGoal: "Create a comparison report",
  };
  const resultContent =
    resultFormat === "csv"
      ? 'Area,Priority,Notes\nEveryday browsing,High,"Fast, calm navigation"\nHelpful assistance,High,"Clear answers"\n'
      : resultFormat === "json"
        ? JSON.stringify({
            priorities: [
              { area: "Everyday browsing", priority: "High" },
              { area: "Helpful assistance", priority: "High" },
            ],
          })
        : "# Browser comparison\n\nA saved report with clear next steps.\n\n| Area | Priority |\n| --- | --- |\n| Everyday browsing | High |\n| Helpful assistance | High |\n\nKeep the browsing experience calm and predictable.";
  const mockResultVersions = new Map<
    string,
    typeof resultFixture & {
      content: string;
      revision: number;
      parentArtifactId: string;
      rootArtifactId: string;
    }
  >();
  if (scenario === "results")
    runs.unshift(
      makeRun({
        runId: resultFixture.runId,
        goal: resultFixture.turnGoal,
        status: "completed",
        config: { chatId: resultFixture.chatId },
        result: { answer: `Saved ${resultFixture.filename}` },
      }),
    );
  const generatedKind = ["csv", "xlsx", "docx", "pptx", "chart"].includes(q.get("generatedKind") ?? "")
    ? q.get("generatedKind")!
    : "xlsx";
  const generatedSpec = GeneratedResultSpecSchema.parse(
    generatedKind === "csv"
      ? {
          kind: "csv",
          table: {
            name: "Priorities",
            rows: [
              ["Area", "Priority"],
              ["Browsing", "High"],
              ["Assistance", "High"],
            ],
          },
        }
      : generatedKind === "docx"
        ? {
            kind: "docx",
            title: "Browser comparison",
            paragraphs: ["Calm navigation and clear answers."],
            tables: [],
          }
        : generatedKind === "pptx"
          ? {
              kind: "pptx",
              slides: [{ title: "Browser comparison", bullets: ["Calm navigation", "Clear answers"] }],
            }
          : generatedKind === "chart"
            ? {
                kind: "chart",
                title: "Browser priorities",
                mark: "bar",
                x: "Area",
                y: "Score",
                data: [
                  { Area: "Browsing", Score: 4 },
                  { Area: "Assistance", Score: 5 },
                ],
              }
            : {
                kind: "xlsx",
                sheets: [
                  {
                    name: "Priorities",
                    rows: [
                      ["Area", "Priority"],
                      ["Browsing", "High"],
                      ["Assistance", "High"],
                    ],
                  },
                ],
              },
  );
  const generatedMedia = {
    csv: "text/csv",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    chart: "image/png",
  } as const;
  const generatedExt = { csv: "csv", xlsx: "xlsx", docx: "docx", pptx: "pptx", chart: "png" } as const;
  const generatedPreview = (spec: GeneratedResultSpec) => ({
    title:
      spec.kind === "docx" || spec.kind === "chart"
        ? spec.title
        : spec.kind === "pptx"
          ? `${spec.slides.length} slides`
          : spec.kind === "xlsx"
            ? `${spec.sheets.length} sheet`
            : spec.table.name,
    lines:
      spec.kind === "docx"
        ? spec.paragraphs.slice(0, 20)
        : spec.kind === "chart"
          ? [`${spec.mark} chart · ${spec.data.length} points`]
          : spec.kind === "pptx"
            ? spec.slides.slice(0, 20).map((slide) => slide.title)
            : spec.kind === "xlsx"
              ? spec.sheets.map((sheet) => `${sheet.name} · ${sheet.rows.length} rows`)
              : spec.table.rows.slice(0, 20).map((row) => row.join(" · ").slice(0, 500)),
  });
  const generatedFixture: GeneratedResult = {
    artifactId: "mock-generated",
    chatId: "mock-generated-chat",
    filename: `comparison.${generatedExt[generatedSpec.kind]}`,
    mediaType: generatedMedia[generatedSpec.kind],
    byteLength: 2400,
    createdAt: Date.now(),
    sha256: "5b73d2cfa82a3c4e65769ee4a54d153a9912d79756eaa60d98a85946328feaa9",
    kind: generatedSpec.kind,
    spec: generatedSpec,
    revision: 1,
    rootArtifactId: "mock-generated",
    parentArtifactId: "mock-generated",
    sourceRunId: "mock-generated-run",
    preview: generatedPreview(generatedSpec),
  };
  const generatedVersions = new Map<string, GeneratedResult>();
  if (scenario === "generated") {
    generatedVersions.set(generatedFixture.artifactId, generatedFixture);
    runs.unshift(
      makeRun({
        runId: generatedFixture.sourceRunId,
        goal: "Create a comparison file",
        status: "completed",
        config: { chatId: generatedFixture.chatId },
        result: { answer: `Saved ${generatedFixture.filename}` },
      }),
    );
  }
  const chatMetadata = new Map<
    string,
    { title: string; archived: boolean; updatedAt: number; privateTask: boolean }
  >();
  if (scenario === "results" && q.get("archived") === "1")
    chatMetadata.set(resultFixture.chatId, {
      title: resultFixture.conversationTitle,
      archived: true,
      privateTask: false,
      updatedAt: Date.now(),
    });
  if (scenario === "generated" && q.get("archived") === "1")
    chatMetadata.set(generatedFixture.chatId, {
      title: "Generated comparison",
      archived: true,
      privateTask: false,
      updatedAt: Date.now(),
    });
  for (const run of runs) {
    const chatId = run.config?.chatId ?? run.runId;
    if (!chatMetadata.has(chatId))
      chatMetadata.set(chatId, {
        title: run.goal,
        archived: false,
        privateTask: false,
        updatedAt: run.createdAt,
      });
  }
  const chatSummaries = (): ConversationSummary[] => {
    const groups = new Map<string, Run[]>();
    for (const run of runs) {
      const key = run.config?.chatId ?? run.runId;
      groups.set(key, [...(groups.get(key) ?? []), run]);
    }
    return [...groups]
      .map(([chatId, turns]) => {
        turns.sort((a, b) => b.createdAt - a.createdAt);
        const latestRun = turns[0]!,
          saved = chatMetadata.get(chatId);
        return {
          chatId,
          privateTask: saved?.privateTask ?? false,
          title: saved?.title ?? turns.at(-1)!.goal,
          archived: saved?.archived ?? false,
          createdAt: turns.at(-1)!.createdAt,
          updatedAt: saved?.updatedAt ?? latestRun.createdAt,
          turnCount: turns.length,
          latestRun,
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt || b.chatId.localeCompare(a.chatId));
  };
  const documents = new Map<
    string,
    {
      attachmentId: string;
      file: Awaited<ReturnType<typeof mockDocument>>;
      filename: string;
      sourceUrl?: string;
      sourceTruncated?: boolean;
      content: string;
      byteLength: number;
      createdAt: number;
      included: boolean;
    }[]
  >();
  const artifactChips = new Map<
    string,
    {
      artifactId: string;
      runId: string;
      filename: string;
      mediaType: string;
      excerpt: string;
      byteLength: number;
      createdAt: number;
      turnGoal: string;
      included: boolean;
      revision?: number;
      generatedKind?: GeneratedResultSpec["kind"];
      sourceArtifactIds?: string[];
    }[]
  >();
  if (scenario === "results")
    artifactChips.set(resultFixture.chatId, [
      { ...resultFixture, excerpt: resultContent.slice(0, 1000), included: true },
    ]);
  if (scenario === "generated")
    artifactChips.set(generatedFixture.chatId, [
      {
        artifactId: generatedFixture.artifactId,
        runId: generatedFixture.sourceRunId,
        filename: generatedFixture.filename,
        mediaType: generatedFixture.mediaType,
        excerpt: generatedFixture.preview.lines.join(" · "),
        byteLength: generatedFixture.byteLength,
        createdAt: generatedFixture.createdAt,
        turnGoal: "Create a comparison file",
        included: true,
        revision: 1,
        generatedKind: generatedFixture.kind,
      },
    ]);
  const documentList = (chatId: string) => ({
    chatId,
    attachments: (documents.get(chatId) ?? []).map(({ content, file, ...item }) => ({
      ...item,
      document: file.manifest,
      excerpt: content.slice(0, 1000),
    })),
  });
  let steps: Record<string, StepRecord[]> = {};
  const settings: Record<string, unknown> = {
    theme,
    tabLayout: q.get("layout") === "horizontal" ? "horizontal" : "vertical",
    searchEngine: DEFAULT_SEARCH_ENGINE,
    plannerModel: "meta/muse-spark-1.3-contributor",
    maxWorkers: 4,
    maxModelCalls: 0,
    gatewayApiKey: "••••••••",
    effectGrants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
  };

  if (withRun) {
    activePageId = "page-1";
    const run = makeRun(
      scenario === "takeover"
        ? { status: "paused", statusMessage: "Paused — you're in control of this page" }
        : scenario === "needs-input"
          ? {
              status: "needs_input",
              statusMessage:
                "Two comment threads are marked resolved but still discuss focus rings. Include resolved threads too?",
            }
          : {},
    );
    runs = [run, ...runs];
    steps[RUN_ID] = makeSteps(RUN_ID, scenario === "run" ? 6 : 8);
    pages = pages.map((p) =>
      p.pageId === "page-1"
        ? { ...p, controller: scenario === "takeover" ? "human" : "agent", controllerEpoch: 2 }
        : p,
    );
  } else if (scenario !== "start" && pages.length) {
    pages = pages.map((p, i) => (i === 4 ? { ...p, backend: "chrome" } : p));
  }
  if (scenario === "many")
    pages = pages.map((p, i) =>
      i === 7 ? { ...p, loading: true } : i === 21 ? { ...p, viewStatus: "crashed" } : p,
    );

  const sets = scenario === "set" || withRun ? [SET] : [];
  const members = sets.length ? MEMBERS : [];

  const workspace = () => ({
    pages,
    sets,
    members,
    runs,
    sessions: [{ sessionId: "sess-1", backend: "aux", label: "Aux", status: "connected" }],
    activePageId,
    lastSeq: seq,
    streamId: "mock",
  });

  const page = (id: string) => {
    const p = pages.find((x) => x.pageId === id);
    if (!p) throw new Error(`no page ${id}`);
    return p;
  };
  const patch = (id: string, fields: Partial<PageTarget>) => {
    pages = pages.map((p) => (p.pageId === id ? { ...p, ...fields } : p));
    emit("page.updated", { page: page(id) });
  };
  const patchRun = (id: string, fields: Partial<Run>, status = false) => {
    runs = runs.map((r) => (r.runId === id ? { ...r, ...fields } : r));
    emit(status ? "run.status" : "run.updated", { run: runs.find((r) => r.runId === id) }, id);
  };

  let nextId = pages.length + 1;
  type MockHandler = (p: Record<string, unknown>, method: string) => Promise<unknown>;
  const mockWorkspacesBrowsingMemoryGet: MockHandler = async (p, method) => {
    const workspaceId = String(p.workspaceId);
    const prior = browsingMemory.get(workspaceId) ?? {
      workspaceId,
      policy: { enabled: false, retentionDays: 7 as const },
      pages: [],
    };
    const policy =
      method === "workspaces.browsingMemory.set" ? (p.policy as BrowsingMemoryPolicy) : prior.policy;
    const pages = prior.pages.filter(
      (page) =>
        page.lastVisitedAt > Date.now() - policy.retentionDays * 86_400_000 &&
        (method !== "workspaces.browsingMemory.forget" || (p.memoryId && page.memoryId !== p.memoryId)),
    );
    const next = { workspaceId, policy, pages };
    browsingMemory.set(workspaceId, next);
    if (method !== "workspaces.browsingMemory.get") emit("workspace.browsingMemory.updated", { workspaceId });
    return next;
  };
  const mockConversationsRename: MockHandler = async (p, method) => {
    const item = chatSummaries().find((item) => item.chatId === p.chatId);
    if (!item) throw new Error("Conversation not found");
    const changed = {
      ...item,
      title: method.endsWith("rename") ? String(p.title) : item.title,
      archived: method.endsWith("archive") ? !!p.archived : item.archived,
      updatedAt: Date.now(),
    };
    chatMetadata.set(item.chatId, changed);
    emit("conversation.changed", { chatId: item.chatId, title: changed.title, archived: changed.archived });
    return changed;
  };
  const mockConversationsWorkspaceGet: MockHandler = async (p, method) => {
    const chatId = String(p.chatId);
    if (method === "conversations.workspace.set") {
      conversationSpaces.set(chatId, p.workspaceId as string | null);
      emit("conversation.changed", { chatId });
    }
    const workspaceId = conversationSpaces.get(chatId);
    const space = spaces.find((item) => item.workspaceId === workspaceId);
    const workspace = space ? { workspaceId: space.workspaceId!, name: space.name, createdAt: 0 } : null;
    const memory = workspace
      ? (memoryNotes.get(workspace.workspaceId) ?? {
          workspaceId: workspace.workspaceId,
          content: "",
          revision: 0,
          enabled: true,
        })
      : null;
    return {
      chatId,
      workspace,
      memory,
      assigned: conversationSpaces.has(chatId),
      memoryPreview: workspaceMemoryText(memory),
      browsingPreview: "",
    };
  };
  const mockConversationsImagesToggle: MockHandler = async (p, method) => {
    const chatId = String(p.chatId),
      items = imageReferences.get(chatId) ?? [];
    imageReferences.set(
      chatId,
      method.endsWith("remove")
        ? items.filter((item) => item.image.imageId !== p.imageId)
        : items.map((item) =>
            item.image.imageId === p.imageId
              ? { ...item, image: { ...item.image, included: !!p.included } }
              : item,
          ),
    );
    return imageList(chatId);
  };
  const mockConversationsAttachmentsToggle: MockHandler = async (p, method) => {
    const chatId = String(p.chatId),
      items = documents.get(chatId) ?? [];
    documents.set(
      chatId,
      method.endsWith("remove")
        ? items.filter((item) => item.attachmentId !== p.attachmentId)
        : items.map((item) =>
            item.attachmentId === p.attachmentId ? { ...item, included: !!p.included } : item,
          ),
    );
    emit("conversation.context.changed", { chatId });
    return documentList(chatId);
  };
  const mockPagesBack: MockHandler = async (p) => {
    return page(p.pageId as string);
  };
  const work = workFixtures(
    `workspace:${DEFAULT_SPACE.id}`,
    scenario === "work" || scenario === "connectors",
    scenario === "connectors",
  );
  const connectors = connectorFixtures(
    `workspace:${DEFAULT_SPACE.id}`,
    () => work["tasks.list"](),
    scenario === "connectors",
  );
  const liveFolderRows = new Map<string, import("@aux/contracts").LiveFolderItem[]>();
  const nativeTrustUnavailable: MockHandler = async () => {
    throw new AuxError(
      "capability_unsupported",
      "Agent access and site permissions require Aux desktop. Open Aux to review or change access.",
    );
  };
  const nativeCodingUnavailable: MockHandler = async () => {
    throw new AuxError("capability_unsupported", "Coding runs and Aux Packages require the Aux runtime.");
  };
  const handlers = {
    "coding.activity": nativeCodingUnavailable,
    "coding.worktreeInspect": nativeCodingUnavailable,
    "coding.worktreeArchive": nativeCodingUnavailable,
    "coding.changes": nativeCodingUnavailable,
    "coding.undo": nativeCodingUnavailable,
    "coding.processes": nativeCodingUnavailable,
    "coding.logs": nativeCodingUnavailable,
    "coding.stop": nativeCodingUnavailable,
    "packages.list": nativeCodingUnavailable,
    "packages.install": nativeCodingUnavailable,
    "packages.remove": nativeCodingUnavailable,
    "packages.defaults": nativeCodingUnavailable,
    "safety.grants.revokeRun": nativeTrustUnavailable,
    "safety.decisions.list": nativeTrustUnavailable,
    "liveFolders.items": async (p: Record<string, unknown>) => ({
      folderId: String(p.folderId),
      items: liveFolderRows.get(String(p.folderId)) ?? [],
    }),
    "liveFolders.refresh": async (p: Record<string, unknown>) => {
      const folderId = String(p.folderId);
      const source = organization.layout?.shared.folders.find((folder) => folder.id === folderId)?.live;
      if (!source) throw new Error("Choose a live folder source first.");
      if (source.kind === "github")
        return {
          folderId,
          items: liveFolderRows.get(folderId) ?? [],
          error: "Couldn't refresh — Reconnect GitHub",
        };
      const items = liveFolderRows.get(folderId) ?? [
        {
          id: "preview-article",
          url: "https://example.com/article",
          title: "Research worth revisiting",
          subtitle: "example.com",
          unread: true,
          updatedAt: 0,
        },
      ];
      liveFolderRows.set(folderId, items);
      return { folderId, items, refreshedAt: Date.now() };
    },
    "liveFolders.markRead": async (p: Record<string, unknown>) => {
      const folderId = String(p.folderId);
      const items = liveFolderRows.get(folderId) ?? [];
      if (!items.some((item) => item.id === p.itemId))
        throw new Error("This live item is no longer available.");
      liveFolderRows.set(
        folderId,
        items.map((item) => (item.id === p.itemId ? { ...item, unread: false } : item)),
      );
      return { ok: true };
    },
    "agent.inlineAssist.capture": async (p) => {
      const source = pages.find((item) => item.pageId === p.pageId);
      if (!source || source.url !== p.expectedUrl || source.documentEpoch !== p.expectedDocumentEpoch)
        throw new Error("The page changed. Review the field and retry.");
      const captureId = crypto.randomUUID();
      inlineCaptures.set(captureId, {
        pageId: source.pageId,
        url: source.url,
        documentEpoch: source.documentEpoch,
        drafted: false,
      });
      return {
        captureId,
        pageId: source.pageId,
        url: source.url,
        documentEpoch: source.documentEpoch,
        origin: new URL(source.url).origin,
        fieldLabel: "Project note",
        sourceText: "Summarize the key point clearly.",
        mode: "field",
      };
    },
    "agent.inlineAssist.draft": async (p) => {
      const capture = inlineCaptures.get(String(p.captureId));
      if (
        !capture ||
        !pages.some(
          (item) =>
            item.pageId === capture.pageId &&
            item.url === capture.url &&
            item.documentEpoch === capture.documentEpoch,
        )
      )
        throw new Error("This field changed. Select it and start again.");
      capture.drafted = true;
      return {
        captureId: p.captureId,
        replacement: `A clear project note: ${String(p.instruction).trim()}`,
        modelId: "meta/muse-spark-1.3-contributor",
      };
    },
    "agent.inlineAssist.apply": async (p) => {
      const capture = inlineCaptures.get(String(p.captureId));
      if (
        !capture?.drafted ||
        !pages.some(
          (item) =>
            item.pageId === capture.pageId &&
            item.url === capture.url &&
            item.documentEpoch === capture.documentEpoch,
        )
      )
        throw new Error("This field changed. Select it and start again.");
      inlineCaptures.delete(String(p.captureId));
      return { applied: true, undoAvailable: true };
    },
    "agent.inlineAssist.cancel": async (p) => {
      inlineCaptures.delete(String(p.captureId));
      return { cancelled: true };
    },
    "agent.tabName.suggest": async (p) => {
      const source = pages.find((item) => item.pageId === p.pageId);
      if (!source || source.url !== p.expectedUrl || source.documentEpoch !== p.expectedDocumentEpoch)
        throw new Error("The tab changed. Review it and try again.");
      const short = source.title.split(/[|–—]/)[0]!.trim().slice(0, 60);
      return {
        pageId: source.pageId,
        sourceUrl: source.url,
        sourceTitle: source.title,
        documentEpoch: source.documentEpoch,
        name: short.length >= 2 ? short : "Useful page",
        modelId: "meta/muse-spark-1.3-contributor",
      };
    },
    "agent.tidy.propose": async (p) => {
      const pageIds = p.pageIds as string[];
      const chosen = pageIds.map((id) => pages.find((item) => item.pageId === id));
      if (chosen.some((item) => !item))
        throw new Error("A selected tab closed. Review the selection and retry.");
      const source = chosen as PageTarget[];
      return {
        pages: source.map((item) => ({ pageId: item.pageId, url: item.url, title: item.title })),
        groups: [
          { name: "Research", pageIds: pageIds.slice(0, 2) },
          ...(pageIds.length >= 4 ? [{ name: "More reading", pageIds: pageIds.slice(2, 4) }] : []),
        ],
        modelId: "meta/muse-spark-1.3-contributor",
        createdAt: Date.now(),
      };
    },
    "customization.zap.pick": async (p) => {
      const current = page(String(p.pageId));
      if (current.documentEpoch !== p.expectedDocumentEpoch)
        throw new Error("The page changed. Start Zap again.");
      const origin = new URL(current.url).origin;
      return new Promise((resolve) => {
        const finish = (result: object) => {
          clearTimeout(timer);
          document.removeEventListener("click", clicked, true);
          document.removeEventListener("keydown", key, true);
          resolve(result);
        };
        const clicked = (event: MouseEvent) => {
          const target = event.target instanceof Element ? event.target.closest(".mock-page *") : null;
          if (!target) return;
          event.preventDefault();
          event.stopPropagation();
          const element = target.closest(".mp-card") ?? target;
          const klass = [...element.classList][0];
          const broad = klass ? `.${klass}` : element.tagName.toLowerCase();
          const siblings = element.parentElement
            ? [...element.parentElement.children].filter((item) => item.tagName === element.tagName)
            : [];
          const exact = `${broad}:nth-of-type(${siblings.indexOf(element) + 1})`;
          const count = document.querySelectorAll(broad).length;
          finish({
            picked: true,
            pageId: current.pageId,
            documentEpoch: current.documentEpoch,
            origin,
            tag: element.tagName.toLowerCase(),
            text: (element.textContent ?? "").trim().slice(0, 160),
            candidates: [
              { selector: exact, matchCount: 1, targetLevel: 0, score: 25, related: false },
              ...(count > 1 && count <= 100
                ? [{ selector: broad, matchCount: count, targetLevel: 0, score: 20, related: true }]
                : []),
            ],
          });
        };
        const key = (event: KeyboardEvent) => {
          if (event.key === "Escape") finish({ picked: false });
        };
        const timer = setTimeout(() => finish({ picked: false }), Number(p.timeoutMs ?? 60_000));
        document.addEventListener("click", clicked, true);
        document.addEventListener("keydown", key, true);
      });
    },
    "customization.zap.list": async (p) => zapRules.filter((rule) => rule.origin === p.origin),
    "customization.zap.add": async (p) => {
      const current = page(String(p.pageId));
      if (current.documentEpoch !== p.expectedDocumentEpoch || new URL(current.url).origin !== p.origin)
        throw new Error("The page changed before Zap was saved.");
      const selector = String(p.selector);
      const count = document.querySelectorAll(selector).length;
      if (count < 1 || count > 100)
        throw new Error("Zap selector must match between 1 and 100 elements on this page.");
      const existing = zapRules.find((rule) => rule.origin === p.origin && rule.selector === selector);
      if (existing) return existing;
      const rule: ZapRule = {
        ruleId: crypto.randomUUID(),
        origin: String(p.origin),
        selector,
        matchCount: count,
        createdAt: Date.now(),
      };
      zapRules = [rule, ...zapRules];
      return rule;
    },
    "customization.zap.remove": async (p) => {
      const before = zapRules.length;
      zapRules = zapRules.filter((rule) => rule.ruleId !== p.ruleId);
      return { removed: zapRules.length < before };
    },
    "customization.css.get": async (p) => ({
      origin: p.origin,
      css: customCss.get(String(p.origin))?.css ?? "",
      updatedAt: customCss.get(String(p.origin))?.updatedAt ?? null,
    }),
    "customization.css.set": async (p) => {
      const origin = String(p.origin),
        css = String(p.css);
      if (css.trim()) customCss.set(origin, { css, updatedAt: Date.now() });
      else customCss.delete(origin);
      return {
        origin,
        css: customCss.get(origin)?.css ?? "",
        updatedAt: customCss.get(origin)?.updatedAt ?? null,
      };
    },
    "customization.css.apply": async (p) => {
      const current = page(String(p.pageId));
      if (current.documentEpoch !== p.expectedDocumentEpoch)
        throw new Error("The page changed before CSS was applied.");
      const origin = new URL(current.url).origin;
      const css = [
        ...zapRules
          .filter((rule) => rule.origin === origin)
          .map((rule) => `${rule.selector} { display: none !important; }`),
        customCss.get(origin)?.css ?? "",
      ]
        .filter(Boolean)
        .join("\n");
      let style = document.querySelector<HTMLStyleElement>('style[data-aux-user-css="mock"]');
      if (!css) style?.remove();
      else {
        if (!style) {
          style = document.createElement("style");
          style.dataset.auxUserCss = "mock";
          document.head.append(style);
        }
        style.textContent = css;
      }
      return { applied: true, origin };
    },
    "workspace.get": async () => {
      return workspace();
    },
    "spaces.list": async () => {
      if (organization.layout) {
        const shared = organization.layout.shared;
        spaces = [
          ...shared.spaces.map((space) => ({ ...space, archived: false })),
          ...shared.archivedSpaces.map((space) => ({ ...space, archived: true })),
        ].map((space) => ({
          ...space,
          workspaceId:
            spaces.find((known) => known.id === space.id)?.workspaceId ??
            `mock-workspace:${crypto.randomUUID()}`,
        }));
      }
      return spaces;
    },
    "workspaces.browsingMemory.get": mockWorkspacesBrowsingMemoryGet,
    "workspaces.browsingMemory.set": mockWorkspacesBrowsingMemoryGet,
    "workspaces.browsingMemory.forget": mockWorkspacesBrowsingMemoryGet,
    "workspaces.browsingMemory.record": async () => {
      return { recorded: false };
    },
    "workspaces.contentMemory.policy": async (p) =>
      contentMemory.get(String(p.workspaceId)) ?? { enabled: false, retentionDays: 30, allowedOrigins: [] },
    "workspaces.contentMemory.setPolicy": async (p) => {
      const policy = p.policy as ContentMemoryPolicy;
      contentMemory.set(String(p.workspaceId), policy);
      emit("workspace.contentMemory.updated", { workspaceId: String(p.workspaceId) });
      return policy;
    },
    "workspaces.contentMemory.capture": async () => {
      throw new Error("Article capture needs a native Aux tab.");
    },
    "workspaces.contentMemory.list": async () => ({ items: [], selected: [], nextCursor: null }),
    "workspaces.contentMemory.search": async () => [],
    "workspaces.contentMemory.get": async () => null,
    "workspaces.contentMemory.forget": async (p) => {
      emit("workspace.contentMemory.updated", { workspaceId: String(p.workspaceId) });
      return { forgotten: 0 };
    },
    "workspaces.memory.get": async (p) => {
      return (
        memoryNotes.get(String(p.workspaceId)) ?? {
          workspaceId: String(p.workspaceId),
          content: "",
          revision: 0,
          enabled: true,
        }
      );
    },
    "workspaces.memory.set": async (p) => {
      const workspaceId = String(p.workspaceId),
        prior = memoryNotes.get(workspaceId);
      if ((prior?.revision ?? 0) !== p.expectedRevision)
        throw new Error("Workspace memory changed; reload it before saving.");
      const next = {
        workspaceId,
        excludedOrigins: (p.excludedOrigins as string[] | undefined) ?? prior?.excludedOrigins ?? [],
        content: String(p.content),
        items: (p.items as WorkspaceMemory["items"]) ?? prior?.items ?? [],
        revision: (prior?.revision ?? 0) + 1,
        enabled: typeof p.enabled === "boolean" ? p.enabled : (prior?.enabled ?? true),
        updatedAt: Date.now(),
      };
      memoryNotes.set(workspaceId, next);
      emit("workspace.memory.updated", { workspaceId, revision: next.revision });
      return next;
    },
    "workspaces.memory.search": async (p) => {
      return [...memoryNotes.values()]
        .filter(
          (memory) =>
            [memory.content, ...(memory.items ?? []).map((item) => `${item.content} ${item.sourceUrl ?? ""}`)]
              .join("\n")
              .toLowerCase()
              .includes(String(p.query).toLowerCase()) ||
            spaces
              .find((space) => space.workspaceId === memory.workspaceId)
              ?.name.toLowerCase()
              .includes(String(p.query).toLowerCase()),
        )
        .map((memory) => ({
          workspaceId: memory.workspaceId,
          name: spaces.find((space) => space.workspaceId === memory.workspaceId)?.name ?? "Space",
          excerpt: memory.content.slice(0, 240),
          enabled: memory.enabled,
        }));
    },
    "workspaces.list": async () => {
      return spaces.map((space) => ({ workspaceId: space.workspaceId, name: space.name, createdAt: 0 }));
    },
    ...connectors,
    "plugins.inspect": async () => {
      return {
        name: "Example bundle",
        version: "1.0",
        routineCount: 1,
        routineTitles: ["Weekly digest"],
        format: "aux-plugin@1",
        assets: [],
        digest: "a".repeat(64),
      };
    },
    "plugins.install": async (p) => {
      return {
        plugin: {
          pluginId: "plg-1",
          name: "Example bundle",
          workspaceId: p.workspaceId,
          routineIds: [],
          installedAt: Date.now(),
        },
        imported: 0,
        skipped: 1,
      };
    },
    "plugins.list": async () => {
      return [];
    },
    "plugins.assets": async () => [],
    "plugins.skills.grant": async (p) => {
      const grant: PluginSkillGrant = {
        grantId: crypto.randomUUID(),
        assetId: String(p.assetId),
        assetDigest: String(p.expectedDigest),
        scope: p.scope as PluginSkillGrant["scope"],
        createdAt: Date.now(),
      };
      pluginSkillGrants = [grant, ...pluginSkillGrants];
      return grant;
    },
    "plugins.skills.grants": async () => pluginSkillGrants,
    "plugins.skills.revoke": async (p) => {
      pluginSkillGrants = pluginSkillGrants.map((grant) =>
        grant.grantId === p.grantId ? { ...grant, revokedAt: Date.now() } : grant,
      );
      return pluginSkillGrants.find((grant) => grant.grantId === p.grantId);
    },
    "plugins.uninstall": async (p) => {
      return {
        plugin: {
          pluginId: p.pluginId,
          name: "Example bundle",
          workspaceId: "",
          routineIds: [],
          installedAt: Date.now(),
          uninstalledAt: Date.now(),
        },
        archivedRoutines: 0,
      };
    },
    ...work,
    "conversations.prepared": async () => {
      return [];
    },
    "conversations.list": async (p) => {
      const query = String(p.query ?? "").toLowerCase(),
        before = p.before as { updatedAt: number; chatId: string } | undefined;
      return chatSummaries()
        .filter(
          (item) =>
            (p.workspaceId === undefined || conversationSpaces.get(item.chatId) === p.workspaceId) &&
            item.archived === !!p.archived &&
            (!query ||
              `${item.title} ${item.latestRun.goal} ${String(item.latestRun.result?.answer ?? "")}`
                .toLowerCase()
                .includes(query)) &&
            (!before ||
              item.updatedAt < before.updatedAt ||
              (item.updatedAt === before.updatedAt && item.chatId < before.chatId)),
        )
        .slice(0, Number(p.limit ?? 40));
    },
    "conversations.get": async (p) => {
      return chatSummaries().find((item) => item.chatId === p.chatId) ?? null;
    },
    "conversations.search": async (p) => {
      const input = MethodSchemas["conversations.search"].parse(p);
      const expression = new RegExp(input.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "giu");
      const hits = runs
        .filter((run) => (run.config?.chatId ?? run.runId) === input.chatId)
        .sort((a, b) => b.createdAt - a.createdAt || b.runId.localeCompare(a.runId))
        .flatMap((run) =>
          [
            { part: "goal", text: run.goal },
            ...[...queuedMessages.values()]
              .filter(
                (message) =>
                  message.targetRunId === run.runId &&
                  message.mode === "steer" &&
                  message.status === "delivered",
              )
              .map((message) => ({ part: `steer:${message.messageId}`, text: message.text })),
            { part: "reply", text: conversationReplyText(run) },
            { part: "error", text: run.failure?.message ?? run.error ?? "" },
          ].flatMap(({ part, text }) =>
            [...text.matchAll(expression)].map((match, occurrence) => ({
              runId: run.runId,
              part,
              offset: match.index,
              occurrence,
              excerpt: text.slice(Math.max(0, match.index - 80), match.index + match[0].length + 120),
            })),
          ),
        );
      const prior = input.cursor
        ? hits.findIndex(
            (hit) =>
              hit.runId === input.cursor!.runId &&
              hit.part === input.cursor!.part &&
              hit.offset === input.cursor!.offset,
          )
        : -1;
      const index =
        prior < 0
          ? input.direction === "previous"
            ? hits.length - 1
            : 0
          : (prior +
              (input.direction === "next" ? 1 : input.direction === "previous" ? -1 : 0) +
              hits.length) %
            hits.length;
      return { match: hits[index] ?? null, matches: hits.length, activeMatch: hits.length ? index + 1 : 0 };
    },
    "conversations.turns": async (p) => {
      const chat = runs
        .filter((run) => (run.config?.chatId ?? run.runId) === p.chatId)
        .sort((a, b) => a.createdAt - b.createdAt || a.runId.localeCompare(b.runId));
      const index = chat.findIndex((run) => run.runId === p.runId);
      if (index < 0) throw new Error("This message is no longer in the conversation.");
      const start = Math.max(0, index - 24),
        end = Math.min(chat.length, index + 25);
      return {
        runs: chat.slice(start, end),
        earlierRunId: chat[start - 1]?.runId ?? null,
        laterRunId: chat[end]?.runId ?? null,
      };
    },
    "conversations.rename": mockConversationsRename,
    "conversations.archive": mockConversationsRename,
    "conversations.delete": async (p) => {
      const before = runs.length;
      runs = runs.filter((run) => (run.config?.chatId ?? run.runId) !== p.chatId);
      chatMetadata.delete(String(p.chatId));
      documents.delete(String(p.chatId));
      emit("conversation.deleted", { chatId: p.chatId });
      return { ok: true, deletedRuns: before - runs.length };
    },
    "runs.context.get": async (p) => ({ chatId: p.chatId, historyEnabled: true, entries: [] }),
    "runs.context.set": async (p) => ({
      chatId: p.chatId,
      historyEnabled: p.historyEnabled ?? true,
      entries: [],
    }),
    "results.generate": async (p) => {
      const input = GenerateResultParamsSchema.parse(p);
      const turns = runs.filter((run) => (run.config?.chatId ?? run.runId) === input.chatId);
      if (!turns.length) throw new Error("This conversation is unavailable.");
      const source = input.sourceArtifactId ? generatedVersions.get(input.sourceArtifactId) : undefined;
      if (
        input.sourceArtifactId &&
        (!source || source.chatId !== input.chatId || source.kind !== input.spec.kind)
      )
        throw new Error("The source result is unavailable in this conversation.");
      const history = source
        ? [...generatedVersions.values()].filter((item) => item.rootArtifactId === source.rootArtifactId)
        : [];
      const revision = source ? Math.max(...history.map((item) => item.revision)) + 1 : 1;
      if (revision > 20) throw new Error("This result has reached its 20-version limit.");
      const run = turns.sort((a, b) => b.createdAt - a.createdAt)[0]!;
      const artifactId = `mock-generated-${crypto.randomUUID()}`;
      const ext = generatedExt[input.spec.kind];
      const filename = input.filename.toLowerCase().endsWith(`.${ext}`)
        ? input.filename
        : `${input.filename.replace(/\.[^.]+$/g, "")}.${ext}`;
      const saved: GeneratedResult = {
        artifactId,
        chatId: input.chatId,
        filename,
        mediaType: generatedMedia[input.spec.kind],
        byteLength: Math.max(256, JSON.stringify(input.spec).length),
        createdAt: Date.now(),
        sha256: "5b73d2cfa82a3c4e65769ee4a54d153a9912d79756eaa60d98a85946328feaa9",
        kind: input.spec.kind,
        spec: input.spec,
        revision,
        rootArtifactId: source?.rootArtifactId ?? artifactId,
        parentArtifactId: source?.artifactId ?? artifactId,
        sourceRunId: run.runId,
        preview: generatedPreview(input.spec),
      };
      generatedVersions.set(artifactId, saved);
      const chips = artifactChips.get(input.chatId) ?? [];
      if (source) for (const chip of chips) if (chip.artifactId === source.artifactId) chip.included = false;
      chips.unshift({
        artifactId,
        runId: run.runId,
        filename,
        mediaType: saved.mediaType,
        excerpt: saved.preview.lines.join(" · ").slice(0, 1000),
        byteLength: saved.byteLength,
        createdAt: saved.createdAt,
        turnGoal: run.goal,
        included: true,
        revision,
        generatedKind: saved.kind,
        sourceArtifactIds: source ? [source.artifactId] : [],
      });
      artifactChips.set(input.chatId, chips);
      emit("conversation.context.changed", { chatId: input.chatId });
      return saved;
    },
    "results.generated.get": async (p) => {
      const item = generatedVersions.get(String(p.artifactId));
      if (!item) throw new Error("This generated result is unavailable.");
      return item;
    },
    "results.generated.versions": async (p) => {
      const item = generatedVersions.get(String(p.artifactId));
      if (!item) throw new Error("This generated result is unavailable.");
      return [...generatedVersions.values()]
        .filter((version) => version.rootArtifactId === item.rootArtifactId)
        .sort((a, b) => a.revision - b.revision)
        .map(({ spec: _spec, ...summary }) => summary);
    },
    "results.search": async (p) => {
      return scenario === "results" &&
        `${resultFixture.filename} ${resultFixture.conversationTitle}`
          .toLowerCase()
          .includes(String(p.query).toLowerCase())
        ? [resultFixture, ...mockResultVersions.values()]
        : [];
    },
    "command.ranking.list": async () => rankingChoices,
    "command.ranking.record": async (p) => {
      const input = p as { query: string; candidateKey: string; source: CommandRankingEntry["source"] };
      const query = normalizeCommandRankingQuery(input.query);
      const prior = rankingChoices.find(
        (item) => item.query === query && item.candidateKey === input.candidateKey,
      );
      const entry = {
        query,
        candidateKey: input.candidateKey,
        source: input.source,
        uses: Math.min(1000, (prior?.uses ?? 0) + 1),
        lastUsedAt: Date.now(),
      };
      rankingChoices = [
        entry,
        ...rankingChoices.filter((item) => item.query !== query || item.candidateKey !== input.candidateKey),
      ].slice(0, 400);
      return entry;
    },
    "command.ranking.clear": async () => {
      const removed = rankingChoices.length;
      rankingChoices = [];
      return { removed };
    },
    "results.read": async (p) => {
      if (scenario !== "results") throw new Error("Saved result is unavailable.");
      if (p.artifactId === resultFixture.artifactId) return { ...resultFixture, content: resultContent };
      const version = mockResultVersions.get(String(p.artifactId));
      if (!version) throw new Error("Saved result is unavailable.");
      return version;
    },
    "results.available": async (p) =>
      (p.drafts as { artifactId: string; chatId: string }[])
        .filter(
          (item) =>
            scenario === "results" &&
            item.chatId === resultFixture.chatId &&
            (item.artifactId === resultFixture.artifactId || mockResultVersions.has(item.artifactId)),
        )
        .map((item) => item.artifactId),
    "results.saveVersion": async (p) => {
      const parent = mockResultVersions.get(String(p.sourceArtifactId));
      const revision = (parent?.revision ?? 1) + 1;
      const saved = {
        ...resultFixture,
        artifactId: `edited-${crypto.randomUUID()}`,
        content: String(p.content),
        createdAt: Date.now(),
        revision,
        parentArtifactId: String(p.sourceArtifactId),
        rootArtifactId: parent?.rootArtifactId ?? String(p.sourceArtifactId),
      };
      mockResultVersions.set(saved.artifactId, saved);
      artifactChips.set(String(p.chatId), [
        ...(artifactChips.get(String(p.chatId)) ?? []),
        {
          ...saved,
          excerpt: saved.content.slice(0, 1000),
          included: true,
          sourceArtifactIds: [String(p.sourceArtifactId)],
        },
      ]);
      emit("conversation.context.changed", { chatId: p.chatId });
      return saved;
    },
    "conversations.artifacts.get": async (p) => {
      return { chatId: p.chatId, artifacts: [...(artifactChips.get(String(p.chatId)) ?? [])] };
    },
    "conversations.artifacts.toggle": async (p) => {
      const chatId = String(p.chatId);
      const list = artifactChips.get(chatId) ?? [];
      for (const item of list) if (item.artifactId === p.artifactId) item.included = !!p.included;
      return { chatId, artifacts: [...list] };
    },
    "conversations.sources.get": async (p) => {
      return { chatId: p.chatId, sources: [] };
    },
    "conversations.workspace.get": mockConversationsWorkspaceGet,
    "conversations.workspace.set": mockConversationsWorkspaceGet,
    "pages.capture": async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 800;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#f5f6fa";
      ctx.fillRect(0, 0, 1280, 800);
      ctx.fillStyle = "#202532";
      ctx.font = "40px system-ui";
      ctx.fillText("Project research — sample page", 90, 120);
      ctx.font = "24px system-ui";
      ctx.fillText("Mock capture for reviewing the attachment interface", 90, 180);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = ["#dae7ff", "#e7defa", "#dbece5"][i]!;
        ctx.fillRect(90 + i * 365, 260, 330, 360);
      }
      return { dataUrl: canvas.toDataURL("image/png"), width: 1280, height: 800, scale: 1 };
    },
    "conversations.images.get": async (p) => {
      return imageList(String(p.chatId));
    },
    "conversations.images.add": async (p) => {
      const chatId = String(p.chatId),
        items = imageReferences.get(chatId) ?? [];
      if (items.length >= 4) throw new Error("A conversation can hold four image references.");
      const bitmap = new Image();
      bitmap.src = String(p.dataUrl);
      await bitmap.decode();
      const image: ConversationImage = {
        imageId: crypto.randomUUID(),
        artifactId: crypto.randomUUID(),
        filename: String(p.filename),
        sourceUrl: p.sourceUrl as string | undefined,
        sourcePage: p.sourcePage as ConversationImage["sourcePage"],
        width: bitmap.naturalWidth,
        height: bitmap.naturalHeight,
        byteLength: Math.floor(String(p.dataUrl).length * 0.75),
        createdAt: Date.now(),
        included: true,
      };
      items.push({ image, dataUrl: String(p.dataUrl) });
      imageReferences.set(chatId, items);
      return imageList(chatId);
    },
    "conversations.images.read": async (p) => {
      const item = (imageReferences.get(String(p.chatId)) ?? []).find(
        (item) => item.image.imageId === p.imageId,
      );
      if (!item) throw new Error("Image reference not found.");
      return item;
    },
    "conversations.images.toggle": mockConversationsImagesToggle,
    "conversations.images.remove": mockConversationsImagesToggle,
    "conversations.attachments.get": async (p) => {
      return documentList(String(p.chatId));
    },
    "conversations.attachments.page": async (p) => {
      const page = pages.find((page) => page.pageId === p.pageId);
      if (!page) throw new Error("This tab is no longer available.");
      const chatId = String(p.chatId),
        items = documents.get(chatId) ?? [];
      const content = `Page: ${page.title}\nSource: ${page.url}\n\nMock page text for reviewing page attachments.`;
      items.push({
        attachmentId: crypto.randomUUID(),
        filename: `${page.title.slice(0, 180)}.txt`,
        file: await mockDocument(`${page.title.slice(0, 180)}.txt`, content),
        sourceUrl: page.url,
        sourceTruncated: false,
        content,
        byteLength: content.length,
        createdAt: Date.now(),
        included: true,
      });
      documents.set(chatId, items);
      emit("conversation.context.changed", { chatId });
      return documentList(chatId);
    },
    "conversations.attachments.add": async (p) => {
      const chatId = String(p.chatId),
        items = documents.get(chatId) ?? [];
      items.push({
        attachmentId: crypto.randomUUID(),
        filename: String(p.filename),
        file: await mockDocument(String(p.filename), String(p.content)),
        content: String(p.content),
        byteLength: new TextEncoder().encode(String(p.content)).length,
        createdAt: Date.now(),
        included: true,
      });
      documents.set(chatId, items);
      emit("conversation.context.changed", { chatId });
      return documentList(chatId);
    },
    "conversations.attachments.import": async (p) => {
      const selection = documentSelection;
      if (
        !selection ||
        selection.selectionId !== p.selectionId ||
        p.index !== 0 ||
        selection.file.manifest.document.snapshotId !== p.snapshotId ||
        selection.file.manifest.document.sourceSha256 !== p.sourceSha256
      )
        throw new AuxError("ref_stale", "This document selection was closed.");
      const chatId = String(p.chatId),
        items = documents.get(chatId) ?? [];
      const first = selection.file.read();
      items.push({
        attachmentId: crypto.randomUUID(),
        file: selection.file,
        filename: first.document.filename,
        content: first.chunk.segments.map((segment) => segment.text).join(""),
        byteLength: first.completed.textBytes,
        createdAt: Date.now(),
        included: true,
      });
      documents.set(chatId, items);
      emit("conversation.context.changed", { chatId });
      return documentList(chatId);
    },
    "conversations.attachments.toggle": mockConversationsAttachmentsToggle,
    "conversations.attachments.remove": mockConversationsAttachmentsToggle,
    "conversations.attachments.read": async (p) => {
      const items = documents.get(String(p.chatId)) ?? [];
      for (const item of items) {
        if (item.attachmentId === p.attachmentId) {
          if (p.sha256 && p.sha256 !== item.file.manifest.sha256)
            throw new AuxError("ref_stale", "This document changed.");
          return {
            ...item.file.read(typeof p.cursor === "string" ? p.cursor : undefined),
            attachment: documentList(String(p.chatId)).attachments.find(
              (entry) => entry.attachmentId === item.attachmentId,
            ),
          };
        }
      }
      throw new Error("Document attachment not found.");
    },
    "settings.remoteDebugging.get": async () => ({
      available: false,
      enabled: false,
      managed: false,
      allowed: false,
      canChange: false,
      state: "unavailable" as const,
      address: null,
      port: null,
    }),
    "settings.remoteDebugging.set": async () => {
      throw new Error("Remote debugging requires the native Aux browser.");
    },
    "settings.get": async () => {
      return { ...settings };
    },
    "settings.set": async (p) => {
      Object.assign(settings, p);
      emit("settings.changed", { settings: { ...settings } });
      return { ok: true };
    },
    "browser.recovery.list": async () => {
      return recoveryTabs;
    },
    "browser.recovery.retry": async (p) => {
      const saved = recoveryTabs.find((tab) => tab.pageId === p.pageId);
      if (!saved) throw new Error("This tab has already been restored.");
      const page = makePage(pages.length, { ...saved, backend: "aux", viewStatus: "visible" });
      pages.push(page);
      recoveryTabs = recoveryTabs.filter((tab) => tab.pageId !== p.pageId);
      emit("page.added", { page });
      emit("browser.recovery.changed", {});
      return { ok: true, pageId: page.pageId, page: { ...page }, restored: true };
    },
    "bookmarks.folders.list": async () => {
      return bookmarkFolders;
    },
    "bookmarks.list": async () => {
      return bookmarks;
    },
    "nightShift.list": async () => {
      throw new Error("Demonstration and overnight work require the Aux native browser.");
    },
    "nightShift.queue": async () => {
      throw new Error("Demonstration and overnight work require the Aux native browser.");
    },
    "nightShift.review": async () => {
      throw new Error("Demonstration and overnight work require the Aux native browser.");
    },
    "nightShift.summary": async () => {
      throw new Error("Demonstration and overnight work require the Aux native browser.");
    },
    "recorder.discard": async () => {
      throw new Error("Demonstration and overnight work require the Aux native browser.");
    },
    "recorder.get": async () => {
      throw new Error("Demonstration and overnight work require the Aux native browser.");
    },
    "recorder.start": async () => {
      throw new Error("Demonstration and overnight work require the Aux native browser.");
    },
    "routines.replay.compileDemonstration": async () => {
      throw new Error("Demonstration and overnight work require the Aux native browser.");
    },
    "routines.replay.repair.apply": async () => {
      throw new Error("Demonstration and overnight work require the Aux native browser.");
    },
    "routines.replay.repair.propose": async () => {
      throw new Error("Demonstration and overnight work require the Aux native browser.");
    },
    "downloads.renameReceipts": async () => {
      throw new Error("Download naming requires the Aux native browser.");
    },
    "downloads.undoRename": async () => {
      throw new Error("Download naming requires the Aux native browser.");
    },
    "downloads.list": async () => {
      return downloads;
    },
    "downloads.remove": async (p) => {
      const ids = new Set(p.ids as string[]);
      const removed = downloads
        .filter(
          (item) =>
            ids.has(item.id) &&
            !item.canCancel &&
            !item.canResume &&
            ["completed", "cancelled", "interrupted"].includes(item.state),
        )
        .map((item) => item.id);
      downloads = downloads.filter((item) => !removed.includes(item.id));
      emit("downloads.removed", { ids: removed });
      return { removed };
    },
    "programs.list": async () => {
      return PROGRAMS;
    },
    "history.list": async (p) => {
      const query = ((p.query as string) ?? "").toLowerCase();
      const before = p.before as { visitedAt: number; url: string } | undefined;
      return history
        .filter(
          (h) =>
            (!query || `${h.title} ${h.url}`.toLowerCase().includes(query)) &&
            (p.since === undefined || h.visitedAt >= Number(p.since)) &&
            (!before ||
              h.visitedAt < before.visitedAt ||
              (h.visitedAt === before.visitedAt && h.url < before.url)),
        )
        .sort((a, b) => b.visitedAt - a.visitedAt || (a.url < b.url ? 1 : a.url > b.url ? -1 : 0))
        .slice(0, Number(p.limit ?? 100));
    },
    "models.list": async () => {
      return { models: [...MODEL_REGISTRY], source: "static", localServers: [] };
    },
    "models.probe": async (p) => {
      return {
        ok: true,
        modelId: (p.modelId as string) || "meta/muse-spark-1.3-contributor",
        latencyMs: 42,
        vision: true,
      };
    },
    "chrome.importCookies": async () => {
      return {
        ok: false,
        source: "profile",
        imported: 0,
        skipped: 0,
        domains: 0,
        detail: "Cookie import is not available in mock.",
      };
    },
    "programs.run": async (p) => {
      const id = `run-${Math.random().toString(36).slice(2, 6)}`;
      const run: Run = {
        runId: id,
        goal: `program ${(p.programId as string) ?? ""}`,
        status: "running",
        pageIds: p.pageId ? [p.pageId as string] : [],
        createdAt: Date.now(),
        startedAt: Date.now(),
        statusMessage: "Running saved program",
      };
      runs = [run, ...runs];
      emit("run.status", { run }, id);
      steps[id] = [];
      void scriptRun(id);
      return { runId: id };
    },
    "sets.results": async () => {
      return MEMBERS.filter((m) => m.resultId).map((m, i) => ({
        resultId: m.resultId!,
        memberId: m.memberId,
        sourceUrl: m.url!,
        values: {
          plan: ["Free", "Pro", "Business"][i % 3],
          price_usd: [0, 8, 15, 10, 12, 20][i],
          seats: i % 2 ? "per seat" : "flat",
        },
        observedAt: Date.now() - i * 30_000,
        status: "ok",
      }));
    },
    "pages.open": async (p) => {
      const url = (p.url as string) ?? "about:blank";
      const np: PageTarget = {
        ...makePage(nextId - 1),
        pageId: `page-${nextId}`,
        url,
        title: url === "about:blank" ? "" : hostTitle(url),
        favicon: undefined,
        canGoBack: false,
        loading: url !== "about:blank",
      };
      nextId++;
      pages = [...pages, np];
      emit("page.added", { page: np });
      if (p.activate) {
        activePageId = np.pageId;
        emit("page.updated", { pageId: np.pageId, activePageId });
      }
      if (np.loading) setTimeout(() => patch(np.pageId, { loading: false, title: hostTitle(url) }), 900);
      return np;
    },
    "pages.close": async (p) => {
      const id = p.pageId as string;
      pages = pages.filter((x) => x.pageId !== id);
      if (activePageId === id) activePageId = null;
      emit("page.removed", { pageId: id });
      return { ok: true };
    },
    "pages.activate": async (p) => {
      activePageId = p.pageId as string;
      return page(activePageId);
    },
    "pages.navigate": async (p) => {
      const id = p.pageId as string;
      const url = p.url as string;
      patch(id, { url, loading: true, title: hostTitle(url) });
      for (const l of loadingListeners) l({ pageId: id, loading: true });
      setTimeout(() => {
        patch(id, { loading: false, canGoBack: true });
        for (const l of loadingListeners) l({ pageId: id, loading: false });
      }, 1100);
      return page(id);
    },
    "pages.reload": async (p) => {
      const id = p.pageId as string;
      patch(id, { loading: true });
      setTimeout(() => patch(id, { loading: false }), 700);
      return page(id);
    },
    "pages.back": mockPagesBack,
    "pages.forward": mockPagesBack,
    "pages.stop": mockPagesBack,
    "pages.resume": async (p) => {
      patch(p.pageId as string, { controller: "agent" });
      emit("page.takeover", { pageId: p.pageId, controller: "agent" });
      runs
        .filter((r) => r.status === "paused")
        .forEach((r) =>
          patchRun(r.runId, { status: "running", statusMessage: "Resuming — re-observing the page" }, true),
        );
      return page(p.pageId as string);
    },
    "pages.takeover": async (p) => {
      patch(p.pageId as string, { controller: "human" });
      emit("page.takeover", { pageId: p.pageId, controller: "human" });
      return page(p.pageId as string);
    },
    "pages.observe": async (p) => {
      return { observation: { ...OBSERVATION, pageId: p.pageId as string } };
    },
    "pages.find": async () => {
      return { matches: 7, activeMatch: 2 };
    },
    "pages.pickElement": async () => {
      return { picked: false };
    },
    "pages.stopFind": async () => {
      return { ok: true };
    },
    "bookmarks.add": async (p) => {
      bookmarks = [
        { url: String(p.url), title: String(p.title) },
        ...bookmarks.filter((item) => item.url !== p.url),
      ];
      emit("bookmarks.changed", { bookmarks });
      return { ok: true };
    },
    "bookmarks.update": async (p) => {
      const previous = bookmarks.find((item) => item.url === p.originalUrl);
      if (!previous) throw new Error("This bookmark was removed.");
      if (p.url !== p.originalUrl && bookmarks.some((item) => item.url === p.url))
        throw new Error("That address is already bookmarked. Both bookmarks have been kept.");
      bookmarks = bookmarks.map((item) =>
        item === previous
          ? { ...item, url: String(p.url), title: String(p.title), folderPath: p.folderPath as string[] }
          : item,
      );
      emit("bookmarks.changed", { bookmarks });
      return { ok: true };
    },
    "bookmarks.folders.create": async (p) => {
      const path = p.path as string[];
      for (let depth = 1; depth <= path.length; depth++) {
        const parent = path.slice(0, depth);
        if (!bookmarkFolders.some((folder) => JSON.stringify(folder) === JSON.stringify(parent)))
          bookmarkFolders.push(parent);
      }
      emit("bookmarks.changed", { bookmarks });
      return bookmarkFolders;
    },
    "bookmarks.move": async (p) => {
      const selected = p.bookmarks as { url: string; folderPath: string[] }[];
      const destination = p.folderPath as string[];
      for (const item of selected) {
        const current = bookmarks.find((bookmark) => bookmark.url === item.url);
        if (!current || JSON.stringify(current.folderPath ?? []) !== JSON.stringify(item.folderPath))
          throw new Error("A selected bookmark changed. Select it again; nothing was moved.");
      }
      if (p.createFolder) {
        if (
          !destination.length ||
          bookmarkFolders.some((path) => JSON.stringify(path) === JSON.stringify(destination))
        )
          throw new Error("A folder with this name already exists. Choose another name.");
        const parent = destination.slice(0, -1);
        if (parent.length && !bookmarkFolders.some((path) => JSON.stringify(path) === JSON.stringify(parent)))
          throw new Error("The parent folder no longer exists. Choose another folder.");
        bookmarkFolders.push(destination);
      }
      if (
        destination.length &&
        !bookmarkFolders.some((path) => JSON.stringify(path) === JSON.stringify(destination))
      )
        throw new Error("The destination folder no longer exists.");
      const urls = new Set(selected.map((item) => item.url));
      let moved = 0;
      bookmarks = bookmarks.map((item) => {
        if (!urls.has(item.url) || JSON.stringify(item.folderPath ?? []) === JSON.stringify(destination))
          return item;
        moved++;
        return { ...item, folderPath: destination };
      });
      emit("bookmarks.changed", { bookmarks });
      return { moved };
    },
    "bookmarks.remove": async (p) => {
      bookmarks = bookmarks.filter((item) => item.url !== p.url);
      emit("bookmarks.changed", { bookmarks });
      return { ok: true };
    },
    "bookmarks.saveFolder": async (p) => {
      const name = String(p.name);
      if (bookmarkFolders.some((path) => path.length === 1 && path[0] === name))
        throw new Error("A bookmark folder already has this name.");
      const incoming = p.bookmarks as { url: string; title: string }[];
      let added = 0;
      if (incoming.every((item) => bookmarks.some((old) => old.url === item.url)))
        throw new Error(
          "These pages are already bookmarked. Find them in Library to organize their folders.",
        );
      bookmarkFolders.push([name]);
      for (const item of incoming)
        if (!bookmarks.some((old) => old.url === item.url)) {
          bookmarks.push({ ...item, folderPath: [name] });
          added++;
        }
      emit("bookmarks.changed", { bookmarks });
      return { added, skipped: incoming.length - added };
    },
    "bookmarks.import": async (p) => {
      const incoming = p.bookmarks as { url: string; title: string }[];
      let added = 0;
      for (const item of incoming)
        if (!bookmarks.some((old) => old.url === item.url)) {
          bookmarks.push(item);
          added++;
        }
      emit("bookmarks.changed", { bookmarks });
      return { added, skipped: incoming.length - added };
    },
    "history.count": async (p) => ({
      count: history.filter(
        (item) =>
          (p.since === undefined || item.visitedAt >= Number(p.since)) &&
          (p.before === undefined || item.visitedAt < Number(p.before)),
      ).length,
    }),
    "history.clear": async (p) => {
      const previous = history.length;
      history = history.filter(
        (item) =>
          (p.since !== undefined && item.visitedAt < Number(p.since)) ||
          (p.before !== undefined && item.visitedAt >= Number(p.before)),
      );
      emit("history.changed", {});
      return { ok: true, removed: previous - history.length };
    },
    "history.remove": async (p) => {
      const size = history.length;
      history = history.filter((item) => item.url !== p.url || item.visitedAt !== p.visitedAt);
      emit("history.changed", {});
      return { removed: history.length < size };
    },
    "pages.zoom": async (p) => {
      const id = String(p.pageId);
      const current = zoomLevels.get(id) ?? 0;
      const requested = p.reset
        ? 0
        : p.direction === "in" || p.direction === "out"
          ? steppedZoomLevel(current, p.direction)
          : typeof p.level === "number"
            ? p.level
            : current + Number(p.delta ?? 0);
      const level = Math.max(
        Math.log(0.25) / Math.log(1.2),
        Math.min(Math.log(5) / Math.log(1.2), requested),
      );
      zoomLevels.set(id, level);
      if (p.reset || p.direction || p.level !== undefined || p.delta !== undefined)
        for (const listener of zoomListeners) listener({});
      return { level };
    },
    "artifacts.read": async (p) => {
      const generated = generatedVersions.get(String(p.artifactId));
      if (generated?.kind === "chart") {
        const png =
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lNsAAAAASUVORK5CYII=";
        return {
          artifact: {
            artifactId: generated.artifactId,
            runId: generated.sourceRunId,
            path: "",
            mediaType: "image/png",
            size: atob(png).length,
            status: "complete",
            createdAt: generated.createdAt,
          },
          dataBase64: png,
        };
      }
      return {
        artifact: {
          artifactId: p.artifactId,
          path: "",
          mediaType: "application/json",
          size: 0,
          status: "complete",
          createdAt: Date.now(),
        },
        dataBase64: btoa(unescape(encodeURIComponent(JSON.stringify(OBSERVATION)))),
      };
    },
    "runs.get": async (p) => {
      const run = runs.find((r) => r.runId === p.runId);
      if (!run) throw new Error("no such run");
      return { run, steps: steps[run.runId] ?? [], modelCalls: run.config?.modelCalls ?? 3 };
    },
    "runs.list": async (p) => {
      const key = (run: Run) => run.config?.chatId ?? run.runId;
      const query = String(p.query ?? "")
        .trim()
        .toLowerCase();
      const matches = new Set(
        runs.filter((run) => `${run.goal} ${run.statusMessage ?? ""}`.toLowerCase().includes(query)).map(key),
      );
      const seen = new Set<string>();
      const before = p.before as { createdAt: number; runId: string } | undefined;
      return [...runs]
        .sort((a, b) => b.createdAt - a.createdAt || b.runId.localeCompare(a.runId))
        .filter((run) => {
          if (p.groupByChat && seen.has(key(run))) return false;
          seen.add(key(run));
          return (
            (!p.chatId || key(run) === p.chatId) &&
            matches.has(key(run)) &&
            (!before ||
              run.createdAt < before.createdAt ||
              (run.createdAt === before.createdAt && run.runId < before.runId))
          );
        })
        .slice(0, Number(p.limit ?? 50));
    },
    "runs.start": async (p) => {
      const request = MethodSchemas["runs.start"].parse(p);
      const receipt = request.requestId ? startRequests.get(request.requestId) : undefined;
      if (receipt) {
        if (receipt.signature !== JSON.stringify(request))
          throw new Error("This send belongs to its original message.");
        if (!receipt.runId) throw new Error("This send was recovered without starting.");
        const accepted = runs.find((run) => run.runId === receipt.runId);
        if (!accepted) throw new Error("The original chat was removed.");
        return accepted;
      }
      const id = `run-${Math.random().toString(36).slice(2, 6)}`;
      const chatId = (p.chatId as string | undefined) ?? id;
      const existing = chatMetadata.get(chatId);
      if (existing && p.privateTask === true && !existing.privateTask)
        throw new Error("This chat’s task mode is fixed.");
      const privateTask = existing?.privateTask ?? p.privateTask === true;
      if (!existing)
        chatMetadata.set(chatId, {
          title: String(p.goal),
          archived: false,
          privateTask,
          updatedAt: Date.now(),
        });
      const run: Run = {
        runId: id,
        goal: p.goal as string,
        status: "planning",
        pageIds: (p.pageIds as string[]) ?? [],
        createdAt: Date.now(),
        startedAt: Date.now(),
        statusMessage: "Observing the page",
        config: {
          chatId: p.chatId as string | undefined,
          privateTask,
          modelId: p.modelId as string | undefined,
          reasoning: p.reasoning as "low" | "medium" | "high" | undefined,
        },
      };
      if (request.requestId)
        startRequests.set(request.requestId, { signature: JSON.stringify(request), runId: id });
      runs = [run, ...runs];
      emit("run.status", { run }, id);
      steps[id] = [];
      void scriptRun(id);
      return run;
    },
    "runs.reconcileStart": async (p) => {
      const request = MethodSchemas["runs.reconcileStart"].parse(p);
      const receipt = startRequests.get(request.requestId);
      if (receipt && receipt.signature !== JSON.stringify(request))
        throw new Error("This send belongs to its original message.");
      if (!receipt || !receipt.runId) {
        startRequests.set(request.requestId, { signature: JSON.stringify(request), runId: null });
        return { status: "not_started", run: null };
      }
      const run = runs.find((item) => item.runId === receipt.runId);
      return run ? { status: "accepted", run } : { status: "removed", run: null };
    },
    "runs.retry": async (p) => {
      const prior = runs.find((r) => r.runId === p.runId);
      if (!prior) throw new Error("no such run");
      const id = `run-${Math.random().toString(36).slice(2, 6)}`;
      const run: Run = {
        runId: id,
        goal: prior.goal,
        status: "planning",
        pageIds: prior.pageIds,
        config: { ...prior.config, chatId: prior.config?.chatId ?? prior.runId, retryOfRunId: prior.runId },
        createdAt: Date.now(),
        startedAt: Date.now(),
        statusMessage: "Retrying the turn",
      };
      runs = [run, ...runs];
      emit("run.status", { run }, id);
      steps[id] = [];
      void scriptRun(id);
      return run;
    },
    // Scripted preview only: keep queued items inspectable until edited or removed.
    "runs.queue": async (p) => {
      const existing = queuedMessages.get(String(p.messageId));
      if (existing) return existing;
      const message: RunMessage = {
        messageId: String(p.messageId),
        chatId: String(p.chatId),
        targetRunId: String(p.runId),
        deliveryRunId: `preview-${p.messageId}`,
        mode: "queue",
        status: "accepted",
        text: String(p.text),
        pageIds: p.pageIds as string[],
        contextPageRefs: (p.contextPageRefs ?? []) as RunMessage["contextPageRefs"],
        expectedRevision: Number(p.expectedRevision),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      queuedMessages.set(message.messageId, message);
      emit("conversation.messages.changed", { chatId: message.chatId });
      return message;
    },
    "runs.messages.list": async (p) =>
      [...queuedMessages.values()].filter(
        (message) =>
          message.chatId === p.chatId &&
          (!["delivered", "cancelled"].includes(message.status) ||
            (message.mode === "steer" &&
              message.status === "delivered" &&
              (p.runIds as string[]).includes(message.targetRunId))),
      ),
    "runs.message.cancel": async (p) => {
      const message = queuedMessages.get(String(p.messageId));
      if (!message) throw new Error("Queued preview message not found.");
      const cancelled: RunMessage = { ...message, status: "cancelled", updatedAt: Date.now() };
      queuedMessages.set(message.messageId, cancelled);
      emit("conversation.messages.changed", { chatId: message.chatId });
      return cancelled;
    },
    "runs.pause": async (p) => {
      patchRun(p.runId as string, { status: "paused", statusMessage: "Paused" }, true);
      return runs.find((r) => r.runId === p.runId);
    },
    "runs.resume": async (p) => {
      patchRun(p.runId as string, { status: "running", statusMessage: "Resumed" }, true);
      return runs.find((r) => r.runId === p.runId);
    },
    "runs.cancel": async (p) => {
      patchRun(
        p.runId as string,
        { status: "cancelled", statusMessage: "Cancelled", endedAt: Date.now() },
        true,
      );
      return runs.find((r) => r.runId === p.runId);
    },
    "runs.answer": async (p) => {
      patchRun(p.runId as string, { status: "running", statusMessage: `Answer received — continuing` }, true);
      return runs.find((r) => r.runId === p.runId);
    },
    "sets.create": async () => {
      return SET;
    },
  } satisfies Partial<Record<MethodName, MockHandler>>;

  const invoke = async (method: string, params: unknown = {}): Promise<unknown> => {
    if (scenario === "disconnected") throw new Error("runtime not connected");
    await sleep(method.startsWith("pages.") ? 20 : 8);
    const handler = (handlers as Partial<Record<string, MockHandler>>)[method];
    if (!handler) throw new Error(`mock: ${method} not implemented`);
    return handler(params as Record<string, unknown>, method);
  };

  // a freshly started run plays out a short script so the rail can be watched live
  async function scriptRun(id: string) {
    const script = makeSteps(id, 5);
    const target = runs.find((r) => r.runId === id)?.pageIds[0] ?? "page-1";
    await sleep(700);
    patchRun(id, { status: "running", statusMessage: "Opening the files tab" }, true);
    if (pages.some((x) => x.pageId === target)) {
      patch(target, { controller: "agent" });
      emit("page.takeover", { pageId: target, controller: "agent" });
    }
    for (const st of script) {
      await sleep(900);
      emit(
        "model.call",
        {
          runId: id,
          modelId: "meta/muse-spark-1.3-contributor",
          role: "planner",
          durationMs: 1200 + Math.round(Math.random() * 800),
          costUsd: 0.000246,
          inputTokens: 2100,
          outputTokens: 180,
        },
        id,
      );
      steps[id] = [...(steps[id] ?? []), { ...st, pageId: target, startedAt: Date.now() }];
      emit("step.finished", { step: steps[id]![steps[id]!.length - 1] }, id);
      emit(
        "observation.new",
        {
          runId: id,
          observation: { ...OBSERVATION, pageId: target, revision: OBSERVATION.revision + steps[id]!.length },
        },
        id,
      );
      if (!runs.some((r) => r.runId === id && r.status === "running")) return;
    }
    await sleep(800);
    patchRun(
      id,
      {
        status: "completed",
        statusMessage: "Done — 2 threads still need changes",
        endedAt: Date.now(),
        result: {
          unresolved_accessibility_threads: 2,
          summary:
            "Focus ring on the tab strip and aria-selected on sidebar tabs are still open. Reduced-motion handling was accepted.",
        },
      },
      true,
    );
    if (pages.some((x) => x.pageId === target)) {
      patch(target, { controller: "none" });
      emit("page.takeover", { pageId: target, controller: "none" });
    }
  }

  if (withRun && live && scenario === "run") {
    void (async () => {
      await sleep(2000);
      const more = makeSteps(RUN_ID, 9).slice(6);
      for (const st of more) {
        await sleep(2200);
        steps[RUN_ID] = [...(steps[RUN_ID] ?? []), st];
        emit(
          "model.call",
          {
            runId: RUN_ID,
            modelId: "meta/muse-spark-1.3-contributor",
            role: "planner",
            durationMs: 1400,
            costUsd: 0.000272,
            inputTokens: 2400,
            outputTokens: 160,
          },
          RUN_ID,
        );
        emit("step.finished", { step: st }, RUN_ID);
      }
    })();
  }

  const { emitEvent: _emitHostEvent, ...hostDefaults } = createMockHost();
  let omnibox: OmniboxResult | null = null;
  let memorySaverMinutes: import("@aux/contracts").MemorySaverSettings["minutes"] = 30;
  const bridge: AuxBridge = {
    ...hostDefaults,
    browserProfiles: async () => [],
    createBrowserProfile: async () => {
      throw new Error("Profiles require the native browser.");
    },
    renameBrowserProfile: async () => [],
    archiveBrowserProfile: async () => [],
    deleteBrowserProfile: async () => [],
    openBrowserProfile: async () => false,
    openBrowserProfileUrl: async () => false,
    defaultBrowser: async () => ({ isDefault: false }),
    setDefaultBrowser: async () => ({ isDefault: false }),
    autofillProfile: async () => null,
    setAutofillProfile: async () => true,
    autofill: async () => 0,
    vaultFill: async () => false,
    vaultSave: async () => ({ ok: false, updated: false }),
    vaultDismiss: async () => false,
    passwordExport: async () => null,
    passwordImport: async () => null,
    onVaultOffer: () => () => {},
    onLinkStatus: () => () => {},
    privateMode: false,
    windowId: "main",
    platform: "darwin",
    setShortcutOverrides: async () => ({}),
    invoke: invoke as AuxBridge["invoke"],
    onEvent: (cb) => (eventListeners.add(cb), () => eventListeners.delete(cb)),
    onHistoryChanged: (cb) => {
      const listener: Listener<AuxEvent> = (event) => {
        if (event.type === "history.changed") cb({});
      };
      eventListeners.add(listener);
      return () => {
        eventListeners.delete(listener);
      };
    },
    onRuntimeStatus: () => () => {},
    onShortcut: () => () => {},
    onToolbarEdge: () => () => {},
    onSidebarEdge: () => () => {},
    quickAskShortcut: async (enabled) => ({ enabled: !!enabled, registered: !!enabled, error: "" }),
    windowKind: q.get("quickAsk") === "1" ? "quick-ask" : q.get("little") === "1" ? "little" : "normal",
    quickAsk: async (action) => action === "status" && q.get("quickAsk") === "1",
    onQuickAskState: () => () => {},
    onPageAction: () => () => {},
    retryDownload: async () => {
      throw new Error("Download retry requires Aux desktop");
    },
    tabAudio: async () => ({}),
    tabsUnsavedWork: async (tabs: { pageId: string; url: string }[]) =>
      Object.fromEntries(tabs.map((tab) => [tab.pageId, "clean" as const])),
    memorySaverGet: async () => ({ minutes: memorySaverMinutes, managed: false }),
    memorySaverSet: async (minutes) => ({ minutes: (memorySaverMinutes = minutes), managed: false }),
    tabSleep: async () => ({ slept: false, reason: "Native lifecycle unavailable in preview" }),
    // Mock tab commands reuse the local page list — the real surface is the
    // main-owned catalog; visual dev only needs the pages themselves to move.
    tabCommand: async (command) => {
      const p = command as {
        kind: string;
        pageId?: string;
        url?: string;
        background?: boolean;
        activate?: boolean;
        muted?: boolean;
        windowId?: string;
      };
      await sleep(12);
      switch (command.kind) {
        case "open": {
          const result = (await invoke("pages.open", {
            url: p.url ?? "about:blank",
            background: p.background,
            activate: p.activate ?? !p.background,
          })) as PageTarget;
          return { commandId: "", status: "applied" as const, catalogVersion: 0, pageId: result.pageId };
        }
        case "close":
          await invoke("pages.close", { pageId: p.pageId });
          return { commandId: "", status: "applied" as const, catalogVersion: 0, pageId: p.pageId };
        case "activate":
          await invoke("pages.activate", { pageId: p.pageId });
          emit("page.updated", { pageId: p.pageId, activePageId });
          return { commandId: "", status: "applied" as const, catalogVersion: 0, pageId: p.pageId };
        case "navigate":
          await invoke("pages.navigate", { pageId: p.pageId, url: p.url });
          return { commandId: "", status: "applied" as const, catalogVersion: 0, pageId: p.pageId };
        case "reload":
          await invoke("pages.reload", { pageId: p.pageId });
          return { commandId: "", status: "applied" as const, catalogVersion: 0, pageId: p.pageId };
        case "move":
          return {
            commandId: "",
            status: "applied" as const,
            catalogVersion: 0,
            pageId: p.pageId,
            windowId: p.windowId ?? "mock-window",
          };
        case "back":
        case "forward":
        case "stop":
        case "setMuted":
        case "reorder":
          return { commandId: "", status: "applied" as const, catalogVersion: 0, pageId: p.pageId };
        default:
          return {
            commandId: "",
            status: "rejected" as const,
            catalogVersion: 0,
            error: { code: "unknown", message: "Unknown mock command." },
          };
      }
    },
    bindTabSpace: async (_pageId, spaceId) => {
      const space = spaces.find((item) => item.id === spaceId && !item.archived);
      if (!space?.workspaceId) throw new Error("Choose an active Space.");
      return { spaceId, workspaceId: space.workspaceId };
    },
    migrateTabSpaces: async () => ({ migrated: 0 }),
    tabsSnapshot: async () => ({
      version: 1,
      tabs: pages.map((p) => ({
        pageId: p.pageId,
        windowId: "main",
        url: p.url,
        title: p.title,
        favicon: p.favicon,
        loading: !!p.loading,
        muted: false,
        audible: false,
        canGoBack: !!p.canGoBack,
        canGoForward: !!p.canGoForward,
        popup: false,
        crashed: p.viewStatus === "crashed",
        runtimeOwned: p.ownedByRuntime,
        generation: 0,
        createdAt: p.createdAt,
        lastActiveAt: p.lastActiveAt,
      })),
      windows: [{ windowId: "main", order: pages.map((p) => p.pageId), activePageId }],
    }),
    organizationSnapshot: async () => organization,
    organizationCommit: async (input) => {
      const next = OrganizationCommitSchema.parse(input);
      if (next.expectedRevision !== organization.revision) throw new Error("Organization revision conflict.");
      organization = { revision: organization.revision + 1, layout: next.layout };
      for (const listener of organizationListeners) listener(organization.revision);
      return organization;
    },
    onOrganizationChanged: (cb) => (organizationListeners.add(cb), () => organizationListeners.delete(cb)),
    tabsSince: async () => ({ kind: "snapshot" as const, snapshot: await bridge.tabsSnapshot() }),
    onTabsPatch: () => () => {},
    onTabsPlacement: () => () => {},
    onAudio: () => () => {},
    downloadFolder: async () => ({ path: "~/Downloads", custom: false }),
    chooseDownloadFolder: async () => {
      throw new Error("Download folders require Aux desktop");
    },
    spellCheck: async (enabled) => ({
      enabled: (spellCheckEnabled = enabled ?? spellCheckEnabled),
      managed: false,
    }),
    startupPreferences: async (next) => ({
      ...(startupPreferences = next ?? startupPreferences),
      managed: false,
    }),
    languagePreferences: async (next) => ({
      selected: (selectedLanguages = next ?? selectedLanguages),
      effective: selectedLanguages,
      forced: [],
      managed: false,
    }),
    automaticPictureInPicture: async (next) => ({
      mode: (automaticPictureInPicture = next ?? automaticPictureInPicture),
      managed: false,
    }),
    keepRuntimeInBackground: async (next) => ({
      enabled: (keepRuntimeInBackground = next ?? keepRuntimeInBackground),
      available: true,
      managed: false,
    }),
    defaultPageZoom: async (next) => ({
      percentage: (defaultPageZoom = next ?? defaultPageZoom),
      managed: false,
    }),
    downloadsSnapshot: async () => downloads,
    dismissDownloads: async (ids) =>
      ResultSchemas["downloads.remove"].parse(await invoke("downloads.remove", { ids })),
    controlDownload: async () => {
      throw new Error("No live download in this preview");
    },
    onDownload: () => () => {},
    onDownloadsRemoved: () => () => {},
    onLoading: (cb) => (loadingListeners.add(cb), () => loadingListeners.delete(cb)),
    surfaceContentId: async () => null,
    capabilities: async () => ({
      buildId: "mock",
      sourceCommit: "a".repeat(40),
      methods: Object.keys(HostMethods),
    }),
    resolveSearch: async (query) => DEFAULT_SEARCH_ENGINE.replace("%s", encodeURIComponent(query)),
    setShortcuts: async () => true,
    "omnibox.start": async ({ queryId, input: query }) => {
      const term = query.trim().toLowerCase();

      const matches = [
        ...HISTORY.filter((item) => `${item.title} ${item.url}`.toLowerCase().includes(term))
          .slice(0, 4)
          .map((item, index) => ({
            id: `history-${index}-${item.url}`,
            type: "history" as const,
            title: item.title,
            url: item.url,
            description: new URL(item.url).hostname,
          })),
        ...BOOKMARKS.filter((item) => `${item.title} ${item.url}`.toLowerCase().includes(term))
          .slice(0, 3)
          .map((item, index) => ({
            id: `bookmark-${index}-${item.url}`,
            type: "bookmark" as const,
            title: item.title,
            url: item.url,
            description: "Bookmark",
          })),
        {
          id: `search-${term}`,
          type: "search" as const,
          title: `Search for “${query.trim()}”`,
          url: DEFAULT_SEARCH_ENGINE.replace("%s", encodeURIComponent(query.trim())),
          description: "Web search",
        },
      ];
      omnibox = {
        queryId,
        sequenceId: queryId,
        input: query,
        done: true,
        items: matches.map((match, index) => ({ ...match, index, id: `${queryId}:${index}` })),
      };
      _emitHostEvent("onOmniboxResult", omnibox);
      return true;
    },
    "omnibox.stop": async (queryId) => {
      if (omnibox?.queryId !== queryId) return false;
      omnibox = null;
      return true;
    },
    "auth.confirm": async () => {
      throw new Error("Device confirmation requires the native Aux host.");
    },
    preloadNavigation: async ({ pageId, expectedUrl, url }) => {
      const page = pages.find((item) => item.pageId === pageId);
      return pageId === activePageId && page?.url === expectedUrl && /^https?:\/\//.test(url);
    },
    "omnibox.open": async ({ queryId, match, disposition }) => {
      if (omnibox?.queryId !== queryId) return false;
      const selected = match
        ? omnibox.items.find(
            (item) =>
              item.index === match.index &&
              item.url === match.url &&
              omnibox!.sequenceId === match.sequenceId,
          )
        : omnibox.items[0];
      if (!selected) return false;
      const active = activePageId;
      if (disposition === "current-tab" && active)
        await invoke("pages.navigate", { pageId: active, url: selected.url });
      else await invoke("pages.open", { url: selected.url, activate: disposition !== "new-background-tab" });
      return true;
    },
    overlay: async () => true,
    focusShell: async () => null,
    preview: async () => null,
    createResultPreview: async () => {
      throw new Error("Interactive previews require Aux desktop.");
    },
    releaseResultPreview: async () => true,
    contextMenu: async () => true,
    openExternal: async () => true,
    revealPath: async () => true,
    openPath: async () => "",
    saveFile: async () => null,
    saveWorkbook: async () => null,
    saveStoredArtifact: async () => null,
    savePagePdf: async () => {
      throw new Error("PDF export requires the desktop browser");
    },
    printPage: async () => true,
    devTools: async () => true,
    readArticle: async () => {
      if (scenario !== "reader") throw new Error("No article is available in this preview");
      return {
        title: "A calmer way to browse",
        byline: "Aux design notes",
        site: "example.com",
        url: "https://example.com/article",
        minutes: 4,
        content: {
          tag: "div",
          children: [
            {
              tag: "p",
              children: [
                "A good browser gives the page room to breathe. Reading should feel calm, with deliberate spacing and typography.",
              ],
            },
            { tag: "h2", sourceId: "keep-reading", children: ["Keep the article in view"] },
            {
              tag: "p",
              children: [
                "Search should help you find a detail without losing the article or your place. A calm interface keeps the controls close and the text clear.",
              ],
            },
            ...Array.from({ length: 8 }, (_, index) => ({
              tag: "p",
              children: [
                `Section ${index + 1}. Familiar keyboard controls, readable line lengths, and stable layouts make long articles easier to explore. The browser should preserve your place as you move between reading and research.`,
              ],
            })),
            { tag: "h2", sourceId: "continue-reading", children: ["Continue without losing your place"] },
            {
              tag: "p",
              children: [
                "The result is a calm reading experience that carries your work forward. ",
                {
                  tag: "a",
                  href: "https://example.com/article#keep-reading",
                  children: ["Return to the first section"],
                },
              ],
            },
          ],
        },
      };
    },
    navigationMenu: async () => false,
    hardReload: async () => true,
    windows: async () => [],
    closeWindow: async () => true,
    openFile: async () => null,
    openPluginDirectory: async () => null,

    pickEvidenceImage: async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 500;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#dbe7fa";
      ctx.fillRect(0, 0, 800, 500);
      ctx.fillStyle = "#25334c";
      ctx.font = "30px system-ui";
      ctx.fillText("Sample local image", 70, 110);
      ctx.fillStyle = "#6394e0";
      ctx.fillRect(70, 180, 660, 230);
      return { filename: "sample-image.png", dataUrl: canvas.toDataURL("image/png") };
    },
    pickEvidenceDocuments: async () => {
      const selectionId = crypto.randomUUID();
      const file = await mockDocument(
        "project-brief.md",
        "# Project brief\n\nUse a calm cobalt accent and keep browser controls minimal.\n\n" +
          "Reference notes for the attached project.\n".repeat(180),
      );
      documentSelection = { selectionId, file };
      return { selectionId, count: 1 };
    },
    readEvidenceDocument: async (selectionId, index, cursor) => {
      if (selectionId !== documentSelection?.selectionId)
        throw new AuxError("ref_stale", "This document selection was closed.");
      if (index !== 0) throw new Error("invalid_argument: This file is not in the selected collection.");
      const page = documentSelection.file.read(cursor);
      return {
        kind: "chunk",
        document: page.document,
        chunk: page.chunk,
        ...(page.nextCursor ? { nextCursor: page.nextCursor } : { completed: page.completed }),
      };
    },
    releaseEvidenceDocuments: async (selectionId) => {
      if (documentSelection?.selectionId === selectionId) documentSelection = null;
      return undefined;
    },
    agentConfig: async (input) => ({
      command: "/Applications/Aux.app/Contents/MacOS/Aux",
      args: ["/mock/aux-mcp.mjs"],
      env: { ELECTRON_RUN_AS_NODE: "1", AUX_DATA_DIR: "/mock/aux", AUX_MCP_TOKEN: "auxc_mock" },
      connection: {
        connectionId: "11111111-1111-4111-8111-111111111111",
        name: input.name,
        client: input.client,
        scope: input.scope,
        createdAt: Date.now(),
      },
    }),
    agentConnections: async () => [],
    agentClients: async () => [
      { client: "codex", installed: true, version: "codex-cli mock" },
      { client: "claude", installed: false },
    ],
    revokeAgentConnection: async (connectionId) => ({
      connectionId,
      name: "Revoked",
      client: "codex",
      scope: { kind: "workspace", workspaceId: "mock" },
      createdAt: Date.now(),
      revokedAt: Date.now(),
    }),
    dictationStatus: async () => ({
      available: q.get("dictation") === "fixture",
      reason: "Live dictation requires the Aux macOS app.",
    }),
    startDictation: async (sessionId) => {
      if (q.get("dictation") !== "fixture") return false;
      dictationEvent({ sessionId, type: "recording" });
      dictationEvent({
        sessionId,
        type: "transcript",
        text: "Compare these pages and summarize the differences.",
      });
      return true;
    },
    stopDictation: async (sessionId) => {
      dictationEvent({
        sessionId,
        type: "final",
        text: "Compare these pages and summarize the differences.",
      });
      return true;
    },
    cancelDictation: async () => null,
    onDictation: (callback) => {
      dictationListeners.add(callback);
      return () => {
        dictationListeners.delete(callback);
      };
    },
    extensions: async () => extensions,
    installStoreExtension: async (id) => {
      const installed: BrowserExtension = {
        key: id,
        id,
        name: "Store fixture extension",
        version: "1.0.0",
        permissions: ["Read and change data on example.test"],
        enabled: true,
        loaded: true,
        managed: true,
        source: "store",
      };
      extensions = [...extensions, installed];
      return installed;
    },
    checkStoreExtensionUpdate: async (id) => {
      const current = extensions.find((item) => item.id === id);
      if (!current) throw new Error("Extension is not installed");
      const updated = { ...current, version: "1.1.0" };
      extensions = extensions.map((item) => (item.id === id ? updated : item));
      return updated;
    },
    reloadExtension: async (id) => {
      const current = extensions.find((item) => item.id === id);
      if (!current) throw new Error("Extension is not installed");
      return current;
    },
    showExtensionAction: async (id) => extensions.some((item) => item.id === id && item.enabled),
    installUnpackedExtension: async () => null,
    updateUnpackedExtension: async (key) => {
      const current = extensions.find((item) => item.key === key);
      if (!current) return null;
      const updated = { ...current, version: "2.0.0" };
      extensions = extensions.map((item) => (item.key === key ? updated : item));
      return updated;
    },
    setExtensionEnabled: async (key, enabled) => {
      const current = extensions.find((item) => item.key === key);
      if (!current) throw new Error("Extension is not installed");
      const updated = { ...current, enabled, loaded: enabled };
      extensions = extensions.map((item) => (item.key === key ? updated : item));
      return updated;
    },
    removeExtension: async (key) => {
      const found = extensions.some((item) => item.key === key);
      extensions = extensions.filter((item) => item.key !== key);
      return found;
    },
    dataDir: async () => "/Users/you/Library/Application Support/Aux Browser",
    exportDiagnostics: async () => null,
    exportRuntimeBackup: async () => null,
    stageRuntimeRestore: async () => null,
    cancelRuntimeRestore: async () => ({ cancelled: true }),
    runtimeRestoreStatus: async () => ({
      pending: false,
      managedRecovery: { generation: 0, freshBackupIssued: false },
    }),
    healthSummary: async () => ({
      recordingSince: Date.now() - 86_400_000,
      latestAt: Date.now(),
      samples: 1440,
      sessions: 3,
      observedMinutes: 520,
      spanDays: 1,
      sevenDaySpan: false,
      startupMs: 820,
      cpuPercent: { p50: 1.8, p95: 14.2, max: 35.1 },
      memoryMb: { p50: 410, p95: 612, max: 680 },
      eventLoopLagMs: { p50: 2, p95: 18, max: 90 },
      maxWindows: 2,
      maxPages: 12,
      maxSuspendedPages: 7,
      pageCrashes: 0,
      pageUnresponsive: 0,
      suspensionFailures: 0,
    }),
    clearHealth: async () => ({
      samples: 0,
      sessions: 0,
      observedMinutes: 0,
      spanDays: 0,
      sevenDaySpan: false,
      cpuPercent: { p50: 0, p95: 0, max: 0 },
      memoryMb: { p50: 0, p95: 0, max: 0 },
      eventLoopLagMs: { p50: 0, p95: 0, max: 0 },
      maxWindows: 0,
      maxPages: 0,
      maxSuspendedPages: 0,
      pageCrashes: 0,
      pageUnresponsive: 0,
      suspensionFailures: 0,
    }),
    httpAuthRequests: async () => [],
    respondHttpAuth: async () => false,
    onHttpAuthChanged: () => () => {},
    clearSiteData: async () => {
      throw new Error("Website data controls require the desktop browser.");
    },
    siteInfo: async (pageId: string) => ({
      pageId,
      url: "https://example.com/",
      origin: "https://example.com",
      title: "Example",
      security: "secure" as const,
      cookieCount: 2,
      permissions: { notifications: "deny" as const },
      trackersAllowed: false,
      blockedCount: 0,
    }),
    onSiteZoomChanged: (cb) => {
      zoomListeners.add(cb);
      return () => {
        zoomListeners.delete(cb);
      };
    },
    siteZoom: async (origin) => {
      const sizes = new Map<string, number>();
      for (const [pageId, level] of zoomLevels) {
        const page = pages.find((page) => page.pageId === pageId);
        if (!page || !/^https?:/.test(page.url)) continue;
        const site = new URL(page.url).origin;
        if (origin === site) zoomLevels.delete(pageId);
        else if (level) sizes.set(site, Math.round(100 * 1.2 ** level));
      }
      if (origin) for (const listener of zoomListeners) listener({});
      return [...sizes].map(([origin, percentage]) => ({ origin, percentage }));
    },
    pageZoom: (pageId, options) => handlers["pages.zoom"]({ pageId, ...options }),
    pageFind: () => handlers["pages.find"](),
    pageStopFind: () => handlers["pages.stopFind"](),
    sitePermissions: async () => ({}),
    clearSitePermission: async () => true,
    privacy: async () => ({ trackerBlock: true, blocked: 0, allowedHosts: [], httpsUpgrade: true }),
    setTrackerBlock: async () => ({ trackerBlock: true, blocked: 0 }),
    setSiteTrackers: async () => {
      throw new Error("Site controls require the desktop browser.");
    },
    removeAllowedHost: async () => [],
    filterLists: async () => ({
      sources: [],
      networkRules: 0,
      cosmeticRules: 0,
      backend: "unavailable" as const,
      compilationWarnings: [],
      cosmeticBackend: "unavailable" as const,
    }),
    updateFilters: async () => {
      throw new Error("Content blocking requires the Aux desktop browser.");
    },
    addFilterSource: async () => {
      throw new Error("Content blocking requires the Aux desktop browser.");
    },
    removeFilterSource: async () => {
      throw new Error("Content blocking requires the Aux desktop browser.");
    },
    setFilterSourceEnabled: async () => {
      throw new Error("Content blocking requires the Aux desktop browser.");
    },
    proceedInsecure: async () => true,
    useHttp: async () => true,
    httpsUpgrade: async () => ({ enabled: false, available: false, managed: false }),
    setHttpsUpgrade: async () => true,
    translatePage: async () => {
      throw new Error("Translation is unavailable in the preview.");
    },
    showOriginal: async () => 0,
    onTranslationChanged: () => () => {},
    setAppearance: async () => true,
  };
  (window as unknown as { aux: AuxBridge; __auxMock: boolean }).aux = bridge;
  (window as unknown as { __auxMock: boolean }).__auxMock = true;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const hostTitle = (url: string) => {
  try {
    const u = new URL(url);
    return (
      u.hostname.replace(/^www\./, "") +
      (u.pathname !== "/" ? ` — ${decodeURIComponent(u.pathname).slice(1, 40)}` : "")
    );
  } catch {
    return url;
  }
};
