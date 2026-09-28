import type {
  CommandRankingEntry,
  ConversationSummary,
  HistoryEntry,
  Routine,
  Run,
  SavedProgram,
  SavedResult,
} from "@aux/contracts";
import { toUrl } from "../chrome";
import { rankAuxCommandResults } from "../command-ranking-renderer";
import { rankCandidates } from "../suggest";
import { isLive, useStore, call, toast } from "../store";
import { hostOf } from "../workspace";
import { openSavedSkill } from "../task-navigation";
import type { Intent } from "../intent";
import { FavIcon } from "./SiteTile";
import { I } from "./icons";
import type { ProviderSuggestion } from "./command-provider-types";
import { commandTabRows } from "./command-tab-rows";
import { bridge, type BrowserExtension } from "../bridge";

type Store = ReturnType<typeof useStore.getState>;
interface Domain {
  id: string;
  title: string;
  url: string;
  count: number;
}
export interface CommandProviderInput {
  query: string;
  remote: { query: string; items: string[] };
  tabs: Array<Store["pages"][number] & { id: string }>;
  domains: Domain[];
  bookmarks: Array<Store["bookmarks"][number] & { id: string }>;
  closed: Array<Store["closedTabs"][number] & { id: string }>;
  history: Array<HistoryEntry & { id: string; lastVisit: number }>;
  extensions: Array<BrowserExtension & { id: string; title: string }>;
  programs: Array<SavedProgram & { id: string; title: string }>;
  runs: Array<Run & { id: string; title: string }>;
  recentChats: Run[];
  savedWork: { results: SavedResult[]; skills: Routine[]; chats: ConversationSummary[] } | null;
  page: Store["pages"][number] | undefined;
  searchEngine: string | undefined;
  rankingEntries: CommandRankingEntry[];
  exec: (intent: Intent) => Promise<void>;
  activate: Store["activate"];
}

/** Loaded only while editing. Host autocomplete remains visible independently. */
export function buildCommandProviderRows(input: CommandProviderInput) {
  const {
    query: q,
    remote,
    tabs,
    domains,
    bookmarks,
    closed,
    history,
    extensions,
    programs,
    runs,
    recentChats,
    savedWork,
    page,
    searchEngine,
    rankingEntries,
    exec,
    activate,
  } = input;
  const out: ProviderSuggestion[] = [];
  for (const phrase of (remote.query.toLowerCase() === q ? remote.items : [])
    .filter((item) => item.toLowerCase() !== q)
    .slice(0, 4)) {
    out.push({
      id: `sug-${phrase}`,
      section: "suggest",
      icon: I.search,
      title: phrase,
      url: toUrl(phrase, searchEngine),
      detail: "Web suggestion",
      run: () => exec({ kind: "search", query: phrase, url: toUrl(phrase, searchEngine) }),
    });
  }
  out.push(...commandTabRows(q, tabs, activate));
  for (const site of rankCandidates(q, domains).slice(0, 2)) {
    out.push({
      id: site.id,
      section: "domains",
      url: site.url,
      icon: <FavIcon url={site.url} size="sm" />,
      title: site.title,
      detail: `Top site · ${site.count} saved or recent page${site.count === 1 ? "" : "s"}`,
      run: () => exec({ kind: "navigate", url: site.url, display: site.title }),
    });
  }
  for (const item of rankCandidates(q, bookmarks).slice(0, 3)) {
    out.push({
      id: `bookmark-${item.url}`,
      section: "bookmarks",
      url: item.url,
      icon: <FavIcon url={item.url} size="sm" />,
      title: item.title || hostOf(item.url),
      detail: item.folderPath?.join(" / ") || hostOf(item.url),
      run: () => exec({ kind: "navigate", url: item.url, display: item.title }),
    });
  }
  for (const item of rankCandidates(q, closed).slice(0, 2)) {
    out.push({
      id: `closed-${item.pageId}`,
      section: "closed",
      url: item.url,
      icon: <FavIcon url={item.url} size="sm" />,
      title: item.title || hostOf(item.url),
      detail: `${hostOf(item.url)} · closed tab`,
      hint: "Reopen",
      run: () => useStore.getState().reopenClosedTab(item.pageId),
    });
  }
  for (const item of rankCandidates(q, history).slice(0, 4)) {
    out.push({
      id: `h-${item.url}`,
      section: "history",
      url: item.url,
      icon: <FavIcon url={item.url} size="sm" />,
      title: item.title || hostOf(item.url),
      detail: hostOf(item.url),
      run: () => exec({ kind: "navigate", url: item.url, display: item.title }),
    });
  }
  for (const item of rankCandidates(q, extensions).slice(0, 4)) {
    out.push({
      id: `extension-${item.key}`,
      section: "extensions",
      icon: I.extension,
      title: item.name,
      detail: `${item.enabled && item.loaded ? "Open extension" : "Manage extension"} · ${item.version}`,
      hint: "Open",
      run: async () => {
        if (item.enabled && item.loaded && (await bridge.showExtensionAction(item.key))) return;
        window.history.pushState(null, "", "/settings/extensions");
        window.dispatchEvent(new PopStateEvent("popstate"));
      },
    });
  }
  for (const item of rankCandidates(q, programs).slice(0, 3)) {
    out.push({
      id: `prog-${item.programId}`,
      section: "programs",
      icon: I.result,
      title: item.name,
      detail: `Saved program · used ${item.useCount}×`,
      hint: "Run",
      run: async () => {
        if (!page) return toast("Open a page first", "error");
        await call("programs.run", { programId: item.programId, pageId: page.pageId });
        toast(`Running ${item.name}`);
      },
    });
  }
  const matchingChats = new Set(rankCandidates(q, runs).map((run) => run.config?.chatId ?? run.runId));
  for (const item of recentChats
    .filter((run) => matchingChats.has(run.config?.chatId ?? run.runId))
    .slice(0, 3)) {
    out.push({
      id: `run-${item.runId}`,
      section: "runs",
      icon: I.chats,
      title: item.goal,
      detail: isLive(item) ? "Open active conversation" : "Continue conversation",
      hint: "Open",
      run: () => useStore.getState().openConversation(item.runId),
    });
  }
  for (const item of savedWork?.results ?? [])
    out.push({
      id: `result-${item.artifactId}`,
      section: "results",
      icon: I.result,
      title: item.filename,
      detail: item.conversationTitle,
      hint: "Open",
      run: () => {
        useStore.getState().openConversationDraft(item.chatId);
        useStore.setState({ resultPreview: item.artifactId });
      },
    });
  for (const item of savedWork?.skills ?? [])
    out.push({
      id: `skill-${item.routineId}`,
      section: "skills",
      icon: I.layersSm,
      title: item.title,
      detail: item.objective,
      hint: "Open",
      run: () => openSavedSkill(item),
    });
  const listedChats = new Set(out.filter((item) => item.section === "runs").map((item) => item.id.slice(4)));
  for (const item of savedWork?.chats ?? []) {
    if (listedChats.has(item.latestRun.runId)) continue;
    out.push({
      id: `chat-${item.chatId}`,
      section: "chats",
      icon: I.chats,
      title: item.title,
      detail: "Conversation",
      hint: "Open",
      run: () => useStore.getState().openConversation(item.latestRun.runId),
    });
  }
  return rankAuxCommandResults(q, out, rankingEntries);
}
