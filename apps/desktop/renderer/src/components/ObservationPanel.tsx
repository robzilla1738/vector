import { memo, useMemo, useState } from "react";
import type { CompactObservation } from "@vector/contracts";
import { I } from "./icons";

interface ParsedObs {
  header: string[];
  sections: { name: string; lines: string[] }[];
}

/**
 * The runtime's compact rendering is `# title`, a url/viewport line, then
 * `## Section` blocks. We split on those so headings, form fields, and
 * interactive refs each get their own readable treatment.
 */
export function parseCompact(text: string): ParsedObs {
  const out: ParsedObs = { header: [], sections: [] };
  let cur: { name: string; lines: string[] } | null = null;
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    if (!line) continue;
    const h = /^##\s+(.*)$/.exec(line);
    if (h) {
      cur = { name: h[1]!.trim(), lines: [] };
      out.sections.push(cur);
      continue;
    }
    if (cur) cur.lines.push(line);
    else out.header.push(line.replace(/^#\s+/, ""));
  }
  return out;
}

const REF_LINE = /^(?:-\s*)?(r\d+)\s+(\w[\w-]*)\s*(?:[“"](.*?)[”"])?\s*(.*)$/;

function RefLine({ line }: { line: string }) {
  const m = REF_LINE.exec(line);
  if (!m) return <li className="obs-text">{line.replace(/^-\s*/, "")}</li>;
  const [, ref, role, name, rest] = m;
  return (
    <li className="obs-ref">
      <code className="ref">{ref}</code>
      <span className="role">{role}</span>
      {name && <span className="name">{name}</span>}
      {rest && <span className="state">{rest}</span>}
    </li>
  );
}

const ObsSection = memo(function ObsSection({ name, lines }: { name: string; lines: string[] }) {
  const [open, setOpen] = useState(true);
  const isRefs = /interactive|form|links|tables/i.test(name);
  const isHeadings = /heading/i.test(name);
  return (
    <section className={`obs-section ${open ? "open" : ""}`}>
      <button className="obs-section-head" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className={`chev ${open ? "open" : ""}`}>{I.right}</span>
        <span>{name}</span>
        <span className="count nums">{lines.length}</span>
      </button>
      {open && (
        <ul className={`obs-lines ${isRefs ? "refs" : ""} ${isHeadings ? "headings" : ""}`}>
          {lines.slice(0, 80).map((l, i) => (isRefs ? <RefLine key={i} line={l} /> : <li key={i} className="obs-text">{l.replace(/^-\s*/, "")}</li>))}
          {lines.length > 80 && <li className="obs-more">+{lines.length - 80} more</li>}
        </ul>
      )}
    </section>
  );
});

export const ObservationPanel = memo(
  function ObservationPanel({ obs, onCopy }: { obs: CompactObservation; onCopy?: () => void }) {
    const parsed = useMemo(() => parseCompact(obs.text), [obs.text]);
    return (
      <div className="obs-panel" data-testid="observation">
        <div className="obs-head">
          <span className="obs-title" title={obs.url}>{obs.title || obs.url}</span>
          <span className="obs-meta nums">rev {obs.revision} · {obs.refs.length} refs</span>
          {onCopy && <button className="icon-btn xs" title="Copy observation" aria-label="Copy observation" onClick={onCopy}>{I.copy}</button>}
        </div>
        {parsed.header.slice(1).map((l, i) => (
          <div key={i} className="obs-subtle nums">{l}</div>
        ))}
        {parsed.sections.map((s) => <ObsSection key={s.name} name={s.name} lines={s.lines} />)}
        {parsed.sections.length === 0 && <pre className="obs-raw">{obs.text}</pre>}
      </div>
    );
  },
  (a, b) => a.obs.pageId === b.obs.pageId && a.obs.revision === b.obs.revision && a.obs.text === b.obs.text,
);
