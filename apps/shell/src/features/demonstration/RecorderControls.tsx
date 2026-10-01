import { useStore } from "../../store";
import { executeCommand } from "../../commands";
import { useRecording } from "./state";
export function RecordButton() {
  const pageId = useStore(state => state.activePageId);
  const busy = useRecording(state => state.busy), demo = useRecording(state => state.demonstration);
  return <button className="btn sm" aria-label="Record a demonstration" disabled={!pageId || busy || !!demo && demo.state !== "stopped"}
    onClick={() => void executeCommand("record-demonstration", { payload: { pageId: pageId! } })}>Record</button>;
}
export function RecorderBanner() {
  const { demonstration: demo, busy, error } = useRecording();
  if (!demo || demo.state === "stopped") return null;
  return <section className="recording-banner" aria-label="Demonstration recording" aria-live="polite">
    <strong>{demo.state === "paused" ? "Paused" : "Recording"} — Aux sees your clicks and typing in this tab</strong>
    <span>{demo.steps.length} steps</span>
    <button className="btn sm" disabled={busy} onClick={() => void executeCommand(demo.state === "paused" ? "resume-demonstration" : "pause-demonstration")}>{demo.state === "paused" ? "Resume" : "Pause"}</button>
    <button className="btn sm" disabled={busy} onClick={() => void executeCommand("stop-demonstration")}>Stop</button>
    <button className="btn sm ghost" disabled={busy} onClick={() => void executeCommand("discard-demonstration")}>Discard</button>
    {error && <p role="alert">{error}</p>}
    <ol aria-label="Recorded steps">{demo.steps.map((step, index) => <li key={index}>{step.kind === "credentialFill" ? "Secure entry — value not recorded" : step.kind === "input" ? `Typed in ${step.label || "field"}` : step.kind}</li>)}</ol>
  </section>;
}
