import { describe, expect, it } from "vitest";
import {
  acceleratorFor,
  bindingKey,
  bindingLabel,
  effectiveShortcuts,
  matchShortcut,
  SHORTCUTS,
  shortcutById,
  shortcutConflicts,
  ShortcutOverridesSchema,
} from "@aux/contracts";
import { pageShortcut, setPageShortcuts } from "../../apps/desktop/main/page-shortcuts.js";
import { popupCommand } from "../../apps/desktop/main/popup-commands.js";
import type { Input } from "electron";

const keydown = (key: string, mods: Partial<Input> = {}): Input =>
  ({ type: "keyDown", key, meta: false, control: false, shift: false, alt: false, isComposing: false, ...mods }) as Input;

const press = (key: string, mods: { meta?: boolean; ctrl?: boolean; shift?: boolean; alt?: boolean } = {}) =>
  ({ key, meta: !!mods.meta, ctrl: !!mods.ctrl, shift: !!mods.shift, alt: !!mods.alt });

describe("shortcut registry", () => {
  it("has unique ids and no default conflicts", () => {
    expect(new Set(SHORTCUTS.map(def => def.id)).size).toBe(SHORTCUTS.length);
    expect(shortcutConflicts(SHORTCUTS)).toEqual([]);
  });

  it("resolves every menu command id", () => {
    for (const id of [
      "new-tab", "new-window", "new-private-window", "open-file", "reopen-closed-tab",
      "close-tab", "close-window", "print", "save-pdf", "find", "find-next", "find-previous",
      "reload", "hard-reload", "actual-size", "zoom-in", "zoom-out", "reader", "sidebar",
      "overview", "devtools", "view-source", "back", "forward", "tab-next", "tab-previous",
      "history", "downloads", "bookmark", "bookmark-all", "quick-ask",
    ]) expect(shortcutById(id)).toBeTruthy();
  });
});

describe("matchShortcut", () => {
  it("normalizes arrow keys and case", () => {
    expect(matchShortcut(SHORTCUTS, press("ArrowLeft", { meta: true, alt: true }), { platform: "darwin" })?.id).toBe("tab-previous");
    expect(matchShortcut(SHORTCUTS, press("T", { meta: true }))?.id).toBe("new-tab");
  });

  it("treats Ctrl as command on win/linux and as ctrl on macOS", () => {
    const ctrlL = press("l", { ctrl: true });
    expect(matchShortcut(SHORTCUTS, ctrlL, { platform: "linux" })?.id).toBe("open-address");
    expect(matchShortcut(SHORTCUTS, ctrlL, { platform: "darwin" })).toBeUndefined();
    expect(matchShortcut(SHORTCUTS, press("l", { meta: true }), { platform: "darwin" })?.id).toBe("open-address");
  });

  it("requires an exact modifier map — extra modifiers do not match", () => {
    expect(matchShortcut(SHORTCUTS, press("t", { meta: true, alt: true }))).toBeUndefined();
    expect(matchShortcut(SHORTCUTS, press("t", { meta: true, shift: true }))?.id).toBe("reopen-closed-tab");
  });

  it("distinguishes shifted keys produced by the same physical key", () => {
    expect(matchShortcut(SHORTCUTS, press("]", { meta: true }))?.id).toBe("forward");
    expect(matchShortcut(SHORTCUTS, press("}", { meta: true, shift: true }))?.id).toBe("tab-next");
    expect(matchShortcut(SHORTCUTS, press("+", { meta: true, shift: true }))?.id).toBe("zoom-in");
  });

  it("gates platform-scoped bindings", () => {
    const altLeft = press("left", { alt: true });
    expect(matchShortcut(SHORTCUTS, altLeft, { platform: "linux" })?.id).toBe("back");
    expect(matchShortcut(SHORTCUTS, altLeft, { platform: "darwin" })).toBeUndefined();
  });
});

describe("overrides and conflicts", () => {
  it("replaces bindings and supports disabling a command", () => {
    const defs = effectiveShortcuts({ "new-tab": [{ key: "u", command: true }], "find": null });
    expect(shortcutById("new-tab", defs)?.bindings).toEqual([{ key: "u", command: true }]);
    expect(shortcutById("find", defs)?.bindings).toEqual([]);
    expect(matchShortcut(defs, press("u", { meta: true }))?.id).toBe("new-tab");
    expect(matchShortcut(defs, press("t", { meta: true }))).toBeUndefined();
  });

  it("ignores unknown command ids in overrides", () => {
    const defs = effectiveShortcuts({ "no-such-command": [{ key: "z", command: true }] });
    expect(defs).toHaveLength(SHORTCUTS.length);
  });

  it("reports colliding chords with the commands involved", () => {
    const defs = effectiveShortcuts({ "print": [{ key: "t", command: true }] });
    const conflicts = shortcutConflicts(defs);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.commands.map(def => def.id).sort()).toEqual(["new-tab", "print"]);
    expect(bindingKey(conflicts[0]!.binding)).toBe(bindingKey({ key: "t", command: true }));
  });

  it("keeps platform-scoped chords out of same-platform conflicts", () => {
    const defs = effectiveShortcuts({ "settings": [{ key: "left", alt: true }] });
    expect(shortcutConflicts(defs)).toEqual([]);
  });

  it("rejects malformed overrides", () => {
    expect(ShortcutOverridesSchema.safeParse({ "new-tab": "Cmd+T" }).success).toBe(false);
    expect(ShortcutOverridesSchema.safeParse({ "new-tab": [{ key: "" }] }).success).toBe(false);
    expect(ShortcutOverridesSchema.safeParse({ "new-tab": Array(5).fill({ key: "t" }) }).success).toBe(false);
    expect(ShortcutOverridesSchema.safeParse({ "new-tab": [{ key: "u", command: true }], "find": null }).success).toBe(true);
  });
});

