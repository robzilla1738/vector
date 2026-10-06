import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Reads Chromium-family "Bookmarks" JSON files (Chrome, Chromium, Edge —
 * same format on macOS and Linux). No decryption is needed: bookmarks are
 * stored plaintext, unlike the Cookies/Login Data stores. Safari uses a
 * plist and is a separate importer.
 */

const CHROMIUM_DIRS = [
  join(homedir(), "Library/Application Support/Google/Chrome"),
  join(homedir(), "Library/Application Support/Google/Chrome Beta"),
  join(homedir(), "Library/Application Support/Chromium"),
  join(homedir(), "Library/Application Support/Microsoft Edge"),
  join(homedir(), ".config/google-chrome"),
  join(homedir(), ".config/google-chrome-beta"),
  join(homedir(), ".config/chromium"),
  join(homedir(), ".config/microsoft-edge"),
];

const ROOT_LABELS: Record<string, string> = {
  bookmark_bar: "Bookmarks bar",
  other: "Other bookmarks",
  synced: "Mobile bookmarks",
};

interface ChromeNode {
  type?: string;
  name?: string;
  url?: string;
  children?: ChromeNode[];
}

export interface ImportedBookmark {
  url: string;
  title: string;
  folderPath: string[];
}

export function readChromeBookmarksFile(path: string): ImportedBookmark[] {
  const parsed = JSON.parse(readFileSync(path, "utf8")) as { roots?: Record<string, ChromeNode> };
  const out: ImportedBookmark[] = [];
  const seen = new Set<string>();
  const walk = (node: ChromeNode | undefined, folderPath: string[]) => {
    if (!node || !Array.isArray(node.children)) return;
    for (const child of node.children) {
      if (
        child.type === "url" &&
        typeof child.url === "string" &&
        /^https?:\/\//.test(child.url) &&
        child.url.length <= 8192 &&
        !seen.has(child.url)
      ) {
        seen.add(child.url);
        out.push({
          url: child.url,
          title: typeof child.name === "string" ? child.name.slice(0, 1000) : "",
          folderPath,
        });
      } else if (child.type === "folder") {
        walk(child, [
          ...folderPath,
          (typeof child.name === "string" && child.name.slice(0, 200)) || "Folder",
        ]);
      }
    }
  };
  for (const [rootKey, label] of Object.entries(ROOT_LABELS)) walk(parsed.roots?.[rootKey], [label]);
  return out;
}

/** Locates every profile directory that has a Bookmarks store, or one named profile. */
export function chromeBookmarkFiles(profile?: string): { profile: string; path: string }[] {
  const dir = CHROMIUM_DIRS.find((d) => existsSync(d));
  if (!dir) return [];
  let names: string[];
  try {
    names = readdirSync(dir).filter(
      (p) => (p === "Default" || /^Profile \d+$/.test(p)) && existsSync(join(dir, p, "Bookmarks")),
    );
  } catch {
    return [];
  }
  if (profile) names = names.filter((p) => p === profile);
  return names.map((p) => ({ profile: p, path: join(dir, p, "Bookmarks") }));
}
