import {
  PageQuickActionSchema,
  readSelectionCaptureSettings,
  renderSelectionTemplate,
  type PageContextRef,
  type PageQuickAction,
  type PageTarget,
} from "@aux/contracts";
import { sourceRef } from "./browser-context-sources";

/** Called before creating a chat or attaching an image. Never sends a message. */
export function prepareSelectionActionDraft(input: {
  action: PageQuickAction;
  pages: readonly PageTarget[];
  preferences: unknown;
  windowId: string;
  privateMode: boolean;
}): { draft: string; source: PageContextRef; actionId: string; needsImage: boolean } {
  if (input.privateMode) throw new Error("Selection actions are unavailable in Private windows.");
  const action = PageQuickActionSchema.parse(input.action);
  if (!input.windowId || action.windowId !== input.windowId)
    throw new Error("This selection belongs to another window. Select it again in this window.");
  const page = input.pages.find((value) => value.pageId === action.pageId);
  if (
    !page ||
    page.windowId !== input.windowId ||
    !action.topUrl ||
    action.topUrl !== page.url ||
    action.documentEpoch !== page.documentEpoch ||
    action.sessionId !== page.sessionId ||
    page.loading ||
    page.ownedByRuntime ||
    page.controller === "agent" ||
    page.controller === "external" ||
    ["crashed", "detached"].includes(page.viewStatus ?? "")
  )
    throw new Error("The selected document changed. Select its content again before opening a draft.");
  const url = new URL(action.url),
    top = new URL(action.topUrl);
  if (
    ![url, top].every(
      (value) => ["http:", "https:"].includes(value.protocol) && !value.username && !value.password,
    ) ||
    url.href.length > 8192 ||
    top.href.length > 8192
  )
    throw new Error("Selection actions require a current web page.");
  if (action.action === "remember") throw new Error("Review Remember selections in Memory settings.");
  const actionId = action.selectionActionId ?? action.action;
  const preference = readSelectionCaptureSettings(input.preferences).actions.find(
    (value) => value.id === actionId,
  );
  if (!preference?.enabled)
    throw new Error("This selection action is off or was removed. Review Selection & Capture settings.");
  const needsImage = preference.template.includes("{image}");
  // An image URL is not a captured image and must not trigger a remote fetch.
  if (needsImage && (!action.image?.dataUrl || action.image.captureError))
    throw new Error("The image was not captured. Capture it again before opening this action.");
  const text = renderSelectionTemplate(preference.template, {
    text: action.selection,
    image: needsImage ? action.image?.altText || "Attached page image" : undefined,
  });
  const title = action.title.slice(0, 300).replace(/[\p{Cc}\p{Cf}]/gu, " ");
  const sourceLine = `Source: ${title || top.href}\n${top.href}${url.href !== top.href ? `\nSelected frame: ${url.href}` : ""}`;
  return {
    actionId,
    needsImage,
    source: sourceRef(page, action.capturedAt ?? Date.now()),
    draft: `${text}\n\n${sourceLine}${action.truncated ? "\nSelection truncated to the first 12,000 characters." : ""}`,
  };
}
