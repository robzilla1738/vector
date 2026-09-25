import { SearchResultRow } from "./SearchResultRow";
import { lazy, Suspense, useCallback, useDeferredValue, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { CommandRankingEntry, ConversationSummary, HistoryEntry, Routine, Run, SavedProgram, SavedResult } from "@aux/contracts";
import { normalizeCommandRankingQuery } from "@aux/contracts/command-ranking-query";
import { isHomeAddress, toUrl } from "../chrome";
import { detectIntent, intentLabel, type Intent } from "../intent";
import { engineList, parseSuggestResponse, suggestEndpoint } from "../engines";
import { isPrivateAddress } from "../suggest";
import { useStore, call, errToast } from "../store";
import { hostOf, tabLabel } from "../workspace";

import { FavIcon } from "./SiteTile";
import { I } from "./icons";
import { bridge } from "../bridge";
import { recentConversations } from "../conversations";
import { rememberSiteControlsOpener } from "../site-controls-opener";
import { useShortcutLabels, withShortcut } from "../use-shortcut-label";
import { hostKind, type AutocompleteMatch } from "../bridge";
import { commandCandidateKey, mergeCommandResults } from "../command-results";
import type { ProviderSuggestion, Suggestion } from "./command-provider-types";
import { commandTabRows } from "./command-tab-rows";
import "./CommandBar.css";

const HomeAsk = lazy(() => import("./HomeAsk"));
const CommandRankingDebug = lazy(() => import("./CommandRankingDebug"));

const EMPTY_HISTORY: HistoryEntry[] = [];
const EMPTY_BROWSER: AutocompleteMatch[] = [];

/**
 * One field, three jobs: URL bar, search, and agent prompt. Intent is
 * detected as you type and shown as a chip; ↵ runs it, ⌘↵ opens a new tab /
 * new task, ⇥ flips a task between "this page" and "new task".
 */
export function CommandBar({ compact = false, hero = false }: { compact?: boolean; hero?: boolean }) {
  const key = useShortcutLabels();
  const slot = hero ? "hero" : "toolbar";
  // Tab suggestions depend on identity/title/url/favicon — a digest of exactly
  // those fields keeps loading/audio churn from re-rendering the bar.
  const tabDigest = useStore(useShallow((s) => s.pages.map((p) => `${p.pageId}${p.title}${p.url}${p.favicon}${p.ownedByRuntime ? 1 : 0}`)));
  const activePageId = useStore((s) => s.activePageId);
  const tabNames = useStore(s => s.layout.tabNames);
  const settings = useStore((s) => s.settings);
  const runs = useStore((s) => s.runs);
  const programs = useStore((s) => s.programs);
  const bookmarks = useStore(s => s.bookmarks);
  const closedTabs = useStore(s => s.closedTabs);
  const focusRequest = useStore((s) => s.focusRequest);
  const focusSlot = useStore((s) => s.focusSlot);
  const startRun = useStore((s) => s.startRun);
  const activate = useStore((s) => s.activate);
  const newTab = useStore((s) => s.newTab);
  const setOverlay = useStore((s) => s.setOverlay);
  const agentDraft = useStore((s) => s.agentDraft);
  const page = useStore((s) => (s.activePageId ? s.pages.find((p) => p.pageId === s.activePageId) : undefined));
  const pageAddress = page?.navigationError?.url ?? page?.url ?? "";
  const hasPage = !!page?.showBlankDocument || (!isHomeAddress(pageAddress));
  const searchEngine = settings.searchEngine as string | undefined;
  const searchEngines = useMemo(() => engineList(settings.searchEngines as { keyword: string; name: string; template: string }[] | undefined), [settings.searchEngines]);

  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [val, setVal] = useState("");
  const [sel, setSel] = useState(0);
  const [providerScope, setProviderScope] = useState<"all" | "tabs" | "sites" | "work">("all");
  const [rankingOpen, setRankingOpen] = useState(false);
  const [rankingEntries, setRankingEntries] = useState<CommandRankingEntry[]>([]);
  const [rankingError, setRankingError] = useState<string | null>(null);
  const [providerBuilder, setProviderBuilder] = useState<typeof import("./CommandProviderRows").buildCommandProviderRows | null>(null);
  const [autocompleteRetry, setAutocompleteRetry] = useState(0);
  const [browserResult, setBrowserResult] = useState<{ query: string; items: AutocompleteMatch[]; error: string | null }>({ query: "", items: [], error: null });
  const [entryMode, setEntryModeState] = useState<"search" | "ask">(() => {
    if(!hero||bridge.privateMode)return "search";try{return localStorage.getItem("aux.home.entry-mode.v1")==="ask"?"ask":"search";}catch{return "search";}
  });
  const setEntryMode=(next:"search"|"ask")=>{setEntryModeState(next);if(!bridge.privateMode)try{localStorage.setItem("aux.home.entry-mode.v1",next);}catch{/* Mode remains available for this window. */}};
  const [scopeFlip, setScopeFlip] = useState(false);
  const [historyResult, setHistoryResult] = useState<{ query: string; items: HistoryEntry[] }>({ query: "", items: [] });
  const [workResult, setWorkResult] = useState<{ query: string; results: SavedResult[]; skills: Routine[]; chats: ConversationSummary[] }>(
    { query: "", results: [], skills: [], chats: [] });
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
      setPopup(prior => prior.above === flip && prior.height === height ? prior : { above: flip, height });
    };
    place();
    const resize = new ResizeObserver(place);
    if (barRef.current) resize.observe(barRef.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { resize.disconnect(); window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [editing]);

  // ⌘L and friends land here
  useEffect(() => {
    if (!focusRequest) return;
    if (focusSlot !== slot) return;
    const el = inputRef.current;
    if (!el) return;
    let active = true;
    void bridge.focusShell().then(() => { if (active) { el.focus(); el.select(); } }).catch(errToast);
    return () => { active = false; };
  }, [focusRequest, focusSlot, slot]);

  // switching tabs (or the first snapshot landing) resets any half-typed state
  useEffect(() => {
    if (!editing) return;
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
      setEditing(false);setVal("");setScopeFlip(false);
      inputRef.current?.blur();
    }
  }, [pageAddress, editing, val]);

  // a new tab starts empty; otherwise seed with the URL and select it
  const onFocus = () => {
    if (editing) return;
    setEditing(true);
    setProviderScope("all");
    const seed = hero&&entryMode==="ask"?agentDraft:hasPage ? pageAddress : "";
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
  const baseIntent = useMemo(() => detectIntent(raw, { hasPage, searchEngine, searchEngines }), [raw, hasPage, searchEngine, searchEngines]);
  const intent: Intent = useMemo(() => {
    if (bridge.privateMode && baseIntent.kind === "run") return { kind: "search", query: raw, url: toUrl(raw, searchEngine) };
    if (hero && raw) return entryMode === "ask" ? { kind: "run", goal: raw, scope: "new" } : { kind: "search", query: raw, url: toUrl(raw, searchEngine) };
    if (baseIntent.kind === "run" && scopeFlip) return { ...baseIntent, scope: baseIntent.scope === "page" ? "new" : "page" };
    return baseIntent;
  }, [baseIntent, scopeFlip, hero, raw, entryMode, searchEngine]);
  const typedSomething = !(hero && entryMode === "ask") && editing && raw.length > 0 && raw !== pageAddress;
  const browserAutocomplete = hostKind === "chromium" || hostKind === "mock";

  useEffect(() => {
    if (!editing || providerBuilder) return;
    let live = true;
    void import("./CommandProviderRows").then(module => {
      if (live) setProviderBuilder(() => module.buildCommandProviderRows);
    }).catch(error => { if (live) setRankingError(error instanceof Error ? error.message : String(error)); });
    return () => { live = false; };
  }, [editing, providerBuilder]);

  useEffect(() => {
    if (!editing || bridge.privateMode) return;
    let live = true;
    void call("command.ranking.list", {}).then(entries => {
      if (live) { setRankingEntries(entries); setRankingError(null); }
    }).catch(error => { if (live) setRankingError(error instanceof Error ? error.message : String(error)); });
    return () => { live = false; };
  }, [editing]);

  useEffect(() => {
    if (!browserAutocomplete || !typedSomething || raw.length < 2 || intent.kind === "command") return;
    let live = true;
    void bridge.autocomplete(raw)
      .then(items => { if (live) setBrowserResult({ query: raw, items, error: null }); })
      .catch(error => { if (live) setBrowserResult({ query: raw, items: [], error: error instanceof Error ? error.message : String(error) }); });
    return () => { live = false; };
  }, [browserAutocomplete, typedSomething, raw, intent.kind, autocompleteRetry]);
  const browserMatches = browserResult.query === raw ? browserResult.items : EMPTY_BROWSER;
  const browserError = browserResult.query === raw ? browserResult.error : null;

  // The local indexed query is cheap; dispatch it immediately and only display
  // a response that belongs to the exact text still in the field.
  useEffect(() => {
    let cancelled = false;
    if (browserAutocomplete || !typedSomething || raw.length < 2 || intent.kind === "command") {
      return;
    }
    void call("history.list", { query: raw, limit: 6 })
      .then(items => { if (!cancelled) setHistoryResult({ query: raw, items }); })
      .catch(() => { if (!cancelled) setHistoryResult({ query: raw, items: [] }); });
    return () => { cancelled = true; };
  }, [raw, typedSomething, intent.kind, browserAutocomplete]);
  const history = historyResult.query === raw ? historyResult.items : EMPTY_HISTORY;

  // Saved work joins after immediate local matches. Old responses never paint
  // a new query, and private browsing never queries the regular Profile.
  useEffect(() => {
    if (bridge.privateMode || !typedSomething || raw.length < 2 || raw.length > 300 || /^[/@]/.test(raw)) return;
    let live = true;
    const timer = window.setTimeout(() => {
      const update = (patch: Partial<Omit<typeof workResult, "query">>) => {
        if (!live) return;
        setWorkResult(current => ({ ...(current.query === raw ? current : { query: raw, results: [], skills: [], chats: [] }), ...patch }));
      };
      void call("results.search", { query: raw, limit: 3 }).then(results => update({ results })).catch(() => {});
      void call("routines.list", { query: raw, limit: 3 }).then(skills => update({ skills })).catch(() => {});
      void call("conversations.list", { query: raw, limit: 5, archived: false }).then(chats => update({ chats })).catch(() => {});
    }, 100);
    return () => { live = false; window.clearTimeout(timer); };
  }, [raw, typedSomething]);
  const savedWork = workResult.query === raw ? workResult : null;

  // Remote suggestions — opt-in preference, never in private mode, and never
  // for probable private/intranet addresses or keyword-engine input.
  const [remoteResult, setRemoteResult] = useState<{ query: string; items: string[] }>({ query: "", items: [] });
  const intentEngine = intent.kind === "search" ? intent.engine ?? null : null;
  useEffect(() => {
    let cancelled = false;
    const want = !browserAutocomplete && !bridge.privateMode && settings.searchSuggestions === true
      && typedSomething && intent.kind === "search" && !intent.engine
      && raw.length >= 3 && !isPrivateAddress(raw);
    const endpoint = want ? suggestEndpoint(searchEngine) : null;
    if (!endpoint) return;
    const t = window.setTimeout(() => {
      void fetch(`${endpoint}${encodeURIComponent(raw)}`)
        .then(response => (response.ok ? response.json() : null))
        .then(data => { if (!cancelled && data) setRemoteResult({ query: raw, items: parseSuggestResponse(data) }); })
        .catch(() => {});
    }, 160);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, [raw, typedSomething, intent.kind, intentEngine, searchEngine, settings.searchSuggestions, browserAutocomplete]);

  // Inline host completion — only a bare hostname prefix earns ghost text;
  // ArrowRight/End accepts like every mainstream browser.
  const inlineCompletion = useMemo(() => {
    if (!typedSomething || intent.kind === "command" || /\s/.test(raw)) return null;
    const q = raw.toLowerCase();
    if (q.length < 2 || q.includes("/")) return null;
    const urls = [
      ...useStore.getState().pages.filter(p => !p.ownedByRuntime).map(p => p.url),
      ...bookmarks.map(b => b.url),
      ...history.map(h => h.url),
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
    async (i: Intent, alt = false) => {
      switch (i.kind) {
        case "navigate":
        case "search": {
          const url = i.kind === "search" && !i.engine && hostKind === "chromium"
            ? await bridge.resolveSearch!(i.query) : i.url;
          if (!alt && page) await useStore.getState().navigatePage(page.pageId, url);
          else await newTab(url);
          break;
        }
        case "run":
          if (hero) await startRun(i.goal, { scope: "new", chatId: crypto.randomUUID(), presentation: "conversation" });
          else await startRun(i.goal, { scope: alt ? (i.scope === "page" ? "new" : "page") : i.scope });
          break;
        case "command":
          useStore.setState({ paletteSeed: `/${i.query}` });
          setOverlay("palette");
          break;
        default:
          break;
      }
    },
    [page, newTab, startRun, setOverlay, hero, activate],
  );

  // The intent row tracks every keystroke; provider ranking follows a deferred
  // query so typing never waits on it. Candidate lists are built once per source
  // change so the ranker's folded-text cache survives across keystrokes.
  const tabCandidates = useMemo(() => {
    const layout = useStore.getState().layout;
    return useStore.getState().pages.filter((p) => p.pageId !== activePageId && !p.ownedByRuntime)
      .map(p => ({ ...p, id: p.pageId, title: tabLabel(layout,p) }));
  }, [tabDigest, activePageId, tabNames]);
  const bookmarkCandidates = useMemo(() => bookmarks.map(b => ({ ...b, id: `bookmark-${b.url}` })), [bookmarks]);
  const closedCandidates = useMemo(() => closedTabs.map(tab => ({ ...tab, id: tab.pageId })), [closedTabs]);
  const historyCandidates = useMemo(() => history.map(entry => ({ ...entry, id: `h-${entry.url}`, lastVisit: entry.visitedAt })), [history]);
  const domainCandidates = useMemo(() => {
    const domains = new Map<string, { id: string; title: string; url: string; count: number }>();
    for (const item of [...tabCandidates, ...bookmarks, ...history]) {
      try {
        const url = new URL(item.url);
        if (!/^https?:$/.test(url.protocol)) continue;
        const prior = domains.get(url.origin);
        if (prior) prior.count += 1;
        else domains.set(url.origin, { id: `domain-${url.origin}`, title: url.hostname, url: url.origin, count: 1 });
      } catch { /* Non-web entries are not site suggestions. */ }
    }
    return [...domains.values()].sort((a, b) => b.count - a.count).slice(0, 12);
  }, [tabCandidates, bookmarks, history]);
  const programCandidates = useMemo(() => programs.map((pr: SavedProgram) => ({ ...pr, id: pr.programId, title: pr.name })), [programs]);
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
        icon: intent.kind === "run" ? I.agentSm : intent.kind === "navigate" ? I.open : intent.kind === "command" ? I.command : I.search,
        title:
          intent.kind === "navigate" ? intent.display : intent.kind === "search" ? `Search for “${intent.query}”` : intent.kind === "run" ? intent.goal : `Command: ${intent.query}`,
        detail: intent.kind === "run" ? (intent.scope === "page" ? `Ask on ${hostOf(page?.url ?? "")}` : "Start a new task in a fresh tab") : intent.kind === "navigate" ? "Open" : intent.kind === "search" ? "Web search" : "Open the command palette",
        hint: "↵",
        run: () => exec(intent),
      });
    }
    if (intent.kind === "command") return out;
    if (!hero && !bridge.privateMode && intent.kind === "search") {
      out.push({ id: "ask", section: "intent", icon: I.agentSm, title: `Ask Aux: ${raw}`,
        detail: hasPage ? `Use the current page · ${hostOf(page?.url ?? "")}` : "Start a conversation", hint: "Ask",
        run: () => exec({ kind: "run", goal: raw, scope: hasPage ? "page" : "new" }) });
    }
    return out;
  }, [typedSomething, raw, intent, hero, hasPage, page, exec]);
  const browserRows = useMemo<ProviderSuggestion[]>(() => browserMatches.map(match => ({
    id: `browser-${match.id}`,
    section: "browser",
    providerType: match.type,
    url: match.url,
    icon: match.type === "search" ? I.search : <FavIcon url={match.url} size="sm" />,
    title: match.title,
    detail: match.description || hostOf(match.url),
    run: () => exec({ kind: "navigate", url: match.url, display: match.title }),
  })), [browserMatches, exec]);
  const rankQuery = useDeferredValue(typedSomething && intent.kind !== "command" ? raw.toLowerCase() : "");
  // Open tabs remain keyboard-ready while the optional providers load.
  const immediateTabs = useMemo(() => rankQuery ? commandTabRows(rankQuery, tabCandidates, activate) : [], [rankQuery, tabCandidates, activate]);
  const rankedDetails = useMemo(() => {
    if (!rankQuery) return [];
    if (!providerBuilder) return immediateTabs.map(candidate => ({ candidate, key: commandCandidateKey(candidate), base: 0, adjustment: 0, score: 0 }));
    return providerBuilder({ query: rankQuery, remote: remoteResult, tabs: tabCandidates,
      domains: domainCandidates, bookmarks: bookmarkCandidates, closed: closedCandidates,
      history: historyCandidates, programs: programCandidates, runs: runCandidates,
      recentChats, savedWork, page, searchEngine, rankingEntries, exec, activate });
  }, [rankQuery, providerBuilder, immediateTabs, remoteResult, tabCandidates, domainCandidates,
    bookmarkCandidates, closedCandidates, historyCandidates, programCandidates,
    runCandidates, recentChats, savedWork, page, searchEngine, rankingEntries, exec, activate]);
  const rankedRows = useMemo(() => rankedDetails.map(item => item.candidate), [rankedDetails]);
  const mergedRows = useMemo(() => {
    const sites = providerScope === "sites";
    const browser = providerScope === "all" || sites ? browserRows : [];
    const aux = (rankQuery === raw.toLowerCase() ? rankedRows : []).filter(row =>
      providerScope === "all" || providerScope === "tabs" && row.section === "tabs"
      || sites && ["suggest", "domains", "bookmarks", "recent"].includes(row.section)
      || providerScope === "work" && ["programs", "runs", "results", "skills", "chats"].includes(row.section));
    return mergeCommandResults(browser, aux);
  }, [browserRows, rankedRows, rankQuery, raw, providerScope]);
  const suggestions = useMemo(() => {
    if (!typedSomething) return [];
    return providerScope === "all" ? mergeCommandResults(intentRows, mergedRows.rows).rows : mergedRows.rows;
  }, [typedSomething, intentRows, mergedRows, providerScope]);

  const runSuggestion = async (suggestion: Suggestion) => {
    await suggestion.run();
    if (bridge.privateMode || suggestion.section === "intent" || !raw) return;
    const query = normalizeCommandRankingQuery(raw);
    const candidateKey = commandCandidateKey(suggestion);
    try {
      const entry = await call("command.ranking.record", { query, candidateKey, source: suggestion.section });
      setRankingEntries(current => [entry, ...current.filter(item => item.query !== query || item.candidateKey !== candidateKey)]);
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
  useEffect(() => { selId.current = null; setSel(0); }, [raw]);
  useEffect(() => {
    setSel(value => {
      const keep = selId.current ? suggestions.findIndex(s => s.id === selId.current) : -1;
      return keep >= 0 ? keep : Math.min(value, Math.max(0, suggestions.length - 1));
    });
  }, [suggestions]);
  useEffect(() => { selId.current = suggestions[sel]?.id ?? null; }, [sel, suggestions]);
  useEffect(() => {
    optionRefs.current.get(sel)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const switchEntryMode=(next:"search"|"ask")=>{
    if(next==="ask"){
      if(val)useStore.getState().setAgentDraft(val);
      // Consume search text once; later mode switches resume the same durable draft.
      setVal("");
      setEditing(false);
    }
    setEntryMode(next);requestAnimationFrame(()=>inputRef.current?.focus());
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.altKey && /^[1-4]$/.test(e.key)) {
      e.preventDefault();
      setProviderScope((["all", "tabs", "sites", "work"] as const)[Number(e.key) - 1]!);
      setSel(0);
      return;
    }
    if (hero && !bridge.privateMode && e.key === "Tab" && !e.shiftKey) { e.preventDefault(); switchEntryMode(entryMode==="search"?"ask":"search"); return; }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      inputRef.current?.blur();
      return;
    }
    if ((e.key === "ArrowRight" || e.key === "End") && inlineCompletion && e.currentTarget.selectionStart === val.length && e.currentTarget.selectionEnd === val.length) {
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
    } else if (e.key === "Tab" && !e.shiftKey && intent.kind === "run") {
      e.preventDefault();
      setScopeFlip((v) => !v);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = suggestions[sel];
      // ↵ on the intent row accepts a ghost-completed host, like Chrome.
      const completed = inlineCompletion && sel === 0 && e.currentTarget.selectionStart === val.length
        ? detectIntent(val + inlineCompletion, { hasPage, searchEngine, searchEngines })
        : intent;
      void submit(() => chosen && (providerScope !== "all" || sel > 0) ? runSuggestion(chosen) : exec(completed, e.metaKey));
    }
  };

  const submit = async (work: () => unknown | Promise<unknown>) => {
    if (submitting) return;
    setSubmitting(true);
    try { await work(); inputRef.current?.blur(); }
    catch (error) { errToast(error); }
    finally { setSubmitting(false); }
  };

  const secure = !page?.navigationError && !page?.loading && page?.viewStatus !== "crashed" && pageAddress.startsWith("https://");
  const showIntent = typedSomething && intent.kind !== "empty";
  const title = page?.title || (hasPage ? hostOf(pageAddress) : "");
  const placeholder = hero && entryMode === "ask" ? "Ask Aux a task…" : "Search or type a URL";

  if (hero && entryMode === "ask" && !bridge.privateMode) return <Suspense fallback={<output className="home-ask-loading" data-block>Opening composer…</output>}><HomeAsk onSearch={() => switchEntryMode("search")}/></Suspense>;

  return (
    <div ref={barRef} onBlurCapture={onBlur} className={`cmdbar ${compact ? "compact" : ""} ${hero ? "hero" : ""} ${editing ? "editing" : ""} ${showIntent ? `intent-${intent.kind}` : ""}`}>
      <span className="cb-lead">
        {compact ? (
          hasPage && !editing ? <button type="button" className="cb-ico cb-site-trigger" title="Site controls" aria-label="Site controls" onMouseDown={event=>event.preventDefault()} onClick={event=>{rememberSiteControlsOpener(event.currentTarget);setOverlay("site");}}>{I.globe}</button> :
          <span className="cb-ico">{showIntent && intent.kind === "run" ? I.agent : I.search}</span>
        ) : page && hasPage && !hero ? (
          <span className="cb-ico">{I.globe}</span>
        ) : (
          <span className="cb-ico">{showIntent && intent.kind === "run" ? I.agent : I.searchLg}</span>
        )}
        {hasPage && !editing && !hero && !compact && <button type="button" className={`cb-lock ${secure ? "secure" : ""}`} title="Site controls" aria-label="Site controls" onMouseDown={event=>event.preventDefault()} onClick={event=>{rememberSiteControlsOpener(event.currentTarget);setOverlay("site");}}>{secure ? I.lock : I.alert}</button>}
      </span>
      <div className="cb-field">
        {!editing && (
          <span className="cb-display" aria-hidden onMouseDown={(e) => { e.preventDefault(); const input = inputRef.current; if (!input) return; input.focus(); void bridge.focusShell().then(() => input.focus()).catch(errToast); }}>
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
        {editing && inlineCompletion && <span className="cb-ghost" aria-hidden>{val}<span className="cb-ghost-tail">{inlineCompletion}</span></span>}
        <input
          ref={inputRef}
          className={editing ? "" : "ghost"}
          value={editing ? val : ""}
          role="combobox"
          aria-label={hero ? `${entryMode === "search" ? "Search or address" : "Ask Aux"}. Press Tab to switch mode.` : "Address, search, and agent prompt"}
          aria-expanded={suggestions.length > 0}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={suggestions.length > 0 ? listId : undefined}
          aria-activedescendant={suggestions[sel] ? `${listId}-opt-${sel}` : undefined}
          aria-busy={submitting || undefined}
          aria-keyshortcuts="Alt+1 Alt+2 Alt+3 Alt+4"
          placeholder={editing ? placeholder : ""}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          onFocus={onFocus}
          onChange={(e) => {setVal(e.target.value);if(hero&&entryMode==="ask")useStore.getState().setAgentDraft(e.target.value);}}
          onKeyDown={onKeyDown}
        />
      </div>
      {hero && bridge.privateMode ? <span className="private-search-label">Private</span> : hero ? <div className="home-mode"><span><kbd>Tab</kbd> to switch</span><div role="group" aria-label="Search or Ask">{(["search", "ask"] as const).map(m => <button key={m} aria-pressed={entryMode === m} onMouseDown={e => e.preventDefault()} onClick={() => switchEntryMode(m)}>{m === "search" ? "Search" : "Ask"}</button>)}</div></div> : showIntent ? (
        <button
          type="button"
          className={`cb-chip ${intent.kind}`}
          tabIndex={-1}
          title={intent.kind === "run" ? "⇥ switches between this page and a new task" : undefined}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => intent.kind === "run" && setScopeFlip((v) => !v)}
        >
          {intent.kind === "run" ? I.agentSm : intent.kind === "navigate" ? I.open : intent.kind === "search" ? I.search : I.command}
          {intentLabel(intent)}
          {intent.kind === "run" && <kbd>⇥</kbd>}
        </button>
      ) : (
        !editing && !compact && !hero && !bridge.privateMode && key("palette") && (
          <button type="button" className="cb-kbd" tabIndex={-1} title={withShortcut("Command palette", key("palette"))} aria-label="Open command palette" onMouseDown={(e) => e.preventDefault()} onClick={() => setOverlay("palette")}>
            {key("palette")}
          </button>
        )
      )}
      {hero && typedSomething && (
        <button
          type="button"
          className="cb-send"
          tabIndex={-1}
          title="Go (↵)"
          aria-label="Submit"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const chosen = suggestions[sel];
            void submit(() => chosen && (providerScope !== "all" || sel > 0) ? runSuggestion(chosen) : exec(intent));
          }}
        >
          {I.send}
        </button>
      )}
      {(typedSomething || browserError) && (
        <div className="cb-pop" style={{ maxHeight: popup.height, ...(popup.above ? { top: "auto", bottom: "calc(100% + 6px)" } : {}) }} onMouseDown={(e) => e.preventDefault()}>
          <div className="cb-provider-scopes" role="group" aria-label="Search providers">
            {(["all", "tabs", "sites", "work"] as const).map((scope, index) => <button key={scope} type="button" aria-pressed={providerScope === scope} title={`Alt+${index + 1}`} onMouseDown={event => event.preventDefault()} onClick={() => { setProviderScope(scope); setSel(0); inputRef.current?.focus(); }}>{scope === "all" ? "All" : scope === "tabs" ? "Tabs" : scope === "sites" ? "Sites" : "Work"}</button>)}
            {!bridge.privateMode && <button type="button" className="cb-ranking-toggle" aria-expanded={rankingOpen} onMouseDown={event => event.preventDefault()} onClick={() => setRankingOpen(value => !value)}>Ranking</button>}
          </div>
          {browserError && <div className="cb-provider-error" role="alert">Browser suggestions unavailable: {browserError}<button type="button" onClick={() => setAutocompleteRetry(value => value + 1)}>Try again</button></div>}
          {suggestions.length === 0 && <p className="cb-empty">No {providerScope === "all" ? "results" : providerScope} matches. Choose another provider or edit the query.</p>}
          <div role="listbox" id={listId}>
          {suggestions.map((s, i) => {
            const first = i === 0 || suggestions[i - 1]!.section !== s.section;
            return (
              <div key={s.id}>
                {first && s.section !== "intent" && <div className="cb-section">{SECTION[s.section]}</div>}
                <SearchResultRow id={`${listId}-opt-${i}`} selected={i === sel}
                  className={`cb-opt ${s.section}`} title={s.title} detail={s.detail} icon={s.icon} query={raw}
                  elementRef={node => { if (node) optionRefs.current.set(i, node); else optionRefs.current.delete(i); }}
                  onHover={() => sel !== i && setSel(i)} onSelect={() => { void submit(() => runSuggestion(s)); }}
                  trailing={s.hint === "↵" ? <span className="cb-go" aria-hidden="true">{I.send}</span> : s.hint ? <kbd>{s.hint}</kbd> : null}
                />
              </div>
            );
          })}
          </div>
          {rankingOpen && !bridge.privateMode && <Suspense fallback={<output className="cb-empty">Opening ranking details…</output>}><CommandRankingDebug
            rows={rankedDetails.filter(item => mergedRows.rows.some(row => row.id === item.candidate.id)).slice(0, 12).map(item => ({ id: item.candidate.id, title: item.candidate.title, source: item.candidate.section, base: item.base, adjustment: item.adjustment, score: item.score }))}
            duplicates={mergedRows.dropped} choices={rankingEntries.length} error={rankingError} onClear={() => void clearRanking()} /></Suspense>}
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
  recent: "Recent",
  programs: "Saved programs",
  runs: "Conversations",
  results: "Saved results",
  skills: "Skills",
  chats: "Conversations",
};
