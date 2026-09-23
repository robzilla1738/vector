import { describe, expect, it } from "vitest";
import { downloadWarning } from "../../apps/desktop/main/download-guard.js";

describe("downloadWarning", () => {
  it("flags files that can execute code", () => {
    for (const name of ["setup.exe", "Installer.pkg", "app.dmg", "update.sh", "evil.scr", "macro.vbs", "mod.apk", "plugin.crx", "disk.iso", "helper.command"]) {
      expect(downloadWarning(name, "https://site.example/dl")).toBe("executable");
    }
  });
  it("flags downloads over unencrypted http", () => {
    expect(downloadWarning("photo.zip", "http://files.example/photo.zip")).toBe("insecure");
    expect(downloadWarning("report.pdf", "http://intranet/report.pdf")).toBe("insecure");
  });
  it("executable takes precedence over insecure", () => {
    expect(downloadWarning("tool.exe", "http://files.example/tool.exe")).toBe("executable");
  });
  it("does not flag loopback http (potentially trustworthy origin)", () => {
    for (const url of ["http://127.0.0.1:8080/file.txt", "http://localhost/file.txt", "http://[::1]:3000/file.txt", "http://app.localhost/file.txt"]) {
      expect(downloadWarning("photo.zip", url)).toBeUndefined();
    }
  });
  it("passes ordinary https downloads", () => {
    for (const name of ["photo.jpg", "archive.zip", "doc.pdf", "data.csv", "noextension", ".hidden"]) {
      expect(downloadWarning(name, "https://site.example/f")).toBeUndefined();
    }
  });
});
