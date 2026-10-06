import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { expect, it, vi } from "vitest";
import { PERSON_OBSERVER_WRAPPED_SOURCE } from "@aux/chromium-driver";
import { NativePersonReader } from "../../apps/runtime/dist/services/native-person-reader.js";

const pageId = randomUUID(),
  documentId = randomUUID(),
  sessionId = randomUUID();
const producerSha256 = createHash("sha256").update(PERSON_OBSERVER_WRAPPED_SOURCE).digest("hex");
const header = readFileSync(
  new URL("../../chromium/test-fixtures/native_person_observer_script.h", import.meta.url),
  "utf8",
);
const nativeSource = /kRead\[\] = uR"AUX_READ\(([\s\S]*?)\)AUX_READ";/.exec(header)![1]!;
function value() {
  const dom = new JSDOM(
    "<title>Plan</title><h1>Ready</h1><p>Visible text</p><input name=company value=private><button>Continue</button>",
    { url: "https://read.test/", runScripts: "outside-only", pretendToBeVisual: true },
  );
  dom.window.Element.prototype.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    width: 40,
    height: 20,
    top: 0,
    bottom: 20,
    left: 0,
    right: 40,
    toJSON: () => ({}),
  });
  const read = dom.window.eval(nativeSource) as (request: unknown) => string;
  const result = JSON.parse(read({ operation: "observe", maxElements: 20, maxTextChars: 1000 }));
  dom.window.close();
  return result;
}
const receipt = (output: unknown = value()) => ({
  readId: randomUUID(),
  pageId,
  documentId,
  sessionId,
  producerSha256,
  value: output,
});
const request = { maxElements: 20, maxTextChars: 1000 };

it("joins actual generated producer bytes and converts bounded native primary content", async () => {
  expect(nativeSource).toBe(PERSON_OBSERVER_WRAPPED_SOURCE);
  const read = vi.fn(async () => receipt());
  const result = await new NativePersonReader({ read }).observe(pageId, request, () => true);
  expect(read).toHaveBeenCalledWith({ pageId, request: { operation: "observe", ...request } });
  expect(result.documentId).toBe(documentId);
  expect(result.content).toMatchObject({
    title: "Plan",
    frames: [{ frame: "main", url: "https://read.test/", sameOrigin: true }],
  });
  expect(result.content.formFields[0]).not.toHaveProperty("value");
  expect(result.content.text).not.toContain("private");
});
it("refuses before transport when the original page is retired", async () => {
  const read = vi.fn(async () => receipt());
  await expect(new NativePersonReader({ read }).observe(pageId, request, () => false)).rejects.toMatchObject({
    code: "target_detached",
  });
  expect(read).not.toHaveBeenCalled();
});
it("refuses a held late reply after the original page changes", async () => {
  let resolve!: (value: unknown) => void;
  let current = true;
  const pending = new Promise<unknown>((done) => {
    resolve = done;
  });
  const reader = new NativePersonReader({ read: async () => pending });
  const result = reader.observe(pageId, request, () => current);
  current = false;
  resolve(receipt());
  await expect(result).rejects.toMatchObject({ code: "target_detached" });
});
it.each(["pageId", "producerSha256"])("refuses a valid-shaped foreign %s", async (key) => {
  const raw = { ...receipt(), [key]: key === "pageId" ? randomUUID() : "0".repeat(64) };
  await expect(
    new NativePersonReader({ read: async () => raw }).observe(pageId, request, () => true),
  ).rejects.toMatchObject({ code: "backend_unavailable" });
});
it("rejects value fields even in an otherwise real native observation", async () => {
  const output = value();
  output.formFields[0].value = "synthetic-secret";
  await expect(
    new NativePersonReader({ read: async () => receipt(output) }).observe(pageId, request, () => true),
  ).rejects.toThrow();
});
it("rejects script-bearing data and excess request bounds before native dispatch", async () => {
  const read = vi.fn(async () => receipt());
  const reader = new NativePersonReader({ read });
  await expect(reader.observe(pageId, { ...request, maxElements: 201 }, () => true)).rejects.toThrow();
  await expect(
    reader.extract(pageId, [{ name: "field", selector: "input", attribute: "value" }] as never, () => true),
  ).rejects.toThrow();
  expect(read).not.toHaveBeenCalled();
});
it("refuses native content larger than the exact caller request", async () => {
  await expect(
    new NativePersonReader({ read: async () => receipt() }).observe(
      pageId,
      { maxElements: 1, maxTextChars: 1 },
      () => true,
    ),
  ).rejects.toMatchObject({ code: "backend_unavailable" });
});
it("returns exact fixed extract fields and refuses an unsolicited result", async () => {
  const reader = new NativePersonReader({ read: async () => receipt({ heading: "Ready" }) });
  expect(await reader.extract(pageId, [{ name: "heading", selector: "h1" }], () => true)).toEqual({
    documentId,
    sessionId,
    fields: { heading: "Ready" },
  });
  await expect(reader.extract(pageId, [{ name: "other", selector: "h1" }], () => true)).rejects.toMatchObject(
    { code: "backend_unavailable" },
  );
});
