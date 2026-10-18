import { googleMethods } from "./google.js";
import { desktopContextMethods } from "./desktop-context.js";
import { packagesMethods } from "./packages.js";
import { codingMethods } from "./coding.js";
import { projectMethods } from "./projects.js";
import { terminalMethods } from "./terminal.js";
import { onboardingMethods } from "./onboarding.js";
import { liveFolderMethods } from "./live-folders.js";
import { downloadNamingMethods } from "./download-naming.js";
import { demonstrationMethods } from "./demonstration.js";
import { nightShiftMethods } from "./night-shift.js";
import { zapMethods } from "./zap.js";
import { agentMethods } from "./agent.js";
import { sitesMethods } from "./sites.js";
import { calendarMethods } from "./calendar.js";
import { connectorsMethods } from "./connectors.js";
import { agentConnectionsMethods } from "./agentConnections.js";
import { channelsMethods } from "./channels.js";
import { mcpMethods } from "./mcp.js";
import { subagentsMethods } from "./subagents.js";
import { pluginsMethods } from "./plugins.js";
import { goalsMethods } from "./goals.js";
import { hooksMethods } from "./hooks.js";
import { tasksMethods } from "./tasks.js";
import { workspacesMethods } from "./workspaces.js";
import { spacesMethods } from "./spaces.js";
import { memoryMethods } from "./memory.js";
import { installationMethods } from "./installation.js";
import { vaultMethods } from "./vault.js";
import { routinesMethods } from "./routines.js";
import { pagesMethods } from "./pages.js";
import { customizationMethods } from "./customization.js";
import { setsMethods } from "./sets.js";
import { runsMethods } from "./runs.js";
import { conversationsMethods } from "./conversations.js";
import { resultsMethods } from "./results.js";
import { safetyMethods } from "./safety.js";
import { artifactsMethods } from "./artifacts.js";
import { programsMethods } from "./programs.js";
import { sessionsMethods } from "./sessions.js";
import { chromeMethods } from "./chrome.js";
import { importMethods } from "./import.js";
import { translateMethods } from "./translate.js";
import { modelsMethods } from "./models.js";
import { settingsMethods } from "./settings.js";
import { commandMethods } from "./command.js";
import { browserMethods } from "./browser.js";
import { historyMethods } from "./history.js";
import { bookmarksMethods } from "./bookmarks.js";
import { downloadsMethods } from "./downloads.js";
import { workspaceMethods } from "./workspace.js";
import { benchMethods } from "./bench.js";
import { responsesMethods } from "./responses.js";
import { stateMethods } from "./state.js";
import { datasetsMethods } from "./datasets.js";
import { operationsMethods } from "./operations.js";
import { tracesMethods } from "./traces.js";
import { runtimeMethods } from "./runtime.js";
import type { MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";

export const METHODS: Record<MethodName, MethodHandler> = {
  ...codingMethods,
  ...projectMethods,
  ...terminalMethods,
  ...liveFolderMethods,
  ...downloadNamingMethods,
  ...demonstrationMethods,
  ...nightShiftMethods,
  ...zapMethods,
  ...agentMethods,
  ...sitesMethods,
  ...calendarMethods,
  ...googleMethods,
  ...connectorsMethods,
  ...agentConnectionsMethods,
  ...channelsMethods,
  ...mcpMethods,
  ...subagentsMethods,
  ...pluginsMethods,
  ...goalsMethods,
  ...hooksMethods,
  ...tasksMethods,
  ...workspacesMethods,
  ...spacesMethods,
  ...memoryMethods,
  ...desktopContextMethods,
  ...installationMethods,
  ...vaultMethods,
  ...routinesMethods,
  ...pagesMethods,
  ...customizationMethods,
  ...setsMethods,
  ...runsMethods,
  ...packagesMethods,
  ...conversationsMethods,
  ...resultsMethods,
  ...safetyMethods,
  ...artifactsMethods,
  ...programsMethods,
  ...sessionsMethods,
  ...chromeMethods,
  ...importMethods,
  ...onboardingMethods,
  ...translateMethods,
  ...modelsMethods,
  ...settingsMethods,
  ...commandMethods,
  ...browserMethods,
  ...historyMethods,
  ...bookmarksMethods,
  ...downloadsMethods,
  ...workspaceMethods,
  ...benchMethods,
  ...responsesMethods,
  ...stateMethods,
  ...datasetsMethods,
  ...operationsMethods,
  ...tracesMethods,
  ...runtimeMethods,
} as Record<MethodName, MethodHandler>;
