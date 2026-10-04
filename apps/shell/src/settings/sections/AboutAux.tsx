import { AUX_FEATURES, type AuxFeature } from "@aux/contracts";
import { featureStage } from "../../use-feature";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useState } from "react";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { guardCommandCompletion } from "../../command-completion";
import { PreferenceAction, usePreferenceCommand } from "./preference-command";

type Build = { buildId: string; sourceCommit: string };
class BuildOwner {
  #live = true; #pending = false; #sequence = 0;
  constructor(readonly snapshot: { active: boolean; available: boolean; windowId: string; privateMode: boolean; kind: typeof bridge.windowKind; producer: typeof bridge.capabilities }) {}
  current() {
    const original = this.snapshot;
    if (!this.#live || !original.active || !original.available) return false;
    if (!(inNativeHost || inMock) || bridge.windowId !== original.windowId || bridge.privateMode !== original.privateMode || bridge.windowKind !== original.kind || bridge.capabilities !== original.producer) { this.retire(); return false; }
    return true;
  }
  retire() { this.#live = false; }
  begin() { if (!this.current() || this.#pending) return null; this.#pending = true; return ++this.#sequence; }
  matches(sequence: number) { return this.current() && sequence === this.#sequence; }
  finish() { this.#pending = false; }
}
export function AboutAuxSetting({ active }: { active: boolean }) {
  const available = inNativeHost || inMock;
  const windowId = bridge.windowId, privateMode = bridge.privateMode, kind = bridge.windowKind, producer = bridge.capabilities;
  const owner = useMemo(() => new BuildOwner({ active, available, windowId, privateMode, kind, producer }), [active, available, windowId, privateMode, kind, producer]);
  useLayoutEffect(() => () => owner.retire(), [owner]);
  const current = useCallback(() => owner.current(), [owner]);
  const [measured, setMeasured] = useState<{ owner: typeof owner; build: Build } | null>(null);
  const [failure, setFailure] = useState<{ owner: typeof owner; text: string } | null>(null);
  const [expandedError, setExpandedError] = useState<typeof failure>(null);
  const [expandedFeatures, setExpandedFeatures] = useState<typeof owner | null>(null);
  const build = measured?.owner === owner && current() ? measured.build : null;
  const error = failure?.owner === owner && current() ? failure : null;
  const scopeId = useId();
  const read = useCallback(() => {
    const sequence = owner.begin();
    if (sequence === null) throw new Error("Choose the current installed build recovery control.");
    const completion = (async () => {
      setMeasured(null); setFailure(null); setExpandedError(null); setExpandedFeatures(null);
      try {
        const value = await owner.snapshot.producer.call(bridge);
        if (owner.matches(sequence)) setMeasured({ owner, build: value });
        return value;
      } catch (reason) {
        if (owner.matches(sequence)) setFailure({ owner, text: reason instanceof Error ? reason.stack ?? reason.message : String(reason) });
        throw reason;
      } finally { owner.finish(); }
    })();
    return guardCommandCompletion(completion, current);
  }, [owner, current]);
  useEffect(() => {
    if (!current()) return;
    void read().catch(() => {}); // Original read failure is delivered inline only while its owner remains current.
  }, [current, read]);
  const retry = useCallback(() => {
    if (!error || !current()) throw new Error("Choose the current installed build recovery control.");
    return read();
  }, [error, current, read]);
  const toggleError = useCallback(() => {
    if (!error || !current()) throw new Error("Choose the current installed build diagnostic.");
    setExpandedError(value => value === error ? null : error);
  }, [error, current]);
  const toggleFeatures = useCallback(() => {
    if (!build || !current()) throw new Error("Choose the current installed feature list.");
    setExpandedFeatures(value => value === owner ? null : owner);
  }, [build, current, owner]);
  const [errorRef, errorInput] = usePreferenceCommand<HTMLElement>("toggle-installed-build-error-details", scopeId, toggleError);
  const [featureRef, featureInput] = usePreferenceCommand<HTMLElement>("toggle-installed-feature-availability", scopeId, toggleFeatures);
  if (!available) return <span className="hint">Available in the Aux desktop app.</span>;
  if (error) return <div role="alert" className="field-error">
    <span>Could not read the installed build.</span>{" "}
    <PreferenceAction command="retry-installed-build" scopeId={scopeId} invoke={retry} className="btn sm ghost">Retry</PreferenceAction>
    <details open={expandedError === error}>
      <summary ref={errorRef} data-command-id="toggle-installed-build-error-details" onClick={event => { event.preventDefault(); errorInput(event); }}>Error details</summary>
      <pre className="hint mono" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxHeight: 180, overflow: "auto", userSelect: "text" }}>{error.text}</pre>
    </details>
  </div>;
  if (!build) return <span className="hint">Reading installed build…</span>;
  const [chromiumVersion, manifestHash] = build.buildId.split("+");
  return <>
    <div className="row">
      <span className="hint">Chromium {chromiumVersion}</span>
      {manifestHash && <span className="hint mono" title={build.buildId}>Build {manifestHash.slice(0, 8)}</span>}
      <span className="hint mono" title={build.sourceCommit}>Source {build.sourceCommit.slice(0, 8)}</span>
      {build.sourceCommit.endsWith("+dirty") && <span className="badge" title="This build includes uncommitted product changes">+dirty</span>}
    </div>
    <details open={expandedFeatures === owner}>
      <summary ref={featureRef} data-command-id="toggle-installed-feature-availability" onClick={event => { event.preventDefault(); featureInput(event); }}>Feature availability</summary>
      <table className="feature-availability" aria-label="Installed feature availability"><thead><tr><th>Feature</th><th>Status</th></tr></thead>
        <tbody>{(Object.keys(AUX_FEATURES) as AuxFeature[]).sort().map(feature => {
          const stage = featureStage(feature);
          return <tr key={feature}><td>{feature}</td><td><output aria-label={`${feature}: ${stage}`}>{stage}</output></td></tr>;
        })}</tbody>
      </table>
    </details>
  </>;
}
