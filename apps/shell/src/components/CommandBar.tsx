import type { HomePromptRequest } from "./home-prompt";
import { GlassMaterial } from "./GlassMaterial";
import type { ChromiumHostPort } from "../chromium-bridge";
import { orderedPages } from "../store/pages";
import { takeFirstFrame } from "../first-frame";
import { nativePerformanceControl } from "../native-performance-ready";
import { errorMessage } from "../error-message";
import { smallGhostButtonProps as auxReserveSmallGhostButtonProps } from "../ui/button-props";
import { HomeEntryAction, runHomeEntry, useHomeEntryInput, useHomeEntryOwner } from "./HomeEntryControls";
import { guardCommandCompletion } from "../command-completion";
import { askBreaker, useOmniboxActions } from "./omnibox/actions";
import { OmniboxResults, PROVIDER_SCOPES, type ProviderScope } from "./omnibox/results";
import {
  lazy,
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useShallow } from "zustand/react/shallow";
import type {
  CommandRankingEntry,
  ConversationSummary,
  Routine,
  Run,
  SavedProgram,
  SavedResult,
} from "@aux/contracts";
import { useNativeOmnibox } from "./omnibox/use-native-omnibox";
import { normalizeCommandRankingQuery } from "@aux/contracts/command-ranking-query";
import { isHomeAddress, toUrl } from "../chrome";
import { detectIntent, intentLabel, type Intent } from "../intent";
import { engineList } from "../engines";
import { useStore, call, errToast } from "../store";
import { hostOf, tabLabel } from "../workspace";

import { FavIcon } from "./SiteTile";
import {
  shellIconAgent,
  shellIconAgentSm,
  shellIconAlert,
  shellIconCommand,
  shellIconGlobe,
  shellIconLock,
  shellIconOpen,
  shellIconSearch,
  shellIconSearchLg,
  shellIconSend,
} from "../ui/icons";
import { bridge, type BrowserExtension } from "../bridge";
import { recentConversations } from "../conversations";
import { rememberSiteControlsOpener } from "../site-controls-opener";
import { useShortcutLabels, withShortcut } from "../use-shortcut-label";
import { inNativeHost, inMock } from "../bridge";
import { commandCandidateKey, mergeCommandResults } from "../command-results";
import type { ProviderSuggestion, Suggestion } from "./command-provider-types";
import { commandTabRows } from "./command-tab-rows";
import { useFeature } from "../use-feature";
import { openCommandSurface, type CommandSurfaceMode } from "../command-surface-state";
import "./CommandBar.css";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";

const HomeAsk = lazy(() => import("./HomeAsk"));
const CommandRankingDebug = lazy(() => import("./CommandRankingDebug"));

/**
 * One field, three jobs: URL bar, search, and agent prompt. Intent is
 * detected as you type and shown as a chip; ↵ runs it, ⌘↵ opens a new tab /
 * new task, ⇥ flips a task between "this page" and "new task".
 */
