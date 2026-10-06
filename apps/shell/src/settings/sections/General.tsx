import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { useEffect, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import { DEFAULT_SEARCH_ENGINE } from "@aux/contracts/search-engine";
import { SettingsRow as Field, SettingsGroup, Switch } from "../../ui";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { shellIconRight } from "../../components/icons";
import { SearchEngineSetting } from "../../components/SearchEngineSetting";
import { SearchEnginesSetting, type EngineRow } from "../../components/SearchEnginesSetting";
import { DefaultBrowserSetting } from "../../components/DefaultBrowserSetting";
import { ImportDataSetting } from "../../components/ImportDataSetting";
import { SettingsField as IndexedField } from "../primitives";
import { DownloadFolderSetting } from "./DownloadFolder";
import { AboutAuxSetting } from "./AboutAux";
import { SpellCheckSetting } from "./SpellCheck";
import { StartupSetting } from "./Startup";
import { LanguagesSetting } from "./Languages";
import { PictureInPictureSetting } from "./PictureInPicture";
import { BackgroundRuntimeSetting } from "./BackgroundRuntime";
import { useFeature } from "../../use-feature";
import {
  memorySaverCyclesChanged,
  memorySaverCyclesKey,
  memorySaverSummary,
  readMemorySaverCycles,
} from "../../memory-saver-report";
import { TaskAttentionSettings } from "../../agent/TaskAttentionSettings";
import { RecoveryPackage } from "./RecoveryPackage";
import { requestOnboardingReplay } from "../../onboarding/replay";
import { RestoreBackupControls } from "./RestoreBackupControls";
import { BackupSettings } from "./BackupSettings";
import { DiagnosticsStorage } from "./DiagnosticsStorage";
import { SetupProgress } from "../../onboarding/SetupProgress";
import { nativeStatusRoleProps } from "../../ui/native-attribute-props";

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
  const connected = useStore((state) => state.connected);
  const [backupOperation, setBackupOperation] = useState<object | null>(null);
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

  return (
    <>
      <section data-settings-section="General" hidden={!active || searching || !!subview}>
        <SettingsGroup title="Browsing">
          {tabLifecycleEnabled && !bridge.privateMode && (
            <IndexedField
              compact
              label="Memory saver"
              hint="Sleep clean background tabs after they have been idle. Playing audio, unsaved work, captured media and agent work stay awake. Sleeping tabs reload when opened."
            >
              <select
                aria-label="Memory saver"
                value={String(settings.memorySaverMinutes ?? 0)}
                onChange={(event) => void onSave({ memorySaverMinutes: Number(event.target.value) })}
              >
                <option value="0">Off</option>
                <option value="1">After 1 minute</option>
                <option value="15">After 15 minutes</option>
                <option value="30">After 30 minutes</option>
                <option value="60">After 1 hour</option>
              </select>
              {memoryCycles.length > 0 && (
                <small {...nativeStatusRoleProps} aria-label="Memory saver cycle report">
                  {memorySummary.slept} {memorySummary.slept === 1 ? "tab" : "tabs"} slept in the last{" "}
                  {memoryCycles.length} cycles.
                  {memorySummary.measured > 0
                    ? ` About ${Math.round(memorySummary.estimatedSavedBytes / 1024 / 1024)} MB estimated at sleep time across ${memorySummary.measured} measured cycles; this is not current memory use.`
                    : " Memory estimate unavailable."}
                </small>
              )}
              {memoryCycles.length > 0 && (
                <details>
                  <summary>Recent Memory saver cycles</summary>
                  <ul>
                    {memoryCycles.slice(0, 10).map((cycle, index) => (
                      <li key={`${cycle.at}:${cycle.pageId}:${index}`}>
                        {new Date(cycle.at).toLocaleString()} · {cycle.site || "Tab"} ·{" "}
                        {cycle.slept
                          ? cycle.estimatedSavedBytes !== undefined
                            ? `about ${(cycle.estimatedSavedBytes / 1024 / 1024).toFixed(1)} MB estimated saved`
                            : "slept; estimate unavailable"
                          : cycle.reason || "kept awake"}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </IndexedField>
          )}
          <IndexedField label="Default browser">
            <DefaultBrowserSetting />
          </IndexedField>
          <IndexedField
            label="Set up Aux"
            hint="Replay import, model setup and your first chat. Saved work is kept."
          >
            {active && connected && <SetupProgress />}
            <button {...smallButtonProps} onClick={requestOnboardingReplay}>
              Replay setup
            </button>
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
              value={String(settings.homeEntryMode ?? "ask")}
              onChange={(event) => void onSave({ homeEntryMode: event.target.value })}
            >
              <option value="search">Search</option>
              <option value="ask">Ask</option>
            </select>
          </IndexedField>

          <IndexedField
            compact
            label="Command routing"
            hint="Choose how plain text in the command surface starts. URLs always open directly."
          >
            <select
              aria-label="Command routing"
              value={String(settings.commandRouting ?? "automatic")}
              onChange={(event) => void onSave({ commandRouting: event.target.value })}
            >
              <option value="automatic">Automatic</option>
              <option value="prefer-chat">Prefer Ask</option>
              <option value="prefer-search">Prefer Search</option>
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
              {...smallGhostButtonProps}
              data-settings-editor="Keyword engines"
              onClick={(event) => onOpenEditor("Keyword engines", event.currentTarget)}
              aria-label="Manage keyword engines"
            >
              Manage {shellIconRight}
            </button>
          </IndexedField>

          <IndexedField
            label="Import browser data"
            hint="Preview what each installed browser can share — bookmarks and folders, history, and tabs — then import what you choose. Source profiles are only ever read, never changed."
          >
            <ImportDataSetting />
          </IndexedField>
          <IndexedField
            label="Download folder"
            hint="Choose where ordinary downloads are saved. Private downloads ask for a location each time."
          >
            <DownloadFolderSetting active={active && !searching && !subview} />
          </IndexedField>
          <IndexedField label="About Aux" hint="Installed browser version and source revision.">
            <AboutAuxSetting active={active && !searching && !subview} />
          </IndexedField>
          <IndexedField label="Spell check" hint="Check spelling as you type in websites and the browser.">
            <SpellCheckSetting active={active && !searching && !subview} />
          </IndexedField>
          <IndexedField
            label="On startup"
            hint="Open a new tab, restore your previous session, or open chosen pages."
          >
            <StartupSetting active={active && !searching && !subview} />
          </IndexedField>
          <IndexedField
            label="Languages"
            hint="Choose the languages websites receive in order of preference. The app language follows macOS."
          >
            <LanguagesSetting active={active && !searching && !subview} />
          </IndexedField>
          <IndexedField
            label="Automatic picture in picture"
            hint="Control whether sites may open floating video automatically. Manual picture in picture remains available."
          >
            <PictureInPictureSetting active={active && !searching && !subview} />
          </IndexedField>
          <IndexedField
            label="Keep Aux running in the background"
            hint="Let your Profile's runtime remain available after the last browser window closes. Quit Aux to stop it."
          >
            <BackgroundRuntimeSetting active={active && !searching && !subview} />
          </IndexedField>
        </SettingsGroup>
        {!bridge.privateMode && <TaskAttentionSettings />}
        <SettingsGroup title="Data and recovery">
          <IndexedField compact label="Task data backup" hint="Create, restore, and manage local backups.">
            <button
              {...smallGhostButtonProps}
              data-settings-editor="Task data backup"
              onClick={(event) => onOpenEditor("Task data backup", event.currentTarget)}
              aria-label="Manage task data backup"
            >
              Manage {shellIconRight}
            </button>
          </IndexedField>

          <DiagnosticsStorage
            active={active && !searching && !subview}
            refreshVersion={refreshVersion}
            onIndexChange={onIndexChange}
          />
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
          <RestoreBackupControls
            active={active && !searching && subview === "Task data backup"}
            refreshVersion={refreshVersion}
            externalBusy={backupOperation !== null}
            onOperation={(token, pending) =>
              setBackupOperation((current) => (pending ? token : current === token ? null : current))
            }
          >
            {(restore) => (
              <>
                <BackupSettings
                  active={active && !searching && subview === "Task data backup"}
                  refreshVersion={refreshVersion}
                  externalBusy={backupOperation !== null}
                  restorePending={restore.status.pending}
                  onOperation={(token, pending) =>
                    setBackupOperation((current) => (pending ? token : current === token ? null : current))
                  }
                  attended={() => restore.actions}
                  restore={(item, busy) => restore.listed(item, busy)}
                />
                {restore.statusView}
                <RecoveryPackage
                  active={active && !searching && subview === "Task data backup"}
                  refreshVersion={refreshVersion}
                  pending={restore.status.pending}
                  onStaged={restore.staged}
                />
              </>
            )}
          </RestoreBackupControls>
        </Field>
      </section>
    </>
  );
}
