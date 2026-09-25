import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
// Add files as their legacy formatting is converted. This is the B7 renderer ratchet.
const files = [
  "apps/desktop/renderer/src/floating-sidebar.ts",
  "apps/desktop/renderer/src/floating-sidebar.test.ts",
  "apps/desktop/renderer/src/command-results.ts",
  "apps/desktop/renderer/src/command-results.test.ts",
  "apps/desktop/renderer/src/components/PageSurface.tsx",
  "apps/desktop/renderer/src/components/PageSurface.test.tsx",
  "apps/desktop/renderer/src/components/PageSurface.css",
  "apps/desktop/renderer/src/components/NativeDialog.tsx",
  "apps/desktop/renderer/src/components/NativeDialog.css",
  "apps/desktop/renderer/src/components/CommandBar.css",
  "apps/desktop/renderer/src/components/SpaceEditor.tsx",
  "apps/desktop/renderer/src/components/ResizeHandle.tsx",
  "apps/desktop/renderer/src/components/ResizeHandle.test.tsx",
  "apps/desktop/renderer/src/components/RoutineSchedule.tsx",
  "apps/desktop/renderer/src/components/RoutineSchedule.test.tsx",
  "apps/desktop/renderer/src/components/OutboundMcpSettings.tsx",
  "apps/desktop/renderer/src/components/OutboundMcpSettings.test.tsx",
  "apps/desktop/renderer/src/components/OutboundMcpSettings.css",
  "apps/desktop/renderer/src/components/SiteControls.tsx",
  "apps/desktop/renderer/src/components/SiteControls.css",
  "apps/desktop/renderer/src/components/CalendarSourceChoiceDialog.tsx",
  "apps/desktop/renderer/src/components/CalendarSourceChoiceDialog.css",
  "apps/desktop/renderer/src/components/CalendarSourceChoiceDialog.test.tsx",
  "apps/desktop/renderer/src/mock/bridge-mcp.test.ts",
  "apps/desktop/renderer/src/styles/space-grain.css",
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
