import type { PageTarget } from "@vector/contracts";
import { hostOf } from "../workspace";

/**
 * Stand-in for the native WebContentsView when the shell runs in a plain
 * browser (mock mode). A neutral document skeleton keyed off the URL so the
 * stage reads as a real page in screenshots — never shown inside Electron.
 */
export function MockPage({ page }: { page: PageTarget }) {
  const host = hostOf(page.url);
  const seed = [...host].reduce((a, c) => a + c.charCodeAt(0), 0);
  const cols = 3 + (seed % 3);
  const lines = Array.from({ length: 9 }, (_, i) => 40 + ((seed * (i + 3)) % 55));
  return (
    <div className="mock-page" aria-hidden>
      <div className="mp-nav">
        <span className="mp-logo" />
        <span className="mp-navtext" style={{ width: 72 }} />
        <span className="mp-navtext" style={{ width: 54 }} />
        <span className="mp-navtext" style={{ width: 88 }} />
        <span className="mp-sp" />
        <span className="mp-avatar" />
      </div>
      <div className="mp-body">
        <div className="mp-main">
          <div className="mp-crumb">{host}</div>
          <h1 className="mp-h1">{page.title.split(/\s[·|–—-]\s/)[0]?.trim() || host}</h1>
          <div className="mp-meta">
            <span style={{ width: 90 }} />
            <span style={{ width: 60 }} />
            <span style={{ width: 120 }} />
          </div>
          <div className="mp-hero" />
          {lines.map((w, i) => (
            <div key={i} className="mp-line" style={{ width: `${w}%` }} />
          ))}
          <div className="mp-cards" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols * 2 }, (_, i) => (
              <div key={i} className="mp-card">
                <div className="mp-card-img" />
                <div className="mp-line" style={{ width: "70%" }} />
                <div className="mp-line" style={{ width: "45%" }} />
              </div>
            ))}
          </div>
        </div>
        <aside className="mp-side">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="mp-line" style={{ width: `${60 + ((seed * i) % 35)}%` }} />
          ))}
          <div className="mp-btn" />
        </aside>
      </div>
    </div>
  );
}
