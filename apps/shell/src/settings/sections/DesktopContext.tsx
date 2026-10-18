import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MethodResult } from "@aux/contracts";
import type {
  DesktopApp,
  DesktopContextSettings,
  DesktopContextSnapshot,
  DesktopContextSource,
} from "@aux/contracts/desktop-context";
import { call, useStore } from "../../store";
import { bridge } from "../../bridge";
import { errorMessage } from "../../error-message";
import { SettingsField, SettingsSection } from "../primitives";
import { useConfirm } from "../../ui/dialog";
import { Button, Select, SettingsGroup, Switch, TextField } from "../../ui";
import { PreferenceAction } from "./preference-command";
import "./DesktopContext.css";

/** Separate consent surface. No draft toggle invokes capture or an OS prompt. */
export function DesktopContextSettings({ active }: { active: boolean }) {
  return bridge.privateMode ? null : <DesktopContextBody active={active} />;
}
function DesktopContextBody({ active }: { active: boolean }) {
  const [snapshot, setSnapshot] = useState<DesktopContextSnapshot>();
  const [draft, setDraft] = useState<DesktopContextSettings>();
  const [apps, setApps] = useState<DesktopApp[]>([]);
  const [sources, setSources] = useState<DesktopContextSource[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MethodResult<"desktopContext.read">>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searchMode, setSearchMode] = useState("");
  const { confirm, confirmation } = useConfirm();
  const workspaces = useStore((state) => state.layout.spaces);
  const loadSequence = useRef(0);
  const owner = useRef({ mounted: false, active: false, sequence: 0, windowId: bridge.windowId });
  useLayoutEffect(() => {
    owner.current.mounted = true;
    return () => {
      owner.current.mounted = false;
      owner.current.sequence++;
    };
  }, []);
  useLayoutEffect(() => {
    owner.current.active = active;
    if (!active) owner.current.sequence++;
    else setBusy(false);
  }, [active]);
  const current = useCallback(() => {
    if (
      !owner.current.mounted ||
      !owner.current.active ||
      bridge.privateMode ||
      bridge.windowId !== owner.current.windowId
    )
      throw new Error("Choose the original Desktop context Settings window.");
  }, []);
  const renderSequence = owner.current.sequence;
  const original = () => {
    current();
    if (renderSequence !== owner.current.sequence)
      throw new Error("The original Desktop context request retired.");
  };
  const perform = async (action: () => Promise<void>) => {
    current();
    const sequence = owner.current.sequence;
    setBusy(true);
    setError("");
    try {
      await action();
      current();
    } catch (reason) {
      if (owner.current.mounted && owner.current.active && sequence === owner.current.sequence)
        setError(errorMessage(reason));
    } finally {
      if (owner.current.mounted && sequence === owner.current.sequence) setBusy(false);
    }
  };
  const refresh = useCallback(async () => {
    current();
    const sequence = owner.current.sequence;
    const request = ++loadSequence.current;
    const [value, catalog] = await Promise.all([
      call("desktopContext.settings", {}),
      call("desktopContext.apps", {}),
    ]);
    current();
    if (sequence !== owner.current.sequence || request !== loadSequence.current) return;
    setSnapshot(value);
    setDraft(value.settings);
    setApps(catalog);
    setError("");
  }, [current]);
  useEffect(() => {
    if (active)
      void refresh().catch((reason) => {
        if (owner.current.mounted && owner.current.active) setError(errorMessage(reason));
      });
  }, [active, refresh]);
  const apply = (value: DesktopContextSnapshot) => {
    original();
    loadSequence.current++;
    setSnapshot(value);
    setDraft(value.settings);
    setSelected(undefined);
    setSources([]);
    setCursor(null);
  };
  const revision = () => {
    original();
    if (!snapshot || !draft || snapshot.settings.revision !== draft.revision)
      throw new Error("Refresh the current desktop context settings.");
    return snapshot.settings.revision;
  };
  const scope = `desktop-context:${owner.current.windowId}:${snapshot?.settings.revision ?? "loading"}`;
  const action = (
    name: string,
    suffix: string,
    label: string,
    invoke: () => Promise<void>,
    disabled = false,
  ) => (
    <PreferenceAction
      command={`desktop-context-${name}`}
      scopeId={`${scope}:${suffix}`}
      className="btn"
      data-control-size={32}
      disabled={busy || disabled}
      invoke={() => perform(invoke)}
    >
      {label}
    </PreferenceAction>
  );
  const loadSources = async (more = false) => {
    const workspaceId = snapshot?.settings.workspaceId;
    original();
    if (!workspaceId) throw new Error("Choose a capture destination Space.");
    const expected = revision();
    if (query.trim()) {
      const result = await call("desktopContext.search", {
        workspaceId,
        queries: [query.trim()],
        cursor: more ? (cursor ?? undefined) : undefined,
        limit: 20,
      });
      original();
      if (snapshot?.settings.revision !== expected) return;
      setSources((previous) =>
        more
          ? [...previous, ...result.items.map((item) => item.source)]
          : result.items.map((item) => item.source),
      );
      setCursor(result.nextCursor);
      setSearchMode(
        `${result.mode === "semantic" ? "Local semantic search" : "Local text matching"}${result.fallbackReason ? ` · ${result.fallbackReason}` : ""}`,
      );
    } else {
      const result = await call("desktopContext.sources", {
        workspaceId,
        cursor: more ? (cursor ?? undefined) : undefined,
        limit: 20,
      });
      original();
      if (snapshot?.settings.revision !== expected) return;
      setSources((previous) => (more ? [...previous, ...result.items] : result.items));
      setCursor(result.nextCursor);
      setSearchMode("");
    }
  };
  const dirty = !!snapshot && !!draft && JSON.stringify(snapshot.settings) !== JSON.stringify(draft);
  const availableApps = draft
    ? [...new Map([...draft.selectedApps, ...apps].map((app) => [app.bundleId, app])).values()]
    : [];
  if (!active) return null;
  return (
    <SettingsSection name="Desktop context" className="desktop-context-settings">
      <SettingsField
        layout="feature"
        label="Remember what you choose"
        description="Recall visible text and selections from selected apps. Desktop context is separate from Memory and stays off until you enable it."
        details={
          <img
            className="setting-illustration"
            src="/settings/desktop-context.svg"
            width={288}
            height={160}
            alt=""
            loading="lazy"
            decoding="async"
          />
        }
      />
      <p className="hint desktop-context-intro">
        Captures stay encrypted on this Mac for 14 days. Capture uses no model or network request. AI use
        follows your normal context and sharing controls.
      </p>
      {confirmation}
      {error && (
        <p role="alert" className="desktop-context-error">
          {error}
        </p>
      )}
      {!snapshot || !draft ? (
        <>
          <p className="hint">{error ? "Desktop context is unavailable." : "Reading desktop context…"}</p>
          {action("refresh", "refresh", "Refresh status", refresh)}
        </>
      ) : (
        <>
          <SettingsGroup>
            <SettingsField
              compact
              label="Desktop context"
              description="This is separate from Memory and browser selection capture. Password fields, locked sessions and unselected apps suspend collection."
            >
              <Switch
                aria-label="Allow desktop context for the selected apps"
                checked={draft.enabled}
                disabled={busy || !snapshot.status.supported}
                onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })}
              />
            </SettingsField>
            <SettingsField
              compact
              label="Destination Space"
              description="Save selected app context in this Space."
            >
              <Select
                aria-label="Desktop context Space"
                value={draft.workspaceId ?? ""}
                disabled={busy}
                onChange={(event) => setDraft({ ...draft, workspaceId: event.target.value || null })}
              >
                <option value="">Choose a Space</option>
                {workspaces.map((space) => (
                  <option key={space.id} value={space.workspaceId}>
                    {space.name}
                  </option>
                ))}
              </Select>
            </SettingsField>
          </SettingsGroup>
          <p className="hint desktop-context-note">
            Aux can use saved context in normal AI chats in this Space; your AI provider and privacy settings
            apply. Captured text never grants permission to act.
          </p>
          <SettingsGroup title="Selected apps">
            <p className="hint desktop-context-note">
              Open a supported app, then refresh to add it. Browser apps are excluded because macOS cannot
              establish private-window status; use Aux page context for sites. Removing an app also forgets
              its saved context.
            </p>
            {availableApps.map((app) => (
              <SettingsField
                key={app.bundleId}
                compact
                searchable={false}
                label={app.displayName}
                description={app.bundleId}
              >
                <Switch
                  aria-label={`Include ${app.displayName}`}
                  checked={draft.selectedApps.some((selectedApp) => selectedApp.bundleId === app.bundleId)}
                  disabled={busy}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      selectedApps: event.target.checked
                        ? [...draft.selectedApps, app]
                        : draft.selectedApps.filter((selectedApp) => selectedApp.bundleId !== app.bundleId),
                    })
                  }
                />
              </SettingsField>
            ))}
            {!availableApps.length && (
              <p className="hint desktop-context-note">No eligible running apps found.</p>
            )}
          </SettingsGroup>
          <SettingsGroup title="Local OCR">
            <SettingsField
              compact
              label="Recognize text in a selected window"
              description={`Use Apple Vision locally when visible Accessibility text is unavailable. A separate macOS window selection is required. Images are discarded after recognition.${!snapshot.status.ocrSupported ? " Requires macOS 15.2 or later." : ""}`}
            >
              <Switch
                aria-label="Allow local OCR for a window selected with macOS"
                checked={draft.ocrEnabled}
                disabled={busy || !snapshot.status.ocrSupported}
                onChange={(event) => setDraft({ ...draft, ocrEnabled: event.target.checked })}
              />
            </SettingsField>
          </SettingsGroup>
          <div className="desktop-context-save">
            <Button
              disabled={busy || !dirty}
              onClick={() => {
                original();
                setDraft(snapshot.settings);
              }}
            >
              Cancel
            </Button>
            {action(
              "configure",
              "save",
              "Save desktop context",
              async () => {
                const removed = snapshot.settings.selectedApps.some(
                  (app) => !draft.selectedApps.some((selectedApp) => selectedApp.bundleId === app.bundleId),
                );
                if (
                  removed &&
                  !(await confirm({
                    title: "Remove app context?",
                    description:
                      "Stop capturing the removed apps and permanently forget their saved desktop context.",
                    confirmLabel: "Remove and forget",
                  }))
                )
                  return;
                original();
                apply(
                  await call("desktopContext.configure", { expectedRevision: revision(), settings: draft }),
                );
              },
              !dirty || (draft.enabled && (!draft.workspaceId || !draft.selectedApps.length)),
            )}
          </div>
          <SettingsGroup title="Permissions and collection">
            <SettingsField
              compact
              label="Capture status"
              hint={
                <output className="desktop-context-status" aria-live="polite">
                  {snapshot.status.phase.replaceAll("-", " ")}
                  {snapshot.status.reason !== "none"
                    ? ` · ${snapshot.status.reason.replaceAll("-", " ")}`
                    : ""}
                </output>
              }
              description="Current native capture status"
            >
              {action("refresh", "refresh", "Refresh status", refresh)}
            </SettingsField>
            <SettingsField
              compact
              label="Accessibility"
              description={
                snapshot.status.accessibilityTrusted
                  ? "macOS access is available. Only the selected foreground app can be captured."
                  : "Approve Aux in macOS Accessibility, then refresh status. A request may require approval in System Settings."
              }
            >
              {action(
                "permission",
                "accessibility",
                "Request access",
                async () =>
                  apply(
                    await call("desktopContext.permission", {
                      expectedRevision: revision(),
                      kind: "accessibility",
                    }),
                  ),
                !snapshot.settings.enabled,
              )}
            </SettingsField>
            <SettingsField
              compact
              label="Local OCR window"
              description={
                snapshot.status.pickerGrantActive
                  ? "A selected window is available for local OCR."
                  : "No active window selection. A restart or permission change requires choosing again."
              }
            >
              {action(
                "permission",
                "ocr",
                "Choose window…",
                async () =>
                  apply(
                    await call("desktopContext.permission", {
                      expectedRevision: revision(),
                      kind: "ocr-picker",
                    }),
                  ),
                !snapshot.settings.enabled || !snapshot.settings.ocrEnabled || !snapshot.status.ocrSupported,
              )}
            </SettingsField>
            <SettingsField
              compact
              label="Collection"
              description={`${snapshot.storedCount} saved captures · ${(snapshot.storedBytes / 1024).toFixed(1)} KB encrypted. Maximum 32 MB or 10,000 captures per Space; collection stops when full.`}
            >
              {action(
                "pause",
                "pause",
                snapshot.settings.paused ? "Resume" : "Pause",
                async () =>
                  apply(
                    await call("desktopContext.pause", {
                      expectedRevision: revision(),
                      paused: !snapshot.settings.paused,
                    }),
                  ),
                !snapshot.settings.enabled,
              )}
            </SettingsField>
          </SettingsGroup>
          <SettingsGroup title="Saved sources">
            <SettingsField
              label="Search saved text"
              description="Inspect text and selections captured from the apps you selected."
            >
              <div className="desktop-context-search">
                <TextField
                  aria-label="Search desktop context"
                  value={query}
                  disabled={busy}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      event.currentTarget.parentElement?.querySelector<HTMLButtonElement>("button")?.click();
                    }
                  }}
                />
                {action(
                  "search",
                  "search",
                  query.trim() ? "Search" : "Browse sources",
                  () => loadSources(),
                  !snapshot.settings.workspaceId,
                )}
              </div>
              {searchMode && <output className="hint desktop-context-search-mode">{searchMode}</output>}
            </SettingsField>
            {!!sources.length && (
              <ul className="desktop-context-sources">
                {sources.map((item) => (
                  <li key={item.captureId}>
                    <span className="desktop-context-source-label">
                      <strong>{item.app.displayName}</strong>
                      <small>
                        {new Date(item.capturedAt).toLocaleString()} · {item.kind}
                      </small>
                    </span>
                    <div className="desktop-context-source-actions">
                      {action("read", item.captureId, "Inspect", async () => {
                        const result = await call("desktopContext.read", {
                          workspaceId: item.workspaceId,
                          captureId: item.captureId,
                          sha256: item.sha256,
                          startLine: 1,
                          limitLines: 200,
                        });
                        original();
                        setSelected(result);
                      })}
                      {action("forget", item.captureId, "Forget", async () => {
                        if (
                          !(await confirm({
                            title: "Forget this capture?",
                            description:
                              "Retire its encryption generation while preserving other saved captures. Collection will pause.",
                            confirmLabel: "Forget capture",
                          }))
                        )
                          return;
                        original();
                        apply(
                          await call("desktopContext.forget", {
                            workspaceId: item.workspaceId,
                            expectedRevision: revision(),
                            captureId: item.captureId,
                          }),
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {cursor && (
              <div className="desktop-context-pagination">
                {action("search", "more", "Load more", () => loadSources(true))}
              </div>
            )}
            {selected && (
              <article className="desktop-context-inspection" aria-label="Captured source text">
                <h4>{selected.source.windowTitle || selected.source.app.displayName}</h4>
                <p className="hint">
                  Lines {selected.startLine}–{selected.endLine} of {selected.totalLines} · expires{" "}
                  {new Date(selected.source.expiresAt).toLocaleString()}
                </p>
                {selected.source.documentUrl && <p className="hint">{selected.source.documentUrl}</p>}
                <pre tabIndex={0} aria-label="Captured text">
                  {selected.text}
                </pre>
                <div className="desktop-context-source-actions">
                  {selected.startLine > 1 &&
                    action("read", "previous-lines", "Previous lines", async () => {
                      const result = await call("desktopContext.read", {
                        workspaceId: selected.source.workspaceId,
                        captureId: selected.source.captureId,
                        sha256: selected.source.sha256,
                        startLine: Math.max(1, selected.startLine - 200),
                        limitLines: 200,
                      });
                      original();
                      setSelected(result);
                    })}
                  {selected.endLine < selected.totalLines &&
                    action("read", "next-lines", "Next lines", async () => {
                      const result = await call("desktopContext.read", {
                        workspaceId: selected.source.workspaceId,
                        captureId: selected.source.captureId,
                        sha256: selected.source.sha256,
                        startLine: selected.endLine + 1,
                        limitLines: 200,
                      });
                      original();
                      setSelected(result);
                    })}
                </div>
                {selected.selection && (
                  <>
                    <h4>Selection</h4>
                    <pre tabIndex={0} aria-label="Captured selection">
                      {selected.selection}
                    </pre>
                  </>
                )}
              </article>
            )}
            <SettingsField
              compact
              label="Forget saved context"
              description="Permanently remove saved desktop context in this Space and pause collection. Other Memory and browser history are separate."
            >
              {action(
                "forget",
                "all",
                "Forget all",
                async () => {
                  if (
                    !snapshot.settings.workspaceId ||
                    !(await confirm({
                      title: "Forget all desktop context?",
                      description:
                        "Permanently retire saved desktop context in this Space and pause collection. Other Memory and browser history are separate.",
                      confirmLabel: "Forget desktop context",
                    }))
                  )
                    return;
                  original();
                  apply(
                    await call("desktopContext.forget", {
                      workspaceId: snapshot.settings.workspaceId,
                      expectedRevision: revision(),
                    }),
                  );
                },
                !snapshot.settings.workspaceId || !snapshot.storedCount,
              )}
            </SettingsField>
          </SettingsGroup>
        </>
      )}
    </SettingsSection>
  );
}
