import { originOfAddress } from "@aux/contracts";
import { dialog } from "electron";
import { registry } from "../app/services.js";
import { captureLoginScript, credentialFillScript } from "../credential-fill.js";
import { channel, requireRuntime, runtimeInvoke } from "../runtime/supervisor.js";
import { broadcastToShells, shellForPage } from "../windows/registry.js";

// ---------- vault: human credential fill + save/update offers ----------

/** Submitted credentials held briefly so a login that navigates away can still be saved. */
export const pendingVaultSaves = new Map<string, { pageId: string; username: string; password: string; origin: string; itemId?: string; timer: NodeJS.Timeout }>();

export async function noteCredentialOffer(pageId: string, offer: { username: string; origin: string }) {
  const entry = registry.get(pageId);
  const wc = entry?.view.webContents;
  if (!entry || !wc || wc.isDestroyed() || !channel) return;
  const origin = originOfAddress(offer.origin);
  if (!origin) return;
  try {
    const status = await runtimeInvoke("vault.status") as { configured?: boolean; locked?: boolean };
    if (!status.configured) return;
    const items = await runtimeInvoke("vault.itemsForOrigin", { origin }) as { itemId: string; username?: string }[];
    // Capture now: a submit that navigates immediately would otherwise lose the
    // fields. The form may live in a subframe (embedded auth widgets) — capture
    // in the reporting frame when we can find it.
    const frame = wc.mainFrame.framesInSubtree.find(f => originOfAddress(f.url) === origin) ?? wc.mainFrame;
    const captured = await frame.executeJavaScript(captureLoginScript(), true) as { username: string; password: string } | null;
    if (!captured?.password) return;
    const existing = items.find(item => item.username && item.username === (captured.username || offer.username));
    // An unchanged credential is a successful sign-in, not an update.
    if (existing && !status.locked) {
      const same = await runtimeInvoke("vault.secretMatches", { itemId: existing.itemId, secret: captured.password }) as { matches?: boolean };
      if (same?.matches) return;
    }
    const key = `${pageId}:${origin}`;
    const prior = pendingVaultSaves.get(key);
    if (prior) clearTimeout(prior.timer);
    pendingVaultSaves.set(key, {
      pageId, username: captured.username || offer.username, password: captured.password, origin, itemId: existing?.itemId,
      timer: setTimeout(() => pendingVaultSaves.delete(key), 5 * 60_000),
    });
    const payload = { pageId, username: captured.username || offer.username, origin, kind: existing ? "update" as const : "save" as const, itemId: existing?.itemId, locked: !!status.locked };
    const shell = shellForPage(pageId);
    if (shell && !shell.webContents.isDestroyed()) shell.webContents.send("vault.saveOffer", payload);
    else broadcastToShells("vault.saveOffer", payload);
  } catch { /* vault unavailable or frame gone — no offer */ }
}

export async function runVaultFill(pageId: string, frame: Electron.WebFrameMain, itemId: string) {
  try {
    requireRuntime("The browser runtime is not connected yet.");
    const entry = registry.get(pageId);
    const url = entry?.view.webContents.isDestroyed() ? "" : entry?.view.webContents.getURL() ?? "";
    // Validate the frame being filled — the credential lookup keyed on this
    // frame's origin, and a subframe auth widget may differ from the top page.
    const origin = originOfAddress(frame.url || url);
    if (!origin) throw new Error("Credentials can only fill on an http(s) page.");
    const credential = await runtimeInvoke("vault.fill", { itemId, pageId, origin }) as { username?: string; secret: string };
    const filled = await frame.executeJavaScript(credentialFillScript(credential), true) as number;
    if (!filled) void dialog.showMessageBox({ type: "info", title: "Sign-in", message: "Aux couldn’t find a sign-in form on this page.", detail: "Fill works on a visible username + password form.", buttons: ["OK"] });
  } catch (error) {
    void dialog.showMessageBox({ type: "info", title: "Sign-in", message: "Aux couldn’t fill this credential.", detail: error instanceof Error ? error.message : String(error), buttons: ["OK"] });
  }
}
