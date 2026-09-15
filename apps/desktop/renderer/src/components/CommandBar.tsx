import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HistoryEntry, PageTarget, Run, SavedProgram } from "@vector/contracts";
import { detectIntent, intentLabel, type Intent } from "../intent";
import { isLive, useStore, call, errToast, toast } from "../store";
import { hostOf } from "../workspace";
import { EngineBadge } from "./EngineBadge";
import { FavIcon } from "./SiteTile";
import { I } from "./icons";

interface Suggestion {
  id: string;
  section: "intent" | "tabs" | "recent" | "programs" | "runs";
  icon: React.ReactNode;
  title: string;
  detail?: string;
  hint?: string;
  run: () => unknown | Promise<unknown>;
}

/**
 * One field, three jobs: URL bar, search, and agent prompt. Intent is
 * detected as you type and shown as a chip; ↵ runs it, ⌘↵ opens a new tab /
 * new task, ⇥ flips a task between "this page" and "new task".
 */
export function CommandBar({ compact = false, hero = false }: { compact?: boolean; hero?: boolean }) {
  const slot = hero ? "hero" : compact ? "sidebar" : "toolbar";
  const pages = useStore((s) => s.pages);
  const activePageId = useStore((s) => s.activePageId);
  const settings = useStore((s) => s.settings);
  const runs = useStore((s) => s.runs);
  const programs = useStore((s) => s.programs);
  const focusRequest = useStore((s) => s.focusRequest);
  const focusSlot = useStore((s) => s.focusSlot);
  const startRun = useStore((s) => s.startRun);
  const activate = useStore((s) => s.activate);
  const newTab = useStore((s) => s.newTab);
  const setOverlay = useStore((s) => s.setOverlay);
  const page = pages.find((p) => p.pageId === activePageId);
  const hasPage = !!page && !!page.url && page.url !== "about:blank";
  const searchEngine = settings.searchEngine as string | undefined;

  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");
  const [sel, setSel] = useState(0);
  const [scopeFlip, setScopeFlip] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ⌘L and friends land here
  useEffect(() => {
    if (!focusRequest) return;
    if (focusSlot !== slot) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
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

  // a new tab starts empty; otherwise seed with the URL and select it
  const onFocus = () => {
    setEditing(true);
    const seed = hasPage ? page!.url : "";
    setVal(seed);
    setSel(0);
    requestAnimationFrame(() => inputRef.current?.select());
  };
  const onBlur = () => {
    // let a click on a suggestion land before we tear the list down
    window.setTimeout(() => {
      if (document.activeElement !== inputRef.current) {
        setEditing(false);
        setVal("");
        setScopeFlip(false);
      }
    }, 0);
  };

  const raw = val.trim();
  const baseIntent = useMemo(() => detectIntent(raw, { hasPage, searchEngine }), [raw, hasPage, searchEngine]);
  const intent: Intent = useMemo(() => {
    if (baseIntent.kind === "run" && scopeFlip) return { ...baseIntent, scope: baseIntent.scope === "page" ? "new" : "page" };
    return baseIntent;
  }, [baseIntent, scopeFlip]);
  const typedSomething = editing && raw.length > 0 && raw !== (page?.url ?? "");

  // recent pages — debounced history query while typing
  useEffect(() => {
    if (!typedSomething || raw.length < 2 || intent.kind === "command") {
      setHistory([]);
      return;
    }
    const t = window.setTimeout(() => {
      void call<HistoryEntry[]>("history.list", { query: raw, limit: 6 })
        .then((h) => setHistory(h))
        .catch(() => setHistory([]));
    }, 120);
    return () => window.clearTimeout(t);
  }, [raw, typedSomething, intent.kind]);

  const exec = useCallback(
    async (i: Intent, alt = false) => {
      switch (i.kind) {
        case "navigate":
        case "search": {
          const url = i.url;
          if (!alt && page) await call("pages.navigate", { pageId: page.pageId, url });
          else await newTab(url);
          break;
        }
        case "run":
          await startRun(i.goal, { scope: alt ? (i.scope === "page" ? "new" : "page") : i.scope });
          break;
        case "command":
          setOverlay("palette");
          break;
        default:
          break;
      }
    },
    [page, newTab, startRun, setOverlay],
  );

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!typedSomething) return [];
    const out: Suggestion[] = [];
    const q = raw.toLowerCase();
    if (intent.kind !== "empty") {
      out.push({
        id: "intent",
        section: "intent",
        icon: intent.kind === "run" ? I.agentSm : intent.kind === "navigate" ? I.open : intent.kind === "command" ? I.command : I.search,
        title:
          intent.kind === "navigate" ? intent.display : intent.kind === "search" ? `Search for “${intent.query}”` : intent.kind === "run" ? intent.goal : `Command: ${intent.query}`,
        detail: intent.kind === "run" ? (intent.scope === "page" ? `Ask on ${hostOf(page?.url ?? "")}` : "Start a new task in a fresh tab") : intent.kind === "navigate" ? "Open" : intent.kind === "search" ? "Web search" : "Open the command palette",
        hint: "↵",
        run: () => exec(intent),
      });
    }
    if (intent.kind === "command") return out;
    for (const p of pages.filter((p) => p.pageId !== activePageId && !p.ownedByRuntime && (p.title.toLowerCase().includes(q) || p.url.toLowerCase().includes(q))).slice(0, 3)) {
      out.push({ id: `tab-${p.pageId}`, section: "tabs", icon: <FavIcon url={p.url} src={p.favicon} size="sm" />, title: p.title || hostOf(p.url), detail: hostOf(p.url), hint: "Switch", run: () => activate(p.pageId) });
    }
    for (const h of history.filter((h) => !pages.some((p) => p.url === h.url)).slice(0, 4)) {
      out.push({ id: `h-${h.url}`, section: "recent", icon: <FavIcon url={h.url} size="sm" />, title: h.title || hostOf(h.url), detail: hostOf(h.url), run: () => (page ? call("pages.navigate", { pageId: page.pageId, url: h.url }) : newTab(h.url)) });
    }
    for (const pr of programs.filter((pr: SavedProgram) => pr.name.toLowerCase().includes(q)).slice(0, 3)) {
      out.push({
        id: `prog-${pr.programId}`,
        section: "programs",
        icon: I.result,
        title: pr.name,
        detail: `Saved program · used ${pr.useCount}×`,
        hint: "Run",
        run: async () => {
          if (!page) return toast("Open a page first", "error");
          await call("programs.run", { programId: pr.programId, pageId: page.pageId });
          toast(`Running ${pr.name}`);
        },
      });
    }
    for (const r of runs.filter((r: Run) => !isLive(r) && r.goal.toLowerCase().includes(q) && r.goal.toLowerCase() !== q).slice(0, 3)) {
      out.push({ id: `run-${r.runId}`, section: "runs", icon: I.reloadSm, title: r.goal, detail: "Run again", run: () => startRun(r.goal) });
    }
    return out;
  }, [typedSomething, raw, intent, pages, activePageId, history, programs, runs, page, exec, activate, newTab, startRun]);

  useEffect(() => setSel(0), [raw]);
  useEffect(() => {
    listRef.current?.querySelectorAll<HTMLElement>("[role=option]")[sel]?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Tab" && intent.kind === "run") {
      e.preventDefault();
      setScopeFlip((v) => !v);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = suggestions[sel];
      const doIt = chosen && sel > 0 ? Promise.resolve(chosen.run()) : exec(intent, e.metaKey);
      void doIt.catch(errToast).finally(() => inputRef.current?.blur());
    }
  };

  const secure = page?.url.startsWith("https://");
  const showIntent = typedSomething && intent.kind !== "empty";
  const title = page?.title || (hasPage ? hostOf(page!.url) : "");
  const placeholder = hero ? "Search, ask, or go…" : compact ? "Search, address, or ask…" : "Search, enter an address, or ask the agent";

  return (
    <div className={`cmdbar ${compact ? "compact" : ""} ${hero ? "hero" : ""} ${editing ? "editing" : ""} ${showIntent ? `intent-${intent.kind}` : ""}`} role="combobox" aria-expanded={suggestions.length > 0} aria-haspopup="listbox" aria-owns="cmdbar-list">
      <span className="cb-lead">
        {compact ? (
          <span className="cb-ico">{showIntent && intent.kind === "run" ? I.agent : hasPage && !editing ? I.globe : I.search}</span>
        ) : page && hasPage && !hero ? (
          <EngineBadge page={page as PageTarget} compact />
        ) : (
          <span className="cb-ico">{showIntent && intent.kind === "run" ? I.agent : I.searchLg}</span>
        )}
        {hasPage && !editing && !hero && !compact && <span className={`cb-lock ${secure ? "secure" : ""}`} title={secure ? "Secure connection" : "Not secure"}>{secure ? I.lock : I.alert}</span>}
      </span>
      <div className="cb-field">
        {!editing && (
          <span className="cb-display" aria-hidden onMouseDown={(e) => { e.preventDefault(); inputRef.current?.focus(); }}>
            {hasPage && !hero ? (
              compact ? (
                <span className="cb-title">{hostOf(page!.url)}</span>
              ) : (
                <>
                  <span className="cb-title">{title}</span>
                  <span className="cb-host">{hostOf(page!.url)}</span>
                </>
              )
            ) : (
              <span className="cb-placeholder">{placeholder}</span>
            )}
          </span>
        )}
        <input
          ref={inputRef}
          className={editing ? "" : "ghost"}
          value={editing ? val : ""}
          aria-label="Address, search, and agent prompt"
          aria-autocomplete="list"
          aria-controls="cmdbar-list"
          aria-activedescendant={suggestions[sel] ? `cb-opt-${suggestions[sel]!.id}` : undefined}
          placeholder={editing ? placeholder : ""}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      {showIntent ? (
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
        !editing && !compact && !hero && (
          <button type="button" className="cb-kbd" tabIndex={-1} title="Command palette (⌘K)" aria-label="Open command palette" onMouseDown={(e) => e.preventDefault()} onClick={() => setOverlay("palette")}>
            ⌘K
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
            void (chosen && sel > 0 ? Promise.resolve(chosen.run()) : exec(intent)).catch(errToast).finally(() => inputRef.current?.blur());
          }}
        >
          {intent.kind === "run" ? I.send : I.enter}
        </button>
      )}
      {suggestions.length > 0 && (
        <div className="cb-pop pop-in" ref={listRef} role="listbox" id="cmdbar-list" onMouseDown={(e) => e.preventDefault()}>
          {suggestions.map((s, i) => {
            const first = i === 0 || suggestions[i - 1]!.section !== s.section;
            return (
              <div key={s.id}>
                {first && s.section !== "intent" && <div className="cb-section">{SECTION[s.section]}</div>}
                <div
                  id={`cb-opt-${s.id}`}
                  role="option"
                  aria-selected={i === sel}
                  className={`cb-opt ${i === sel ? "sel" : ""} ${s.section}`}
                  onMouseMove={() => sel !== i && setSel(i)}
                  onClick={() => {
                    void Promise.resolve(s.run()).catch(errToast);
                    inputRef.current?.blur();
                  }}
                >
                  <span className="cb-opt-ico">{s.icon}</span>
                  <span className="cb-opt-main">
                    <span className="cb-opt-title">{s.title}</span>
                    {s.detail && <span className="cb-opt-detail">{s.detail}</span>}
                  </span>
                  {s.hint && <kbd>{s.hint}</kbd>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const SECTION: Record<Suggestion["section"], string> = {
  intent: "",
  tabs: "Open tabs",
  recent: "Recent",
  programs: "Saved programs",
  runs: "Run again",
};
