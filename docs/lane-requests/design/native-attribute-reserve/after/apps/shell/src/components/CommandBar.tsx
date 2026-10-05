import {
  smallGhostButtonProps as auxReserveSmallGhostButtonProps,
} from "../ui/button-props";
import { HomeEntryAction, runHomeEntry, useHomeEntryInput, useHomeEntryOwner } from "./HomeEntryControls";
import { guardCommandCompletion } from "../command-completion";
import { PreferenceAction } from "../settings/sections/preference-command";
import { SearchResultRow } from "./SearchResultRow";
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
  HistoryEntry,
  Routine,
  Run,
  SavedProgram,
  SavedResult,
} from "@aux/contracts";
import { normalizeCommandRankingQuery } from "@aux/contracts/command-ranking-query";
import { isHomeAddress, toUrl } from "../chrome";
import { AskCircuitBreaker, detectIntent, intentLabel, type Intent } from "../intent";
import { engineList, parseSuggestResponse, suggestEndpoint } from "../engines";
import { isPrivateAddress } from "../suggest";
import { useStore, call, errToast } from "../store";
import { hostOf, tabLabel } from "../workspace";

import { FavIcon } from "./SiteTile";
import { shellIconAgent, shellIconAgentSm, shellIconAlert, shellIconCommand, shellIconGlobe, shellIconLock, shellIconOpen, shellIconSearch, shellIconSearchLg, shellIconSend } from "./icons";
import { bridge, type BrowserExtension } from "../bridge";
import { recentConversations } from "../conversations";
import { rememberSiteControlsOpener } from "../site-controls-opener";
import { useShortcutLabels, withShortcut } from "../use-shortcut-label";
import { inNativeHost, inMock, type AutocompleteMatch } from "../bridge";
import { auxShellPathFromUrl } from "../settings/routes";
import { commandCandidateKey, mergeCommandResults } from "../command-results";
import type { ProviderSuggestion, Suggestion } from "./command-provider-types";
import { commandTabRows } from "./command-tab-rows";
import { featureStage } from "../use-feature";
import { openCommandSurface, type CommandSurfaceMode } from "../command-surface-state";
import "./CommandBar.css";
import {
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../ui/native-attribute-props";
import { nativeGroupRoleProps, nativeAlertRoleProps } from "../ui/native-attribute-props";
const askBreaker = new AskCircuitBreaker();
let pendingAsk: Promise<Run | null> | null = null;

const HomeAsk = lazy(() => import("./HomeAsk"));
const CommandRankingDebug = lazy(() => import("./CommandRankingDebug"));

const EMPTY_HISTORY: HistoryEntry[] = [];
const EMPTY_BROWSER: AutocompleteMatch[] = [];
const PROVIDER_SCOPES = [
  "all",
  "tabs",
  "closed",
  "bookmarks",
  "history",
  "extensions",
  "sites",
  "work",
] as const;
type ProviderScope = (typeof PROVIDER_SCOPES)[number];

/**
 * One field, three jobs: URL bar, search, and agent prompt. Intent is
 * detected as you type and shown as a chip; ↵ runs it, ⌘↵ opens a new tab /
 * new task, ⇥ flips a task between "this page" and "new task".
 */
export function CommandBar({
  compact = false,
  hero = false,
  surfaceMode,
  seed,
  onClose,
  commandRows,
  providerRows,
  onQueryChange,
}: {
  compact?: boolean;
  hero?: boolean;
  surfaceMode?: CommandSurfaceMode;
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
      s.pages.map((p) => `${p.pageId}${p.title}${p.url}${p.favicon}${p.ownedByRuntime ? 1 : 0}`),
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
  const page = useStore((s) =>
    s.activePageId ? s.pages.find((p) => p.pageId === s.activePageId) : undefined,
  );
  const pageAddress = page?.navigationError?.url ?? page?.url ?? "";
  const hasPage = !!page?.showBlankDocument || !isHomeAddress(pageAddress);
  const searchEngine = settings.searchEngine as string | undefined;
  const searchEngines = useMemo(
    () =>
      engineList(settings.searchEngines as { keyword: string; name: string; template: string }[] | undefined),
    [settings.searchEngines],
  );

  const initialPrefix =
    surfaceMode === "command"
      ? "/"
      : seed && /^[@/>?]/.test(seed)
        ? (seed[0] as "@" | "/" | ">" | "?")
        : null;
  const [editing, setEditing] = useState(!!surfaceMode);
  const [submitting, setSubmitting] = useState(false);
  const [queryState, setQueryState] = useState({
    value: seed
      ? initialPrefix && seed.startsWith(initialPrefix)
        ? seed.slice(1)
        : seed
      : surfaceMode === "edit"
        ? pageAddress
        : "",
    generation: 0,
  });
  const val = queryState.value;
  const queryGeneration = queryState.generation;
  const setVal = useCallback((value: string) => {
    setQueryState(current => current.value === value ? current : {
      value,
      generation: current.generation + Number(current.value.trim() !== value.trim()),
    });
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
  const [sel, setSel] = useState(0);
  const [providerScope, setProviderScope] = useState<ProviderScope>(initialPrefix === "@" ? "tabs" : "all");
  const extensionEnabled = !bridge.privateMode && featureStage("extensions") === "on";
  const [extensionItems, setExtensionItems] = useState<BrowserExtension[]>([]);
  const [rankingOpen, setRankingOpen] = useState(false);
  const rankingOpenedAt = useRef(Date.now());
  const [rankingEntries, setRankingEntries] = useState<CommandRankingEntry[]>([]);
  const [rankingError, setRankingError] = useState<string | null>(null);
  const [providerBuilder, setProviderBuilder] = useState<
    typeof import("./CommandProviderRows").buildCommandProviderRows | null
  >(null);
  const [autocompleteRetry, setAutocompleteRetry] = useState(0);
  const [browserResult, setBrowserResult] = useState<{
    query: string;
    generation: number;
    items: AutocompleteMatch[];
    error: string | null;
  }>({ query: "", generation: 0, items: [], error: null });
  const homeCurrent = useHomeEntryOwner(hero);
  const entryModeRequest = useRef(0);
  const [entryMode, setEntryModeState] = useState<"search" | "ask">(() => {
    if (!hero || bridge.privateMode) return "search";
    if (settings.homeEntryMode === "ask" || settings.homeEntryMode === "search")
      return settings.homeEntryMode;
    try {
      const legacy = localStorage.getItem("aux.home.entry-mode.v1");
      return legacy === "search" || legacy === "ask" ? legacy : "ask";
    } catch {
      return "ask";
    }
  });
  useEffect(() => {
    if (!hero || bridge.privateMode) return;
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
      /* Optional legacy storage cannot block the fresh Ask entry. */
    }
  }, [hero, settings.dataDir, settings.homeEntryMode]);
  const setEntryMode = (next: "search" | "ask") => {
    const previous = entryMode;
    const request = ++entryModeRequest.current;
    setEntryModeState(next);
    return guardCommandCompletion(call("settings.set", { homeEntryMode: next })
      .then(value => {
        if (homeCurrent()) {
          try { localStorage.removeItem("aux.home.entry-mode.v1"); } catch { /* Optional legacy storage. */ }
        }
        return value;
      })
      .catch(error => {
        if (homeCurrent() && entryModeRequest.current === request) setEntryModeState(previous);
        throw error;
      }), homeCurrent);
  };
  const [scopeFlip, setScopeFlip] = useState(false);
  const [historyResult, setHistoryResult] = useState<{ query: string; items: HistoryEntry[] }>({
    query: "",
    items: [],
  });
  const [workResult, setWorkResult] = useState<{
    query: string;
    results: SavedResult[];
    skills: Routine[];
    chats: ConversationSummary[];
  }>({ query: "", results: [], skills: [], chats: [] });
  const inputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef(new Map<number, HTMLDivElement>());
  const listId = useId();
  const [popup, setPopup] = useState({ above: false, height: 420 });

  useLayoutEffect(() => {
    if (!editing) return;
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
  }, [editing]);

  useLayoutEffect(() => {
    if (!surfaceMode) return;
    inputRef.current?.focus();
    if (surfaceMode === "edit") inputRef.current?.select();
  }, [surfaceMode]);

  // ⌘L and friends land here
  useEffect(() => {
    if (!focusRequest) return;
    if (focusSlot !== slot) return;
    const el = inputRef.current;
    if (!el) return;
    let active = true;
    void bridge
      .focusShell()
      .then(() => {
        if (active) {
          el.focus();
          el.select();
        }
      })
      .catch(errToast);
    return () => {
      active = false;
    };
  }, [focusRequest, focusSlot, slot]);

  // A real tab change resets its draft; initial surface mounting preserves prefill.
  const previousActivePage = useRef(activePageId);
  useEffect(() => {
    const previous = previousActivePage.current;
    previousActivePage.current = activePageId;
    if (!editing || previous === activePageId) return;
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
    requestAnimationFrame(() => inputRef.current?.select());
  };
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
  const baseIntent: Intent =
    scopePrefix === "/"
      ? { kind: "command", query: raw.replace(/^\//, "") }
      : detectIntent((scopePrefix === ">" || scopePrefix === "?" ? scopePrefix : "") + raw, {
          hasPage,
          searchEngine,
          searchEngines,
          routing,
          askUnavailable: bridge.privateMode || askBreaker.unavailable(),
        });
  const intent: Intent = (() => {
    if (bridge.privateMode && baseIntent.kind === "run")
      return { kind: "search", query: raw, url: toUrl(raw, searchEngine) };
    if (hero && raw) {
      if (entryMode === "ask") return { kind: "run", goal: raw, scope: "new" };
      return baseIntent.kind === "navigate"
        ? baseIntent
        : { kind: "search", query: raw, url: toUrl(raw, searchEngine) };
    }
    if (routeFlip && raw && (baseIntent.kind === "run" || baseIntent.kind === "search"))
      return routeFlip === "search" || askBreaker.unavailable() || bridge.privateMode
        ? { kind: "search", query: raw, url: toUrl(raw, searchEngine) }
        : { kind: "run", goal: raw, scope: hasPage ? "page" : "new" };
    if (baseIntent.kind === "run" && scopeFlip)
      return { ...baseIntent, scope: baseIntent.scope === "page" ? "new" : "page" };
    return baseIntent;
  })();
  const typedSomething =
    !(hero && entryMode === "ask") &&
    editing &&
    (scopePrefix === "/" || scopePrefix === "@" || raw.length > 0) &&
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
        if (live) setRankingError(error instanceof Error ? error.message : String(error));
      });
    return () => {
      live = false;
    };
  }, [editing, providerBuilder]);

  useEffect(() => {
    if (!editing || bridge.privateMode) return;
    let live = true;
    void call("command.ranking.list", {})
      .then((entries) => {
        if (live) {
          setRankingEntries(entries);
          setRankingError(null);
        }
      })
      .catch((error) => {
        if (live) setRankingError(error instanceof Error ? error.message : String(error));
      });
    return () => {
      live = false;
    };
  }, [editing]);

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

  const autocompleteWindow = bridge.windowId;
  const autocompleteKind = bridge.windowKind;
  const autocompletePrivate = bridge.privateMode;
  useLayoutEffect(() => {
    if (!browserAutocomplete || !typedSomething || raw.length < 2) return;
    let live = true;
    const current = () => live && bridge.windowId === autocompleteWindow &&
      bridge.windowKind === autocompleteKind && bridge.privateMode === autocompletePrivate;
    void Promise.resolve()
      .then(() => current() ? bridge.autocomplete(raw) : EMPTY_BROWSER)
      .then((items) => {
        if (current()) setBrowserResult({ query: raw, generation: queryGeneration, items, error: null });
      })
      .catch((error) => {
        if (current())
          setBrowserResult({
            query: raw,
            generation: queryGeneration,
            items: [],
            error: error instanceof Error ? error.message : String(error),
          });
      });
    return () => {
      live = false;
    };
  }, [browserAutocomplete, typedSomething, raw, queryGeneration, intent.kind, autocompleteRetry, autocompleteWindow, autocompleteKind, autocompletePrivate]);
  const currentBrowserResult = browserResult.query === raw && browserResult.generation === queryGeneration;
  const browserMatches = currentBrowserResult ? browserResult.items : EMPTY_BROWSER;
  const browserError = currentBrowserResult ? browserResult.error : null;
  const retriedBrowserResult = useRef<typeof browserResult | null>(null);
  const retryAutocomplete = () => {
    if (retriedBrowserResult.current === browserResult || !editing || !browserError ||
      !currentBrowserResult || !browserAutocomplete || !typedSomething || raw.length < 2 ||
      bridge.windowId !== autocompleteWindow || bridge.windowKind !== autocompleteKind ||
      bridge.privateMode !== autocompletePrivate)
      throw new Error("Choose the current browser suggestions Retry control.");
    retriedBrowserResult.current = browserResult;
    setAutocompleteRetry((value) => value + 1);
  };

  // The local indexed query is cheap; dispatch it immediately and only display
  // a response that belongs to the exact text still in the field.
  useEffect(() => {
    let cancelled = false;
    if (browserAutocomplete || !typedSomething || raw.length < 2) {
      return;
    }
    void call("history.list", { query: raw, limit: 6 })
      .then((items) => {
        if (!cancelled) setHistoryResult({ query: raw, items });
      })
      .catch(() => {
        if (!cancelled) setHistoryResult({ query: raw, items: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [raw, typedSomething, intent.kind, browserAutocomplete]);
  const history = historyResult.query === raw ? historyResult.items : EMPTY_HISTORY;

  const [workStatus, setWorkStatus] = useState({ query: "", pending: 0, failed: false });
  const [workRetry, setWorkRetry] = useState(0);
  // Saved work joins after immediate local matches. Old responses never paint
  // a new query, and private browsing never queries the regular Profile.
  useEffect(() => {
    if (bridge.privateMode || !typedSomething || raw.length < 2 || raw.length > 300 || /^[/@]/.test(raw))
      return;
    let live = true;
    const timer = window.setTimeout(() => {
      const update = (patch: Partial<Omit<typeof workResult, "query">>) => {
        if (!live) return;
        setWorkResult((current) => ({
          ...(current.query === raw ? current : { query: raw, results: [], skills: [], chats: [] }),
          ...patch,
        }));
      };
      setWorkStatus({ query: raw, pending: 3, failed: false });
      const accept = <K extends keyof Omit<typeof workResult, "query">>(key: K, promise: Promise<(typeof workResult)[K]>) => {
        void promise.then(value => update({ [key]: value })).catch(() => {
          if (live) setWorkStatus(status => ({ ...status, failed: true }));
        }).finally(() => { if (live) setWorkStatus(status => ({ ...status, pending: status.pending - 1 })); });
      };
      accept("results", call("results.search", { query: raw, limit: 3 }));
      accept("skills", call("routines.list", { query: raw, limit: 3 }));
      accept("chats", call("conversations.list", { query: raw, limit: 5, archived: false }));
    }, 100);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [raw, typedSomething, workRetry]);
  const savedWork = workResult.query === raw ? workResult : null;

  // Remote suggestions — opt-in preference, never in private mode, and never
  // for probable private/intranet addresses or keyword-engine input.
  const [remoteResult, setRemoteResult] = useState<{ query: string; items: string[] }>({
    query: "",
    items: [],
  });
  const intentEngine = intent.kind === "search" ? (intent.engine ?? null) : null;
  useEffect(() => {
    let cancelled = false;
    const want =
      !browserAutocomplete &&
      !bridge.privateMode &&
      settings.searchSuggestions === true &&
      typedSomething &&
      intent.kind === "search" &&
      !intent.engine &&
      raw.length >= 3 &&
      !isPrivateAddress(raw);
    const endpoint = want ? suggestEndpoint(searchEngine) : null;
    if (!endpoint) return;
    const t = window.setTimeout(() => {
      void fetch(`${endpoint}${encodeURIComponent(raw)}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!cancelled && data) setRemoteResult({ query: raw, items: parseSuggestResponse(data) });
        })
        .catch(() => {});
    }, 160);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [
    raw,
    typedSomething,
    intent.kind,
    intentEngine,
    searchEngine,
    settings.searchSuggestions,
    browserAutocomplete,
  ]);

  // Inline host completion — only a bare hostname prefix earns ghost text;
  // ArrowRight/End accepts like every mainstream browser.
  const inlineCompletion = useMemo(() => {
    if (!typedSomething || intent.kind === "command" || /\s/.test(raw)) return null;
    const q = raw.toLowerCase();
    if (q.length < 2 || q.includes("/")) return null;
    const urls = [
      ...useStore
        .getState()
        .pages.filter((p) => !p.ownedByRuntime)
        .map((p) => p.url),
      ...bookmarks.map((b) => b.url),
      ...history.map((h) => h.url),
    ];
    let best: string | null = null;
    for (const url of urls) {
      const host = hostOf(url);
      if (!host.startsWith(q) || host.length <= q.length) continue;
      if (!best || host.length < best.length) best = host;
    }
    return best ? best.slice(q.length) : null;
  }, [typedSomething, intent.kind, raw, tabDigest, bookmarks, history]);

  const exec = useCallback(
    async (i: Intent, alt = false, typedPick = false) => {
      switch (i.kind) {
        case "navigate":
        case "search": {
          const url =
            i.kind === "search" && !i.engine && inNativeHost
              ? await bridge.resolveSearch!(i.query).catch(() => i.url)
              : i.url;
          if (i.kind === "navigate" && inNativeHost) {
            const shellPath = auxShellPathFromUrl(url);
            if (shellPath !== null) {
              if (window.location.pathname !== shellPath) window.history.pushState(null, "", shellPath);
              window.dispatchEvent(new PopStateEvent("popstate"));
              break;
            }
          }
          if (surfaceMode === "new-tab" && alt) {
            const ack = await bridge.tabCommand(
              { kind: "open", url, activate: false },
              useStore.getState().catalogVersion,
            );
            if (ack.status === "rejected" || !ack.pageId)
              throw new Error(ack.error?.message ?? "The tab could not be opened.");
          } else if (surfaceMode === "new-tab" || alt) {
            if (!(await newTab(url))) throw new Error("The tab could not be opened.");
          } else if (page) await useStore.getState().navigatePage(page.pageId, url);
          else if (!(await newTab(url))) throw new Error("The tab could not be opened.");
          if (typedPick && !bridge.privateMode) {
            const candidateKey = commandCandidateKey({ id: "typed", title: "", url, section: "browser" });
            if (candidateKey.length <= 300) {
              try {
                const entry = await call("command.ranking.record", {
                  query: normalizeCommandRankingQuery(i.kind === "search" ? i.query : i.display),
                  candidateKey,
                  source: "browser",
                  pickOrigin: "typed",
                });
                setRankingEntries((current) => [
                  entry,
                  ...current.filter((item) => item.candidateKey !== candidateKey),
                ]);
              } catch (error) {
                setRankingError(error instanceof Error ? error.message : String(error));
              }
            }
          }
          break;
        }
        case "run": {
          if (pendingAsk)
            throw new Error(
              "An Ask request is still awaiting acknowledgement. You can search while it finishes.",
            );
          let timer: ReturnType<typeof setTimeout> | undefined;
          try {
            if (useStore.getState().settings.modelConfigured === false)
              throw new Error("Ask is unavailable. Connect a model in Settings; your prompt is kept.");
            const request = hero
              ? startRun(i.goal, { scope: "new", chatId: crypto.randomUUID(), presentation: "conversation" })
              : startRun(i.goal, { scope: alt ? "new" : i.scope });
            pendingAsk = request;
            void request.then(
              () => {
                if (pendingAsk === request) pendingAsk = null;
              },
              () => {
                if (pendingAsk === request) pendingAsk = null;
              },
            );
            const acknowledged = await Promise.race([
              request,
              new Promise<never>((_, reject) => {
                timer = setTimeout(
                  () => reject(new Error("Ask did not acknowledge within five seconds")),
                  5000,
                );
              }),
            ]);
            if (!acknowledged) throw new Error("Ask is unavailable. Your prompt is kept.");
          } catch (error) {
            askBreaker.failed();
            setBreakerVersion((value) => value + 1);
            throw error;
          } finally {
            clearTimeout(timer);
          }
          break;
        }
        case "command":
          openCommandSurface({ mode: "command", seed: i.query });
          break;
        case "empty":
          if (surfaceMode === "new-tab") {
            if (alt) {
              const ack = await bridge.tabCommand(
                { kind: "open", url: "about:blank", activate: false },
                useStore.getState().catalogVersion,
              );
              if (ack.status === "rejected" || !ack.pageId)
                throw new Error(ack.error?.message ?? "The tab could not be opened.");
            } else if (!(await newTab("about:blank"))) throw new Error("The tab could not be opened.");
          }
          break;
      }
    },
    [page, newTab, startRun, hero, surfaceMode],
  );

  // The intent row tracks every keystroke; provider ranking follows a deferred
  // query so typing never waits on it. Candidate lists are built once per source
  // change so the ranker's folded-text cache survives across keystrokes.
  const tabCandidates = useMemo(() => {
    const layout = useStore.getState().layout;
    return useStore
      .getState()
      .pages.filter((p) => p.pageId !== activePageId && !p.ownedByRuntime)
      .map((p) => ({
        ...p,
        id: p.pageId,
        title: tabLabel(layout, p),
        pinned: Object.values(pins)
          .flat()
          .some((pin) => pin.pageId === p.pageId || (!pin.pageId && pin.url === p.url)),
      }));
  }, [tabDigest, activePageId, tabNames, pins]);
  const bookmarkCandidates = useMemo(
    () => bookmarks.map((b) => ({ ...b, id: `bookmark-${b.url}` })),
    [bookmarks],
  );
  const closedCandidates = useMemo(() => closedTabs.map((tab) => ({ ...tab, id: tab.pageId })), [closedTabs]);
  const historyCandidates = useMemo(
    () => history.map((entry) => ({ ...entry, id: `h-${entry.url}`, lastVisit: entry.visitedAt })),
    [history],
  );
  const extensionCandidates = useMemo(
    () => extensionItems.map((item) => ({ ...item, id: item.key, title: item.name })),
    [extensionItems],
  );
  const domainCandidates = useMemo(() => {
    const domains = new Map<string, { id: string; title: string; url: string; count: number }>();
    for (const item of [...tabCandidates, ...bookmarks, ...history]) {
      try {
        const url = new URL(item.url);
        if (!/^https?:$/.test(url.protocol)) continue;
        const prior = domains.get(url.origin);
        if (prior) prior.count += 1;
        else
          domains.set(url.origin, {
            id: `domain-${url.origin}`,
            title: url.hostname,
            url: url.origin,
            count: 1,
          });
      } catch {
        /* Non-web entries are not site suggestions. */
      }
    }
    return [...domains.values()].sort((a, b) => b.count - a.count).slice(0, 12);
  }, [tabCandidates, bookmarks, history]);
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
    if (!hero && !bridge.privateMode && intent.kind === "search") {
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
        section: match.type === "bookmark" ? "bookmarks" : match.type === "history" ? "history" : "browser",
        providerType: match.type,
        url: match.url,
        icon: match.type === "search" ? shellIconSearch : <FavIcon url={match.url} size="sm" />,
        title: match.title,
        detail: match.description || hostOf(match.url),
        run: () => exec({ kind: "navigate", url: match.url, display: match.title }),
      })),
    [browserMatches, exec],
  );
  const rankQuery = useDeferredValue(typedSomething ? raw.toLowerCase() : "");
  // Open tabs remain keyboard-ready while the optional providers load.
  const immediateTabs = useMemo(
    () => (rankQuery || scopePrefix === "@" ? commandTabRows(rankQuery, tabCandidates, activate) : []),
    [rankQuery, tabCandidates, activate, scopePrefix],
  );
  const rankedDetails = useMemo(() => {
    if (!rankQuery)
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
      remote: remoteResult,
      tabs: tabCandidates,
      domains: domainCandidates,
      bookmarks: bookmarkCandidates,
      closed: closedCandidates,
      history: historyCandidates,
      extensions: extensionCandidates,
      programs: programCandidates,
      runs: runCandidates,
      recentChats,
      savedWork,
      page,
      searchEngine,
      rankingEntries,
      rankingOpenedAt: rankingOpenedAt.current,
      exec,
      activate,
    });
  }, [
    rankQuery,
    providerBuilder,
    immediateTabs,
    scopePrefix,
    remoteResult,
    tabCandidates,
    domainCandidates,
    bookmarkCandidates,
    closedCandidates,
    historyCandidates,
    extensionCandidates,
    programCandidates,
    runCandidates,
    recentChats,
    savedWork,
    page,
    searchEngine,
    rankingEntries,
    exec,
    activate,
  ]);
  const rankedRows = useMemo(() => rankedDetails.map((item) => item.candidate), [rankedDetails]);
  const mergedRows = useMemo(() => {
    const sites = providerScope === "sites";
    const browser = browserRows.filter(
      (row) => providerScope === "all" || sites || row.section === providerScope,
    );
    const aux = (rankQuery === raw.toLowerCase() ? rankedRows : []).filter(
      (row) =>
        providerScope === "all" ||
        row.section === providerScope ||
        (sites && ["suggest", "domains", "bookmarks", "history"].includes(row.section)) ||
        (providerScope === "work" &&
          ["programs", "runs", "results", "skills", "chats", "tasks", "memory", "sets"].includes(row.section)),
    );
    return mergeCommandResults(browser, aux);
  }, [browserRows, rankedRows, rankQuery, raw, providerScope]);
  const suggestions = useMemo(() => {
    if (!typedSomething) return [];
    if (intent.kind === "command" && commandRows)
      return mergeCommandResults(commandRows(intent.query), [
        ...mergedRows.rows,
        ...(providerRows?.(raw) ?? []),
      ]).rows;
    const supplemental = (providerRows?.(raw) ?? []).filter(row => providerScope === "all" || row.section === providerScope
      || (providerScope === "work" && ["programs", "runs", "results", "skills", "chats", "tasks", "memory", "sets"].includes(row.section)));
    return mergeCommandResults(providerScope === "all" ? intentRows : [], [...mergedRows.rows, ...supplemental]).rows;
  }, [typedSomething, intentRows, mergedRows, providerScope, intent, commandRows, providerRows, raw]);

  // The native fixture reads only generations and a fixed source label. These
  // are committed with the actual visible rows, never input echo or old results.
  const resultSource = typedSomething && intent.kind === "command" && commandRows
    && suggestions.some(row => "commandId" in row && !!row.commandId) ? "registry"
    : typedSomething && browserAutocomplete && currentBrowserResult && !browserError
      && suggestions.some(row => row.section === "history") ? "history" : undefined;

  const runSuggestion = async (suggestion: Suggestion) => {
    await suggestion.run();
    if (bridge.privateMode || suggestion.section === "intent" || !raw) return;
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
      setRankingError(error instanceof Error ? error.message : String(error));
    }
  };
  const clearRanking = async () => {
    try {
      await call("command.ranking.clear", {});
      setRankingEntries([]);
      setRankingError(null);
    } catch (error) {
      setRankingError(error instanceof Error ? error.message : String(error));
    }
  };

  // Selection is identity-stable: a re-ordered list keeps the same row
  // highlighted instead of the same index pointing at a different action.
  const selId = useRef<string | null>(null);
  useEffect(() => {
    selId.current = null;
    setSel(0);
  }, [raw]);
  useEffect(() => {
    setSel((value) => {
      const keep = selId.current ? suggestions.findIndex((s) => s.id === selId.current) : -1;
      return keep >= 0 ? keep : Math.min(value, Math.max(0, suggestions.length - 1));
    });
  }, [suggestions]);
  useEffect(() => {
    selId.current = suggestions[sel]?.id ?? null;
  }, [sel, suggestions]);
  useEffect(() => {
    optionRefs.current.get(sel)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const switchEntryMode = (next: "search" | "ask") => {
    if (next === "ask") {
      if (val) useStore.getState().setAgentDraft(val);
      // Consume search text once; later mode switches resume the same durable draft.
      setVal("");
      setEditing(false);
    }
    const completion = setEntryMode(next);
    requestAnimationFrame(() => { if (homeCurrent()) inputRef.current?.focus(); });
    return completion;
  };

  const homeInputScope = useHomeEntryInput(inputRef, hero && entryMode === "search" && !bridge.privateMode, homeCurrent, () => switchEntryMode("ask"));

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
    if (hero && !bridge.privateMode && e.key === "Tab" && !e.shiftKey) {
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
    } else if (e.key === "Tab" && !e.shiftKey && (intent.kind === "run" || intent.kind === "search")) {
      e.preventDefault();
      const next = intent.kind === "run" ? "search" : "ask";
      setRouteFlip(next);
      setPreferSearchOffer(askBreaker.flipped(next));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = suggestions[sel];
      // ↵ on the intent row accepts a ghost-completed host, like Chrome.
      const completed =
        inlineCompletion && sel === 0 && e.currentTarget.selectionStart === val.length
          ? detectIntent(val + inlineCompletion, { hasPage, searchEngine, searchEngines })
          : intent;
      void submit(
        () =>
          chosen &&
          (chosen.section === "tabs" || intent.kind === "command" || providerScope !== "all" || sel > 0)
            ? runSuggestion(chosen)
            : exec(completed, e.metaKey, true),
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

  const secure =
    !page?.navigationError &&
    !page?.loading &&
    page?.viewStatus !== "crashed" &&
    pageAddress.startsWith("https://");
  const showIntent = typedSomething && intent.kind !== "empty";
  const title = page?.title || (hasPage ? hostOf(pageAddress) : "");
  const placeholder = hero && entryMode === "ask" ? "Ask Aux a task…" : "Search or type a URL";

  if (hero && entryMode === "ask" && !bridge.privateMode)
    return (
      <Suspense
        fallback={
          <output className="home-ask-loading" data-block>
            Opening composer…
          </output>
        }
      >
        <HomeAsk onSearch={() => switchEntryMode("search")} current={homeCurrent} />
      </Suspense>
    );

  return (
    <div
      ref={barRef}
      data-command-query-generation={queryGeneration}
      onBlurCapture={onBlur}
      className={`cmdbar ${compact ? "compact" : ""} ${hero ? "hero" : ""} ${editing ? "editing" : ""} ${showIntent ? `intent-${intent.kind}` : ""}`}
    >
      <span className="cb-lead">
        {compact ? (
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
            <span className="cb-ico">{showIntent && intent.kind === "run" ? shellIconAgent : shellIconSearch}</span>
          )
        ) : page && hasPage && !hero ? (
          <span className="cb-ico">{shellIconGlobe}</span>
        ) : (
          <span className="cb-ico">{showIntent && intent.kind === "run" ? shellIconAgent : shellIconSearchLg}</span>
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
              compact ? (
                <span className="cb-title">{hostOf(pageAddress)}</span>
              ) : (
                <>
                  <span className="cb-title">{title}</span>
                  <span className="cb-host">{hostOf(pageAddress)}</span>
                </>
              )
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
            hero
              ? `${entryMode === "search" ? "Search or address" : "Ask Aux"}. Press Tab to switch mode.`
              : "Address, search, and agent prompt"
          }
          data-command-value-generation={queryGeneration}
          aria-expanded={suggestions.length > 0}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={suggestions.length > 0 ? listId : undefined}
          aria-activedescendant={suggestions[sel] ? `${listId}-opt-${sel}` : undefined}
          aria-busy={submitting || undefined}
          aria-keyshortcuts="Alt+1 Alt+2 Alt+3 Alt+4 Alt+5 Alt+6 Alt+7 Alt+8"
          placeholder={editing ? placeholder : ""}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          onFocus={onFocus}
          onChange={(e) => {
            setRouteFlip(null);
            if (!scopePrefix && /^[ @/>?]$/.test(e.target.value) && e.target.value !== " ") {
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
      {hero && bridge.privateMode ? (
        <span className="private-search-label">Private</span>
      ) : hero ? (
        <div className="home-mode">
          <span>
            <kbd>Tab</kbd> to switch
          </span>
          <div {...nativeGroupRoleProps} aria-label="Search or Ask">
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
                : exec(intent, false, true),
            );
          }}
        >
          {shellIconSend}
        </button>
      )}
      {scopePrefix && (
        <span className="cb-scope-pill">
          {scopePrefix === "@"
            ? "Tabs"
            : scopePrefix === "/"
              ? "Commands"
              : scopePrefix === ">"
                ? "Ask"
                : "Search"}
        </span>
      )}
      {(typedSomething || browserError) && (
        <div
          className="cb-pop"
          style={{
            maxHeight: popup.height,
            ...(popup.above ? { top: "auto", bottom: "calc(100% + 6px)" } : {}),
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {(askBreaker.unavailable() || preferSearchOffer || (workStatus.query === raw && (workStatus.pending > 0 || workStatus.failed))) && (
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
              {workStatus.query === raw && workStatus.pending > 0 && <output className="cb-suggestion-privacy">Searching saved work…</output>}
              {workStatus.query === raw && workStatus.failed && <output className="cb-suggestion-privacy">Some saved work couldn’t be searched. <button {...auxReserveSmallGhostButtonProps} onClick={() => setWorkRetry(value => value + 1)}>Retry</button></output>}
            </div>
          )}
          <div className="cb-provider-scopes" {...nativeGroupRoleProps} aria-label="Search providers">
            {PROVIDER_SCOPES.filter((scope) => scope !== "extensions" || extensionEnabled).map((scope) => (
              <button
                key={scope}
                {...auxNativeButtonTypeProps}
                aria-pressed={providerScope === scope}
                title={`Alt+${PROVIDER_SCOPES.indexOf(scope) + 1}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setProviderScope(scope);
                  setSel(0);
                  inputRef.current?.focus();
                }}
              >
                {scope === "all"
                  ? "All"
                  : scope === "tabs"
                    ? "Open Tabs"
                    : scope === "closed"
                      ? "Recently Closed"
                      : scope === "bookmarks"
                        ? "Bookmarks"
                        : scope === "history"
                          ? "History"
                          : scope === "extensions"
                            ? "Extensions"
                            : scope === "sites"
                              ? "Sites"
                              : "Work"}
              </button>
            ))}
            {!bridge.privateMode && (
              <button
                {...auxNativeButtonTypeProps}
                className="cb-ranking-toggle"
                aria-expanded={rankingOpen}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setRankingOpen((value) => !value)}
              >
                Ranking
              </button>
            )}
          </div>
          {settings.searchSuggestions === true && (
            <p className="cb-suggestion-privacy">
              Search suggestions may be sent to your configured search provider.
            </p>
          )}
          {browserError && (
            <div className="cb-provider-error" {...nativeAlertRoleProps}>
              Browser suggestions couldn’t load. You can still search.
              <PreferenceAction type="button" command="retry-browser-autocomplete" scopeId={listId} invoke={retryAutocomplete}>
                Try again
              </PreferenceAction>
            </div>
          )}
          {suggestions.length === 0 && (
            <p className="cb-empty">
              No {providerScope === "all" ? "results" : providerScope} matches. Choose another provider or
              edit the query.
            </p>
          )}
          <div role="listbox" id={listId} data-command-results-source={resultSource}
            data-command-results-generation={resultSource ? queryGeneration : undefined}>
            {suggestions.map((s, i) => {
              const first = i === 0 || suggestions[i - 1]!.section !== s.section;
              return (
                <div
                  key={s.id}
                  data-command-id={
                    intent.kind === "command" && "commandId" in s ? String(s.commandId) : undefined
                  }
                >
                  {first && s.section !== "intent" && <div className="cb-section">{SECTION[s.section]}</div>}
                  <SearchResultRow
                    id={`${listId}-opt-${i}`}
                    resultSource={resultSource && (resultSource === "registry" ? "commandId" in s : s.section === "history") ? resultSource : undefined}
                    resultGeneration={resultSource && (resultSource === "registry" ? "commandId" in s : s.section === "history") ? queryGeneration : undefined}
                    selected={i === sel}
                    className={`cb-opt ${s.section}`}
                    title={s.title}
                    detail={s.detail}
                    icon={s.icon}
                    query={raw}
                    elementRef={(node) => {
                      if (node) optionRefs.current.set(i, node);
                      else optionRefs.current.delete(i);
                    }}
                    onHover={() => sel !== i && setSel(i)}
                    onSelect={() => {
                      void submit(() => runSuggestion(s), "keepOpen" in s && s.keepOpen === true);
                    }}
                    trailing={
                      s.hint === "↵" ? (
                        <span className="cb-go" aria-hidden="true">
                          {shellIconSend}
                        </span>
                      ) : s.hint ? (
                        <kbd>{s.hint}</kbd>
                      ) : null
                    }
                  />
                </div>
              );
            })}
          </div>
          {rankingOpen && !bridge.privateMode && (
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
          )}
          <div className="cb-search-keys">
            <span>
              <kbd>Enter</kbd> choose
            </span>
            <span>
              <kbd>Esc</kbd> {providerScope === "all" ? "close" : "all results"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const SECTION: Record<Suggestion["section"], string> = {
  intent: "",
  browser: "Browser",
  suggest: "Suggestions",
  tabs: "Open tabs",
  domains: "Top sites",
  bookmarks: "Bookmarks",
  closed: "Recently Closed",
  history: "History",
  extensions: "Extensions",
  recent: "Recent",
  programs: "Saved programs",
  runs: "Conversations",
  results: "Saved results",
  skills: "Skills",
  chats: "Conversations",
  tasks: "Tasks",
  memory: "Saved notes",
  sets: "Sets",
};
