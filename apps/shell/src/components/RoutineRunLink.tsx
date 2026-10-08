import { useRef, useState } from "react";
import type { RoutineRun } from "@aux/contracts";
import { call, useStore } from "../store";
import { errorMessage } from "../error-message";
import { smallButtonProps } from "../ui/button-props";
import { staticFieldErrorProps } from "../ui/class-props";
import { useConversationOwner } from "./ConversationControls";

export function RoutineRunLink({ run }: { run: RoutineRun }) {
  const connected = useStore((state) => state.connected);
  const current = useConversationOwner(`${run.routineRunId}:${run.runId}:${run.chatId}`, connected);
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!run.runId) return null;
  const open = async () => {
    if (!current() || pending.current || !run.runId) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const original = await call("runs.get", { runId: run.runId });
      if (!current()) return;
      const chatId = original.run.config?.chatId ?? original.run.runId;
      if (original.run.runId !== run.runId || (run.chatId && chatId !== run.chatId))
        throw new Error("This routine's original chat is unavailable.");
      useStore.getState().openConversationDraft(chatId);
    } catch (reason) {
      if (current()) setError(`The original chat could not be opened. ${errorMessage(reason)}`);
    } finally {
      pending.current = false;
      if (current()) setBusy(false);
    }
  };
  return (
    <>
      <button type="button" {...smallButtonProps} disabled={!connected || busy} onClick={() => void open()}>
        {busy ? "Opening…" : run.status === "waiting_input" ? "Respond" : "Open chat"}
      </button>
      {error && (
        <p role="alert" {...staticFieldErrorProps}>
          {error}
        </p>
      )}
    </>
  );
}
