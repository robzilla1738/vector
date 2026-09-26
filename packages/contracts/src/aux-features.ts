import { AuxError } from "./errors.js";
import { RuntimeMethodPolicy } from "./runtime-method-policy.js";
import { HostMethods, type HostMethodId } from "./host-methods.js";
import type { MethodName } from "./api.js";

export type AuxFeatureStage = "off" | "preview" | "on";
export type AuxFeatureHost = "electron" | "chromium-fork";
export type AuxFeatureBatch = "B2" | "B3" | "B4" | "B5" | "B6" | "B7" | "B8" | "B9" | "B10" | "B11";

/** The product surface in ROADMAP section 3. New features must be registered before exposure. */
export const AUX_FEATURES = {
  layouts: "B7", floatingSidebar: "B2", autoHideToolbar: "B2", spaces: "B3",
  spaceThemes: "B7", tabSections: "B3", folders: "B3", archive: "B3",
  tidy: "B7", aiTidy: "B6", splitView: "B3", peek: "B7",
  littleWindow: "B7", hoverCards: "B7", linkRouting: "B3",
  titleRules: "B3", aiTabNaming: "B6", smartDownloadNames: "B6", tabLifecycle: "B3",
  profiles: "B3", privateWindows: "B3", commandRegistry: "B7",
  browserImport: "B8", appleScript: "B8", commandBar: "B3",
  searchRanking: "B7", searchEngines: "B8", homeAsk: "B7",
  quickAsk: "B7", conversation: "B7", selectionAsk: "B7",
  regionCapture: "B7", inlineAssist: "B6", reader: "B7",
  aiTranslate: "B7", summarize: "B7", siteAdapters: "B6",
  dictation: "B7", voiceCommands: "B10", realtimeVoice: "B10",
  codeMode: "B6", fourLayerTabApi: "B6", webMcp: "B6",
  agentTabGroups: "B4", turnScopedTabs: "B6", modelRouting: "B6",
  webTools: "B6", agentRecovery: "B6", subagents: "B9",
  steerAndTakeover: "B5", agentOverlay: "B7", tasksInbox: "B7",
  safetyCore: "B5", durableJournal: "B5", skills: "B9",
  automations: "B9", goals: "B9", hooks: "B9",
  inboundAgents: "B6", outboundMcp: "B9", connectors: "B9",
  reports: "B7", documentArtifacts: "B10", activeHtml: "B10",
  devWorkflows: "B10", zapAndUserCss: "B10", cloudEnvironments: "B10",
  memory: "B9", unifiedRecall: "B3", extensions: "B8",
  passwordManager: "B8", vault: "B8", passkeys: "B8", contentBlocking: "B8",
  httpsFirst: "B8", sitePermissions: "B8", pageZoom: "B8",
  policyProvider: "B8", updates: "B11", crashReporting: "B11", electronMigration: "B11",
  onboarding: "B7",
} as const satisfies Record<string, AuxFeatureBatch>;

export type AuxFeature = keyof typeof AUX_FEATURES;
export type AuxFeatureOverrides = Partial<Record<AuxFeature, AuxFeatureStage>>;
export type AuxFeatureJourneyId = `feature:${AuxFeature}`;
export type AuxFeatureMethodId = HostMethodId | MethodName;

/** Required methods come from the two exhaustive method manifests. */
export const AUX_FEATURE_REQUIREMENTS = Object.fromEntries(
  (Object.keys(AUX_FEATURES) as AuxFeature[]).map(feature => [feature, {
    requires: [
      ...(Object.entries(HostMethods) as [HostMethodId, (typeof HostMethods)[HostMethodId]][])
        .filter(([, method]) => method.feature === feature).map(([id]) => id),
      ...(Object.entries(RuntimeMethodPolicy) as [MethodName, (typeof RuntimeMethodPolicy)[MethodName]][])
        .filter(([, method]) => method.feature === feature).map(([id]) => id),
    ] as AuxFeatureMethodId[],
    journey: `feature:${feature}` as AuxFeatureJourneyId,
  }]),
) as unknown as Readonly<Record<AuxFeature, { requires: readonly AuxFeatureMethodId[]; journey: AuxFeatureJourneyId }>>;

