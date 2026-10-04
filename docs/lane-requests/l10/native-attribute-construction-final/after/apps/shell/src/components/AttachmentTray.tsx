import type { ReactNode } from "react";
import { ConversationImageAction, ConversationImageChoice } from "./ConversationImageControl";
import { Checkbox } from "../ui";
import { shellIconClose, shellIconResult } from "./icons";
import "./AttachmentTray.css";
import {
  nativeAriaHiddenProps as auxNativeAriaHiddenProps,
} from "../ui/native-attribute-props";

export type AttachmentItem = {
  key: string;
  name: string;
  kind: "document" | "image" | "result";
  included: boolean;
  detail?: string;
  icon?: ReactNode;
  imageCurrent?(): boolean;
  openControl?(props: React.ButtonHTMLAttributes<HTMLButtonElement>, content: ReactNode, invoke: () => unknown): ReactNode;
  choiceControl?(props: React.InputHTMLAttributes<HTMLInputElement>, invoke: (included:boolean) => unknown): ReactNode;
  removeControl?(props: React.ButtonHTMLAttributes<HTMLButtonElement>, content: ReactNode, invoke: () => unknown): ReactNode;
  onOpen(): unknown;
  onToggle(included: boolean): unknown;
  onRemove?(): unknown;
};

/** One context tray; records and mutations remain owned by the conversation. */
export function AttachmentTray({ items, disabled, busy }: { items: AttachmentItem[]; disabled: boolean; busy: boolean }) {
  if (!items.length && !busy) return null;
  return <div className="attachment-tray" role="group" aria-label="Attachments and results" aria-busy={busy}>
    {items.map(item => <AttachmentChip key={item.key} item={item} disabled={disabled} busy={busy}/>)}
    {busy && <output className="attachment-progress">Saving attachments…</output>}
  </div>;
}
function AttachmentChip({item,disabled,busy}:{item:AttachmentItem;disabled:boolean;busy:boolean}) {
  const openProps = {type:"button" as const,className:"attachment-open",title:`${item.name}${item.detail ? ` · ${item.detail}` : ""}`};
  const content = <><span className="attachment-icon" {...auxNativeAriaHiddenProps}>{item.icon ?? shellIconResult}</span><span><strong>{item.name}</strong><small>{item.included ? item.detail || ({ document: "Document", image: "Image", result: "Saved result" }[item.kind]) : "Excluded from next reply"}</small></span></>;
  const removeProps = {type:"button" as const,className:"icon-btn xs","aria-label":`Remove ${item.name}`,disabled:disabled || busy};
  return <div key={item.key} className={`attachment-chip${item.included ? "" : " excluded"}`}>
      {item.imageCurrent ? <ConversationImageAction {...openProps} command="preview-conversation-image" current={item.imageCurrent} invoke={item.onOpen}>{content}</ConversationImageAction> : item.openControl ? item.openControl(openProps,content,item.onOpen) : <button {...openProps} onClick={item.onOpen}>{content}</button>}
      {item.imageCurrent ? <ConversationImageChoice className="ui-checkbox" aria-label={`Use ${item.name} in next reply`} title="Include in next reply" checked={item.included} disabled={disabled || busy} current={item.imageCurrent} invoke={item.onToggle}/> : item.choiceControl ? item.choiceControl({className:"ui-checkbox ","aria-label":`Use ${item.name} in next reply`,title:"Include in next reply",checked:item.included,disabled:disabled || busy},item.onToggle) : <Checkbox aria-label={`Use ${item.name} in next reply`} title="Include in next reply" checked={item.included} disabled={disabled || busy} onChange={event => item.onToggle(event.target.checked)}/>}
      {item.onRemove && (item.imageCurrent ? <ConversationImageAction {...removeProps} command="remove-conversation-image" current={item.imageCurrent} invoke={item.onRemove}>{shellIconClose}</ConversationImageAction> : item.removeControl ? item.removeControl(removeProps,shellIconClose,item.onRemove) : <button {...removeProps} onClick={item.onRemove}>{shellIconClose}</button>)}
    </div>;
}
