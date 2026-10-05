import { staticFieldProps } from "../ui/class-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { useEffect, useState } from "react";
import type { CalendarConnection, CalendarEvent, CalendarTaskGrant, Task } from "@aux/contracts";
import { call } from "../store";
import { staticGrowProps as auxClassGrowProps, staticErrorHintProps as auxClassErrorHintProps } from "../ui/deferred-class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

type EventPage = { events: CalendarEvent[]; nextPageToken?: string };

export function CalendarTaskGrants({ task, onOpenSettings }: { task: Task; onOpenSettings: () => void }) {
  const [available, setAvailable] = useState(false);
  const [accounts, setAccounts] = useState<CalendarConnection[]>([]);
  const [grants, setGrants] = useState<CalendarTaskGrant[]>([]);
  const [chosen, setChosen] = useState("");
  const [page, setPage] = useState<EventPage | null>(null);
  const [previewGrant, setPreviewGrant] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [range, setRange] = useState(() => ({ timeMin: new Date().toISOString(), timeMax: new Date(Date.now() + 7 * 86_400_000).toISOString() }));
  const selectable = available ? accounts.filter(account => account.state === "active" && !grants.some(grant => grant.connectionId === account.connectionId && grant.taskRevision === task.revision)) : [];
  const selectedAccount = selectable.some(account => account.connectionId === chosen) ? chosen : selectable[0]?.connectionId ?? "";

  const refresh = async () => {
    const [connections, taskGrants] = await Promise.all([
      call("calendar.connections.list", {}), call("calendar.taskGrants.list", { taskId: task.taskId }),
    ]);
    setAvailable(connections.available);
    setAccounts(connections.connections);
    setGrants(taskGrants);
    setChosen(current => connections.connections.some(account => account.connectionId === current && account.state === "active") ? current : connections.connections.find(account => account.state === "active")?.connectionId ?? "");
  };
  useEffect(() => {
    setPage(null); setPreviewGrant(""); setError(""); setMessage("");
    void refresh().catch(reason => setError(String(reason)));
  }, [task.taskId, task.revision]);

  const grant = async () => {
    if (!selectedAccount) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await call("calendar.taskGrants.create", { taskId: task.taskId, expectedRevision: task.revision, connectionId: selectedAccount });
      await refresh(); setMessage("Calendar account granted to this task revision.");
    } catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  };
  const revoke = async (grantId: string) => {
    setBusy(true); setError(""); setMessage("");
    try {
      await call("calendar.taskGrants.revoke", { taskId: task.taskId, grantId });
      setPage(null); setPreviewGrant(""); await refresh(); setMessage("Calendar grant revoked. Further reads through it are blocked.");
    } catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  };
  const preview = async (grantId: string, pageToken?: string) => {
    setBusy(true); setError("");
    try {
      const nextRange = pageToken ? range : { timeMin: new Date().toISOString(), timeMax: new Date(Date.now() + 7 * 86_400_000).toISOString() };
      if (!pageToken) setRange(nextRange);
      const result = await call("calendar.taskEvents.list", { taskId: task.taskId, grantId, ...nextRange, limit: 25, ...(pageToken ? { pageToken } : {}) });
      setPreviewGrant(grantId);
      setPage(current => pageToken && current ? { ...result, events: [...current.events, ...result.events] } : result);
    } catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  };

  return <section {...staticFieldProps} aria-label="Task Calendar access">
    <h4>Calendar access</h4>
    <p {...staticHintProps}>Grant one connected account to this saved task revision. When this task runs, Aux may send event details it reads to your chosen AI model. Scoped external agents can read the same granted events; neither receives provider tokens. Changing or archiving the task revokes its grants.</p>
    {!available && <p {...staticHintProps}>Calendar is unavailable in this desktop profile. Configure a Google OAuth desktop client to connect an account.</p>}
    {!accounts.length && <div {...staticRowProps}><span {...staticHintProps}>No Calendar accounts connected.</span><button {...smallButtonProps} onClick={onOpenSettings}>Open Connections</button></div>}
    {!!selectable.length && task.state === "open" && <div {...staticRowProps}><select {...auxClassGrowProps} aria-label="Grant Calendar account" value={selectedAccount} onChange={event => setChosen(event.target.value)}>{selectable.map(account => <option key={account.connectionId} value={account.connectionId}>{account.label} · {account.accountKey}</option>)}</select><button {...smallButtonProps} disabled={busy} onClick={() => void grant()}>Grant to task</button></div>}
    {grants.filter(grant => grant.taskRevision === task.revision).map(grant => <div className="field" key={grant.grantId}><div {...staticRowProps}><strong {...auxClassGrowProps}>{grant.label} · {grant.accountKey}</strong><button {...smallButtonProps} disabled={busy || task.state !== "open"} onClick={() => void preview(grant.grantId)}>Preview events</button><button {...smallButtonProps} disabled={busy} onClick={() => void revoke(grant.grantId)}>Revoke</button></div>
      {previewGrant === grant.grantId && page && <div {...staticFieldProps}><span {...staticHintProps}>Next 7 days · source {grant.accountKey}</span>{page.events.length ? page.events.map(event => <p key={event.eventId}><strong>{event.title}</strong> · {new Date(event.start).toLocaleString()}</p>) : <p {...staticHintProps}>No events in this range.</p>}{page.nextPageToken && <button {...smallButtonProps} disabled={busy} onClick={() => void preview(grant.grantId, page.nextPageToken)}>Load more</button>}</div>}</div>)}
    {message && <output {...staticHintProps} data-block>{message}</output>}
    {error && <p {...auxClassErrorHintProps} {...nativeAlertRoleProps}>{error}</p>}
  </section>;
}
