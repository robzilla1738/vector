import { expect, it } from "vitest";
import { defaultSelectionCaptureSettings, type PageQuickAction, type PageTarget } from "@aux/contracts";
import { prepareSelectionActionDraft } from "./selection-action-draft";

const page = { pageId: "p1", windowId: "w1", url: "https://example.test/article", documentEpoch: 4,
  sessionId: "profile-session", backend: "aux", controller: "human", ownedByRuntime: false, viewStatus: "visible" } as PageTarget;
const action: PageQuickAction = { pageId: page.pageId, windowId: page.windowId, url: page.url, topUrl: page.url,
  title: "Article", documentEpoch: 4, sessionId: page.sessionId, action: "explain", selection: "A selected paragraph.", truncated: false };
const input = () => ({ action, pages: [page], preferences: defaultSelectionCaptureSettings(), windowId: "w1", privateMode: false });

it("applies the chosen saved action to a reviewed draft with exact source identity", () => {
  const value = input();
  value.preferences.actions.push({ id: "custom", name: "Translate", enabled: true, template: "Translate into French:\n{text}" });
  value.action = { ...action, selectionActionId: "custom", truncated: true };
  const result = prepareSelectionActionDraft(value);
  expect(result).toMatchObject({ actionId: "custom", needsImage: false, source: { pageId: "p1", documentEpoch: 4, sessionId: "profile-session" } });
  expect(result.draft).toContain("Translate into French:");
  expect(result.draft).toContain("> A selected paragraph.");
  expect(result.draft).toContain("Selection truncated");
});

it.each([
  ["Private", { privateMode: true }],
  ["other window", { windowId: "w2" }],
  ["missing native routing", { action: { ...action, windowId: undefined } }],
  ["reloaded document", { action: { ...action, documentEpoch: 3 } }],
  ["missing epoch", { action: { ...action, documentEpoch: undefined } }],
  ["other Profile session", { action: { ...action, sessionId: "other-profile" } }],
  ["moved tab", { pages: [{ ...page, windowId: "w2" }] }],
  ["navigation", { pages: [{ ...page, url: "https://example.test/new" }] }],
  ["agent control", { pages: [{ ...page, controller: "agent" as const }] }],
] as const)("refuses %s without a fallback draft", (_label, patch) => {
  expect(() => prepareSelectionActionDraft({ ...input(), ...patch })).toThrow();
});

it("does not fall back when an action is disabled or removed", () => {
  const value = input();
  value.preferences.actions = value.preferences.actions.map(item => ({ ...item, enabled: false }));
  expect(() => prepareSelectionActionDraft(value)).toThrow("off or was removed");
  expect(() => prepareSelectionActionDraft({ ...input(), action: { ...action, selectionActionId: "missing" } })).toThrow("off or was removed");
});

it("requires actual captured bytes for image actions instead of fetching the image URL", () => {
  const value = { ...input(), action: { ...action, action: "image" as const, image: { srcURL: "https://example.test/photo.png" } } };
  expect(() => prepareSelectionActionDraft(value)).toThrow("image was not captured");
  const result = prepareSelectionActionDraft({ ...value, action: { ...value.action, image: { ...value.action.image, dataUrl: "data:image/png;base64,Zml4dHVyZQ==" } } });
  expect(result.needsImage).toBe(true);
  expect(result.draft).not.toContain("base64");
});
