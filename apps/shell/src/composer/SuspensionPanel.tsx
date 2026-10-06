import { SuspensionPrompt } from "../features/permissions/SuspensionPrompt";
import { staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { errorMessage } from "../error-message";
import { useRef, useState } from "react";
import type { Run, Suspension } from "@aux/contracts";
import { call, useStore } from "../store";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

const TITLE: Record<Suspension["kind"], string> = {
  "ask-user-question": "Aux needs your answer",
  approval: "Approval needed",
  "action-confirmation": "Action confirmation needed",
  "touch-id": "Device confirmation needed",
  handoff: "Your turn in the browser",
};

/** Standalone run views share the same approval controller as the composer. */
export function SuspensionPanel({
  run,
  suspension,
  hydrated,
  question,
  readOnly = false,
}: {
  run: Run;
  suspension: Suspension | null;
  hydrated: boolean;
  question?: string;
  readOnly?: boolean;
}) {
  const draft = useStore((state) => state.runAnswerDrafts[run.runId]);
  const answerPending = useStore((state) => !!state.runAnswerPending[run.runId]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);
  const typed =
    suspension?.state === "pending" && suspension.runId === run.runId && suspension.turnId === run.runId
      ? suspension
      : null;
  const instruction =
    typed?.request.instruction ?? question ?? run.statusMessage ?? "Aux is waiting for your answer.";
  const kind = typed?.kind;
  const canAnswer = kind === "ask-user-question" || kind === "handoff";
  const text = draft?.question === instruction ? draft.text : "";
  const setText = (value: string) => useStore.getState().setRunAnswerDraft(run.runId, instruction, value);

  async function answer(value: string) {
    if (
      sending.current ||
      answerPending ||
      readOnly ||
      !hydrated ||
      run.status !== "needs_input" ||
      !canAnswer ||
      !value.trim()
    )
      return;
    sending.current = true;
    setBusy(true);
    setError("");
    try {
      // A queued event may have replaced the visible suspension. The runtime
      // compares this id atomically again before waking the parked run.
      const current = await call("runs.get", { runId: run.runId });
      if (
        current.run.status !== "needs_input" ||
        !typed ||
        current.suspension?.suspensionId !== typed.suspensionId ||
        current.suspension?.turnId !== typed.turnId ||
        current.suspension?.state !== "pending" ||
        current.suspension.kind !== typed.kind
      )
        throw new Error("This request changed. Review the latest question before sending.");
      await call("runs.answer", {
        runId: run.runId,
        answer: value.trim(),
        expectedSuspensionId: typed.suspensionId,
      });
      const state = useStore.getState();
      if (
        state.runAnswerDrafts[run.runId]?.question === instruction &&
        state.runAnswerDrafts[run.runId]?.text === value
      )
        state.setRunAnswerDraft(run.runId, instruction, "");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  if (typed && !readOnly && ["approval", "action-confirmation", "touch-id"].includes(typed.kind))
    return <SuspensionPrompt runId={run.runId} />;

  return (
    <section className="needs-input" aria-label="Run suspension" data-suspension-kind={kind ?? "unavailable"}>
      <header className="ni-head">
        <strong>{kind ? TITLE[kind] : "Waiting for your input"}</strong>
      </header>
      <p className="ni-q">{instruction}</p>
      {!typed && (
        <p {...staticHintProps}>
          {hydrated
            ? "The current request is unavailable. Refresh this run before continuing."
            : "Loading the current request…"}
        </p>
      )}
      {typed?.request.guidance && typed.request.guidance !== instruction && (
        <p {...staticHintProps}>{typed.request.guidance}</p>
      )}
      {(kind === "approval" || kind === "action-confirmation") && (
        <p {...staticHintProps}>Review the approval prompt. Aux will wait for your decision.</p>
      )}
      {kind === "handoff" && (
        <p {...staticHintProps}>Use the page, return control, then tell Aux when you’re done.</p>
      )}
      {canAnswer && (
        <div className="ni-row">
          {kind === "ask-user-question" && (
            <textarea
              rows={2}
              maxLength={20000}
              value={text}
              disabled={readOnly || answerPending || busy}
              placeholder="Type an answer…"
              aria-label="Your answer"
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing || event.keyCode === 229) return;
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void answer(text);
                }
              }}
            />
          )}
          <button
            className="btn primary sm"
            disabled={
              readOnly || !hydrated || answerPending || busy || (kind === "ask-user-question" && !text.trim())
            }
            onClick={() => void answer(kind === "handoff" ? "I finished the handoff; continue." : text)}
          >
            {busy || answerPending ? "Sending…" : kind === "handoff" ? "I’m done, continue" : "Send"}
          </button>
        </div>
      )}
      {error && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          {error} Your answer is kept.
        </p>
      )}
    </section>
  );
}
