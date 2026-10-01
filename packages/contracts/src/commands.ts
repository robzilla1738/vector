import type { AuxFeature } from "./aux-features.js";
import type { ShortcutBinding, ShortcutCommandDef } from "./shortcut-defs.js";

export interface CommandDef extends ShortcutCommandDef {
  section: "Tabs" | "Page" | "Windows" | "Layout" | "Agent" | "Application" | "Developer";
  keywords?: readonly string[];
  handler: "shell" | "native";
  feature?: AuxFeature;
  focusShell?: boolean;
  palette?: boolean;
  windows?: readonly ("normal" | "private" | "little" | "quick-ask")[];
}

const B = (key: string, options: Omit<ShortcutBinding, "key"> = {}): ShortcutBinding => ({ key, ...options });
const Numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const COMMANDS = [
  { id: "extension-action", label: "Open extension action", section: "Application", handler: "shell", feature: "extensions", focusShell: true, palette: false, windows: ["normal"], bindings: [] },
  { id: "pin-extension-action", label: "Pin or unpin extension action", section: "Application", handler: "shell", feature: "extensions", focusShell: true, palette: false, windows: ["normal"], bindings: [] },
  { id: "show-extensions", label: "Manage extensions", section: "Application", handler: "shell", feature: "extensions", focusShell: true, palette: true, windows: ["normal"], bindings: [] },
  { id: "close-extension-panel", label: "Close extension side panel", section: "Application", handler: "shell", feature: "extensions", focusShell: true, palette: false, windows: ["normal"], bindings: [] },
  { id: "set-extension-command-shortcut", label: "Change extension shortcut", section: "Application", handler: "shell", feature: "extensions", focusShell: true, palette: false, windows: ["normal"], bindings: [] },
  { id: "install-store-extension", label: "Install Chrome Web Store extension", section: "Application", handler: "shell", feature: "extensions", focusShell: true, palette: false, windows: ["normal"], bindings: [] },
  { id: "install-unpacked-extension", label: "Install unpacked extension", section: "Application", handler: "shell", feature: "extensions", focusShell: true, palette: false, windows: ["normal"], bindings: [] },
  { id: "update-extension", label: "Update extension", section: "Application", handler: "shell", feature: "extensions", focusShell: true, palette: false, windows: ["normal"], bindings: [] },
  { id: "reload-extension", label: "Restart extension", section: "Application", handler: "shell", feature: "extensions", focusShell: true, palette: false, windows: ["normal"], bindings: [] },
  { id: "set-extension-enabled", label: "Enable or disable extension", section: "Application", handler: "shell", feature: "extensions", focusShell: true, palette: false, windows: ["normal"], bindings: [] },
  { id: "remove-extension", label: "Remove extension", section: "Application", handler: "shell", feature: "extensions", focusShell: true, palette: false, windows: ["normal"], bindings: [] },
  { id: "claim-tab", label: "Bring this tab here", section: "Windows", handler: "shell", feature: "windowSync", windows: ["normal"], bindings: [] },
  { id: "show-tab-window", label: "Show this tab's window", section: "Windows", handler: "shell", feature: "windowSync", windows: ["normal"], bindings: [] },
  { id: "little-space-picker", label: "Choose destination Space", section: "Windows", handler: "shell", feature: "littleWindow", windows: ["little"], bindings: [] },
  { id: "little-downloads", label: "Downloads for this page", section: "Windows", handler: "shell", feature: "littleWindow", windows: ["little"], bindings: [] },
  { id: "set-external-link-target", label: "Choose where external links open", section: "Windows", handler: "shell", feature: "littleWindow", palette: false, bindings: [] },
  { id: "focus-profile-space", label: "Open Profile Space", section: "Windows", handler: "shell", feature: "profiles", focusShell: true, palette: false, windows: ["normal"], bindings: [] },
  { id: "move-tab-to-profile", label: "Move tab to Profile", section: "Windows", handler: "shell", feature: "profiles", focusShell: true, palette: false, windows: ["normal"], bindings: [] },
  { id: "show-profiles", label: "Manage Profiles", section: "Application", handler: "shell", feature: "profiles", focusShell: true, windows: ["normal"], bindings: [] },
  { id: "show-link-routing", label: "Manage link routing", section: "Application", handler: "shell", feature: "linkRouting", focusShell: true, windows: ["normal"], bindings: [] },
  { id: "minimal-ui", label: "Minimal UI", section: "Layout", handler: "shell", feature: "minimalUi", focusShell: true, bindings: [B("b", { command: true, shift: true })], intercept: true },
  { id: "pin-tab", label: "Pin or unpin tab", section: "Tabs", handler: "shell", feature: "pinnedApps", focusShell: true, bindings: [B("d", { command: true, shift: true })], intercept: true },
  { id: "little-window", label: "New Little window", section: "Windows", handler: "shell", feature: "littleWindow", focusShell: true, bindings: [B("n", { command: true, alt: true })], intercept: true },
  { id: "promote-tab", label: "Open in main window", section: "Windows", handler: "shell", feature: "littleWindow", focusShell: true, bindings: [B("o", { command: true, alt: true })], intercept: true },
  { id: "picture-in-picture", label: "Picture in picture", section: "Page", handler: "shell", feature: "pictureInPicture", focusShell: true, bindings: [B("p", { ctrl: true, command: true })], intercept: true },
  { id: "copy-url", label: "Copy URL", section: "Page", handler: "shell", focusShell: true, bindings: [B("c", { command: true, shift: true })], intercept: true },
  { id: "split-add", label: "Split with\u2026", section: "Layout", handler: "shell", feature: "splitView", focusShell: true, bindings: [B("=", { ctrl: true, shift: true }), B("+", { ctrl: true, shift: true })], intercept: true },
  { id: "split-close", label: "Close split pane", section: "Layout", handler: "shell", feature: "splitView", focusShell: true, bindings: [B("-", { ctrl: true, shift: true }), B("_", { ctrl: true, shift: true })], intercept: true },
  { id: "split-next", label: "Focus next split pane", section: "Layout", handler: "shell", feature: "splitView", focusShell: true, bindings: [B("]", { ctrl: true, shift: true }), B("}", { ctrl: true, shift: true })], intercept: true },
  { id: "split-previous", label: "Focus previous split pane", section: "Layout", handler: "shell", feature: "splitView", focusShell: true, bindings: [B("[", { ctrl: true, shift: true }), B("{", { ctrl: true, shift: true })], intercept: true },
  { id: "split-swap", label: "Swap split sides", section: "Layout", handler: "shell", feature: "splitView", focusShell: true, bindings: [B("\\", { ctrl: true, shift: true }), B("|", { ctrl: true, shift: true })], intercept: true },
  { id: "split-flip", label: "Flip split layout", section: "Layout", handler: "shell", feature: "splitView", focusShell: true, bindings: [B("o", { ctrl: true, shift: true })], intercept: true },
  { id: "split-separate", label: "Separate split tabs", section: "Layout", handler: "shell", feature: "splitView", focusShell: true, windows: ["normal", "private"], bindings: [] },
  { id: "split-resize", label: "Resize split divider", section: "Layout", handler: "shell", feature: "splitView", focusShell: true, palette: false, windows: ["normal", "private"], bindings: [] },
  { id: "mute-tab", label: "Mute or unmute tab", section: "Page", handler: "shell", focusShell: true, bindings: [] },
  { id: "new-tab", focusShell: true, section: "Tabs", handler: "shell", label: "New Tab", bindings: [B("t", { command: true })], intercept: true },
  { id: "new-window", section: "Windows", handler: "native", label: "New Window", bindings: [B("n", { command: true })] },
  { id: "new-private-window", section: "Windows", handler: "native", label: "New Private Window", bindings: [B("n", { command: true, shift: true })] },
  { id: "open-file", section: "Tabs", handler: "shell", label: "Open File…", bindings: [B("o", { command: true })], intercept: true },
  { id: "reopen-closed-tab", section: "Tabs", handler: "shell", label: "Reopen Closed Tab", bindings: [B("t", { command: true, shift: true })], intercept: true },
  { id: "close-tab", section: "Tabs", handler: "shell", label: "Close Tab", bindings: [B("w", { command: true })], intercept: true },
  { id: "close-window", section: "Windows", handler: "shell", label: "Close Window", bindings: [B("w", { command: true, shift: true })], intercept: true },
  { id: "print", section: "Page", handler: "shell", label: "Print…", bindings: [B("p", { command: true })], intercept: true },
  { id: "save-pdf", section: "Page", handler: "shell", label: "Save Page as PDF…", bindings: [B("p", { command: true, shift: true })], intercept: true },
  { id: "quick-ask", section: "Agent", handler: "shell", label: "Quick Ask", bindings: [B(" ", { command: true, shift: true })] },
  { id: "find", section: "Page", handler: "shell", label: "Find…", bindings: [B("f", { command: true })], intercept: true },
  { id: "find-next", section: "Page", handler: "shell", label: "Find Next", bindings: [B("g", { command: true })], intercept: true },
  { id: "find-previous", section: "Page", handler: "shell", label: "Find Previous", bindings: [B("g", { command: true, shift: true })], intercept: true },
  { id: "reload", section: "Page", handler: "shell", label: "Reload", bindings: [B("r", { command: true })], intercept: true },
  { id: "hard-reload", section: "Page", handler: "shell", label: "Hard Reload", bindings: [B("r", { command: true, shift: true })], intercept: true },
  { id: "actual-size", section: "Page", handler: "shell", label: "Actual Size", bindings: [B("0", { command: true })], intercept: true },
  {
    id: "zoom-in", section: "Page", handler: "shell", label: "Zoom In", intercept: true,
    // `+` is Shift+= on US layouts — the shifted variants are the same chord.
    bindings: [B("=", { command: true }), B("=", { command: true, shift: true }), B("+", { command: true }), B("+", { command: true, shift: true })],
  },
  {
    id: "zoom-out", section: "Page", handler: "shell", label: "Zoom Out", intercept: true,
    bindings: [B("-", { command: true }), B("-", { command: true, shift: true }), B("_", { command: true }), B("_", { command: true, shift: true })],
  },
  { id: "reader", section: "Page", handler: "shell", label: "Reader View", bindings: [B("r", { command: true, alt: true })], intercept: true },
  { id: "sidebar", section: "Layout", handler: "shell", label: "Toggle Sidebar", bindings: [B("s", { command: true })], intercept: true },
  { id: "sidebar-hide", section: "Layout", handler: "shell", label: "Hide Sidebar", bindings: [], palette: false, windows: ["normal", "private"] },
  { id: "overview", section: "Layout", handler: "shell", label: "Tab Overview", bindings: [B("o", { command: true, shift: true })], intercept: true },
  { id: "devtools", section: "Developer", handler: "shell", label: "Developer Tools", bindings: [B("i", { command: true, alt: true })], intercept: true },
  { id: "inspect-element", section: "Developer", handler: "shell", label: "Inspect Element", bindings: [B("c", { command: true, alt: true })], intercept: true },
  { id: "view-source", section: "Developer", handler: "shell", label: "View Source", bindings: [B("u", { command: true, alt: true })], intercept: true },
  { id: "back", section: "Page", handler: "shell", label: "Back", bindings: [B("[", { command: true }), B("left", { alt: true, platforms: ["win32", "linux"] })], intercept: true },
  { id: "forward", section: "Page", handler: "shell", label: "Forward", bindings: [B("]", { command: true }), B("right", { alt: true, platforms: ["win32", "linux"] })], intercept: true },
  { id: "open-address", focusShell: true, section: "Page", handler: "shell", label: "Open Address", bindings: [B("l", { command: true }), B("e", { command: true })], intercept: true },
  { id: "palette", focusShell: true, section: "Application", handler: "shell", label: "Command Palette", bindings: [B("k", { command: true })], intercept: true },
  { id: "settings", focusShell: true, section: "Application", handler: "shell", label: "Settings", bindings: [B(",", { command: true })], intercept: true },
  { id: "history", section: "Application", handler: "shell", label: "History", bindings: [B("y", { command: true })], intercept: true },
  { id: "downloads", section: "Application", handler: "shell", label: "Downloads", bindings: [B("j", { command: true, shift: true })], intercept: true },
  { id: "bookmark", section: "Tabs", handler: "shell", label: "Bookmark This Page", bindings: [B("d", { command: true })], intercept: true },
  { id: "bookmark-all", section: "Tabs", handler: "shell", label: "Bookmark All Tabs", bindings: [], intercept: true },
  { id: "agent-rail", section: "Agent", handler: "shell", label: "Toggle Agent Rail", bindings: [B("a", { command: true, shift: true })], intercept: true },
  { id: "clear-history", section: "Application", handler: "shell", label: "Clear History", bindings: [B("backspace", { command: true, shift: true })], intercept: true },
  {
    id: "tab-next", section: "Tabs", handler: "shell", label: "Next Tab", intercept: true,
    bindings: [
      B("right", { command: true, alt: true }),
      B("]", { command: true, shift: true }), B("}", { command: true, shift: true }),
      B("tab", { ctrl: true }), B("tab", { command: true, platforms: ["win32", "linux"] }),
    ],
  },
  {
    id: "tab-previous", section: "Tabs", handler: "shell", label: "Previous Tab", intercept: true,
    bindings: [
      B("left", { command: true, alt: true }),
      B("[", { command: true, shift: true }), B("{", { command: true, shift: true }),
      B("tab", { ctrl: true, shift: true }), B("tab", { command: true, shift: true, platforms: ["win32", "linux"] }),
    ],
  },
  ...Numbers.map(n => ({
    id: `tab-${n}` as const, label: n === 9 ? "Last Tab" : `Switch to Tab ${n}`,
    section: "Tabs", handler: "shell", bindings: [B(String(n), { command: true })], intercept: true,
  } as const)),
  ...Numbers.map(n => ({
    id: `space-${n}` as const, label: `Switch to Space ${n}`, section: "Layout", handler: "shell", feature: "spaces",
    focusShell: true, bindings: [B(String(n), { ctrl: true })], intercept: true,
  } as const)),
  ...Numbers.map(n => ({
    id: `profile-${n}` as const, label: `Switch to Profile ${n}`, section: "Windows", handler: "shell", feature: "profiles",
    focusShell: true, bindings: [B(String(n), { ctrl: true, alt: true })], intercept: true,
  } as const)),
  { id: "reset-pinned-app", label: "Reset to pinned URL", section: "Tabs", handler: "shell", feature: "pinnedApps", palette: false, windows: ["normal"], bindings: [] },
  { id: "toggle-pin-keep-awake", label: "Keep pinned app awake", section: "Tabs", handler: "shell", feature: "pinnedApps", palette: false, windows: ["normal"], bindings: [] },
  { id: "open-pinned-app", label: "Open pinned app", section: "Tabs", handler: "shell", feature: "pinnedApps", palette: false, windows: ["normal"], bindings: [] },
  { id: "pin-open-new-tab", label: "Open pinned URL in new tab", section: "Tabs", handler: "shell", feature: "pinnedApps", palette: false, windows: ["normal"], bindings: [] },
  { id: "pin-open-background", label: "Open pinned URL in background", section: "Tabs", handler: "shell", feature: "pinnedApps", palette: false, windows: ["normal"], bindings: [] },
  { id: "pin-copy-url", label: "Copy pinned URL", section: "Tabs", handler: "shell", feature: "pinnedApps", palette: false, windows: ["normal"], bindings: [] },
  { id: "pin-reorder", label: "Move pinned app", section: "Tabs", handler: "shell", feature: "pinnedApps", palette: false, windows: ["normal"], bindings: [] },
  { id: "pin-unpin", label: "Unpin app from Space", section: "Tabs", handler: "shell", feature: "pinnedApps", palette: false, windows: ["normal"], bindings: [] },
  { id: "clear-today", label: "Clear Today", section: "Tabs", handler: "shell", feature: "archive", windows: ["normal"], bindings: [] },
  { id: "make-live-folder", label: "Make live folder…", section: "Tabs", handler: "shell", feature: "liveFolders", palette: false, windows: ["normal"], bindings: [] },
  { id: "refresh-live-folder", label: "Refresh live folder", section: "Tabs", handler: "shell", feature: "liveFolders", palette: false, windows: ["normal"], bindings: [] },
  { id: "open-live-folder-item", label: "Open live folder item", section: "Tabs", handler: "shell", feature: "liveFolders", palette: false, windows: ["normal"], bindings: [] },
  { id: "connect-github", label: "Connect GitHub", section: "Tabs", handler: "shell", feature: "liveFolders", palette: false, windows: ["normal"], bindings: [] },
  { id: "revoke-github", label: "Disconnect GitHub", section: "Tabs", handler: "shell", feature: "liveFolders", palette: false, windows: ["normal"], bindings: [] },
  { id: "archive-restore", label: "Restore archived tab", section: "Tabs", handler: "shell", feature: "archive", palette: false, windows: ["normal"], bindings: [] },
  { id: "archive-restore-all", label: "Restore all archived tabs", section: "Tabs", handler: "shell", feature: "archive", windows: ["normal"], bindings: [] },
  { id: "archive-delete", label: "Delete archived tab", section: "Tabs", handler: "shell", feature: "archive", palette: false, windows: ["normal"], bindings: [] },
  { id: "archive-undo", label: "Undo archived tabs", section: "Tabs", handler: "shell", feature: "archive", palette: false, windows: ["normal"], bindings: [] },
  { id: "acknowledge-auto-archive", label: "Acknowledge auto-archive", section: "Tabs", handler: "shell", feature: "autoArchive", palette: false, windows: ["normal"], bindings: [] },
  { id: "configure-auto-archive", label: "Change auto-archive policy", section: "Tabs", handler: "shell", feature: "autoArchive", windows: ["normal"], bindings: [] },
  { id: "save-live-folder", label: "Save live folder", section: "Tabs", handler: "shell", feature: "liveFolders", windows: ["normal"], palette: false, bindings: [] },
  { id: "set-auto-archive-policy", label: "Set auto-archive policy", section: "Tabs", handler: "shell", feature: "autoArchive", windows: ["normal"], palette: false, bindings: [] },
  { id: "show-archived-tabs", label: "Show archived tabs", section: "Tabs", handler: "shell", feature: "archive", bindings: [] },
] as const satisfies readonly CommandDef[];


export type ShellCommandId = Extract<(typeof COMMANDS)[number], { handler: "shell" }>["id"];
export type NativeCommandId = Extract<(typeof COMMANDS)[number], { handler: "native" }>["id"];
