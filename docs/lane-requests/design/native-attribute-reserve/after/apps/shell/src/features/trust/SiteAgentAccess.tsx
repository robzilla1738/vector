import { staticHintProps } from "../../ui/class-props";
import { smallButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { useEffect, useRef, useState } from "react";
import type { Effect, MethodResult, StandingGrant } from "@aux/contracts";
import { executeCommand } from "../../commands";
import { bridge } from "../../bridge";
import { DEFAULT_SITE_ACCESS } from "./actions";
import { call } from "../../store";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";

const effects: readonly [Effect, string][] = [
  ["read", "Read"],
  ["write", "Interact"],
  ["egress", "Navigate"],
  ["credential", "Credentials"],
  ["external_tool", "External tools"],
  ["destructive", "Evaluate"],
];
export interface SitePermissionData {
  snapshot: MethodResult<"safety.originPolicies.list">;
  grants: StandingGrant[];
}
export function SiteAgentAccess({
  origin,
  showRemove = false,
  data,
  onChanged,
}: {
  origin: string;
  showRemove?: boolean;
  data?: SitePermissionData;
  onChanged?: () => void;
}) {
  const [loaded, setLoaded] = useState<(SitePermissionData & { origin: string; revision: number }) | null>(
    null,
  );
  const [failure, setFailure] = useState<{ origin: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const serial = useRef(0),
    pending = useRef(false);
  const [revision, refresh] = useState(0);
  const current = data ?? (loaded?.origin === origin && loaded.revision === revision ? loaded : undefined);
  const snapshot = current?.snapshot;
  const grants = current?.grants.filter((grant) => grant.origin === origin && !grant.revokedAt) ?? [];
  const error = failure?.origin === origin ? failure.message : "";
  useEffect(() => {
    const request = ++serial.current;
    let live = true;
    if (!data)
      void (async () => {
        const [rules, profiles] = await Promise.all([
          call("safety.originPolicies.list", {}),
          bridge.browserProfiles(),
        ]);
        const profile = profiles.find((value) => value.current);
        if (!profile) throw new Error("This Profile's permissions are unavailable.");
        const saved = await call("safety.grants.list", { profileId: profile.id });
        if (!live || serial.current !== request) return;
        setLoaded({ origin, revision, snapshot: rules, grants: saved });
        setFailure(null);
      })().catch((reason) => {
        if (live && serial.current === request)
          setFailure({ origin, message: errorMessage(reason) });
      });
    return () => {
      live = false;
    };
  }, [origin, revision, data]);
  async function change(work: () => Promise<unknown>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setFailure(null);
    const request = serial.current;
    try {
      await work();
    } catch (reason) {
      if (serial.current === request)
        setFailure({ origin, message: errorMessage(reason) });
    } finally {
      pending.current = false;
      setBusy(false);
      if (serial.current === request) {
        refresh((value) => value + 1);
        onChanged?.();
      }
    }
  }
  const rule = snapshot?.rules.find((value) => value.origin === origin);
  return (
    <section className="site-controls-group agent-site-access" aria-label={`Agent access on ${origin}`}>
      <div className="site-group-heading">
        <div>
          <strong>Agent access</strong>
          <span>Saved in this Profile. Consequential actions still ask.</span>
        </div>
        {showRemove && rule && (
          <button
            {...smallButtonProps}
            disabled={busy}
            data-command-id="delete-site-agent-rule"
            onClick={() =>
              void change(() =>
                executeCommand("delete-site-agent-rule", {
                  payload: { origin, expectedRevision: snapshot!.revision },
                }),
              )
            }
          >
            Remove rule
          </button>
        )}
      </div>
      {error && <p {...nativeAlertRoleProps}>{error}</p>}
      {!snapshot && !error && <output>Loading agent access…</output>}
      {snapshot &&
        effects.map(([effect, label]) => (
          <label className="site-permission-compact" key={effect}>
            <span>{label}</span>
            <select
              aria-label={`Agent ${label.toLowerCase()} access on ${origin}`}
              disabled={busy}
              data-command-id="set-site-agent-access"
              value={rule?.effects?.[effect] ?? rule?.access ?? DEFAULT_SITE_ACCESS[effect]}
              onChange={(event) => {
                const access = event.target.value;
                if (access !== "allow" && access !== "ask" && access !== "deny") return;
                void change(() =>
                  executeCommand("set-site-agent-access", {
                    payload: { origin, effect, access, expectedRevision: snapshot.revision },
                  }),
                );
              }}
            >
              <option value="allow">Allow</option>
              <option value="ask">Ask</option>
              <option value="deny">Block</option>
            </select>
          </label>
        ))}
      <strong>Always allowed here</strong>
      {grants.length ? (
        grants.map((grant) => (
          <div key={grant.grantId} className="site-permission-compact">
            <span>
              {grant.category ?? grant.action}
              {grant.lifetime === "session" ? " · this session" : ""}
            </span>
            <button
              {...smallButtonProps}
              disabled={busy}
              data-command-id="revoke-site-agent-grant"
              aria-label={`Revoke ${grant.category ?? grant.action} on ${origin}`}
              onClick={() =>
                void change(() =>
                  executeCommand("revoke-site-agent-grant", {
                    payload: { grantId: grant.grantId, profileId: grant.profileId },
                  }),
                )
              }
            >
              Revoke
            </button>
          </div>
        ))
      ) : (
        <p {...staticHintProps}>No saved grants for this site.</p>
      )}
    </section>
  );
}
