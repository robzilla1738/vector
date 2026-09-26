import { describe, expect, it, vi } from "vitest";
import type { AuxBridge } from "./bridge";
import { parseVoiceCommand, runVoiceCommand } from "./voice-commands";

describe("reviewed voice commands", () => {
  it("accepts narrow browser phrases and leaves other speech as text", () => {
    expect(parseVoiceCommand("Hey Aux, go back.")).toBe("back");
    expect(parseVoiceCommand("Open a new tab!")).toBe("new_tab");
    expect(parseVoiceCommand("Close this tab and clear history")).toBeNull();
    expect(parseVoiceCommand("Send my password")).toBeNull();
  });

  it("targets only the current window's active page at the observed catalog version", async () => {
    const tabCommand = vi.fn(async () => ({
      commandId: "voice-command",
      status: "applied" as const,
      catalogVersion: 9,
    }));
    const host = {
      windowId: "current",
      tabsSnapshot: async () => ({
        version: 8,
        tabs: [],
        windows: [
          { windowId: "other", order: ["foreign"], activePageId: "foreign" },
          { windowId: "current", order: ["own"], activePageId: "own" },
        ],
      }),
      tabCommand,
    } as unknown as AuxBridge;
    await runVoiceCommand("close_tab", host);
    expect(tabCommand).toHaveBeenCalledWith({ kind: "close", pageId: "own" }, 8);
  });
});
