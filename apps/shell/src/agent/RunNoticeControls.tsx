import { useEffect, useState } from "react";
import type { OwnerNotice } from "./run-notifications";
import { onInAppNoticePreferenceChange, readInAppNoticePreference, writeInAppNoticePreference } from "./run-notice-preference";
import "./RunNoticeControls.css";

export function RunNoticePreference() {
  const [preference, setPreference] = useState(readInAppNoticePreference);
  useEffect(() => onInAppNoticePreferenceChange(() => setPreference(readInAppNoticePreference())), []);
  return <button className="run-notice-preference btn sm ghost" aria-pressed={preference === "all"}
    onClick={() => { const next = preference === "all" ? "off" : "all"; writeInAppNoticePreference(next); setPreference(next); }}>
    In-app task notices {preference === "all" ? "on" : "off"}
  </button>;
}

/** Visible on return to Aux when OS notification delivery is unavailable. */
export function RunNoticeBanner({ notice, onReview, onDismiss }: {
  notice: OwnerNotice; onReview(runId: string): void; onDismiss(): void;
}) {
  return <aside className="run-notice-banner" aria-live="polite" aria-label="Task notice">
    <div><strong>{notice.title}</strong><p>{notice.body}</p></div>
    <div className="run-notice-actions">
      <button className="btn sm primary" onClick={() => onReview(notice.runId)}
        onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); onDismiss(); } }}>Review task</button>
      <button className="btn sm ghost" aria-label="Dismiss task notice" onClick={onDismiss}
        onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); onDismiss(); } }}>Dismiss</button>
    </div>
  </aside>;
}
