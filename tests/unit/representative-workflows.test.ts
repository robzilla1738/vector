import { expect, it } from "vitest";
import { executeProgram } from "@aux/runtime";
import type { DriverPage } from "@aux/chromium-driver";
import { sourcedWorkbookSnapshot, workbookSourceHyperlink } from "@aux/contracts";

function fakePage() {
  const calls: string[] = [];
  const page: DriverPage = {
    identity: { pageId: "p1", targetId: "t1", backend: "aux" },
    url: () => "https://app.test/compose",
    title: async () => "Compose",
    isAttached: () => true,
    navigate: async (url) => { calls.push(`navigate:${url}`); },
    back: async () => {},
    forward: async () => {},
    reload: async () => {},
    stop: async () => {},
    click: async (t) => { calls.push(`click:${t}`); },
    dblclick: async () => {},
    hover: async () => {},
    fill: async (t, v) => { calls.push(`fill:${t}=${v}`); },
    typeText: async (t, v) => { calls.push(`type:${t}=${v}`); },
    press: async (k) => { calls.push(`press:${k}`); },
    check: async () => {},
    uncheck: async () => {},
    select: async (t, v) => { calls.push(`select:${t}=${Array.isArray(v) ? v.join(",") : v}`); },
    scroll: async () => {},
    dragTo: async () => {},
    clickPoint: async () => {},
    uploadFiles: async (t, f) => { calls.push(`upload:${t}:${f.length}`); },
    waitFor: async () => ({ ok: true, timedOut: false }),
    waitForDownload: async () => ({ suggestedFilename: "report.csv", path: "/tmp/report.csv" }),
    collectScroll: async () => ({ items: [{ text: "row" }], collected: 1 }),
    handleDialog: async (a) => { calls.push(`dialog:${a}`); },
    screenshot: async () => ({ buffer: Buffer.from("png"), width: 1, height: 1, scale: 1 }),
    observe: async () => ({}) as never,
    expandRef: async () => [],
    extract: async (fields) => Object.fromEntries(fields.map(field => [field.name, `v-${field.name}`])),
    evaluate: async () => 1,
    setEvents: () => {},
    dispose: async () => {},
  };
  return { page, calls };
}

it("runs representative form, popup, upload, download and rich-text steps without embedding secrets", async () => {
  const { page, calls } = fakePage();
  const result = await executeProgram(page, {
    pageId: "p1",
    steps: [
      { id: "n1", op: "navigate", url: "https://app.test/compose" },
      { id: "d0", op: "dialog", action: "accept" },
      { id: "u1", op: "upload", target: "r-file", files: ["/tmp/note.txt"] },
      { id: "f1", op: "fill", target: "r-title", value: "Prepared message" },
      { id: "t1", op: "type", target: "r-body", value: "Hello from Aux" },
      { id: "s1", op: "select", target: "r-account", value: "work" },
      { id: "c1", op: "fillCredential", target: "r-secret", credentialRef: `cref_${"ab".repeat(12)}` },
      { id: "dl", op: "expectDownload", timeoutMs: 1000 },
      { id: "go", op: "click", target: "r-submit" },
    ],
  }, {
    pageOrigin: "https://app.test",
    resolveCredential: async () => "s3cret-value",
  });
  expect(result.status).toBe("completed");
  expect(JSON.stringify(result)).not.toContain("s3cret-value");
  expect(calls).toEqual(expect.arrayContaining([
    "navigate:https://app.test/compose",
    "dialog:accept",
    "upload:r-file:1",
    "fill:r-title=Prepared message",
    "type:r-body=Hello from Aux",
    "select:r-account=work",
    "fill:r-secret=s3cret-value",
    "click:r-submit",
  ]));
  expect(result.steps.find(step => step.op === "expectDownload")?.extracted?.downloaded).toBe("report.csv");
});

it("keeps source hyperlinks as stored addresses, not inferred text", () => {
  expect(workbookSourceHyperlink("https://example.com/a")).toBe("https://example.com/a");
  expect(workbookSourceHyperlink("https://user:pass@example.com")).toBeUndefined();
  expect(workbookSourceHyperlink("javascript:alert(1)")).toBeUndefined();
  const snapshot = sourcedWorkbookSnapshot("Comparison", [["Vendor", "Price"], ["Acme", "10"]], ["https://example.com/acme"]);
  expect(snapshot.sheets[0]?.rows[1]?.cells[2]).toEqual({ column: 3, value: "https://example.com/acme", hyperlink: "https://example.com/acme" });
  expect(snapshot.sheets[0]?.rows[0]?.cells.map(cell => cell.value)).toEqual(["Vendor", "Price", "Source"]);
});
