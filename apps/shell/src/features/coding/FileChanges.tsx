import { useState } from "react";
import { errorMessage } from "../../error-message";
import type { SafetyAction } from "@aux/contracts";
const VISIBLE_LIMIT = 65536;
type Change = NonNullable<SafetyAction["reviewedChanges"]>[number];
type LoadChange = (
  path: string,
  full: boolean,
) => Promise<{ before: string | null; after: string | null; truncated: boolean }>;
export function FileChanges({ changes, load }: { changes: Change[]; load?: LoadChange }) {
  return (
    <div className="coding-file-changes">
      {changes.map((change) => (
        <FileChange key={change.path} change={change} load={load} />
      ))}
    </div>
  );
}
function FileChange({ change, load }: { change: Change; load?: LoadChange }) {
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState<Awaited<ReturnType<LoadChange>>>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function retrieve(full: boolean) {
    if (!load || busy) return;
    setBusy(true);
    try {
      setLoaded(await load(change.path, full));
      setError("");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }
  const kind = change.kind ?? (change.after === null ? "delete" : change.before === null ? "create" : "edit");
  const label = { create: "Create", edit: "Edit", delete: "Delete" }[kind];
  return (
    <details
      onToggle={(event) => {
        const open = event.currentTarget.open;
        setExpanded(open);
        if (open && load && !loaded && !change.binary) void retrieve(false);
      }}
    >
      <summary>
        {label} {change.path}
        {change.binary ? " · binary" : ""}
      </summary>
      {expanded && change.beforeMode !== change.afterMode && (
        <p>
          Permissions: {change.beforeMode?.toString(8) ?? "none"} → {change.afterMode?.toString(8) ?? "none"}
        </p>
      )}
      {expanded && error && <p role="alert">{error}</p>}
      {expanded && busy && <p>Loading file changes…</p>}
      {expanded && loaded?.truncated && (
        <button type="button" disabled={busy} onClick={() => void retrieve(true)}>
          Showing first 64 KiB · Load full file changes
        </button>
      )}
      {expanded &&
        (!load || loaded || change.binary) &&
        (change.binary ? (
          <p>Binary file contents are preserved in the journal.</p>
        ) : (
          <div className="coding-diff">
            <Content
              limit={!load}
              label="Before"
              content={loaded ? loaded.before : change.before}
              absent="File does not exist"
            />
            <Content
              limit={!load}
              label="After"
              content={loaded ? loaded.after : change.after}
              absent="File deleted"
            />
          </div>
        ))}
    </details>
  );
}
function Content({
  label,
  content,
  absent,
  limit,
}: {
  label: string;
  content: string | null;
  absent: string;
  limit: boolean;
}) {
  const [full, setFull] = useState(false);
  const truncated = limit && content !== null && content.length > VISIBLE_LIMIT && !full;
  return (
    <div>
      <pre aria-label={label}>
        {content === null ? absent : truncated ? content.slice(0, VISIBLE_LIMIT) : content}
      </pre>
      {truncated && (
        <button type="button" onClick={() => setFull(true)}>
          Showing first 64 KiB · Load full {label.toLowerCase()}
        </button>
      )}
    </div>
  );
}
