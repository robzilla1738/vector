import { staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState } from "react";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { hostOf } from "../workspace";
import { staticErrorHintProps as auxClassErrorHintProps } from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

type SavedTab = {
  pageId: string;
  url: string;
  title: string;
  windowId: string;
  error?: string;
  retrying: boolean;
};

/** Failed session entries remain durable until their original tab is restored. */
export function SessionRecovery({ compact = false }: { compact?: boolean }) {
  const connected = useStore((state) => state.connected);
  const restoring = useStore((state) => state.restoringTabs);
  const [tabs, setTabs] = useState<SavedTab[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [message, setMessage] = useState("");
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const stopped = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopped.current = true;
    };
  }, []);
  const pending = useRef(false);
  useEffect(() => {
    if (bridge.privateMode || !connected || restoring) return;
    let live = true,
      sequence = 0;
    const load = () => {
      const request = ++sequence;
      void call("browser.recovery.list")
        .then((items) => {
          if (live && request === sequence) {
            setTabs(items.filter((tab) => !!tab.error));
            setError("");
          }
        })
        .catch((reason) => {
          if (live && request === sequence && !compact) setError(String(reason));
        });
    };
    load();
    const unsubscribe = bridge.onEvent((event) => {
      if (event.type === "browser.recovery.changed") load();
    });
    return () => {
      live = false;
      unsubscribe();
    };
  }, [refresh, compact, connected, restoring]);
  async function retry(queue: SavedTab[]) {
    if (pending.current || !queue.length) return;
    pending.current = true;
    stopped.current = false;
    setError("");
    setMessage("");
    let restored = 0,
      failed = 0;
    for (let index = 0; index < queue.length; index++) {
      if (stopped.current) break;
      const tab = queue[index]!;
      setBusy(tab.pageId);
      setMessage(`Restoring ${index + 1} of ${queue.length}…`);
      setRowErrors((errors) => {
        const next = { ...errors };
        delete next[tab.pageId];
        return next;
      });
      try {
        const result = await call("browser.recovery.retry", { pageId: tab.pageId });
        if (!result.ok) throw new Error("This tab could not be restored. Its saved address has been kept.");
        restored++;
        if (mounted.current) setTabs((items) => items.filter((item) => item.pageId !== tab.pageId));
      } catch (reason) {
        failed++;
        if (mounted.current) setRowErrors((errors) => ({ ...errors, [tab.pageId]: errorMessage(reason) }));
      }
    }
    pending.current = false;
    if (!mounted.current) return;
    setBusy(null);
    const waiting = queue.length - restored - failed;
    setMessage(
      `${restored} ${restored === 1 ? "tab restored" : "tabs restored"}.${failed ? ` ${failed} couldn’t reopen.` : ""}${waiting ? ` ${waiting} not attempted.` : ""}`,
    );
    setRefresh((value) => value + 1);
  }
  if (bridge.privateMode || restoring || (!tabs.length && !error && !message)) return null;
  if (compact && !tabs.length) return null;
  if (compact)
    return (
      <button className="home-recovery" onClick={() => useStore.getState().setOverlay("history")}>
        {tabs.length} {tabs.length === 1 ? "tab couldn’t" : "tabs couldn’t"} reopen · Review saved tabs
      </button>
    );
  return (
    <section className="session-recovery" aria-label="Session recovery">
      {tabs.length > 0 && (
        <>
          <div className="session-recovery-heading">
            <strong>Saved tabs waiting to reopen</strong>
            {busy ? (
              <button
                {...smallGhostButtonProps}
                onClick={() => {
                  stopped.current = true;
                  setMessage("Stopping after the current tab…");
                }}
              >
                Stop
              </button>
            ) : (
              tabs.length > 1 && (
                <button
                  {...smallButtonProps}
                  disabled={!tabs.some((tab) => !tab.retrying)}
                  onClick={() => void retry(tabs.filter((tab) => !tab.retrying))}
                >
                  Retry all
                </button>
              )
            )}
          </div>
          <p {...staticHintProps}>
            Their addresses and places in your sidebar have been kept. Retry restores each tab in its original
            window.
          </p>
          <div className="session-recovery-list">
            {tabs.map((tab) => (
              <div className="session-recovery-row" key={tab.pageId}>
                <div>
                  <span>{tab.title || hostOf(tab.url) || "New tab"}</span>
                  <small title={tab.url}>{tab.url}</small>
                  {rowErrors[tab.pageId] ? (
                    <p {...auxClassErrorHintProps} {...nativeAlertRoleProps}>
                      {rowErrors[tab.pageId]}
                    </p>
                  ) : (
                    tab.error && (
                      <details>
                        <summary>Why it couldn’t reopen</summary>
                        <p {...staticHintProps}>{tab.error}</p>
                      </details>
                    )
                  )}
                </div>
                <button
                  {...smallButtonProps}
                  disabled={!!busy || tab.retrying}
                  onClick={() => void retry([tab])}
                >
                  {busy === tab.pageId || tab.retrying ? "Restoring…" : "Retry"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {message && (
        <output {...staticHintProps} data-block>
          {message}
        </output>
      )}
      {error && (
        <p {...auxClassErrorHintProps} {...nativeAlertRoleProps}>
          {error}{" "}
          <button
            {...smallGhostButtonProps}
            disabled={!!busy}
            onClick={() => {
              setError("");
              setRefresh((value) => value + 1);
            }}
          >
            Refresh
          </button>
        </p>
      )}
    </section>
  );
}