export function deriveAuxFeatureStages(
  implementedMethods: readonly string[],
  passingJourneys: Readonly<Record<string, string>>,
  sourceCommit: string,
): Record<AuxFeature, AuxFeatureStage> {
  const implemented = new Set(implementedMethods);
  return Object.fromEntries((Object.keys(AUX_FEATURE_REQUIREMENTS) as AuxFeature[])
    .map(feature => {
      const { requires, journey } = AUX_FEATURE_REQUIREMENTS[feature];
      const stage: AuxFeatureStage = requires.every(id => implemented.has(id))
        ? passingJourneys[journey] === sourceCommit ? "on" : "preview"
        : "off";
      return [feature, stage];
    })) as Record<AuxFeature, AuxFeatureStage>;
}

/** Legacy Electron remains usable during migration; the fork starts closed. */
export const AUX_FEATURE_DEFAULTS: Readonly<Record<AuxFeatureHost, AuxFeatureOverrides>> = {
  electron: { passwordManager: "off", passkeys: "off", codeMode: "off", fourLayerTabApi: "off", webMcp: "off", outboundMcp: "off", updates: "off", crashReporting: "off" },
  "chromium-fork": {},
};

export function auxFeatureStage(
  feature: AuxFeature,
  host: AuxFeatureHost,
  profileOverrides: AuxFeatureOverrides = {},
  hostOverrides: AuxFeatureOverrides = AUX_FEATURE_DEFAULTS[host],
): AuxFeatureStage {
  return profileOverrides[feature] ?? hostOverrides[feature] ?? (host === "electron" ? "on" : "off");
}

export function auxFeatureEnabled(
  feature: AuxFeature,
  host: AuxFeatureHost,
  profileOverrides?: AuxFeatureOverrides,
  hostOverrides?: AuxFeatureOverrides,
): boolean {
  return auxFeatureStage(feature, host, profileOverrides, hostOverrides) === "on";
}

export function requireAuxFeature(
  feature: AuxFeature,
  host: AuxFeatureHost,
  profileOverrides?: AuxFeatureOverrides,
  hostOverrides?: AuxFeatureOverrides,
): void {
  const stage = auxFeatureStage(feature, host, profileOverrides, hostOverrides);
  if (stage !== "on") {
    throw new AuxError("feature_unavailable", `${feature} is ${stage} in ${host}`, { feature, stage, host });
  }
}

export function auxFeatureForMethod(method: string): AuxFeature | undefined {
  const policy = RuntimeMethodPolicy[method as keyof typeof RuntimeMethodPolicy];
  return policy?.feature === "core" ? undefined : policy?.feature;
}

const BRIDGE_FEATURE_METHODS: Readonly<Record<string, AuxFeature>> = {
  extensions: "extensions", installStoreExtension: "extensions",
  checkStoreExtensionUpdate: "extensions", reloadExtension: "extensions",
  showExtensionAction: "extensions", setExtensionEnabled: "extensions",
  removeExtension: "extensions", installUnpackedExtension: "extensions",
  updateUnpackedExtension: "extensions",
  vaultFill: "vault", vaultSave: "vault", vaultDismiss: "vault",
  vaultExport: "vault", vaultImport: "vault", autofill: "vault",
  exportMigrationLayout: "electronMigration",
  browserProfiles: "profiles", createBrowserProfile: "profiles", renameBrowserProfile: "profiles",
  archiveBrowserProfile: "profiles", deleteBrowserProfile: "profiles", openBrowserProfile: "profiles",
  openBrowserProfileUrl: "profiles", quickAsk: "quickAsk", quickAskShortcut: "quickAsk",
  filterLists: "contentBlocking", updateFilters: "contentBlocking",
  addFilterSource: "contentBlocking", removeFilterSource: "contentBlocking",
  translatePage: "aiTranslate", showOriginal: "aiTranslate",
  dictationStatus: "dictation", startDictation: "dictation",
  stopDictation: "dictation", cancelDictation: "dictation",
};

export function auxFeatureForBridgeMethod(method: string): AuxFeature | undefined {
  return BRIDGE_FEATURE_METHODS[method];
}

export function requireAuxMethod(
  method: string,
  host: AuxFeatureHost,
  profileOverrides?: AuxFeatureOverrides,
  hostOverrides?: AuxFeatureOverrides,
): void {
  const feature = auxFeatureForMethod(method);
  if (feature) requireAuxFeature(feature, host, profileOverrides, hostOverrides);
}
