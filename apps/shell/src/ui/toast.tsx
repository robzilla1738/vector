import { useEffect, useState } from "react";
import { shellIconAlert, shellIconCheck, shellIconClose } from "../components/icons";
import "./toast.css";

const INFO_MS = 3000;

/** Action notices allow ten seconds; plain info allows three. Errors require dismissal. */
export function Toast({ id, text, kind, action, onDismiss }: { id: number; text: string; kind: "info" | "error"; action?: { label: string; run(): void; secondary?: { label: string; run(): void } }; onDismiss(id: number): void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const held = hovered || focused;
  useEffect(() => {
    if (kind === "error" || held) return;
    const timer = window.setTimeout(() => onDismiss(id), action ? 10_000 : INFO_MS);
    return () => window.clearTimeout(timer);
  }, [id, kind, action, held, onDismiss]);
  return <div className={`toast rise ${kind}`} role={kind === "error" ? "alert" : "status"}
    onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
    }}>
    {kind === "error" ? shellIconAlert : shellIconCheck}
    <span className="toast-text">{text}</span>
    {action && <button className="btn toast-action" onClick={action.run}>{action.label}</button>}
    {action?.secondary && <button className="btn toast-action" onClick={action.secondary.run}>{action.secondary.label}</button>}
    <button className="icon-btn xs toast-dismiss" aria-label="Dismiss notification" onClick={() => onDismiss(id)}>{shellIconClose}</button>
  </div>;
}
