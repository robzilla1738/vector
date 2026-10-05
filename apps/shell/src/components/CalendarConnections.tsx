import { staticFieldProps } from "../ui/class-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { useEffect, useRef, useState } from "react";
import type { CalendarConnection, CalendarEvent } from "@aux/contracts";
import { bridge } from "../bridge";
import { call } from "../store";
import { staticDrawerSectionProps as auxClassDrawerSectionProps, staticErrorHintProps as auxClassErrorHintProps } from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

type ConnectionList = Awaited<ReturnType<typeof call<"calendar.connections.list">>>;
type EventPage = { events: CalendarEvent[]; nextPageToken?: string; fetchedAt: number };
type AccountPage = { connectionId: string; value: EventPage };

function range() {
  const start = new Date();
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}

export function CalendarConnections() {
  const [list, setList] = useState<ConnectionList | null>(null);
  const [selected, setSelected] = useState("");
  const [page, setPage] = useState<AccountPage | null>(null);
  const selectedRef = useRef("");
  const readGeneration = useRef(0);
  const [pendingUntil, setPendingUntil] = useState(0);
  const pendingBaseline = useRef(new Map<string, number>());
  const eventRange = useRef(range());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = async () => {
    const next = await call("calendar.connections.list", {});
    setList(next);
    const chosen = next.connections.some(connection => connection.connectionId === selectedRef.current)
      ? selectedRef.current : next.connections[0]?.connectionId ?? "";
    if (chosen !== selectedRef.current) { selectedRef.current = chosen; readGeneration.current += 1; setPage(null); setBusy(false); }
    setSelected(chosen);
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
  const select = (connectionId: string) => {
    selectedRef.current = connectionId;
    readGeneration.current += 1;
    setSelected(connectionId);
    setPage(null);
    setBusy(false);
  };

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
    const generation = ++readGeneration.current;
    setBusy(true); setError("");
    try {
      if (!pageToken) eventRange.current = range();
      const result = await call("calendar.events.list", { connectionId: connection.connectionId, ...eventRange.current, limit: 25, ...(pageToken ? { pageToken } : {}) });
      if (selectedRef.current !== connection.connectionId || readGeneration.current !== generation) return;
      setPage(current => ({ connectionId: connection.connectionId,
        value: pageToken && current?.connectionId === connection.connectionId
          ? { ...result, events: [...current.value.events, ...result.events] } : result }));
    } catch (reason) {
      if (selectedRef.current === connection.connectionId && readGeneration.current === generation) setError(String(reason));
    } finally { if (readGeneration.current === generation) setBusy(false); }
  };
  const disconnect = async (connection: CalendarConnection) => {
    readGeneration.current += 1;
    setBusy(true); setError("");
    try {
      const result = await call("calendar.connections.revoke", { connectionId: connection.connectionId });
      setPage(null);
      await refresh();
      setMessage(result.providerRevocation === "confirmed" ? "Calendar disconnected and provider access revoked." : "Calendar disconnected in Aux. Token cleanup or provider revocation could not be confirmed; you can also remove Aux in your Google account permissions.");
    } catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  };

  const connection = list?.connections.find(item => item.connectionId === selected);
  return <section {...staticFieldProps} aria-label="Google Calendar connection">
    <div {...auxClassDrawerSectionProps}>Google Calendar</div>
    <p {...staticHintProps}>Connect a Google account for read-only event access. Aux keeps each account separate and stores its authorization in secure desktop storage. Browser cookies are never used.</p>
    {!list?.available && <output {...staticHintProps} data-block>{list?.reason ?? "Checking Calendar availability…"}</output>}
    <div {...staticRowProps}><button {...smallButtonProps} disabled={busy || !list?.available} onClick={() => void connect()}>Connect Google Calendar</button><button {...smallButtonProps} disabled={busy} onClick={() => void refresh().catch(reason => setError(String(reason)))}>Refresh accounts</button></div>
    {!!list?.connections.length && <><label {...staticFieldProps}>Calendar account<select aria-label="Calendar account" value={selected} onChange={event => select(event.target.value)}>{list.connections.map(item => <option key={item.connectionId} value={item.connectionId}>{item.label} · {item.accountKey}{item.state === "needs_reauth" ? " · reconnect required" : ""}</option>)}</select></label>
      {connection && <><p {...staticHintProps}>Source: {connection.accountKey} · {connection.state === "active" ? "Read-only calendar access" : "Reconnect required"}</p>
        <p {...staticHintProps}>Granted scope: Google Calendar read-only. Aux cannot edit or send invitations.</p>
        <div {...staticRowProps}><button {...smallButtonProps} disabled={busy || connection.state !== "active"} onClick={() => void read(connection)}>Show next 7 days</button><button {...smallButtonProps} disabled={busy} onClick={() => void disconnect(connection)}>Disconnect account</button></div>
        {page?.connectionId === connection.connectionId && <div {...staticFieldProps}><strong>Upcoming events</strong>{page.value.events.length ? page.value.events.map(event => <div className="field" key={`${event.source.connectionId}:${event.eventId}`}><strong>{event.title}</strong><span {...staticHintProps}>{new Date(event.start).toLocaleString()} · {event.source.accountKey}</span></div>) : <p {...staticHintProps}>No events in this range.</p>}{page.value.nextPageToken && <button {...smallButtonProps} disabled={busy} onClick={() => void read(connection, page.value.nextPageToken)}>Load more</button>}</div>}</>}
    </>}
    {message && <output {...staticHintProps} data-block>{message}</output>}
    {error && <p {...auxClassErrorHintProps} {...nativeAlertRoleProps}>{error}</p>}
  </section>;
}
