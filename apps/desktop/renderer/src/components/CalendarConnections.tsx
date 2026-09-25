import { useEffect, useRef, useState } from "react";
import type { CalendarConnection, CalendarEvent } from "@aux/contracts";
import { bridge } from "../bridge";
import { call } from "../store";

type ConnectionList = Awaited<ReturnType<typeof call<"calendar.connections.list">>>;
type EventPage = { events: CalendarEvent[]; nextPageToken?: string; fetchedAt: number };

function range() {
  const start = new Date();
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}

export function CalendarConnections() {
  const [list, setList] = useState<ConnectionList | null>(null);
  const [selected, setSelected] = useState("");
  const [page, setPage] = useState<EventPage | null>(null);
  const [pendingUntil, setPendingUntil] = useState(0);
  const pendingBaseline = useRef(new Map<string, number>());
  const eventRange = useRef(range());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = async () => {
    const next = await call("calendar.connections.list", {});
    setList(next);
    setSelected(current => next.connections.some(connection => connection.connectionId === current) ? current : next.connections[0]?.connectionId ?? "");
    return next;
  };
  useEffect(() => { void refresh().catch(reason => setError(String(reason))); }, []);
  useEffect(() => {
    if (!pendingUntil) return;
    const timer = window.setInterval(() => {
      if (Date.now() >= pendingUntil) {
        setPendingUntil(0);
        setMessage("Sign-in expired. Start again if you still want to connect Calendar.");
        return;
      }
      void refresh().then(next => {
        if (next.connections.some(connection => connection.updatedAt !== pendingBaseline.current.get(connection.connectionId))) {
          setPendingUntil(0);
          setMessage("Calendar connected.");
        }
      }).catch(reason => setError(String(reason)));
    }, 2000);
    return () => window.clearInterval(timer);
  }, [pendingUntil]);
  useEffect(() => { setPage(null); }, [selected]);

  const connect = async () => {
    setBusy(true); setError(""); setMessage("");
    try {
      const auth = await call("calendar.auth.start", {});
      await bridge.openExternal(auth.url);
      pendingBaseline.current = new Map(list?.connections.map(connection => [connection.connectionId, connection.updatedAt]) ?? []);
      setPendingUntil(auth.expiresAt);
      setMessage("Finish Google sign-in in the window that opened. Aux will update this list when it completes.");
    } catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  };
  const read = async (connection: CalendarConnection, pageToken?: string) => {
    setBusy(true); setError("");
    try {
      if (!pageToken) eventRange.current = range();
      const result = await call("calendar.events.list", { connectionId: connection.connectionId, ...eventRange.current, limit: 25, ...(pageToken ? { pageToken } : {}) });
      setPage(current => pageToken && current ? { ...result, events: [...current.events, ...result.events] } : result);
    } catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  };
  const disconnect = async (connection: CalendarConnection) => {
    setBusy(true); setError("");
    try {
      const result = await call("calendar.connections.revoke", { connectionId: connection.connectionId });
      setPage(null);
      await refresh();
      setMessage(result.providerRevocation === "confirmed" ? "Calendar disconnected and provider access revoked." : "Calendar disconnected in Aux. Provider revocation could not be confirmed; you can also remove Aux in your Google account permissions.");
    } catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  };

  const connection = list?.connections.find(item => item.connectionId === selected);
  return <section className="field" aria-label="Google Calendar connection">
    <div className="drawer-section">Google Calendar</div>
    <p className="hint">Connect a Google account for read-only event access. Aux keeps each account separate and stores its authorization in secure desktop storage. Browser cookies are never used.</p>
    {!list?.available && <output className="hint" data-block>{list?.reason ?? "Checking Calendar availability…"}</output>}
    <div className="row"><button className="btn sm" disabled={busy || !list?.available} onClick={() => void connect()}>Connect Google Calendar</button><button className="btn sm" disabled={busy} onClick={() => void refresh().catch(reason => setError(String(reason)))}>Refresh accounts</button></div>
    {!!list?.connections.length && <><label className="field">Calendar account<select aria-label="Calendar account" value={selected} onChange={event => setSelected(event.target.value)}>{list.connections.map(item => <option key={item.connectionId} value={item.connectionId}>{item.label} · {item.accountKey}{item.state === "needs_reauth" ? " · reconnect required" : ""}</option>)}</select></label>
      {connection && <><p className="hint">Source: {connection.accountKey} · {connection.state === "active" ? "Read-only calendar access" : "Reconnect required"}</p>
        <div className="row"><button className="btn sm" disabled={busy || connection.state !== "active"} onClick={() => void read(connection)}>Show next 7 days</button><button className="btn sm" disabled={busy} onClick={() => void disconnect(connection)}>Disconnect account</button></div>
        {page && <div className="field"><strong>Upcoming events</strong>{page.events.length ? page.events.map(event => <div className="field" key={`${event.source.connectionId}:${event.eventId}`}><strong>{event.title}</strong><span className="hint">{new Date(event.start).toLocaleString()} · {event.source.accountKey}</span></div>) : <p className="hint">No events in this range.</p>}{page.nextPageToken && <button className="btn sm" disabled={busy} onClick={() => void read(connection, page.nextPageToken)}>Load more</button>}</div>}</>}
    </>}
    {message && <output className="hint" data-block>{message}</output>}
    {error && <p className="hint err" role="alert">{error}</p>}
  </section>;
}
