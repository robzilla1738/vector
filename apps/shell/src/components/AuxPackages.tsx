import "./AuxPackages.css";
import { shellIconExtension } from "../ui/icons";
import { useEffect, useState } from "react";
import type { MethodResult } from "@aux/contracts";
import { call } from "../store";
import { bridge } from "../bridge";
import { errorMessage } from "../error-message";
import { Button, SettingsGroup, Switch } from "../ui";
import { SettingsField } from "../settings/primitives";
export function AuxPackages() {
  const [library, setLibrary] = useState<MethodResult<"packages.list"> | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    void call("packages.list")
      .then((result) => {
        if (live) setLibrary(result);
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, []);
  async function update(work: () => Promise<MethodResult<"packages.list">>) {
    setBusy(true);
    setError("");
    try {
      setLibrary(await work());
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="field aux-packages"
      aria-label="Aux Packages"
      data-setting="Aux Packages"
      tabIndex={-1}
    >
      <h4>Aux Packages</h4>
      <p>
        Skills, agent profiles and prompt templates for Aux. Select packages per run or choose defaults here.
      </p>
      {!library && !error && <output>Loading Aux Packages…</output>}
      {library?.packages.length === 0 && <output>No Aux Packages installed.</output>}
      <SettingsGroup>
        {library?.packages.map((item) => (
          <SettingsField
            key={item.name}
            searchable={false}
            compact
            icon={shellIconExtension}
            label={item.name}
            hint={item.description}
            details={
              <>
                <span className="hint">
                  {item.version}
                  {item.shipped ? " · Included" : ""}
                </span>
                {item.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </>
            }
          >
            <Switch
              aria-label={`Use ${item.name} by default`}
              disabled={busy}
              checked={library.defaults.includes(item.name)}
              onChange={(event) => {
                const names = new Set(library.defaults);
                if (event.target.checked) names.add(item.name);
                else names.delete(item.name);
                void update(() => call("packages.defaults", { names: [...names] }));
              }}
            />
            {!item.shipped && (
              <Button
                size={28}
                disabled={busy}
                onClick={() => void update(() => call("packages.remove", { name: item.name }))}
              >
                Remove
              </Button>
            )}
          </SettingsField>
        ))}
      </SettingsGroup>
      <Button
        size={28}
        disabled={busy}
        onClick={() =>
          void update(async () => {
            const path = await bridge.openPluginDirectory();
            if (!path) return library ?? { packages: [], defaults: [] };
            return call("packages.install", { path });
          })
        }
      >
        Add Aux Package…
      </Button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
