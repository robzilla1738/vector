import { useEffect, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import { DEFAULT_SEARCH_ENGINE } from "@aux/contracts/search-engine";
import { SettingsRow as Field, SettingsGroup, Switch } from "../../ui";
import { bridge, emptyBrowserHealthSummary, type BrowserHealthSummary } from "../../bridge";
import { call, errToast, useStore } from "../../store";
import { I } from "../../components/icons";
import { SearchEngineSetting } from "../../components/SearchEngineSetting";
import { SearchEnginesSetting, type EngineRow } from "../../components/SearchEnginesSetting";
import { DefaultBrowserSetting } from "../../components/DefaultBrowserSetting";
import { ImportDataSetting } from "../../components/ImportDataSetting";
import { MigrationImport } from "../../components/MigrationImport";
import { SettingsField as IndexedField } from "../primitives";
import { DownloadFolderSetting } from "./DownloadFolder";
import { AboutAuxSetting } from "./AboutAux";
import { SpellCheckSetting } from "./SpellCheck";
import { StartupSetting } from "./Startup";
import { LanguagesSetting } from "./Languages";
import { PictureInPictureSetting } from "./PictureInPicture";
import { BackgroundRuntimeSetting } from "./BackgroundRuntime";
import { useFeature } from "../../use-feature";
import { memorySaverCyclesChanged, memorySaverCyclesKey, memorySaverSummary, readMemorySaverCycles } from "../../memory-saver-report";
import { TaskAttentionSettings } from "../../agent/TaskAttentionSettings";
import { RecoveryPackage } from "./RecoveryPackage";
import { requestOnboardingReplay } from "../../onboarding/replay";

export function GeneralSettings({
  active,
  searching,
  subview,
  settings,
  onSave,
  onOpenEditor,
  editorViews,
  refreshVersion,
  onIndexChange,
}: {
  active: boolean;
  searching: boolean;
  subview: string | null;
  settings: Record<string, unknown>;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
  onOpenEditor: (name: string, origin: HTMLButtonElement) => void;
  editorViews: RefObject<Map<string, HTMLElement>>;
  refreshVersion: number;
  onIndexChange: Dispatch<SetStateAction<number>>;
}) {
  const [dataDir, setDataDir] = useState("");
  const [diagnosticsBusy, setDiagnosticsBusy] = useState(false);
  const [diagnosticsMessage, setDiagnosticsMessage] = useState("");
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupMessage, setBackupMessage] = useState("");
  const [restoreStatus, setRestoreStatus] = useState<{ pending: boolean; lastAppliedAt?: number }>({
    pending: false,
  });
  const [backups, setBackups] = useState<
    {
      path: string;
      name: string;
      sha256: string;
      createdAt: number;
      bytes: number;
      schemaVersion: number;
      artifactFiles: number;
      missingArtifacts: number;
    }[]
  >([]);
  const [deleteBackupName, setDeleteBackupName] = useState<string | null>(null);
  const [backupKeep, setBackupKeep] = useState<3 | 5 | 10 | 20>(10);
  const [health, setHealth] = useState<BrowserHealthSummary>(() => emptyBrowserHealthSummary());
  const [healthBusy, setHealthBusy] = useState(false);
  const tabLifecycleEnabled = useFeature("tabLifecycle");
  const [memoryCycles, setMemoryCycles] = useState(readMemorySaverCycles);
  const memorySummary = memorySaverSummary(memoryCycles);

  useEffect(() => {
    const update = () => setMemoryCycles(readMemorySaverCycles());
    const updateFromStorage = (event: StorageEvent) => {
      if (event.key === memorySaverCyclesKey) update();
    };
    window.addEventListener(memorySaverCyclesChanged, update);
    window.addEventListener("storage", updateFromStorage);
    return () => {
      window.removeEventListener(memorySaverCyclesChanged, update);
      window.removeEventListener("storage", updateFromStorage);
    };
  }, []);

  useEffect(() => {
    if (searching || !active) return;
    let live = true;
    void bridge
      .dataDir()
      .then((value) => {
        if (live) setDataDir(value);
      })
      .catch((error) => {
        if (live) errToast(error);
      });
    void bridge
      .runtimeRestoreStatus()
      .then((value) => {
        if (live) setRestoreStatus(value);
      })
      .catch(() => {});
    void call("installation.listBackups", {})
      .then((value) => {
        if (live) setBackups(value);
      })
      .catch(() => {});
    void call("installation.backupRetention", {})
      .then((value) => {
        if (live) setBackupKeep(value.keep as 3 | 5 | 10 | 20);
      })
      .catch(() => {});
    void bridge
      .healthSummary()
      .then((value) => {
        if (live) setHealth(value);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [active, searching, refreshVersion]);

  useEffect(() => {
    onIndexChange((value) => value + 1);
  }, [dataDir, health, onIndexChange]);

  return (
    <>
      <section data-settings-section="General" hidden={!active || searching || !!subview}>
        <SettingsGroup title="Browsing">
          {tabLifecycleEnabled && !bridge.privateMode && <IndexedField compact label="Memory saver" hint="Sleep clean background tabs after they have been idle. Playing audio, unsaved work, captured media and agent work stay awake. Sleeping tabs reload when opened.">
            <select aria-label="Memory saver" value={String(settings.memorySaverMinutes ?? 0)} onChange={event => void onSave({ memorySaverMinutes: Number(event.target.value) })}>
              <option value="0">Off</option>
              <option value="1">After 1 minute</option>
              <option value="15">After 15 minutes</option>
              <option value="30">After 30 minutes</option>
              <option value="60">After 1 hour</option>
            </select>
            {memoryCycles.length > 0 && <small role="status" aria-label="Memory saver cycle report">
              {memorySummary.slept} {memorySummary.slept === 1 ? "tab" : "tabs"} slept in the last {memoryCycles.length} cycles.
              {memorySummary.measured > 0 ? ` About ${Math.round(memorySummary.estimatedSavedBytes / 1024 / 1024)} MB estimated at sleep time across ${memorySummary.measured} measured cycles; this is not current memory use.` : " Memory estimate unavailable."}
            </small>}
            {memoryCycles.length > 0 && <details><summary>Recent Memory saver cycles</summary><ul>
              {memoryCycles.slice(0, 10).map((cycle, index) => <li key={`${cycle.at}:${cycle.pageId}:${index}`}>
                {new Date(cycle.at).toLocaleString()} · {cycle.site || "Tab"} · {cycle.slept
                  ? cycle.estimatedSavedBytes !== undefined
                    ? `about ${(cycle.estimatedSavedBytes / 1024 / 1024).toFixed(1)} MB estimated saved`
                    : "slept; estimate unavailable"
                  : cycle.reason || "kept awake"}
              </li>)}
            </ul></details>}
          </IndexedField>}
          <IndexedField label="Default browser">
            <DefaultBrowserSetting />
          </IndexedField>
          <IndexedField label="Set up Aux" hint="Replay import, model setup and your first chat. Saved work is kept.">
            <button className="btn sm" onClick={requestOnboardingReplay}>Replay setup</button>
          </IndexedField>

          <IndexedField compact label="Search engine">
            <SearchEngineSetting
              value={(settings.searchEngine as string) ?? DEFAULT_SEARCH_ENGINE}
              onSave={(searchEngine) => onSave({ searchEngine })}
            />
          </IndexedField>

          <IndexedField
            compact
            label="New tab mode"
            hint="Choose whether a new tab starts with Search or the Ask composer. Private windows always start with Search."
          >
            <select
              aria-label="New tab mode"
              value={String(settings.homeEntryMode ?? "search")}
              onChange={(event) => void onSave({ homeEntryMode: event.target.value })}
            >
              <option value="search">Search</option>
              <option value="ask">Ask</option>
            </select>
          </IndexedField>

          <IndexedField
            compact
            label="Search suggestions"
            hint="Show suggestions from your search engine as you type. Typed text is only sent when it doesn’t look like a private or local address, and never in Private mode."
          >
            <Switch
              aria-label="Show search suggestions in the address bar"
              checked={Boolean(settings.searchSuggestions)}
              onChange={(event) => void onSave({ searchSuggestions: event.target.checked })}
            />
          </IndexedField>

          <IndexedField
            compact
            label="Keyword engines"
            hint="Manage shortcuts for searching individual sites."
          >
            <button
              className="btn sm ghost"
              data-settings-editor="Keyword engines"
              onClick={(event) => onOpenEditor("Keyword engines", event.currentTarget)}
              aria-label="Manage keyword engines"
            >
              Manage {I.right}
            </button>
          </IndexedField>

          <IndexedField
            label="Import browser data"
            hint="Preview what each installed browser can share — bookmarks and folders, history, and live tabs from an attached Chrome — then import what you choose. Source profiles are only ever read, never changed."
          >
            <ImportDataSetting />
          </IndexedField>
          <IndexedField label="Download folder" hint="Choose where ordinary downloads are saved. Private downloads ask for a location each time.">
            <DownloadFolderSetting active={active && !searching && !subview} />
          </IndexedField>
          <IndexedField label="About Aux" hint="Installed browser version and source revision.">
            <AboutAuxSetting active={active && !searching && !subview} />
          </IndexedField>
          <IndexedField label="Spell check" hint="Check spelling as you type in websites and the browser.">
            <SpellCheckSetting active={active && !searching && !subview} />
          </IndexedField>
          <IndexedField label="On startup" hint="Open a new tab, restore your previous session, or open chosen pages.">
            <StartupSetting active={active && !searching && !subview} />
          </IndexedField>
          <IndexedField label="Languages" hint="Choose the languages websites receive in order of preference. The app language follows macOS.">
            <LanguagesSetting active={active && !searching && !subview} />
          </IndexedField>
          <IndexedField label="Automatic picture in picture" hint="Control whether sites may open floating video automatically. Manual picture in picture remains available.">
            <PictureInPictureSetting active={active && !searching && !subview} />
          </IndexedField>
          <IndexedField label="Keep Aux running in the background" hint="Let your Profile's runtime remain available after the last browser window closes. Quit Aux to stop it.">
            <BackgroundRuntimeSetting active={active && !searching && !subview} />
          </IndexedField>
        </SettingsGroup>
        {!bridge.privateMode && <TaskAttentionSettings />}
        <SettingsGroup title="Data and recovery">
          <IndexedField compact label="Task data backup" hint="Create, restore, and manage local backups.">
            <button
              className="btn sm ghost"
              data-settings-editor="Task data backup"
              onClick={(event) => onOpenEditor("Task data backup", event.currentTarget)}
              aria-label="Manage task data backup"
            >
              Manage {I.right}
            </button>
          </IndexedField>

          <details className="settings-advanced">
            <summary>Diagnostics & storage</summary>
            {dataDir && (
              <IndexedField label="Data directory">
                <div className="row">
                  <span className="hint mono selectable grow">{dataDir}</span>
                  <button
                    className="btn sm"
                    onClick={() =>
                      void bridge
                        .revealPath(dataDir)
                        .then((ok) => {
                          if (!ok)
                            throw new Error(
                              "The data directory is unavailable. Try again after the runtime starts.",
                            );
                        })
                        .catch(errToast)
                    }
                  >
                    Reveal
                  </button>
                </div>
              </IndexedField>
            )}

            <IndexedField
              label="Browser health"
              hint={
                health.samples
                  ? `${health.sevenDaySpan ? "Seven-day span recorded" : `${health.spanDays.toFixed(1)} of 7 days recorded`} · ${Math.round(health.observedMinutes / 60)} hours while Aux was open · ${health.sessions} sessions · browser process memory p95 ${Math.round(health.memoryMb.p95)} MB · CPU p95 ${health.cpuPercent.p95.toFixed(1)}% · UI scheduling delay p95 ${Math.round(health.eventLoopLagMs.p95)} ms · since last Clear: ${health.pageCrashes} page crashes, ${health.pageUnresponsive} page hangs · up to ${health.maxPages} tabs. Samples and counts stay on this device and contain no URLs or page content.`
                  : "Aux records local browser process CPU and memory, UI scheduling delay, window and tab counts, and page crashes and hangs while open. It never records URLs or page content."
              }
            >
              <div className="row">
                <span className="hint grow">
                  {health.samples
                    ? `${health.samples.toLocaleString()} private samples${health.startupMs != null ? ` · typical startup ${health.startupMs} ms` : ""}`
                    : "Recording begins during this session."}
                </span>
                <button
                  className="btn sm ghost danger"
                  disabled={healthBusy || !health.samples}
                  onClick={() => {
                    setHealthBusy(true);
                    void bridge
                      .clearHealth()
                      .then(setHealth)
                      .catch(errToast)
                      .finally(() => setHealthBusy(false));
                  }}
                >
                  {healthBusy ? "Clearing…" : "Clear"}
                </button>
              </div>
            </IndexedField>

            <IndexedField
              label="Support report"
              hint="Exports the browser build, available host method count, aggregate browser health, nonsecret modes, and known limits. It excludes credentials, URLs, browsing history, task text, account identity, local paths, and content."
            >
              <div className="row">
                <button
                  className="btn sm"
                  disabled={diagnosticsBusy}
                  onClick={() => {
                    setDiagnosticsBusy(true);
                    setDiagnosticsMessage("");
                    void bridge
                      .exportDiagnostics()
                      .then((path) =>
                        setDiagnosticsMessage(path ? "Support report saved." : "Export cancelled."),
                      )
                      .catch((error) =>
                        setDiagnosticsMessage(error instanceof Error ? error.message : String(error)),
                      )
                      .finally(() => setDiagnosticsBusy(false));
                  }}
                >
                  {diagnosticsBusy ? "Preparing…" : "Export support report…"}
                </button>
                {diagnosticsMessage && <output className="hint">{diagnosticsMessage}</output>}
              </div>
            </IndexedField>
          </details>
        </SettingsGroup>
      </section>
      <section
        className="settings-editor-view"
        tabIndex={-1}
        aria-label="Keyword engines"
        ref={(node) => {
          if (node) editorViews.current.set("Keyword engines", node);
          else editorViews.current.delete("Keyword engines");
        }}
        hidden={searching || !active || subview !== "Keyword engines"}
      >
        <Field label="Keyword engines" hint="Search a site directly by typing its keyword first.">
          <SearchEnginesSetting
            value={(settings.searchEngines as EngineRow[]) ?? []}
            onSave={(searchEngines) => onSave({ searchEngines })}
          />
        </Field>
      </section>
      <section
        className="settings-editor-view"
        tabIndex={-1}
        aria-label="Task data backup"
        ref={(node) => {
          if (node) editorViews.current.set("Task data backup", node);
          else editorViews.current.delete("Task data backup");
        }}
        hidden={searching || !active || subview !== "Task data backup"}
      >
        <Field
          label="Task data backup"
          hint="Backs up chats, tasks, Spaces, saved evidence, browsing records and preferences. New portable backups omit protected articles, selected-article answers, reports, and site grants. After Forget, older Aux-managed backups cannot be restored; create a fresh backup. Copies exported outside Aux remain under your control and cannot be revoked. Sign-ins, credentials, extensions, downloads, project files and cloud resources are not included. Chromium Cookies, Login Data, Web Data and other credential stores are never copied. Backups contain private content; keep them somewhere secure. Oldest complete backups are deleted after a new backup. Incomplete folders without a manifest are skipped. A process kill during backup leaves an incomplete folder that Aux ignores."
        >
          <div className="row">
            <button
              className="btn sm"
              disabled={backupBusy}
              onClick={() => {
                setBackupBusy(true);
                setBackupMessage("");
                void bridge
                  .exportRuntimeBackup()
                  .then((result) => {
                    setBackupMessage(
                      result
                        ? `Backup saved · ${result.artifactFiles} artifact files${result.missingArtifacts ? ` · ${result.missingArtifacts} unavailable` : ""} · ${result.bytes} bytes`
                        : "Backup cancelled.",
                    );
                    return call("installation.listBackups", {});
                  })
                  .then((value) => {
                    if (Array.isArray(value)) setBackups(value as typeof backups);
                  })
                  .catch((error) => setBackupMessage(error instanceof Error ? error.message : String(error)))
                  .finally(() => setBackupBusy(false));
              }}
            >
              {backupBusy ? "Preparing…" : "Create backup…"}
            </button>
            <button
              className="btn sm"
              disabled={backupBusy || restoreStatus.pending}
              onClick={() => {
                setBackupBusy(true);
                setBackupMessage("");
                void bridge
                  .stageRuntimeRestore()
                  .then((result) => {
                    if (result) {
                      setRestoreStatus((current) => ({ ...current, pending: true }));
                      setBackupMessage(
                        `Restore staged with ${result.artifactFiles} artifact files${result.missingArtifacts ? `; ${result.missingArtifacts} were unavailable when the backup was created` : ""}. Quit Aux normally and reopen it to apply.`,
                      );
                    } else setBackupMessage("Restore cancelled.");
                  })
                  .catch((error) => setBackupMessage(error instanceof Error ? error.message : String(error)))
                  .finally(() => setBackupBusy(false));
              }}
            >
              Restore backup…
            </button>
            {restoreStatus.pending && (
              <button
                className="btn sm"
                disabled={backupBusy}
                onClick={() => {
                  setBackupBusy(true);
                  void bridge
                    .cancelRuntimeRestore()
                    .then(() => {
                      setRestoreStatus((current) => ({ ...current, pending: false }));
                      setBackupMessage("Pending restore cancelled.");
                    })
                    .catch((error) =>
                      setBackupMessage(error instanceof Error ? error.message : String(error)),
                    )
                    .finally(() => setBackupBusy(false));
                }}
              >
                Cancel pending restore
              </button>
            )}
          </div>
          {!(
            typeof window !== "undefined" &&
            Boolean((window as Window & { auxHostProof?: unknown }).auxHostProof)
          ) && (
            <div className="row">
              <button
                className="btn sm ghost"
                disabled={backupBusy}
                onClick={() => {
                  setBackupBusy(true);
                  setBackupMessage("");
                  void bridge
                    .exportMigrationLayout(JSON.stringify(useStore.getState().layout))
                    .then((result) =>
                      setBackupMessage(
                        result ? `Migration layout saved to ${result.path}` : "Layout export cancelled.",
                      ),
                    )
                    .catch((error) =>
                      setBackupMessage(error instanceof Error ? error.message : String(error)),
                    )
                    .finally(() => setBackupBusy(false));
                }}
              >
                Export layout for Chromium migration…
              </button>
            </div>
          )}
          {typeof window !== "undefined" &&
            Boolean((window as Window & { auxHostProof?: unknown }).auxHostProof) && <MigrationImport />}
          <label>
            Keep complete backups
            <select
              aria-label="Backup retention"
              value={backupKeep}
              disabled={backupBusy}
              onChange={(event) => {
                const keep = Number(event.target.value) as 3 | 5 | 10 | 20;
                setBackupBusy(true);
                void call("installation.setBackupRetention", { keep })
                  .then((value) => setBackupKeep(value.keep as 3 | 5 | 10 | 20))
                  .catch((error) => setBackupMessage(error instanceof Error ? error.message : String(error)))
                  .finally(() => setBackupBusy(false));
              }}
            >
              {([3, 5, 10, 20] as const).map((keep) => (
                <option key={keep} value={keep}>
                  Keep {keep}
                </option>
              ))}
            </select>
          </label>
          {backups.length > 0 && (
            <details>
              <summary>
                {backups.length} local backup{backups.length === 1 ? "" : "s"}
              </summary>
              {backups.map((item) => (
                <div className="hint" key={item.path}>
                  {new Date(item.createdAt).toLocaleString()} · schema {item.schemaVersion} ·{" "}
                  {item.artifactFiles} artifacts
                  {item.missingArtifacts ? ` · ${item.missingArtifacts} unavailable` : ""}
                  <button
                    className="btn sm"
                    disabled={backupBusy || restoreStatus.pending}
                    onClick={() => {
                      setBackupBusy(true);
                      setBackupMessage("");
                      void call("installation.stageRestore", { path: item.path })
                        .then((result) => {
                          setRestoreStatus((current) => ({ ...current, pending: true }));
                          setBackupMessage(
                            `Restore staged from ${item.name}. Quit Aux normally and reopen it to apply.`,
                          );
                          return result;
                        })
                        .catch((error) =>
                          setBackupMessage(error instanceof Error ? error.message : String(error)),
                        )
                        .finally(() => setBackupBusy(false));
                    }}
                  >
                    Restore this backup
                  </button>
                  {deleteBackupName === item.name ? (
                    <>
                      <span>Delete this local backup?</span>
                      <button
                        className="btn sm"
                        disabled={backupBusy || restoreStatus.pending}
                        onClick={() => {
                          setBackupBusy(true);
                          setBackupMessage("");
                          void call("installation.deleteBackup", {
                            name: item.name,
                            expectedSha256: item.sha256,
                          })
                            .then(() => call("installation.listBackups", {}))
                            .then((value) => {
                              setBackups(value);
                              setDeleteBackupName(null);
                              setBackupMessage("Local backup deleted.");
                            })
                            .catch((error) =>
                              setBackupMessage(error instanceof Error ? error.message : String(error)),
                            )
                            .finally(() => setBackupBusy(false));
                        }}
                      >
                        Delete backup
                      </button>
                      <button
                        className="btn sm ghost"
                        disabled={backupBusy}
                        onClick={() => setDeleteBackupName(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn sm ghost"
                      disabled={backupBusy || restoreStatus.pending}
                      onClick={() => setDeleteBackupName(item.name)}
                    >
                      Delete…
                    </button>
                  )}
                </div>
              ))}
            </details>
          )}
          {restoreStatus.pending && (
            <output className="hint">
              A restore is staged for the next launch. Changes made before quitting will be replaced.
            </output>
          )}
          {restoreStatus.lastAppliedAt && (
            <span className="hint">
              Last restored {new Date(restoreStatus.lastAppliedAt).toLocaleString()}. Aux kept a private
              recovery snapshot of the prior runtime database.
            </span>
          )}
          {backupMessage && <output className="hint">{backupMessage}</output>}
          <RecoveryPackage pending={restoreStatus.pending}
            onStaged={() => setRestoreStatus(current => ({ ...current, pending: true }))} />
        </Field>
      </section>
    </>
  );
}
