import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
// Add files as their legacy formatting is converted. This is the B7 renderer ratchet.
const files = [
  "apps/shell/src/voice-commands.ts",
  "apps/shell/src/voice-commands.test.ts",
  "apps/shell/src/components/Dictation.tsx",
  "apps/shell/src/floating-sidebar.ts",
  "apps/shell/src/floating-sidebar.test.tsx",
  "apps/shell/src/toolbar-reveal.ts",
  "apps/shell/src/toolbar-reveal.test.tsx",
  "apps/shell/src/use-tab-membership.ts",
  "apps/shell/src/use-tab-membership.test.tsx",
  "apps/shell/src/command-results.ts",
  "apps/shell/src/command-results.test.ts",
  "apps/shell/src/command-ranking-renderer.ts",
  "apps/shell/src/command-bar-browser.test.tsx",
  "apps/shell/src/store/organization-layout.ts",
  "apps/shell/src/store/organization-persistence.ts",
  "apps/shell/src/store/persistence.ts",
  "apps/shell/src/components/PageSurface.tsx",
  "apps/shell/src/components/PageSurface.test.tsx",
  "apps/shell/src/components/PageSurface.css",
  "apps/shell/src/ui/dialog.tsx",
  "apps/shell/src/ui/dialog.css",
  "apps/shell/src/ui/confirm.tsx",
  "apps/shell/src/ui/confirm.css",
  "apps/shell/src/ui/popover.tsx",
  "apps/shell/src/ui/popover.css",
  "apps/shell/src/components/ContextPicker.css",
  "apps/shell/src/components/CommandBar.css",
  "apps/shell/src/components/CommandProviderRows.tsx",
  "apps/shell/src/components/command-provider-types.ts",
  "apps/shell/src/components/command-tab-rows.tsx",
  "apps/shell/src/components/CommandRankingDebug.tsx",
  "apps/shell/src/components/CommandRankingDebug.css",
  "apps/shell/src/components/SpaceEditor.tsx",
  "apps/shell/src/components/ResizeHandle.tsx",
  "apps/shell/src/components/ResizeHandle.test.tsx",
  "apps/shell/src/components/RoutineSchedule.tsx",
  "apps/shell/src/components/RoutineSchedule.test.tsx",
  "apps/shell/src/components/OutboundMcpSettings.tsx",
  "apps/shell/src/components/OutboundMcpSettings.test.tsx",
  "apps/shell/src/components/OutboundMcpSettings.css",
  "apps/shell/src/components/SiteControls.tsx",
  "apps/shell/src/components/SiteControls.css",
  "apps/shell/src/components/SiteCustomization.tsx",
  "apps/shell/src/components/SiteCustomization.css",
  "apps/shell/src/components/CalendarSourceChoiceDialog.tsx",
  "apps/shell/src/components/CalendarSourceChoiceDialog.css",
  "apps/shell/src/components/CalendarSourceChoiceDialog.test.tsx",
  "apps/shell/src/mock/bridge-mcp.test.ts",
  "apps/shell/src/components/ReviewedConnectors.tsx",
  "apps/shell/src/components/ReviewedConnectors.test.tsx",
  "apps/shell/src/components/ReviewedConnectors.css",
  "apps/shell/src/components/PluginsPanel.tsx",
  "apps/shell/src/components/PluginsPanel.test.tsx",
  "apps/shell/src/components/PluginsPanel.css",
  "apps/shell/src/components/SkillMetadata.tsx",
  "apps/shell/src/components/SkillMetadata.test.tsx",
  "apps/shell/src/components/FilterListManager.tsx",
  "apps/shell/src/components/FilterListManager.test.tsx",
  "apps/shell/src/components/FilterListManager.css",
  "apps/shell/src/mock/connectors.ts",
  "apps/shell/src/mock/connectors.test.ts",
  "apps/shell/src/mock/connector-bridge.test.ts",
  "apps/shell/src/styles/space-grain.css",
];

const prettier = join(root, "node_modules", ".bin", process.platform === "win32" ? "prettier.cmd" : "prettier");
const format = spawnSync(prettier, ["--check", ...files], { cwd: root, stdio: "inherit" });
if (format.error) throw format.error;

const width = 110;
let overlength = 0;
for (const file of files.filter((file) => /\.[jt]sx?$/.test(file))) {
  const lines = readFileSync(join(root, file), "utf8").split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (line.length <= width) continue;
    console.error(`${file}:${index + 1}: line is ${line.length} characters (limit ${width})`);
    overlength += 1;
  }
}
if (overlength) console.error(`${overlength} renderer line${overlength === 1 ? "" : "s"} exceed the B7 limit.`);
if (format.status !== 0 || overlength) process.exitCode = 1;