describe("accelerators and labels", () => {
  it("renders Electron accelerators and platform labels from one binding", () => {
    const binding = shortcutById("quick-ask")!.bindings[0]!;
    expect(acceleratorFor(binding)).toBe("CmdOrCtrl+Shift+Space");
    expect(bindingLabel(binding, "darwin")).toBe("⌘⇧Space");
    expect(bindingLabel(binding, "linux")).toBe("Ctrl+Shift+Space");
    expect(acceleratorFor({ key: "left", alt: true })).toBe("Alt+Left");
  });
});

describe("page interception", () => {
  it("intercepts browser commands and tags the resolved command", () => {
    const hit = pageShortcut(keydown("t", { meta: true }), "darwin");
    expect(hit?.commandId).toBe("new-tab");
    expect(hit?.meta).toBe(true);
    expect(pageShortcut(keydown("w", { meta: true }), "darwin")?.commandId).toBe("close-tab");
  });

  it("leaves editing chords and non-keydown input to the page", () => {
    expect(pageShortcut(keydown("c", { meta: true }), "darwin")).toBeNull();
    expect(pageShortcut(keydown("t", { meta: true, isComposing: true }), "darwin")).toBeNull();
    expect(pageShortcut({ ...keydown("t", { meta: true }), type: "keyUp" }, "darwin")).toBeNull();
    expect(pageShortcut(keydown(""), "darwin")).toBeNull();
  });

  it("maps Ctrl+Tab to tab cycling on every platform", () => {
    const darwin = pageShortcut(keydown("Tab", { control: true }), "darwin");
    expect(darwin?.commandId).toBe("tab-next");
    expect(darwin?.ctrl).toBe(true);
    const linux = pageShortcut(keydown("Tab", { control: true }), "linux");
    expect(linux?.commandId).toBe("tab-next");
    expect(linux?.meta).toBe(true);
  });

  it("intercepts Alt+arrows only on win/linux", () => {
    expect(pageShortcut(keydown("ArrowLeft", { alt: true }), "linux")?.commandId).toBe("back");
    expect(pageShortcut(keydown("ArrowLeft", { alt: true }), "darwin")).toBeNull();
  });

  it("follows overrides pushed by the renderer", () => {
    setPageShortcuts(effectiveShortcuts({ "new-tab": [{ key: "u", command: true }] }));
    try {
      expect(pageShortcut(keydown("u", { meta: true }), "darwin")?.commandId).toBe("new-tab");
      expect(pageShortcut(keydown("t", { meta: true }), "darwin")).toBeNull();
    } finally {
      setPageShortcuts(SHORTCUTS);
    }
  });

  it("menu accelerator, page interception and renderer matching share the registry", () => {
    const binding = shortcutById("hard-reload")!.bindings[0]!;
    expect(acceleratorFor(binding)).toBe("CmdOrCtrl+Shift+R");
    expect(pageShortcut(keydown("r", { meta: true, shift: true }), "darwin")?.commandId).toBe("hard-reload");
    expect(matchShortcut(SHORTCUTS, press("r", { meta: true, shift: true }), { platform: "darwin" })?.id).toBe("hard-reload");
  });
});

describe("popup commands", () => {
  const fakePopup = () => {
    const calls: string[] = [];
    const win = {
      isDestroyed: () => false,
      close: () => { calls.push("close"); },
      webContents: {
        navigationHistory: { canGoBack: () => true, canGoForward: () => false, goBack: () => { calls.push("back"); }, goForward: () => { calls.push("forward"); } },
        reload: () => { calls.push("reload"); },
        reloadIgnoringCache: () => { calls.push("reloadIgnoringCache"); },
        print: () => { calls.push("print"); },
        setZoomLevel: () => { calls.push("zoom"); },
        getZoomLevel: () => 0,
      },
    };
    return { win, calls };
  };

  it("honors a resolved command id even when the chord is custom", () => {
    const { win, calls } = fakePopup();
    const rebound: Parameters<typeof popupCommand>[1] = { key: "b", meta: true, shift: false, alt: false, commandId: "back" };
    expect(popupCommand(win as never, rebound)).toBe(true);
    expect(calls).toEqual(["back"]);
  });

  it("keeps chord behavior for events without a command id", () => {
    const { win, calls } = fakePopup();
    expect(popupCommand(win as never, { key: "w", meta: true, shift: false, alt: false })).toBe(true);
    expect(calls).toEqual(["close"]);
    expect(popupCommand(win as never, { key: "r", meta: true, shift: true, alt: false })).toBe(true);
    expect(calls).toEqual(["close", "reloadIgnoringCache"]);
  });
});