export function CommandBar({
  compact = false,
  hero = false,
  surfaceMode,
  tabSearch = false,
  seed,
  onClose,
  commandRows,
  providerRows,
  onQueryChange,
  promptRequest,
  onPromptConsumed,
}: {
  compact?: boolean;
  hero?: boolean;
  promptRequest?: HomePromptRequest;
  onPromptConsumed?(request: HomePromptRequest): void;
  surfaceMode?: CommandSurfaceMode;
  tabSearch?: boolean;
  seed?: string;
  onQueryChange?: (query: string) => void;
  providerRows?: (query: string) => Suggestion[];
  onClose?: () => void;
  commandRows?: (query: string) => Array<Suggestion & { keepOpen?: boolean; commandId?: string }>;
}) {
  const key = useShortcutLabels();
  const slot = hero ? "hero" : "toolbar";
  // Tab suggestions depend on identity/title/url/favicon — a digest of exactly
  // those fields keeps loading/audio churn from re-rendering the bar.
  const tabDigest = useStore(
    useShallow((s) =>
      orderedPages(s.pages).map(
        (p) => `${p.pageId}${p.title}${p.url}${p.favicon}${p.ownedByRuntime ? 1 : 0}`,
      ),
    ),
  );
  const activePageId = useStore((s) => s.activePageId);
  const tabNames = useStore((s) => s.layout.tabNames);
  const pins = useStore((s) => s.layout.pins);
  const settings = useStore((s) => s.settings);
  useStore(
    useShallow((s) =>
      s.runs.map((run) =>
        JSON.stringify([run.runId, run.goal, run.status, run.createdAt, run.config?.chatId]),
      ),
    ),
  );
  const runs = useStore.getState().runs;
  const programs = useStore((s) => s.programs);
  useStore(
    useShallow((s) =>
      s.bookmarks.map((bookmark) => JSON.stringify([bookmark.url, bookmark.title, bookmark.folderPath])),
    ),
  );
  const bookmarks = useStore.getState().bookmarks;
  useStore(
    useShallow((s) =>
      s.closedTabs.map((tab) =>
        JSON.stringify([
          tab.pageId,
          tab.title,
          tab.url,
          tab.closedAt,
          tab.spaceId,
          tab.folderId,
          tab.groupId,
        ]),
      ),
    ),
  );
  const closedTabs = useStore.getState().closedTabs;
  const focusRequest = useStore((s) => s.focusRequest);
  const focusSlot = useStore((s) => s.focusSlot);
  const startRun = useStore((s) => s.startRun);
  const activate = useStore((s) => s.activate);
  const newTab = useStore((s) => s.newTab);
  const setOverlay = useStore((s) => s.setOverlay);
  const agentDraft = useStore((s) => s.agentDraft);
  const page = useStore((s) => (s.activePageId ? s.pages.byId[s.activePageId ?? ""] : undefined));
  const pageAddress = page?.navigationError?.url ?? page?.url ?? "";
  const hasPage = !!page?.showBlankDocument || !isHomeAddress(pageAddress);
  const searchEngine = settings.searchEngine as string | undefined;
  const searchEngines = useMemo(
    () =>
      engineList(settings.searchEngines as { keyword: string; name: string; template: string }[] | undefined),
    [settings.searchEngines],
  );

  const initialPrefix = tabSearch
    ? null
    : surfaceMode === "command"
      ? "/"
      : seed && /^[@/>?]/.test(seed)
        ? (seed[0] as "@" | "/" | ">" | "?")
        : null;
  const [firstFrame] = useState(() => (hero ? takeFirstFrame() : undefined));
  const [firstSearch, setFirstSearch] = useState(() =>
    firstFrame?.activation?.mode === "search" ? firstFrame.activation : undefined,
  );
  useEffect(() => () => firstFrame?.activation?.retire(), [firstFrame]);
  const [editing, setEditing] = useState(!!surfaceMode || !!firstFrame?.focused || !!firstSearch?.current());
  const [submitting, setSubmitting] = useState(false);
  const [queryState, setQueryState] = useState({
    value:
      firstFrame?.text ??
      (seed
        ? initialPrefix && seed.startsWith(initialPrefix)
          ? seed.slice(1)
          : seed
        : surfaceMode === "edit"
          ? pageAddress
          : ""),
    generation: 0,
  });
  const val = queryState.value;
  const queryGeneration = queryState.generation;
  const setVal = useCallback((value: string) => {
    setQueryState((current) =>
      current.value === value
        ? current
        : {
            value,
            generation: current.generation + Number(current.value.trim() !== value.trim()),
          },
    );
  }, []);
  const [scopePrefix, setScopePrefix] = useState<"@" | "/" | ">" | "?" | null>(initialPrefix);
  const [routeFlip, setRouteFlip] = useState<"search" | "ask" | null>(null);
  const [preferSearchOffer, setPreferSearchOffer] = useState(false);
  const [breakerVersion, setBreakerVersion] = useState(0);
  useEffect(() => {
    if (!askBreaker.unavailable()) return;
    const timer = setTimeout(() => setBreakerVersion((value) => value + 1), askBreaker.retryAfter());
    return () => clearTimeout(timer);
  }, [breakerVersion]);
  const [selection, setSelection] = useState({ query: "", id: null as string | null, index: 0 });
  const [providerScope, setProviderScope] = useState<ProviderScope>(initialPrefix === "@" ? "tabs" : "all");
  const extensionsFeature = useFeature("extensions");
  const extensionEnabled = !bridge.privateMode && extensionsFeature;
  const [extensionItems, setExtensionItems] = useState<BrowserExtension[]>([]);
  const [rankingOpen, setRankingOpen] = useState(false);
  const rankingOpenedAt = useRef(Date.now());
  const [rankingEntries, setRankingEntries] = useState<CommandRankingEntry[]>([]);
  const [rankingError, setRankingError] = useState<string | null>(null);
  const [providerBuilder, setProviderBuilder] = useState<
    typeof import("./CommandProviderRows").buildCommandProviderRows | null
  >(null);
  const homeCurrent = useHomeEntryOwner(hero);
  const entryModeRequest = useRef(0);
  const [entryMode, setEntryModeState] = useState<"search" | "ask">(() => {
    if (!hero || bridge.privateMode) return firstFrame?.mode ?? "search";
    if (firstFrame) return firstFrame.mode;
    if (settings.homeEntryMode === "ask" || settings.homeEntryMode === "search")
      return settings.homeEntryMode;
    try {
      const legacy = localStorage.getItem("aux.home.entry-mode.v1");
      return legacy === "search" || legacy === "ask" ? legacy : "search";
    } catch {
      return "search";
    }
  });
  useEffect(() => {
    if (!hero || bridge.privateMode || firstFrame) return;
    if (settings.homeEntryMode === "ask" || settings.homeEntryMode === "search") {
      ++entryModeRequest.current;
      setEntryModeState(settings.homeEntryMode);
      return;
    }
    if (!settings.dataDir) return;
    try {
      const legacy = localStorage.getItem("aux.home.entry-mode.v1");
      if (legacy === "ask" || legacy === "search") {
        void call("settings.set", { homeEntryMode: legacy })
          .then(() => {
            if (localStorage.getItem("aux.home.entry-mode.v1") === legacy)
              localStorage.removeItem("aux.home.entry-mode.v1");
          })
          .catch(errToast);
      } else if (legacy !== null) localStorage.removeItem("aux.home.entry-mode.v1");
    } catch {
      /* Optional legacy storage cannot block the fresh Search entry. */
    }
  }, [hero, settings.dataDir, settings.homeEntryMode, firstFrame]);
  const setEntryMode = (next: "search" | "ask") => {
    const previous = entryMode;
    const request = ++entryModeRequest.current;
    setEntryModeState(next);
    if (bridge.privateMode) return Promise.resolve();
    return guardCommandCompletion(
      call("settings.set", { homeEntryMode: next })
        .then((value) => {
          if (homeCurrent()) {
            try {
              localStorage.removeItem("aux.home.entry-mode.v1");
            } catch {
              /* Optional legacy storage. */
            }
          }
          return value;
        })
        .catch((error) => {
          if (homeCurrent() && entryModeRequest.current === request) setEntryModeState(previous);
          throw error;
        }),
      homeCurrent,
    );
  };
  const [suggestionUsed, setSuggestionUsed] = useState(false);
  useEffect(() => {
    if (!hero || !promptRequest || !homeCurrent()) return;
    setSuggestionUsed(true);
    ++entryModeRequest.current;
    setVal("");
    setEditing(false);
    setEntryModeState("ask");
  }, [hero, promptRequest, homeCurrent]);
  const [scopeFlip, setScopeFlip] = useState(false);
  const [workResult, setWorkResult] = useState<{
    query: string;
    results: SavedResult[];
    skills: Routine[];
    chats: ConversationSummary[];
  }>({ query: "", results: [], skills: [], chats: [] });
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!hero && !surfaceMode && inputRef.current?.isConnected) return nativePerformanceControl("address");
  }, [hero, surfaceMode]);
  const barRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef(new Map<number, HTMLDivElement>());
  const listId = useId();
  const [popup, setPopup] = useState({ above: false, height: 420 });

  useLayoutEffect(() => {
    if (!editing || tabSearch) return;
    const place = () => {
      const bounds = barRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const below = window.innerHeight - bounds.bottom - 16;
      const above = bounds.top - 16;
      const flip = below < 180 && above > below;
      const height = Math.max(0, Math.min(420, flip ? above : below));
      setPopup((prior) =>
        prior.above === flip && prior.height === height ? prior : { above: flip, height },
      );
    };
    place();
    const resize = new ResizeObserver(place);
    if (barRef.current) resize.observe(barRef.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      resize.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [editing, tabSearch]);

  useLayoutEffect(() => {
    if (!surfaceMode) return;
    inputRef.current?.focus();
    if (surfaceMode === "edit") inputRef.current?.select();
  }, [surfaceMode]);

  // Select before typing can arrive; a native acknowledgement must never
  // reselect a draft the person has already started entering.
  useLayoutEffect(() => {
    if (!focusRequest || focusSlot !== slot) return;
    const el = inputRef.current;
    if (!el) return;
    const original = useStore.getState();
    const windowId = bridge.windowId;
    let owned = true;
    const current = () => {
      const state = useStore.getState();
      return (
        owned &&
        inputRef.current === el &&
        el.isConnected &&
        bridge.windowId === windowId &&
        state.focusRequest === focusRequest &&
        state.focusSlot === focusSlot &&
        state.activePageId === original.activePageId &&
        state.mode === original.mode &&
        state.overlay === original.overlay
      );
    };
    const retire = () => {
      owned = false;
      document.removeEventListener("pointerdown", moved, true);
      document.removeEventListener("focusin", moved, true);
      document.removeEventListener("keydown", navigated, true);
    };
    const moved = (event: Event) => {
      if (
        event.target !== el &&
        !(
          event.type === "focusin" &&
          (event.target === document.body || event.target === document.documentElement)
        )
      )
        retire();
    };
    const navigated = (event: KeyboardEvent) => {
      if (event.key === "Tab" || event.key === "Escape") retire();
    };
    el.focus();
    el.select();
    document.addEventListener("pointerdown", moved, true);
    document.addEventListener("focusin", moved, true);
    document.addEventListener("keydown", navigated, true);
    void bridge
      .focusShell()
      .then(() => {
        // Native parent-frame focus may settle after the initial DOM focus.
        // Reclaim only this request, preserving any text and caret typed meanwhile.
        if (
          current() &&
          [el, document.body, document.documentElement].includes(document.activeElement as HTMLElement)
        )
          el.focus({ preventScroll: true });
      })
      .catch((error) => {
        if (current()) errToast(error);
      })
      .finally(retire);
    return retire;
  }, [focusRequest, focusSlot, slot]);

  // The first native catalog adopts this window’s tab after the field mounts.
  // Only a change away from an existing tab retires its address draft.
  const previousActivePage = useRef(activePageId);
  useEffect(() => {
    const previous = previousActivePage.current;
    previousActivePage.current = activePageId;
    if (!editing || previous === null || previous === activePageId) return;
    setEditing(false);
    setVal("");
    setScopeFlip(false);
    if (document.activeElement === inputRef.current) inputRef.current?.blur();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePageId]);

  const previousAddress = useRef(pageAddress);
  useEffect(() => {
    const prior = previousAddress.current;
    previousAddress.current = pageAddress;
    // Back/Forward or a site navigation replaced the address being inspected.
    // Preserve an independently edited draft, but do not leave stale suggestions open.
    if (editing && prior !== pageAddress && val === prior) {
      setEditing(false);
      setVal("");
      setScopeFlip(false);
      inputRef.current?.blur();
    }
  }, [pageAddress, editing, val, setVal]);

  // a new tab starts empty; otherwise seed with the URL and select it
  const onFocus = () => {
    if (editing) return;
    rankingOpenedAt.current = Date.now();
    setEditing(true);
    setProviderScope("all");
    const seed = hero && entryMode === "ask" ? agentDraft : hasPage ? pageAddress : "";
    setVal(seed);
    setSel(0);
  };
  // Select the committed address before another input event can arrive. A frame
  // callback could select text the person had already started typing.
  useLayoutEffect(() => {
    if (editing && document.activeElement === inputRef.current) inputRef.current?.select();
  }, [editing]);
  useLayoutEffect(() => {
    if (!firstFrame?.focused || firstFrame.mode !== "search") return;
    const input = inputRef.current;
    input?.focus();
    input?.setSelectionRange(
      firstFrame.selectionStart,
      firstFrame.selectionEnd,
      firstFrame.selectionDirection,
    );
  }, [firstFrame]);
  const onBlur = () => {
    // let a click on a suggestion land before we tear the list down
    window.setTimeout(() => {
      if (!barRef.current?.contains(document.activeElement)) {
        setEditing(false);
        setVal("");
        setScopeFlip(false);
      }
    }, 0);
  };

  const raw = val.trim();
  useEffect(() => {
    onQueryChange?.(raw);
  }, [raw, onQueryChange]);
  const routing =
    settings.commandRouting === "prefer-chat" || settings.commandRouting === "prefer-search"
      ? settings.commandRouting
      : "automatic";
  const baseIntent: Intent = tabSearch
    ? raw
      ? { kind: "search", query: raw, url: toUrl(raw, searchEngine) }
      : { kind: "empty" }
    : scopePrefix === "/"
      ? { kind: "command", query: raw.replace(/^\//, "") }
      : detectIntent((scopePrefix === ">" || scopePrefix === "?" ? scopePrefix : "") + raw, {
          hasPage,
          searchEngines,
          routing,
          askUnavailable: askBreaker.unavailable(),
        });
  const intent: Intent = (() => {
    if (hero && raw) {
      if (entryMode === "ask") return { kind: "run", goal: raw, scope: "new" };
      return baseIntent.kind === "navigate"
        ? baseIntent
        : { kind: "search", query: raw, url: toUrl(raw, searchEngine) };
    }
    if (routeFlip && raw && (baseIntent.kind === "run" || baseIntent.kind === "search"))
      return routeFlip === "search" || askBreaker.unavailable()
        ? { kind: "search", query: raw, url: toUrl(raw, searchEngine) }
        : { kind: "run", goal: raw, scope: hasPage ? "page" : "new" };
    if (baseIntent.kind === "run" && scopeFlip)
      return { ...baseIntent, scope: baseIntent.scope === "page" ? "new" : "page" };
    return baseIntent;
  })();
  const typedSomething =
    !(hero && entryMode === "ask") &&
    editing &&
    (tabSearch || scopePrefix === "/" || scopePrefix === "@" || raw.length > 0) &&
    (surfaceMode !== undefined || raw !== pageAddress);
  const browserAutocomplete = inNativeHost || inMock;

  useEffect(() => {
    if (!editing || providerBuilder) return;
    let live = true;
    void import("./CommandProviderRows")
      .then((module) => {
        if (live) setProviderBuilder(() => module.buildCommandProviderRows);
      })
      .catch((error) => {
        if (live) setRankingError(errorMessage(error));
      });
    return () => {
      live = false;
    };
  }, [editing, providerBuilder]);

  useEffect(() => {
    if (!editing || !extensionEnabled) return;
    let live = true;
    void bridge
      .extensions()
      .then((items) => {
        if (live) setExtensionItems(items);
      })
      .catch(() => {
        if (live) setExtensionItems([]);
      });
    return () => {
      live = false;
    };
  }, [editing, extensionEnabled]);

  const nativeOmnibox = useNativeOmnibox(
    browserAutocomplete &&
      editing &&
      !scopePrefix &&
      !(hero && entryMode === "ask") &&
      ["empty", "navigate", "search"].includes(intent.kind),
    firstSearch?.current() ? firstSearch.text.trim() : raw,
    firstSearch?.current() ? -1 : queryGeneration,
  );
  const browserMatches = firstSearch ? [] : nativeOmnibox.items;
  const browserError = nativeOmnibox.error;
  const currentBrowserResult = nativeOmnibox.current;
  const retryAutocomplete = nativeOmnibox.retry;

  const [workStatus, setWorkStatus] = useState({ query: "", pending: 0, failed: false });
  const [workRetry, setWorkRetry] = useState(0);
  const workSearch =
    (providerScope === "all" || providerScope === "work") && scopePrefix !== "@" && intent.kind !== "command";
  const skillsEnabled = useFeature("automations");
  // Saved work joins after immediate local matches. Old responses never paint
  // a new query, and private browsing never queries the regular Profile.
  useEffect(() => {
    if (bridge.privateMode || !typedSomething || raw.length < 2 || raw.length > 300 || !workSearch) return;
    let live = true;
    const timer = window.setTimeout(() => {
      const update = (patch: Partial<Omit<typeof workResult, "query">>) => {
        if (!live) return;
        setWorkResult((current) => ({
          ...(current.query === raw ? current : { query: raw, results: [], skills: [], chats: [] }),
          ...patch,
        }));
      };
      setWorkStatus({ query: raw, pending: skillsEnabled ? 3 : 2, failed: false });
      const accept = <K extends keyof Omit<typeof workResult, "query">>(
        key: K,
        promise: Promise<(typeof workResult)[K]>,
      ) => {
        void promise
          .then((value) => update({ [key]: value }))
          .catch(() => {
            if (live) setWorkStatus((status) => ({ ...status, failed: true }));
          })
          .finally(() => {
            if (live) setWorkStatus((status) => ({ ...status, pending: status.pending - 1 }));
          });
      };
      accept("results", call("results.search", { query: raw, limit: 3 }));
      if (skillsEnabled) accept("skills", call("routines.list", { query: raw, limit: 3 }));
      accept("chats", call("conversations.list", { query: raw, limit: 5, archived: false }));
    }, 100);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [raw, typedSomething, workRetry, workSearch, skillsEnabled]);
  const savedWork =
    workResult.query === raw ? { ...workResult, skills: skillsEnabled ? workResult.skills : [] } : null;

  // Inline host completion — only a bare hostname prefix earns ghost text;
  // ArrowRight/End accepts like every mainstream browser.
  const inlineCompletion = useMemo(() => {
    if (tabSearch || !typedSomething || intent.kind === "command" || /\s/.test(raw)) return null;
    const q = raw.toLowerCase();
    if (q.length < 2 || q.includes("/")) return null;
    const urls = [
      ...orderedPages(useStore.getState().pages)
        .filter((p) => !p.ownedByRuntime)
        .map((p) => p.url),
      ...bookmarks.map((b) => b.url),
    ];
    let best: string | null = null;
    for (const url of urls) {
      const host = hostOf(url);
      if (!host.startsWith(q) || host.length <= q.length) continue;
      if (!best || host.length < best.length) best = host;
    }
    return best ? best.slice(q.length) : null;
  }, [tabSearch, typedSomething, intent.kind, raw, tabDigest, bookmarks]);

  const exec = useOmniboxActions({
    page,
    newTab,
    startRun,
    hero,
    surfaceMode,
    browserAutocomplete,
    nativeOmnibox,
    setBreakerVersion,
  });

  // The intent row tracks every keystroke; provider ranking follows a deferred
  // query so typing never waits on it. Candidate lists are built once per source
  // change so the ranker's folded-text cache survives across keystrokes.
  const tabCandidates = useMemo(() => {
    const layout = useStore.getState().layout;
    return orderedPages(useStore.getState().pages)
      .filter((p) => (tabSearch || p.pageId !== activePageId) && !p.ownedByRuntime)
      .map((p) => ({
        ...p,
        id: p.pageId,
        title: tabLabel(layout, p),
        pinned: Object.values(pins)
          .flat()
          .some((pin) => pin.pageId === p.pageId || (!pin.pageId && pin.url === p.url)),
      }));
  }, [tabDigest, activePageId, tabNames, pins, tabSearch]);
  const closedCandidates = useMemo(() => closedTabs.map((tab) => ({ ...tab, id: tab.pageId })), [closedTabs]);
  const extensionCandidates = useMemo(
    () => extensionItems.map((item) => ({ ...item, id: item.key, title: item.name })),
    [extensionItems],
  );
  const programCandidates = useMemo(
    () => programs.map((pr: SavedProgram) => ({ ...pr, id: pr.programId, title: pr.name })),
    [programs],
  );
  const runCandidates = useMemo(() => runs.map((r: Run) => ({ ...r, id: r.runId, title: r.goal })), [runs]);
  const recentChats = useMemo(() => recentConversations(runs), [runs]);
  const intentRows = useMemo<Suggestion[]>(() => {
    if (!typedSomething) return [];
    const out: Suggestion[] = [];
    if (intent.kind !== "empty") {
      out.push({
        id: "intent",
        section: "intent",
        url: intent.kind === "navigate" || intent.kind === "search" ? intent.url : undefined,
        icon:
          intent.kind === "run"
            ? shellIconAgentSm
            : intent.kind === "navigate"
              ? shellIconOpen
              : intent.kind === "command"
                ? shellIconCommand
                : shellIconSearch,
        title:
          intent.kind === "navigate"
            ? intent.display
            : intent.kind === "search"
              ? `Search for “${intent.query}”`
              : intent.kind === "run"
                ? intent.goal
                : `Command: ${intent.query}`,
        detail:
          intent.kind === "run"
            ? intent.scope === "page"
              ? `Ask on ${hostOf(page?.url ?? "")}`
              : "Start a new task in a fresh tab"
            : intent.kind === "navigate"
              ? "Open"
              : intent.kind === "search"
                ? "Web search"
                : "Open the command palette",
        hint: "↵",
        run: () => exec(intent),
      });
    }
    if (intent.kind === "command") return out;
    if (!hero && intent.kind === "search") {
      out.push({
        id: "ask",
        section: "intent",
        icon: shellIconAgentSm,
        title: `Ask Aux: ${raw}`,
        detail: hasPage ? `Use the current page · ${hostOf(page?.url ?? "")}` : "Start a conversation",
        hint: "Ask",
        run: () => exec({ kind: "run", goal: raw, scope: hasPage ? "page" : "new" }),
      });
    }
    return out;
  }, [typedSomething, raw, intent, hero, hasPage, page, exec]);
  const browserRows = useMemo<ProviderSuggestion[]>(
    () =>
      browserMatches.map((match) => ({
        id: `browser-${match.id}`,
        section:
          tabSearch && ["tab", "bookmark", "history"].includes(match.type)
            ? match.type === "tab"
              ? "tabs"
              : match.type === "bookmark"
                ? "bookmarks"
                : "history"
            : "browser",
        providerType: match.type,
        url: match.url,
        icon: match.type === "search" ? shellIconSearch : <FavIcon url={match.url} size="sm" />,
        title: match.title,
        detail: match.description || hostOf(match.url),
        run: () =>
          nativeOmnibox.open(match, surfaceMode === "new-tab" ? "new-foreground-tab" : "current-tab"),
      })),
    [browserMatches, nativeOmnibox.open, surfaceMode, tabSearch],
  );
  const rankQuery = useDeferredValue(typedSomething ? raw.toLowerCase() : "");
  // Open tabs remain keyboard-ready while the optional providers load.
  const immediateTabs = useMemo(
    () => (scopePrefix === "@" || tabSearch ? commandTabRows(rankQuery, tabCandidates, activate) : []),
    [rankQuery, tabCandidates, activate, scopePrefix, tabSearch],
  );
  const rankedDetails = useMemo(() => {
    if (!rankQuery && !tabSearch)
      return scopePrefix === "@"
        ? immediateTabs.map((candidate) => ({
            candidate,
            key: commandCandidateKey(candidate),
            base: 0,
            adjustment: 0,
            score: 0,
          }))
        : [];
    if (!providerBuilder)
      return immediateTabs.map((candidate) => ({
        candidate,
        key: commandCandidateKey(candidate),
        base: 0,
        adjustment: 0,
        score: 0,
      }));
    return providerBuilder({
      query: rankQuery,
      tabs: scopePrefix === "@" || tabSearch ? tabCandidates : [],
      includeRecent: tabSearch && !rankQuery,
      closed: closedCandidates,
      extensions: extensionCandidates,
      programs: programCandidates,
      runs: runCandidates,
      recentChats,
      savedWork,
      page,
      rankingEntries,
      rankingOpenedAt: rankingOpenedAt.current,
      activate,
    });
  }, [
    rankQuery,
    providerBuilder,
    immediateTabs,
    scopePrefix,
    tabSearch,
    tabCandidates,
    closedCandidates,
    extensionCandidates,
    programCandidates,
    runCandidates,
    recentChats,
    savedWork,
    page,
    rankingEntries,
    activate,
  ]);
  const rankedRows = useMemo(() => rankedDetails.map((item) => item.candidate), [rankedDetails]);
  const mergedRows = useMemo(() => {
    const sites = providerScope === "sites";
    const browser = browserRows.filter(
      (row) =>
        providerScope === "all" ||
        sites ||
        row.section === providerScope ||
        (providerScope === "bookmarks" && row.providerType === "bookmark") ||
        (providerScope === "history" && row.providerType === "history") ||
        (providerScope === "tabs" && row.providerType === "tab"),
    );
    const aux = (rankQuery === raw.toLowerCase() ? rankedRows : []).filter(
      (row) =>
        providerScope === "all" ||
        row.section === providerScope ||
        (sites && ["suggest", "domains", "bookmarks", "history"].includes(row.section)) ||
        (providerScope === "work" &&
          ["programs", "runs", "results", "skills", "chats", "tasks", "memory", "sets"].includes(
            row.section,
          )),
    );
    return mergeCommandResults(browser, aux);
  }, [browserRows, rankedRows, rankQuery, raw, providerScope]);
  const combinedSuggestions = useMemo(() => {
    if (!typedSomething)
      return mergeCommandResults(
        browserRows,
        !raw && (providerScope === "all" || providerScope === "tabs")
          ? commandTabRows(
              "",
              tabCandidates.filter((tab) => tab.pageId !== activePageId),
              activate,
            )
          : [],
      ).rows;
    if (intent.kind === "command" && commandRows)
      return mergeCommandResults(commandRows(intent.query), [
        ...mergedRows.rows,
        ...(providerRows?.(raw) ?? []),
      ]).rows;
    const supplemental = (providerRows?.(raw) ?? []).filter(
      (row) =>
        providerScope === "all" ||
        row.section === providerScope ||
        (providerScope === "work" &&
          ["programs", "runs", "results", "skills", "chats", "tasks", "memory", "sets"].includes(
            row.section,
          )),
    );
    return mergeCommandResults(providerScope === "all" ? intentRows : [], [
      ...mergedRows.rows,
      ...supplemental,
    ]).rows;
  }, [
    typedSomething,
    tabCandidates,
    activePageId,
    activate,
    browserRows,
    intentRows,
    mergedRows,
    providerScope,
    intent,
    commandRows,
    providerRows,
    raw,
  ]);
  const suggestions = useMemo(() => {
    if (!tabSearch) return combinedSuggestions;
    const order: Partial<Record<Suggestion["section"], number>> = {
      extensions: 0,
      tabs: 1,
      closed: 2,
      runs: 3,
      chats: 3,
      bookmarks: 4,
      history: 5,
    };
    const counts = new Map<Suggestion["section"], number>();
    return combinedSuggestions
      .filter((row) => {
        if (row.section === "intent") return false;
        if (providerScope !== "all") return true;
        if (order[row.section] === undefined) return false;
        if (raw) return true;
        if (!["tabs", "closed", "runs", "chats"].includes(row.section)) return false;
        const section = row.section === "runs" ? "chats" : row.section;
        const count = (counts.get(section) ?? 0) + 1;
        counts.set(section, count);
        return count <= 2;
      })
      .sort((a, b) => (order[a.section] ?? 6) - (order[b.section] ?? 6));
  }, [combinedSuggestions, tabSearch, providerScope, raw]);

  // Disposable benchmark only: acknowledge a real current native suggestion
  // after its DOM row is committed. Native owns input time, original document,
  // renderer frame submission and successful compositor presentation feedback.
  const performanceQuery = useRef(0);
  useLayoutEffect(() => {
    const port = (window as Window & { auxChromiumHost?: ChromiumHostPort }).auxChromiumHost;
    if (
      !port?.performanceCommit ||
      !editing ||
      !currentBrowserResult ||
      browserError ||
      nativeOmnibox.queryId <= performanceQuery.current
    )
      return;
    const index = suggestions.findIndex(
      (row) => row.section === "browser" && browserMatches.some((match) => row.id === `browser-${match.id}`),
    );
    const node = optionRefs.current.get(index);
    if (!node?.isConnected || node.getClientRects().length === 0) return;
    performanceQuery.current = nativeOmnibox.queryId;
    void port.performanceCommit(nativeOmnibox.queryId).catch(() => {});
  }, [editing, currentBrowserResult, browserError, nativeOmnibox.queryId, suggestions, browserMatches]);

  // The native fixture reads only generations and a fixed source label. These
  // are committed with the actual visible rows, never input echo or old results.
  const resultSource =
    typedSomething &&
    intent.kind === "command" &&
    commandRows &&
    suggestions.some((row) => "commandId" in row && !!row.commandId)
      ? "registry"
      : typedSomething &&
          browserAutocomplete &&
          currentBrowserResult &&
          !browserError &&
          suggestions.some((row) => row.section === "history" || row.providerType === "history")
        ? "history"
        : undefined;

  const runSuggestion = async (suggestion: Suggestion, newTab = false) => {
    const nativeMatch = browserMatches.find((match) => `browser-${match.id}` === suggestion.id);
    if (nativeMatch && newTab)
      await nativeOmnibox.open(
        nativeMatch,
        surfaceMode === "new-tab" ? "new-background-tab" : "new-foreground-tab",
      );
    else await suggestion.run();
    if (bridge.privateMode || suggestion.section === "intent" || !raw || suggestion.id.startsWith("browser-"))
      return;
    const query = normalizeCommandRankingQuery(raw);
    const candidateKey = commandCandidateKey(suggestion);
    if (candidateKey.length > 300) return;
    try {
      const entry = await call("command.ranking.record", {
        query,
        candidateKey,
        source: suggestion.section,
        pickOrigin: suggestion.providerType === "typed" ? "typed" : "bar",
      });
      setRankingEntries((current) => [
        entry,
        ...current.filter((item) => item.query !== query || item.candidateKey !== candidateKey),
      ]);
      setRankingError(null);
    } catch (error) {
      setRankingError(errorMessage(error));
    }
  };
  const clearRanking = async () => {
    try {
      await call("command.ranking.clear", {});
      setRankingEntries([]);
      setRankingError(null);
    } catch (error) {
      setRankingError(errorMessage(error));
    }
  };

  // Streaming results can move a row while React commits unrelated store updates.
  // Derive its position from the saved identity; never feed the old index back
  // into another effect that can replace that identity during the same commit.
  const selectedIndex =
    selection.query === raw && selection.id ? suggestions.findIndex((row) => row.id === selection.id) : -1;
  const sel =
    selection.query !== raw
      ? 0
      : selectedIndex >= 0
        ? selectedIndex
        : Math.min(selection.index, Math.max(0, suggestions.length - 1));
  const setSel = (next: number | ((current: number) => number)) => {
    const index = Math.max(
      0,
      Math.min(typeof next === "function" ? next(sel) : next, Math.max(0, suggestions.length - 1)),
    );
    setSelection({ query: raw, id: suggestions[index]?.id ?? null, index });
  };
  useEffect(() => {
    optionRefs.current.get(sel)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const switchEntryMode = (next: "search" | "ask") => {
    useStore.getState().focusCommandBar("hero");
    if (next === "ask") {
      if (val) useStore.getState().setAgentDraft(val);
      // Consume search text once; later mode switches resume the same durable draft.
      setVal("");
      setEditing(false);
    }
    const completion = setEntryMode(next);
    requestAnimationFrame(() => {
      if (homeCurrent()) inputRef.current?.focus();
    });
    return completion;
  };

  const homeInputScope = useHomeEntryInput(inputRef, hero && entryMode === "search", homeCurrent, () =>
    switchEntryMode("ask"),
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.altKey && /^[1-8]$/.test(e.key)) {
      e.preventDefault();
      const scope = PROVIDER_SCOPES[Number(e.key) - 1]!;
      if (scope === "extensions" && !extensionEnabled) return;
      setProviderScope(scope);
      setSel(0);
      return;
    }
    if (hero && e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      runHomeEntry("select-home-ask", homeInputScope, e.nativeEvent);
      return;
    }
    if (e.key === "Backspace" && !val && scopePrefix) {
      e.preventDefault();
      setScopePrefix(null);
      setProviderScope("all");
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (providerScope !== "all") {
        setProviderScope("all");
        setSel(0);
        return;
      }
      if (onClose) onClose();
      else inputRef.current?.blur();
      return;
    }
    if (
      (e.key === "ArrowRight" || e.key === "End") &&
      inlineCompletion &&
      e.currentTarget.selectionStart === val.length &&
      e.currentTarget.selectionEnd === val.length
    ) {
      e.preventDefault();
      setVal(val + inlineCompletion);
      return;
    }
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Tab" && !e.shiftKey && sel > 0 && suggestions[sel]?.section !== "intent") {
      const section = suggestions[sel]!.section;
      const scope =
        section === "domains" || section === "suggest"
          ? "sites"
          : ["programs", "runs", "results", "skills", "chats", "tasks", "memory", "sets"].includes(section)
            ? "work"
            : section;
      if (PROVIDER_SCOPES.includes(scope as ProviderScope)) {
        e.preventDefault();
        setProviderScope(scope as ProviderScope);
        setSel(0);
      }
    } else if (
      !tabSearch &&
      e.key === "Tab" &&
      !e.shiftKey &&
      (intent.kind === "run" || intent.kind === "search")
    ) {
      e.preventDefault();
      const next = intent.kind === "run" ? "search" : "ask";
      setRouteFlip(next);
      setPreferSearchOffer(askBreaker.flipped(next));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (firstSearch) return;
      const chosen = suggestions[sel];
      if (tabSearch && !chosen) return;
      // ↵ on the intent row accepts a ghost-completed host, like Chrome.
      const completed =
        inlineCompletion && sel === 0 && e.currentTarget.selectionStart === val.length
          ? detectIntent(val + inlineCompletion, { hasPage, searchEngine, searchEngines })
          : intent;
      void submit(
        () =>
          chosen &&
          (tabSearch ||
            chosen.section === "tabs" ||
            intent.kind === "command" ||
            providerScope !== "all" ||
            sel > 0)
            ? runSuggestion(chosen, e.metaKey || e.ctrlKey)
            : exec(completed, e.metaKey || e.ctrlKey),
        !!chosen && "keepOpen" in chosen && chosen.keepOpen === true,
      );
    }
  };

  const submit = async (work: () => unknown | Promise<unknown>, keepOpen = false) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await work();
      if (!keepOpen) {
        onClose?.();
        inputRef.current?.blur();
      }
    } catch (error) {
      errToast(error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!firstSearch) return;
    if (entryMode !== "search" || !firstSearch.current() || !homeCurrent()) {
      firstSearch.retire();
      setFirstSearch(undefined);
      return;
    }
    if (browserAutocomplete && !nativeOmnibox.ready && !nativeOmnibox.error) return;
    if (!firstSearch.consume()) return;
    const original = firstSearch;
    const latest = inputRef.current?.value ?? val;
    if (latest !== original.text) useStore.getState().setAgentDraft(latest);
    const target = detectIntent(original.text, { hasPage, searchEngine, searchEngines });
    const search: Intent =
      target.kind === "navigate"
        ? target
        : {
            kind: "search",
            query: original.text.trim(),
            url: toUrl(original.text, searchEngine),
          };
    void submit(async () => {
      if (!original.current() || !homeCurrent()) return;
      let recoveryOffered = false;
      try {
        if (nativeOmnibox.error) throw new Error(nativeOmnibox.error);
        await exec(search, original.newTab);
      } catch (error) {
        if (original.current() && homeCurrent()) {
          const input = inputRef.current;
          const currentText = input?.value ?? val;
          if (currentText !== original.text) {
            useStore.getState().setAgentDraft(currentText);
            recoveryOffered = true;
            useStore.getState().toast(errorMessage(error), "error", {
              label: "Restore original search",
              run: () => {
                if (
                  !original.current() ||
                  !homeCurrent() ||
                  inputRef.current !== input ||
                  !input?.isConnected
                )
                  return;
                original.retire();
                setVal(original.text);
                setEditing(true);
                input.focus();
              },
            });
          } else {
            setVal(original.text);
            throw error;
          }
        }
      } finally {
        // A failed query may retain its owner only for explicit text recovery.
        // Clearing firstSearch always releases the original native query.
        if (!recoveryOffered) original.retire();
        setFirstSearch(undefined);
      }
    }, true);
  });

  const secure =
    !page?.navigationError &&
    !page?.loading &&
    page?.viewStatus !== "crashed" &&
    pageAddress.startsWith("https://");
  const showIntent = !tabSearch && typedSomething && intent.kind !== "empty";
  const title = page?.title || (hasPage ? hostOf(pageAddress) : "");
  const placeholder = tabSearch
    ? "Search tabs, chats, history, bookmarks or extensions"
    : hero && entryMode === "ask"
      ? "Ask Aux a task…"
      : "Search or type a URL";

  if (hero && entryMode === "ask")
    return (
      <Suspense
        fallback={
          <output className="home-ask-loading" data-block>
            Opening composer…
          </output>
        }
      >
        <HomeAsk
          firstFrame={suggestionUsed || promptRequest ? undefined : firstFrame}
          promptRequest={promptRequest}
          onPromptConsumed={onPromptConsumed}
          onSearch={() => switchEntryMode("search")}
          current={homeCurrent}
        />
      </Suspense>
    );

  return (
    <div
      ref={barRef}
      data-command-query-generation={queryGeneration}
      data-tab-search={tabSearch || undefined}
      onBlurCapture={onBlur}
      className={`cmdbar ${compact ? "compact" : ""} ${hero ? "hero" : ""} ${editing ? "editing" : ""} ${showIntent ? `intent-${intent.kind}` : ""}`}
    >
      <span className="cb-lead">
        {tabSearch ? (
          <span className="cb-ico">{shellIconSearch}</span>
        ) : compact ? (
          hasPage && !editing ? (
            <button
              {...auxNativeButtonTypeProps}
              className="cb-ico cb-site-trigger"
              title="Site controls"
              aria-label="Site controls"
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                rememberSiteControlsOpener(event.currentTarget);
                setOverlay("site");
              }}
            >
              {shellIconGlobe}
            </button>
          ) : (
            <span className="cb-ico">
              {showIntent && intent.kind === "run" ? shellIconAgent : shellIconSearch}
            </span>
          )
        ) : page && hasPage && !hero ? (
          <span className="cb-ico">{shellIconGlobe}</span>
        ) : (
          <span className="cb-ico">
            {showIntent && intent.kind === "run" ? shellIconAgent : shellIconSearchLg}
          </span>
        )}
        {hasPage && !editing && !hero && !compact && (
          <button
            {...auxNativeButtonTypeProps}
            className={`cb-lock ${secure ? "secure" : ""}`}
            title="Site controls"
            aria-label="Site controls"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              rememberSiteControlsOpener(event.currentTarget);
              setOverlay("site");
            }}
          >
            {secure ? shellIconLock : shellIconAlert}
          </button>
        )}
      </span>
      <div className="cb-field">
        {!editing && (
          <span
            className="cb-display"
            aria-hidden
            onMouseDown={(e) => {
              e.preventDefault();
              const input = inputRef.current;
              if (!input) return;
              input.focus();
              void bridge
                .focusShell()
                .then(() => input.focus())
                .catch(errToast);
            }}
          >
            {hasPage && !hero ? (
              <>
                <span className="cb-title">{hostOf(pageAddress)}</span>
                {title !== hostOf(pageAddress) && (
                  <>
                    <span className="cb-sep" aria-hidden>
                      |
                    </span>
                    <span className="cb-host">{title}</span>
                  </>
                )}
              </>
            ) : (
              <span className="cb-placeholder">{placeholder}</span>
            )}
          </span>
        )}
        {editing && inlineCompletion && (
          <span className="cb-ghost" aria-hidden>
            {val}
            <span className="cb-ghost-tail">{inlineCompletion}</span>
          </span>
        )}
        <input
          autoFocus={!!surfaceMode}
          ref={inputRef}
          className={editing ? "" : "ghost"}
          value={editing ? val : ""}
          role="combobox"
          aria-label={
            tabSearch
              ? placeholder
              : hero
                ? `${entryMode === "search" ? "Search or address" : "Ask Aux"}. Press Tab to switch mode.`
                : "Address, search, and agent prompt"
          }
          data-command-value-generation={queryGeneration}
          aria-expanded={editing}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={editing ? listId : undefined}
          aria-activedescendant={suggestions[sel] ? `${listId}-opt-${sel}` : undefined}
          aria-busy={submitting || undefined}
          aria-keyshortcuts="Alt+1 Alt+2 Alt+3 Alt+4 Alt+5 Alt+6 Alt+7 Alt+8"
          placeholder={editing ? placeholder : ""}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          onFocus={onFocus}
          onChange={(e) => {
            if (firstSearch) {
              setVal(e.target.value);
              useStore.getState().setAgentDraft(e.target.value);
              return;
            }
            setRouteFlip(null);
            if (!tabSearch && !scopePrefix && /^[ @/>?]$/.test(e.target.value) && e.target.value !== " ") {
              const prefix = e.target.value as "@" | "/" | ">" | "?";
              setScopePrefix(prefix);
              setVal("");
              if (prefix === "@") setProviderScope("tabs");
              return;
            }
            setVal(e.target.value);
            if (hero && entryMode === "ask") useStore.getState().setAgentDraft(e.target.value);
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      {tabSearch ? (
        key("command-tabs") && <kbd className="cb-tab-search-key">{key("command-tabs")}</kbd>
      ) : hero ? (
        <div className="home-mode">
          <span>
            <kbd>Tab</kbd> to switch
          </span>
          <div role="group" aria-label="Search or Ask">
            {(["search", "ask"] as const).map((m) => (
              <HomeEntryAction
                key={m}
                command={m === "search" ? "select-home-search" : "select-home-ask"}
                current={homeCurrent}
                invoke={() => switchEntryMode(m)}
                aria-pressed={entryMode === m}
                onMouseDown={(e) => e.preventDefault()}
              >
                {m === "search" ? "Search" : "Ask"}
              </HomeEntryAction>
            ))}
          </div>
        </div>
      ) : showIntent ? (
        <button
          {...auxNativeButtonTypeProps}
          className={`cb-chip ${intent.kind}`}
          tabIndex={-1}
          title={
            intent.kind === "run" || intent.kind === "search"
              ? "Tab switches between Ask and Search"
              : undefined
          }
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (intent.kind !== "run" && intent.kind !== "search") return;
            const next = intent.kind === "run" ? "search" : "ask";
            setRouteFlip(next);
            setPreferSearchOffer(askBreaker.flipped(next));
          }}
        >
          {intent.kind === "run"
            ? shellIconAgentSm
            : intent.kind === "navigate"
              ? shellIconOpen
              : intent.kind === "search"
                ? shellIconSearch
                : shellIconCommand}
          {intentLabel(intent)}
          {intent.kind === "run" && <kbd>⇥</kbd>}
        </button>
      ) : (
        !editing &&
        !compact &&
        !hero &&
        !bridge.privateMode &&
        key("palette") && (
          <button
            {...auxNativeButtonTypeProps}
            className="cb-kbd"
            tabIndex={-1}
            title={withShortcut("Command palette", key("palette"))}
            aria-label="Open command palette"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openCommandSurface({ mode: "command" })}
          >
            {key("palette")}
          </button>
        )
      )}
      {hero && typedSomething && (
        <button
          {...auxNativeButtonTypeProps}
          className="cb-send"
          tabIndex={-1}
          title="Go (↵)"
          aria-label="Submit"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const chosen = suggestions[sel];
            void submit(() =>
              chosen &&
              (chosen.section === "tabs" || intent.kind === "command" || providerScope !== "all" || sel > 0)
                ? runSuggestion(chosen)
                : exec(intent),
            );
          }}
        >
          {shellIconSend}
        </button>
      )}
      {scopePrefix && (
        <span className="cb-scope-pill">
          <GlassMaterial />
          {scopePrefix === "@"
            ? "Tabs"
            : scopePrefix === "/"
              ? "Commands"
              : scopePrefix === ">"
                ? "Ask"
                : "Search"}
        </span>
      )}
      {editing && (
        <OmniboxResults
          popup={tabSearch ? { above: false, height: 296 } : popup}
          tabSearch={tabSearch}
          idle={!typedSomething}
          privateMode={bridge.privateMode}
          extensionEnabled={extensionEnabled}
          providerScope={providerScope}
          onScope={(scope) => {
            setProviderScope(scope);
            setSel(0);
            inputRef.current?.focus();
          }}
          rankingOpen={rankingOpen}
          onRankingToggle={() => setRankingOpen((value) => !value)}
          searchSuggestions={settings.searchSuggestions === true}
          browserError={browserError}
          retry={retryAutocomplete}
          listId={listId}
          generation={queryGeneration}
          resultSource={resultSource}
          suggestions={suggestions}
          selected={sel}
          query={raw}
          commandQuery={intent.kind === "command"}
          onHover={(index) => sel !== index && setSel(index)}
          onOptionRef={(index, node) => {
            if (node) optionRefs.current.set(index, node);
            else optionRefs.current.delete(index);
          }}
          onSelect={(suggestion) =>
            void submit(
              () => runSuggestion(suggestion),
              "keepOpen" in suggestion && suggestion.keepOpen === true,
            )
          }
          status={
            (askBreaker.unavailable() ||
              preferSearchOffer ||
              (workSearch && workStatus.query === raw && (workStatus.pending > 0 || workStatus.failed))) && (
              <div className="cb-query-status">
                {askBreaker.unavailable() && typedSomething && (
                  <output className="cb-suggestion-privacy">Ask unavailable — searching</output>
                )}
                {preferSearchOffer && (
                  <button
                    {...auxNativeButtonTypeProps}
                    {...auxReserveSmallGhostButtonProps}
                    onClick={() => {
                      void call("settings.set", { commandRouting: "prefer-search" })
                        .then(() => setPreferSearchOffer(false))
                        .catch(errToast);
                    }}
                  >
                    Prefer search?
                  </button>
                )}
                {workSearch && workStatus.query === raw && workStatus.pending > 0 && (
                  <output className="cb-suggestion-privacy">Searching saved work…</output>
                )}
                {workSearch && workStatus.query === raw && workStatus.failed && (
                  <output className="cb-suggestion-privacy">
                    Some saved work couldn’t be searched.{" "}
                    <button
                      {...auxReserveSmallGhostButtonProps}
                      onClick={() => setWorkRetry((value) => value + 1)}
                    >
                      Retry
                    </button>
                  </output>
                )}
              </div>
            )
          }
          rankingDetails={
            rankingOpen &&
            !bridge.privateMode && (
              <Suspense fallback={<output className="cb-empty">Opening ranking details…</output>}>
                <CommandRankingDebug
                  rows={rankedDetails
                    .filter((item) => mergedRows.rows.some((row) => row.id === item.candidate.id))
                    .slice(0, 12)
                    .map((item) => ({
                      id: item.candidate.id,
                      title: item.candidate.title,
                      source: item.candidate.section,
                      base: item.base,
                      adjustment: item.adjustment,
                      score: item.score,
                    }))}
                  duplicates={mergedRows.dropped}
                  choices={rankingEntries.length}
                  error={rankingError}
                  onClear={() => void clearRanking()}
                />
              </Suspense>
            )
          }
        />
      )}
    </div>
  );
}
