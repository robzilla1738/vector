import { staticHintProps } from "../ui/class-props";
import { smallGhostButtonProps } from "../ui/button-props";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./ViewerFrame.css";
import { useStore } from "../store";
import { useConversationOwner } from "./ConversationControls";
import { useConversationAttachmentOwner } from "./ConversationAttachmentControls";
import { StructuredResultControl, StructuredResultRow } from "./StructuredResultControls";
import { csvPreview } from "../csv-preview";
import { staticMetadataKeyProps as auxClassMetadataKeyProps, staticMetadataValueProps as auxClassMetadataValueProps } from "../ui/class-props";

const admitted = () => true;
export function StructuredResult({
  content,
  mediaType,
  current: parentCurrent = admitted,
}: {
  content: string;
  mediaType: string;
  current?: () => boolean;
}) {
  const [raw, setRaw] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const rows = useRef(new Map<number, HTMLTableRowElement>());
  const connected = useStore((state) => state.connected),
    windowCurrent = useConversationOwner(null, connected);
  const source = useMemo(() => ({ content, mediaType }), [content, mediaType]);
  const displayed = useRef(source);
  const scopeCurrent = useCallback(() => windowCurrent() && parentCurrent(), [windowCurrent, parentCurrent]);
  const recordCurrent = useConversationAttachmentOwner(scopeCurrent, [source]);
  const current = useCallback(
    () => displayed.current === source && recordCurrent(source),
    [source, recordCurrent],
  );
  useEffect(() => {
    setSelected(null);
    setRaw(false);
    displayed.current = source;
  }, [content, mediaType, source]);
  const parsed = useMemo(() => {
    try {
      if (mediaType === "text/csv") return { csv: csvPreview(content) };
      if (mediaType === "application/json") return { json: JSON.stringify(JSON.parse(content), null, 2) };
      return {};
    } catch {
      return { error: true };
    }
  }, [content, mediaType]);
  const structured = !!parsed.csv || parsed.json !== undefined;
  return (
    <>
      {structured && (
        <div className="structured-result-tools">
          <StructuredResultControl
            command="toggle-saved-result-format"
            current={current}
            invoke={() => setRaw((value) => !value)}
            {...smallGhostButtonProps}
            aria-pressed={raw}
          >
            {raw ? "Show formatted" : "Show source"}
          </StructuredResultControl>
          {parsed.csv && (
            <span {...staticHintProps}>
              {parsed.csv.rowCount.toLocaleString()} rows · {parsed.csv.columnCount} columns
              {parsed.csv.rowCount > 201 || parsed.csv.columnCount > 40
                ? " · Preview limited to 201 rows and 40 columns"
                : ""}
            </span>
          )}
        </div>
      )}
      {parsed.error && (
        <p {...staticHintProps}>This file could not be formatted. Showing the saved source.</p>
      )}
      {!raw && parsed.csv && parsed.csv.rows.length ? (
        <div role="group" className="structured-result-table" aria-label="Saved CSV table">
          <table>
            <thead>
              <tr>
                {Array.from({ length: Math.min(parsed.csv.columnCount, 40) }, (_, i) => (
                  <th key={i} scope="col">
                    Column {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsed.csv.rows.map((row, i) => (
                <StructuredResultRow
                  key={i}
                  current={current}
                  originalRef={(node) => {
                    if (node) rows.current.set(i, node);
                    else rows.current.delete(i);
                  }}
                  tabIndex={selected === i || (selected === null && i === 0) ? 0 : -1}
                  aria-selected={selected === i}
                  aria-label={`Row ${i + 1}`}
                  invoke={(event) => {
                    if (
                      event instanceof KeyboardEvent &&
                      ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
                    ) {
                      const last = parsed.csv!.rows.length - 1;
                      const next =
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? last
                            : Math.max(0, Math.min(last, i + (event.key === "ArrowDown" ? 1 : -1)));
                      setSelected(next);
                      rows.current.get(next)?.focus();
                    } else setSelected(i);
                  }}
                >
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </StructuredResultRow>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <pre>{!raw && parsed.json !== undefined ? parsed.json : content || "Empty result"}</pre>
      )}
      {!raw && parsed.csv && selected !== null && parsed.csv.rows[selected] && (
        <section className="result-row-detail" aria-label={`Row ${selected + 1} details`}>
          <header>
            <strong>Row {selected + 1}</strong>
            <StructuredResultControl
              command="close-saved-result-row-details"
              current={current}
              invoke={() => {
                rows.current.get(selected)?.focus();
                setSelected(null);
              }}
              {...smallGhostButtonProps}
            >
              Close details
            </StructuredResultControl>
          </header>
          <div className="result-fields">
            {parsed.csv.rows[selected].map((cell, i) => (
              <div key={i} style={{ display: "contents" }}>
                <span {...auxClassMetadataKeyProps}>Column {i + 1}</span>
                <span {...auxClassMetadataValueProps}>{cell || "Empty"}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
