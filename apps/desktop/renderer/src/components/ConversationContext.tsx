import { useEffect, useState } from "react";
import type { ConversationContext as Context } from "@aux/contracts";
import { call, errToast } from "../store";

/** Mounted per chat so pending responses cannot replace another chat's context. */
export function ConversationContext({ chatId, revision, disabled, onBusy }: {
  chatId: string; revision: string; disabled: boolean; onBusy(value: boolean): void;
}) {
  const [context, setContext] = useState<Context | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let gone = false;
    void call("runs.context.get", { chatId }).then(value => {
      if (!gone) { setContext(value); setError(""); }
    }).catch(error => { if (!gone) setError(String(error)); });
    return () => { gone = true; };
  }, [chatId, revision]);
  useEffect(() => { onBusy(saving); return () => onBusy(false); }, [saving, onBusy]);
  const update = async (change: { historyEnabled?: boolean; runId?: string; included?: boolean }) => {
    if (saving || disabled) return;
    setSaving(true);
    try { setContext(await call("runs.context.set", { chatId, ...change })); }
    catch (error) { errToast(error); }
    finally { setSaving(false); }
  };
  return <div className="conversation-history-context">
    <button className="btn sm" aria-expanded={open} onClick={() => setOpen(value => !value)}>Context · {context?.entries.filter(entry => entry.included).length ?? 0}</button>
    {open && <section aria-label="Conversation context">
      {error && <p role="alert">Could not load conversation context. {error}</p>}
      {context && <>
        <label><input type="checkbox" checked={context.historyEnabled} disabled={disabled || saving} onChange={event => void update({ historyEnabled: event.target.checked })}/>Use previous turns</label>
        {context.entries.map(entry => <label key={entry.runId}><input type="checkbox" checked={entry.included} disabled={disabled || saving || !context.historyEnabled} onChange={event => void update({ runId: entry.runId, included: event.target.checked })}/><span>{entry.goal}</span></label>)}
      </>}
    </section>}
  </div>;
}
