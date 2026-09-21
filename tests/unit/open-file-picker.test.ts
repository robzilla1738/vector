import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

it("wires Open File and download-folder pickers with explicit dialog titles", () => {
  const main = readFileSync(join(process.cwd(), "apps/desktop/main/index.ts"), "utf8");
  const privateMain = readFileSync(join(process.cwd(), "apps/desktop/main/private-main.ts"), "utf8");
  expect(main).toContain('title: "Open File"');
  expect(main).toContain('title:"Choose download folder"');
  expect(main).toMatch(/ipcMain\.handle\("ui\.openFile"/);
  expect(privateMain).toContain('title:"Open File"');
  expect(privateMain).toMatch(/ipcMain\.handle\("ui\.openFile"/);
});
