// Browser and liquid-glass journeys against a built Aux.app, without a
// public DevTools port. The runtime bearer is read only from this run's fresh
// Profile and is never included in artifacts.
import assert from "node:assert/strict";
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID, scryptSync } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { createServer as createTcpServer } from "node:net";
import { DatabaseSync } from "node:sqlite";
import { createRequire } from "node:module";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, isAbsolute, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import JSZip from "jszip";
import { openDb } from "@aux/runtime";

const root = resolve(import.meta.dirname, "../..");
const journeys = [
  "Authenticated native runtime and no public debugging port",
  "Two real local pages, observation, action and human takeover",
  "Identical-URL tabs and parallel actions on background pages",
  "Native Find counts, direction and zoom on real pages",
  "Keyboard tab switching in vertical and horizontal layouts",
  "Vertical expanded, collapsed and floating liquid-glass sidebar with Escape dismissal",
  "Horizontal tabs, Profile layout preference and accessible address focus",
  "Site controls permission reset, cookie and localStorage clearing",
  "Overview tab audio mute and unmute",
  "Overview duplicate selection keeps a tab with edited form data",
  "Completed disposable download opens and reveals through the native file handoff",
  "HTTP Basic Auth prompt signs in to a disposable loopback fixture",
  "Chromium password offer appears in Aux and saves to a disposable Profile",
  "Encrypted Aux password import and export use Chromium's disposable Profile store",
  "Password fill refuses an insecure disposable sign-in page without exposing credentials",
  "Chromium personal info fills a disposable form only on an allowed origin",
  "Native link hover exposes its destination in the owning Aux window",
  "Overview shows a native thumbnail for a background tab",
  "Native back-history menu returns to the prior page",
  "Native shell context menu reloads the selected page",
  "Native shell context menu opens a page-scoped summary draft",
  "Chromium DOM distiller prepares a safe Reader view",
  "Native page translation sends visible text to a loopback model and restores originals",
  "Native macOS color eyedropper returns a sampled color",
  "Library exports bookmarks through the native save dialog",
  "Native workbook export saves a parseable Excel file",
  "Native stored artifact export copies the selected bytes",
  "Scoped external agent connection creates and revokes through the native host",
  "Native navigation failure and recovery on a disposable local page",
  "Native certificate recovery on a disposable loopback TLS page",
  "Native HTTPS upgrade fallback on a disposable mapped local page",
  "Chromium default HTTPS warning on a disposable mapped local page",
  "Private browser health and support report export",
  "Unpacked extension install and update in a disposable Profile",
  "Native runtime backup, staged restore, and private recovery on restart",
];
const option = name => {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
};
if (process.argv.includes("--list")) {
  console.log(JSON.stringify({ journeys, command: "node tests/host/native-app-journeys.mjs --app /absolute/path/to/Aux.app [--output /absolute/new/directory] [--rpc-only | --ui-only | --protected-startup | --browser-import-ui | --browser-import-formats | --browser-import-attached | --link-peek | --space-theme | --space-theme-advanced | --reader-peek | --tab-preview-focus | --tab-name-ui | --downloads | --site-controls | --tab-audio | --unsaved-work | --file-handoff | --http-auth | --http-auth-cancel | --reader | --translation | --eyedropper | --file-io | --workbook-export | --artifact-export | --agent-connections | --page-action | --profiles | --profile-confirmation | --popover | --menu-primitives | --toast-primitives | --selector-bookmark | --selector-site-permissions | --selector-context | --selector-downloads | --selector-results | --selector-task-resources | --selector-search | --selector-closed | --selector-reading | --quick-ask-focus | --settings-focus | --settings-search | --settings-route | --settings-internal-url | --settings-section-rail | --agent-grants | --privacy-history-panel | --settings-focus-jump | --library-focus | --appearance-prefs | --search-engine-prefs | --edge-leeway | --navigation-recovery | --certificate-recovery | --http-fallback | --http-fallback-dialog]", downloads: "--downloads needs an operator to open the panel, cancel, retry, choose the printed disposable folder, and restore the default while the harness asserts each state", siteControls: "--site-controls needs an operator to open site controls, clear the disposable fixture's website data, reset its seeded blocked notification decision, and close the dialog before the storage check", tabAudio: "--tab-audio needs an operator to open Tab overview and select the disposable fixture tab; the harness checks mute and unmute", unsavedWork: "--unsaved-work needs an operator to open Tab overview and press Select duplicates; the harness checks that the edited fixture tab is kept", fileHandoff: "--file-handoff needs an operator to open Downloads; the harness opens and reveals a disposable text file", httpAuth: "--http-auth needs an operator to enter fixture-user / fixture-pass in the Aux sign-in prompt; the harness verifies the protected page loads", httpAuthCancel: "--http-auth-cancel needs an operator to cancel the disposable challenge; the harness verifies no protected content loads", preview: "--preview needs an operator to open Tab overview; the harness checks a captured background tab thumbnail", navigationMenu: "--navigation-menu needs an operator to focus Back, press ArrowDown, and choose the Red history entry", contextMenu: "--context-menu needs an operator to open the shell context menu and choose Reload", pageAction: "--page-action needs an operator to choose Summarize page from the native shell context menu", reader: "--reader needs an operator to open Reader view for a local article", eyeDropper: "--eyedropper needs an operator to select a color with the macOS sampler", fileIo: "--file-io needs an operator to export the fixture bookmark through Library to the printed path", workbookExport: "--workbook-export needs an operator to invoke the Aux shell workbook method and save to the printed path", artifactExport: "--artifact-export needs an operator to create a disposable stored image and save it through the Aux shell method", agentConnections: "--agent-connections needs an operator to create and revoke a disposable scoped connection through the Aux native shell", profiles: "--profiles needs an operator to create, rename, archive, restore, and explicitly delete only the generated disposable Profile", profileConfirmation: "--profile-confirmation checks a named native delete confirmation and cancellation without deleting the disposable Profile", popover: "--popover checks browser-context search, choices and Escape dismissal in a disposable chat", menuPrimitives: "--menu-primitives checks shared vertical Space and Browser tools menus with Escape dismissal in a disposable Profile", toastPrimitives: "--toast-primitives checks the no-data autofill info Toast and its timed dismissal in a disposable Profile", selectorBookmark: "--selector-bookmark checks add/remove toolbar state on a disposable local page", selectorSitePermissions: "--selector-site-permissions checks open-site selection in Aux Settings on a disposable local page", selectorContext: "--selector-context checks the open-tab choices in a disposable conversation", selectorDownloads: "--selector-downloads checks live progress, cancel, and retry in a disposable download shelf", selectorResults: "--selector-results checks the disposable set-results table surface", selectorTaskResources: "--selector-task-resources checks a task page reference after local navigation", selectorSearch: "--selector-search checks that a background local tab appears as a live search suggestion", selectorClosed: "--selector-closed checks a disposable closed tab in Library", selectorReading: "--selector-reading checks two disposable Reading List rows and a read-state change", quickAskFocus: "--quick-ask-focus checks the composer receives focus in the disposable Quick Ask window", settingsFocus: "--settings-focus checks Settings category, search result, and search-field focus in a disposable Profile", settingsSearch: "--settings-search checks Plugins, Google Calendar, and a generated Appearance field in Settings search", settingsRoute: "--settings-route checks native Settings section navigation", settingsInternalUrl: "--settings-internal-url checks an internal Settings URL stays in the top shell", settingsSectionRail: "--settings-section-rail checks three available grouped Settings destinations", agentGrants: "--agent-grants checks a disposable Write grant on and off", privacyHistoryPanel: "--privacy-history-panel checks the clear-history control is in Privacy & Security and cancellation leaves history intact", settingsFocusJump: "--settings-focus-jump checks one indexed search destination", libraryFocus: "--library-focus checks Library search-to-bookmark focus in a disposable Profile", appearancePrefs: "--appearance-prefs needs an operator to choose a light theme and title-bar material in a disposable Profile", searchEnginePrefs: "--search-engine-prefs checks a disposable search engine choice across restart", edgeLeeway: "--edge-leeway automatically checks native floating-sidebar entry and exit leeway over a guest page" }, null, 2));
  process.exit(0);
}
if (process.platform !== "darwin") throw new Error("Native Aux.app journeys require macOS.");
const appArg = option("--app");
if (!appArg || !isAbsolute(appArg)) throw new Error("Pass --app /absolute/path/to/Aux.app.");
const requireDependency = createRequire(join(root, "package.json"));
const app = realpathSync(appArg);
assert.equal(basename(app), "Aux.app", "Use the native Aux.app bundle");
const binary = join(app, "Contents/MacOS/Aux");
const helper = join(app, "Contents/Helpers/Aux Runtime");
assert.ok(existsSync(binary) && existsSync(helper), "Aux browser and runtime helper must both be packaged");
const bundleId = execFileSync("/usr/libexec/PlistBuddy", ["-c", "Print :CFBundleIdentifier", join(app, "Contents/Info.plist")], { encoding: "utf8" }).trim();
assert.equal(bundleId, "dev.aux.browser", "The native journey must target the Aux identity");
const rpcOnly = process.argv.includes("--rpc-only");
const uiOnly = process.argv.includes("--ui-only");
const submitConfirmation = process.argv.includes("--submit-confirmation");
const webmcpJourney = process.argv.includes("--webmcp");
const paintLease = process.argv.includes("--paint-lease");
const shellEvents = process.argv.includes("--shell-events");
const downloadsJourney = process.argv.includes("--downloads");
const selectorDownloadsJourney = process.argv.includes("--selector-downloads");
const selectorResultsJourney = process.argv.includes("--selector-results");
const selectorTaskResourcesJourney = process.argv.includes("--selector-task-resources");
const selectorSearchJourney = process.argv.includes("--selector-search");
const splitViewJourney = process.argv.includes("--split-view");
const linkPeekJourney = process.argv.includes("--link-peek");
const spaceThemeJourney = process.argv.includes("--space-theme");
const spaceThemeAdvancedJourney = process.argv.includes("--space-theme-advanced");
const readerPeekJourney = process.argv.includes("--reader-peek");
const tabPreviewFocusJourney = process.argv.includes("--tab-preview-focus");
const tabNameJourney = process.argv.includes("--tab-name-ui");
const selectorClosedJourney = process.argv.includes("--selector-closed");
const selectorReadingJourney = process.argv.includes("--selector-reading");
const siteControlsJourney = process.argv.includes("--site-controls");
const tabAudioJourney = process.argv.includes("--tab-audio");
const unsavedWorkJourney = process.argv.includes("--unsaved-work");
const fileHandoffJourney = process.argv.includes("--file-handoff");
const httpAuthJourney = process.argv.includes("--http-auth");
const httpAuthCancelJourney = process.argv.includes("--http-auth-cancel");
const passwordOfferJourney = process.argv.includes("--password-offer");
const passwordPromptJourney = process.argv.includes("--password-offer-prompt");
const passwordFillBoundaryJourney = process.argv.includes("--password-fill-boundary");
const passwordTransferJourney = process.argv.includes("--password-transfer");
const autofillJourney = process.argv.includes("--autofill");
const linkStatusJourney = process.argv.includes("--link-status");
const previewJourney = process.argv.includes("--preview");
const navigationMenuJourney = process.argv.includes("--navigation-menu");
const contextMenuJourney = process.argv.includes("--context-menu");
const pageActionJourney = process.argv.includes("--page-action");
const readerJourney = process.argv.includes("--reader");
const translationJourney = process.argv.includes("--translation");
const eyeDropperJourney = process.argv.includes("--eyedropper");
const fileIoJourney = process.argv.includes("--file-io");
const workbookExportJourney = process.argv.includes("--workbook-export");
const artifactExportJourney = process.argv.includes("--artifact-export");
const agentConnectionsJourney = process.argv.includes("--agent-connections");
const outboundMcpLocalJourney = process.argv.includes("--outbound-mcp-local");
const outboundMcpSettingsJourney = process.argv.includes("--outbound-mcp-settings");
const goalsUiJourney = process.argv.includes("--goals-ui");
const goalsThreadUiJourney = process.argv.includes("--goals-thread-ui");
const goalsStatusUiJourney = process.argv.includes("--goals-status-ui");
const commandEscalationUiJourney = process.argv.includes("--command-escalation-ui");
const hooksUiJourney = process.argv.includes("--hooks-ui");
const hooksStartUiJourney = process.argv.includes("--hooks-start-ui");
const hooksCommandUiJourney = process.argv.includes("--hooks-command-ui");
const workspacesUiJourney = process.argv.includes("--workspaces-ui");
const memoryInboxUiJourney = process.argv.includes("--memory-inbox-ui");
const memoryPreviewUiJourney = process.argv.includes("--memory-preview-ui");
const browserImportUiJourney = process.argv.includes("--browser-import-ui");
const browserImportFormatsJourney = process.argv.includes("--browser-import-formats");
const browserImportAttachedJourney = process.argv.includes("--browser-import-attached");
const protectedStartupJourney = process.argv.includes("--protected-startup");
const receiptBeforeUiJourney = process.argv.includes("--receipt-before-ui");
const receiptUndoUiJourney = process.argv.includes("--receipt-undo-ui");
const receiptRunUndoUiJourney = process.argv.includes("--receipt-run-undo-ui");
const receiptBookmarkUiJourney = process.argv.includes("--receipt-bookmark-undo-ui");
const receiptDownloadUiJourney = process.argv.includes("--receipt-download-ui");
const receiptHistoryUiJourney = process.argv.includes("--receipt-history-ui");
const tidyReceiptJourney = process.argv.includes("--tidy-receipt-restart");
const archiveTabsJourney = process.argv.includes("--archive-tabs-ui");
const tabSleepJourney = process.argv.includes("--tab-sleep-ui");
const memorySaverJourney = process.argv.includes("--memory-saver-ui");
const memorySaverRestartJourney = process.argv.includes("--memory-saver-restart");
const profilesJourney = process.argv.includes("--profiles");
const profileConfirmationJourney = process.argv.includes("--profile-confirmation");
const popoverJourney = process.argv.includes("--popover");
const menuPrimitivesJourney = process.argv.includes("--menu-primitives");
const toastPrimitivesJourney = process.argv.includes("--toast-primitives");
const selectorBookmarkJourney = process.argv.includes("--selector-bookmark");
const selectorSitePermissionsJourney = process.argv.includes("--selector-site-permissions");
const selectorContextJourney = process.argv.includes("--selector-context");
const quickAskFocusJourney = process.argv.includes("--quick-ask-focus");
const settingsFocusJourney = process.argv.includes("--settings-focus");
const settingsSearchJourney = process.argv.includes("--settings-search");
const settingsRouteJourney = process.argv.includes("--settings-route");
const settingsInternalUrlJourney = process.argv.includes("--settings-internal-url");
const settingsSectionRailJourney = process.argv.includes("--settings-section-rail");
const settingsPasswordsJourney = process.argv.includes("--settings-passwords-autofill");
const settingsModelsJourney = process.argv.includes("--settings-models");
const settingsUsageJourney = process.argv.includes("--settings-usage-budgets");
const settingsAutomationsJourney = process.argv.includes("--settings-automations");
const settingsAutomationsCreateJourney = process.argv.includes("--settings-automations-create");
const settingsAutomationsWakeJourney = process.argv.includes("--settings-automations-wake");
const settingsAutomationsFireJourney = process.argv.includes("--settings-automations-fire");
const settingsAutomationsPageChangeJourney = process.argv.includes("--settings-automations-page-change");
const settingsAutomationsNotificationJourney = process.argv.includes("--settings-automations-notification");
const settingsAutomationsCalendarJourney = process.argv.includes("--settings-automations-calendar");
const settingsAutomationsSuggestionsJourney = process.argv.includes("--settings-automations-suggestions");
const settingsAutomationsPresenceJourney = process.argv.includes("--settings-automations-presence");
const settingsAutomationsDstJourney = process.argv.includes("--settings-automations-dst");
const skillActivationReviewJourney = process.argv.includes("--skill-activation-review");
const skillExternalTaskReviewJourney = process.argv.includes("--skill-external-task-review");
const skillImportedReadinessJourney = process.argv.includes("--skill-imported-readiness");
const settingsNewTabJourney = process.argv.includes("--settings-new-tab-mode");
const settingsArchivedJourney = process.argv.includes("--settings-archived-chats");
const settingsGeneralJourney = process.argv.includes("--settings-general-extraction");
const settingsDownloadFolderJourney = process.argv.includes("--settings-download-folder");
const settingsAboutJourney = process.argv.includes("--settings-about-aux");
const settingsSpellCheckJourney = process.argv.includes("--settings-spell-check");
const settingsQualifiedRailJourney = process.argv.includes("--settings-qualified-rail");
const settingsStartupJourney = process.argv.includes("--settings-startup");
const settingsLanguagesJourney = process.argv.includes("--settings-languages");
const settingsPipJourney = process.argv.includes("--settings-picture-in-picture");
const settingsHttpsFirstJourney = process.argv.includes("--settings-https-first");
const settingsCookieControlsJourney = process.argv.includes("--settings-cookie-controls");
const settingsCrashConsentJourney = process.argv.includes("--settings-crash-consent");
const settingsSiteDataCountJourney = process.argv.includes("--settings-site-data-count");
const siteBlockingExceptionJourney = process.argv.includes("--site-blocking-exception");
const siteBlockingPrivateJourney = process.argv.includes("--site-blocking-private");
const privatePageZoomJourney = process.argv.includes("--private-page-zoom");
const regularPageZoomJourney = process.argv.includes("--regular-page-zoom");
const settingsShortcutsAppearanceJourney = process.argv.includes("--settings-shortcuts-appearance");
const privateShellJourney = process.argv.includes("--private-shell");
const settingsContentBlockingJourney = process.argv.includes("--settings-content-blocking");
const settingsCustomListJourney = process.argv.includes("--settings-custom-list");
const settingsCookieBannerJourney = process.argv.includes("--settings-cookie-banner");
const settingsPrivacyGatesJourney = process.argv.includes("--settings-privacy-gates");
const settingsBackgroundJourney = process.argv.includes("--settings-background-runtime");
const settingsDefaultZoomJourney = process.argv.includes("--settings-default-zoom");
const settingsSidebarOptionsJourney = process.argv.includes("--settings-sidebar-options");
const settingsProfilesSectionJourney = process.argv.includes("--settings-profiles-section");
const tabSwitcherBaselineJourney = process.argv.includes("--tab-switcher-baseline");
const tabSwitcherOrderJourney = process.argv.includes("--tab-switcher-order");
const settingsHistoryJourney = process.argv.includes("--settings-history-route");
const settingsReloadJourney = process.argv.includes("--settings-reload-route");
const settingsDocumentReloadJourney = process.argv.includes("--settings-document-reload");
const agentGrantsJourney = process.argv.includes("--agent-grants");
const privacyHistoryPanelJourney = process.argv.includes("--privacy-history-panel");
const privacyBrowsingDataJourney = process.argv.includes("--privacy-browsing-data");
const privacyBrowsingDataClearJourney = process.argv.includes("--privacy-browsing-data-clear");
const settingsFocusJumpJourney = process.argv.includes("--settings-focus-jump");
const libraryFocusJourney = process.argv.includes("--library-focus");
const appearancePrefsJourney = process.argv.includes("--appearance-prefs");
const searchEnginePrefsJourney = process.argv.includes("--search-engine-prefs");
const edgeLeewayJourney = process.argv.includes("--edge-leeway");
const navigationRecoveryJourney = process.argv.includes("--navigation-recovery");
const certificateRecoveryJourney = process.argv.includes("--certificate-recovery");
const httpFallbackJourney = process.argv.includes("--http-fallback");
const httpFallbackDialogJourney = process.argv.includes("--http-fallback-dialog");
const healthDiagnosticsJourney = process.argv.includes("--health-diagnostics");
const unpackedExtensionJourney = process.argv.includes("--unpacked-extension");
const runtimeBackupRestoreJourney = process.argv.includes("--runtime-backup-restore");
assert.ok(!rpcOnly || !uiOnly, "Choose one focused journey mode");
assert.ok([submitConfirmation, webmcpJourney, paintLease, shellEvents, downloadsJourney, selectorDownloadsJourney, selectorResultsJourney, selectorTaskResourcesJourney, selectorSearchJourney, splitViewJourney, linkPeekJourney, spaceThemeJourney, spaceThemeAdvancedJourney, readerPeekJourney, tabPreviewFocusJourney, tabNameJourney, selectorClosedJourney, selectorReadingJourney, siteControlsJourney, tabAudioJourney, unsavedWorkJourney, fileHandoffJourney, httpAuthJourney, httpAuthCancelJourney, passwordOfferJourney, passwordPromptJourney, passwordFillBoundaryJourney, passwordTransferJourney, autofillJourney, linkStatusJourney, previewJourney, navigationMenuJourney, contextMenuJourney, pageActionJourney, readerJourney, translationJourney, eyeDropperJourney, fileIoJourney, workbookExportJourney, artifactExportJourney, agentConnectionsJourney, outboundMcpLocalJourney, outboundMcpSettingsJourney, goalsUiJourney, goalsThreadUiJourney, goalsStatusUiJourney, commandEscalationUiJourney, hooksUiJourney, hooksStartUiJourney, hooksCommandUiJourney, workspacesUiJourney, memoryInboxUiJourney, memoryPreviewUiJourney, browserImportUiJourney, browserImportFormatsJourney, browserImportAttachedJourney, protectedStartupJourney, receiptBeforeUiJourney, receiptUndoUiJourney, receiptRunUndoUiJourney, receiptBookmarkUiJourney, receiptDownloadUiJourney, receiptHistoryUiJourney, tidyReceiptJourney, archiveTabsJourney, tabSleepJourney, memorySaverJourney, memorySaverRestartJourney, profilesJourney, profileConfirmationJourney, popoverJourney, menuPrimitivesJourney, toastPrimitivesJourney, selectorBookmarkJourney, selectorSitePermissionsJourney, selectorContextJourney, quickAskFocusJourney, settingsFocusJourney, settingsSearchJourney, settingsRouteJourney, settingsInternalUrlJourney, settingsSectionRailJourney, settingsPasswordsJourney, settingsModelsJourney, settingsUsageJourney, settingsAutomationsJourney, settingsAutomationsCreateJourney, settingsAutomationsWakeJourney, settingsAutomationsFireJourney, settingsAutomationsPageChangeJourney, settingsAutomationsNotificationJourney, settingsAutomationsCalendarJourney, settingsAutomationsSuggestionsJourney, settingsAutomationsPresenceJourney, settingsAutomationsDstJourney, skillActivationReviewJourney, skillExternalTaskReviewJourney, skillImportedReadinessJourney, settingsNewTabJourney, settingsArchivedJourney, settingsGeneralJourney, settingsDownloadFolderJourney, settingsAboutJourney, settingsSpellCheckJourney, settingsQualifiedRailJourney, settingsStartupJourney, settingsLanguagesJourney, settingsPipJourney, settingsHttpsFirstJourney, settingsCookieControlsJourney, settingsCrashConsentJourney, settingsSiteDataCountJourney, siteBlockingExceptionJourney, siteBlockingPrivateJourney, privatePageZoomJourney, regularPageZoomJourney, settingsShortcutsAppearanceJourney, privateShellJourney, settingsContentBlockingJourney, settingsCustomListJourney, settingsCookieBannerJourney, settingsPrivacyGatesJourney, settingsBackgroundJourney, settingsDefaultZoomJourney, settingsSidebarOptionsJourney, settingsProfilesSectionJourney, tabSwitcherBaselineJourney, tabSwitcherOrderJourney, settingsHistoryJourney, settingsReloadJourney, settingsDocumentReloadJourney, agentGrantsJourney, privacyHistoryPanelJourney, privacyBrowsingDataJourney, privacyBrowsingDataClearJourney, settingsFocusJumpJourney, libraryFocusJourney, appearancePrefsJourney, searchEnginePrefsJourney, edgeLeewayJourney, navigationRecoveryJourney, certificateRecoveryJourney, httpFallbackJourney, httpFallbackDialogJourney, healthDiagnosticsJourney, unpackedExtensionJourney, runtimeBackupRestoreJourney].filter(Boolean).length <= 1, "Choose one focused journey");
const output = resolve(option("--output") ?? join(root, "release/test-artifacts", `native-journeys-${new Date().toISOString().replaceAll(/[:.]/g, "-")}`));
assert.ok(!existsSync(output), "Use a new output directory; existing evidence is never overwritten");
mkdirSync(output, { recursive: true });

// A short /tmp path keeps Chromium's private AF_UNIX socket under sun_path.
const disposable = mkdtempSync("/tmp/aux-native-journey-");
const profile = join(disposable, "profile");
const memoryFixture = { workspaceId: "memory-fixture-space", runId: `run_${randomUUID()}`,
  report: "The silver memory fixture belongs to the disposable Space." };
const runtimeFile = join(profile, "Default/Aux Runtime Data/runtime.json");
const nativeHeader = resolve(app, "../../../chrome/browser/ui/aux/generated/aux_host_methods.h");
const nativeSourceCommit = existsSync(nativeHeader)
  ? readFileSync(nativeHeader, "utf8").match(/kSourceCommit = "([a-f0-9]{40})"/)?.[1]
  : undefined;
if (runtimeBackupRestoreJourney || memoryInboxUiJourney) {
  assert.ok(nativeSourceCommit, "Development acceptance requires a built native source identity");
  const token = randomBytes(32).toString("hex");
  const dataDir = join(profile, "Default/Aux Runtime Data");
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  writeFileSync(join(dataDir, "development-acceptance.json"), JSON.stringify({
    version: 1, sourceCommit: nativeSourceCommit, tokenHash: createHash("sha256").update(token).digest("hex"),
    features: memoryInboxUiJourney ? ["memory", "spaces"] : ["electronMigration"], createdAt: Date.now(),
  }), { mode: 0o600 });
  process.env.AUX_DEV_ACCEPTANCE_TOKEN = token;
}
const script = join(root, "tests/host/native-window.swift");
const windowTool = join(disposable, "native-window");
const report = { schema: 1, scope: "Native Aux.app, disposable Profile, loopback fixture; no public debugging port", app,
  sourceSha: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  ...(nativeSourceCommit ? { nativeSourceCommit } : {}),
  ...((runtimeBackupRestoreJourney || memoryInboxUiJourney) ?
    { developmentAcceptanceFeatures: memoryInboxUiJourney ? ["memory", "spaces"] : ["electronMigration"] } : {}),
  startedAt: new Date().toISOString(), rpcOnly, uiOnly, steps: [], captures: [], passed: false };
let child;
let attachedChrome;
let fixture;
let modelFixture;
const translationInputs = [];
const tabNameInputs = [];
let tlsFixture;
let tcpFixture;
let origin;
let tlsOrigin;
let pageChangeVersion = 1;
let tlsRequests = 0;
let httpPlainRequests = 0;
let tlsHelloRequests = 0;
let trackerFixtureRequests = 0;
let blockingPageRequests = 0;
let privateZoomPageRequests = 0;
let redirectFixtureRequests = 0;
let customPageRequests = 0;
let customTrackerRequests = 0;
let browsingCacheRequests = 0;
let browsingCookieReturns = 0;
const cosmeticResults = new Map();
const cookieChecks = { off: null, on: null };
let httpFallbackRequests = 0;
let clicks = 0;
let posts = 0;
let webmcpWrites = 0;
let downloadRequests = 0;
const receiptNativeDownloadName = `aux-receipt-native-${randomUUID()}.txt`;
let siteRequests = 0;
let siteCookieReturned = false;
let unsavedRequests = 0;
let authChallenges = 0;
let authAuthorized = 0;
let passwordSubmissions = 0;
let contextRequests = 0;
let sleepRedLoads = 0;
let sleepLoadPhase = "initial";
let rpcToken;
let rpcPort;
let lastRuntimeStatus;
let agentToken;

function record(name, detail) {
  report.steps.push({ name, passed: true, detail });
  console.log(`PASS ${name}`);
}
async function until(label, check, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child && (child.exitCode !== null || child.signalCode !== null))
      throw new Error(`Aux exited while waiting for ${label}: ${child.exitCode ?? child.signalCode}`);
    const result = await check();
    if (result) return result;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}
