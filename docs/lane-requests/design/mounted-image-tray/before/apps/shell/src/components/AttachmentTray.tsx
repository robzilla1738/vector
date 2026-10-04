import type { ReactNode } from "react";
import { Checkbox } from "../ui";
import { shellIconClose, shellIconResult } from "./icons";
import "./AttachmentTray.css";

export type AttachmentItem = {
  key: string;
  name: string;
  kind: "document" | "image" | "result";
  included: boolean;
  detail?: string;
  icon?: ReactNode;
  onOpen(): void;
  onToggle(included: boolean): void;
  onRemove?(): void;
};

/** One context tray; records and mutations remain owned by the conversation. */
export function AttachmentTray({ items, disabled, busy }: { items: AttachmentItem[]; disabled: boolean; busy: boolean }) {
  if (!items.length && !busy) return null;
  return <div className="attachment-tray" role="group" aria-label="Attachments and results" aria-busy={busy}>
    {items.map(item => <div key={item.key} className={`attachment-chip${item.included ? "" : " excluded"}`}>
      <button type="button" className="attachment-open" title={`${item.name}${item.detail ? ` · ${item.detail}` : ""}`} onClick={item.onOpen}>
        <span className="attachment-icon" aria-hidden="true">{item.icon ?? shellIconResult}</span><span><strong>{item.name}</strong><small>{item.included ? item.detail || ({ document: "Document", image: "Image", result: "Saved result" }[item.kind]) : "Excluded from next reply"}</small></span>
      </button>
      <Checkbox aria-label={`Use ${item.name} in next reply`} title="Include in next reply" checked={item.included} disabled={disabled || busy} onChange={event => item.onToggle(event.target.checked)}/>
      {item.onRemove && <button type="button" className="icon-btn xs" aria-label={`Remove ${item.name}`} disabled={disabled || busy} onClick={item.onRemove}>{shellIconClose}</button>}
    </div>)}
    {busy && <output className="attachment-progress">Saving attachments…</output>}
  </div>;
}
