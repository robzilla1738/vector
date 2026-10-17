import { useEffect, useRef, useState } from "react";
import { bridge } from "../../bridge";
import { errorMessage } from "../../error-message";
import { FilterSettings } from "./FilterSettings";
import { SettingsGroup, Switch } from "../../ui";
import { shellIconHand, shellIconFilter } from "../../ui/icons";
import { SettingsField } from "../primitives";

type Privacy = Awaited<ReturnType<typeof bridge.privacy>>;

export function ContentBlockingSettings({ active }: { active: boolean }) {
  const [privacy, setPrivacy] = useState<Privacy | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  const pending = useRef(false);
  const request = useRef(0);

  useEffect(() => {
    if (!active) return;
    const load = async () => {
      if (pending.current) return;
      const token = ++request.current;
      try {
        const next = await bridge.privacy();
        if (token === request.current) {
          setPrivacy(next);
          setError("");
        }
      } catch (reason) {
        if (token === request.current) {
          setPrivacy(null);
          setError(errorMessage(reason));
        }
      }
    };
    void load();
    const refresh = () => {
      if (document.visibilityState !== "hidden") void load();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      ++request.current;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [active, retry]);

  async function action(work: () => Promise<void>) {
    if (!active || pending.current || !privacy) return;
    pending.current = true;
    ++request.current;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <SettingsGroup title="Adblock">
      <SettingsField
        compact
        label="Block ads and trackers"
        icon={shellIconHand}
        description="Block known advertising and tracking domains. Reload open tabs after changing this setting."
        hint={
          !privacy
            ? "Read blocking settings before making changes."
            : privacy.blocked > 0
              ? `${privacy.blocked} requests blocked this session. Reload open tabs after changing this setting.`
              : "Block known advertising and tracking domains. Reload open tabs after changing this setting."
        }
      >
        <Switch
          aria-label="Block ads and trackers"
          checked={privacy?.trackerBlock ?? false}
          disabled={!active || busy || !privacy}
          onChange={(event) => {
            const enabled = event.target.checked;
            void action(async () => {
              const next = await bridge.setTrackerBlock(enabled);
              setPrivacy((current) => current && { ...current, ...next });
              if (next.trackerBlock !== enabled)
                throw new Error("The browser did not save the blocking choice. Review its current state.");
              setNotice(enabled ? "Blocking is on for new requests." : "Blocking is off for new requests.");
            });
          }}
        />
      </SettingsField>
      <SettingsField
        compact
        label="Manage filters"
        icon={shellIconFilter}
        description="Review filter sources, updates and website exceptions."
        details={
          !!privacy?.allowedHosts?.length && (
            <section aria-label="Sites where blocking is paused">
              <h4>Sites where blocking is paused</h4>
              {privacy.allowedHosts.map((host) => (
                <div className="site-permission-row" key={host}>
                  <span>{host}</span>
                  <button
                    className="btn sm"
                    aria-label={`Resume blocking on ${host}`}
                    disabled={!active || busy}
                    onClick={() =>
                      void action(async () => {
                        const allowedHosts = await bridge.removeAllowedHost(host);
                        setPrivacy((current) => current && { ...current, allowedHosts });
                        setNotice(`${host} will block trackers and ads again. Reload its tabs to apply.`);
                      })
                    }
                  >
                    Resume blocking
                  </button>
                </div>
              ))}
            </section>
          )
        }
      >
        <FilterSettings active={active} />
      </SettingsField>
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button
            className="btn sm"
            disabled={!active || busy}
            onClick={() => setRetry((value) => value + 1)}
          >
            Refresh blocking settings
          </button>
        </div>
      )}
      {notice && <output className="hint">{notice}</output>}
    </SettingsGroup>
  );
}
