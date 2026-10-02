import { useEffect, useState } from "react";
import { bridge } from "../../bridge";
import { call } from "../../store";
import { SiteAgentAccess, type SitePermissionData } from "./SiteAgentAccess";

export function SiteRulesTable() {
  const [data, setData] = useState<SitePermissionData | null>(null);
  const [error, setError] = useState("");
  const [revision, refresh] = useState(0);
  useEffect(() => {
    let live = true;
    void (async () => {
      const [snapshot, profiles] = await Promise.all([
        call("safety.originPolicies.list", {}),
        bridge.browserProfiles(),
      ]);
      const profile = profiles.find((value) => value.current);
      if (!profile) throw new Error("This Profile's permissions are unavailable.");
      const grants = await call("safety.grants.list", { profileId: profile.id });
      if (live) {
        setData({ snapshot, grants });
        setError("");
      }
    })().catch((reason) => {
      if (live) setError(reason instanceof Error ? reason.message : String(reason));
    });
    const focus = () => refresh((value) => value + 1);
    window.addEventListener("focus", focus);
    return () => {
      live = false;
      window.removeEventListener("focus", focus);
    };
  }, [revision]);
  const origins = data
    ? [
        ...new Set([
          ...data.snapshot.rules.map((rule) => rule.origin),
          ...data.grants
            .filter((grant) => !grant.revokedAt)
            .flatMap((grant) => (grant.origin ? [grant.origin] : [])),
        ]),
      ].sort()
    : [];
  return (
    <div aria-label="Site rules and grants">
      <h3>Site rules and grants</h3>
      <p className="hint">
        Change a website's agent access from its site controls. Saved grants apply only to this Profile.
      </p>
      {error && <p role="alert">{error}</p>}
      {!data && !error && <output>Loading site permissions…</output>}
      {data && !origins.length && <p>No saved site rules or grants.</p>}
      {data &&
        origins.map((origin) => (
          <details key={origin}>
            <summary>{origin.replace(/\/$/, "")}</summary>
            <SiteAgentAccess
              origin={origin}
              showRemove
              data={data}
              onChanged={() => refresh((value) => value + 1)}
            />
          </details>
        ))}
    </div>
  );
}
