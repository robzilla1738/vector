import { useEffect, useState } from "react";
import type { HistoryEntry } from "@vector/contracts";
import { useStore, call } from "../store";
import { hostOf } from "../workspace";
import { SiteTile, TileFace } from "./SiteTile";
import { I } from "./icons";

const PROMPTS = [
  "Summarise the open review comments on this PR",
  "Find the cheapest plan with SSO across these pricing pages",
  "Fill in this form from my last order",
  "Collect every talk title on this schedule into a table",
];

/**
 * The front door of a new tab: a space-tinted greeting, the command bar
 * already focused above, pinned + recent sites, and a few prompts that show
 * what the agent can do — nothing that just points at another control.
 */
export function StartPage() {
  const layout = useStore((s) => s.layout);
  const bookmarks = useStore((s) => s.bookmarks);
  const programs = useStore((s) => s.programs);
  const runs = useStore((s) => s.runs);
  const newTab = useStore((s) => s.newTab);
  const startRun = useStore((s) => s.startRun);
  const focusCommandBar = useStore((s) => s.focusCommandBar);
  const activePageId = useStore((s) => s.activePageId);
  const [recent, setRecent] = useState<HistoryEntry[]>([]);
  const space = layout.spaces.find((s) => s.id === layout.activeSpaceId) ?? layout.spaces[0]!;
  const pins = layout.pins[space.id] ?? [];

  useEffect(() => {
    focusCommandBar();
    void call<HistoryEntry[]>("history.list", { limit: 40 })
      .then((h) => {
        const seen = new Set<string>();
        setRecent(h.filter((e) => /^https?:/.test(e.url) && !seen.has(hostOf(e.url)) && seen.add(hostOf(e.url))).slice(0, 8));
      })
      .catch(() => setRecent([]));
  }, [focusCommandBar]);

  const open = (url: string) => (activePageId ? call("pages.navigate", { pageId: activePageId, url }) : newTab(url));
  const sites = (pins.length ? pins : bookmarks.slice(0, 8)).map((b) => ({ url: b.url, title: b.title }));
  const lastRuns = runs.slice(0, 3);
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Late night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="start" data-space={space.color}>
      <div className="start-glow" aria-hidden />
      <div className="start-inner">
        <div className="start-head">
          <span className="start-space"><span className="space-dot" />{space.name}</span>
          <h1>{greeting}.</h1>
          <p>Type an address, search the web, or tell the agent what to do — all in the one field above.</p>
        </div>

        {sites.length > 0 && (
          <section className="start-section">
            <h2>{pins.length ? "Pinned" : "Favourites"}</h2>
            <div className="start-tiles">
              {sites.map((b) => (
                <SiteTile key={b.url} url={b.url} title={b.title || hostOf(b.url)} size="lg" label onClick={() => void open(b.url)} />
              ))}
            </div>
          </section>
        )}

        {recent.length > 0 && (
          <section className="start-section">
            <h2>Recent</h2>
            <div className="start-recent">
              {recent.map((h) => (
                <button key={h.url} className="start-recent-row" onClick={() => void open(h.url)} title={h.url}>
                  <TileFace url={h.url} size="sm" />
                  <span className="t">{h.title || hostOf(h.url)}</span>
                  <span className="h">{hostOf(h.url)}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="start-section">
          <h2>Try asking</h2>
          <div className="start-prompts">
            {PROMPTS.map((p) => (
              <button key={p} className="prompt-chip" onClick={() => void startRun(p, { scope: "page" })}>
                {I.sparklesSm}
                <span>{p}</span>
              </button>
            ))}
            {programs.slice(0, 2).map((pr) => (
              <button key={pr.programId} className="prompt-chip program" title={`Saved program · ${pr.siteKey}`} onClick={() => void startRun(pr.name)}>
                {I.result}
                <span>{pr.name}</span>
              </button>
            ))}
          </div>
        </section>

        {lastRuns.length > 0 && (
          <section className="start-section">
            <h2>Recent runs</h2>
            <div className="start-runs">
              {lastRuns.map((r) => (
                <button key={r.runId} className="start-run" onClick={() => useStore.getState().openRail({ kind: "run", runId: r.runId })}>
                  <span className={`st ${r.status}`}>{r.status.replace("_", " ")}</span>
                  <span className="t">{r.goal}</span>
                  {I.right}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
