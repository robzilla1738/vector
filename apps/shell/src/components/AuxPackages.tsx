import { useEffect, useState } from "react";
import type { MethodResult } from "@aux/contracts";
import { call } from "../store";
import { bridge } from "../bridge";
import { errorMessage } from "../error-message";
import { Button } from "../ui";
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
    <section className="field" aria-label="Aux Packages">
      <h3>Aux Packages</h3>
      <p>
        Skills, agent profiles and prompt templates for Aux. Select packages per run or choose defaults here.
      </p>
      {library?.packages.map((item) => (
        <div key={item.name}>
          <label>
            <input
              type="checkbox"
              disabled={busy}
              checked={library.defaults.includes(item.name)}
              onChange={(event) => {
                const names = new Set(library.defaults);
                if (event.target.checked) names.add(item.name);
                else names.delete(item.name);
                void update(() => call("packages.defaults", { names: [...names] }));
              }}
            />
            {item.name}{" "}
            <small>
              {item.version}
              {item.shipped ? " · Included" : ""}
            </small>
          </label>
          {item.description && <p>{item.description}</p>}
          {item.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
          {!item.shipped && (
            <Button
              size={28}
              disabled={busy}
              onClick={() => void update(() => call("packages.remove", { name: item.name }))}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
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
