import { useRef, useState } from "react";
import type { Run, Suspension } from "@aux/contracts";
import { call, useStore } from "../store";

const TITLE: Record<Suspension["kind"], string> = {
  "ask-user-question": "Aux needs your answer",
  approval: "Approval needed",
  "action-confirmation": "Action confirmation needed",
  handoff: "Your turn in the browser",
};

/** Typed, durable interruption. Approval decisions stay in ActionConfirmation. */
export function SuspensionPanel({ run, suspension, hydrated, question, readOnly = false, answerInComposer = false }: {
  run: Run; suspension: Suspension | null; hydrated: boolean; question?: string; readOnly?: boolean; answerInComposer?: boolean;
}) {
  const draft = useStore((state) => state.runAnswerDrafts[run.runId]);
  const answerPending = useStore((state) => !!state.runAnswerPending[run.runId]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);
  const typed = suspension?.state === "pending" && suspension.runId === run.runId && suspension.turnId === run.runId
    ? suspension : null;
  const instruction = typed?.request.instruction ?? question ?? run.statusMessage ?? "Aux is waiting for your answer.";
  const kind = typed?.kind ?? "ask-user-question";
  const canAnswer = kind === "ask-user-question" || kind === "handoff";
  const text = draft?.question === instruction ? draft.text : "";
  const setText = (value: string) => useStore.getState().setRunAnswerDraft(run.runId, instruction, value);

  async function answer(value: string) {
    if (sending.current || answerPending || readOnly || !hydrated || run.status !== "needs_input" || !canAnswer || !value.trim()) return;
    sending.current = true;
    setBusy(true);
    setError("");
    try {
      // A queued event may have replaced the visible suspension. The runtime
      // compares this id atomically again before waking the parked run.
      const current = await call("runs.get", { runId: run.runId });
      if (current.run.status !== "needs_input" || current.suspension?.suspensionId !== typed?.suspensionId
        || (typed && current.suspension?.turnId !== typed.turnId))
        throw new Error("This request changed. Review the latest question before sending.");
      await call("runs.answer", { runId: run.runId, answer: value.trim(),
        ...(typed ? { expectedSuspensionId: typed.suspensionId } : {}) });
      const state = useStore.getState();
      if (state.runAnswerDrafts[run.runId]?.question === instruction && state.runAnswerDrafts[run.runId]?.text === value)
        state.setRunAnswerDraft(run.runId, instruction, "");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally { sending.current = false; setBusy(false); }
  }

  return <section className="needs-input" aria-label="Run suspension" data-suspension-kind={kind}>
    <header className="ni-head"><strong>{TITLE[kind]}</strong></header>
    <p className="ni-q">{instruction}</p>
    {!hydrated && <p className="hint">Loading the current request…</p>}
    {typed?.request.guidance && typed.request.guidance !== instruction && <p className="hint">{typed.request.guidance}</p>}
    {(kind === "approval" || kind === "action-confirmation") && <p className="hint">Review the approval prompt. Aux will wait for your decision.</p>}
    {kind === "handoff" && <p className="hint">Use the page, return control, then tell Aux when you’re done.</p>}
    {canAnswer && !answerInComposer && <div className="ni-row">
      {kind === "ask-user-question" && <textarea rows={2} maxLength={20000} value={text} disabled={readOnly || answerPending || busy}
        placeholder="Type an answer…" aria-label="Your answer" onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => { if (event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void answer(text); } }} />}
      <button className="btn primary sm" disabled={readOnly || !hydrated || answerPending || busy || (kind === "ask-user-question" && !text.trim())}
        onClick={() => void answer(kind === "handoff" ? "I finished the handoff; continue." : text)}>
        {busy || answerPending ? "Sending…" : kind === "handoff" ? "I’m done, continue" : "Send"}
      </button>
    </div>}
    {error && <p className="field-error" role="alert">{error} Your answer is kept.</p>}
  </section>;
}
