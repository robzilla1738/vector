import { errorMessage } from "../error-message";
import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { PageTarget } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { navigationFailure } from "../navigation-failure";
import { guardCommandCompletion } from "../command-completion";
import { useScopedCommandControls } from "../scoped-command-controls";
import { shellIconAlert, shellIconGlobe } from "./icons";
type Owner = { active: boolean; pending: boolean; identity: object };
/** UI ownership only; the original native navigation/interstitial producer authorizes recovery. */
export function PageRecovery({ page }: { page: PageTarget }) {
  const windowId = bridge.windowId,
    privateMode = bridge.privateMode,
    kind = bridge.windowKind;
  const snapshot = JSON.stringify(page);
  const identity = useMemo(
    () => ([snapshot, windowId, privateMode, kind]),
    [snapshot, windowId, privateMode, kind],
  );
  const owner = useRef<Owner>({ active: false, pending: false, identity });
  useLayoutEffect(() => {
    const original = { active: true, pending: false, identity };
    owner.current = original;
    return () => {
      original.active = false;
    };
  }, [identity]);
  const current = useCallback(
    (original: Owner) => {
      if (
        !original.active ||
        owner.current !== original ||
        original.identity !== identity ||
        bridge.windowId !== windowId ||
        bridge.privateMode !== privateMode ||
        bridge.windowKind !== kind
      ) {
        original.active = false;
        return false;
      }
      if (!Number.isSafeInteger(page.documentEpoch) || page.documentEpoch < 0 || !page.targetId) {
        original.active = false;
        return false;
      }
      const state = useStore.getState();
      const matches = state.pages.filter((item) => item.pageId === page.pageId);
      const live = matches.length === 1 ? matches[0] : undefined;
      const valid = (
        !!live &&
        state.mode === "focus" &&
        state.activePageId === page.pageId &&
        live.windowId === windowId &&
        JSON.stringify(live) === snapshot
      );
      if (!valid) original.active = false;
      return valid;
    },
    [identity, windowId, privateMode, kind, page.pageId, page.documentEpoch, page.targetId, snapshot],
  );
  const [pending, setPending] = useState<{ owner: Owner; action: "reload" | "back" | "proceed" } | null>(
    null,
  );
  const [failure, setFailure] = useState<{ owner: Owner; message: string } | null>(null);
  const [details, setDetails] = useState<Owner | null>(null);
  const busy = pending?.owner.active && pending.owner.identity === identity ? pending.action : null;
  const actionError = failure?.owner.active && failure.owner.identity === identity ? failure.message : "";
  const scopeId = useId();
  const [publish, run] = useScopedCommandControls(scopeId, () => {
    const original = owner.current;
    return current(original) ? () => current(original) : undefined;
  });
  const error = page.navigationError,
    crashed = page.viewStatus === "crashed";
  const httpFallback = !crashed && !!error?.upgradedFrom;
  const description = crashed
    ? { title: "This tab crashed", detail: "Reload to try again. Unsaved changes on this page may be lost." }
    : httpFallback
      ? {
          title: "This site doesn't support secure connections",
          detail:
            "Aux tried to load it over encrypted HTTPS but the site didn't respond securely. You can continue over unencrypted HTTP — information you send won't be private on this site.",
        }
      : navigationFailure(error!);
  const insecure = !crashed && !httpFallback && !!error && /ERR_CERT_/.test(error.message);
  function requireOwner(exclusive = true) {
    const original = owner.current;
    if (!current(original) || (exclusive && original.pending))
      throw new Error("Choose this page’s current recovery control.");
    return original;
  }
  function perform(action: "reload" | "back" | "proceed", producer: () => Promise<unknown>) {
    const original = requireOwner();
    original.pending = true;
    setPending({ owner: original, action });
    setFailure(null);
    const completion = (async () => {
      try {
        return await producer();
      } catch (reason) {
        if (current(original))
          setFailure({
            owner: original,
            message: `${action === "reload" ? "Couldn’t reload this tab" : action === "back" ? "Couldn’t go back" : "Couldn’t proceed"}. ${errorMessage(reason)}`,
          });
        throw reason;
      } finally {
        original.pending = false;
        setPending((previous) => (previous?.owner === original ? null : previous));
      }
    })();
    return guardCommandCompletion(completion, () => current(original));
  }
  const retry = () => perform("reload", () => call("pages.reload", { pageId: page.pageId }));
  const back = () => {
    requireOwner();
    if (!page.canGoBack) throw new Error("This page cannot go back.");
    return perform("back", () => call("pages.back", { pageId: page.pageId }));
  };
  function proceed(http: boolean) {
    requireOwner();
    if (!error || http !== httpFallback || (!http && !insecure))
      throw new Error("Choose the original connection recovery option.");
    return perform("proceed", async () => {
      if (http) {
        if (!(await bridge.useHttp(page.pageId, error.upgradedFrom!)))
          throw new Error("The HTTP fallback was not accepted.");
      } else if (!(await bridge.proceedInsecure(page.pageId, error.url)))
        throw new Error("The certificate exception was not accepted.");
    });
  }
  function editAddress() {
    requireOwner(false);
    return useStore.getState().focusCommandBar();
  }
  function toggleDetails() {
    const original = requireOwner(false);
    if (!error || crashed) throw new Error("Choose the current connection details.");
    setDetails((previous) => (previous === original ? null : original));
  }
  return (
    <div className="stage-message">
      <div className="empty-state navigation-error" role="status">
        <span className={`empty-ico ${crashed ? "err" : ""}`}>
          {crashed ? shellIconAlert : shellIconGlobe}
        </span>
        <h2>{description.title}</h2>
        <p>{description.detail}</p>
        <p className="navigation-error-address selectable">{error?.url ?? page.url}</p>
        <div className="empty-actions">
          <RecoveryButton control={[publish, run, "retry", "retry-page-recovery", retry]} className="btn primary" disabled={busy !== null}>{busy === "reload" ? "Trying…" : crashed ? "Reload" : "Try again"}</RecoveryButton>
          <RecoveryButton control={[publish, run, "address", "edit-page-recovery-address", editAddress]}>Edit address</RecoveryButton>
          {page.canGoBack && <RecoveryButton control={[publish, run, "back", "back-page-recovery", back]} disabled={busy !== null}>{busy === "back" ? "Going back…" : "Go back"}</RecoveryButton>}
          {httpFallback && <RecoveryButton control={[publish, run, "http", "continue-page-over-http", () => proceed(true)]} disabled={busy !== null}>{busy === "proceed" ? "Continuing…" : "Continue over HTTP"}</RecoveryButton>}
          {insecure && <RecoveryButton control={[publish, run, "certificate", "proceed-page-certificate", () => proceed(false)]} className="btn ghost" disabled={busy !== null}>{busy === "proceed" ? "Proceeding…" : "Proceed anyway (unsafe)"}</RecoveryButton>}
        </div>
        {actionError && <p role="alert">{actionError}</p>}
        {error && !crashed && (
          <details
            className="navigation-error-details"
            open={details?.active === true && details.identity === identity}
          >
            <summary
              ref={(element) => publish("details", "toggle-page-connection-details", element, toggleDetails)}
              data-command-id="toggle-page-connection-details"
              onClick={(event) => {
                event.preventDefault();
                run("toggle-page-connection-details", event);
              }}
            >
              Connection details
            </summary>
            <p className="selectable">
              {error.message} ({error.code})
            </p>
          </details>
        )}
      </div>
    </div>
  );
}

function RecoveryButton({ control: [publish, run, key, command, invoke], children, className = "btn", disabled }: {
  control: [...ReturnType<typeof useScopedCommandControls>, string, string, () => unknown];
  children: ReactNode; className?: string; disabled?: boolean;
}) {
  return <button ref={element => publish(key, command, element, invoke)} data-command-id={command} className={className} disabled={disabled} onClick={event => run(command, event)}>{children}</button>;
}
