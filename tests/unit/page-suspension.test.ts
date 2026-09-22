/// <reference lib="dom" />
// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { WebContents } from "electron";
import { captureScrollPosition, hasPageWork } from "../../apps/desktop/main/page-suspension.js";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  // The injected hint collector writes module-level flags on globalThis.
  delete (globalThis as Record<string, unknown>).__auxDirtyHint;
  delete (globalThis as Record<string, unknown>).__auxDirtyInstalled;
});
function page() {
  // oxlint-disable-next-line no-eval — the fake page must actually evaluate the injected scripts to exercise suspension logic
  const frame = { url: "https://example.com", executeJavaScriptInIsolatedWorld: vi.fn(async (_world, scripts) => (0, eval)(scripts[0].code)) };
  const contents = { isDestroyed: () => false, isLoading: () => false, isCurrentlyAudible: () => false, isBeingCaptured: () => false, executeJavaScriptInIsolatedWorld: frame.executeJavaScriptInIsolatedWorld, mainFrame: { framesInSubtree: [frame] } };
  return { frame, contents: contents as unknown as WebContents };
}
it("protects changed form controls and shadow-root editors without reading their values into the host", async () => {
  const { contents } = page();
  document.body.innerHTML = '<input value="original"><textarea>saved</textarea>';
  expect(await hasPageWork(contents)).toBe(false);
  document.querySelector('input')!.value = 'unsaved';
  expect(await hasPageWork(contents)).toBe(true);
  document.querySelector('input')!.value = 'original';
  const shadow = document.createElement('div').attachShadow({ mode: 'open' });
  shadow.innerHTML = '<textarea>saved</textarea>';
  shadow.querySelector('textarea')!.value = 'unsaved shadow draft';
  document.body.append(shadow.host);
  expect(await hasPageWork(contents)).toBe(true);
});
it("keeps unknown or changing frames awake", async () => {
  const { contents, frame } = page();
  frame.executeJavaScriptInIsolatedWorld.mockRejectedValueOnce(new Error('Frame detached'));
  expect(await hasPageWork(contents)).toBe(true);
  frame.executeJavaScriptInIsolatedWorld.mockImplementationOnce(async () => { frame.url = 'https://example.org'; return false; });
  expect(await hasPageWork(contents)).toBe(true);
});
it("skips the full DOM walk when no editable surface and no dirty hint exist", async () => {
  const { contents, frame } = page();
  document.body.innerHTML = '<article><h1>Static</h1><p>Nothing editable.</p></article>';
  expect(await hasPageWork(contents)).toBe(false);
  // install + probe only — the deep walk never ran
  expect(frame.executeJavaScriptInIsolatedWorld).toHaveBeenCalledTimes(2);
});
it("runs the walk when the dirty hint fires, even with unchanged field values", async () => {
  const { contents, frame } = page();
  document.body.innerHTML = '<input value="original">';
  expect(await hasPageWork(contents)).toBe(false);
  document.querySelector('input')!.dispatchEvent(new Event('input', { bubbles: true }));
  expect(await hasPageWork(contents)).toBe(false); // typed-then-reverted is still clean work
  expect(frame.executeJavaScriptInIsolatedWorld).toHaveBeenCalledTimes(6); // install+probe+walk, then install+probe+walk again
  document.querySelector('input')!.value = 'draft';
  expect(await hasPageWork(contents)).toBe(true);
});
it("captures the main-frame scroll offset without touching subframes", async () => {
  const { contents } = page();
  expect(await captureScrollPosition(contents)).toEqual({ x: 0, y: 0 });
});
