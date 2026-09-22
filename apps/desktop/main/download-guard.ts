import { dialog, type BaseWindow, type DownloadItem } from "electron";
import { rmSync } from "node:fs";

/**
 * Local download protection — deliberately NOT a Safe Browsing clone: there is
 * no remote reputation lookup. What Aux can guarantee locally is an informed,
 * explicit decision before a file that can run code (or arrived unencrypted)
 * lands on disk.
 */

/** Extensions whose contents can execute code or install software. */
const DANGEROUS_EXTENSIONS = new Set([
  "exe", "msi", "msp", "scr", "com", "pif", "gadget",
  "bat", "cmd", "vbs", "vbe", "js", "jse", "wsf", "wsh", "ps1", "psm1", "reg", "hta", "inf", "scf", "lnk", "url",
  "jar", "jnlp", "apk", "aab", "xapk",
  "dmg", "pkg", "app", "command", "workflow",
  "deb", "rpm", "run", "sh", "bash", "zsh",
  "crx", "xpi", "dll", "cpl", "sys", "drv",
  "chm", "mht", "mhtml",
  "iso", "img", "vhd", "vhdx",
  "appimage", "flatpak", "snap",
]);

export type DownloadWarning = "executable" | "insecure";

/** Why a download needs an explicit keep/discard decision, if it does. */
export function downloadWarning(filename: string, sourceUrl: string | undefined): DownloadWarning | undefined {
  const ext = /\.([^.\\/]+)$/.exec(filename.trim())?.[1]?.toLowerCase() ?? "";
  if (DANGEROUS_EXTENSIONS.has(ext)) return "executable";
  try {
    if (sourceUrl && new URL(sourceUrl).protocol === "http:") return "insecure";
  } catch { /* unknown source — no scheme-based warning */ }
  return undefined;
}

const WARNING_COPY: Record<DownloadWarning, { title: string; detail: (filename: string, origin: string) => string }> = {
  executable: {
    title: "This file can run code on this computer",
    detail: (filename, origin) => `${filename} is the kind of file that can install or run software. Only keep it if you expected this download and trust ${origin}.`,
  },
  insecure: {
    title: "This download is not encrypted",
    detail: (filename, origin) => `${filename} is downloading over an unencrypted connection from ${origin}, so the file could have been changed in transit.`,
  },
};

/**
 * Pauses the item and asks the user. Resolves `true` to keep (item resumed),
 * `false` to discard (item cancelled and its partial file removed).
 */
export async function confirmDownload(win: BaseWindow, item: DownloadItem, filename: string, sourceUrl: string | undefined, warning: DownloadWarning): Promise<boolean> {
  let origin = sourceUrl ?? "the page";
  try { if (sourceUrl) origin = new URL(sourceUrl).origin; } catch { /* keep raw url */ }
  item.pause();
  try {
    const copy = WARNING_COPY[warning];
    const { response } = await dialog.showMessageBox(win, {
      type: "warning",
      title: copy.title,
      message: copy.title,
      detail: copy.detail(filename, origin),
      buttons: ["Discard file", "Keep anyway"],
      defaultId: 0, cancelId: 0, noLink: true,
    });
    if (response === 1) {
      item.resume();
      return true;
    }
  } catch { /* window closed mid-choice → treat as discard */ }
  try { item.cancel(); } catch { /* already finished */ }
  try { if (item.getSavePath()) rmSync(item.getSavePath(), { force: true }); } catch { /* partial file cleanup best-effort */ }
  return false;
}
