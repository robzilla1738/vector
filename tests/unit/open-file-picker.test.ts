import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

it("wires Open File and download-folder pickers with explicit dialog titles", () => {
  const files = readFileSync(join(process.cwd(), "apps/desktop/main/ipc/files.ts"), "utf8");
  const downloads = readFileSync(join(process.cwd(), "apps/desktop/main/ipc/downloads.ts"), "utf8");
  const privateMain = readFileSync(join(process.cwd(), "apps/desktop/main/private-main.ts"), "utf8");
  expect(files).toContain('title: "Open File"');
  expect(downloads).toContain('title:"Choose download folder"');
  expect(files).toMatch(/handleShell\("ui\.openFile"/);
  expect(privateMain).toContain('title:"Open File"');
  expect(privateMain).toMatch(/ipcMain\.handle\("ui\.openFile"/);
});
