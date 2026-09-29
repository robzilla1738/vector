import { useEffect, useState } from "react";
import { I } from "../components/icons";
import "./toast.css";

const INFO_MS = 3000;

/** Info notices expire after three seconds of unattended display; errors require dismissal. */
export function Toast({ id, text, kind, onDismiss }: { id: number; text: string; kind: "info" | "error"; onDismiss(id: number): void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const held = hovered || focused;
  useEffect(() => {
    if (kind === "error" || held) return;
    const timer = window.setTimeout(() => onDismiss(id), INFO_MS);
    return () => window.clearTimeout(timer);
  }, [id, kind, held, onDismiss]);
  return <div className={`toast rise ${kind}`} role={kind === "error" ? "alert" : "status"}
    onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
    }}>
    {kind === "error" ? I.alert : I.check}
    <span className="toast-text">{text}</span>
    <button className="icon-btn xs toast-dismiss" aria-label="Dismiss notification" onClick={() => onDismiss(id)}>{I.close}</button>
  </div>;
}