async function rpc(method, params = {}) {
  try {
    const response = await fetch(`http://127.0.0.1:${rpcPort}/rpc`, {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${rpcToken}` },
      body: JSON.stringify({ id: 1, method, params }),
      signal: AbortSignal.timeout(method === "pages.open" ? 60_000 : method === "pages.execute" || method === "pages.webmcp" ? 30_000 : 10_000),
    });
    const body = await response.json();
    if (body.error) throw new Error(`${method}: ${body.error.code}: ${body.error.message}`);
    return body.result;
  } catch (error) {
    throw new Error(`${method}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
function native(action, ...args) {
  return execFileSync(windowTool, [action, String(child.pid), ...args.map(String)], { encoding: "utf8", timeout: 15_000 }).trim();
}
function capture(windowId, name) {
  const path = join(output, `${name}.png`);
  execFileSync("/usr/sbin/screencapture", ["-x", "-l", String(windowId), path], { timeout: 15_000 });
  assert.ok(statSync(path).size > 1024, `${name} native window capture is empty`);
  report.captures.push({ name, file: basename(path), bytes: statSync(path).size });
  return path;
}
function changedFraction(aPath, bPath, fraction = 0.45) {
  const { PNG } = requireDependency("pngjs");
  const a = PNG.sync.read(readFileSync(aPath));
  const b = PNG.sync.read(readFileSync(bPath));
  assert.equal(a.width, b.width, "Native captures must have the same window width");
  assert.equal(a.height, b.height, "Native captures must have the same window height");
  let changed = 0;
  let total = 0;
  for (let y = Math.floor(a.height * 0.15); y < a.height * 0.85; y += 4) {
    for (let x = 0; x < a.width * fraction; x += 4) {
      const offset = (y * a.width + x) * 4;
      if (Math.abs(a.data[offset] - b.data[offset]) +
          Math.abs(a.data[offset + 1] - b.data[offset + 1]) +
          Math.abs(a.data[offset + 2] - b.data[offset + 2]) > 72) changed++;
      total++;
    }
  }
  return changed / total;
}

try {
  let languageHeader = "";
  fixture = createServer((request, response) => {
    if (receiptBookmarkUiJourney && request.url === "/bookmark-fixture") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end('<!doctype html><title>Run bookmark fixture</title><main>Disposable bookmark source</main>');
      return;
    }
    if ((receiptUndoUiJourney || receiptRunUndoUiJourney) && request.url === "/receipt-form") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end('<!doctype html><title>Receipt undo fixture</title><label>Quantity <input id="quantity" value="4"></label><label>Code <input id="code" value="B"></label>');
      return;
    }
    if (settingsAutomationsNotificationJourney && request.url === "/notification") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "max-age=60" });
      response.end(`<!doctype html><title>Notification fixture</title><main><p id="permission"></p>
        <button id="notify">Show fixture notification</button><output id="result">Waiting</output></main>
        <script>document.getElementById('permission').textContent='Permission: '+Notification.permission;
        document.getElementById('notify').onclick=()=>{try{new Notification('Fixture notification');
          document.getElementById('result').textContent='Sent fixture notification';}
          catch(e){document.getElementById('result').textContent='Notification failed: '+e.name;}};</script>`);
      return;
    }
    if (settingsAutomationsPageChangeJourney && request.url === "/page-change-state") {
      response.writeHead(200, { "content-type": "text/plain", "cache-control": "no-store" });
      response.end(String(pageChangeVersion));
      return;
    }
    if (settingsAutomationsPageChangeJourney && request.url === "/page-change") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "max-age=60" });
      response.end(`<!doctype html><title>Automation page fixture</title><main id="content">Fixture version 1</main>
        <script>setInterval(async () => { const version = await (await fetch('/page-change-state')).text();
          document.getElementById('content').textContent = 'Fixture version ' + version; }, 1000);</script>`);
      return;
    }
    if ((privacyBrowsingDataJourney || privacyBrowsingDataClearJourney) && request.url === "/browsing-data") {
      if (String(request.headers.cookie ?? "").includes("aux_clear_fixture=1")) browsingCookieReturns++;
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store",
        "set-cookie": "aux_clear_fixture=1; Path=/; SameSite=Lax" });
      response.end('<!doctype html><title>Aux browsing data fixture</title><h1>Browsing data fixture</h1><script src="/browsing-cache.js"></script>');
      return;
    }
    if ((privacyBrowsingDataJourney || privacyBrowsingDataClearJourney) && request.url === "/browsing-cache.js") {
      browsingCacheRequests++;
      response.writeHead(200, { "content-type": "text/javascript; charset=utf-8", "cache-control": "public, max-age=3600" });
      response.end(`window.auxCacheFixture=true;/*${"a".repeat(64 * 1024)}*/`);
      return;
    }
    if (settingsCookieControlsJourney && request.url?.startsWith("/cookie-top?")) {
      const phase = new URL(request.url, "http://fixture").searchParams.get("phase");
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end(`<!doctype html><title>Aux cookie ${phase} fixture</title><iframe src="http://localhost:${fixture.address().port}/cookie-frame?phase=${phase}&step=set"></iframe>`);
      return;
    }
    if (settingsCookieControlsJourney && request.url?.startsWith("/cookie-frame?")) {
      const params = new URL(request.url, "http://fixture").searchParams;
      const phase = params.get("phase");
      if (phase !== "off" && phase !== "on") { response.writeHead(400).end(); return; }
      if (params.get("step") === "check") {
        cookieChecks[phase] = String(request.headers.cookie ?? "").includes(`aux_tp_${phase}=1`);
        response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        response.end("<!doctype html><title>Cookie check</title>");
        return;
      }
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store",
        "set-cookie": `aux_tp_${phase}=1; Path=/; SameSite=None; Secure` });
      response.end(`<!doctype html><title>Cookie set</title><script>location.replace('/cookie-frame?phase=${phase}&step=check')</script>`);
      return;
    }
    if (settingsCustomListJourney && request.url?.startsWith("/custom-list")) {
      customPageRequests++;
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end(`<!doctype html><title>Aux custom list fixture</title><img src="http://cdn.appround.biz:${fixture.address().port}/custom-tracker?phase=${customPageRequests}" alt="">`);
      return;
    }
    if (settingsCustomListJourney && request.url?.startsWith("/custom-tracker")) {
      customTrackerRequests++;
      response.writeHead(200, { "content-type": "image/gif", "cache-control": "no-store" });
      response.end(Buffer.from("R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=", "base64"));
      return;
    }
    if (settingsCookieBannerJourney && request.url?.startsWith("/cookie-banner-result?")) {
      const result = new URL(request.url, "http://fixture").searchParams;
      cosmeticResults.set(result.get("phase"), result.get("hidden") === "true");
      response.writeHead(204).end();
      return;
    }
    if (settingsCookieBannerJourney && request.url?.startsWith("/cookie-banner?")) {
      const phase = new URL(request.url, "http://fixture").searchParams.get("phase");
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end(`<!doctype html><title>Aux cookie banner fixture</title><main><h1>Cookie banner fixture</h1><aside id="ACCETTA_COOKIES">Disposable cookie banner</aside></main><script>window.addEventListener("load",()=>setTimeout(()=>{const hidden=getComputedStyle(document.getElementById("ACCETTA_COOKIES")).display==="none";fetch("/cookie-banner-result?phase=${phase}&hidden="+hidden)},300))</script>`);
      return;
    }
    if ((settingsContentBlockingJourney || siteBlockingExceptionJourney || siteBlockingPrivateJourney) && request.url?.startsWith("/blocking-redirect")) {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end(`<!doctype html><title>Aux redirect fixture</title><h1>Redirect fixture</h1><img src="/redirect?phase=${Date.now()}" alt="">`);
      return;
    }
    if ((settingsContentBlockingJourney || siteBlockingExceptionJourney || siteBlockingPrivateJourney) && request.url?.startsWith("/redirect")) {
      redirectFixtureRequests++;
      response.writeHead(302, { location: `http://hilltopads.net:${fixture.address().port}/tracker?phase=redirect`, "cache-control": "no-store" });
      response.end();
      return;
    }
    if ((settingsContentBlockingJourney || siteBlockingExceptionJourney || siteBlockingPrivateJourney) && request.url?.startsWith("/blocking")) {
      blockingPageRequests++;
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end(`<!doctype html><title>Aux blocking fixture</title><h1>Blocking fixture</h1><img src="http://hilltopads.net:${fixture.address().port}/tracker?phase=${blockingPageRequests}" alt="">`);
      return;
    }
    if ((privatePageZoomJourney || regularPageZoomJourney) && request.url?.startsWith("/private-zoom")) {
      privateZoomPageRequests++;
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end("<!doctype html><title>Aux Private zoom fixture</title><h1>Private zoom fixture</h1>");
      return;
    }
    if ((settingsContentBlockingJourney || siteBlockingExceptionJourney || siteBlockingPrivateJourney) && request.url?.startsWith("/tracker")) {
      trackerFixtureRequests++;
      response.writeHead(200, { "content-type": "image/gif", "cache-control": "no-store", "access-control-allow-origin": "*" });
      response.end(Buffer.from("R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=", "base64"));
      return;
    }
    if (settingsLanguagesJourney && request.url === "/language-header") {
      languageHeader = String(request.headers["accept-language"] ?? "");
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end("<!doctype html><title>Language header fixture</title><h1>Language header fixture</h1>");
      return;
    }
    if (translationJourney && request.url === "/translation") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end('<!doctype html><title>Aux translation fixture</title><main style="padding:48px;font:24px system-ui"><h1>Hola mundo de Aux</h1><p>Esta página se puede traducir.</p><p hidden>HIDDEN TRANSLATION SECRET</p><label>Private input <input value="FORM VALUE SECRET"></label><code>CODE TRANSLATION SECRET</code></main>');
      return;
    }
    if (autofillJourney && request.url === "/autofill") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end('<!doctype html><title>Aux personal info fixture</title><main style="padding:40px;font:20px system-ui"><h1>Disposable personal info form</h1><form autocomplete="on"><label>Name <input name="name" autocomplete="name"></label><label>Email <input name="email" autocomplete="email"></label><label>Street <input name="street" autocomplete="street-address"></label><label>City <input name="city" autocomplete="address-level2"></label><label>ZIP <input name="postal" autocomplete="postal-code"></label></form></main>');
      return;
    }
    if (linkStatusJourney && request.url === "/link-status") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end('<!doctype html><title>Aux link hover fixture</title><main style="padding:80px;font:24px system-ui"><h1>Link destination fixture</h1><a href="/link-target">Hover destination</a></main>');
      return;
    }
    if (linkStatusJourney && request.url === "/link-target") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end("<!doctype html><title>Link target</title><h1>Link target loaded</h1>");
      return;
    }
    if ((passwordOfferJourney || passwordPromptJourney || passwordFillBoundaryJourney) && request.url === "/password-offer") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end('<!doctype html><title>Aux password fixture</title><main><h1>Disposable sign-in</h1><form method="post" action="/password-submit"><label>Username <input name="username" autocomplete="username"></label><label>Password <input name="password" type="password" autocomplete="current-password"></label><button type="submit">Sign in</button></form></main>');
      return;
    }
    if ((passwordOfferJourney || passwordPromptJourney) && request.url === "/password-submit" && request.method === "POST") {
      let body = "";
      request.on("data", chunk => { body += chunk; });
      request.on("end", () => {
        if (new URLSearchParams(body).get("username") === "fixture-user" &&
            new URLSearchParams(body).get("password") === "fixture-pass") passwordSubmissions++;
        response.writeHead(303, { location: "/password-done", "cache-control": "no-store" });
        response.end();
      });
      return;
    }
    if ((passwordOfferJourney || passwordPromptJourney) && request.url === "/password-done") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end("<!doctype html><title>Aux sign-in done</title><h1>Disposable sign-in complete</h1>");
      return;
    }
    if ((httpFallbackJourney || httpFallbackDialogJourney) && request.url === "/http-fallback") {
      httpFallbackRequests++;
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end("<!doctype html><title>Aux HTTP fallback fixture</title><h1>HTTP fallback loaded</h1>");
      return;
    }
    if ((httpAuthJourney || httpAuthCancelJourney) && request.url === "/http-auth") {
      if (request.headers.authorization !== `Basic ${Buffer.from("fixture-user:fixture-pass").toString("base64")}`) {
        authChallenges++;
        response.writeHead(401, { "www-authenticate": 'Basic realm="Aux fixture"', "cache-control": "no-store" });
        response.end("Authentication required");
        return;
      }
      authAuthorized++;
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end("<!doctype html><title>Aux authenticated fixture</title><main><h1>Protected fixture loaded</h1></main>");
      return;
    }
    if (fileHandoffJourney && request.url === "/file-handoff-page") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end('<!doctype html><title>File handoff fixture</title><script>setTimeout(() => { location.href = "/file-handoff" }, 500)</script>');
      return;
    }
    if (fileHandoffJourney && request.url === "/file-handoff") {
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8", "content-disposition": "attachment; filename=aux-file-handoff.txt", "cache-control": "no-store" });
      response.end("Aux disposable file handoff fixture\n");
      return;
    }
    if (unsavedWorkJourney && request.url === "/unsaved-work") {
      unsavedRequests++;
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end(`<!doctype html><title>Aux duplicate fixture</title><main><h1>Duplicate fixture</h1><label for="name">Draft</label><input id="name" value="original"></main>${unsavedRequests === 2 ? '<script>document.querySelector("#name").value = "edited draft"</script>' : ""}`);
      return;
    }
    if ((siteControlsJourney || settingsSiteDataCountJourney) && request.url === "/site-controls") {
      siteRequests++;
      if (siteRequests > 1) siteCookieReturned = String(request.headers.cookie ?? "").includes("aux_site_fixture=1");
      response.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        ...(siteRequests === 1 ? { "set-cookie": "aux_site_fixture=1; Path=/; SameSite=Lax" } : {}),
      });
      response.end(`<!doctype html><title>Aux site controls fixture</title><main><h1>Site controls fixture</h1><p id="storage"></p></main><script>
${siteRequests === 1 ? 'localStorage.setItem("aux_site_fixture", "present");' : ""}
document.getElementById("storage").textContent = localStorage.getItem("aux_site_fixture") === "present" ? "Stored fixture present" : "Stored fixture cleared";
</script>`);
      return;
    }
    if ((downloadsJourney || selectorDownloadsJourney) && request.url === "/download-file") {
      downloadRequests++;
      response.writeHead(200, { "content-type": "application/octet-stream", "content-disposition": "attachment; filename=aux-download-fixture.bin", "cache-control": "no-store" });
      const chunk = Buffer.alloc(64 * 1024, 65);
      let count = 0;
      const timer = setInterval(() => {
        if (response.destroyed || ++count > 600) { clearInterval(timer); if (!response.destroyed) response.end(); return; }
        response.write(chunk);
      }, 100);
      response.on("close", () => clearInterval(timer));
      return;
    }
    if (receiptDownloadUiJourney && request.url === "/receipt-download-file") {
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8",
        "content-disposition": `attachment; filename="${receiptNativeDownloadName}"`,
        "cache-control": "no-store" });
      response.end("Disposable native download event\n");
      return;
    }
    if (receiptDownloadUiJourney && request.url === "/download-receipt") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end('<!doctype html><title>Download receipt fixture</title><script>setTimeout(() => { location.href = "/receipt-download-file" }, 500)</script>');
      return;
    }
    if (receiptHistoryUiJourney && request.url === "/history-receipt") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end("<!doctype html><title>History receipt fixture</title><h1>Disposable history visit</h1>");
      return;
    }
    if ((downloadsJourney || selectorDownloadsJourney) && request.url === "/download-page") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end('<!doctype html><title>Download fixture</title><script>setTimeout(() => { location.href = "/download-file" }, 500)</script>');
      return;
    }
    if (shellEvents && request.url === "/slow") {
      setTimeout(() => {
        if (response.writableEnded || response.destroyed) return;
        response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        response.end("<!doctype html><title>Slow ready</title><p>slow ready</p>");
      }, 5_000);
      return;
    }
    if (paintLease) {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      const label = request.url === "/plain" ? "plain" : request.url === "/cover" ? "cover" : "agent";
      response.end(`<!doctype html><title>${label}</title><body><p id="n">${label} frames 0</p><script>
let frames = 0;
const node = document.getElementById("n");
function paint() {
  frames += 1;
  const text = "${label} frames " + frames;
  document.title = text;
  node.textContent = text;
  requestAnimationFrame(paint);
}
requestAnimationFrame(paint);
</script></body>`);
      return;
    }
    if (webmcpJourney) {
      if (request.method === "POST" && request.url === "/write") { webmcpWrites++; response.writeHead(204).end(); return; }
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end(`<!doctype html><title>Aux WebMCP fixture</title><main><h1>WebMCP fixture</h1><p id="status">tools pending</p></main><script>
const status = document.getElementById("status");
const tools = document.modelContext;
if (!tools || !tools.registerTool) { status.textContent = "webmcp missing"; }
else {
  let writes = 0;
  Promise.all([
    tools.registerTool({ name: "read_count", description: "Read the write count", inputSchema: { type: "object" }, annotations: { readOnlyHint: true }, execute: async () => String(writes) }),
    tools.registerTool({ name: "add_write", description: "Record one write", inputSchema: { type: "object" }, annotations: { readOnlyHint: false, consequentialHint: true }, execute: async () => { await fetch("/write", { method: "POST" }); writes += 1; return String(writes); } })
  ]).then(() => { status.textContent = "tools ready"; }).catch((error) => { status.textContent = "tools failed " + error; });
}
</script>`);
      return;
    }
    if (submitConfirmation) {
      if (request.method === "POST" && request.url === "/submit") { posts++; response.writeHead(204).end(); return; }
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end(`<!doctype html><title>Aux submit fixture</title><main><h1>Submit fixture</h1><form id="order" method="post" action="/submit"><button id="send" type="submit">Send</button></form><script>document.getElementById("order").addEventListener("submit",event=>{event.preventDefault();fetch("/submit",{method:"POST"})})</script></main>`);
      return;
    }
    if (request.url === "/click") { clicks++; response.writeHead(204).end(); return; }
    if (eyeDropperJourney && request.url === "/eyedropper") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end('<!doctype html><title>Aux eyedropper fixture</title><main style="padding:50px;font:24px system-ui"><h1>Aux eyedropper fixture</h1><button id="pick" style="font:24px system-ui">Pick a color</button><output id="result">Waiting for color</output><div style="width:350px;height:260px;background:#e03135;margin-top:30px">Red sample area</div></main><script>document.getElementById("pick").onclick=async()=>{let out=document.getElementById("result");out.textContent="Picker invoked "+typeof EyeDropper;try{let color=await new EyeDropper().open();out.textContent="Sampled color "+color.sRGBHex}catch(e){out.textContent="Color canceled "+e.name}}</script>');
      return;
    }
    if ((readerJourney || readerPeekJourney) && request.url === "/reader") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      const paragraph = "Aux Reader carries the article into a calm native reading surface. The page contains a full paragraph of useful prose, with clear sentences about browsing, attention, research, navigation, and the original document. ";
      response.end(`<!doctype html><html><head><title>Aux Reader fixture</title></head><body><main><article><h1>Aux Reader fixture</h1><p>Distinctive distilled article sentence.</p><h2 id="overview">Reading overview</h2>${Array.from({length:12}, (_, i) => `<p>${i + 1}. ${paragraph.repeat(3)}</p>`).join("")}<h2 id="details">Details worth keeping</h2><p><a href="/red">Safe relative article link</a></p><script>window.__readerDanger = true</script></article></main></body></html>`);
      return;
    }
    if (contextMenuJourney && request.url === "/red") contextRequests++;
    if ((tabSleepJourney || memorySaverJourney || memorySaverRestartJourney) && request.url === "/red") {
      sleepRedLoads++;
      if (memorySaverRestartJourney) console.log(`Red fixture load ${sleepRedLoads} during ${sleepLoadPhase}`);
    }
    const color = request.url?.startsWith("/blue") ? "#164b72" : "#7c344b";
    const name = color === "#164b72" ? "Blue" : "Red";
    response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    const needles = name === "Red" ? "<p>Visible needle one</p><p>Visible needle two</p><p>Visible needle three</p>" : "<p>Visible needle</p>";
    response.end(`<!doctype html><title>Aux native ${name}</title>${spaceThemeJourney && name === "Red" ? '<meta name="theme-color" content="#a33450">' : ""}<style>html,body{margin:0;height:100%;background:${color};color:white;font:24px system-ui}main{padding:64px}</style><main><h1>Aux native ${name} fixture</h1>${needles}<p hidden>needle hidden</p><label for="name">Title</label><input id="name" name="title"><button id="act" onclick="fetch('/click');this.textContent='Clicked'">Act</button></main>`);
  });
  await new Promise(resolveListen => fixture.listen(0, "127.0.0.1", resolveListen));
  origin = `http://127.0.0.1:${fixture.address().port}`;
  if (translationJourney || tidyReceiptJourney || tabNameJourney) {
    modelFixture = createServer((request, response) => {
      if (request.method !== "POST" || request.url !== "/v1/chat/completions") {
        response.writeHead(404).end();
        return;
      }
      let body = "";
      request.on("data", chunk => { body += chunk; });
      request.on("end", () => {
        try {
          const payload = JSON.parse(body);
          const prompt = payload.messages?.findLast(message => message.role === "user")?.content;
          if (tabNameJourney) {
            const input = JSON.parse(String(prompt));
            assert.equal(input.title, "Aux native Red");
            assert.equal(input.siteOrigin, origin);
            tabNameInputs.push(input);
            response.writeHead(200, { "content-type": "application/json" });
            response.end(JSON.stringify({ id: "aux-tab-name-fixture", object: "chat.completion", created: 1,
              model: "meta/muse-spark-1.3-contributor", choices: [{ index: 0, finish_reason: "stop",
                message: { role: "assistant", content: JSON.stringify({ name: "Red research" }) } }],
              usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 } }));
            return;
          }
          if (tidyReceiptJourney) {
            const pages = JSON.parse(String(prompt).slice(String(prompt).indexOf("\n") + 1));
            assert.ok(Array.isArray(pages) && pages.length === 3);
            const content = JSON.stringify({ groups: [{ name: "Fixture reading", pageIds: pages.slice(0, 2).map(page => page.pageId) }] });
            response.writeHead(200, { "content-type": "application/json" });
            response.end(JSON.stringify({ id: "aux-tidy-fixture", object: "chat.completion", created: 1,
              model: "meta/muse-spark-1.3-contributor", choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content } }],
              usage: { prompt_tokens: 20, completion_tokens: 20, total_tokens: 40 } }));
            return;
          }
          const segments = JSON.parse(String(prompt).split("Segments (JSON array):\n")[1]);
          translationInputs.push(segments);
          const content = JSON.stringify({ lang: "Spanish", translations: segments.map(text => `EN: ${text}`) });
          response.writeHead(200, { "content-type": "application/json" });
          response.end(JSON.stringify({ id: "aux-translation-fixture", object: "chat.completion", created: 1,
            model: "fixture-model", choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content } }],
            usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 } }));
        } catch (error) {
          response.writeHead(400, { "content-type": "text/plain" });
          response.end(String(error));
        }
      });
    });
    await new Promise(resolveListen => modelFixture.listen(0, "127.0.0.1", resolveListen));
  }
  if (httpFallbackJourney || httpFallbackDialogJourney) {
    mkdirSync(join(profile, "Default"), { recursive: true });
    writeFileSync(join(profile, "Default/Preferences"), JSON.stringify({
      https_only_mode_enabled: true,
      aux: { https_upgrades_enabled: true },
    }));
  }
  if (certificateRecoveryJourney) {
    const key = join(disposable, "fixture.key");
    const cert = join(disposable, "fixture.crt");
    execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
      "-keyout", key, "-out", cert, "-subj", "/CN=localhost",
      "-addext", "subjectAltName=DNS:localhost,IP:127.0.0.1"], { stdio: "ignore" });
    tlsFixture = createHttpsServer({ key: readFileSync(key), cert: readFileSync(cert) }, (_request, response) => {
      tlsRequests++;
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end("<!doctype html><title>Aux certificate fixture</title><h1>Certificate fixture loaded</h1>");
    });
    await new Promise(resolveListen => tlsFixture.listen(0, "127.0.0.1", resolveListen));
    tlsOrigin = `https://localhost:${tlsFixture.address().port}`;
  }
  if (settingsHttpsFirstJourney) {
    tcpFixture = createTcpServer(socket => {
      socket.once("data", chunk => {
        if (chunk[0] === 0x16) {
          tlsHelloRequests++;
          socket.destroy();
        } else {
          httpPlainRequests++;
          const body = "Aux HTTPS-first fixture";
          socket.end(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(body)}\r\nConnection: close\r\n\r\n${body}`);
        }
      });
    });
    await new Promise(resolveListen => tcpFixture.listen(0, "127.0.0.1", resolveListen));
  }
  if (siteControlsJourney) {
    // Chromium stores user content-setting rules under the nested Preferences
    // path profile.content_settings.exceptions.notifications. A blocked rule
    // exercises listing and reset without an OS or browser permission prompt.
    mkdirSync(join(profile, "Default"), { recursive: true });
    writeFileSync(join(profile, "Default/Preferences"), JSON.stringify({
      profile: { content_settings: { exceptions: {
        notifications: { [`${origin},*`]: { setting: 2 } },
      } } },
    }));
  }
  if (settingsAutomationsNotificationJourney) {
    mkdirSync(join(profile, "Default"), { recursive: true });
    writeFileSync(join(profile, "Default/Preferences"), JSON.stringify({
      profile: { content_settings: { exceptions: {
        notifications: { [`${origin},*`]: { setting: 1 } },
      } } },
    }));
  }
  if (settingsCookieControlsJourney) {
    mkdirSync(join(profile, "Default"), { recursive: true });
    writeFileSync(join(profile, "Default/Preferences"), JSON.stringify({ profile: { cookie_controls_mode: 0 } }));
  }
  if (fileHandoffJourney) {
    const target = join(disposable, "handoff-downloads");
    mkdirSync(target, { recursive: true });
    mkdirSync(join(profile, "Default"), { recursive: true });
    writeFileSync(join(profile, "Default/Preferences"), JSON.stringify({ download: { default_directory: target } }));
  }
  const importHome = join(disposable, "fixture-home");
  const importSourceFiles = [];
  if (browserImportAttachedJourney) {
    const chromeRoot = join(importHome, "Library/Application Support/Google/Chrome");
    const defaultProfile = join(chromeRoot, "Default");
    const corruptProfile = join(chromeRoot, "Profile 1");
    mkdirSync(defaultProfile, { recursive: true });
    mkdirSync(corruptProfile, { recursive: true });
    const historyPath = join(defaultProfile, "History");
    const source = new DatabaseSync(historyPath);
    source.exec("CREATE TABLE urls(id INTEGER PRIMARY KEY,url TEXT,title TEXT); CREATE TABLE visits(id INTEGER PRIMARY KEY,url INTEGER,visit_time INTEGER); BEGIN IMMEDIATE;");
    const insertUrl = source.prepare("INSERT INTO urls(id,url,title) VALUES(?,?,?)");
    const insertVisit = source.prepare("INSERT INTO visits(id,url,visit_time) VALUES(?,?,?)");
    for (let i = 1; i <= 5000; i++) {
      insertUrl.run(i, `https://aux-import-cancel.example/${i}`, `Cancel fixture ${i}`);
      insertVisit.run(i, i, (Date.now() - i * 1000 + 11_644_473_600_000) * 1000);
    }
    source.exec("COMMIT");
    source.close();
    const corruptHistory = join(corruptProfile, "History");
    writeFileSync(corruptHistory, "This is not a SQLite browser History store.");
    importSourceFiles.push(historyPath, corruptHistory);
    report.importSourceHashes = Object.fromEntries(importSourceFiles.map(path =>
      [path.slice(importHome.length + 1), createHash("sha256").update(readFileSync(path)).digest("hex")]));
  }
  if (protectedStartupJourney) {
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    mkdirSync(join(profile, "Default/Aux Runtime Data"), { recursive: true });
    const db = openDb(databasePath);
    try {
      db.prepare("INSERT INTO model_calls(call_id,run_id,role,model_id,duration_ms,error,created_at) VALUES(?,?,?,?,?,?,?)")
        .run("legacy-startup", "fixture-run", "agent", "fixture-model", 1, "private startup marker", Date.now());
      db.prepare("INSERT INTO runs(run_id,goal,status,config,created_at) VALUES(?,?,?,?,?)")
        .run("legacy-run", "private native run", "completed", JSON.stringify({ chatId: "legacy-chat", context: "private native context" }), Date.now());
      db.prepare("INSERT INTO run_lookup(run_id,config) VALUES(?,?)")
        .run("legacy-run", JSON.stringify({ chatId: "legacy-chat" }));
      db.prepare("INSERT INTO workspaces(workspace_id,name,created_at) VALUES(?,?,?)")
        .run("legacy-space", "private native space", Date.now());
      db.prepare("INSERT INTO tasks(task_id,workspace_id,revision,state,updated_at,json) VALUES(?,?,?,?,?,?)")
        .run("legacy-task", "legacy-space", 1, "open", Date.now(), JSON.stringify({ title: "private native task" }));
      db.prepare("INSERT INTO task_lookup(task_id) VALUES(?)").run("legacy-task");
      db.prepare("INSERT INTO task_evidence(evidence_id,task_id,task_revision,criterion_id,json) VALUES(?,?,?,?,?)")
        .run("legacy-evidence", "legacy-task", 1, "criterion", JSON.stringify({ note: "private native evidence" }));
      db.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("setting:nativeFixture", JSON.stringify({ text: "private native setting" }));
      db.prepare("INSERT INTO outbound_mcp_servers(server_id,workspace_id,state,body,created_at,updated_at) VALUES(?,?,?,?,?,?)")
        .run("legacy-mcp", "legacy-space", "pending", JSON.stringify({ name: "private native MCP" }), Date.now(), Date.now());
      db.prepare("INSERT INTO outbound_mcp_grants(grant_id,server_id,tool_name,body) VALUES(?,?,?,?)")
        .run("legacy-mcp-grant", "legacy-mcp", "read", JSON.stringify({ note: "private native MCP grant" }));
      db.prepare("INSERT INTO agent_connections(connection_id,name,client,scope_kind,workspace_id,token_hash,created_at) VALUES(?,?,?,?,?,?,?)")
        .run("legacy-agent", "private native agent", "codex", "workspace", "legacy-space", "legacy-token-hash", Date.now());
      db.prepare("INSERT INTO calendar_connections(connection_id,provider,account_key,label,secret_name,scopes,state,created_at,updated_at) VALUES(?,'google',?,?,?,?, 'active',?,?)")
        .run("legacy-calendar", "private-calendar-account", "private native calendar", "legacy-calendar-secret", JSON.stringify(["calendar.readonly"]), Date.now(), Date.now());
      db.prepare("INSERT INTO vault_items(item_id,label,kind,origin,created_at,updated_at) VALUES(?,?,?,?,?,?)")
        .run("legacy-vault", "private native vault", "password", "https://vault.example", Date.now(), Date.now());
      db.prepare("INSERT INTO vault_grants(grant_id,item_id,credential_ref,origin,created_at,expires_at) VALUES(?,?,?,?,?,?)")
        .run("legacy-vault-grant", "legacy-vault", "legacy-vault-ref", "https://vault.example", Date.now(), Date.now() + 60_000);
      db.prepare("INSERT INTO vault_access(item_id,grant_id,action,actor,origin,detail,recorded_at) VALUES(?,?,?,?,?,?,?)")
        .run("legacy-vault", "legacy-vault-grant", "grant", "desktop_user", "https://vault.example", "private native vault audit", Date.now());
    } finally { db.close(); }
  }
  if (memoryInboxUiJourney) {
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    mkdirSync(join(profile, "Default/Aux Runtime Data"), { recursive: true });
    const db = openDb(databasePath);
    try {
      const now = Date.now();
      const config = JSON.stringify({ contextWorkspaceId: memoryFixture.workspaceId });
      db.prepare("INSERT INTO workspaces(workspace_id,name,created_at) VALUES(?,?,?)")
        .run(memoryFixture.workspaceId, "Memory Fixture", now);
      db.prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,result,ended_at,created_at) VALUES(?,?,?,?,?,?,?,?)")
        .run(memoryFixture.runId, "Review memory fixture", "completed", "[]", config,
          JSON.stringify({ report: memoryFixture.report }), now, now);
      db.prepare("INSERT INTO run_lookup(run_id,config) VALUES(?,?)").run(memoryFixture.runId, config);
    } finally { db.close(); }
  }
  if (browserImportUiJourney) {
    for (const [name, suffix] of [["Default", "default"], ["Profile 1", "work"]]) {
      const dir = join(importHome, "Library/Application Support/Google/Chrome", name);
      mkdirSync(dir, { recursive: true });
      const bookmarks = join(dir, "Bookmarks");
      writeFileSync(bookmarks, JSON.stringify({ roots: { bookmark_bar: { type: "folder", children: [
        { type: "url", name: `${suffix} fixture`, url: `https://aux-import-${suffix}.example/bookmark` },
      ] }, other: { type: "folder", children: [] }, synced: { type: "folder", children: [] } } }));
      const history = join(dir, "History");
      const db = new DatabaseSync(history);
      db.exec("CREATE TABLE urls(id INTEGER PRIMARY KEY, url TEXT, title TEXT); CREATE TABLE visits(id INTEGER PRIMARY KEY, url INTEGER, visit_time INTEGER);");
      db.prepare("INSERT INTO urls(id,url,title) VALUES(1,?,?)").run(`https://aux-import-${suffix}.example/history`, `${suffix} history`);
      db.prepare("INSERT INTO visits(id,url,visit_time) VALUES(1,1,?)").run((Date.now() - 3_600_000 + 11_644_473_600_000) * 1000);
      db.close();
      importSourceFiles.push(bookmarks, history);
    }
    report.importSourceHashes = Object.fromEntries(importSourceFiles.map(path =>
      [path.slice(importHome.length + 1), createHash("sha256").update(readFileSync(path)).digest("hex")]));
  }
  if (browserImportFormatsJourney) {
    const arcRoot = join(importHome, "Library/Application Support/Arc/User Data");
    const arcProfile = join(arcRoot, "Default");
    mkdirSync(arcProfile, { recursive: true });
    const arcSidebar = join(arcRoot, "StorableSidebar.json");
    writeFileSync(arcSidebar, JSON.stringify({ sidebar: { containers: [{
      spaces: [{ id: "work", title: "Work" }],
      items: [{ id: "tab", spaceID: "work", data: { tab: {
        savedURL: "https://aux-import-arc.example/bookmark", customTitle: "Arc fixture",
      } } }],
    }] } }));
    const arcHistory = join(arcProfile, "History");
    const arcDb = new DatabaseSync(arcHistory);
    arcDb.exec("CREATE TABLE urls(id INTEGER PRIMARY KEY,url TEXT,title TEXT); CREATE TABLE visits(id INTEGER PRIMARY KEY,url INTEGER,visit_time INTEGER);");
    arcDb.prepare("INSERT INTO urls VALUES(1,?,?)").run("https://aux-import-arc.example/history", "Arc history");
    arcDb.prepare("INSERT INTO visits VALUES(1,1,?)").run((Date.now() - 3_600_000 + 11_644_473_600_000) * 1000);
    arcDb.close();
    const safariDir = join(importHome, "Library/Safari");
    mkdirSync(safariDir, { recursive: true });
    const safariBookmarks = join(safariDir, "Bookmarks.plist");
    writeFileSync(safariBookmarks, `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>Children</key><array><dict><key>Title</key><string>Safari fixture</string><key>URLString</key><string>https://aux-import-safari.example/bookmark</string></dict></array></dict></plist>`);
    const safariHistory = join(safariDir, "History.db");
    const safariDb = new DatabaseSync(safariHistory);
    safariDb.exec("CREATE TABLE history_items(id INTEGER PRIMARY KEY,url TEXT); CREATE TABLE history_visits(id INTEGER PRIMARY KEY,history_item INTEGER,title TEXT,visit_time REAL);");
    safariDb.prepare("INSERT INTO history_items VALUES(1,?)").run("https://aux-import-safari.example/history");
    safariDb.prepare("INSERT INTO history_visits VALUES(1,1,?,?)").run("Safari history", Date.now() / 1000 - 978_307_200 - 3600);
    safariDb.close();
    const firefoxDir = join(importHome, "Library/Application Support/Firefox/Profiles/fixture.default-release");
    mkdirSync(firefoxDir, { recursive: true });
    const firefoxPlaces = join(firefoxDir, "places.sqlite");
    const ffDb = new DatabaseSync(firefoxPlaces);
    ffDb.exec("CREATE TABLE moz_places(id INTEGER PRIMARY KEY,url TEXT,title TEXT); CREATE TABLE moz_bookmarks(id INTEGER PRIMARY KEY,type INTEGER,fk INTEGER,parent INTEGER,position INTEGER,title TEXT); CREATE TABLE moz_historyvisits(id INTEGER PRIMARY KEY,place_id INTEGER,visit_date INTEGER);");
    ffDb.prepare("INSERT INTO moz_places VALUES(1,?,?),(2,?,?)")
      .run("https://aux-import-firefox.example/bookmark", "Firefox fixture", "https://aux-import-firefox.example/history", "Firefox history");
    ffDb.prepare("INSERT INTO moz_bookmarks VALUES(11,1,1,3,0,?)").run("Firefox fixture");
    ffDb.prepare("INSERT INTO moz_historyvisits VALUES(1,2,?)").run((Date.now() - 3_600_000) * 1000);
    ffDb.close();
    importSourceFiles.push(arcSidebar, arcHistory, safariBookmarks, safariHistory, firefoxPlaces);
    report.importSourceHashes = Object.fromEntries(importSourceFiles.map(path =>
      [path.slice(importHome.length + 1), createHash("sha256").update(readFileSync(path)).digest("hex")]));
  }
  if (!rpcOnly) execFileSync("xcrun", ["swiftc", script, "-o", windowTool], { timeout: 120_000 });
  child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
    "--use-mock-keychain", "--password-store=basic",
    ...(settingsAutomationsJourney || settingsAutomationsCreateJourney || settingsAutomationsWakeJourney || settingsAutomationsFireJourney || settingsAutomationsPageChangeJourney ? ["--enable-logging=stderr", "--v=0"] : []),
    ...(httpFallbackJourney || httpFallbackDialogJourney ? ["--host-resolver-rules=MAP aux-recovery.test 127.0.0.1", "--no-proxy-server"] : []),
    ...(settingsContentBlockingJourney ? ["--host-resolver-rules=MAP hilltopads.net 127.0.0.1", "--no-proxy-server", "--disable-features=HttpsFirstBalancedModeAutoEnable,HttpsFirstModeV2ForEngagedSites,HttpsFirstModeV2ForTypicallySecureUsers"] : []),
    ...(siteBlockingExceptionJourney || siteBlockingPrivateJourney ? ["--host-resolver-rules=MAP hilltopads.net 127.0.0.1", "--no-proxy-server", "--disable-features=HttpsFirstBalancedModeAutoEnable,HttpsFirstModeV2ForEngagedSites,HttpsFirstModeV2ForTypicallySecureUsers"] : []),
    ...(settingsCustomListJourney ? ["--host-resolver-rules=MAP cdn.appround.biz 127.0.0.1", "--no-proxy-server", "--disable-features=HttpsFirstBalancedModeAutoEnable,HttpsFirstModeV2ForEngagedSites,HttpsFirstModeV2ForTypicallySecureUsers"] : []),
    ...(settingsCookieControlsJourney ? ["--host-resolver-rules=MAP localhost 127.0.0.1", "--no-proxy-server"] : []),
    ...(settingsHttpsFirstJourney ? [`--host-resolver-rules=MAP aux-s9-off.notarealdomain-auxprobe.com 127.0.0.1:${tcpFixture.address().port}, MAP aux-s9-on.notarealdomain-auxprobe.com 127.0.0.1:${tcpFixture.address().port}`, "--no-proxy-server", "--disable-features=HttpsFirstBalancedModeAutoEnable,HttpsFirstModeV2ForEngagedSites,HttpsFirstModeV2ForTypicallySecureUsers"] : []),
    ...(httpFallbackJourney ? ["--disable-features=HttpsFirstDialogUi"] : [])], {
    cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0", ...(browserImportUiJourney || browserImportFormatsJourney || browserImportAttachedJourney ? { AUX_IMPORT_SOURCE_HOME: importHome } : {}) }, stdio: ["ignore", "ignore", "pipe"],
  });
  const startupLog = join(output, "browser-stderr.log");
  child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
  const connection = await until("the Profile runtime", async () => {
    if (!existsSync(runtimeFile)) return null;
    assert.equal(statSync(runtimeFile).mode & 0o077, 0, "Runtime bearer must be owner-only");
    let value;
    try { value = JSON.parse(readFileSync(runtimeFile, "utf8")); } catch { return null; }
    if (!Number.isInteger(value.port) || !value.token) return null;
    rpcPort = value.port;
    rpcToken = value.token;
    const workspace = await rpc("workspace.get").catch(() => null);
    lastRuntimeStatus = workspace?.sessions?.map(({ sessionId, status, detail }) => ({ sessionId, status, detail }));
    return workspace?.sessions?.some(session => session.sessionId === "aux" && session.status === "connected") ? workspace : null;
  }, 30_000).catch(error => { throw new Error(`${error.message}; runtime sessions: ${JSON.stringify(lastRuntimeStatus ?? [])}; browser log: ${startupLog}`); });
  assert.ok(connection);
  const runtimeCapabilities = await rpc("runtime.describe");
  if (browserImportUiJourney || browserImportFormatsJourney || browserImportAttachedJourney || protectedStartupJourney || runtimeBackupRestoreJourney) {
    assert.equal(runtimeCapabilities.featureStages?.spaces, "preview", "Unrequalified candidate stages must remain preview");
  } else assert.equal(runtimeCapabilities.featureStages?.spaces, "on",
    "The runtime must derive qualified Spaces from the native method manifest");
  if (settingsContentBlockingJourney || siteBlockingExceptionJourney || siteBlockingPrivateJourney || settingsCustomListJourney) assert.equal(runtimeCapabilities.featureStages?.contentBlocking, "on", "Native content blocking must be qualified in the runtime capability manifest");
  assert.equal(existsSync(join(profile, "DevToolsActivePort")), false, "A raw debugging port must remain disabled");
  record("Profile runtime is authenticated and raw debugging is disabled", { sessions: connection.sessions?.length });

  if (protectedStartupJourney) {
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const inspect = () => {
      const db = new DatabaseSync(databasePath, { readOnly: true });
      try {
        return {
          error: db.prepare("SELECT error FROM model_calls WHERE call_id='legacy-startup'").get()?.error,
          run: db.prepare("SELECT goal,config FROM runs WHERE run_id='legacy-run'").get(),
          space: db.prepare("SELECT name FROM workspaces WHERE workspace_id='legacy-space'").get()?.name,
          task: db.prepare("SELECT json FROM tasks WHERE task_id='legacy-task'").get()?.json,
          evidence: db.prepare("SELECT json FROM task_evidence WHERE evidence_id='legacy-evidence'").get()?.json,
          setting: db.prepare("SELECT value FROM kv WHERE key='setting:nativeFixture'").get()?.value,
          mcp: db.prepare("SELECT body FROM outbound_mcp_servers WHERE server_id='legacy-mcp'").get()?.body,
          mcpGrant: db.prepare("SELECT body FROM outbound_mcp_grants WHERE grant_id='legacy-mcp-grant'").get()?.body,
          agent: db.prepare("SELECT name FROM agent_connections WHERE connection_id='legacy-agent'").get()?.name,
          calendar: db.prepare("SELECT account_key,account_key_lookup,label FROM calendar_connections WHERE connection_id='legacy-calendar'").get(),
          vault: db.prepare("SELECT label FROM vault_items WHERE item_id='legacy-vault'").get()?.label,
          vaultGrant: db.prepare("SELECT origin FROM vault_grants WHERE grant_id='legacy-vault-grant'").get()?.origin,
          vaultAudit: db.prepare("SELECT detail FROM vault_access WHERE grant_id='legacy-vault-grant'").get()?.detail,
          markers: db.prepare("SELECT key FROM aux_meta WHERE key LIKE 'protected_sqlite_v1:%' ORDER BY key").all().map(row => row.key),
        };
      } finally { db.close(); }
    };
    const migrated = inspect();
    assert.ok(migrated.error?.startsWith("auxenc:v1:"), "Legacy model error must migrate before services start");
    for (const value of [migrated.run?.goal, migrated.run?.config, migrated.space, migrated.task,
      migrated.evidence, migrated.setting, migrated.mcp, migrated.mcpGrant, migrated.agent,
      migrated.calendar?.account_key, migrated.calendar?.label,
      migrated.vault, migrated.vaultGrant, migrated.vaultAudit])
      assert.ok(value?.startsWith("auxenc:v1:"), "Legacy run, Space, Task, authority and credential metadata must migrate");
    assert.ok(migrated.calendar?.account_key_lookup?.startsWith("auxidx:v1:"),
      "Calendar account equality must use a keyed lookup after migration");
    assert.deepEqual(migrated.markers, ["datasets", "events", "model_calls", "page_sets", "programs",
      "response_metadata", "results", "run_messages", "operation_implementations", "operation_reconciliations",
      "safety_approval_requests", "safety_audit", "safety_send_journal", "set_members", "runs", "steps",
      "conversations", "workspaces", "tasks", "task_revisions", "task_evidence", "criterion_reviews",
      "criterion_verifications", "outbound_mcp_servers", "outbound_mcp_grants", "agent_connections",
      "vault_items", "vault_grants", "vault_access", "calendar_connections", "kv_filtered"].map(table => `protected_sqlite_v1:${table}`).sort());
    for (const marker of ["private startup marker", "private native run", "private native context", "private native space",
      "private native task", "private native evidence", "private native setting", "private native MCP",
      "private native MCP grant", "private native agent", "private-calendar-account", "private native calendar",
      "private native vault", "private native vault audit"])
      assert.equal(readFileSync(databasePath).includes(marker), false);
    record("native Keychain startup migrates adapted SQLite rows before runtime readiness", { tables: migrated.markers.length });
    console.log("Quit this disposable Aux window from the Aux menu, then the journey will relaunch the same Profile.");
    if (child.exitCode === null) await new Promise((resolveExit, rejectExit) => {
      const timeout = setTimeout(() => rejectExit(new Error("Timed out waiting for graceful Aux quit")), 180_000);
      child.once("exit", () => { clearTimeout(timeout); resolveExit(); });
    });
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted protected Profile runtime", async () => {
      try {
        const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
        rpcPort = descriptor.port; rpcToken = descriptor.token;
        return (await rpc("workspace.get")).sessions?.some(session => session.sessionId === "aux" && session.status === "connected");
      } catch { return false; }
    }, 60_000);
    assert.equal(inspect().error, migrated.error, "Protected row must remain stable across native restart");
    assert.equal(inspect().evidence, migrated.evidence, "Protected evidence must remain stable across native restart");
    assert.ok(Array.isArray(await rpc("workspaces.list", {})));
    record("protected SQLite row and authenticated runtime survive native restart");
    report.passed = true;
  } else if (browserImportAttachedJourney) {
    const chromeBinary = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    assert.ok(existsSync(chromeBinary), "The isolated attached-tabs journey needs installed Google Chrome");
    const chromeProfile = join(disposable, "attached-chrome");
    attachedChrome = spawn(chromeBinary, [`--user-data-dir=${chromeProfile}`, "--headless=new", "--remote-debugging-port=0",
      "--no-first-run", "--no-default-browser-check", "--disable-extensions", `${origin}/red`],
      { cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"] });
    attachedChrome.stderr.on("data", chunk => appendFileSync(join(output, "attached-chrome-stderr.log"), chunk));
    const chromePortFile = join(chromeProfile, "DevToolsActivePort");
    const chromePort = await until("isolated Chrome CDP endpoint", async () => {
      if (!existsSync(chromePortFile)) return null;
      const port = Number(readFileSync(chromePortFile, "utf8").split("\n")[0]);
      return Number.isInteger(port) && port > 0 ? port : null;
    });
    const created = await fetch(`http://127.0.0.1:${chromePort}/json/new?${encodeURIComponent(`${origin}/blue`)}`, { method: "PUT" });
    assert.equal(created.status, 200, "A second disposable Chrome tab must be available for import");
    await rpc("chrome.attach", { port: chromePort });
    const preview = await rpc("import.preview");
    assert.deepEqual(preview.sources.map(source => source.id), ["chrome", "chrome-attached"],
      "The attached-tab journey must not inspect the owner's installed browser Profiles");
    const attached = preview.sources.find(source => source.id === "chrome-attached");
    assert.equal(attached?.categories[0]?.category, "tabs");
    assert.equal(attached.categories[0].available, true);
    assert.equal(attached.categories[0].count, 2);
    record("disposable attached Chrome exposes two reviewed live tabs");
    const sourceTabs = (await rpc("chrome.tabs")).filter(tab => tab.type === "page" && tab.url.startsWith(origin));
    assert.deepEqual(sourceTabs.map(tab => tab.url).sort(), [`${origin}/blue`, `${origin}/red`]);
    const started = await rpc("import.run", { selections: [{ sourceId: "chrome-attached", categories: ["tabs"] }] });
    const finished = await until("attached tab import", async () => {
      const status = await rpc("import.status", { jobId: started.jobId });
      return status.done ? status : null;
    });
    assert.deepEqual(finished.report.results.map(result => [result.state, result.imported, result.skipped]), [["done", 2, 0]]);
    await until("imported native tabs", async () => {
      const pages = await rpc("pages.list");
      return [`${origin}/blue`, `${origin}/red`].every(url => pages.some(page => page.url === url && page.backend === "aux"));
    });
    assert.deepEqual((await rpc("chrome.tabs")).filter(tab => tab.type === "page" && tab.url.startsWith(origin))
      .map(tab => tab.url).sort(), sourceTabs.map(tab => tab.url).sort(), "Borrowed Chrome tabs must remain untouched");
    await rpc("chrome.detach");
    record("two live tabs open in native Aux while borrowed Chrome tabs stay unchanged");
    const selection = { sourceId: "chrome", profileId: "Default", categories: ["history"] };
    const cancelledRun = await rpc("import.run", { selections: [selection] });
    await rpc("import.cancel", { jobId: cancelledRun.jobId });
    const stopped = await until("cancelled native history import", async () => {
      const status = await rpc("import.status", { jobId: cancelledRun.jobId });
      return status.done ? status : null;
    }, 60_000);
    assert.equal(stopped.cancelled, true);
    assert.ok(stopped.report.results[0].imported < 5000, "Cancel must stop before all source rows are attempted");
    record("cancelled native History import reports partial work without completing the source");
    const resumedRun = await rpc("import.run", { selections: [selection,
      { sourceId: "chrome", profileId: "Profile 1", categories: ["history"] }] });
    const resumed = await until("resumed import and corrupt-source report", async () => {
      const status = await rpc("import.status", { jobId: resumedRun.jobId });
      return status.done ? status : null;
    }, 90_000);
    report.importRunDiagnostics = { cancelled: stopped.report, resumed: resumed.report };
    assert.deepEqual(resumed.report.results.map(result => result.state), ["done", "error"]);
    const nativeCount = () => {
      const db = new DatabaseSync(join(profile, "Default/History"), { readOnly: true });
      try { return db.prepare("SELECT COUNT(*) AS count FROM urls WHERE url LIKE 'https://aux-import-cancel.example/%'").get().count; }
      finally { db.close(); }
    };
    assert.equal(resumed.report.results[0].imported + resumed.report.results[0].skipped, 5000,
      "Retry after cancel must account for every source visit");
    await until("resumed History projection", async () =>
      (await rpc("history.list", { query: "aux-import-cancel", limit: 20 }))
        .some(item => item.url.startsWith("https://aux-import-cancel.example/")), 30_000);
    assert.deepEqual(Object.fromEntries(importSourceFiles.map(path =>
      [path.slice(importHome.length + 1), createHash("sha256").update(readFileSync(path)).digest("hex")])),
      report.importSourceHashes, "Both source History stores must remain unchanged");
    record("retry completes native History while a corrupt Profile reports an independent error");
    console.log("Quit this disposable Aux window from the Aux menu, then the journey will relaunch the same Profile.");
    if (child.exitCode === null) await new Promise((resolveExit, rejectExit) => {
      const timeout = setTimeout(() => rejectExit(new Error("Timed out waiting for graceful Aux quit")), 180_000);
      child.once("exit", () => { clearTimeout(timeout); resolveExit(); });
    });
    child.stderr.destroy();
    const nativeAfterQuit = nativeCount();
    report.nativeHistoryAfterQuit = nativeAfterQuit;
    assert.equal(nativeAfterQuit, 5000, "A graceful Quit must flush all imported History URLs without duplicates");
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0", AUX_IMPORT_SOURCE_HOME: importHome }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted attached-import Profile runtime", async () => {
      try {
        const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
        rpcPort = descriptor.port; rpcToken = descriptor.token;
        return (await rpc("workspace.get")).sessions?.some(session => session.sessionId === "aux" && session.status === "connected");
      } catch { return false; }
    }, 60_000);
    await until("restarted imported History", async () =>
      (await rpc("history.list", { query: "aux-import-cancel", limit: 20 }))
        .some(item => item.url.startsWith("https://aux-import-cancel.example/")), 30_000);
    const restoredTabs = (await rpc("pages.list")).filter(page =>
      page.url === `${origin}/red` || page.url === `${origin}/blue`);
    assert.deepEqual(restoredTabs.map(page => page.url).sort(), [`${origin}/blue`, `${origin}/red`],
      "Imported tabs must restore as native sleeping tabs");
    record("imported History and sleeping native tabs survive graceful restart");
    report.passed = true;
  } else if (browserImportFormatsJourney) {
    const selections = ["arc", "safari", "firefox"].map(sourceId => ({
      sourceId,
      profileId: sourceId === "arc" ? "Default" : sourceId === "safari" ? "Safari" : "fixture.default-release",
      categories: ["bookmarks", "history"],
    }));
    const preview = await rpc("import.preview");
    assert.deepEqual(preview.sources.filter(source => source.id !== "chrome-attached").map(source => source.id),
      ["arc", "safari", "firefox"]);
    for (const selection of selections) {
      const source = preview.sources.find(item => item.id === selection.sourceId);
      const reviewed = source?.profileCategories.find(item => item.profileId === selection.profileId);
      assert.deepEqual(reviewed?.categories.map(category => [category.category, category.available]),
        [["bookmarks", true], ["history", true]]);
    }
    record("isolated Arc, Safari and Firefox Profiles offer only their reviewed categories");
    const run = await rpc("import.run", { selections });
    const done = await until("three-source native import", async () => {
      const status = await rpc("import.status", { jobId: run.jobId });
      return status.done ? status : null;
    }, 60_000);
    assert.deepEqual(done.report.results.map(result => [result.source, result.category, result.state, result.imported]),
      ["arc", "safari", "firefox"].flatMap(source => [[source, "bookmarks", "done", 1], [source, "history", "done", 1]]));
    const bookmarkUrls = (await rpc("bookmarks.list")).map(item => item.url).filter(url => url.includes("aux-import-"));
    const historyUrls = (await rpc("history.list", { query: "aux-import", limit: 20 })).map(item => item.url);
    assert.deepEqual(bookmarkUrls.sort(), ["arc", "safari", "firefox"].map(source => `https://aux-import-${source}.example/bookmark`).sort());
    assert.deepEqual(historyUrls.sort(), ["arc", "safari", "firefox"].map(source => `https://aux-import-${source}.example/history`).sort());
    record("native bookmark and History stores contain one item from each reviewed format");
    const retry = await rpc("import.run", { selections });
    const retryDone = await until("idempotent format retry", async () => {
      const status = await rpc("import.status", { jobId: retry.jobId });
      return status.done ? status : null;
    }, 60_000);
    assert.ok(retryDone.report.results.every(result => result.imported === 0 && result.skipped === 1));
    assert.deepEqual(Object.fromEntries(importSourceFiles.map(path =>
      [path.slice(importHome.length + 1), createHash("sha256").update(readFileSync(path)).digest("hex")])),
      report.importSourceHashes);
    record("retry skips all six imported items and leaves source stores unchanged");
    console.log("Quit this disposable Aux window from the Aux menu, then the journey will relaunch the same Profile.");
    if (child.exitCode === null) await new Promise((resolveExit, rejectExit) => {
      const timeout = setTimeout(() => rejectExit(new Error("Timed out waiting for graceful Aux quit")), 180_000);
      child.once("exit", () => { clearTimeout(timeout); resolveExit(); });
    });
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0", AUX_IMPORT_SOURCE_HOME: importHome }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted imported Profile runtime", async () => {
      try {
        const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
        rpcPort = descriptor.port; rpcToken = descriptor.token;
        return (await rpc("workspace.get")).sessions?.some(session => session.sessionId === "aux" && session.status === "connected");
      } catch { return false; }
    }, 60_000);
    assert.deepEqual((await rpc("bookmarks.list")).map(item => item.url).filter(url => url.includes("aux-import-")).sort(), bookmarkUrls.sort());
    assert.deepEqual((await rpc("history.list", { query: "aux-import", limit: 20 })).map(item => item.url).sort(), historyUrls.sort());
    record("Arc, Safari and Firefox native destinations survive graceful restart");
    report.passed = true;
  } else if (browserImportUiJourney) {
    if (rpcOnly) throw new Error("The browser import acceptance needs the real Settings UI.");
    const preview = await rpc("import.preview");
    assert.deepEqual(preview.sources.filter(source => source.id !== "chrome-attached").map(source => source.id), ["chrome"],
      "Isolated import source root must expose only the disposable Chrome fixture");
    const chrome = preview.sources.find(source => source.id === "chrome");
    assert.deepEqual(chrome.profileCategories.map(item => item.profileId), ["Default", "Profile 1"]);
    record("source preview stays inside isolated disposable import root", { profiles: chrome.profiles });
    console.log("In Aux Settings → General → Import browser data, review Chrome's two Profiles. Select only Default History and Profile 1 Bookmarks, then choose Import selected (2).");
    await until("reviewed Profile import in native history and bookmarks", async () => {
      const bookmarks = await rpc("bookmarks.list");
      const history = await rpc("history.list", { query: "aux-import", limit: 20 });
      return bookmarks.some(item => item.url === "https://aux-import-work.example/bookmark") &&
        history.some(item => item.url === "https://aux-import-default.example/history");
    }, 300_000);
    const bookmarks = await rpc("bookmarks.list");
    const history = await rpc("history.list", { query: "aux-import", limit: 20 });
    assert.deepEqual(bookmarks.filter(item => item.url.includes("aux-import-")).map(item => item.url),
      ["https://aux-import-work.example/bookmark"]);
    assert.deepEqual(history.filter(item => item.url.includes("aux-import-")).map(item => item.url),
      ["https://aux-import-default.example/history"]);
    assert.equal(native("has-text", "Import finished"), "true", "Settings must report completion");
    record("native Settings imported exactly the two reviewed source/Profile/category pairs", {});
    const retry = await rpc("import.run", { selections: [
      { sourceId: "chrome", profileId: "Default", categories: ["history"] },
      { sourceId: "chrome", profileId: "Profile 1", categories: ["bookmarks"] },
    ] });
    const retryStatus = await until("idempotent retry", async () => {
      const status = await rpc("import.status", { jobId: retry.jobId });
      return status.done ? status : null;
    });
    assert.deepEqual(retryStatus.report.results.map(result => result.imported), [0, 0]);
    assert.deepEqual(retryStatus.report.results.map(result => result.skipped), [1, 1]);
    record("reviewed retry skips existing native bookmark and history visit", {});
    await assert.rejects(rpc("import.run", { selections: [
      { sourceId: "chrome", profileId: "Owner Profile", categories: ["history"] },
    ] }), /invalid_params/);
    const sourceHashes = Object.fromEntries(importSourceFiles.map(path =>
      [path.slice(importHome.length + 1), createHash("sha256").update(readFileSync(path)).digest("hex")]));
    assert.deepEqual(sourceHashes, report.importSourceHashes, "Source browser stores must remain unchanged");
    record("source files are unchanged and an unreviewed Profile is refused", {});
    console.log("Quit this disposable Aux window from the Aux menu, then the journey will relaunch the same Profile.");
    if (child.exitCode === null) await new Promise((resolveExit, rejectExit) => {
      const timeout = setTimeout(() => rejectExit(new Error("Timed out waiting for graceful Aux quit")), 180_000);
      child.once("exit", () => { clearTimeout(timeout); resolveExit(); });
    });
    child.stderr.destroy();
    const nativeHistoryDb = new DatabaseSync(join(profile, "Default/History"), { readOnly: true });
    report.nativeAfterFirstExit = nativeHistoryDb.prepare(
      "SELECT url, visit_count FROM urls WHERE url LIKE 'https://aux-import-%' ORDER BY url").all();
    nativeHistoryDb.close();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0", AUX_IMPORT_SOURCE_HOME: importHome }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted Profile runtime", async () => {
      try {
        const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
        rpcPort = descriptor.port; rpcToken = descriptor.token;
        return (await rpc("workspace.get")).sessions?.some(session => session.sessionId === "aux" && session.status === "connected");
      } catch { return false; }
    }, 60_000);
    await until("imported history projection after restart", async () =>
      (await rpc("history.list", { query: "aux-import", limit: 20 })).some(item =>
        item.url === "https://aux-import-default.example/history"), 60_000);
    assert.deepEqual((await rpc("bookmarks.list")).filter(item => item.url.includes("aux-import-")).map(item => item.url),
      ["https://aux-import-work.example/bookmark"]);
    record("selected native history and bookmark survive full Aux restart", {});
    report.passed = true;
  } else if (runtimeBackupRestoreJourney) {
    await rpc("settings.set", { tabLayout: "vertical" });
    const runtimeStage = (await rpc("runtime.describe")).featureStages?.electronMigration;
    assert.equal(runtimeStage, "on", "disposable runtime acceptance marker must be source-bound and active");
    record("disposable runtime accepted only the reviewed backup feature", { feature: "electronMigration" });
    const dataDir = join(profile, "Default/Aux Runtime Data");
    const marker = `Post backup ${Date.now()}`;
    console.log("In Aux Settings → General → Task data backup, choose Create backup.");
    const backup = await until("native-created runtime backup", async () => {
      const listed = await rpc("installation.listBackups");
      return listed.find(item => item.name.startsWith("aux-runtime-"));
    }, 180_000);
    assert.ok(existsSync(join(backup.path, "manifest.json")));
    record("native Settings created a valid local runtime backup", { schemaVersion: backup.schemaVersion });
    const created = await rpc("workspaces.create", { name: marker });
    assert.ok((await rpc("workspaces.list")).some(item => item.workspaceId === created.workspaceId));
    console.log(`Choose Restore backup in Aux Settings and select ${backup.path}.`);
    await until("native staged restore", () => existsSync(join(dataDir, "pending-runtime-restore.json")), 180_000);
    const pending = JSON.parse(readFileSync(join(dataDir, "pending-runtime-restore.json"), "utf8"));
    assert.equal(pending.version, 2);
    record("native folder picker staged the validated backup", { artifactFiles: pending.artifactFiles.length });
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted runtime after restore", async () => {
      const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
      if (descriptor.pid === undefined) return false;
      rpcPort = descriptor.port;
      rpcToken = descriptor.token;
      return (await rpc("workspace.get").catch(() => null))?.sessions?.some(session => session.sessionId === "aux" && session.status === "connected");
    }, 60_000);
    assert.equal((await rpc("workspaces.list")).some(item => item.workspaceId === created.workspaceId), false);
    const status = JSON.parse(readFileSync(join(dataDir, "runtime-restore-status.json"), "utf8"));
    assert.ok(status.lastAppliedAt > 0);
    assert.equal(existsSync(join(dataDir, "pending-runtime-restore.json")), false);
    const snapshots = readdirSync(join(dataDir, "recovery")).filter(name => name.startsWith("runtime-"));
    assert.equal(snapshots.length, 1);
    const recovery = new DatabaseSync(join(dataDir, "recovery", snapshots[0], "state.sqlite"), { readOnly: true });
    try {
      assert.ok(recovery.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(created.workspaceId));
    } finally { recovery.close(); }
    record("restart applied the backup and preserved the replaced database", { recoverySnapshots: snapshots.length });
    report.passed = true;
  } else if (unpackedExtensionJourney) {
    await rpc("settings.set", { tabLayout: "vertical" });
    const extensionPath = join(disposable, "aux-disposable-extension");
    mkdirSync(extensionPath);
    const manifestPath = join(extensionPath, "manifest.json");
    const writeManifest = version => writeFileSync(manifestPath,
      `${JSON.stringify({ manifest_version: 3, name: "Aux Disposable Extension", version, description: "Disposable native extension journey" })}\n`);
    writeManifest("1.0.0");
    const preferences = join(profile, "Default/Secure Preferences");
    const extension = () => {
      if (!existsSync(preferences)) return null;
      const installed = Object.entries(JSON.parse(readFileSync(preferences, "utf8")).extensions?.settings ?? {});
      return installed.find(([, value]) => value.path === realpathSync(extensionPath)) ?? null;
    };
    console.log(`In Aux Settings → Extensions, choose Install unpacked, then select ${extensionPath}.`);
    const installed = await until("unpacked extension install", () => extension(), 120_000);
    assert.equal(installed[1].location, 4, "Chromium must retain the unpacked source location");
    record("Chromium installed the selected unpacked extension", { id: installed[0] });
    const previousUpdate = installed[1].last_update_time;
    writeManifest("1.0.1");
    console.log("Click Update for Aux Disposable Extension in the same Settings panel.");
    await until("unpacked extension update", () => extension()?.[1].last_update_time !== previousUpdate, 120_000);
    record("Chromium reloaded the same extension identity from its selected folder", { id: installed[0] });
    report.passed = true;
  } else if (healthDiagnosticsJourney) {
    await rpc("settings.set", { tabLayout: "vertical" });
    const preferences = join(profile, "Default/Preferences");
    const savedReport = join(disposable, "Aux-support-report.json");
    const health = () => JSON.parse(readFileSync(preferences, "utf8")).aux?.health;
    await until("native health sample in disposable Profile", () =>
      existsSync(preferences) && health()?.samples?.length >= 1);
    const first = health();
    assert.ok(first.samples[0].memory > 0);
    assert.ok(first.samples[0].windows >= 1);
    assert.ok(first.samples[0].session >= 1);
    record("health sampler records aggregate browser-process metrics", {
      sampleCount: first.samples.length, windows: first.samples[0].windows,
    });
    console.log(`Open Settings → General → Browser health. Export the support report to ${savedReport}, then click Clear.`);
    await until("native support report save", () => existsSync(savedReport), 120_000);
    const exported = JSON.parse(readFileSync(savedReport, "utf8"));
    assert.equal(exported.format, "aux-support-report-v1");
    assert.ok(exported.availableHostMethods > 90);
    assert.ok(exported.health.samples >= 1);
    assert.equal(exported.health.sessions, 1);
    assert.equal(typeof exported.health.memoryMb.p95, "number");
    assert.equal(typeof exported.modes.httpsUpgradeEnabled, "boolean");
    const reportText = readFileSync(savedReport, "utf8");
    assert.ok(!reportText.includes(profile), "Report must not contain the Profile path");
    assert.ok(!reportText.includes(origin), "Report must not contain visited URLs");
    assert.ok(!reportText.includes("fixture-user"), "Report must not contain credentials");
    record("native support report contains only scoped aggregate diagnostics", {
      methods: exported.availableHostMethods, samples: exported.health.samples,
    });
    await until("native health clear", () => {
      const cleared = health();
      return cleared?.sessions === 1 && cleared.samples?.every(row =>
        row.at > exported.health.latestAt);
    }, 120_000);
    record("Clear removes prior samples and retains the current session", {});
    report.passed = true;
  } else if (paintLease) {
    const cover = await rpc("pages.open", { url: `${origin}/cover`, activate: true });
    const agent = await rpc("pages.open", { url: `${origin}/agent`, background: true, ownedByRuntime: true, activate: false });
    const plain = await rpc("pages.open", { url: `${origin}/plain`, background: true, ownedByRuntime: false, activate: false });
    await until("paint-lease pages to load", async () => {
      const pages = await rpc("pages.list");
      return [cover, agent, plain].every((page) => pages.some((item) => item.pageId === page.pageId && !item.loading));
    });
    await rpc("pages.activate", { pageId: cover.pageId });
    const before = await rpc("pages.list");
    const agentRow = before.find((item) => item.pageId === agent.pageId);
    assert.notEqual(agentRow?.viewStatus, "visible", "The agent tab must stay off the visible stage");
    await delay(2500);
    const agentText = JSON.stringify(await rpc("pages.observe", { pageId: agent.pageId }));
    const plainText = JSON.stringify(await rpc("pages.observe", { pageId: plain.pageId }));
    const agentFrames = Number(agentText.match(/agent frames (\d+)/)?.[1] ?? 0);
    const plainFrames = Number(plainText.match(/plain frames (\d+)/)?.[1] ?? 0);
    record("background agent tab frame count", { agentFrames, plainFrames, viewStatus: agentRow?.viewStatus });
    assert.ok(agentFrames >= 15, `Background agent tab produced ${agentFrames} frames; plain background tab produced ${plainFrames}`);
    report.passed = true;
  } else if (linkStatusJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/link-status`, activate: true });
    await until("the disposable link page", async () =>
      /Hover destination/.test(JSON.stringify(await rpc("pages.observe", { pageId: page.pageId }).catch(() => ({})))));
    console.log("Move the pointer over Hover destination on the disposable page.");
    await until("the native link destination in Aux", () =>
      native("has-text", `${origin}/link-target`) === "true", 120_000);
    record("Chromium link hover displays its destination in the Aux page surface", { pageId: page.pageId });
    console.log("Move the pointer away from the link into blank page space.");
    await until("link destination to clear after pointer exit", () =>
      native("has-text", `${origin}/link-target`) === "false", 120_000);
    record("link destination clears after leaving the link", {});
    report.passed = true;
  } else if (passwordTransferJourney) {
    if (rpcOnly) throw new Error("Password transfer needs the native Settings and file dialogs.");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const transferPassphrase = "fixture-transfer-passphrase-123";
    const fixturePassword = "disposable-secret-123";
    const fixturePath = join(disposable, "fixture.auxvault");
    const exportPath = join(disposable, "exported.auxvault");
    const salt = randomBytes(16);
    const nonce = randomBytes(12);
    const key = scryptSync(transferPassphrase, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    const cipher = createCipheriv("aes-256-gcm", key, nonce);
    cipher.setAAD(Buffer.from("aux-vault-transfer:v1"));
    const plaintext = Buffer.from(JSON.stringify({ exportedAt: Date.now(), items: [{
      label: "Disposable sign-in", kind: "password", origin: "https://aux-transfer.test", username: "fixture-user", secret: fixturePassword,
    }] }));
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    writeFileSync(fixturePath, JSON.stringify({ format: "aux-vault-transfer", version: 1,
      kdf: "scrypt-n16384-r8-p1", cipher: "aes-256-gcm", salt: salt.toString("hex"),
      nonce: nonce.toString("hex"), tag: cipher.getAuthTag().toString("hex"), ciphertext: ciphertext.toString("base64") }));
    key.fill(0);
    plaintext.fill(0);
    console.log(`In Settings → Passwords & Autofill → Saved passwords, enter an incorrect passphrase, choose Import, and select ${fixturePath}.`);
    await until("wrong-passphrase rejection", () => native("has-name", "The encrypted file or passphrase is invalid") === "true", 180_000);
    record("Native import rejects an invalid passphrase without changing the Profile store", {});
    if (process.argv.includes("--refusal-only")) {
      report.passed = true;
    } else {
    console.log(`Enter ${transferPassphrase}, choose Import, and select ${fixturePath}.`);
    await until("Chromium Profile password import", () => native("has-name", "1 password imported") === "true", 180_000);
    record("Native import reported one disposable password added to Chromium's Profile store", {});
    console.log(`Enter ${transferPassphrase}, choose Export, and save to ${exportPath}.`);
    await until("encrypted native password export", () => existsSync(exportPath), 180_000);
    const exported = JSON.parse(readFileSync(exportPath, "utf8"));
    assert.equal(exported.format, "aux-vault-transfer");
    assert.equal(exported.version, 1);
    assert.ok(!readFileSync(exportPath, "utf8").includes(fixturePassword), "Export must not contain plaintext password");
    const exportKey = scryptSync(transferPassphrase, Buffer.from(exported.salt, "hex"), 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    const decipher = createDecipheriv("aes-256-gcm", exportKey, Buffer.from(exported.nonce, "hex"));
    decipher.setAAD(Buffer.from("aux-vault-transfer:v1"));
    decipher.setAuthTag(Buffer.from(exported.tag, "hex"));
    const decoded = JSON.parse(Buffer.concat([decipher.update(Buffer.from(exported.ciphertext, "base64")), decipher.final()]).toString("utf8"));
    exportKey.fill(0);
    assert.ok(decoded.items.some(item => item.origin === "https://aux-transfer.test" && item.username === "fixture-user" && item.secret === fixturePassword));
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    const loginData = join(profile, "Default/Login Data");
    const db = new DatabaseSync(loginData, { readOnly: true });
    try {
      assert.equal(db.prepare("SELECT count(*) AS count FROM logins WHERE origin_url LIKE 'https://aux-transfer.test%'").get().count, 1);
    } finally { db.close(); }
    record("Native export wrote an authenticated encrypted file compatible with Aux transfer v1", { imported: 1, exported: decoded.items.length });
    report.passed = true;
    }
  } else if (autofillJourney) {
    if (rpcOnly) throw new Error("Autofill needs the native accessibility tree.");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("settings.set", { autofill: { name: "Fixture Person", email: "fixture@example.test", street: "123 Test Street", city: "Testville", postal: "12345" } });
    console.log("Open Settings → Passwords & Autofill → Personal info and choose Import prior Aux personal info into Chromium.");
    await until("legacy personal info imported", async () =>
      !Object.keys((await rpc("settings.get"))?.autofill ?? {}).length, 180_000);
    record("legacy Aux personal info explicitly migrated to Chromium", {});
    const page = await rpc("pages.open", { url: `${origin}/autofill`, activate: true });
    await until("the disposable personal info form", async () =>
      /Disposable personal info form/.test(JSON.stringify(await rpc("pages.observe", { pageId: page.pageId }).catch(() => ({})))));
    console.log("Open the command palette and choose Fill personal info on the disposable loopback form.");
    await until("Chromium filled the disposable personal info form", async () => {
      const observation = JSON.stringify(await rpc("pages.observe", { pageId: page.pageId, scope: "forms" }).catch(() => ({})));
      return observation.includes("Fixture Person") && observation.includes("fixture@example.test") && observation.includes("123 Test Street");
    }, 180_000);
    record("Chromium filled saved Profile contact and address fields in a real form", { pageId: page.pageId });
    report.passed = true;
  } else if (passwordFillBoundaryJourney) {
    if (rpcOnly) throw new Error("Password fill boundary needs the native accessibility tree.");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/password-offer`, activate: true });
    await until("the disposable sign-in page", async () =>
      /Disposable sign-in/.test(JSON.stringify(await rpc("pages.observe", { pageId: page.pageId }).catch(() => ({})))));
    console.log("Open the command palette and choose Fill sign-in on the disposable HTTP page.");
    await until("the native password fill refusal", () =>
      native("has-text", "No saved password was filled") === "true", 120_000);
    assert.equal(passwordSubmissions, 0, "A refused fill must not submit the form");
    record("Password fill refuses HTTP before touching Chromium's saved password store", { pageId: page.pageId, submissions: passwordSubmissions });
    report.passed = true;
  } else if (passwordOfferJourney || passwordPromptJourney) {
    if (rpcOnly) throw new Error("Password offer needs the native accessibility tree.");
    const credentialWindow = await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log(`Disposable Aux window ID: ${credentialWindow.id}`);
    const page = await rpc("pages.open", { url: `${origin}/password-offer`, activate: true });
    await until("the disposable sign-in page", async () =>
      /Disposable sign-in/.test(JSON.stringify(await rpc("pages.observe", { pageId: page.pageId }).catch(() => ({})))));
    console.log("Enter fixture-user / fixture-pass in the disposable sign-in form and click Sign in.");
    await until("the fixture sign-in submission", () => passwordSubmissions === 1, 180_000);
    await until("the Aux password offer", () => native("has-text", "Save sign-in?") === "true", 30_000);
    record("Chromium pending password appears in the Aux owning-window prompt", { passwordSubmissions });
    if (passwordPromptJourney) {
      child.kill("SIGTERM");
      if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
      child.stderr.destroy();
      const loginData = join(profile, "Default/Login Data");
      if (existsSync(loginData)) {
        const db = new DatabaseSync(loginData, { readOnly: true });
        try {
          const count = db.prepare("SELECT COUNT(*) AS count FROM logins WHERE origin_url = ? AND username_value = ?")
            .get(`${origin}/`, "fixture-user")?.count;
          assert.equal(count, 0, "The credential must not be saved before explicit consent");
        } finally { db.close(); }
      }
      record("Chromium has not stored the fixture credential before consent", { savedRows: 0 });
      report.passed = true;
    } else {
      console.log("Click Save in the Aux password offer.");
      const loginData = join(profile, "Default/Login Data");
      await until("Chromium saved the disposable credential", () => {
        if (!existsSync(loginData)) return false;
        try {
          const db = new DatabaseSync(loginData, { readOnly: true });
          const count = db.prepare("SELECT COUNT(*) AS count FROM logins WHERE origin_url = ? AND username_value = ?")
            .get(`${origin}/`, "fixture-user")?.count;
          db.close();
          return count === 1;
        } catch { return false; }
      }, 180_000);
      await until("password offer dismissal", () => native("has-text", "Save sign-in?") === "false", 30_000);
      record("Aux Save persists one credential in Chromium's Profile store", { savedRows: 1 });
      report.passed = true;
    }
  } else if (httpAuthJourney || httpAuthCancelJourney) {
    if (rpcOnly) throw new Error("HTTP authentication needs the native accessibility tree.");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/http-auth`, activate: true });
    await until("the disposable auth challenge", () => authChallenges > 0);
    await until("the Aux HTTP authentication prompt", () =>
      native("has-text", "Sign in to website") === "true" &&
      native("has-text", "Aux fixture") === "true", 30_000);
    assert.equal(authAuthorized, 0, "The protected fixture must not load before sign-in");
    record("native shell shows the loopback HTTP authentication challenge", { authChallenges });
    if (httpAuthCancelJourney) {
      console.log("Click Cancel in the Aux sign-in prompt for the disposable fixture.");
      await until("auth prompt dismissal after cancellation", () =>
        native("has-text", "Sign in to website") === "false", 120_000);
      assert.equal(authAuthorized, 0, "Cancellation must not load protected content");
      const observed = JSON.stringify(await rpc("pages.observe", { pageId: page.pageId }).catch(() => ({})));
      assert.doesNotMatch(observed, /Protected fixture loaded/);
      record("HTTP authentication cancellation dismisses the prompt without loading protected content", { authChallenges, authAuthorized });
      report.passed = true;
    } else {
    console.log("Enter fixture-user / fixture-pass in the Aux sign-in prompt, then click Sign in.");
    await until("the authorized fixture response", () => authAuthorized > 0, 120_000);
    await until("protected fixture content", async () =>
      /Protected fixture loaded/.test(JSON.stringify(await rpc("pages.observe", { pageId: page.pageId }).catch(() => ({})))), 30_000);
    await until("auth prompt dismissal", () => native("has-text", "Sign in to website") === "false", 30_000);
    record("HTTP authentication loads the protected page and dismisses its prompt", { authChallenges, authAuthorized });
    report.passed = true;
    }
  } else if (httpFallbackDialogJourney) {
    const url = `http://aux-recovery.test:${fixture.address().port}/http-fallback`;
    const page = await rpc("pages.open", { url, activate: true });
    await until("Chromium HTTPS-first warning dialog", () =>
      native("has-button", "Continue to site") === "true" ||
      native("has-button", "Continue") === "true", 30_000);
    assert.equal(httpFallbackRequests, 0, "HTTP fixture must stay blocked before the dialog decision");
    record("default Chromium HTTPS-first dialog blocks the local fallback", { pageId: page.pageId });
    console.log("Click the native HTTPS warning dialog's Continue button for the disposable local fixture.");
    await until("default HTTPS-first continuation", async () =>
      httpFallbackRequests > 0 && (await rpc("pages.list")).some(item =>
        item.pageId === page.pageId && !item.navigationError && !item.loading), 120_000);
    record("default Chromium warning continues only after its local user decision", { pageId: page.pageId, httpFallbackRequests });
    report.passed = true;
  } else if (httpFallbackJourney) {
    const url = `http://aux-recovery.test:${fixture.address().port}/http-fallback`;
    const page = await rpc("pages.open", { url, activate: true });
    const failed = await until("HTTPS-first fallback warning", async () =>
      (await rpc("pages.list")).find(item => item.pageId === page.pageId &&
        item.navigationError?.upgradedFrom === url), 30_000);
    await until("HTTP fallback recovery control", () =>
      native("has-button", "Continue over HTTP") === "true", 30_000);
    assert.equal(httpFallbackRequests, 0, "HTTP fixture must stay blocked before acceptance");
    record("HTTPS upgrade fallback waits for a local user decision", failed.navigationError);
    console.log("Click Continue over HTTP in the disposable Aux fallback fixture.");
    await until("HTTP fallback fixture after explicit acceptance", async () =>
      httpFallbackRequests > 0 && (await rpc("pages.list")).some(item =>
        item.pageId === page.pageId && !item.navigationError && !item.loading), 120_000);
    record("native HTTP fallback loads only the approved local fixture", { pageId: page.pageId, httpFallbackRequests });
    report.passed = true;
  } else if (certificateRecoveryJourney) {
    const url = `${tlsOrigin}/cert`;
    const page = await rpc("pages.open", { url, activate: true });
    const failed = await until("native certificate failure", async () =>
      (await rpc("pages.list")).find(item => item.pageId === page.pageId &&
        item.navigationError?.url === url && /ERR_CERT_/.test(item.navigationError.message)), 30_000);
    assert.equal(tlsRequests, 0, "TLS fixture content must remain blocked before acceptance");
    await until("certificate recovery control", () =>
      native("has-button", "Proceed anyway (unsafe)") === "true", 30_000);
    record("native certificate error reaches Aux recovery UI without loading fixture content", failed.navigationError);
    console.log("Click Proceed anyway (unsafe) in the disposable Aux certificate fixture.");
    await until("certificate fixture after explicit acceptance", async () =>
      tlsRequests > 0 && (await rpc("pages.list")).some(item =>
        item.pageId === page.pageId && !item.navigationError && !item.loading), 120_000);
    record("native certificate exception loads only the approved local fixture", { pageId: page.pageId, tlsRequests });
    report.passed = true;
  } else if (navigationRecoveryJourney) {
    const failedUrl = `https://127.0.0.1:${fixture.address().port}/red`;
    const page = await rpc("pages.open", { url: failedUrl, activate: true });
    let failed;
    try {
      failed = await until("native main-frame navigation failure", async () =>
        (await rpc("pages.list")).find(item => item.pageId === page.pageId &&
          item.navigationError?.url === failedUrl), 30_000);
    } catch (error) {
      const current = (await rpc("pages.list")).find(item => item.pageId === page.pageId);
      throw new Error(`${error.message}; current page: ${JSON.stringify(current)}`);
    }
    assert.match(failed.navigationError.message, /ERR_/);
    record("native catalog and runtime report the failed main-frame URL", failed.navigationError);
    await rpc("pages.navigate", { pageId: page.pageId, url: `${origin}/red` });
    await until("successful navigation clears native failure", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId &&
        item.url === `${origin}/red` && !item.navigationError && !item.loading), 30_000);
    record("successful local navigation clears the failure", { pageId: page.pageId });
    report.passed = true;
  } else if (edgeLeewayJourney) {
    const window = await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("edge fixture page", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading));
    await rpc("settings.set", { tabLayout: "vertical" });
    await until("sidebar toggle control", () => native("has-button", "Show sidebar") === "true");
    native("activate");
    const y = window.y + window.height * 0.55;
    native("move", window.x + window.width * 0.8, y);
    native("move", window.x + 2, y);
    await until("floating sidebar at native entry edge", () =>
      native("has-button", "Keep sidebar open") === "true", 10_000);
    native("move", window.x + 10, y);
    await delay(300);
    assert.equal(native("has-button", "Keep sidebar open"), "true", "Sidebar must persist inside the 8 px exit leeway");
    record("native edge enter survives movement into the exit leeway over a guest page", { pageId: page.pageId });
    native("move", window.x + window.width * 0.8, y);
    await until("floating sidebar dismissal after leaving native edge", () =>
      native("has-button", "Keep sidebar open") === "false");
    record("sidebar dismisses after leaving the native edge", { pageId: page.pageId });
    report.passed = true;
  } else if (searchEnginePrefsJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("In the disposable Aux window, open Settings → General and choose DuckDuckGo as the search engine.");
    const expected = "https://duckduckgo.com/?q=%s";
    await until("search engine setting saved", async () => (await rpc("settings.get")).searchEngine === expected, 120_000);
    record("Settings saves the selected search engine", { searchEngine: expected });
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    }, 30_000);
    await until("restarted search engine", async () => {
      try {
        const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
        rpcPort = descriptor.port;
        rpcToken = descriptor.token;
        return (await rpc("settings.get")).searchEngine === expected;
      } catch { return false; }
    }, 30_000);
    record("restarted Aux retains the selected search engine", { searchEngine: expected });
    report.passed = true;
  } else if (appearancePrefsJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const prefsPath = join(profile, "Default/Preferences");
    const appearance = () => {
      try { return JSON.parse(readFileSync(prefsPath, "utf8")).aux?.appearance ?? {}; }
      catch { return {}; }
    };
    console.log("In the disposable Aux window, open Settings → Appearance. Choose Light theme and Title bar native material.");
    await until("native appearance choices persisted", () => {
      const value = appearance();
      return value.theme === "light" && value.material === "titlebar" && value.glass === true;
    }, 180_000);
    record("native window appearance choices persist in the Chromium Profile", appearance());
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    }, 30_000);
    assert.deepEqual(appearance(), { theme: "light", glass: true, material: "titlebar" });
    record("restarted Aux retains the saved native appearance Profile values", appearance());
    report.passed = true;
  } else if (menuPrimitivesJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("settings.set", { tabLayout: "vertical" });
    native("activate");
    console.log("In the disposable Aux window, open the Personal Space switcher.");
    await until("Space switcher menu", () =>
      native("has-name", "Spaces and browser controls") === "true" &&
      native("has-name", "New space") === "true", 120_000);
    record("native vertical Space switcher exposes the shared Menu actions");
    console.log("Press Escape to dismiss the Space switcher.");
    await until("Space switcher dismissed", () =>
      native("has-name", "Spaces and browser controls") === "false", 120_000);
    record("Escape dismisses the shared Space Menu");
    console.log("Open More in the disposable vertical sidebar.");
    await until("Browser tools menu", () =>
      native("has-name", "Browser tools") === "true" &&
      native("has-name", "Tasks") === "true", 120_000);
    record("native sidebar Browser tools exposes the shared Menu actions");
    console.log("Press Escape to dismiss Browser tools.");
    await until("Browser tools dismissed", () =>
      native("has-name", "Browser tools") === "false", 120_000);
    record("Escape dismisses the shared Browser tools Menu");
    report.passed = true;
  } else if (toastPrimitivesJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    native("activate");
    console.log("In the disposable Aux window, use Search browser to run Fill personal info on the empty New Tab.");
    await until("a no-data info toast", () =>
      native("has-name", "No saved personal info was filled") === "true", 120_000);
    record("native info Toast announces that no personal info was filled");
    await until("info toast timeout", () =>
      native("has-name", "No saved personal info was filled") === "false", 10_000);
    record("native info Toast clears after its unattended display interval");
    report.passed = true;
  } else if (popoverJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("In the disposable Aux window, open New chat, then Browser context.");
    await until("browser-context popover", () =>
      native("has-name", "Find browser context") === "true" &&
      native("has-name", "Start without an existing page") === "true", 120_000);
    record("native browser-context popover shows its search and available tabs");
    console.log("Press Escape to dismiss the browser-context popover.");
    await until("browser-context popover dismissed", () =>
      native("has-name", "Find browser context") === "false", 120_000);
    record("Escape dismisses the browser-context popover");
    report.passed = true;
  } else if (profileConfirmationJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const statePath = join(profile, "Local State");
    const registered = () => {
      try { return JSON.parse(readFileSync(statePath, "utf8")).profile?.info_cache ?? {}; }
      catch { return {}; }
    };
    console.log("In the disposable Aux window, open Settings → Profiles and create a Profile named Dialog Fixture.");
    const created = await until("registered dialog fixture Profile", () => {
      if (native("has-text", "profiles is preview in chromium-fork") === "true")
        throw new Error("The pinned build still gates browser Profiles as preview; the live confirmation needs a qualified Profiles build.");
      return Object.entries(registered()).find(([, data]) => data?.name === "Dialog Fixture");
    }, 180_000);
    const profileId = created[0];
    await until("created Profile preferences", () => existsSync(join(profile, profileId, "Preferences")), 30_000);
    console.log("Close the new Profile window. In the original window, choose Dialog Fixture → Delete… and inspect the confirmation. Then choose Keep Profile.");
    await until("named Profile deletion confirmation", () =>
      native("has-button", "Keep Profile") === "true" && native("has-button", "Delete permanently") === "true", 180_000);
    record("named native Profile confirmation appears before deletion", { profileId });
    await until("Profile confirmation cancelled", () => native("has-button", "Keep Profile") === "false", 120_000);
    assert.equal(registered()[profileId]?.name, "Dialog Fixture", "Cancellation must retain the Profile");
    assert.ok(existsSync(join(profile, profileId, "Preferences")), "Cancellation must retain Profile data");
    record("cancelling Profile deletion retains its registration and data", { profileId });
    report.passed = true;
  } else if (profilesJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log(`Profiles journey in disposable user-data directory ${profile}. Open Settings → Profiles and create a Profile named Roadmap Disposable.`);
    const statePath = join(profile, "Local State");
    const readProfiles = () => {
      try { return JSON.parse(readFileSync(statePath, "utf8")).profile?.info_cache ?? {}; }
      catch { return {}; }
    };
    const created = await until("registered disposable Profile", () => {
      if (native("has-text", "profiles is preview in chromium-fork") === "true")
        throw new Error("The pinned build still gates browser Profiles as preview; this journey needs a qualified Profiles build.");
      return Object.entries(readProfiles()).find(([, data]) => data?.name === "Roadmap Disposable");
    }, 600_000);
    const profileId = created[0];
    assert.ok(profileId !== "Default" && profileId !== "default");
    await until("created Profile preferences", () =>
      existsSync(join(profile, profileId, "Preferences")), 30_000);
    record("native Profile creation registers a separate Chromium data directory", { profileId });
    console.log("Close the new Profile window, then rename Roadmap Disposable to Roadmap Renamed in the original window.");
    await until("renamed disposable Profile", () => readProfiles()[profileId]?.name === "Roadmap Renamed", 600_000);
    record("native Profile rename persists in Chromium Profile attributes", { profileId });
    console.log("Archive Roadmap Renamed, then restore it from Archived profiles.");
    const archived = () => {
      try { return JSON.parse(readFileSync(statePath, "utf8")).aux?.archived_profiles?.[profileId] === true; }
      catch { return false; }
    };
    await until("archived disposable Profile", archived, 600_000);
    assert.ok(existsSync(join(profile, profileId, "Preferences")), "Archiving must preserve browsing data");
    record("native Profile archive preserves its data", { profileId });
    await until("restored disposable Profile", () => !archived(), 600_000);
    record("native Profile restore clears the archived state", { profileId });
    console.log("Delete Roadmap Renamed with the explicit confirmation in the original window.");
    await until("removed disposable Profile registration", () =>
      !readProfiles()[profileId], 600_000);
    record("native Profile deletion removes the registered Profile", { profileId });
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    const localState = JSON.parse(readFileSync(statePath, "utf8"));
    assert.ok(localState.profiles?.profile_basenames_deleted?.includes(profileId),
      "Chromium must queue the orphaned Profile directory for cleanup");
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("deleted Profile directory cleanup on restart", () =>
      !existsSync(join(profile, profileId)), 60_000);
    record("Chromium removed the deleted Profile's data on restart", { profileId });
    report.passed = true;
  } else if (memorySaverJourney || memorySaverRestartJourney) {
    const red = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await rpc("pages.open", { url: `${origin}/blue`, activate: true });
    await until("clean background red tab", async () =>
      sleepRedLoads === 1 && (await rpc("pages.list")).some(page => page.pageId === red.pageId && !page.loading), 60_000);
    await rpc("settings.set", { memorySaverMinutes: 1 });
    await until("memory saver setting saved", async () => (await rpc("settings.get", {})).memorySaverMinutes === 1, 120_000);
    console.log("Waiting for the saved one-minute Memory saver policy to sleep Red while Blue stays active.");
    await until("idle tab slept automatically", () => {
      try { return native("has-name", "Sleeping tab") === "true"; }
      catch { return false; }
    }, 150_000);
    assert.equal(sleepRedLoads, 1, "automatic sleep must not reload before activation");
    record("saved memory saver policy automatically slept an idle tab", { loadsBeforeActivation: sleepRedLoads });
    if (memorySaverRestartJourney) {
      sleepLoadPhase = "restarting";
      child.kill("SIGTERM");
      if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
      child.stderr.destroy();
      child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
        "--use-mock-keychain", "--password-store=basic"], {
        cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
      });
      child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
      const restartWindow = await until("restarted Aux browser window", () => {
        try { return JSON.parse(native("window")); } catch { return null; }
      }, 60_000);
      console.log("Restart window", JSON.stringify(restartWindow));
      sleepLoadPhase = "native window ready";
      await until("restarted runtime", async () => {
        try {
          const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
          rpcPort = descriptor.port; rpcToken = descriptor.token;
          return (await rpc("workspace.get")).pages.some(page => page.pageId === red.pageId);
        } catch { return false; }
      }, 60_000);
      sleepLoadPhase = "runtime ready";
      const restartWorkspace = await rpc("workspace.get");
      console.log("Restart active page", restartWorkspace.activePageId, "red", red.pageId,
        "pages", JSON.stringify(restartWorkspace.pages.map(page => ({ id: page.pageId, url: page.url, lifecycle: page.lifecycle }))));
      assert.equal(restartWorkspace.pages.find(page => page.pageId === red.pageId)?.lifecycle, "placeholder");
      assert.equal(sleepRedLoads, 1, "restart must preserve the sleeping tab until activation");
      record("restart retained the sleeping tab without reloading it", { loadsAfterRestart: sleepRedLoads });
      await rpc("pages.activate", { pageId: red.pageId });
      await until("restored background tab activated", async () =>
        (await rpc("workspace.get")).activePageId === red.pageId, 120_000);
    } else {
      await rpc("pages.activate", { pageId: red.pageId });
    }
    await until("automatic sleep lazily reloaded on activation", () => sleepRedLoads >= 2, 120_000);
    record("idle tab reloaded when reopened", { loadsAfterActivation: sleepRedLoads });
    report.passed = true;
  } else if (tabSleepJourney) {
    const red = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await rpc("pages.open", { url: `${origin}/blue`, activate: true });
    await until("clean background red tab", async () =>
      sleepRedLoads === 1 && (await rpc("pages.list")).some(page => page.pageId === red.pageId && !page.loading), 60_000);
    console.log("Open the background Red tab menu with Shift-F10 and choose Sleep tab. Then inspect its sleeping icon.");
    await until("native sleeping tab icon", () => {
      try { return native("has-name", "Sleeping tab") === "true"; }
      catch { return false; }
    }, 180_000);
    assert.equal(sleepRedLoads, 1, "sleeping must not reload before activation");
    record("native background tab slept with a visible lifecycle state", { loadsBeforeActivation: sleepRedLoads });
    console.log("Activate the sleeping Red tab to verify lazy reload.");
    await until("sleeping tab lazily reloaded on activation", () => sleepRedLoads >= 2, 180_000);
    record("Chromium lazily reloaded the sleeping tab when activated", { loadsAfterActivation: sleepRedLoads });
    report.passed = true;
  } else if (archiveTabsJourney) {
    const urls = [`${origin}/red`, `${origin}/blue`];
    const opened = [];
    for (const url of urls) opened.push(await rpc("pages.open", { url, activate: true }));
    await until("two clean archive fixture tabs", async () =>
      (await rpc("pages.list")).filter(page => opened.some(item => item.pageId === page.pageId) && !page.loading).length === 2, 60_000);
    const archives = () => {
      try { return JSON.parse(readFileSync(join(profile, "Default/Preferences"), "utf8"))
        .aux?.organization?.v1?.shared?.archivedTabs ?? []; }
      catch { return []; }
    };
    console.log("Open Tab overview, select the two loopback tabs, and choose Archive tabs.");
    await until("two native tabs archived and closed", async () => {
      const rows = archives();
      if (rows.length !== 2 || rows.some(item => item.state !== "archived")) return false;
      const live = await rpc("pages.list");
      return rows.every(item => !live.some(page => page.pageId === item.pageId));
    }, 180_000);
    record("native tabs closed after two Profile archive entries committed", { archived: 2 });
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted Aux archive window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    }, 60_000);
    console.log("After restart, open Tab overview and click Restore for one archived fixture tab.");
    await until("one native archived tab restored", () => {
      const rows = archives();
      return rows.length === 1 && rows[0].state === "archived";
    }, 180_000);
    record("archived tab restored through native Overview after full restart", { remaining: 1 });
    report.passed = true;
  } else if (tidyReceiptJourney) {
    await rpc("settings.set", { modelProvider: "openai-compatible",
      compatibleEndpoint: `http://127.0.0.1:${modelFixture.address().port}/v1`,
      plannerModel: "meta/muse-spark-1.3-contributor" });
    const initialTabs = (await rpc("pages.list")).filter(item => item.url?.startsWith("chrome://"));
    const pages = [];
    for (const slug of ["red", "blue", "tidy-third"]) {
      pages.push(await rpc("pages.open", { url: `${origin}/${slug}`, activate: true }));
    }
    for (const item of initialTabs) await rpc("pages.close", { pageId: item.pageId });
    await until("three disposable live tabs", async () =>
      (await rpc("pages.list")).filter(item => pages.some(page => page.pageId === item.pageId) && !item.loading).length === 3,
    60_000);
    console.log("Open Tab overview. Choose Tidy with AI, review Fixture reading, then Apply folders.");
    const receipt = await until("AI Tidy receipt committed to Chromium Profile", () => {
      try {
        const pref = JSON.parse(readFileSync(join(profile, "Default/Preferences"), "utf8"));
        const find = (value, depth = 0) => {
          if (!value || typeof value !== "object" || depth > 9) return null;
          if (Array.isArray(value.created) && Array.isArray(value.moved) && value.created[0]?.name === "Fixture reading") return value;
          for (const child of Object.values(value)) {
            const found = find(child, depth + 1);
            if (found) return found;
          }
          return null;
        };
        return find(pref);
      } catch { return null; }
    }, 180_000);
    assert.equal(receipt.created.length, 1);
    assert.equal(receipt.moved.length, 2);
    record("AI Tidy applied the reviewed folder and persisted a compact undo receipt", { folderCount: 1, movedCount: 2 });
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    }, 60_000);
    console.log("After restart, open Tab overview and inspect the persisted Undo Tidy control; do not click it.");
    await until("durable native Undo Tidy control after restart", () => {
      try { return native("has-button", "Undo Tidy") === "true"; } catch { return false; }
    }, 180_000);
    record("native Overview offers guarded Undo Tidy after a full restart", {});
    report.passed = true;
  } else if (receiptHistoryUiJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const url = `${origin}/history-receipt`;
    const page = await rpc("pages.open", { url, activate: true });
    const visit = await until("native Chromium history visit", async () =>
      (await rpc("history.list", { query: "history-receipt", limit: 20 }))
        .find(item => item.url === url && item.title === "History receipt fixture"), 60_000);
    record("native HistoryService projected the disposable visit", { visitedAt: visit.visitedAt });
    const task = await rpc("tasks.create", { workspaceId: space.workspaceId, title: "Review run history",
      objective: "Review the disposable run history visit",
      criteria: [{ criterionId: "review", description: "History reviewed", verification: "manual" }] });
    const runId = `run_${randomUUID()}`, stepId = randomUUID(), now = Date.now();
    const db = new DatabaseSync(join(profile, "Default/Aux Runtime Data/aux-state.sqlite"));
    try {
      db.prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,ended_at,created_at) VALUES(?,?,?,?,?,?,?)")
        .run(runId, task.objective, "completed", JSON.stringify([page.pageId]),
          JSON.stringify({ taskId: task.taskId, taskRevision: 1 }), now, now);
      db.prepare("INSERT INTO steps(step_id,run_id,page_id,op,inputs,outcome,started_at) VALUES(?,?,?,?,?,?,?)")
        .run(stepId, runId, page.pageId, "history.visit", JSON.stringify({ url }),
          JSON.stringify({ stepId, op: "history.visit", status: "ok", startedAt: visit.visitedAt,
            durationMs: 0, effect: "observed", before: { existed: false },
            after: { url, title: visit.title, visitedAt: visit.visitedAt } }), visit.visitedAt);
    } finally { db.close(); }
    const external = await rpc("tasks.receipt", { taskId: task.taskId });
    assert.equal(external.historyChanges.length, 1);
    assert.equal(external.historyChanges[0].url, undefined);
    assert.equal(external.historyChanges[0].title, undefined);
    await assert.rejects(rpc("tasks.undoHistoryChange", { taskId: task.taskId,
      expectedRevision: 1, runId, stepId }), /permission_denied/i);
    assert.ok((await rpc("history.list", { query: "history-receipt", limit: 20 }))
      .some(item => item.url === url && item.visitedAt === visit.visitedAt));
    record("external receipt redacts the visit and cannot remove it", { taskId: task.taskId });
    console.log("Open Tasks → Review run history. Inspect History visits during agent runs and Remove history visit; do not click the removal control.");
    await until("native history receipt and owner removal control", () => {
      try { return native("has-name", "History visits during agent runs") === "true" &&
        native("has-button", "Remove history visit") === "true"; } catch { return false; }
    }, 180_000);
    record("native Tasks shows the history visit and guarded removal control", { taskId: task.taskId });
    report.passed = true;
  } else if (receiptDownloadUiJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const page = await rpc("pages.open", { url: `${origin}/download-receipt`, activate: true });
    const projected = await until("native DownloadItem reaches the runtime projection", async () =>
      (await rpc("downloads.list", {})).find(item => item.filename === receiptNativeDownloadName &&
        item.state === "completed"), 90_000);
    assert.equal(basename(projected.path), receiptNativeDownloadName);
    assert.equal(readFileSync(projected.path, "utf8"), "Disposable native download event\n");
    rmSync(projected.path);
    record("native DownloadItem update reached runtime through the authenticated shell", {});
    const task = await rpc("tasks.create", { workspaceId: space.workspaceId, title: "Review run download",
      objective: "Review and clean up the disposable run download",
      criteria: [{ criterionId: "review", description: "Download reviewed", verification: "manual" }] });
    const runId = `run_${randomUUID()}`, stepId = randomUUID(), now = Date.now();
    const path = join(profile, "Default/Aux Runtime Data/downloads/aux-receipt-download.txt");
    writeFileSync(path, "Disposable Aux download receipt\n");
    const file = statSync(path);
    const sha256 = createHash("sha256").update(readFileSync(path)).digest("hex");
    const db = new DatabaseSync(join(profile, "Default/Aux Runtime Data/aux-state.sqlite"));
    try {
      db.prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,ended_at,created_at) VALUES(?,?,?,?,?,?,?)")
        .run(runId, task.objective, "completed", JSON.stringify([page.pageId]),
          JSON.stringify({ taskId: task.taskId, taskRevision: 1 }), now, now);
      db.prepare("INSERT INTO steps(step_id,run_id,page_id,op,inputs,outcome,started_at) VALUES(?,?,?,?,?,?,?)")
        .run(stepId, runId, page.pageId, "download",
          JSON.stringify({ downloadId: "disposable-download", sourceUrl: `${origin}/download-receipt` }),
          JSON.stringify({ stepId, op: "download", status: "ok", startedAt: now,
            durationMs: 1, effect: "observed", before: { existed: false, path },
            after: { downloadId: "disposable-download", state: "completed",
              filename: basename(path), path, size: file.size, sha256,
              mtimeMs: file.mtimeMs, dev: file.dev, ino: file.ino } }), now);
    } finally { db.close(); }
    const external = await rpc("tasks.receipt", { taskId: task.taskId });
    assert.equal(external.downloadChanges.length, 1);
    assert.equal(external.downloadChanges[0].filename, undefined);
    assert.equal(external.downloadChanges[0].path, undefined);
    await assert.rejects(rpc("tasks.undoDownloadChange", { taskId: task.taskId,
      expectedRevision: 1, runId, stepId }), /permission_denied/i);
    assert.ok(existsSync(path));
    record("external receipt redacts download details and cannot clean up the file", { taskId: task.taskId });
    console.log("Open Tasks → Review run download. Inspect Downloads during agent runs and Move download to Trash; do not click the cleanup control.");
    await until("native download receipt and owner cleanup control", () => {
      try { return native("has-name", "Downloads during agent runs") === "true" &&
        native("has-button", "Move download to Trash") === "true"; } catch { return false; }
    }, 180_000);
    assert.ok(existsSync(path), "The read-only native journey must leave the fixture file intact");
    record("native Tasks shows the guarded download receipt and recoverable cleanup control", { taskId: task.taskId });
    report.passed = true;
  } else if (receiptBookmarkUiJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const url = `${origin}/bookmark-fixture`;
    const page = await rpc("pages.open", { url, activate: true });
    await rpc("bookmarks.add", { url, title: "Run bookmark fixture", forceNew: true });
    const saved = await until("native fixture bookmark", async () =>
      (await rpc("bookmarks.list", {})).find(item => item.url === url && item.title === "Run bookmark fixture" && item.nodeId), 60_000);
    await assert.rejects(rpc("bookmarks.remove", { url, nodeId: saved.nodeId,
      expected: { title: "Changed title", createdAt: saved.createdAt } }), /conflict/i);
    await assert.rejects(rpc("bookmarks.remove", { url, nodeId: saved.nodeId,
      expected: { title: saved.title, createdAt: saved.createdAt, folderPath: ["Moved"], readingList: false } }), /conflict/i);
    await assert.rejects(rpc("bookmarks.remove", { url, nodeId: saved.nodeId,
      expected: { title: saved.title, createdAt: saved.createdAt, folderPath: saved.folderPath ?? [],
        readingList: true } }), /conflict/i);
    assert.ok((await rpc("bookmarks.list", {})).some(item => item.nodeId === saved.nodeId));
    record("native BookmarkModel refused a stale conditional remove", { nodeId: saved.nodeId });
    const task = await rpc("tasks.create", { workspaceId: space.workspaceId, title: "Review saved bookmark",
      objective: "Remove the disposable bookmark created by a model run",
      criteria: [{ criterionId: "review", description: "Bookmark removed", verification: "manual" }] });
    const runId = `run_${randomUUID()}`, stepId = randomUUID(), now = Date.now();
    const db = new DatabaseSync(join(profile, "Default/Aux Runtime Data/aux-state.sqlite"));
    try {
      db.prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,ended_at,created_at) VALUES(?,?,?,?,?,?,?)")
        .run(runId, task.objective, "completed", JSON.stringify([page.pageId]),
          JSON.stringify({ taskId: task.taskId, taskRevision: 1 }), now, now);
      db.prepare("INSERT INTO steps(step_id,run_id,page_id,op,inputs,outcome,started_at) VALUES(?,?,?,?,?,?,?)")
        .run(stepId, runId, page.pageId, "bookmark.add", JSON.stringify({ url }),
          JSON.stringify({ stepId, op: "bookmark.add", status: "ok", startedAt: now, durationMs: 1,
            effect: "observed", before: { existed: false },
            after: { url, title: saved.title, nodeId: saved.nodeId, createdAt: saved.createdAt,
              folderPath: saved.folderPath ?? [], readingList: saved.readingList === true } }), now);
    } finally { db.close(); }
    console.log("Open Tasks → Review saved bookmark. Inspect Agent bookmark changes, then click Undo bookmark.");
    await until("native bookmark undo control", () => {
      try { return native("has-button", "Undo bookmark") === "true" &&
        native("has-name", "Agent bookmark changes") === "true"; } catch { return false; }
    }, 600_000);
    await until("native bookmark removed by owner undo", async () =>
      !(await rpc("bookmarks.list", {})).some(item => item.nodeId === saved.nodeId), 600_000);
    const check = new DatabaseSync(join(profile, "Default/Aux Runtime Data/aux-state.sqlite"));
    try { assert.ok(JSON.parse(check.prepare("SELECT outcome FROM steps WHERE step_id=?").get(stepId).outcome).undoneAt); }
    finally { check.close(); }
    record("native Task undo removed only the unchanged run bookmark", { taskId: task.taskId });
    report.passed = true;
  } else if (receiptRunUndoUiJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const page = await rpc("pages.open", { url: `${origin}/receipt-form`, activate: true });
    const observation = await until("disposable form observation", async () => {
      const item = await rpc("pages.observe", { pageId: page.pageId, scope: "full" });
      return item.content.url === `${origin}/receipt-form` ? item : null;
    }, 60_000);
    const owned = await rpc("pages.open", { url: `${origin}/owned-tab`, background: true, ownedByRuntime: true });
    const task = await rpc("tasks.create", { workspaceId: space.workspaceId, title: "Undo whole browser run",
      objective: "Restore two disposable form fields and close a run tab",
      criteria: [{ criterionId: "review", description: "Local changes restored", verification: "manual" }] });
    const runId = `run_${randomUUID()}`;
    const base = Date.now();
    const remoteStepId = randomUUID();
    const steps = [
      { stepId: randomUUID(), pageId: owned.pageId, op: "tab.open", target: null, before: { existed: false },
        after: { url: `${origin}/owned-tab`, documentEpoch: owned.documentEpoch, ownedByRuntime: true }, startedAt: base },
      { stepId: randomUUID(), pageId: page.pageId, op: "fill", target: "#quantity", before: { value: "3" },
        after: { value: "4" }, startedAt: base + 1 },
      { stepId: randomUUID(), pageId: page.pageId, op: "fill", target: "#code", before: { value: "A" },
        after: { value: "B" }, startedAt: base + 2 },
    ];
    const dbPath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const db = new DatabaseSync(dbPath);
    try {
      db.prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,ended_at,created_at) VALUES(?,?,?,?,?,?,?)")
        .run(runId, task.objective, "completed", JSON.stringify([page.pageId, owned.pageId]),
          JSON.stringify({ taskId: task.taskId, taskRevision: 1 }), base + 3, base);
      for (const step of steps) db.prepare("INSERT INTO steps(step_id,run_id,page_id,op,inputs,outcome,started_at) VALUES(?,?,?,?,?,?,?)")
        .run(step.stepId, runId, step.pageId, step.op,
          JSON.stringify(step.target ? { target: step.target, value: step.after.value } : { url: `${origin}/owned-tab` }),
          JSON.stringify({ stepId: step.stepId, op: step.op, status: "ok", startedAt: step.startedAt,
            durationMs: 1, before: step.before, after: step.after, pageUrl: `${origin}/receipt-form`,
            ...(step.target ? { receipt: { remoteConfirmed: false, uncertain: false, unconfirmed: false,
              dispatchedBeforeTakeover: false, identity: { pageId: page.pageId,
                documentEpoch: observation.documentEpoch, target: step.target } } } : {}) }), step.startedAt);
      db.prepare("INSERT INTO steps(step_id,run_id,page_id,op,inputs,outcome,started_at) VALUES(?,?,?,?,?,?,?)")
        .run(remoteStepId, runId, page.pageId, "click", JSON.stringify({ target: "#send" }),
          JSON.stringify({ stepId: remoteStepId, op: "click", status: "ok", startedAt: base + 3,
            durationMs: 1, effect: "observed", receipt: { observed: "Confirmation visible in browser",
              remoteConfirmed: false, uncertain: false, dispatchedBeforeTakeover: false,
              identity: { pageId: page.pageId, documentEpoch: observation.documentEpoch } } }), base + 3);
    } finally { db.close(); }
    console.log("Open Tasks → Undo whole browser run. Click Undo browser changes in run once.");
    await until("native run undo control", () => {
      try { return native("has-button", `Undo browser changes in run ${runId}`) === "true" &&
        native("has-name", "Consequential page actions") === "true" &&
        native("has-name", "no remote confirmation") === "true"; } catch { return false; }
    }, 600_000);
    await until("all local changes marked undone", () => {
      const db = new DatabaseSync(dbPath);
      try { return steps.every(step => !!JSON.parse(db.prepare("SELECT outcome FROM steps WHERE step_id=?")
        .get(step.stepId)?.outcome ?? "{}").undoneAt); }
      finally { db.close(); }
    }, 600_000);
    await until("run-owned tab closed", async () => !(await rpc("pages.list", {}))
      .some(item => item.pageId === owned.pageId && item.viewStatus !== "detached"), 60_000);
    console.log("Close Tasks to reveal the fixture form; verify Quantity is 3 and Code is A.");
    await until("both live form fields restored", () => {
      try { return native("control-value", "Quantity") === "3" && native("control-value", "Code") === "A"; }
      catch { return false; }
    }, 600_000);
    record("native run undo restored two fields and closed the run-owned tab", { taskId: task.taskId, runId });
    report.passed = true;
  } else if (receiptUndoUiJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const page = await rpc("pages.open", { url: `${origin}/receipt-form`, activate: true });
    const observation = await until("disposable form observation", async () => {
      const item = await rpc("pages.observe", { pageId: page.pageId, scope: "full" });
      return item.content.url === `${origin}/receipt-form` ? item : null;
    }, 60_000);
    const task = await rpc("tasks.create", { workspaceId: space.workspaceId, title: "Undo browser changes",
      objective: "Restore a disposable form value", criteria: [{ criterionId: "review", description: "Prior input restored", verification: "manual" }] });
    const runId = `run_${randomUUID()}`;
    const stepId = randomUUID();
    const now = Date.now();
    const db = new DatabaseSync(join(profile, "Default/Aux Runtime Data/aux-state.sqlite"));
    try {
      db.prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,ended_at,created_at) VALUES(?,?,?,?,?,?,?)")
        .run(runId, task.objective, "completed", JSON.stringify([page.pageId]),
          JSON.stringify({ taskId: task.taskId, taskRevision: 1 }), now, now);
      db.prepare("INSERT INTO steps(step_id,run_id,page_id,op,inputs,outcome,started_at) VALUES(?,?,?,?,?,?,?)")
        .run(stepId, runId, page.pageId, "fill", JSON.stringify({ target: "#quantity", value: "4" }),
          JSON.stringify({ stepId, op: "fill", status: "ok", startedAt: now, durationMs: 1,
            before: { value: "3" }, after: { value: "4" }, pageUrl: `${origin}/receipt-form`,
            receipt: { remoteConfirmed: false, uncertain: false, unconfirmed: false,
              dispatchedBeforeTakeover: false, identity: { pageId: page.pageId,
                documentEpoch: observation.documentEpoch, target: "#quantity" } } }), now);
    } finally { db.close(); }
    const receipt = await rpc("tasks.receipt", { taskId: task.taskId });
    assert.equal(receipt.browserChanges?.[0]?.after?.value, undefined, "External receipt omits captured values");
    record("native runtime protects captured values from external task clients", { taskId: task.taskId });
    console.log("Open Tasks → Undo browser changes. Use Undo form edit on the active fixture tab.");
    await until("native Undo form edit control", () => {
      try { return native("has-button", "Undo form edit") === "true"; } catch { return false; }
    }, 600_000);
    await until("form edit marked undone", async () => {
      const steps = new DatabaseSync(join(profile, "Default/Aux Runtime Data/aux-state.sqlite"));
      try { const row = steps.prepare("SELECT outcome FROM steps WHERE step_id=?").get(stepId);
        return !!JSON.parse(row?.outcome ?? "{}").undoneAt; }
      finally { steps.close(); }
    }, 600_000);
    console.log("Close Tasks to reveal the fixture form and verify Quantity is 3.");
    await until("live native form restored to its prior value", () => {
      try { return native("control-value", "Quantity") === "3"; } catch { return false; }
    }, 600_000);
    record("native Task undo restored the prior form value and recorded the action", { taskId: task.taskId });
    report.passed = true;
  } else if (receiptBeforeUiJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const task = await rpc("tasks.create", { workspaceId: space.workspaceId, title: "Review browser changes",
      objective: "Inspect a disposable form edit", criteria: [{ criterionId: "review", description: "Review prior input", verification: "manual" }] });
    const runId = `run_${randomUUID()}`;
    const stepId = randomUUID();
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const now = Date.now();
    const db = new DatabaseSync(databasePath);
    try {
      db.prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,ended_at,created_at) VALUES(?,?,?,?,?,?,?)")
        .run(runId, task.objective, "completed", "[]", JSON.stringify({ taskId: task.taskId, taskRevision: 1 }), now, now);
      db.prepare("INSERT INTO steps(step_id,run_id,page_id,op,inputs,outcome,started_at) VALUES(?,?,?,?,?,?,?)")
        .run(stepId, runId, "fixture-page", "fill", JSON.stringify({ target: "#quantity", value: "4" }),
          JSON.stringify({ stepId, op: "fill", status: "ok", startedAt: now, durationMs: 1,
            before: { value: "3" } }), now);
    } finally { db.close(); }
    const receipt = await rpc("tasks.receipt", { taskId: task.taskId });
    assert.equal(receipt.browserChanges?.[0]?.before?.value, "3");
    record("native runtime includes the prior form value in a task receipt", { taskId: task.taskId });
    console.log("Open Aux Tasks → Review browser changes. Verify Browser form changes shows #quantity and Before: 3.");
    await until("before-state visible in native Task receipt", () => {
      try { return native("has-name", "Browser form changes") === "true" &&
        native("has-name", "#quantity") === "true" && native("has-name", "Before:") === "true"; }
      catch { return false; }
    }, 600_000);
    record("native Tasks displays the prior value for a model-initiated form edit", { taskId: task.taskId });
    report.passed = true;
  } else if (memoryPreviewUiJourney) {
    assert.equal(runtimeCapabilities.featureStages?.memory, "preview");
    console.log("Open Aux Settings → Workspaces and verify the Space memory preview message is visible without an enable toggle.");
    await until("native Space memory preview shown", () => {
      try { return native("shell-url") === "chrome://aux/settings/workspaces" &&
        native("has-name", "Space memory is in preview in this build.") === "true"; }
      catch { return false; }
    }, 600_000);
    record("native Workspaces keeps unqualified Space memory in preview");
    report.passed = true;
  } else if (memoryInboxUiJourney) {
    assert.equal(runtimeCapabilities.featureStages?.memory, "on");
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const inspect = query => { const db = new DatabaseSync(databasePath, { readOnly: true });
      try { return query(db); } finally { db.close(); } };
    const recoveryPath = join(profile, "Default/Aux Runtime Data/managed-recovery-generation.json");
    const recoveryGeneration = () => existsSync(recoveryPath) ?
      JSON.parse(readFileSync(recoveryPath, "utf8")).generation : null;
    const beforeForget = recoveryGeneration();
    console.log("Open Aux Settings → Memory. Select Memory Fixture, enable memory, create review notes from Review memory fixture, and accept the silver note.");
    await until("Space memory enabled through native Settings", () => {
      try { return native("has-name", "Create review notes") === "true"; } catch { return false; }
    }, 600_000);
    record("native Settings opts the disposable Space into memory");
    await until("encrypted note staged through native Settings", () => inspect(db =>
      db.prepare("SELECT 1 FROM memory_pipeline_watermarks WHERE workspace_id=? AND run_id=?")
        .get(memoryFixture.workspaceId, memoryFixture.runId)), 600_000);
    const base = join(profile, "Default/Aux Runtime Data/space-memory");
    const profileDir = join(base, readdirSync(base)[0]);
    const spaceDir = join(profileDir, readdirSync(profileDir)[0]);
    const generation = () => JSON.parse(readFileSync(join(spaceDir, "manifest.json"), "utf8")).generation;
    const pendingGeneration = generation();
    assert.ok(existsSync(join(spaceDir, pendingGeneration, "inbox.json.enc")));
    await until("sourced note visible for owner review", () => {
      try { return native("has-name", memoryFixture.report) === "true"; } catch { return false; }
    }, 60_000);
    record("native Settings stages a sourced encrypted note for review", { runId: memoryFixture.runId });
    await until("approved note visible in native Memory", () => {
      try { return native("has-name", "Forget note") === "true" &&
        native("has-name", memoryFixture.report) === "true" &&
        existsSync(join(spaceDir, generation(), "claims.json.enc")) &&
        existsSync(join(spaceDir, generation(), "summary.md.enc")); } catch { return false; }
    }, 600_000);
    record("owner accepted the sourced note into the encrypted Space summary", { runId: memoryFixture.runId });
    console.log("Choose Forget run for the fixture, review the confirmation, and click Forget permanently after the user approves this disposable deletion.");
    await until("native Memory clears forgotten summary", () => {
      try { return native("has-name", "No approved notes yet.") === "true" &&
        native("has-name", "Create fresh local backup…") === "true"; } catch { return false; }
    }, 600_000);
    await until("managed recovery generation advanced after Forget", () => {
      const after = recoveryGeneration();
      return typeof after === "number" && after !== beforeForget;
    }, 60_000);
    assert.ok(generation() !== pendingGeneration);
    record("native Forget cleared current and restorable Memory and invalidated older managed backups",
      { runId: memoryFixture.runId, recoveryGeneration: recoveryGeneration() });
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    console.log("After restart, reopen Aux Settings → Memory and select Memory Fixture to verify the forgotten note stays absent.");
    await until("restarted native Memory remains empty", () => {
      try { return native("has-name", "No approved notes yet.") === "true" &&
        native("has-name", memoryFixture.report) === "false"; } catch { return false; }
    }, 600_000);
    record("forgotten Memory did not return after a full native restart", { runId: memoryFixture.runId });
    report.passed = true;
  } else if (hooksCommandUiJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const path = join(disposable, "hook-project");
    mkdirSync(path);
    const canonical = realpathSync(path);
    const agentsDigest = createHash("sha256").update("").digest("hex");
    const folder = { folderId: randomUUID(), workspaceId: space.workspaceId, path: canonical,
      access: "readWrite", agentsDigest, reviewDigest: createHash("sha256")
        .update(JSON.stringify([space.workspaceId, canonical, "readWrite", agentsDigest])).digest("hex"),
      createdAt: Date.now() };
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const db = new DatabaseSync(databasePath);
    try { db.prepare("INSERT OR REPLACE INTO kv(key,value) VALUES(?,?)")
      .run(`setting:workspaceFolders:${space.workspaceId}`, JSON.stringify([folder])); }
    finally { db.close(); }
    console.log("In Aux Tasks → Hooks, choose Sandboxed command, select the disposable hook-project folder, enter pwd, save a run-end Hook, review and approve the exact handler, click Test Hook now, verify completed, then revoke it.");
    const inspect = query => { const db = new DatabaseSync(databasePath, { readOnly: true });
      try { return query(db); } finally { db.close(); } };
    const row = await until("command Hook registered through native Tasks", () => inspect(db =>
      db.prepare("SELECT body FROM hooks WHERE workspace_id=? ORDER BY created_at DESC LIMIT 1")
        .get(space.workspaceId)), 600_000);
    const hook = JSON.parse(row.body);
    assert.equal(hook.event, "run.end");
    assert.deepEqual(hook.handler, { type: "command", command: "pwd", workdir: canonical });
    record("native Tasks registers exact folder-bound command Hook", { hookId: hook.hookId });
    await until("command Hook approved", () => inspect(db =>
      db.prepare("SELECT trust FROM hooks WHERE hook_id=? AND trust='approved'").get(hook.hookId)), 600_000);
    const invocation = await until("sandboxed command Hook test completed", () => inspect(db =>
      db.prepare("SELECT state FROM hook_invocations WHERE hook_id=? AND event_id LIKE 'manual:%' AND state='completed'")
        .get(hook.hookId)), 60_000);
    assert.equal(invocation.state, "completed");
    record("native Hook executes disposable pwd under the seatbelt", { hookId: hook.hookId });
    await until("command Hook revoked", () => inspect(db =>
      db.prepare("SELECT trust FROM hooks WHERE hook_id=? AND trust='revoked'").get(hook.hookId)), 600_000);
    record("native Tasks revokes command Hook", { hookId: hook.hookId });
    report.passed = true;
  } else if (hooksUiJourney || hooksStartUiJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const serverScript = join(disposable, "hook-mcp-server.mjs");
    writeFileSync(serverScript, readFileSync(join(root, "tests/fixtures/outbound-mcp-settings-server.mjs")));
    const source = { kind: "local", command: process.execPath, args: [serverScript], cwd: realpathSync(disposable) };
    const now = Date.now();
    const server = { serverId: randomUUID(), workspaceId: space.workspaceId, name: "Disposable Hook server",
      source, state: "approved", sourceDigest: createHash("sha256").update(JSON.stringify(source)).digest("hex"),
      createdAt: now, updatedAt: now };
    const grant = { grantId: randomUUID(), serverId: server.serverId, toolName: "greet",
      scope: { kind: "workspace", workspaceId: space.workspaceId }, mode: "standing",
      outputTokenLimit: 100, createdAt: now };
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const db = new DatabaseSync(databasePath);
    try {
      db.prepare("INSERT INTO outbound_mcp_servers(server_id,workspace_id,state,body,created_at,updated_at) VALUES(?,?,?,?,?,?)")
        .run(server.serverId, space.workspaceId, "approved", JSON.stringify(server), now, now);
      db.prepare("INSERT INTO outbound_mcp_grants(grant_id,server_id,tool_name,body) VALUES(?,?,?,?)")
        .run(grant.grantId, server.serverId, grant.toolName, JSON.stringify(grant));
    } finally { db.close(); }
    const requestedEvent = hooksStartUiJourney ? "run.start" : "run.end";
    console.log(`In Aux Tasks → Hooks, choose ${requestedEvent}, select Disposable Hook server · greet, enter {"name":"Hook"}, save the Hook, review its exact fingerprint, approve it, then click Test Hook now. Verify the completed invocation, then revoke the Hook.`);
    const inspect = query => { const db = new DatabaseSync(databasePath, { readOnly: true });
      try { return query(db); } finally { db.close(); } };
    const row = await until("Hook registered through native Tasks", () => inspect(db =>
      db.prepare("SELECT body FROM hooks WHERE workspace_id=? ORDER BY created_at DESC LIMIT 1")
        .get(space.workspaceId)), 600_000);
    const hook = JSON.parse(row.body);
    assert.equal(hook.event, requestedEvent);
    assert.deepEqual(hook.handler, { type: "mcp_tool", serverId: server.serverId, grantId: grant.grantId,
      toolName: "greet", arguments: { name: "Hook" } });
    record(`native Tasks registers exact grant-bound ${requestedEvent} Hook as untrusted`, { hookId: hook.hookId });
    await until("Hook approved through native Tasks", () => inspect(db =>
      db.prepare("SELECT trust FROM hooks WHERE hook_id=? AND trust='approved'").get(hook.hookId)), 600_000);
    record("native Tasks approves the reviewed Hook fingerprint", { hookId: hook.hookId });
    const invocation = await until("manual Hook test invocation", () => inspect(db =>
      db.prepare("SELECT state FROM hook_invocations WHERE hook_id=? AND event_id LIKE 'manual:%' AND state='completed'")
        .get(hook.hookId)), 60_000);
    assert.equal(invocation.state, "completed");
    const call = inspect(db => db.prepare("SELECT status FROM outbound_mcp_calls WHERE grant_id=? AND status='completed' LIMIT 1")
      .get(grant.grantId));
    assert.equal(call?.status, "completed");
    record("native Hook test calls the exact MCP grant once", { hookId: hook.hookId });
    await until("Hook revoked through native Tasks", () => inspect(db =>
      db.prepare("SELECT trust FROM hooks WHERE hook_id=? AND trust='revoked'").get(hook.hookId)), 600_000);
    record("native Tasks revokes future Hook dispatch", { hookId: hook.hookId });
    report.passed = true;
  } else if (workspacesUiJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const folder = join(disposable, "workspace-folder");
    mkdirSync(folder);
    writeFileSync(join(folder, "AGENTS.md"), "Treat this disposable folder as local project context.");
    const canonical = realpathSync(folder);
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const key = `setting:workspaceFolders:${space.workspaceId}`;
    const stored = () => { const db = new DatabaseSync(databasePath, { readOnly: true });
      try { const row = db.prepare("SELECT value FROM kv WHERE key=?").get(key);
        return row ? JSON.parse(row.value) : []; } finally { db.close(); } };
    console.log(`In Aux Settings → Workspaces, review ${folder} as Read only. Verify the canonical path and AGENTS.md, grant it, then archive its access.`);
    const added = await until("reviewed folder granted through native Settings", () =>
      stored().find(item => item.path === canonical && item.access === "read" && !item.archivedAt), 600_000);
    assert.equal(added.workspaceId, space.workspaceId);
    record("native Workspaces grants reviewed read-only folder and AGENTS.md", { folderId: added.folderId });
    await until("folder access archived through native Settings", () =>
      stored().find(item => item.folderId === added.folderId && item.archivedAt), 600_000);
    record("native Workspaces archives the folder binding", { folderId: added.folderId });
    report.passed = true;
  } else if (commandEscalationUiJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const requestId = randomUUID();
    const request = { requestId, runId: `run_${randomUUID()}`, workspaceId: space.workspaceId,
      segment: "pwd", workdir: join(disposable, "project"),
      justification: "Need an owner-reviewed command exception", prefixRule: "pwd",
      state: "pending", createdAt: Date.now() };
    mkdirSync(request.workdir);
    const db = new DatabaseSync(databasePath);
    try { db.prepare("INSERT INTO command_escalation_requests(request_id,body,state) VALUES(?,?,'pending')")
      .run(requestId, JSON.stringify(request)); } finally { db.close(); }
    console.log("Open Aux Settings → Workspaces. Review the exact pwd segment, disposable working folder and justification, then decline the request.");
    await until("command exception declined through native Settings", () => {
      const db = new DatabaseSync(databasePath, { readOnly: true });
      try { return db.prepare("SELECT state FROM command_escalation_requests WHERE request_id=? AND state='declined'").get(requestId); }
      finally { db.close(); }
    }, 600_000);
    record("native Workspaces reviews and declines the exact escalated segment", { requestId });
    report.passed = true;
  } else if (goalsStatusUiJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const goalId = randomUUID();
    const runId = `run_${randomUUID()}`;
    const now = Date.now();
    const blocker = "Disposable login needs owner review";
    const goal = { goalId, workspaceId: space.workspaceId, objective: "Review a blocked task",
      budget: { maxTokens: 1200 }, status: "blocked", runId, blocker, blockerStreak: 3,
      lastBlockerTurn: 3, usedTokens: 0, knownCostUsd: 0, costComplete: true,
      createdAt: now, updatedAt: now };
    const db = new DatabaseSync(databasePath);
    try {
      db.prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,created_at) VALUES(?,?,?,?,?,?)")
        .run(runId, goal.objective, "paused", "[]", JSON.stringify({ contextWorkspaceId: space.workspaceId,
          implementation: "agent-loop", maxTokens: 1200 }), now);
      db.prepare("INSERT INTO goals(goal_id,workspace_id,status,run_id,body,created_at,updated_at) VALUES(?,?,?,?,?,?,?)")
        .run(goalId, space.workspaceId, "blocked", runId, JSON.stringify(goal), now, now);
    } finally { db.close(); }
    console.log("Open Aux Tasks → Goals. Confirm the blocked reason and 1200-token owner budget are visible, then cancel the disposable blocked Goal.");
    await until("blocked Goal cancelled through native Tasks", () => {
      const db = new DatabaseSync(databasePath, { readOnly: true });
      try { return db.prepare("SELECT status FROM goals WHERE goal_id=? AND status='cancelled'").get(goalId); }
      finally { db.close(); }
    }, 600_000);
    record("native Tasks displays and cancels a blocked Goal with unchanged owner budget", { goalId });
    report.passed = true;
  } else if (goalsThreadUiJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const chatId = randomUUID();
    const runId = randomUUID();
    const now = Date.now();
    const db = new DatabaseSync(databasePath);
    try {
      db.prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,created_at,ended_at) VALUES(?,?,?,?,?,?,?)")
        .run(runId, "Goal thread fixture", "completed", "[]", JSON.stringify({ chatId, contextWorkspaceId: space.workspaceId }), now, now);
      db.prepare("INSERT INTO conversations(chat_id,title,archived,created_at,updated_at) VALUES(?,?,0,?,?)")
        .run(chatId, "Goal thread fixture", now, now);
      db.prepare("INSERT OR REPLACE INTO kv(key,value) VALUES(?,?)")
        .run(`setting:conversationWorkspace:${chatId}`, JSON.stringify(space.workspaceId));
    } finally { db.close(); }
    console.log("Open Goal thread fixture from Chats, then Tasks → Goals. Create a 1200-token Goal called Continue this conversation. Confirm New Goal is unavailable while the draft is unfinished, cancel it, then create a second Goal called Next bounded step.");
    const inspect = query => { const db = new DatabaseSync(databasePath, { readOnly: true });
      try { return query(db); } finally { db.close(); } };
    const first = await until("first conversation Goal created", () => inspect(db => {
      const row = db.prepare("SELECT body FROM goals ORDER BY created_at LIMIT 1").get();
      return row ? JSON.parse(row.body) : null;
    }), 600_000);
    assert.equal(first.chatId, chatId);
    assert.equal(first.objective, "Continue this conversation");
    assert.equal(first.budget.maxTokens, 1200);
    record("native Goal binds to the active conversation with exact budget", { goalId: first.goalId });
    await until("first conversation Goal cancelled", () => inspect(db =>
      db.prepare("SELECT status FROM goals WHERE goal_id=? AND status='cancelled'").get(first.goalId)), 600_000);
    const second = await until("next conversation Goal created after cancellation", () => inspect(db => {
      const row = db.prepare("SELECT body FROM goals WHERE goal_id<>? ORDER BY created_at DESC LIMIT 1").get(first.goalId);
      return row ? JSON.parse(row.body) : null;
    }), 600_000);
    assert.equal(second.chatId, chatId);
    assert.equal(second.objective, "Next bounded step");
    record("native Goal allows the next bounded step after cancellation", { goalId: second.goalId });
    report.passed = true;
  } else if (goalsUiJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    console.log("In Aux Tasks, create a Goal named Review the disposable page with 1200 maximum tokens and a 5 minute limit. Verify its draft details, then cancel it.");
    const row = await until("Goal created through native Tasks", () => {
      const db = new DatabaseSync(databasePath, { readOnly: true });
      try { return db.prepare("SELECT body FROM goals WHERE workspace_id=? ORDER BY created_at DESC LIMIT 1")
        .get(space.workspaceId); } finally { db.close(); }
    }, 600_000);
    const goal = JSON.parse(row.body);
    assert.equal(goal.objective, "Review the disposable page");
    assert.deepEqual(goal.budget, { maxTokens: 1200, deadlineMs: 300_000 });
    assert.equal(goal.status, "draft");
    record("native Tasks saves a durable Goal with exact token and time limits", { goalId: goal.goalId });
    await until("Goal cancelled through native Tasks", () => {
      const db = new DatabaseSync(databasePath, { readOnly: true });
      try { return db.prepare("SELECT status FROM goals WHERE goal_id=? AND status='cancelled'")
        .get(goal.goalId); } finally { db.close(); }
    }, 600_000);
    record("native Tasks cancels the draft Goal", { goalId: goal.goalId });
    report.passed = true;
  } else if (outboundMcpSettingsJourney) {
    const space = await until("disposable Personal Space", async () =>
      (await rpc("workspaces.list", {})).find(item => item.name === "Personal"), 60_000);
    const serverScript = join(disposable, "settings-mcp-server.mjs");
    writeFileSync(serverScript, readFileSync(join(root, "tests/fixtures/outbound-mcp-settings-server.mjs")));
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    console.log(`In Aux Settings → MCP & Connectors, register a Local command named Settings journey in the disposable Personal Space using executable ${process.execPath}, argument ${serverScript}, and working directory ${disposable}. Approve its source, load greet, grant it to the Space, call with {"name":"Aux"}, then revoke the grant.`);
    const inspectDb = query => {
      const db = new DatabaseSync(databasePath, { readOnly: true });
      try { return query(db); } finally { db.close(); }
    };
    const row = await until("MCP server registered through native Settings", () => inspectDb(db =>
      db.prepare("SELECT body FROM outbound_mcp_servers WHERE workspace_id=? ORDER BY rowid DESC LIMIT 1")
        .get(space.workspaceId)), 600_000);
    const registered = JSON.parse(row.body);
    assert.equal(registered.name, "Settings journey");
    assert.deepEqual(registered.source, { kind: "local", command: process.execPath,
      args: [serverScript], cwd: realpathSync(disposable) });
    assert.equal(registered.state, "pending");
    record("native Settings registers the exact reviewed local MCP source as pending", {
      serverId: registered.serverId, workspaceId: space.workspaceId });
    await until("MCP server source approved in native Settings", () => inspectDb(db =>
      db.prepare("SELECT state FROM outbound_mcp_servers WHERE server_id=? AND state='approved'")
        .get(registered.serverId)), 600_000);
    record("native Settings approves the reviewed MCP source", { serverId: registered.serverId });
    const grantRow = await until("MCP greet grant created in native Settings", () => inspectDb(db =>
      db.prepare("SELECT body FROM outbound_mcp_grants WHERE server_id=? AND tool_name='greet' ORDER BY rowid DESC LIMIT 1")
        .get(registered.serverId)), 600_000);
    const grant = JSON.parse(grantRow.body);
    assert.deepEqual(grant.scope, { kind: "workspace", workspaceId: space.workspaceId });
    record("native Settings grants only greet to the disposable Space", { grantId: grant.grantId });
    await until("MCP greet call completed through native Settings", () => inspectDb(db =>
      db.prepare("SELECT status FROM outbound_mcp_calls WHERE grant_id=? AND status='completed' LIMIT 1")
        .get(grant.grantId)), 600_000);
    record("native Settings calls the granted MCP greet tool", { grantId: grant.grantId });
    await until("MCP grant revoked in native Settings", () => inspectDb(db =>
      db.prepare("SELECT revoked_at FROM outbound_mcp_grants WHERE grant_id=? AND revoked_at IS NOT NULL")
        .get(grant.grantId)), 600_000);
    record("native Settings revokes the MCP greet grant", { grantId: grant.grantId });
    report.passed = true;
  } else if (outboundMcpLocalJourney) {
    const serverScript = join(disposable, "local-mcp-server.mjs");
    writeFileSync(serverScript, `
import { readFileSync, writeFileSync } from "node:fs";
import { connect } from "node:net";
const configuredAnswer = process.argv[3] ? JSON.parse(readFileSync(process.argv[3], "utf8")).answer : "native-mcp-ok";
let pending = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => { pending += chunk; let boundary;
  while ((boundary = pending.indexOf("\\n")) >= 0) {
    const line = pending.slice(0, boundary); pending = pending.slice(boundary + 1);
    if (!line.trim()) continue;
    const request = JSON.parse(line);
    if (request.id === undefined) continue;
    if (request.method === "tools/call") {
      let writeDenied = false;
      try { writeFileSync("forbidden-write", "unsafe"); } catch { writeDenied = true; }
      const socket = connect(54321, "127.0.0.1");
      socket.on("error", error => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: request.id,
        result: { content: [{ type: "text", text: JSON.stringify({ writeDenied,
          networkDenied: error.code === "EPERM", answer: configuredAnswer }) }] } }) + "\\n"));
      continue;
    }
    const result = request.method === "initialize"
      ? { protocolVersion: request.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "native-local", version: "1" } }
      : { tools: [{ name: "sandbox-proof", inputSchema: { type: "object", properties: {} } }] };
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: request.id, result }) + "\\n");
  }
});`);
    const space = await rpc("workspaces.create", { name: "Disposable local MCP Space" });
    const source = { kind: "local", command: process.execPath, args: [serverScript], cwd: disposable };
    const now = Date.now();
    const server = { serverId: randomUUID(), workspaceId: space.workspaceId, name: "Disposable sandbox proof",
      source, state: "approved", sourceDigest: createHash("sha256").update(JSON.stringify(source)).digest("hex"),
      createdAt: now, updatedAt: now };
    const grant = { grantId: randomUUID(), serverId: server.serverId, toolName: "sandbox-proof",
      scope: { kind: "workspace", workspaceId: space.workspaceId }, mode: "standing",
      outputTokenLimit: 100, createdAt: now };
    const scopedToken = `auxc_${randomBytes(32).toString("base64url")}`;
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const db = new DatabaseSync(databasePath);
    try {
      db.prepare("INSERT INTO outbound_mcp_servers(server_id,workspace_id,state,body,created_at,updated_at) VALUES(?,?,?,?,?,?)")
        .run(server.serverId, space.workspaceId, "approved", JSON.stringify(server), now, now);
      db.prepare("INSERT INTO outbound_mcp_grants(grant_id,server_id,tool_name,body) VALUES(?,?,?,?)")
        .run(grant.grantId, server.serverId, grant.toolName, JSON.stringify(grant));
      db.prepare("INSERT INTO agent_connections(connection_id,name,client,scope_kind,workspace_id,task_id,session_id,token_hash,created_at) VALUES(?,?,?,?,?,?,?,?,?)")
        .run(randomUUID(), "Disposable MCP caller", "codex", "workspace", space.workspaceId,
          null, null, createHash("sha256").update(scopedToken).digest("hex"), now);
    } finally { db.close(); }
    const scopedCall = async (grantId = grant.grantId) => {
      const response = await fetch(`http://127.0.0.1:${rpcPort}/rpc`, {
        method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${scopedToken}` },
        body: JSON.stringify({ id: 1, method: "mcp.tools.call", params: { grantId,
          arguments: {}, context: { workspaceId: space.workspaceId } } }), signal: AbortSignal.timeout(10_000),
      });
      return response.json();
    };
    const called = await scopedCall();
    assert.equal(called.error, undefined, JSON.stringify(called.error));
    const result = called.result;
    assert.equal(result.status, "completed");
    const proof = JSON.parse(JSON.parse(result.output).content[0].text);
    assert.deepEqual(proof, { writeDenied: true, networkDenied: true, answer: "native-mcp-ok" });
    assert.equal(existsSync(join(disposable, "forbidden-write")), false);
    record("seeded approved local MCP tool runs under native runtime seatbelt without network or writes", {
      workspaceId: space.workspaceId, serverId: server.serverId });
    const revokeDb = new DatabaseSync(databasePath);
    try { revokeDb.prepare("UPDATE outbound_mcp_grants SET revoked_at=? WHERE grant_id=?").run(Date.now(), grant.grantId); }
    finally { revokeDb.close(); }
    const denied = await scopedCall();
    assert.equal(denied.error?.code, "permission_denied", JSON.stringify(denied));
    record("revoked local MCP grant denies a subsequent scoped call", { grantId: grant.grantId });
    const archive = new JSZip();
    archive.file("manifest.json", JSON.stringify({ name: "Disposable packaged tool",
      server: { type: "node", entry_point: "server.mjs", mcp_config: {
        command: "node", args: ["${__dirname}/server.mjs", "--config", "${__dirname}/config.json"], env: {},
      } } }));
    archive.file("server.mjs", readFileSync(serverScript));
    archive.file("config.json", JSON.stringify({ answer: "native-bundle-config" }));
    const bundleBytes = await archive.generateAsync({ type: "nodebuffer" });
    const bundlePath = join(disposable, "disposable.mcpb");
    writeFileSync(bundlePath, bundleBytes);
    const bundleSource = { kind: "bundle", path: bundlePath,
      sha256: createHash("sha256").update(bundleBytes).digest("hex"), format: "mcpb" };
    const bundleServer = { ...server, serverId: randomUUID(), name: "Disposable packaged proof",
      source: bundleSource, sourceDigest: createHash("sha256").update(JSON.stringify(bundleSource)).digest("hex") };
    const bundleGrant = { ...grant, grantId: randomUUID(), serverId: bundleServer.serverId };
    const bundleDb = new DatabaseSync(databasePath);
    try {
      bundleDb.prepare("INSERT INTO outbound_mcp_servers(server_id,workspace_id,state,body,created_at,updated_at) VALUES(?,?,?,?,?,?)")
        .run(bundleServer.serverId, space.workspaceId, "approved", JSON.stringify(bundleServer), now, now);
      bundleDb.prepare("INSERT INTO outbound_mcp_grants(grant_id,server_id,tool_name,body) VALUES(?,?,?,?)")
        .run(bundleGrant.grantId, bundleServer.serverId, bundleGrant.toolName, JSON.stringify(bundleGrant));
    } finally { bundleDb.close(); }
    const bundleCalled = await scopedCall(bundleGrant.grantId);
    assert.equal(bundleCalled.error, undefined, JSON.stringify(bundleCalled.error));
    assert.equal(bundleCalled.result.status, "completed");
    assert.deepEqual(JSON.parse(JSON.parse(bundleCalled.result.output).content[0].text),
      { writeDenied: true, networkDenied: true, answer: "native-bundle-config" });
    record("approved Node MCP bundle reads its reviewed bundled config under native seatbelt", {
      serverId: bundleServer.serverId });
    report.passed = true;
  } else if (agentConnectionsJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const workspace = await rpc("workspaces.create", { name: "Disposable agent connection journey" });
    await rpc("pages.open", { url: "chrome://inspect/#other", activate: true });
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const tokenPath = join(disposable, "agent-token.txt");
    console.log(`In the Aux shell, create a scoped Codex connection for workspace ${workspace.workspaceId}, then use the native save dialog to save its one-time token to ${tokenPath}. Revoke after the packaged MCP request passes.`);
    let createdId;
    await until("native agent connection creation", () => {
      const db = new DatabaseSync(databasePath, { readOnly: true });
      try {
        const row = db.prepare("SELECT connection_id,workspace_id,token_hash FROM agent_connections WHERE workspace_id=?").get(workspace.workspaceId);
        if (!row) return false;
        assert.match(row.token_hash, /^[a-f0-9]{64}$/);
        createdId = row.connection_id;
        return true;
      } finally { db.close(); }
    }, 120_000);
    await until("one-time token saved inside disposable profile", () => existsSync(tokenPath), 120_000);
    agentToken = readFileSync(tokenPath, "utf8");
    assert.match(agentToken, /^auxc_[A-Za-z0-9_-]{40,80}$/);
    rmSync(tokenPath, { force: true });
    const db = new DatabaseSync(databasePath, { readOnly: true });
    try {
      const row = db.prepare("SELECT token_hash FROM agent_connections WHERE connection_id=?").get(createdId);
      assert.equal(createHash("sha256").update(agentToken).digest("hex"), row.token_hash);
    } finally { db.close(); }
    const transport = new StdioClientTransport({ command: helper,
      args: [join(app, "Contents/Resources/aux-runtime/dist/mcp.js")],
      env: { ...process.env, AUX_DATA_DIR: join(profile, "Default/Aux Runtime Data"), AUX_MCP_TOKEN: agentToken, AUX_MCP_SCOPE_KIND: "workspace" },
      stderr: "pipe" });
    const client = new Client({ name: "aux-native-journey", version: "0.1.0" });
    try {
      await client.connect(transport);
      const tools = await client.listTools();
      assert.ok(tools.tools.some(item => item.name === "aux_workspaces_list"));
      const result = await client.callTool({ name: "aux_workspaces_list", arguments: {} });
      assert.match(JSON.stringify(result), new RegExp(workspace.workspaceId));
      record("packaged MCP server reads only the scoped disposable workspace", { workspaceId: workspace.workspaceId });
      console.log(`Now revoke disposable connection ${createdId} through the Aux shell.`);
      await until("native agent connection revocation", () => {
        const db = new DatabaseSync(databasePath, { readOnly: true });
        try { return Boolean(db.prepare("SELECT revoked_at FROM agent_connections WHERE connection_id=?").get(createdId)?.revoked_at); }
        finally { db.close(); }
      }, 120_000);
      const denied = await client.callTool({ name: "aux_workspaces_list", arguments: {} });
      assert.match(JSON.stringify(denied), /permission_denied|no longer authorized/i);
    } finally { await client.close(); }
    agentToken = undefined;
    record("native scoped connection was hashed and revoked; the MCP token lost access", { connectionId: createdId, workspaceId: workspace.workspaceId });
    report.passed = true;
  } else if (artifactExportJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const exported = join(output, "fixture.png");
    console.log(`Export a stored fixture artifact through the Aux native save dialog to ${exported}`);
    await until("native artifact export", () => existsSync(exported), 180_000);
    const image = readFileSync(exported);
    assert.equal(image.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    record("native artifact export copied the selected PNG", { file: exported, bytes: image.length });
    report.passed = true;
  } else if (workbookExportJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const exported = join(output, "workbook.xlsx");
    console.log(`Export a workbook through the Aux native save dialog to ${exported}`);
    await until("native workbook export", () => existsSync(exported), 180_000);
    const ExcelJS = requireDependency("exceljs");
    const book = new ExcelJS.Workbook();
    await book.xlsx.load(readFileSync(exported));
    assert.equal(book.getWorksheet("Report")?.getCell("B3").value, "=1+1");
    record("native workbook export saved parseable values", { file: exported, bytes: statSync(exported).size });
    report.passed = true;
  } else if (libraryFocusJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("bookmarks.add", { url: `${origin}/red`, title: "Aux Library focus fixture" });
    await rpc("bookmarks.add", { url: `${origin}/blue`, title: "Aux Library sibling fixture" });
    console.log("Open Library using Command-K, choose Bookmarks and history, then press ArrowDown from its search field.");
    const focusedBookmark = await until("first Library bookmark focus", () => {
      try {
        const element = JSON.parse(native("focused"));
        return element.role === "AXButton" && /Aux Library focus fixture/.test(`${element.title} ${element.description}`) ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Library search focuses the first bookmark row", focusedBookmark);
    console.log("Use Edit in Library to rename the disposable bookmark to Aux Library updated fixture, then Save.");
    await until("Library bookmark title to save and update live", async () =>
      (await rpc("bookmarks.list")).some(item => item.url === `${origin}/red` && item.title === "Aux Library updated fixture") &&
      native("has-name", `Aux Library updated fixture ${origin}/red`) === "true" &&
      native("has-name", `Aux Library sibling fixture ${origin}/blue`) === "true", 120_000);
    record("Library bookmark row reflects a saved title update while its sibling remains visible");
    report.passed = true;
  } else if (settingsFocusJumpJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Settings, search for desktop, and choose Sidebar appearance.");
    const focus = await until("indexed field search jump", () => {
      try {
        const element = JSON.parse(native("focused"));
        return /Sidebar appearance/.test(`${element.title} ${element.description}`) ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Settings search focuses the routed Sidebar appearance field", focus);
    report.passed = true;
  } else if (settingsSiteDataCountJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("pages.open", { url: `${origin}/site-controls`, activate: true });
    await until("fixture cookie and storage seeded", () => siteRequests === 1, 30_000);
    console.log("Open Aux Settings → Privacy & Security, then review Website data for the disposable site.");
    await until("one-cookie website data preview", () => {
      try { return native("shell-url") === "chrome://aux/settings/privacy-security" &&
        native("has-text", "1 cookie in 127.0.0.1") === "true" &&
        native("has-button", "Clear website data…") === "true"; }
      catch { return false; }
    }, 120_000);
    record("Privacy & Security previews one cookie before website-data removal", {});
    console.log("Open Clear website data… to inspect its confirmation; do not clear.");
    await until("website data removal review", () => native("has-button", "Clear cookies and storage") === "true", 120_000);
    record("website-data removal requires an explicit second action", {});
    console.log("Cancel the website-data removal review.");
    await until("website data review cancelled", () => native("has-button", "Clear cookies and storage") === "false", 120_000);
    await rpc("pages.open", { url: `${origin}/site-controls`, activate: true });
    await until("cookie retained after Cancel", () => siteRequests >= 2 && siteCookieReturned, 30_000);
    record("Cancel preserves the disposable website cookie", {});
    report.passed = true;
  } else if (privacyHistoryPanelJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await rpc("pages.open", { url: `${origin}/blue`, activate: true });
    await until("two projected fixture visits", async () => {
      const visits = await rpc("history.list", { limit: 500 });
      return visits.some(item => item.url === `${origin}/red`) && visits.some(item => item.url === `${origin}/blue`);
    });
    const before = await rpc("history.list", { limit: 500 });
    const recentCount = before.filter(item => item.visitedAt >= Date.now() - 24 * 60 * 60 * 1000).length;
    assert.ok(recentCount >= 2, "Fixture visits must be available for preview");
    console.log("Open Settings → Privacy & Security, open Clear browsing data, and select Last 24 hours without clearing.");
    await until("history panel opened", () => {
      try {
        const focused = JSON.parse(native("focused"));
        return focused.title === "Last 24 hours" && native("has-button", "Clear selected data") === "true" &&
          native("has-name", `${recentCount} ${recentCount === 1 ? "visit" : "visits"}`) === "true" &&
          native("button-enabled", "Clear selected data") === "true" ? focused : null;
      } catch { return null; }
    }, 120_000);
    record("Privacy & Security previews the selected visit count before enabling Clear", { recentCount });
    console.log("Cancel the history-clear confirmation.");
    await until("history panel cancelled", () =>
      native("has-button", "Clear browsing data…") === "true" && native("has-button", "Clear selected data") === "false", 120_000);
    const visits = entries => entries.map(({ url, visitedAt }) => ({ url, visitedAt }));
    assert.deepEqual(visits(await rpc("history.list", { limit: 500 })), visits(before), "Cancelling must not alter browsing history");
    record("Cancel closes the history-clear confirmation without changing history", {});
    report.passed = true;
  } else if (privacyBrowsingDataJourney || privacyBrowsingDataClearJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("pages.open", { url: `${origin}/browsing-data`, activate: true });
    await until("cacheable browsing-data fixture loaded", () => browsingCacheRequests > 0, 30_000);
    await rpc("pages.open", { url: `${origin}/browsing-data`, activate: true });
    await until("fixture cookie returned", () => browsingCookieReturns > 0, 30_000);
    const historyBefore = await rpc("history.list", { limit: 500 });
    const fixtureVisits = historyBefore.filter(item => item.url === `${origin}/browsing-data`).length;
    assert.ok(fixtureVisits >= 1, "Browsing-data fixture must create a history visit");
    console.log(privacyBrowsingDataClearJourney ?
      "Open Privacy & Security → Clear browsing data with CUA; select history, cookies and cache for All time. Wait for approval before clearing." :
      "Open Privacy & Security → Clear browsing data with CUA; inspect visits, cookies, and cached files for All time. Then Cancel.");
    await until("browsing data preview visible", () => {
      try {
        if (native("shell-url") !== "chrome://aux/settings/privacy-security" ||
          native("has-button", "Clear selected data") !== "true") return false;
        return native("has-name", "Browsing history —") === "true" &&
          native("has-name", "Browsing history — counting…") === "false" &&
          native("has-name", "Browsing history — 0 visits") === "false" &&
          native("has-name", "Cookies — 1 cookie") === "true" &&
          native("has-name", "Cached files —") === "true" &&
          native("has-name", "Cached files — counting…") === "false" &&
          native("has-name", "Cached files — 0 bytes") === "false";
      }
      catch { return false; }
    }, 120_000);
    record("Privacy & Security previews history, cookies and cached files", { fixtureVisits, browsingCacheRequests });
    if (privacyBrowsingDataClearJourney) {
      const cacheRequestsBefore = browsingCacheRequests;
      const cookieReturnsBefore = browsingCookieReturns;
      await until("selected browsing data cleared", () =>
        native("has-button", "Clear browsing data…") === "true" &&
        native("has-button", "Clear selected data") === "false", 120_000);
      assert.ok(!(await rpc("history.list", { limit: 500 })).some(item => item.url === `${origin}/browsing-data`),
        "Clear must remove fixture history");
      await rpc("pages.open", { url: `${origin}/browsing-data`, activate: true });
      await until("cache fetched again after clear", () => browsingCacheRequests > cacheRequestsBefore, 30_000);
      assert.equal(browsingCookieReturns, cookieReturnsBefore, "Clear must remove the fixture cookie");
      record("Clear removes disposable history, cookie and cached file", { cacheRequestsBefore, browsingCacheRequests });
      report.passed = true;
    } else {
      await until("browsing data review cancelled", () =>
        native("has-button", "Clear browsing data…") === "true" &&
        native("has-button", "Clear selected data") === "false", 120_000);
      const cookieReturnsBefore = browsingCookieReturns;
      await rpc("pages.open", { url: `${origin}/browsing-data`, activate: true });
      await until("cookie retained after Cancel", () => browsingCookieReturns > cookieReturnsBefore, 30_000);
      assert.ok((await rpc("history.list", { limit: 500 })).some(item => item.url === `${origin}/browsing-data`),
        "Cancel must retain fixture history");
      record("Cancel retains the disposable cookie and history", {});
      report.passed = true;
    }
  } else if (agentGrantsJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const initial = (await rpc("settings.get")).effectGrants ?? [];
    assert.ok(!initial.includes("effect:*"), "Disposable Profile must not start with a wildcard grant");
    const initiallyWritable = initial.includes("effect:write");
    console.log("Open Settings → Agents and toggle Write in the disposable Profile.");
    await until("Write grant changed", async () => {
      const grants = (await rpc("settings.get")).effectGrants ?? [];
      return grants.includes("effect:read") && grants.includes("effect:write") !== initiallyWritable && !grants.includes("effect:*");
    }, 120_000);
    record("Agent Write grant changes while Read stays mandatory", { initiallyWritable });
    console.log("Toggle Write again to restore the initial choice.");
    await until("Write grant restored", async () => {
      const grants = (await rpc("settings.get")).effectGrants ?? [];
      return grants.includes("effect:read") && grants.includes("effect:write") === initiallyWritable;
    }, 120_000);
    record("Agent Write grant returns to its initial choice", { initiallyWritable });
    report.passed = true;
  } else if (settingsDocumentReloadJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Settings → Appearance and focus Search settings, then press ⌘⇧R for a full document reload.");
    await until("Appearance route before document reload", () => {
      try { return native("shell-url") === "chrome://aux/settings/appearance" &&
        JSON.parse(native("focused")).title === "Search settings" && native("has-name", "Theme") === "true"; }
      catch { return false; }
    }, 120_000);
    record("Appearance route ready for document reload", {});
    await until("Appearance route after document reload", () => {
      try { return native("shell-url") === "chrome://aux/settings/appearance" &&
        JSON.parse(native("focused")).title === "General" && native("has-name", "Theme") === "true"; }
      catch { return false; }
    }, 120_000);
    record("Appearance route survives document reload", {});
    report.passed = true;
  } else if (settingsReloadJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Settings → Appearance and focus Search settings before refreshing Settings.");
    await until("Appearance search focused before refresh", () => {
      try {
        const focused = JSON.parse(native("focused"));
        return native("shell-url") === "chrome://aux/settings/appearance" && focused.title === "Search settings" ? focused : null;
      } catch { return null; }
    }, 120_000);
    console.log("Press ⌘R to refresh Settings without navigating the top WebUI document.");
    await until("Appearance route restored after refresh", () => {
      try {
        const focused = JSON.parse(native("focused"));
        return native("shell-url") === "chrome://aux/settings/appearance" && focused.title === "General" && native("has-name", "Theme") === "true" ? focused : null;
      } catch { return null; }
    }, 120_000);
    record("Settings Appearance route and controls survive an in-place refresh", {});
    report.passed = true;
  } else if (settingsHistoryJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Settings, select Appearance, then use ⌘[ for Back and ⌘] for Forward.");
    for (const [label, url] of [
      ["General opens", "chrome://aux/settings/general"],
      ["Appearance opens", "chrome://aux/settings/appearance"],
      ["Back restores General", "chrome://aux/settings/general"],
      ["Forward restores Appearance", "chrome://aux/settings/appearance"],
    ]) {
      await until(label, () => {
        try { return native("shell-url") === url; } catch { return false; }
      }, 120_000);
      record(label, { url });
      if (label === "Appearance opens") console.log("Press ⌘[ to return to General.");
      if (label === "Back restores General") console.log("Press ⌘] to return to Appearance.");
    }
    report.passed = true;
  } else if (settingsPasswordsJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Settings → Passwords & Autofill. The native Profile personal-info and password controls should appear together.");
    await until("Passwords & Autofill route selected", () => {
      try {
        const element = JSON.parse(native("focused"));
        return element.role === "AXButton" && element.title === "Passwords & Autofill" ? element : null;
      } catch { return null; }
    }, 120_000);
    await until("Profile controls visible", () =>
      native("has-button", "Manage saved passwords") === "true" && native("has-button", "Add personal info") === "true", 120_000);
    record("Passwords & Autofill route renders Chromium Profile controls", {});
    report.passed = true;
  } else if (settingsModelsJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Settings → Models and focus the Models section in the rail. Do not test the connection.");
    await until("Models route selected", () => {
      try {
        const focused = JSON.parse(native("focused"));
        return native("shell-url") === "chrome://aux/settings/models" &&
          focused.role === "AXButton" && focused.title === "Models" ? focused : null;
      } catch { return null; }
    }, 120_000);
    await until("Models controls visible", () =>
      native("has-name", "Model provider") === "true" &&
      native("has-button", "Test connection") === "true", 120_000);
    record("Models route renders provider and connection controls", {});
    console.log("In the Fast model row, enter fixture/fast, choose Low reasoning, and press Save route.");
    await until("Fast model override persisted", async () => {
      const settings = await rpc("settings.get");
      return settings.agentModelRouteOverrides?.fast?.modelId === "fixture/fast" &&
        settings.agentModelRoutes?.fast?.modelId === "fixture/fast" &&
        settings.agentModelRoutes?.fast?.reasoning === "low";
    }, 120_000);
    record("Fast model override persists in Profile settings", {});
    console.log("Press Automatic in the Fast model row to restore its default.");
    await until("Fast model automatic route restored", async () => {
      const settings = await rpc("settings.get");
      return !settings.agentModelRouteOverrides?.fast &&
        settings.agentModelRoutes?.fast?.modelId === settings.plannerModel;
    }, 120_000);
    record("Fast model Automatic restores the planner route", {});
    report.passed = true;
  } else if (settingsAutomationsFireJourney) {
    assert.equal(runtimeCapabilities.featureStages?.automations, "on");
    assert.equal(runtimeCapabilities.featureStages?.spaces, "on");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Create a disposable Space named Automation fire Space in the Aux UI.");
    const workspace = await until("automation fire Space", async () =>
      (await rpc("workspaces.list")).find(item => item.name === "Automation fire Space"), 120_000);
    const task = await rpc("tasks.create", {
      workspaceId: workspace.workspaceId,
      title: "Automation fire source",
      objective: "Inspect the disposable schedule fixture",
      criteria: [{ criterionId: "inspect", description: "Inspect the scheduled fixture", verification: "manual" }],
    });
    const target = new Date(Math.ceil((Date.now() + 3 * 60_000) / 60_000) * 60_000);
    const parts = Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(target);
    const hour = Number(parts.find(part => part.type === "hour")?.value);
    const minute = Number(parts.find(part => part.type === "minute")?.value);
    console.log(`In Settings → Automations, create a paused scheduled Skill from Automation fire source for every day at ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} America/Chicago, then Resume it.`);
    const routine = await until("resumed schedule for near-future fixture time", async () =>
      (await rpc("routines.list", { workspaceId: workspace.workspaceId })).find(item =>
        item.sourceTaskId === task.taskId && item.trigger.kind === "schedule" && !item.paused &&
        item.trigger.hour === hour && item.trigger.minute === minute && item.trigger.days.length === 7), 180_000);
    record("UI creates and resumes a reviewed schedule for a near-future time", { routineId: routine.routineId });
    const item = await until("scheduled review result in Automations inbox", async () =>
      (await rpc("routines.inbox", { workspaceId: workspace.workspaceId })).find(entry =>
        entry.run.routineId === routine.routineId && entry.run.status === "needs_review"), 5 * 60_000);
    assert.equal(item.run.occurrenceIdentity?.length > 0, true);
    const runs = await rpc("routines.runs", { routineId: routine.routineId });
    assert.equal(runs.filter(run => run.occurrenceIdentity === item.run.occurrenceIdentity).length, 1);
    record("Live scheduled occurrence reaches the review inbox exactly once without dispatch", { runId: item.run.routineRunId });
    report.passed = true;
  } else if (settingsAutomationsPageChangeJourney) {
    assert.equal(runtimeCapabilities.featureStages?.automations, "on");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const url = `${origin}/page-change`;
    await rpc("pages.open", { url, activate: true, ownedByRuntime: false });
    console.log(`Opened disposable local page ${url}.`);
    const page = await until("the disposable HTTPS page", async () =>
      (await rpc("pages.list")).find(item => item.url === url && item.viewStatus === "visible"), 120_000);
    const workspace = (await rpc("workspaces.list"))[0];
    assert.ok(workspace);
    const task = await rpc("tasks.create", {
      workspaceId: workspace.workspaceId,
      title: "Page change fixture source",
      objective: "Inspect the disposable page change fixture",
      criteria: [{ criterionId: "inspect", description: "Inspect page change", verification: "manual" }],
      resources: [{ resourceId: "watched-page", kind: "url", locator: url, label: "Disposable page" }],
    });
    console.log(`In Settings → Automations, create a page-change Skill from Page change fixture source for ${url}, resume it, and return to the fixture tab.`);
    const routine = await until("a resumed page-change Skill from the fixture task", async () =>
      (await rpc("routines.list", { workspaceId: workspace.workspaceId })).find(item =>
        item.sourceTaskId === task.taskId && item.trigger.kind === "page_change" &&
        item.trigger.url === url && !item.paused), 180_000);
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    await until("the first page digest baseline", () => {
      if (!existsSync(databasePath)) return false;
      const db = new DatabaseSync(databasePath, { readOnly: true });
      try {
        return !!db.prepare("SELECT value FROM kv WHERE key=?").get(`setting:routinePageDigest:${routine.routineId}`);
      } finally { db.close(); }
    }, 120_000);
    const baselineDb = new DatabaseSync(databasePath, { readOnly: true });
    try {
      const baseline = baselineDb.prepare("SELECT value FROM kv WHERE key=?")
        .get(`setting:routinePageDigest:${routine.routineId}`);
      assert.ok(baseline && !String(baseline.value).includes("Fixture version"),
        "The runtime must retain a digest, never the page text");
    } finally { baselineDb.close(); }
    assert.equal((await rpc("routines.runs", { routineId: routine.routineId })).length, 0,
      "The first page observation must only establish a baseline");
    record("Native observer establishes a baseline without firing", { pageId: page.pageId });
    pageChangeVersion = 2;
    const item = await until("one page-change review result", async () =>
      (await rpc("routines.inbox", { workspaceId: workspace.workspaceId })).find(entry =>
        entry.run.routineId === routine.routineId && entry.run.status === "needs_review"), 120_000);
    const runs = await rpc("routines.runs", { routineId: routine.routineId });
    assert.equal(runs.length, 1);
    assert.equal(runs[0].occurrenceIdentity, item.run.occurrenceIdentity);
    record("Native page-change observation produces exactly one reviewable result", { runId: item.run.routineRunId });
    report.passed = true;
  } else if (skillImportedReadinessJourney) {
    assert.equal(runtimeCapabilities.featureStages?.automations, "on");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const workspace = await rpc("workspaces.create", { name: "Imported Skill review Space" });
    const task = await rpc("tasks.create", { workspaceId: workspace.workspaceId,
      title: "Imported Skill source", objective: "Check a disposable source",
      criteria: [{ criterionId: "review", description: "Review the source", verification: "manual" }] });
    const path = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const db = new DatabaseSync(path);
    const routineId = "imported-readiness-fixture";
    try {
      const now = Date.now();
      const definition = { routineId, revision: 1, title: "Imported readiness fixture",
        objective: "Check the bound source", workspaceId: workspace.workspaceId,
        successCriteria: [], parameters: [], siteOrigins: [], accountLabels: [], calendarGrantIds: [],
        autoInject: { keywords: [], urls: [] }, reviewRequired: true, consecutive: false,
        presenceGuardExempt: false, missedRunPolicy: "record_only", trigger: { kind: "manual" },
        paused: true, activationReview: "imported", createdAt: now, updatedAt: now };
      db.prepare(`INSERT INTO routines(routine_id,workspace_id,revision,paused,archived_at,updated_at,json)
        VALUES(?,?,1,1,NULL,?,?)`).run(routineId, workspace.workspaceId, now, JSON.stringify(definition));
      db.prepare(`INSERT INTO routine_revisions(routine_id,revision,json) VALUES(?,1,?)`)
        .run(routineId, JSON.stringify(definition));
    } finally { db.close(); }
    console.log("Switch the Aux browser to Imported Skill review Space, open Skills, then open Imported readiness fixture. Bind Imported Skill source, sync its success criteria in Skill definition and outcome, then review and activate the exact revision.");
    const bound = await until("imported Skill bound but still paused", async () => {
      const value = (await rpc("routines.get", { routineId })).routine;
      return value.sourceTaskId === task.taskId && value.paused && value.activationReview === "imported" ? value : null;
    }, 180_000);
    record("Imported Skill binds a local task without gaining authority", { revision: bound.revision });
    const synced = await until("imported Skill criteria synced to task", async () => {
      const value = (await rpc("routines.get", { routineId })).routine;
      return value.paused && value.activationReview === "imported" &&
        JSON.stringify(value.successCriteria) === JSON.stringify(task.criteria) ? value : null;
    }, 180_000);
    record("Native editor saves task criteria while Skill remains paused", { revision: synced.revision });
    const ready = await until("imported Skill activated after separate review", async () => {
      const value = (await rpc("routines.get", { routineId })).routine;
      return !value.paused && !value.activationReview ? value : null;
    }, 180_000);
    assert.equal(ready.sourceTaskId, task.taskId);
    assert.deepEqual(ready.successCriteria, task.criteria);
    record("Native review activates only runnable imported Skill revision", { revision: ready.revision });
    report.passed = true;
  } else if (skillExternalTaskReviewJourney) {
    assert.equal(runtimeCapabilities.featureStages?.automations, "on");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const workspace = await rpc("workspaces.create", { name: "External task review Space" });
    const task = await rpc("tasks.create", { workspaceId: workspace.workspaceId,
      title: "External task review fixture", objective: "Check a disposable source every hour",
      criteria: [{ criterionId: "review", description: "Review the source", verification: "manual" }] });
    assert.equal(task.sourceOrigin, "external");
    console.log("In Settings → Automations, select External task review Space and create a paused recurring monitor Skill from External task review fixture. Then use Review Skill, Review activation and Activate reviewed Skill.");
    const pending = await until("external task Skill awaiting review", async () =>
      (await rpc("routines.list", { workspaceId: workspace.workspaceId })).find(item =>
        item.sourceTaskId === task.taskId && item.trigger.kind === "monitor" &&
        item.paused && item.activationReview === "untrusted_task"), 180_000);
    record("Externally authored task text cannot create a ready recurring Skill", { routineId: pending.routineId });
    const ready = await until("separate review of external task Skill", async () => {
      const value = (await rpc("routines.get", { routineId: pending.routineId })).routine;
      return !value.paused && !value.activationReview ? value : null;
    }, 180_000);
    assert.equal(ready.sourceTaskId, task.taskId);
    record("Native review activates the external task Skill revision", { revision: ready.revision });
    const revisedTask = await rpc("tasks.update", { taskId: task.taskId,
      expectedRevision: task.revision, objective: "Externally revised recurring check" });
    assert.equal(revisedTask.sourceOrigin, "external");
    const paused = await until("external task revision pauses its Skill", async () => {
      const value = (await rpc("routines.get", { routineId: pending.routineId })).routine;
      return value.paused && value.activationReview === "untrusted_task" ? value : null;
    });
    assert.equal(paused.sourceTaskRevision, task.revision);
    record("External task edit immediately pauses a previously active Skill", { revision: paused.revision });
    await until("open Skills panel shows the new pause and sync guidance", () =>
      native("has-text", "The source task changed. Sync this Skill") === "true", 30_000);
    record("Native Skills panel updates the pause without navigation");
    console.log("The task changed externally. In the Skill detail, sync the source task revision in Skill definition and outcome, then review and activate again.");
    const resumed = await until("revised external task Skill reviewed again", async () => {
      const value = (await rpc("routines.get", { routineId: pending.routineId })).routine;
      return !value.paused && !value.activationReview &&
        value.sourceTaskRevision === revisedTask.revision ? value : null;
    }, 180_000);
    record("Native review activates only the revised external task Skill", { revision: resumed.revision });
    report.passed = true;
  } else if (skillActivationReviewJourney) {
    assert.equal(runtimeCapabilities.featureStages?.automations, "on");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const workspace = (await rpc("workspaces.list"))[0];
    assert.ok(workspace);
    const task = await rpc("tasks.create", { workspaceId: workspace.workspaceId,
      title: "Activation review source", objective: "Review the result before recurring use",
      criteria: [{ criterionId: "review", description: "Review the source", verification: "manual" }] });
    const path = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const db = new DatabaseSync(path);
    const routineId = "activation-review-fixture";
    try {
      const now = Date.now();
      db.prepare(`INSERT INTO runs(run_id,goal,status,page_ids,config,created_at,ended_at)
        VALUES('activation-source-run','Inspect disposable source','completed','[]',?,?,?)`)
        .run(JSON.stringify({ taskId: task.taskId, taskRevision: task.revision }), now, now);
      const definition = { routineId, revision: 1, title: "Activation review fixture",
        objective: "Summarize a selected source", workspaceId: workspace.workspaceId,
        sourceTaskId: task.taskId, sourceTaskRevision: task.revision,
        sourceRunId: "activation-source-run", successCriteria: task.criteria,
        parameters: [], siteOrigins: [], accountLabels: [], calendarGrantIds: [],
        autoInject: { keywords: [], urls: [] }, reviewRequired: true, consecutive: false,
        presenceGuardExempt: false, missedRunPolicy: "record_only",
        trigger: { kind: "monitor", timezone: "America/Chicago", intervalMinutes: 60 },
        paused: true, activationReview: "run_result", createdAt: now, updatedAt: now };
      db.prepare(`INSERT INTO routines(routine_id,workspace_id,revision,paused,archived_at,updated_at,json)
        VALUES(?,?,1,1,NULL,?,?)`).run(routineId, workspace.workspaceId, now, JSON.stringify(definition));
      db.prepare(`INSERT INTO routine_revisions(routine_id,revision,json) VALUES(?,1,?)`)
        .run(routineId, JSON.stringify(definition));
    } finally { db.close(); }
    const derived = (await rpc("routines.get", { routineId })).routine;
    assert.equal(derived.paused, true);
    assert.equal(derived.activationReview, "run_result");
    record("Run-derived fixture starts paused with revision-bound activation review", { routineId });
    console.log("In Settings → Automations, open Activation review fixture. Select Review activation, inspect its question, then Activate reviewed Skill.");
    const ready = await until("reviewed Skill activation in native UI", async () => {
      const value = (await rpc("routines.get", { routineId: derived.routineId })).routine;
      return !value.paused && !value.activationReview ? value : null;
    }, 180_000);
    assert.equal(ready.sourceTaskId, task.taskId);
    record("Separate UI review activates the exact run-derived Skill revision", { revision: ready.revision });
    report.passed = true;
  } else if (settingsAutomationsDstJourney) {
    assert.equal(runtimeCapabilities.featureStages?.automations, "on");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const workspace = await rpc("workspaces.create", { name: "DST fixture Space" });
    const task = await rpc("tasks.create", { workspaceId: workspace.workspaceId,
      title: "DST fixture source", objective: "Review the disposable schedule",
      criteria: [{ criterionId: "review", description: "Review the schedule", verification: "manual" }] });
    console.log("In Settings → Automations, select DST fixture Space. Create a paused scheduled Skill from DST fixture source for Sunday 01:30. Confirm the clock-change explanation is visible before saving.");
    const routine = await until("reviewed native DST schedule", async () =>
      (await rpc("routines.list", { workspaceId: workspace.workspaceId })).find(item =>
        item.sourceTaskId === task.taskId && item.trigger.kind === "schedule" &&
        item.trigger.hour === 1 && item.trigger.minute === 30 && item.trigger.days.includes(0) &&
        item.paused), 180_000);
    assert.equal(routine.reviewRequired, true);
    record("Native UI creates a paused reviewed local-time schedule after showing its DST rule", {
      routineId: routine.routineId, timezone: routine.trigger.timezone });
    report.passed = true;
  } else if (settingsAutomationsPresenceJourney) {
    assert.equal(runtimeCapabilities.featureStages?.automations, "on");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const workspace = await rpc("workspaces.create", { name: "Presence fixture Space" });
    const task = await rpc("tasks.create", { workspaceId: workspace.workspaceId,
      title: "Presence fixture source", objective: "Inspect the disposable unattended result fixture",
      criteria: [{ criterionId: "inspect", description: "Review the result", verification: "manual" }] });
    console.log("In Settings → Automations, select Presence fixture Space, create a paused recurring monitor Skill from Presence fixture source, then Resume it.");
    const routine = await until("resumed presence fixture Skill", async () =>
      (await rpc("routines.list", { workspaceId: workspace.workspaceId })).find(item =>
        item.sourceTaskId === task.taskId && item.trigger.kind === "monitor" && !item.paused), 180_000);
    const path = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const db = new DatabaseSync(path);
    try {
      db.exec("PRAGMA busy_timeout=5000");
      const row = db.prepare("SELECT json FROM routines WHERE routine_id=?").get(routine.routineId);
      assert.ok(row);
      const definition = JSON.parse(row.json);
      const aged = Date.now() - 26 * 60 * 60_000;
      definition.createdAt = aged - 60_000;
      definition.activatedAt = aged - 60_000;
      db.prepare("UPDATE routines SET json=? WHERE routine_id=?").run(JSON.stringify(definition), routine.routineId);
      const insert = db.prepare(`INSERT INTO routine_runs
        (routine_run_id,routine_id,revision,occurrence_id,occurrence_identity,status,run_id,parameters,created_at,ended_at)
        VALUES (?,?,?,?,?,'completed',?,'{}',?,?)`);
      for (let i = 0; i < 3; i++) insert.run(`presence-${i}`, routine.routineId, routine.revision,
        `presence-occurrence-${i}`, `presence-identity-${i}`, `presence-model-run-${i}`,
        aged + i * 60_000, aged + i * 60_000);
      db.prepare(`INSERT INTO model_calls
        (call_id,run_id,role,model_id,duration_ms,cost_usd,created_at)
        VALUES ('presence-model-call','presence-model-run-0','planner','fixture',1,0.01,?)`).run(aged);
    } finally { db.close(); }
    const paused = await until("unread-results presence guard", async () =>
      (await rpc("routines.list", { workspaceId: workspace.workspaceId })).find(item =>
        item.routineId === routine.routineId && item.paused && item.pauseCause === "unread_results"), 130_000);
    record("Native runtime pauses an unattended model Skill with three old unread results", { routineId: paused.routineId });
    console.log("Press Keep running in the Automations presence guard choice.");
    const kept = await until("Keep running choice", async () =>
      (await rpc("routines.list", { workspaceId: workspace.workspaceId })).find(item =>
        item.routineId === routine.routineId && !item.paused && !item.pauseCause), 120_000);
    assert.equal(kept.presenceGuardExempt, false);
    record("Keep running resumes without disabling the future presence guard", {});
    report.passed = true;
  } else if (settingsAutomationsSuggestionsJourney) {
    assert.equal(runtimeCapabilities.featureStages?.automations, "on");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    assert.equal((await rpc("settings.get")).routineSuggestionScan, "context");
    console.log("In Settings → Automations, choose Off for Skill suggestion scan frequency.");
    await until("Skill suggestion scans off", async () =>
      (await rpc("settings.get")).routineSuggestionScan === "off", 120_000);
    record("UI turns local Skill suggestion scans off", {});
    console.log("Choose Every 5 minutes for Skill suggestion scan frequency.");
    await until("five-minute Skill suggestion scans", async () =>
      (await rpc("settings.get")).routineSuggestionScan === "five-minutes", 120_000);
    record("UI selects periodic local Skill suggestion scans", {});
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted Aux runtime", async () => {
      try {
        const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
        rpcPort = descriptor.port; rpcToken = descriptor.token;
        return (await rpc("workspace.get")).sessions?.some(session => session.sessionId === "aux" && session.status === "connected");
      } catch { return false; }
    }, 60_000);
    assert.equal((await rpc("settings.get")).routineSuggestionScan, "five-minutes");
    record("Skill suggestion cadence survives a full Aux restart", {});
    report.passed = true;
  } else if (settingsAutomationsCalendarJourney) {
    assert.equal(runtimeCapabilities.featureStages?.automations, "on");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const workspace = await rpc("workspaces.create", { name: "Calendar fixture Space" });
    await rpc("tasks.create", { workspaceId: workspace.workspaceId,
      title: "Calendar fixture source", objective: "Review a future Calendar event",
      criteria: [{ criterionId: "review", description: "Review the event", verification: "manual" }] });
    console.log("In Settings → Automations, open Create automation, choose Calendar fixture source and Calendar event. Verify the account-grant guidance and disabled Create paused Skill button.");
    await until("Calendar grant guidance in the creation dialog", () =>
      native("has-name", "Calendar task grant") === "true" &&
      native("has-name", "Calendar accounts are unavailable in this build.") === "true", 120_000);
    assert.equal((await rpc("routines.list", { workspaceId: workspace.workspaceId })).length, 0);
    record("Calendar creation requires an available, task-granted account in this disposable Profile", {});
    report.passed = true;
  } else if (settingsAutomationsNotificationJourney) {
    assert.equal(runtimeCapabilities.featureStages?.automations, "on");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const url = `${origin}/notification`;
    await rpc("pages.open", { url, activate: true, ownedByRuntime: false });
    await until("the disposable notification page", async () =>
      (await rpc("pages.list")).find(item => item.url === url && item.viewStatus === "visible"), 120_000);
    const workspace = (await rpc("workspaces.list"))[0];
    assert.ok(workspace);
    const task = await rpc("tasks.create", {
      workspaceId: workspace.workspaceId,
      title: "Notification fixture source",
      objective: "Inspect the disposable site notification fixture",
      criteria: [{ criterionId: "inspect", description: "Inspect a site notification", verification: "manual" }],
    });
    console.log(`In Settings → Automations, create a site-notification Skill from Notification fixture source for ${origin}, resume it, return to the fixture tab, and press Show fixture notification once.`);
    const routine = await until("a resumed site-notification Skill from the fixture task", async () =>
      (await rpc("routines.list", { workspaceId: workspace.workspaceId })).find(item =>
        item.sourceTaskId === task.taskId && item.trigger.kind === "site_notification" &&
        item.trigger.origin === origin && !item.paused), 180_000);
    record("UI creates and resumes a site-notification Skill for an exact granted origin", { routineId: routine.routineId });
    const item = await until("one site-notification review result", async () =>
      (await rpc("routines.inbox", { workspaceId: workspace.workspaceId })).find(entry =>
        entry.run.routineId === routine.routineId && entry.run.status === "needs_review"), 120_000);
    const runs = await rpc("routines.runs", { routineId: routine.routineId });
    assert.equal(runs.length, 1);
    assert.equal(runs[0].occurrenceIdentity, item.run.occurrenceIdentity);
    record("Native site notification produces one reviewable result without dispatch", { runId: item.run.routineRunId });
    report.passed = true;
  } else if (settingsAutomationsWakeJourney) {
    assert.equal(runtimeCapabilities.featureStages?.automations, "on");
    assert.equal(runtimeCapabilities.featureStages?.spaces, "on");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Create a disposable Space named Automation wake Space in the Aux UI.");
    const workspace = await until("automation wake Space", async () =>
      (await rpc("workspaces.list")).find(item => item.name === "Automation wake Space"), 120_000);
    const task = await rpc("tasks.create", {
      workspaceId: workspace.workspaceId,
      title: "Automation wake source",
      objective: "Inspect the disposable wake policy fixture",
      criteria: [{ criterionId: "inspect", description: "Inspect the wake fixture", verification: "manual" }],
    });
    console.log("In Settings → Automations, create a paused scheduled Skill from Automation wake source.");
    const scheduled = await until("wake policy fixture Skill", async () =>
      (await rpc("routines.list", { workspaceId: workspace.workspaceId })).find(item =>
        item.sourceTaskId === task.taskId && item.trigger.kind === "schedule"), 180_000);
    assert.equal(scheduled.paused, true);
    assert.equal(scheduled.missedRunPolicy, "record_only");
    record("New scheduled Skill defaults to recording missed runs", { routineId: scheduled.routineId });
    console.log("Choose Run once when Aux opens for this Skill in Automations Settings.");
    const updated = await until("run-once-on-wake policy saved", async () =>
      (await rpc("routines.list", { workspaceId: workspace.workspaceId })).find(item =>
        item.routineId === scheduled.routineId && item.missedRunPolicy === "run_once_on_wake"), 120_000);
    assert.equal(updated.paused, true, "Changing catch-up policy must not resume the Skill");
    assert.deepEqual(updated.successCriteria, task.criteria);
    record("Run-once-on-wake choice preserves pause and review criteria", {});
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted Aux runtime", async () => {
      try {
        const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
        rpcPort = descriptor.port; rpcToken = descriptor.token;
        return (await rpc("workspace.get")).sessions?.some(session => session.sessionId === "aux" && session.status === "connected");
      } catch { return false; }
    }, 60_000);
    const persisted = (await rpc("routines.list", { workspaceId: workspace.workspaceId }))
      .find(item => item.routineId === scheduled.routineId);
    assert.equal(persisted?.missedRunPolicy, "run_once_on_wake");
    assert.equal(persisted?.paused, true);
    record("Catch-up policy survives a full Aux restart", {});
    report.passed = true;
  } else if (settingsAutomationsCreateJourney) {
    assert.equal(runtimeCapabilities.featureStages?.automations, "on");
    assert.equal(runtimeCapabilities.featureStages?.spaces, "on");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Create a disposable Space named Automation creation Space in the Aux UI.");
    const workspace = await until("automation creation Space", async () =>
      (await rpc("workspaces.list")).find(item => item.name === "Automation creation Space"), 120_000);
    const task = await rpc("tasks.create", {
      workspaceId: workspace.workspaceId,
      title: "Automation creation source",
      objective: "Inspect the disposable automation creation fixture",
      criteria: [{ criterionId: "inspect", description: "Inspect the fixture", verification: "manual" }],
    });
    console.log("In Settings → Automations, create a paused scheduled Skill from Automation creation source with a $4.50 cap.");
    const scheduled = await until("scheduled Skill created through Settings", async () =>
      (await rpc("routines.list", { workspaceId: workspace.workspaceId })).find(item =>
        item.sourceTaskId === task.taskId && item.trigger.kind === "schedule" && item.spendCapUsd === 4.5), 180_000);
    assert.equal(scheduled.paused, true);
    assert.equal(scheduled.reviewRequired, true);
    assert.deepEqual(scheduled.successCriteria, task.criteria);
    record("Settings creates a paused, capped Skill with task review criteria", { routineId: scheduled.routineId });
    console.log("Create a second paused Skill from the same task for a site notification at https://example.com.");
    const event = await until("event Skill created through Settings", async () =>
      (await rpc("routines.list", { workspaceId: workspace.workspaceId })).find(item =>
        item.sourceTaskId === task.taskId && item.trigger.kind === "site_notification" &&
        item.trigger.origin === "https://example.com"), 180_000);
    assert.equal(event.paused, true);
    assert.ok(event.siteOrigins.includes("https://example.com"));
    record("Settings creates a paused site-event Skill with exact reviewed origin", { routineId: event.routineId });
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted Aux runtime", async () => {
      try {
        const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
        rpcPort = descriptor.port; rpcToken = descriptor.token;
        return (await rpc("workspace.get")).sessions?.some(session => session.sessionId === "aux" && session.status === "connected");
      } catch { return false; }
    }, 60_000);
    const persisted = await rpc("routines.list", { workspaceId: workspace.workspaceId });
    assert.ok(persisted.some(item => item.routineId === scheduled.routineId && item.paused && item.spendCapUsd === 4.5));
    assert.ok(persisted.some(item => item.routineId === event.routineId && item.paused && item.trigger.kind === "site_notification"));
    record("Scheduled and event Skills survive a full Aux restart", {});
    report.passed = true;
  } else if (settingsAutomationsJourney) {
    assert.equal(runtimeCapabilities.featureStages?.automations, "on",
      "The native automation feature must be qualified before this journey");
    assert.equal(runtimeCapabilities.featureStages?.spaces, "on",
      "Automations need persistent Spaces in the native host");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Create a disposable Space named Automation fixture Space in the Aux UI.");
    const workspace = await until("disposable Space created in Aux", async () =>
      (await rpc("workspaces.list")).find(item => item.name === "Automation fixture Space"), 120_000);
    record("Native Space creation binds a runtime workspace", { workspaceId: workspace.workspaceId });
    const task = await rpc("tasks.create", {
      workspaceId: workspace.workspaceId,
      title: "Automation spend fixture",
      objective: "Inspect this disposable automation fixture",
      criteria: [{ criterionId: "inspect", description: "Inspect the fixture", verification: "manual" }],
    });
    console.log("Open Tasks, select Automation spend fixture, and save it as a Skill. Pause the Skill, then set a monitor trigger.");
    const routine = await until("disposable Skill scheduled from the Aux UI", async () =>
      (await rpc("routines.list", { workspaceId: workspace.workspaceId, includeArchived: true }))
        .find(item => item.sourceTaskId === task.taskId && item.paused && item.trigger.kind === "monitor"), 180_000);
    record("Tasks created and paused a monitored Skill through the native UI", { routineId: routine.routineId });
    console.log("Open Settings → Automations and set the Skill's model spend cap to 3.25 USD.");
    await until("Automation Settings route and fixture row", () =>
      native("shell-url") === "chrome://aux/settings/automations" &&
      native("has-name", "Automation spend fixture") === "true", 120_000);
    record("Automations route shows the saved monitored Skill", { routineId: routine.routineId });
    const updated = await until("automation spend cap saved", async () => {
      const item = (await rpc("routines.list", { workspaceId: workspace.workspaceId, includeArchived: true }))
        .find(item => item.routineId === routine.routineId);
      return item?.spendCapUsd === 3.25 ? item : null;
    }, 120_000);
    assert.equal(updated.paused, true, "Changing the cap must not resume a paused Skill");
    record("Automations Settings persists the $3.25 model spend cap without resuming the Skill", {});
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted Aux runtime", async () => {
      try {
        const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
        rpcPort = descriptor.port; rpcToken = descriptor.token;
        return (await rpc("workspace.get")).sessions?.some(session => session.sessionId === "aux" && session.status === "connected");
      } catch { return false; }
    }, 60_000);
    assert.ok((await rpc("workspaces.list")).some(item => item.workspaceId === workspace.workspaceId));
    const persisted = (await rpc("routines.list", { workspaceId: workspace.workspaceId, includeArchived: true }))
      .find(item => item.routineId === routine.routineId);
    assert.equal(persisted?.spendCapUsd, 3.25);
    assert.equal(persisted?.trigger.kind, "monitor");
    assert.equal(persisted?.paused, true);
    record("Space, monitor trigger, pause state, and spend cap survive a full Aux restart", {});
    report.passed = true;
  } else if (settingsUsageJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → Usage & Budgets. The operator checks the top shell URL in CUA.");
    const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
    const ledger = new DatabaseSync(databasePath, { readOnly: true });
    try {
      assert.equal(ledger.prepare("SELECT COUNT(*) AS calls FROM model_calls").get().calls, 0);
    } finally { ledger.close(); }
    record("Usage report reads the disposable Profile ledger", { calls: 0 });
    console.log("Set the Per day budget to 2.50 USD and press Save caps.");
    await until("day budget persisted", async () => (await rpc("settings.get")).budgets?.dayUsd === 2.5, 120_000);
    record("Per-day budget persists in the Profile", { dayUsd: 2.5 });
    console.log(`Press Export CSV… and save the file in ${output}.`);
    const exported = await until("native usage CSV export", () => readdirSync(output).find(name => /^aux-usage-\d{4}-\d{2}-\d{2}\.csv$/.test(name)), 180_000);
    const csv = readFileSync(join(output, exported), "utf8");
    assert.match(csv, /"Group","ID","Description","Calls","Recorded USD"/);
    assert.match(csv, /"Total","","Recorded USD includes estimates; unpriced calls are excluded","0"/);
    record("Native save dialog exports a parseable usage CSV", { file: exported, bytes: Buffer.byteLength(csv) });
    report.passed = true;
  } else if (settingsNewTabJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Settings → General, set New tab mode to Ask, then open a new blank tab. Check the Ask composer in CUA.");
    await until("Ask new-tab preference persisted", async () => (await rpc("settings.get")).homeEntryMode === "ask", 120_000);
    record("General saves Ask as the Profile new-tab preference", { homeEntryMode: "ask" });
    console.log("Open Settings → Quick Ask and check the routed URL and Open Quick Ask control in CUA.");
    await until("Quick Ask section URL", () => native("shell-url") === "chrome://aux/settings/quick-ask", 120_000);
    record("Quick Ask opens as a routed Settings section", { url: native("shell-url") });
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    }, 30_000);
    await until("restarted new-tab preference", async () => {
      try {
        const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
        rpcPort = descriptor.port;
        rpcToken = descriptor.token;
        return (await rpc("settings.get")).homeEntryMode === "ask";
      } catch { return false; }
    }, 30_000);
    record("Ask new-tab preference survives an Aux restart", { homeEntryMode: "ask" });
    report.passed = true;
  } else if (settingsArchivedJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → Archived chats and check its empty-state search controls in CUA.");
    await until("Archived chats section URL", () => {
      try { return native("shell-url") === "chrome://aux/settings/archived-chats"; }
      catch { return false; }
    }, 120_000);
    record("Archived chats opens as a routed Settings section", { url: native("shell-url") });
    report.passed = true;
  } else if (settingsGeneralJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → General. Check the New tab mode control, then open Keyword engines.");
    await until("General controls", () => {
      try { return native("shell-url") === "chrome://aux/settings/general" && native("has-name", "New tab mode") === "true"; }
      catch { return false; }
    }, 120_000);
    record("Extracted General section renders its indexed browsing controls", {});
    await until("Keyword engines editor", () => {
      try { return native("has-button", "Back to General settings") === "true" && native("has-name", "Keyword engines") === "true"; }
      catch { return false; }
    }, 120_000);
    record("General opens the Keyword engines editor", {});
    console.log("Return to General and open Task data backup. Do not create, restore or delete a backup.");
    await until("Task data backup editor", () => {
      try { return native("has-button", "Create backup…") === "true" && native("has-button", "Restore backup…") === "true"; }
      catch { return false; }
    }, 120_000);
    record("General opens the backup editor without changing data", {});
    report.passed = true;
  } else if (settingsDownloadFolderJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const chosenFolder = join(disposable, "settings-download-target");
    mkdirSync(chosenFolder);
    const canonicalFolder = realpathSync(chosenFolder);
    console.log("Open Aux Settings → General, then choose the disposable download folder:", chosenFolder);
    await until("General download-folder control", () => {
      try {
        return native("shell-url") === "chrome://aux/settings/general" &&
          native("has-name", "Download folder") === "true" &&
          native("has-button", "Change folder…") === "true";
      } catch { return false; }
    }, 120_000);
    record("General shows the native Profile download folder", {});
    await until("chosen General download folder", () => {
      try { return native("has-button", "Use default") === "true"; }
      catch { return false; }
    }, 120_000);
    await until("native download folder preference", () => {
      try {
        const preference = JSON.parse(readFileSync(join(profile, "Default/Preferences"), "utf8"));
        return preference.download?.default_directory === canonicalFolder;
      } catch { return false; }
    });
    record("General picker stores the disposable native download folder", { folder: "disposable/settings-download-target" });
    console.log("Choose Use default in General.");
    await until("default General download folder restored", () => {
      try { return native("has-button", "Use default") === "false" && native("has-button", "Change folder…") === "true"; }
      catch { return false; }
    }, 120_000);
    record("General restores the native default download folder", {});
    report.passed = true;
  } else if (settingsAboutJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → General and inspect About Aux with CUA.");
    await until("General About Aux field", () => {
      try { return native("shell-url") === "chrome://aux/settings/general" && native("has-name", "About Aux") === "true" && native("has-name", "154.0.8037.58") === "true"; }
      catch { return false; }
    }, 120_000);
    record("General displays the installed native build identity", {});
    report.passed = true;
  } else if (settingsSpellCheckJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → General, then turn Spell check off and back on with CUA.");
    await until("General spell-check field", () => {
      try { return native("shell-url") === "chrome://aux/settings/general" && native("has-name", "Check spelling as you type") === "true"; }
      catch { return false; }
    }, 120_000);
    record("General exposes Chromium Profile spell check", {});
    const enabled = () => {
      try {
        const preference = JSON.parse(readFileSync(join(profile, "Default/Preferences"), "utf8"));
        return preference.browser?.enable_spellchecking;
      } catch { return undefined; }
    };
    await until("spell check disabled in Chromium Profile", () => enabled() === false, 120_000);
    record("General disables spell check in the disposable Profile", {});
    console.log("Turn Spell check back on.");
    await until("spell check re-enabled in Chromium Profile", () => enabled() === true, 120_000);
    record("General restores spell check in the disposable Profile", {});
    report.passed = true;
  } else if (settingsQualifiedRailJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings and inspect the qualified sections in CUA.");
    await until("qualified Settings sections", () => {
      try {
        return native("shell-url") === "chrome://aux/settings/general" &&
          native("has-button", "Privacy & Security") === "true" &&
          native("has-button", "Extensions") === "true" &&
          native("has-button", "Quick Ask") === "true";
      } catch { return false; }
    }, 120_000);
    record("qualified Privacy, Extensions, and Quick Ask sections appear in the native rail", {});
    report.passed = true;
  } else if (settingsStartupJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const startupUrl = `${origin}/red`;
    console.log("Open Aux Settings → General and add this disposable startup page:", startupUrl);
    await until("General startup controls", () => {
      try { return native("shell-url") === "chrome://aux/settings/general" && native("has-name", "Startup page URL") === "true"; }
      catch { return false; }
    }, 120_000);
    record("General exposes Chromium startup mode and page editor", {});
    await until("custom startup page saved in Chromium Profile", () => {
      try {
        const preference = JSON.parse(readFileSync(join(profile, "Default/Secure Preferences"), "utf8"));
        return preference.session?.restore_on_startup === 4 && preference.session?.startup_urls?.includes(startupUrl);
      } catch { return false; }
    }, 120_000);
    record("General saves a disposable custom startup page", {});
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    }, 30_000);
    await until("custom startup page opened after restart", async () => {
      try {
        const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
        rpcPort = descriptor.port;
        rpcToken = descriptor.token;
        const pages = await rpc("pages.list");
        return pages.some(page => page.url === startupUrl && !page.loading);
      } catch { return false; }
    }, 60_000);
    record("Chromium opens the chosen page after Aux restart", { url: "disposable/red" });
    report.passed = true;
  } else if (settingsLanguagesJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → General; add es-ES, then move it to the top of Languages with CUA.");
    await until("General languages controls", () => {
      try { return native("shell-url") === "chrome://aux/settings/general" && native("has-name", "Language code") === "true"; }
      catch { return false; }
    }, 120_000);
    record("General exposes native Profile language order", {});
    await until("Spanish first in Chromium Profile languages", () => {
      try {
        const preference = JSON.parse(readFileSync(join(profile, "Default/Preferences"), "utf8"));
        return preference.intl?.selected_languages?.startsWith("es-ES,");
      } catch { return false; }
    }, 120_000);
    record("General saves Spanish first in the Chromium Profile", {});
    await rpc("pages.open", { url: `${origin}/language-header`, activate: true });
    await until("site receives selected language header", () => languageHeader.toLowerCase().startsWith("es-es"), 30_000);
    record("a live website request receives the selected language first", { header: languageHeader });
    report.passed = true;
  } else if (settingsPipJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → General; choose Block automatic picture in picture, then restore Ask each site with CUA.");
    await until("General automatic picture-in-picture control", () => {
      try { return native("shell-url") === "chrome://aux/settings/general" && native("has-name", "Automatic picture in picture") === "true"; }
      catch { return false; }
    }, 120_000);
    record("General exposes Chromium automatic picture-in-picture policy", {});
    const setting = () => {
      try {
        const preference = JSON.parse(readFileSync(join(profile, "Default/Preferences"), "utf8"));
        return preference.profile?.default_content_setting_values?.auto_picture_in_picture;
      } catch { return null; }
    };
    await until("automatic picture-in-picture blocked in Profile", () => setting() === 2, 120_000);
    record("General blocks automatic picture in picture in the disposable Profile", {});
    console.log("Restore Ask each site.");
    await until("automatic picture-in-picture prompt restored", () => [3, undefined].includes(setting()), 120_000);
    record("General restores automatic picture-in-picture prompting", {});
    report.passed = true;
  } else if (settingsCrashConsentJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → Privacy & Security and inspect Crash reports and Help improve Aux with CUA.");
    await until("local-only crash reporting state", () => {
      try { return native("shell-url") === "chrome://aux/settings/privacy-security" &&
        native("has-name", "Send crash reports") === "true" &&
        native("has-text", "no crash-report destination") === "true" &&
        native("has-name", "Help improve Aux") === "true" &&
        native("has-text", "Off") === "true"; }
      catch { return false; }
    }, 120_000);
    record("Privacy & Security shows crash uploads unavailable and Help improve Aux off", {});
    report.passed = true;
  } else if (settingsCookieControlsJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const preference = () => {
      try { return JSON.parse(readFileSync(join(profile, "Default/Preferences"), "utf8")).profile?.cookie_controls_mode; }
      catch { return undefined; }
    };
    assert.equal(preference(), 0, "Disposable Profile starts with third-party cookie blocking off");
    await rpc("pages.open", { url: `${origin}/cookie-top?phase=off`, activate: true });
    await until("allowed third-party cookie check", () => cookieChecks.off !== null, 30_000);
    assert.equal(cookieChecks.off, true, "Baseline must send a third-party cookie before blocking is enabled");
    record("disposable baseline sends a third-party cookie while blocking is off", {});
    console.log("Open Aux Settings → Privacy & Security, then turn on Block third-party cookies with CUA.");
    await until("cookie control in Privacy & Security", () => {
      try { return native("shell-url") === "chrome://aux/settings/privacy-security" && native("has-name", "Block third-party cookies") === "true"; }
      catch { return false; }
    }, 120_000);
    record("Privacy & Security exposes Chromium cookie controls", {});
    await until("third-party cookie blocking saved in Chromium Profile", () => preference() === 1, 120_000);
    record("third-party cookie blocking persists in the disposable Profile", { mode: preference() });
    await rpc("pages.open", { url: `${origin}/cookie-top?phase=on`, activate: true });
    await until("blocked third-party cookie check", () => cookieChecks.on !== null, 30_000);
    assert.equal(cookieChecks.on, false, "Enabled protection must stop the third-party cookie from reaching the fixture");
    record("third-party cookie is not sent after blocking is enabled", {});
    report.passed = true;
  } else if (settingsHttpsFirstJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → Privacy & Security and turn off HTTPS-first with CUA.");
    await until("HTTPS-first control in Privacy & Security", () => {
      try { return native("shell-url") === "chrome://aux/settings/privacy-security" &&
        native("has-name", "Automatically upgrade eligible HTTP pages") === "true"; }
      catch { return false; }
    }, 120_000);
    record("Privacy & Security exposes the independent HTTPS-first control", {});
    const preference = () => {
      try { return JSON.parse(readFileSync(join(profile, "Default/Preferences"), "utf8")).aux?.https_upgrades_enabled; }
      catch { return null; }
    };
    await until("HTTPS-first disabled in Chromium Profile", () => preference() === false, 120_000);
    record("HTTPS-first off persists in the disposable Chromium Profile", { chromiumModes: (() => { const p = JSON.parse(readFileSync(join(profile, "Default/Preferences"), "utf8")); return { strict: p.https_only_mode_enabled, balanced: p.https_first_balanced_mode_enabled }; })() });
    await rpc("pages.open", { url: "http://aux-s9-off.notarealdomain-auxprobe.com/probe", activate: true });
    await until("plain HTTP when HTTPS-first is off", () => httpPlainRequests > 0, 30_000);
    assert.equal(tlsHelloRequests, 0, "Disabled HTTPS-first must not initiate a TLS upgrade");
    record("disabled HTTPS-first loads the local fixture over HTTP", { httpPlainRequests });
    console.log("Return to Privacy & Security with CUA and turn HTTPS-first on.");
    await until("HTTPS-first enabled in Chromium Profile", () => preference() === true, 120_000);
    record("HTTPS-first on persists in the disposable Chromium Profile", {});
    await rpc("pages.open", { url: "http://aux-s9-on.notarealdomain-auxprobe.com/probe", activate: true });
    await until("TLS ClientHello when HTTPS-first is on", () => tlsHelloRequests > 0, 30_000);
    record("enabled HTTPS-first attempts TLS before local HTTP fallback", { tlsHelloRequests });
    report.passed = true;
  } else if (settingsPrivacyGatesJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → Privacy & Security with CUA.");
    await until("Privacy & Security with HTTPS control and preview blocking hidden", () => {
      try { return native("shell-url") === "chrome://aux/settings/privacy-security" &&
        native("has-name", "Automatically upgrade eligible HTTP pages") === "true" &&
        native("has-name", "Block trackers and ads") === "false"; }
      catch { return false; }
    }, 120_000);
    record("Privacy & Security keeps qualified HTTPS control and hides unqualified blocking", {});
    report.passed = true;
  } else if (regularPageZoomJourney) {
    assert.equal(runtimeCapabilities.featureStages?.pageZoom, "on",
      "Regular Profile site zoom must be qualified in the native manifest");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/private-zoom`, activate: true });
    await until("regular zoom fixture page", () => privateZoomPageRequests >= 1, 30_000);
    await until("regular zoom fixture loaded", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading), 30_000);
    assert.ok(Math.abs((await rpc("pages.zoom", { pageId: page.pageId })).level) < 0.01,
      "The disposable website must start at 100% zoom");
    console.log("Open Site controls and choose Zoom in for the disposable website with CUA.");
    await until("regular website zoomed in", async () =>
      (await rpc("pages.zoom", { pageId: page.pageId })).level > 0.4, 120_000);
    record("Site controls changes Chromium page zoom for the regular Profile", {});
    console.log("Open Aux Settings → Appearance and inspect Website sizes with CUA.");
    await until("saved website size in Appearance", () => {
      try { return native("shell-url") === "chrome://aux/settings/appearance" &&
        native("has-name", "Reset size for 127.0.0.1") === "true"; }
      catch { return false; }
    }, 120_000);
    record("Appearance lists the saved website size", {});
    console.log("Choose Reset for 127.0.0.1 in Website sizes with CUA.");
    await until("regular website zoom reset", async () =>
      Math.abs((await rpc("pages.zoom", { pageId: page.pageId })).level) < 0.01, 120_000);
    record("Website sizes resets Chromium zoom for the open tab", {});
    report.passed = true;
  } else if (settingsShortcutsAppearanceJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → Appearance with CUA and expand Keyboard shortcuts.");
    await until("shortcut editor in Appearance", () => {
      try { return native("shell-url") === "chrome://aux/settings/appearance" &&
        native("has-name", "Find keyboard shortcut") === "true" &&
        native("has-name", "Change New Tab shortcut") === "true"; }
      catch { return false; }
    }, 120_000);
    record("Appearance contains the rebindable shortcut editor", {});
    console.log("Choose Change New Tab shortcut, then press ⌘⇧Y with CUA.");
    await until("New Tab shortcut override saved", async () => {
      const binding = (await rpc("settings.get")).shortcutOverrides?.["new-tab"]?.[0];
      return binding?.key === "y" && binding.command === true && binding.shift === true;
    }, 120_000);
    record("Appearance saves a Profile shortcut override", {});
    console.log("Choose Reset New Tab shortcut with CUA.");
    await until("New Tab shortcut override reset", async () =>
      (await rpc("settings.get")).shortcutOverrides?.["new-tab"] === undefined, 120_000);
    record("Appearance restores the default shortcut", {});
    report.passed = true;
  } else if (privateShellJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open a Private Aux window with CUA and inspect its new tab.");
    await until("Private browsing notice", () => native("has-name", "Private browsing") === "true", 120_000);
    await delay(1500);
    assert.equal(native("has-name", "Runtime reconnecting — tabs keep working"), "false",
      "A Private window must not show a runtime reconnect banner");
    assert.equal(native("has-name", "Couldn’t reconnect to the Aux runtime"), "false",
      "A Private window must not show a runtime failure notification");
    record("Private shell uses native tabs without a misleading runtime reconnect", {});
    report.passed = true;
  } else if (privatePageZoomJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log(`Open a Private Aux window and visit ${origin}/private-zoom with CUA, then open Site controls.`);
    await until("Private zoom fixture page", () => privateZoomPageRequests >= 1, 120_000);
    await until("Private page zoom starts at 100%", () => native("has-name", "100%") === "true", 120_000);
    record("Private Site controls reads page zoom without Aux Runtime", {});
    console.log("Choose Zoom in in Private Site controls with CUA.");
    await until("Private page zoom reaches 110%", () => native("has-name", "110%") === "true", 120_000);
    record("Private Site controls changes page zoom natively", {});
    report.passed = true;
  } else if (siteBlockingPrivateJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log(`Open a Private Aux window and visit ${origin}/blocking?phase=private with CUA.`);
    await until("private blocking page", () => blockingPageRequests >= 1, 120_000);
    await delay(1500);
    assert.equal(trackerFixtureRequests, 0, "A Private window must block the known tracker before any exception");
    record("Private window blocks a known tracker before network egress", {});
    console.log("Pause Block trackers and ads in Private Site controls, then reload this fixture page with CUA.");
    await until("private exception allows the tracker", () => trackerFixtureRequests > 0, 120_000);
    record("Private site exception allows the tracker only in the active Private session", { trackerFixtureRequests });
    const beforeReopen = trackerFixtureRequests;
    const beforePageReopen = blockingPageRequests;
    console.log(`Close the last Private window, open a new Private window, then visit ${origin}/blocking?phase=private-again with CUA.`);
    await until("fixture opened in a new Private session", () => blockingPageRequests > beforePageReopen, 120_000);
    await delay(1500);
    assert.equal(trackerFixtureRequests, beforeReopen, "A new Private session must not retain the prior site's tracker exception");
    record("Private site exception does not survive the last Private window closing", { trackerFixtureRequests });
    report.passed = true;
  } else if (siteBlockingExceptionJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("pages.open", { url: `${origin}/blocking?phase=initial`, activate: true });
    await until("initial blocking page", () => blockingPageRequests >= 1, 30_000);
    await delay(1500);
    assert.equal(trackerFixtureRequests, 0, "Tracker must start blocked for the disposable site");
    record("tracker is blocked before a site exception", {});
    console.log("Open Site controls and pause Block trackers and ads for this disposable site.");
    const allowedHosts = () => {
      try { return JSON.parse(readFileSync(join(profile, "Default/Aux Runtime Data/filters/blocking.json"), "utf8")).allowedSiteHosts ?? []; }
      catch { return null; }
    };
    await until("site exception saved", () => allowedHosts()?.includes("127.0.0.1"), 120_000);
    await delay(1500);
    assert.ok(allowedHosts()?.includes("127.0.0.1"), "Site exception must survive the native apply callback");
    record("Site controls persists the disposable site exception", {});
    await rpc("pages.open", { url: `${origin}/blocking?phase=allowed`, activate: true });
    await until("tracker request allowed for exception site", () => trackerFixtureRequests > 0, 30_000);
    record("site exception lets its tracker request reach the network", { trackerFixtureRequests });
    console.log("Open Privacy & Security and choose Resume blocking for 127.0.0.1.");
    await until("site exception removed", () => allowedHosts()?.includes("127.0.0.1") === false, 120_000);
    const before = trackerFixtureRequests;
    await rpc("pages.open", { url: `${origin}/blocking?phase=restored`, activate: true });
    await until("restored blocking page", () => blockingPageRequests >= 3, 30_000);
    await delay(1500);
    assert.equal(trackerFixtureRequests, before, "Removing the exception must block tracker requests again");
    record("removing the site exception restores network blocking", { trackerFixtureRequests });
    report.passed = true;
  } else if (settingsContentBlockingJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → Privacy & Security and inspect the tracker-blocking and filter-list controls with CUA.");
    await until("native content-blocking controls in Privacy & Security", () => {
      try { return native("shell-url") === "chrome://aux/settings/privacy-security" &&
        native("has-name", "Block trackers and ads") === "true" &&
        native("has-name", "Filter lists") === "true"; }
      catch { return false; }
    }, 120_000);
    record("Privacy & Security exposes native content-blocking controls", {});
    await rpc("pages.open", { url: `${origin}/blocking?phase=on`, activate: true });
    await until("blocking fixture page", () => blockingPageRequests >= 1, 30_000);
    await delay(1500);
    assert.equal(trackerFixtureRequests, 0, "Enabled content blocking must cancel the known tracker request");
    record("built-in tracker host is blocked before the network", { trackerFixtureRequests });
    console.log("Turn off Block trackers and ads with CUA.");
    await until("tracker blocking disabled in runtime settings", () => {
      try {
        const state = JSON.parse(readFileSync(join(profile, "Default/Aux Runtime Data/filters/blocking.json"), "utf8"));
        return state.enabled === false;
      } catch { return false; }
    }, 120_000);
    await rpc("pages.open", { url: `${origin}/blocking?phase=off`, activate: true });
    await until("tracker network request with blocking off", () => trackerFixtureRequests > 0, 30_000);
    record("disabling tracker blocking allows the same fixture request", { trackerFixtureRequests });
    console.log("Turn on Block trackers and ads with CUA.");
    await until("tracker blocking restored in runtime settings", () => {
      try {
        const state = JSON.parse(readFileSync(join(profile, "Default/Aux Runtime Data/filters/blocking.json"), "utf8"));
        return state.enabled === true;
      } catch { return false; }
    }, 120_000);
    const before = trackerFixtureRequests;
    await rpc("pages.open", { url: `${origin}/blocking?phase=restored`, activate: true });
    await until("restored blocking fixture page", () => blockingPageRequests >= 3, 30_000);
    await delay(1500);
    assert.equal(trackerFixtureRequests, before, "Restored blocking must cancel the tracker request");
    record("restored tracker blocking cancels the request again", { trackerFixtureRequests });
    await rpc("pages.open", { url: `${origin}/blocking-redirect?phase=on`, activate: true });
    await until("same-origin redirect fixture", () => redirectFixtureRequests >= 1, 30_000);
    await delay(1500);
    assert.equal(trackerFixtureRequests, before, "A same-origin image redirect must not bypass tracker blocking");
    record("redirect to a built-in tracker host stays blocked", { trackerFixtureRequests, redirectFixtureRequests });
    report.passed = true;
  } else if (settingsCustomListJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → Privacy & Security with CUA; the disposable custom-list fixture uses a pinned public HTTPS hosts file.");
    await until("native filter list controls", () => {
      try { return native("shell-url") === "chrome://aux/settings/privacy-security" &&
        native("has-name", "Filter lists") === "true" &&
        native("has-name", "Review list") === "true"; }
      catch { return false; }
    }, 120_000);
    await rpc("pages.open", { url: `${origin}/custom-list?phase=before`, activate: true });
    await until("unlisted fixture host reaches the network", () => customTrackerRequests >= 1, 30_000);
    record("unlisted host loads before adding the list", { customTrackerRequests });
    console.log("In Filter lists, add 'Unchecky fixture' from https://raw.githubusercontent.com/StevenBlack/hosts/abe587abf7979d93b7a8267d5d3e1fbc32541163/data/UncheckyAds/hosts with the Review list step.");
    const snapshotPath = join(profile, "Default/Aux Blocking/snapshot.json");
    const customHostInstalled = () => {
      try { return JSON.parse(readFileSync(snapshotPath, "utf8")).hosts.includes("cdn.appround.biz"); }
      catch { return false; }
    };
    await until("pinned custom host installed in Chromium snapshot", customHostInstalled, 120_000);
    const before = customTrackerRequests;
    await rpc("pages.open", { url: `${origin}/custom-list?phase=enabled`, activate: true });
    await until("custom-list page after installation", () => customPageRequests >= 2, 30_000);
    await delay(1500);
    assert.equal(customTrackerRequests, before, "Custom list host must be canceled before reaching the fixture");
    record("downloaded custom host blocks a native page subresource", { customTrackerRequests });
    const source = JSON.parse(readFileSync(join(profile, "Default/Aux Runtime Data/filters/sources.json"), "utf8"))
      .find(entry => entry.name === "Unchecky fixture");
    assert.ok(source?.id, "The reviewed fixture list must have a saved source ID");
    const sourceMetaPath = join(profile, "Default/Aux Runtime Data/filters", `${source.id}.meta.json`);
    const firstFetch = JSON.parse(readFileSync(sourceMetaPath, "utf8")).fetchedAt;
    console.log("Choose Update enabled lists in Filter lists with CUA.");
    await until("custom list refresh completed", () => {
      try {
        const meta = JSON.parse(readFileSync(sourceMetaPath, "utf8"));
        return meta.fetchedAt > firstFetch && !meta.error && customHostInstalled();
      } catch { return false; }
    }, 120_000);
    const beforeRefresh = customTrackerRequests;
    await rpc("pages.open", { url: `${origin}/custom-list?phase=refreshed`, activate: true });
    await until("custom-list page after refresh", () => customPageRequests >= 3, 30_000);
    await delay(1500);
    assert.equal(customTrackerRequests, beforeRefresh, "Refreshed custom list must still cancel the fixture request");
    record("refresh preserves the installed custom host and native blocking", { customTrackerRequests });
    console.log("Pause Unchecky fixture in Filter lists with CUA.");
    await until("custom host removed from Chromium snapshot", () => !customHostInstalled(), 120_000);
    await rpc("pages.open", { url: `${origin}/custom-list?phase=paused`, activate: true });
    await until("paused list allows fixture host", () => customTrackerRequests > before, 30_000);
    record("pausing the custom list restores the request", { customTrackerRequests });
    report.passed = true;
  } else if (settingsCookieBannerJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("pages.open", { url: `${origin}/cookie-banner?phase=before`, activate: true });
    await until("banner visible before a cosmetic list", () => cosmeticResults.has("before"), 30_000);
    assert.equal(cosmeticResults.get("before"), false, "The fixture banner must start visible");
    record("disposable cookie banner starts visible", {});
    console.log("Open Privacy & Security → Filter lists with CUA; choose Cookie-banner cosmetic list and add the pinned EasyList Cookie general-hide source after Review list.");
    const cosmeticSource = "https://raw.githubusercontent.com/easylist/easylist/a52a80efe56630e35e596654320cac29327a082e/easylist_cookie/easylist_cookie_general_hide.txt";
    const sourcePath = join(profile, "Default/Aux Runtime Data/filters/sources.json");
    await until("cosmetic source downloaded and installed", () => {
      try {
        const sources = JSON.parse(readFileSync(sourcePath, "utf8"));
        const source = sources.find(entry => entry.url === cosmeticSource && entry.kind === "cookie_banner" && entry.enabled);
        if (!source) return false;
        const meta = JSON.parse(readFileSync(join(profile, "Default/Aux Runtime Data/filters", `${source.id}.meta.json`), "utf8"));
        const snapshot = JSON.parse(readFileSync(join(profile, "Default/Aux Blocking/cosmetic.json"), "utf8"));
        return meta.selectors > 0 && !meta.error && JSON.stringify(snapshot).includes("#ACCETTA_COOKIES");
      } catch { return false; }
    }, 120_000);
    record("pinned cosmetic selector installed in Chromium", {});
    await rpc("pages.open", { url: `${origin}/cookie-banner?phase=enabled`, activate: true });
    await until("banner style after enabling cosmetic list", () => cosmeticResults.has("enabled"), 30_000);
    assert.equal(cosmeticResults.get("enabled"), true, "The downloaded selector must hide the fixture banner");
    record("native document stylesheet hides the disposable banner", {});
    console.log("Pause the EasyList Cookie fixture in Filter lists with CUA.");
    await until("cosmetic list paused", () => {
      try { return JSON.parse(readFileSync(sourcePath, "utf8")).some(entry => entry.url === cosmeticSource && !entry.enabled); }
      catch { return false; }
    }, 120_000);
    await rpc("pages.open", { url: `${origin}/cookie-banner?phase=paused`, activate: true });
    await until("banner style after pausing cosmetic list", () => cosmeticResults.has("paused"), 30_000);
    assert.equal(cosmeticResults.get("paused"), false, "Pausing the cosmetic source must show the banner again");
    record("pausing cosmetic list restores the banner", {});
    report.passed = true;
  } else if (settingsBackgroundJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → General and turn on Keep Aux running after closing all windows with CUA.");
    await until("General background-runtime control", () => {
      try { return native("shell-url") === "chrome://aux/settings/general" && native("has-name", "Keep Aux running after closing all windows") === "true"; }
      catch { return false; }
    }, 120_000);
    record("General exposes Profile background-runtime control", {});
    await until("background runtime enabled in Profile", () => {
      try {
        const preference = JSON.parse(readFileSync(join(profile, "Default/Preferences"), "utf8"));
        return preference.aux?.keep_runtime_in_background === true;
      } catch { return false; }
    }, 120_000);
    record("General enables the runtime keep-alive in the disposable Profile", {});
    console.log("Close the only Aux browser window with CUA; the harness will query the runtime after it closes.");
    await until("last Aux browser window closed", () => {
      try { return !JSON.parse(native("window")); } catch { return true; }
    }, 120_000);
    record("the disposable browser window closes", {});
    await until("runtime responds after the last window closes", async () => {
      if (child.exitCode !== null) return false;
      try { return Array.isArray(await rpc("pages.list")); }
      catch { return false; }
    }, 60_000);
    record("the authenticated Profile runtime remains available with no browser window", {});
    report.passed = true;
  } else if (tabSwitcherBaselineJourney) {
    await rpc("settings.set", { tabLayout: "vertical" });
    const red = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    const blue = await rpc("pages.open", { url: `${origin}/blue`, activate: true });
    const plain = await rpc("pages.open", { url: `${origin}/plain`, activate: true });
    await rpc("pages.activate", { pageId: red.pageId });
    console.log("With CUA, open the vertical sidebar, then press Control-Tab once from the first fixture tab.");
    await until("three native fixture tabs settle", async () =>
      (await rpc("workspace.get")).activePageId === red.pageId &&
      native("has-name", "Aux native Blue") === "true", 30_000);
    await until("Control-Tab selects the next registered tab", async () =>
      (await rpc("workspace.get")).activePageId === blue.pageId, 30_000);
    record("native Control-Tab follows sidebar order across registered tabs", { tabCount: 4, plainPageId: plain.pageId });
    report.passed = true;
  } else if (tabSwitcherOrderJourney) {
    await rpc("settings.set", { tabLayout: "vertical" });
    const red = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    const blue = await rpc("pages.open", { url: `${origin}/blue`, activate: true });
    const plain = await rpc("pages.open", { url: `${origin}/plain`, activate: true });
    await until("three tab switcher fixtures", async () => {
      const pages = await rpc("pages.list");
      return [red.pageId, blue.pageId, plain.pageId].every(id => pages.some(page => page.pageId === id));
    }, 30_000);
    console.log("With CUA, open Appearance and select Recently used for Tab switcher order.");
    await until("recently used preference saved", async () =>
      (await rpc("settings.get")).tabSwitcherOrder === "recently-used", 120_000);
    await rpc("pages.activate", { pageId: red.pageId });
    console.log("Close Settings, reveal the sidebar, and press Control-Tab once from Red.");
    await until("recently used Control-Tab selects Plain", async () =>
      (await rpc("workspace.get")).activePageId === plain.pageId, 120_000);
    record("recently used Control-Tab selects the prior active tab", { redPageId: red.pageId, plainPageId: plain.pageId });
    console.log("In Appearance choose Sidebar order, then return to Red and press Control-Tab once.");
    await until("sidebar order preference restored", async () =>
      (await rpc("settings.get")).tabSwitcherOrder === "sidebar", 120_000);
    await rpc("pages.activate", { pageId: red.pageId });
    await until("sidebar order Control-Tab selects Blue", async () =>
      (await rpc("workspace.get")).activePageId === blue.pageId, 120_000);
    record("sidebar-order Control-Tab selects the next visible tab", { bluePageId: blue.pageId });
    report.passed = true;
  } else if (settingsProfilesSectionJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → Profiles with CUA. Do not create, archive, or delete a Profile.");
    await until("Profiles section and manager entry point", () => {
      try {
        return native("shell-url") === "chrome://aux/settings/profiles" &&
          native("has-name", "Browser profiles") === "true" &&
          native("has-name", "New profile") === "true";
      } catch { return false; }
    }, 120_000);
    record("Profiles uses a dedicated top-shell route with a manager entry point", { url: native("shell-url") });
    report.passed = true;
  } else if (settingsSidebarOptionsJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → Appearance with CUA, choose Vertical layout, set sidebar width to 320 px, and collapse Chats.");
    await until("Appearance options controls", () => {
      try { return native("shell-url") === "chrome://aux/settings/appearance" &&
        native("has-name", "Sidebar width") === "true" &&
        native("has-name", "Sidebar sections") === "true"; }
      catch { return false; }
    }, 120_000);
    record("Appearance exposes sidebar width and section controls", {});
    await until("320 pixel width applied in native sidebar", () =>
      native("control-value", "Sidebar width") === "320", 120_000);
    record("sidebar width updates in the native window", {});
    await until("Chats section collapsed in native sidebar", () =>
      native("control-value", "Expand Chats in sidebar") === "0", 120_000);
    record("Chats section collapses from Appearance settings", {});
    report.passed = true;
  } else if (settingsDefaultZoomJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Aux Settings → Appearance and set Default page zoom to 125% with CUA.");
    await until("Appearance default page zoom control", () => {
      try { return native("shell-url") === "chrome://aux/settings/appearance" && native("has-name", "Default page zoom") === "true"; }
      catch { return false; }
    }, 120_000);
    record("Appearance exposes native Profile default page zoom", {});
    await until("125% default zoom saved in Profile", () => {
      try {
        const preference = JSON.parse(readFileSync(join(profile, "Default/Preferences"), "utf8"));
        const level = preference.partition?.default_zoom_level?.x;
        return typeof level === "number" && Math.abs(Math.pow(1.2, level) - 1.25) < 0.02;
      } catch { return false; }
    }, 120_000);
    record("Appearance saves 125% as the native Profile default", {});
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("new website uses 125% default zoom", async () => {
      try { return Math.abs(Math.pow(1.2, (await rpc("pages.zoom", { pageId: page.pageId })).level) - 1.25) < 0.02; }
      catch { return false; }
    }, 120_000);
    record("a new website opens at the chosen default zoom", {});
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolveExit => child.once("exit", resolveExit));
    child.stderr.destroy();
    child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr.on("data", chunk => appendFileSync(startupLog, chunk));
    await until("restarted Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    }, 30_000);
    const reopened = await until("restarted runtime and page", async () => {
      try {
        const descriptor = JSON.parse(readFileSync(runtimeFile, "utf8"));
        rpcPort = descriptor.port; rpcToken = descriptor.token;
        return await rpc("pages.open", { url: `${origin}/blue`, activate: true });
      } catch { return null; }
    }, 60_000);
    await until("125% default zoom survives restart", async () => {
      try { return Math.abs(Math.pow(1.2, (await rpc("pages.zoom", { pageId: reopened.pageId })).level) - 1.25) < 0.02; }
      catch { return false; }
    }, 30_000);
    record("default page zoom persists across a full Aux restart", {});
    report.passed = true;
  } else if (settingsSectionRailJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Settings, then choose Models, Developers & External Agents, and Privacy & Security in the section rail.");
    for (const section of ["Models", "Developers & External Agents", "Privacy & Security"]) {
      const focused = await until(`${section} rail selection`, () => {
        try {
          const element = JSON.parse(native("focused"));
          return element.role === "AXButton" && element.title === section ? element : null;
        } catch { return null; }
      }, 120_000);
      record(`Settings section rail selects ${section}`, focused);
    }
    report.passed = true;
  } else if (settingsInternalUrlJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const before = (await rpc("pages.list")).map(page => page.pageId);
    console.log("In Aux's command bar, enter chrome://aux/settings/appearance and press Return.");
    await until("internal Settings route in the shell", () =>
      native("has-button", "Close settings") === "true" &&
      native("has-button", "General") === "true", 120_000);
    const after = (await rpc("pages.list")).map(page => page.pageId);
    assert.deepEqual(after, before, "The internal Settings route must not open a guest tab");
    record("internal Settings URL opens in the top shell without creating a guest tab", { pages: after.length });
    report.passed = true;
  } else if (settingsRouteJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Settings, then choose Appearance in the Settings navigation.");
    const appearance = await until("Appearance section", () => {
      try {
        const element = JSON.parse(native("focused"));
        return element.role === "AXButton" && element.title === "Appearance" ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Settings navigation opens the Appearance section", appearance);
    console.log("Choose General in the Settings navigation.");
    const general = await until("General section", () => {
      try {
        const element = JSON.parse(native("focused"));
        return element.role === "AXButton" && element.title === "General" ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Settings navigation returns to the General section", general);
    report.passed = true;
  } else if (settingsSearchJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Settings, search for plugins, and choose the Plugins result.");
    const pluginFocus = await until("Plugins search destination", () => {
      try {
        const element = JSON.parse(native("focused"));
        return /Plugins/.test(`${element.title} ${element.description}`) ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Settings search opens and focuses the implemented Plugins panel", pluginFocus);
    console.log("Search Settings for calendar and choose the Google Calendar result.");
    const calendarFocus = await until("Google Calendar search destination", () => {
      try {
        const element = JSON.parse(native("focused"));
        return /Google Calendar connection/.test(`${element.title} ${element.description}`) ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Settings search opens and focuses the implemented Google Calendar panel", calendarFocus);
    console.log("Search Settings for desktop and choose Sidebar appearance from the generated field index.");
    const appearanceFocus = await until("generated Appearance field destination", () => {
      try {
        const element = JSON.parse(native("focused"));
        return /Sidebar appearance/.test(`${element.title} ${element.description}`) ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Settings search indexes and focuses a rendered Appearance field", appearanceFocus);
    report.passed = true;
  } else if (settingsFocusJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Settings in the disposable Aux window.");
    const category = await until("Settings initial category focus", () => {
      try {
        const element = JSON.parse(native("focused"));
        return element.role === "AXButton" && element.title === "General" ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Settings opens with the General category focused", category);
    console.log("Search Settings for theme and press ArrowDown.");
    const result = await until("first Settings search result focus", () => {
      try {
        const element = JSON.parse(native("focused"));
        return element.role === "AXButton" && /theme/i.test(`${element.title} ${element.description}`) ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Settings search focuses its first result", result);
    console.log("Clear the Settings search.");
    const search = await until("Settings search field focus after clearing", () => {
      try {
        const element = JSON.parse(native("focused"));
        return element.role === "AXTextField" && /Search settings/i.test(`${element.title} ${element.description}`) ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Clearing Settings search returns focus to its field", search);
    console.log("Open Manage keyword engines in Settings General.");
    const editor = await until("Settings keyword editor focus", () => {
      try {
        const element = JSON.parse(native("focused"));
        return /Keyword engines/.test(`${element.title} ${element.description}`) ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Settings opens its keyword editor with owned focus", editor);
    report.passed = true;
  } else if (quickAskFocusJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    console.log("Open Quick Ask from Aux Settings → Quick Ask in this disposable Profile.");
    const focused = await until("Quick Ask composer focus", () => {
      try {
        const element = JSON.parse(native("focused"));
        return element.role === "AXTextArea" && /Reply to conversation/.test(`${element.title} ${element.description}`) ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Quick Ask opens with its composer focused through the shared ref", focused);
    report.passed = true;
  } else if (selectorContextJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const red = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    const blue = await rpc("pages.open", { url: `${origin}/blue`, activate: false });
    await until("browser context fixtures to load", async () => {
      const pages = await rpc("pages.list");
      return [red.pageId, blue.pageId].every(pageId => pages.some(page => page.pageId === pageId && !page.loading));
    });
    console.log("Open a new chat, expand Add context, then open Browser context in the disposable Aux window.");
    await until("browser context chooser with both local tabs", () =>
      native("has-name", "Find browser context") === "true" &&
      native("has-name", "Aux native Red") === "true" &&
      native("has-name", "Aux native Blue") === "true", 120_000);
    record("browser context chooser shows both disposable open tabs", { red: red.pageId, blue: blue.pageId });
    report.passed = true;
  } else if (spaceThemeAdvancedJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("settings.set", { tabLayout: "vertical" });
    console.log("Create a Space named Spectrum Fixture. Set Color dial 195, Lightness 62, Intensity 80, turn on Invert lightness, cycle Grain to 25%, and leave the editor open.");
    await until("advanced Space theme controls", () =>
      native("control-value", "Color dial") === "195" &&
      native("control-value", "Lightness") === "62" &&
      native("control-value", "Intensity") === "80" &&
      native("control-value", "Invert lightness") === "1" &&
      native("control-value", "Grain") === "25", 300_000);
    record("advanced color recipe and grain are accessible in the Space editor", { hue: 195, lightness: 62, intensity: 80, inverted: true, grain: 25 });
    console.log("Create Spectrum Fixture. The harness will check that native Profile organization accepts the recipe.");
    await until("new Space editor saved", () => native("has-text", "New space") === "false" && native("has-name", "Spectrum Fixture") === "true", 300_000);
    assert.equal(native("has-text", "Profile organization could not be saved"), "false", "Native Profile organization must accept the custom theme");
    record("native Profile organization accepted the custom Space recipe");
    console.log("Reopen Edit space for Spectrum Fixture.");
    await until("saved advanced Space theme", () =>
      native("has-text", "Edit space") === "true" &&
      native("control-value", "Color dial") === "195" &&
      native("control-value", "Lightness") === "62" &&
      native("control-value", "Intensity") === "80" &&
      native("control-value", "Invert lightness") === "1" &&
      native("control-value", "Grain") === "25", 300_000);
    record("custom Space theme persists after reopening the editor");
    console.log("Use Reset theme and save the Space. The harness will wait for the editor to close.");
    await until("reset editor save", () => native("has-text", "Edit space") === "false", 300_000);
    console.log("Reopen Edit space for Spectrum Fixture once more.");
    await until("reset Space theme persisted", () =>
      native("has-text", "Edit space") === "true" &&
      native("control-value", "violet") === "1" &&
      native("control-value", "Invert lightness") === "0" &&
      native("control-value", "Grain") === "0", 300_000);
    record("Reset theme restores the preset and zero grain after reopening");
    report.passed = true;
  } else if (spaceThemeJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("settings.set", { tabLayout: "vertical" });
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    const themed = await until("native theme-color projection", async () =>
      (await rpc("pages.list")).find(item => item.pageId === page.pageId && item.themeColor === "#a33450"), 120_000);
    record("Chromium theme-color reaches the runtime page contract", { pageId: themed.pageId, themeColor: themed.themeColor });
    console.log("Open the sidebar Space menu and choose New space; name it Theme Fixture, select teal, and set Grain to 70%. Leave the editor open.");
    await until("Space theme editor controls", () =>
      native("control-value", "Grain") === "70" &&
      native("control-value", "teal") === "1", 300_000);
    record("the Space editor exposes color and grain controls", { color: "teal", grain: 70 });
    console.log("Create the Space, then reopen Edit space for Theme Fixture.");
    await until("saved Space grain reopened", () =>
      native("has-text", "Edit space") === "true" &&
      native("control-value", "Grain") === "70" &&
      native("control-value", "teal") === "1", 300_000);
    record("the saved Space theme reopens with its color and grain", { color: "teal", grain: 70 });
    report.passed = true;
  } else if (linkPeekJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const source = await rpc("pages.open", { url: `${origin}/blue`, activate: true });
    await until("source page loaded", async () =>
      (await rpc("pages.list")).some(page => page.pageId === source.pageId && !page.loading));
    await rpc("bookmarks.add", { url: `${origin}/red`, title: "Aux Peek Red" });
    console.log("Open Library, choose Preview Aux Peek Red, and leave the preview open.");
    const preview = await until("the native link preview", async () => {
      if (native("has-text", "Preview link") !== "true" || native("has-button", "Open as tab") !== "true" || native("has-text", "Aux native Red fixture") !== "true") return null;
      const pages = await rpc("pages.list");
      return pages.find(page => page.url === `${origin}/red` && page.pageId.startsWith("p_peek_")) ?? null;
    }, 120_000);
    assert.equal((await rpc("pages.list")).find(page => page.pageId === source.pageId)?.pageId, source.pageId);
    record("Peek displays the native destination while retaining the source tab", { source: source.pageId, preview: preview.pageId });
    console.log("Choose Open as tab in the preview.");
    await until("the preview promoted to a tab", async () =>
      native("has-text", "Preview link") === "false" &&
      (await rpc("workspace.get")).activePageId === preview.pageId, 120_000);
    record("the same native page was promoted and activated", { pageId: preview.pageId });
    console.log("Open Library, preview Aux Peek Red again, then choose Close preview.");
    const dismissed = await until("a second native link preview", async () => {
      if (native("has-button", "Close preview") !== "true") return null;
      return (await rpc("pages.list")).find(page => page.pageId !== preview.pageId && page.pageId.startsWith("p_peek_")) ?? null;
    }, 120_000);
    await until("dismissed preview is closed without changing the active tab", async () =>
      native("has-text", "Preview link") === "false" &&
      !(await rpc("pages.list")).some(page => page.pageId === dismissed.pageId) &&
      (await rpc("workspace.get")).activePageId === preview.pageId, 120_000);
    record("dismissing Peek closes only its disposable native page", { pageId: dismissed.pageId });
    report.passed = true;
  } else if (splitViewJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const red = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    const blue = await rpc("pages.open", { url: `${origin}/blue`, activate: false });
    await until("split fixture tabs to load", async () => {
      const pages = await rpc("pages.list");
      return [red.pageId, blue.pageId].every(pageId => pages.some(page => page.pageId === pageId && !page.loading));
    });
    console.log("Open the Blue tab menu and choose Open beside current tab. Leave the split view open.");
    await until("both native pages and the sidebar split item", () =>
      native("has-text", "Aux native Red fixture") === "true" &&
      native("has-text", "Aux native Blue fixture") === "true" &&
      native("has-button", "Swap split sides") === "true" &&
      native("has-button", "Close split view") === "true", 120_000);
    record("split sidebar item and both native surfaces are visible", { red: red.pageId, blue: blue.pageId });
    report.passed = true;
  } else if (selectorSearchJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const red = await rpc("pages.open", { url: `${origin}/red`, activate: false });
    const blue = await rpc("pages.open", { url: `${origin}/blue`, activate: true });
    await until("search fixture tabs to load", async () => {
      const pages = await rpc("pages.list");
      return [red.pageId, blue.pageId].every(pageId => pages.some(page => page.pageId === pageId && !page.loading));
    });
    console.log("Open Search browser, type Aux native Red, and leave its suggestion list open.");
    await until("search suggestion for the background Red tab", () =>
      native("has-text", "Open tabs") === "true" && native("has-text", "Switch") === "true" &&
      native("has-text", "Aux native Red") === "true", 120_000);
    record("search keeps the background local tab available from the built shell", { red: red.pageId, blue: blue.pageId });
    report.passed = true;
  } else if (selectorClosedJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("closed-tab fixture to load", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading));
    await rpc("pages.close", { pageId: page.pageId });
    console.log("Open Library from Command-K and choose Recently Closed in this disposable Profile.");
    await until("recently closed fixture row", () => native("has-name", "Reopen Aux native Red") === "true", 120_000);
    record("Recently Closed shows the disposable Red tab with a Reopen action", { pageId: page.pageId });
    report.passed = true;
  } else if (selectorReadingJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("bookmarks.add", { url: `${origin}/red`, title: "Aux reading Red", readingList: true });
    await rpc("bookmarks.add", { url: `${origin}/blue`, title: "Aux reading Blue", readingList: true });
    console.log("Open Library from Command-K, choose Reading List, and mark Aux reading Red as read.");
    await until("reading-list row change", async () =>
      (await rpc("bookmarks.list")).some(item => item.url === `${origin}/red` && !!item.readAt) &&
      native("has-name", "Mark Aux reading Red unread") === "true" &&
      native("has-name", "Mark Aux reading Blue read") === "true", 120_000);
    record("reading-list row moves to Read while its sibling remains unread");
    report.passed = true;
  } else if (selectorTaskResourcesJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("task resource fixture page to load", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading));
    const workspace = await rpc("workspaces.create", { name: "Task resource fixture Space" });
    const task = await rpc("tasks.create", { workspaceId: workspace.workspaceId,
      title: "Task resources selector fixture", objective: "Review the local page reference",
      criteria: [{ criterionId: "review", description: "Review the page", verification: "manual" }],
      resources: [{ resourceId: "source", kind: "page", locator: page.pageId, label: "Fixture source" }] });
    console.log("Switch to Task resource fixture Space, open Tasks, and select Task resources selector fixture.");
    await until("task page resource", () => native("has-name", "Task resources selector fixture") === "true"
      && native("has-text", `${origin}/red`) === "true", 120_000);
    record("task page resource shows the disposable Red tab", { taskId: task.taskId, pageId: page.pageId });
    await rpc("pages.navigate", { pageId: page.pageId, url: `${origin}/blue` });
    await until("task resource follows the same tab to Blue", () => native("has-text", `${origin}/blue`) === "true", 120_000);
    record("task page resource updates after navigation without replacing its reference");
    report.passed = true;
  } else if (selectorResultsJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("results fixture page to load", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading));
    const set = await rpc("sets.create", { name: "Aux results selector fixture", source: "tabs", pageIds: [page.pageId] });
    console.log("Use Search browser to open the Aux results selector fixture set, then open its results table.");
    await until("set results table", () => native("has-name", "Aux results selector fixture") === "true"
      && native("has-name", "No extracted records") === "true", 120_000);
    record("native set results table opens with the disposable set label and honest empty state", { setId: set.setId });
    report.passed = true;
  } else if (selectorSitePermissionsJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("site permissions fixture to load", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading));
    console.log("Open Aux Settings → Site permissions in the disposable Profile.");
    await until("current site's Website data choice", () =>
      native("has-name", origin) === "true" && native("has-name", "Website to clear") === "true", 120_000);
    record("Site permissions shows the open disposable origin in Website data", { pageId: page.pageId, origin });
    report.passed = true;
  } else if (selectorBookmarkJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("bookmark fixture to load", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading));
    await until("unbookmarked toolbar action", () => native("has-name", "Bookmark this page") === "true", 60_000);
    console.log("Click Bookmark this page, then Remove bookmark in the disposable Aux toolbar.");
    await until("bookmarked toolbar action", () => native("has-name", "Remove bookmark") === "true", 120_000);
    await until("bookmark removed from toolbar", () => native("has-name", "Bookmark this page") === "true", 120_000);
    assert.equal((await rpc("bookmarks.list")).some(item => item.url === `${origin}/red`), false);
    record("toolbar bookmark selector tracks add and remove on a disposable page", { pageId: page.pageId });
    report.passed = true;
  } else if (fileIoJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("bookmark fixture to load", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading));
    await rpc("bookmarks.add", { url: `${origin}/red`, title: "Aux native file export fixture" });
    const exported = join(output, "aux-bookmarks.html");
    console.log(`Open Library and click Export HTML. Save to ${exported}`);
    await until("native bookmark export", () => existsSync(exported), 120_000);
    const html = readFileSync(exported, "utf8");
    assert.match(html, /Aux native file export fixture/);
    assert.match(html, new RegExp(`${origin.replaceAll(".", "\\.")}/red`));
    record("native save dialog writes the chosen bookmark export", { file: exported, bytes: statSync(exported).size });
    report.passed = true;
  } else if (eyeDropperJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/eyedropper`, activate: true });
    await until("eyedropper fixture to load", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading));
    console.log("Click Pick a color, then sample the red fixture area with the macOS eyedropper.");
    await until("eyedropper invocation", async () =>
      /Picker invoked|Sampled color|Color canceled/.test(JSON.stringify(await rpc("pages.observe", {pageId: page.pageId}))), 120_000);
    await until("a selected color returned to the native page", async () =>
      /Sampled color #[a-f\d]{6}/i.test(JSON.stringify(await rpc("pages.observe", {pageId: page.pageId}))), 120_000);
    record("native eyedropper returned a selected color to the disposable page", {pageId: page.pageId});
    report.passed = true;
  } else if (translationJourney) {
    await rpc("settings.set", { modelProvider: "openai-compatible",
      compatibleEndpoint: `http://127.0.0.1:${modelFixture.address().port}/v1`, plannerModel: "fixture-model" });
    const page = await rpc("pages.open", { url: `${origin}/translation`, activate: true });
    await until("translation fixture to load", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading));
    console.log("Open the Palette and choose Translate this page in the disposable Aux window.");
    await until("translated visible text", async () =>
      /EN: Hola mundo de Aux/.test(JSON.stringify(await rpc("pages.observe", { pageId: page.pageId }))), 120_000);
    assert.equal(translationInputs.length, 1, "A short page must use one model batch");
    const sent = translationInputs.flat();
    assert.ok(sent.includes("Hola mundo de Aux"));
    assert.ok(sent.includes("Esta página se puede traducir."));
    assert.ok(!sent.some(text => /HIDDEN TRANSLATION SECRET|FORM VALUE SECRET|CODE TRANSLATION SECRET/.test(text)),
      "Hidden, form and code text must stay out of the model request");
    record("native translation applied aligned model text and excluded hidden, form and code content", { pageId: page.pageId, segments: sent.length });
    console.log("Choose Show original in the translation bar.");
    await until("restored original page text", async () => {
      const observed = JSON.stringify(await rpc("pages.observe", { pageId: page.pageId }));
      return /Hola mundo de Aux/.test(observed) && !/EN: Hola mundo de Aux/.test(observed);
    }, 120_000);
    assert.equal(translationInputs.length, 1, "Restoration must not call the model");
    record("Show original restored the original page text without another model call", { pageId: page.pageId });
    report.passed = true;
  } else if (tabNameJourney) {
    await rpc("settings.set", { modelProvider: "openai-compatible",
      compatibleEndpoint: `http://127.0.0.1:${modelFixture.address().port}/v1`,
      plannerModel: "meta/muse-spark-1.3-contributor" });
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("nameable native Red tab", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading), 60_000);
    console.log("Open Red's tab menu, choose Name tab…, then Suggest with AI. Review the suggestion without saving it yet.");
    await until("reviewable tab-name suggestion", () =>
      tabNameInputs.length === 1 && native("control-value", "Tab label") === "Red research" &&
      native("has-name", "Save tab label") === "true", 180_000);
    record("local model saw only Red's title and site origin; suggestion did not rename the tab", { modelCalls: tabNameInputs.length });
    console.log("Choose Save tab label.");
    await until("saved native tab label", () => native("has-button", "Close Red research") === "true", 120_000);
    assert.equal((await rpc("pages.list")).find(item => item.pageId === page.pageId)?.title, "Aux native Red");
    record("reviewed AI suggestion changed only Aux's tab label, not the page title", { pageId: page.pageId });
    console.log("Open the tab menu again, choose Name tab…, then Use page title again.");
    await until("original native tab title restored", () =>
      native("has-button", "Close Aux native Red") === "true" &&
      native("has-button", "Close Red research") === "false", 120_000);
    assert.equal(tabNameInputs.length, 1, "Restoring the page title must not call the model again");
    record("owner restored the original native tab label without another model call");
    report.passed = true;
  } else if (tabPreviewFocusJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("settings.set", { tabLayout: "vertical" });
    const red = await rpc("pages.open", { url: `${origin}/red`, activate: false });
    const blue = await rpc("pages.open", { url: `${origin}/blue`, activate: true });
    await until("preview fixture tabs loaded", async () => {
      const pages = await rpc("pages.list");
      return [red.pageId, blue.pageId].every(pageId => pages.some(page => page.pageId === pageId && !page.loading));
    });
    console.log("Show the sidebar and keyboard-focus the Aux native Red tab. Leave focus there for its delayed preview.");
    await until("sidebar tab preview", () => native("has-text", "127.0.0.1") === "true", 180_000);
    record("keyboard-focused sidebar tab shows its delayed live preview", { red: red.pageId, blue: blue.pageId });
    console.log("Press Escape to dismiss the tab preview.");
    await until("tab preview dismissal", () => native("has-text", "127.0.0.1") === "false", 120_000);
    record("Escape dismisses the tab preview");
    const window = JSON.parse(native("window"));
    console.log("Move the pointer over the Red tab without selecting it; leave it there for the delayed thumbnail.");
    await until("pointer-hover sidebar tab preview", () => native("has-text", "127.0.0.1") === "true", 120_000);
    await delay(1_500);
    const screenshot = capture(window.id, "sidebar-pointer-thumbnail");
    const { PNG } = requireDependency("pngjs");
    const image = PNG.sync.read(readFileSync(screenshot));
    let redPixels = 0;
    for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
      const i = (y * image.width + x) * 4;
      if (Math.abs(image.data[i] - 124) < 24 &&
          Math.abs(image.data[i + 1] - 52) < 24 &&
          Math.abs(image.data[i + 2] - 75) < 24) redPixels++;
    }
    assert.ok(redPixels > 3_000, `Sidebar hover card should show the native Red thumbnail, found ${redPixels} matching pixels`);
    record("pointer-hover sidebar card paints the native background-tab thumbnail", { redPixels, red: red.pageId });
    console.log("Move the pointer away from the sidebar card without selecting a tab.");
    await until("pointer-leave tab preview dismissal", () => native("has-text", "127.0.0.1") === "false", 120_000);
    record("pointer leave dismisses the sidebar tab preview");
    report.passed = true;
  } else if (readerPeekJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("settings.set", { tabLayout: "vertical" });
    const source = await rpc("pages.open", { url: `${origin}/reader`, activate: true });
    await until("Reader fixture loaded", async () =>
      (await rpc("pages.list")).some(page => page.pageId === source.pageId && !page.loading));
    console.log("Open Reader view with Command-Option-R, focus Safe relative article link, then press Option-Return.");
    const preview = await until("Reader link native Peek", async () => {
      if (native("has-button", "Open as tab") !== "true") return null;
      return (await rpc("pages.list")).find(page => page.pageId.startsWith("p_peek_") && page.url === `${origin}/red`) ?? null;
    }, 300_000);
    assert.equal((await rpc("pages.list")).find(page => page.pageId === source.pageId)?.pageId, source.pageId);
    record("Reader keyboard link opens a temporary native Peek while keeping its source page", { source: source.pageId, preview: preview.pageId });
    console.log("Choose Close preview.");
    await until("Reader Peek dismissal", async () =>
      native("has-button", "Open as tab") === "false" &&
      !(await rpc("pages.list")).some(page => page.pageId === preview.pageId), 300_000);
    record("Reader Peek dismissal closes the temporary native page");
    console.log("With Reader still open, hold Option and click Safe relative article link with the pointer.");
    const pointerPreview = await until("Reader pointer link native Peek", async () => {
      if (native("has-button", "Open as tab") !== "true") return null;
      return (await rpc("pages.list")).find(page => page.pageId.startsWith("p_peek_") &&
        page.pageId !== preview.pageId && page.url === `${origin}/red`) ?? null;
    }, 300_000);
    assert.equal((await rpc("workspace.get")).activePageId, source.pageId,
      "Pointer Peek must leave the Reader source tab selected");
    record("Reader pointer Option-click opens a second temporary native Peek", { source: source.pageId, preview: pointerPreview.pageId });
    console.log("Choose Open as tab from the pointer-opened preview.");
    await until("Reader pointer Peek promoted", async () => {
      if (native("has-button", "Open as tab") === "true") return false;
      const workspace = await rpc("workspace.get");
      return workspace.activePageId === pointerPreview.pageId &&
        workspace.pages.some(page => page.pageId === pointerPreview.pageId && page.url === `${origin}/red`);
    }, 300_000);
    record("pointer-opened Reader Peek promotes its original native page ID to a tab", { pageId: pointerPreview.pageId });
    report.passed = true;
  } else if (readerJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/reader`, activate: true });
    await until("reader fixture to load", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading));
    console.log("Open Reader view with Command-Option-R in the disposable Aux window.");
    await until("distilled article in Reader view", () =>
      native("has-text", "Distinctive distilled article sentence.") === "true" &&
      native("has-text", "Details worth keeping") === "true", 120_000);
    assert.equal(native("has-text", "Reader view isn’t available"), "false");
    assert.match(JSON.stringify(await rpc("pages.observe", {pageId: page.pageId})), /Distinctive distilled article sentence/);
    record("Reader renders a distilled local article while preserving its original page", {pageId: page.pageId});
    console.log("Open Reader's Contents menu in the disposable Aux window.");
    const focusedSection = await until("first Reader section focus", () => {
      try {
        const element = JSON.parse(native("focused"));
        return element.role === "AXButton" && element.title === "Reading overview" ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Reader Contents opens with the first section focused", focusedSection);
    console.log("Close Contents with Escape, open Find with Command-F, then close Find with Escape.");
    const focusedArticle = await until("Reader article focus after Find closes", () => {
      try {
        const element = JSON.parse(native("focused"));
        return /Reader article/.test(`${element.title} ${element.description}`) ? element : null;
      } catch { return null; }
    }, 120_000);
    record("Closing Reader Find returns focus to its article", focusedArticle);
    report.passed = true;
  } else if (contextMenuJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("red context fixture to load", async () =>
      contextRequests === 1 && (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading));
    console.log("Focus a noneditable Aux shell control, press Shift-F10, and choose Reload in the native context menu.");
    await until("context-menu reload", () => contextRequests >= 2, 120_000);
    await until("reloaded context fixture", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && item.url === `${origin}/red` && !item.loading));
    record("native shell context menu reloads the current disposable tab", { pageId: page.pageId, requests: contextRequests });
    report.passed = true;
  } else if (pageActionJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("page-action fixture to load", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && item.url === `${origin}/red` && !item.loading));
    console.log("Focus a noneditable Aux shell control, press Shift-F10, and choose Summarize page in the native context menu.");
    await until("page-scoped summary draft", () =>
      native("has-name", "Summarize this page and its key points.") === "true" &&
      native("has-name", `${origin}/red`) === "true", 120_000);
    record("native page action opens a summary draft for the current disposable tab", { pageId: page.pageId });
    const focusedComposer = await until("page-action composer focus", () => {
      try {
        const element = JSON.parse(native("focused"));
        return element.role === "AXTextArea" && /Reply to conversation/.test(`${element.title} ${element.description}`) ? element : null;
      } catch { return null; }
    }, 120_000);
    record("page action focuses the conversation composer", focusedComposer);
    report.passed = true;
  } else if (navigationMenuJourney) {
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("red history fixture to load", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading));
    await rpc("pages.navigate", { pageId: page.pageId, url: `${origin}/blue` });
    await until("blue history fixture to load", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && item.url === `${origin}/blue` && !item.loading));
    console.log("Focus Back in the disposable Aux window, press ArrowDown, and choose Aux native Red from the native history menu.");
    await until("native history menu selection", async () =>
      (await rpc("pages.list")).some(item => item.pageId === page.pageId && item.url === `${origin}/red` && !item.loading), 120_000);
    assert.match(JSON.stringify(await rpc("pages.observe", { pageId: page.pageId })), /Aux native Red fixture/);
    record("native back-history menu navigates the current tab to its prior page", { pageId: page.pageId });
    report.passed = true;
  } else if (previewJourney) {
    if (rpcOnly) throw new Error("Preview needs the native window.");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const red = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("red preview fixture to load", async () =>
      (await rpc("pages.list")).some(page => page.pageId === red.pageId && !page.loading));
    await delay(3_000);
    const blue = await rpc("pages.open", { url: `${origin}/blue`, activate: true });
    await until("blue preview fixture to load", async () =>
      (await rpc("pages.list")).some(page => page.pageId === blue.pageId && !page.loading));
    await delay(1500);
    console.log("Open Tab overview with Command-Shift-O in the disposable Aux window.");
    await delay(30_000);
    const window = JSON.parse(native("window"));
    const screenshot = capture(window.id, "overview-background-thumbnail");
    const { PNG } = requireDependency("pngjs");
    const image = PNG.sync.read(readFileSync(screenshot));
    let redPixels = 0;
    for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
      const i = (y * image.width + x) * 4;
      if (Math.abs(image.data[i] - 124) < 24 &&
          Math.abs(image.data[i + 1] - 52) < 24 &&
          Math.abs(image.data[i + 2] - 75) < 24) redPixels++;
    }
    assert.ok(redPixels > 3000, `Overview should show a substantial native red thumbnail, found ${redPixels} matching pixels`);
    record("Overview renders the Chromium thumbnail for a background Aux tab", { redPageId: red.pageId, bluePageId: blue.pageId, redPixels });
    report.passed = true;
  } else if (siteControlsJourney) {
    if (rpcOnly) throw new Error("Site controls need the native accessibility tree.");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/site-controls`, activate: true });
    await until("site controls fixture to load", async () => {
      const pages = await rpc("pages.list");
      return pages.some(item => item.pageId === page.pageId && !item.loading);
    });
    assert.ok(siteRequests >= 1, "The fixture must set its cookie before clearing");
    await until("stored fixture to be present", async () =>
      /Stored fixture present/.test(JSON.stringify(await rpc("pages.observe", { pageId: page.pageId }))));
    console.log("Open Site controls for the disposable fixture tab.");
    await until("site controls dialog", () =>
      native("has-text", "Cookies and site data") === "true" &&
      native("has-button", "Clear…") === "true", 120_000);
    await until("fixture cookie count", () => native("has-text", "1 cookie") === "true", 20_000);
    await until("blocked notification decision", () =>
      native("has-button", "Reset Notifications") === "true" &&
      native("has-text", "Blocked") === "true", 20_000);
    record("site controls shows a cookie for the disposable origin", { siteRequests });
    console.log("Click Clear… in Site controls for the disposable fixture.");
    await until("site data clear notice", () =>
      native("has-text", "Cookies and stored website data cleared") === "true", 120_000);
    await until("cleared cookie count", () => native("has-text", "0 cookies") === "true", 20_000);
    record("site controls clears fixture cookies and stored data", { siteRequests });
    assert.equal(native("has-button", "Reset Notifications"), "true",
      "Clearing website data must preserve saved permission decisions");
    console.log("Click Reset for the seeded blocked Notifications decision.");
    await until("notification reset notice", () =>
      native("has-text", "Notifications will ask again.") === "true", 120_000);
    await until("notification decision removed", () =>
      native("has-button", "Reset Notifications") === "false", 20_000);
    record("site controls resets the exact saved permission without a prompt", { origin });
    console.log("Close Site controls, then the harness will reload the disposable fixture to inspect stored data.");
    await until("site controls to close", () =>
      native("has-text", "Cookies and site data") === "false", 120_000);
    await rpc("pages.reload", { pageId: page.pageId });
    await until("fixture reload", async () => {
      const pages = await rpc("pages.list");
      return siteRequests >= 2 && pages.some(item => item.pageId === page.pageId && !item.loading);
    });
    const pageText = JSON.stringify(await rpc("pages.observe", { pageId: page.pageId }));
    assert.match(pageText, /Stored fixture cleared/, "Clearing website data must remove localStorage after reload");
    assert.doesNotMatch(pageText, /Stored fixture present/);
    record("site controls clears localStorage as well as cookies", { siteRequests });
    report.passed = true;
  } else if (tabAudioJourney) {
    if (rpcOnly) throw new Error("Tab audio needs the native accessibility tree.");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const page = await rpc("pages.open", { url: `${origin}/red`, activate: true });
    await until("tab audio fixture to load", async () => {
      const pages = await rpc("pages.list");
      return pages.some(item => item.pageId === page.pageId && !item.loading);
    });
    console.log("Open Tab overview and select the disposable Aux native Red fixture tab.");
    await until("selected tab audio action", () =>
      native("has-button", "Mute tabs") === "true", 120_000);
    assert.equal(native("press-button", "Mute tabs"), "true");
    await until("muted tab audio action", () =>
      native("has-button", "Unmute tabs") === "true" &&
      native("has-text", "1 tab muted") === "true", 20_000);
    record("Overview mutes the selected native tab", { pageId: page.pageId });
    assert.equal(native("press-button", "Unmute tabs"), "true");
    await until("unmuted tab audio action", () =>
      native("has-button", "Mute tabs") === "true" &&
      native("has-text", "1 tab unmuted") === "true", 20_000);
    record("Overview unmutes the selected native tab", { pageId: page.pageId });
    report.passed = true;
  } else if (unsavedWorkJourney) {
    if (rpcOnly) throw new Error("Unsaved-work cleanup needs the native accessibility tree.");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    const url = `${origin}/unsaved-work`;
    const keeper = await rpc("pages.open", { url, activate: true });
    await until("keeper fixture to load", async () =>
      (await rpc("pages.list")).some(page => page.pageId === keeper.pageId && !page.loading));
    const dirty = await rpc("pages.open", { url, background: true });
    await until("edited fixture to load", async () =>
      (await rpc("pages.list")).some(page => page.pageId === dirty.pageId && !page.loading));
    const clean = await rpc("pages.open", { url, background: true });
    await until("clean duplicate fixture to load", async () =>
      (await rpc("pages.list")).some(page => page.pageId === clean.pageId && !page.loading));
    assert.equal(unsavedRequests, 3, "The three identical-URL fixtures must load in order");
    assert.match(JSON.stringify(await rpc("pages.observe", { pageId: dirty.pageId, scope: "forms" })), /edited draft/);
    assert.equal((await rpc("workspace.get")).activePageId, keeper.pageId);
    console.log("Open Tab overview for the disposable duplicate fixtures.");
    await until("duplicate selection action", () => native("has-button", "Select duplicates · 2") === "true", 120_000);
    assert.equal(native("press-button", "Select duplicates · 2"), "true");
    await until("one safe duplicate selected", () =>
      native("has-text", "Review 1 duplicate tab before closing") === "true" &&
      native("has-text", "1 kept because of unsaved work") === "true" &&
      native("has-text", "1 selected") === "true", 20_000);
    assert.equal((await rpc("pages.list")).filter(page => [keeper.pageId, dirty.pageId, clean.pageId].includes(page.pageId)).length, 3,
      "Selecting duplicates must not close any tab");
    record("Overview protects the edited duplicate and selects only the clean copy", { keeper: keeper.pageId, dirty: dirty.pageId, clean: clean.pageId });
    assert.equal(native("press-button", "Close tabs"), "true");
    await until("only the clean duplicate to close", async () => {
      const pages = await rpc("pages.list");
      return pages.some(page => page.pageId === keeper.pageId) &&
        pages.some(page => page.pageId === dirty.pageId) &&
        !pages.some(page => page.pageId === clean.pageId);
    }, 20_000);
    assert.match(JSON.stringify(await rpc("pages.observe", { pageId: dirty.pageId, scope: "forms" })), /edited draft/,
      "The edited duplicate must retain its unsaved form value after cleanup");
    assert.equal((await rpc("workspace.get")).activePageId, keeper.pageId,
      "Duplicate cleanup must not steal focus from the keeper tab");
    record("Overview closes only the clean duplicate after a second unsaved-work check", { keeper: keeper.pageId, dirty: dirty.pageId, closed: clean.pageId });
    report.passed = true;
  } else if (fileHandoffJourney) {
    if (rpcOnly) throw new Error("File handoff needs the native accessibility tree.");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("pages.open", { url: `${origin}/file-handoff-page`, activate: true });
    const target = join(disposable, "handoff-downloads", "aux-file-handoff.txt");
    await until("disposable document download", () => existsSync(target) && statSync(target).size > 10, 30_000);
    assert.equal(readFileSync(target, "utf8"), "Aux disposable file handoff fixture\n");
    console.log("Open Downloads with Command-Shift-J, then the harness will reveal and open the disposable text document.");
    await until("completed file handoff download", () =>
      native("has-text", "aux-file-handoff.txt") === "true" &&
      native("has-button", "Reveal") === "true" &&
      native("has-button", "Open") === "true", 120_000);
    assert.equal(native("press-button", "Reveal"), "true");
    await delay(200);
    await until("reveal handoff reply", () => native("button-enabled", "Reveal") === "true", 20_000);
    assert.equal(native("has-text", "Could not reveal aux-file-handoff.txt"), "false");
    record("native file handoff reveals a completed disposable download", { path: "disposable/handoff-downloads/aux-file-handoff.txt" });
    assert.equal(native("press-button", "Open"), "true");
    await delay(200);
    await until("open handoff reply", () => native("button-enabled", "Open") === "true", 20_000);
    assert.equal(native("has-text", "Could not open aux-file-handoff.txt"), "false");
    record("native file handoff opens a completed disposable text document", { path: "disposable/handoff-downloads/aux-file-handoff.txt" });
    report.passed = true;
  } else if (downloadsJourney || selectorDownloadsJourney) {
    if (rpcOnly) throw new Error("Downloads need the native accessibility tree.");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    await rpc("pages.open", { url: `${origin}/download-page`, activate: true });
    await until("fixture download request", () => downloadRequests === 1);
    const window = JSON.parse(native("window"));
    console.log("Open Downloads with Command-Shift-J in the disposable Aux window.");
    try {
      await until("Downloads panel", () => native("has-name", "Search downloads") === "true", 120_000);
    } catch (error) {
      capture(window.id, "downloads-panel-stuck");
      throw new Error(`${error.message}; names: ${native("names")}`);
    }
    capture(window.id, "downloads-panel-open");
    assert.equal(native("has-name", "Couldn’t refresh downloads"), "false");
    assert.equal(native("has-name", "layouts is preview"), "false", "Base appearance must not call a gated layout method");
    await until("download row and native controls", () =>
      native("has-text", "aux-download-fixture") === "true" && native("has-button", "Cancel") === "true");
    console.log("Cancel the fixture download in the Downloads panel.");
    await until("cancelled download", () => native("has-button", "Retry") === "true", 120_000);
    console.log("Retry the cancelled fixture download in the Downloads panel.");
    await until("retry request", () => downloadRequests === 2, 120_000);
    record("native download appears, cancels, and retries from its saved URL", { downloadRequests });
    if (selectorDownloadsJourney) {
      report.passed = true;
    } else {
    const chosenFolder = join(disposable, "download-target");
    mkdirSync(chosenFolder);
    console.log("Open Save location, then choose the disposable folder:", chosenFolder);
    await until("default download location", () => native("has-name", "Save to") === "true", 120_000);
    await until("custom download location", () => native("has-name", chosenFolder) === "true", 120_000);
    assert.equal(native("has-button", "Use default"), "true");
    console.log("Restore the default download location.");
    await until("default download location restored", () => native("has-button", "Use default") === "false", 120_000);
    record("native download folder picker saves a disposable folder and restores the default", { chosenFolder: "disposable/download-target" });
    report.passed = true;
    }
  } else if (shellEvents) {
    if (rpcOnly) throw new Error("Shell loading events need the native accessibility tree.");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    native("activate");
    await rpc("settings.set", { tabLayout: "horizontal" });
    assert.equal((await rpc("settings.get")).tabLayout, "horizontal");
    await delay(400);
    const opened = rpc("pages.open", { url: `${origin}/slow`, activate: true });
    let sawLoading = false;
    try {
      await until("the horizontal tab loading name", () => native("has-name", "Loading") === "true", 8_000);
      sawLoading = true;
    } catch (error) {
      const page = await opened.catch(() => null);
      throw new Error(`${error.message}; page: ${JSON.stringify(page)}; names: ${native("names")}; texts: ${native("texts")}`);
    }
    const page = await opened;
    await until("the slow page to finish", async () => {
      const pages = await rpc("pages.list");
      return pages.some((item) => item.pageId === page.pageId && item.url.startsWith(`${origin}/slow`) && !item.loading);
    }, 15_000);
    await until("the loading name to clear", () => native("has-name", "Loading") === "false", 8_000);
    record("horizontal tab shows Loading while a slow navigation is in flight", { pageId: page.pageId, sawLoading });
    report.passed = true;
  } else if (webmcpJourney) {
    if (rpcOnly) throw new Error("WebMCP confirmation needs the native accessibility tree.");
    assert.equal(runtimeCapabilities.features?.webmcpTools, true, "The runtime must expose WebMCP tools");
    assert.ok(runtimeCapabilities.methods?.includes("pages.webmcp"), "pages.webmcp must be a runtime method");
    await rpc("settings.set", { effectGrants: ["effect:read", "effect:write"] });
    const page = await rpc("pages.open", { url: `${origin}/webmcp`, activate: true });
    await until("the WebMCP fixture to load", async () => {
      const pages = await rpc("pages.list");
      return pages.some((item) => item.pageId === page.pageId && item.url.startsWith(`${origin}/webmcp`) && !item.loading);
    });
    await until("the WebMCP fixture to register tools", async () => {
      const observed = JSON.stringify(await rpc("pages.observe", { pageId: page.pageId }));
      if (observed.includes("webmcp missing") || observed.includes("tools failed")) {
        throw new Error(`WebMCP did not register: ${observed}`);
      }
      return observed.includes("tools ready");
    }, 30_000);
    const listed = await rpc("pages.webmcp", { pageId: page.pageId, op: "tools" });
    assert.equal(listed.op, "tools");
    const readTool = listed.tools.find((tool) => tool.name === "read_count");
    const writeTool = listed.tools.find((tool) => tool.name === "add_write");
    assert.equal(readTool?.readOnly, true);
    assert.equal(readTool?.consequential, false);
    assert.equal(writeTool?.readOnly, false);
    assert.equal(writeTool?.consequential, true);
    const read = await rpc("pages.webmcp", { pageId: page.pageId, op: "call", name: "read_count", input: "{}" });
    assert.deepEqual(read, { op: "call", result: "0", success: true });
    assert.equal(webmcpWrites, 0, "A read tool must not post");
    await assert.rejects(
      rpc("pages.webmcp", { pageId: page.pageId, op: "call", name: "add_write", input: "{}" }),
      /needs_input/,
    );
    assert.equal(webmcpWrites, 0, "A write tool must not post before the person allows it");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    native("activate");
    try {
      await until("the Allow confirmation", () => native("has-button", "Allow") === "true");
    } catch (error) {
      throw new Error(`${error.message}; visible buttons: ${native("buttons")}; runtime banner: ${native("has-text", "Runtime reconnecting")}`);
    }
    assert.equal(native("press-button", "Allow"), "true", "Accessibility press must activate Allow");
    const click = JSON.parse(native("click-button", "Allow"));
    await delay(600);
    if (native("has-button", "Allow") === "true") {
      const usedRaw = Math.abs(click.x - click.rawX) < 1 && Math.abs(click.y - click.rawY) < 1;
      native("click-at", usedRaw ? click.flippedX : click.rawX, usedRaw ? click.flippedY : click.rawY);
    }
    try {
      await until("the confirmation to close", () => native("has-button", "Allow") === "false", 8_000);
    } catch (error) {
      let shot = "";
      try {
        const window = JSON.parse(native("window"));
        capture(window.id, "webmcp-confirmation-stuck");
        shot = " screenshot saved";
      } catch (captureError) {
        shot = ` screenshot failed: ${captureError instanceof Error ? captureError.message : captureError}`;
      }
      throw new Error(`${error.message}; click: ${JSON.stringify(click)}; writes: ${webmcpWrites}; focused: ${native("focused")}; texts: ${native("texts")};${shot}`);
    }
    const wrote = await rpc("pages.webmcp", { pageId: page.pageId, op: "call", name: "add_write", input: "{}" });
    assert.deepEqual(wrote, { op: "call", result: "1", success: true });
    await until("one WebMCP write", () => webmcpWrites === 1);
    await assert.rejects(
      rpc("pages.webmcp", { pageId: page.pageId, op: "call", name: "add_write", input: "{}" }),
      /needs_input/,
    );
    await delay(500);
    assert.equal(webmcpWrites, 1, "A further write without a new acceptance must not post again");
    record("WebMCP read runs immediately and a write posts once after Allow", { webmcpWrites });
    report.passed = true;
  } else if (submitConfirmation) {
    if (rpcOnly) throw new Error("Submit confirmation needs the native accessibility tree.");
    await rpc("settings.set", { effectGrants: ["effect:read", "effect:write"] });
    const page = await rpc("pages.open", { url: `${origin}/submit`, activate: true });
    await until("the submit fixture to load", async () => {
      const pages = await rpc("pages.list");
      return pages.some(item => item.pageId === page.pageId && item.url.startsWith(`${origin}/submit`) && !item.loading);
    });
    const program = { pageId: page.pageId, steps: [{ id: "submit-form", op: "click", target: "css:#send" }] };
    await assert.rejects(rpc("pages.execute", { program }), /needs_input/);
    assert.equal(posts, 0, "The form must not submit before the person allows it");
    await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    native("activate");
    try {
      await until("the Allow confirmation", () => native("has-button", "Allow") === "true");
    } catch (error) {
      throw new Error(`${error.message}; visible buttons: ${native("buttons")}; runtime banner: ${native("has-text", "Runtime reconnecting")}`);
    }
    assert.equal(native("press-button", "Allow"), "true", "Accessibility press must activate Allow");
    const click = JSON.parse(native("click-button", "Allow"));
    await delay(600);
    if (native("has-button", "Allow") === "true") {
      const usedRaw = Math.abs(click.x - click.rawX) < 1 && Math.abs(click.y - click.rawY) < 1;
      native("click-at", usedRaw ? click.flippedX : click.rawX, usedRaw ? click.flippedY : click.rawY);
    }
    try {
      await until("the confirmation to close", () => native("has-button", "Allow") === "false", 8_000);
    } catch (error) {
      let shot = "";
      try {
        const window = JSON.parse(native("window"));
        capture(window.id, "confirmation-stuck");
        shot = " screenshot saved";
      } catch (captureError) {
        shot = ` screenshot failed: ${captureError instanceof Error ? captureError.message : captureError}`;
      }
      throw new Error(`${error.message}; click: ${JSON.stringify(click)}; posts: ${posts}; focused: ${native("focused")}; texts: ${native("texts")};${shot}`);
    }
    const sent = await rpc("pages.execute", { program });
    assert.equal(sent.status, "completed", JSON.stringify(sent));
    await until("one form submit", () => posts === 1);
    await assert.rejects(rpc("pages.execute", { program }), /needs_input/);
    await delay(500);
    assert.equal(posts, 1, "A further attempt without a new acceptance must not submit again");
    record("fixture submit shows a shell confirmation and dispatches once", { posts });
    report.passed = true;
  } else {
  const red = await rpc("pages.open", { url: `${origin}/red`, activate: true });
  const blue = await rpc("pages.open", { url: `${origin}/blue`, activate: true });
  assert.ok(red.pageId && blue.pageId && red.pageId !== blue.pageId);
  assert.equal(red.backend, "aux");
  assert.equal(blue.backend, "aux");
  assert.ok(red.targetId && blue.targetId && red.targetId !== blue.targetId);
  await until("both native pages", async () => {
    const pages = await rpc("pages.list");
    return pages.some(page => page.pageId === red.pageId && page.url === `${origin}/red` && !page.loading) &&
      pages.some(page => page.pageId === blue.pageId && page.url === `${origin}/blue` && !page.loading);
  });
  if (!uiOnly) {
    assert.match(JSON.stringify(await rpc("pages.observe", { pageId: blue.pageId })), /Aux native Blue fixture/);
    record("two native pages retain distinct IDs and readable content", { red: red.pageId, blue: blue.pageId });

  assert.equal((await rpc("pages.find", { pageId: blue.pageId, text: "needle" })).matches, 1);
  assert.equal((await rpc("pages.find", { pageId: blue.pageId, text: "absent" })).matches, 0);
  await rpc("pages.activate", { pageId: red.pageId });
  await until("red tab activation", async () => (await rpc("workspace.get")).activePageId === red.pageId);
  assert.equal((await rpc("pages.find", { pageId: red.pageId, text: "needle" })).matches, 3);
  assert.equal((await rpc("pages.find", { pageId: red.pageId, text: "needle", findNext: true })).activeMatch, 2);
  assert.equal((await rpc("pages.zoom", { pageId: red.pageId, direction: "in" })).level > 0, true);
  assert.equal((await rpc("pages.zoom", { pageId: red.pageId, reset: true })).level, 0);
  await rpc("pages.stopFind", { pageId: red.pageId, action: "clear" });
  await rpc("pages.activate", { pageId: blue.pageId });
  await until("blue tab reactivation", async () => (await rpc("workspace.get")).activePageId === blue.pageId);
  record("native Find sees visible text, advances matches and clears; page zoom resets", { blueMatches: 1, redMatches: 3 });

  await rpc("settings.set", {
    effectGrants: ["effect:read", "effect:write"],
    originPolicies: [{ origin: `${origin}/`, access: "allow", confirmation: "none" }],
    safetyCeilings: { write: "always" },
  });
  const action = await rpc("pages.execute", { program: { pageId: blue.pageId,
    steps: [{ id: "native-click", op: "click", target: "css:#act" }] } });
  assert.equal(action.status, "completed", JSON.stringify(action));
  await until("fixture click", () => clicks === 1);
  assert.equal((await rpc("pages.takeover", { pageId: blue.pageId })).controller, "human");
  await assert.rejects(rpc("pages.execute", { program: { pageId: blue.pageId,
    steps: [{ id: "blocked-click", op: "click", target: "css:#act" }] } }), /conflict/i);
  assert.equal(clicks, 1, "Takeover must block another page action");
  assert.equal((await rpc("pages.resume", { pageId: blue.pageId })).controller, "none");
  record("native input, takeover, revocation and resume", { clicks });
  }

  if (!rpcOnly) {
    const window = await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    native("activate");
    const awayX = window.x + window.width * 0.8;
    const centerY = window.y + window.height * 0.55;
    native("move", awayX, centerY);
    await rpc("settings.set", { tabLayout: "vertical", sidebarAppearance: "translucent", sidebarMaterial: "liquid-glass" });
    assert.equal((await rpc("settings.get")).tabLayout, "vertical");
    await until("the native shell controls", () => native("has-button", "Show sidebar") === "true");
    // A fresh Profile starts with the sidebar hidden. The first chord pins it.
    native("toggle-sidebar");
    try {
      await until("the accessible expanded Aside", () => native("has-button", "Collapse sidebar") === "true", 5_000);
    } catch (error) {
      throw new Error(`${error.message}; visible buttons: ${native("buttons")}; runtime banner: ${native("has-text", "Runtime reconnecting")}`);
    }
    await until("vertical tab close controls in the accessibility tree", () =>
      native("has-button", "Close Aux native Red") === "true" && native("has-button", "Close Aux native Blue") === "true");
    native("next-tab");
    await until("vertical keyboard tab switch to red", async () => (await rpc("workspace.get")).activePageId === red.pageId);
    native("next-tab");
    await until("vertical keyboard tab switch to blue", async () => (await rpc("workspace.get")).activePageId === blue.pageId);
    record("vertical tabs switch through the native keyboard shortcut", { restoredPageId: blue.pageId });
    const expanded = capture(window.id, "vertical-expanded");
    native("toggle-sidebar");
    await delay(450);
    assert.equal(native("has-button", "Collapse sidebar"), "false", "The hidden sidebar must leave the accessibility tree");
    const collapsed = capture(window.id, "vertical-collapsed");
    const collapseChange = changedFraction(expanded, collapsed);
    assert.ok(collapseChange > 0.02, `Sidebar toggle did not visibly change the native window (${collapseChange.toFixed(3)})`);
    native("move", window.x + 2, centerY);
    await delay(450);
    assert.equal(native("has-button", "Keep sidebar open"), "true", "Edge hover must expose an accessible floating sidebar");
    const peek = capture(window.id, "vertical-floating-peek");
    const peekChange = changedFraction(collapsed, peek);
    assert.ok(peekChange > 0.02, `Edge hover did not reveal the glass sidebar (${peekChange.toFixed(3)})`);
    native("escape");
    await until("floating sidebar dismissal by Escape", () => native("has-button", "Keep sidebar open") === "false");
    record("floating Aside reveals at the edge and dismisses with Escape", { peekChange });
    native("move", awayX, centerY);
    await delay(350);
    await rpc("settings.set", { tabLayout: "horizontal" });
    assert.equal((await rpc("settings.get")).tabLayout, "horizontal");
    await delay(500);
    await until("horizontal tab close controls in the accessibility tree", () =>
      native("has-button", "Close Aux native Red") === "true" && native("has-button", "Close Aux native Blue") === "true");
    const horizontal = capture(window.id, "horizontal-tabs");
    const layoutChange = changedFraction(expanded, horizontal, 0.7);
    assert.ok(layoutChange > 0.02, `Layout change was not visible (${layoutChange.toFixed(3)})`);
    native("next-tab");
    await until("horizontal keyboard tab switch to red", async () => (await rpc("workspace.get")).activePageId === red.pageId);
    native("next-tab");
    await until("horizontal keyboard tab switch to blue", async () => (await rpc("workspace.get")).activePageId === blue.pageId);
    record("horizontal tabs switch through the native keyboard shortcut", { restoredPageId: blue.pageId });
    native("focus-address");
    const focus = await until("accessible address field focus", () => {
      try {
        const value = JSON.parse(native("focused"));
        return /address|search|prompt/i.test(`${value.title} ${value.description}`) ? value : null;
      } catch { return null; }
    });
    assert.match(focus.role, /^AX(TextField|ComboBox|SearchField)$/);
    native("escape");
    record("Command-L focuses a labeled, keyboard-accessible address field", { role: focus.role, label: `${focus.title} ${focus.description}`.trim() });
    record("native Aside glass reveal and both layouts", { windowId: window.id, collapseChange, peekChange, layoutChange });
  }

  if (!uiOnly) {
  const backgroundA = await rpc("pages.open", { url: `${origin}/red`, background: true });
  const backgroundB = await rpc("pages.open", { url: `${origin}/red`, background: true });
  assert.ok(backgroundA.pageId && backgroundB.pageId && backgroundA.pageId !== backgroundB.pageId);
  assert.notEqual(backgroundA.targetId, backgroundB.targetId, "Identical URLs need distinct native targets");
  assert.equal((await rpc("workspace.get")).activePageId, blue.pageId, "Background creation must preserve the foreground tab");
  await until("background pages to finish loading", async () => {
    const pages = await rpc("pages.list");
    return [backgroundA, backgroundB].every(target => pages.some(page => page.pageId === target.pageId && !page.loading));
  });
  const results = await Promise.all([backgroundA, backgroundB].map((target, index) => rpc("pages.execute", {
    program: { pageId: target.pageId, steps: [{ id: "background-fill", op: "fill", target: "css:#name", value: index ? "bravo" : "alpha" }] },
  })));
  assert.deepEqual(results.map(result => result.status), ["completed", "completed"]);
  for (const [target, value] of [[backgroundA, "alpha"], [backgroundB, "bravo"]]) {
    assert.match(JSON.stringify(await rpc("pages.observe", { pageId: target.pageId, scope: "forms" })), new RegExp(value));
    await rpc("pages.close", { pageId: target.pageId });
  }
  assert.equal((await rpc("workspace.get")).activePageId, blue.pageId, "Parallel background actions must not steal focus");
  record("identical-URL tabs and parallel background page actions preserve foreground identity", { foregroundPageId: blue.pageId });

  await rpc("pages.close", { pageId: blue.pageId });
  await until("closed native page to disappear", async () => !(await rpc("pages.list")).some(page => page.pageId === blue.pageId));
  assert.ok((await rpc("pages.list")).some(page => page.pageId === red.pageId));
  record("closing a tab reconciles runtime and native catalog", { remaining: red.pageId });
  }
  report.passed = true;
  }
} catch (error) {
  if (browserImportFormatsJourney) {
    report.importStartupDiagnostics = {
      runtimeFileExists: existsSync(runtimeFile),
      runtimeFileMode: existsSync(runtimeFile) ? statSync(runtimeFile).mode & 0o777 : null,
      browserExitCode: child?.exitCode ?? null,
      workspace: await rpc("workspace.get").then(value => ({ sessions: value?.sessions?.map(({ sessionId, status, detail }) => ({ sessionId, status, detail })) })).catch(cause => String(cause)),
    };
  }
  if (browserImportUiJourney) {
    const inspect = (path, sql) => {
      if (!existsSync(path)) return { exists: false };
      try {
        const db = new DatabaseSync(path, { readOnly: true });
        const rows = db.prepare(sql).all();
        db.close();
        return { exists: true, rows };
      } catch (cause) { return { exists: true, error: String(cause) }; }
    };
    report.importRestartDiagnostics = {
      native: inspect(join(profile, "Default/History"),
        "SELECT url, visit_count FROM urls WHERE url LIKE 'https://aux-import-%' ORDER BY url"),
      runtime: inspect(join(profile, "Default/Aux Runtime Data/aux-state.sqlite"),
        "SELECT url, visited_at FROM history WHERE url LIKE 'https://aux-import-%' ORDER BY url"),
      count: await rpc("history.count").catch(cause => String(cause)),
    };
  }
  report.steps.push({ name: "terminal failure", passed: false,
    detail: browserImportAttachedJourney && error instanceof Error ? error.stack ?? String(error) : String(error),
    ...(settingsHttpsFirstJourney ? { httpPlainRequests, tlsHelloRequests } : {}) });
  process.exitCode = 1;
} finally {
  report.completedAt = new Date().toISOString();
  writeFileSync(join(output, "manifest.json"), `${JSON.stringify(report, null, 2)}\n`);
  if (child && child.exitCode === null) {
    child.kill("SIGTERM");
    await Promise.race([new Promise(resolveExit => child.once("exit", resolveExit)), delay(5000)]);
    if (child.exitCode === null) child.kill("SIGKILL");
  }
  if (attachedChrome && attachedChrome.exitCode === null) {
    attachedChrome.kill("SIGTERM");
    await Promise.race([new Promise(resolveExit => attachedChrome.once("exit", resolveExit)), delay(5000)]);
    if (attachedChrome.exitCode === null) attachedChrome.kill("SIGKILL");
  }
  attachedChrome?.stderr.destroy();
  if (browserImportUiJourney && !report.passed) {
    const historyDb = join(profile, "Default/History");
    if (existsSync(historyDb)) {
      try {
        const db = new DatabaseSync(historyDb, { readOnly: true });
        report.importRestartDiagnostics = {
          ...report.importRestartDiagnostics,
          nativeAfterExit: db.prepare("SELECT url, visit_count FROM urls WHERE url LIKE 'https://aux-import-%' ORDER BY url").all(),
        };
        db.close();
      } catch (cause) {
        report.importRestartDiagnostics = { ...report.importRestartDiagnostics, nativeAfterExitError: String(cause) };
      }
      writeFileSync(join(output, "manifest.json"), `${JSON.stringify(report, null, 2)}\n`);
    }
  }
  child?.stderr.destroy();
  fixture?.closeAllConnections();
  if (fixture) await new Promise(resolveClose => fixture.close(resolveClose));
  if (tlsFixture) await new Promise(resolveClose => tlsFixture.close(resolveClose));
  if (tcpFixture) await new Promise(resolveClose => tcpFixture.close(resolveClose));
  if (modelFixture) await new Promise(resolveClose => modelFixture.close(resolveClose));
  rpcToken = undefined;
  agentToken = undefined;
  rmSync(disposable, { recursive: true, force: true });
  console.log(`Native journey ${report.passed ? "passed" : "failed"}; evidence: ${output}`);
}
