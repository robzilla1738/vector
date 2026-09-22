/// <reference lib="dom" />
// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { WebContents } from "electron";
import { hasPageWork } from "../../apps/desktop/main/page-suspension.js";

afterEach(() => { document.body.innerHTML = ""; vi.restoreAllMocks(); });
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
