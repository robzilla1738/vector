import { useEffect, useState } from "react";
import type { ConversationContext as Context } from "@aux/contracts";
import { Popover } from "../ui/popover";
import "./ContextPicker.css";
import { Checkbox } from "../ui";
import { shellIconLayersSm } from "./icons";
import { call, errToast } from "../store";

/** Mounted per chat so pending responses cannot replace another chat's context. */
export function ConversationContext({ chatId, revision, disabled, onBusy }: {
  chatId: string; revision: string; disabled: boolean; onBusy(value: boolean): void;
}) {
  const [context, setContext] = useState<Context | null>(null);
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
  if (!error && !context?.entries.length) return null;
  return <Popover label="Conversation context" trigger={<>{shellIconLayersSm}<span>Previous turns · {context?.entries.filter(entry => entry.included).length ?? 0}</span></>}>
    {() => <><header>Previous turns</header>{error && <p role="alert">Could not load conversation context. {error}</p>}
      {context && <><label className="context-choice"><Checkbox checked={context.historyEnabled} disabled={disabled || saving} onChange={event => void update({ historyEnabled: event.target.checked })}/><span>Use previous turns</span></label>
        <div className="context-picker-group">{context.entries.map(entry => <label className="context-choice" key={entry.runId}><Checkbox checked={entry.included} disabled={disabled || saving || !context.historyEnabled} onChange={event => void update({ runId: entry.runId, included: event.target.checked })}/><span title={entry.goal}>{entry.goal}</span></label>)}</div></>}
    </>}
  </Popover>;
}
