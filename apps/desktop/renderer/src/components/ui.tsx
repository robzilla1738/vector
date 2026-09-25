import { useCallback, useId, useRef, useState, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { I } from "./icons";
import { NativeMenu } from "./NativeDialog";
import "./ui.css";

/** Aux materials: native chrome owns page blur; reading surfaces remain stable. */
export function Surface({ material = "panel", className = "", ...props }: HTMLAttributes<HTMLDivElement> & { material?: "panel" | "floating" | "inset" | "reading" }) {
  return <div {...props} className={`ui-surface ${className}`} data-material={material} />;
}

export function SettingsRow({ label, hint, children, compact = false }: { label: string; hint?: ReactNode; children: ReactNode; compact?: boolean }) {
  const id = useId();
  return <div className={`field ui-setting${compact ? " compact" : ""}`} data-setting={label} tabIndex={-1} role="group" aria-labelledby={`${id}-label`} aria-describedby={hint ? `${id}-hint` : undefined}>
    <span id={`${id}-label`} className="setting-label">{label}</span>
    <div className="ui-setting-control">{children}</div>
    {hint && <span id={`${id}-hint`} className="hint">{hint}</span>}
  </div>;
}

export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="ui-settings-group" aria-label={title}><h4>{title}</h4><div>{children}</div></section>;
}

export function SettingsDisclosure({ label, description, children }: { label: string; description: string; children: ReactNode }) {
  return <details className="ui-settings-disclosure" data-setting={label} tabIndex={-1}>
    <summary><span><strong>{label}</strong><small>{description}</small></span>{I.right}</summary>
    <div className="ui-settings-disclosure-body">{children}</div>
  </details>;
}

export function Switch(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "role">) {
  return <input {...props} type="checkbox" role="switch" className={`ui-switch ${props.className ?? ""}`} />;
}
export function Checkbox(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return <input {...props} type="checkbox" className={`ui-checkbox ${props.className ?? ""}`} />;
}
export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`ui-text-field ${props.className ?? ""}`} />;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`ui-select ${props.className ?? ""}`} />;
}

export type MenuAction = { label: string; icon?: ReactNode; onSelect(): void; disabled?: boolean; danger?: boolean; shortcut?: string };
export function ActionMenu({ label, actions, children = I.more }: { label: string; actions: MenuAction[]; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const openAtEnd = useRef(false);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  return <>
    <button ref={trigger} type="button" className="icon-btn ui-menu-trigger" aria-label={label} title={label} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => { openAtEnd.current = false; setOpen(value => !value); }} onKeyDown={event => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); openAtEnd.current = event.key === "ArrowUp"; setOpen(true); }
    }}>{children}</button>
    {open && <NativeMenu id={id} label={label} onClose={close} anchor={trigger} returnFocus={trigger} atEnd={openAtEnd.current} className="menu ctx-menu ui-action-menu">{actions.map(action => <button key={action.label} type="button" role="menuitem" className={`menu-item${action.danger ? " danger" : ""}`} disabled={action.disabled} onClick={() => { close(); action.onSelect(); }}>
      <span className="menu-ico">{action.icon}</span><span className="t">{action.label}</span>{action.shortcut && <kbd>{action.shortcut}</kbd>}
    </button>)}</NativeMenu>}
  </>;
}

export function ListRow({ title, description, leading, trailing, selected = false, disabled = false, onOpen }: { title: string; description?: ReactNode; leading?: ReactNode; trailing?: ReactNode; selected?: boolean; disabled?: boolean; onOpen(): void }) {
  return <div className={`ui-list-row${selected ? " selected" : ""}`}><button type="button" className="ui-list-open" disabled={disabled} onClick={onOpen} aria-current={selected ? "true" : undefined} title={title}>
    {leading && <span className="ui-list-icon">{leading}</span>}<span className="ui-list-copy"><strong>{title}</strong>{description && <small>{description}</small>}</span>
  </button>{trailing && <div className="ui-list-actions">{trailing}</div>}</div>;
}

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "active" | "success" | "warning" | "error" }) {
  return <span className="ui-status" data-tone={tone}><span aria-hidden="true" />{label}</span>;
}

export function EmptyState({ title, description, action, icon = I.folder }: { title: string; description?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return <div className="ui-empty"><span className="ui-empty-icon" aria-hidden="true">{icon}</span><strong>{title}</strong>{description && <p>{description}</p>}{action}</div>;
}

export function DetailPane({ title, metadata, actions, onClose, children, className = "" }: { title: string; metadata?: ReactNode; actions?: ReactNode; onClose?: () => void; children: ReactNode; className?: string }) {
  return <section className={`ui-detail-pane ${className}`} aria-label={title}><header><div><strong>{title}</strong>{metadata && <small>{metadata}</small>}</div><div className="ui-detail-actions">{actions}{onClose && <button type="button" className="icon-btn" aria-label={`Close ${title}`} onClick={onClose}>{I.close}</button>}</div></header><div className="ui-detail-content">{children}</div></section>;
}

export function ComposerFrame({ context, notices, children }: { context?: ReactNode; notices?: ReactNode; children: ReactNode }) {
  return <div className="composer-frame-wrap">{notices && <div className="composer-notices">{notices}</div>}<Surface material="inset" className="composer-frame">{context && <div className="composer-context">{context}</div>}{children}</Surface></div>;
}

/** Shared saved-work list anatomy; execution/revision authority stays with each owner. */
export function WorkRow({ title, summary, metadata, status, icon, disabled, onOpen, actions }: {
  title: string; summary: string; metadata: ReactNode; status: string; icon: ReactNode;
  disabled?: boolean; onOpen(): void; actions: MenuAction[];
}) {
  return <div className="ui-work-row"><ListRow title={title} leading={icon} disabled={disabled} onOpen={onOpen}
    description={<><span className="ui-work-summary">{summary}</span><span className="ui-work-meta">{metadata}</span></>}
    trailing={<><StatusBadge label={status} /><ActionMenu label={`Actions for ${title}`} actions={actions.map(action => ({ ...action, disabled: disabled || action.disabled }))} /></>} /></div>;
}
