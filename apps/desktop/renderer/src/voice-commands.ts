import type { AuxBridge } from "./bridge";
import type { TabCommandAck } from "@aux/contracts";

export type VoiceCommand = "new_tab" | "close_tab" | "reload" | "back" | "forward";

const phrases: Record<string, VoiceCommand> = {
  "new tab": "new_tab",
  "open a new tab": "new_tab",
  "open new tab": "new_tab",
  "close tab": "close_tab",
  "close this tab": "close_tab",
  "close current tab": "close_tab",
  reload: "reload",
  "reload page": "reload",
  "refresh page": "reload",
  "go back": "back",
  "go forward": "forward",
};

export const voiceCommandLabels: Record<VoiceCommand, string> = {
  new_tab: "Open a new tab",
  close_tab: "Close the current tab",
  reload: "Reload this page",
  back: "Go back",
  forward: "Go forward",
};

export function parseVoiceCommand(transcript: string): VoiceCommand | null {
  const normalized = transcript
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/u, "")
    .replace(/^(?:hey\s+)?aux[,\s]+/u, "")
    .replace(/\s+/gu, " ");
  return phrases[normalized] ?? null;
}

export async function runVoiceCommand(command: VoiceCommand, host: AuxBridge): Promise<TabCommandAck> {
  if (command === "new_tab") return accepted(await host.tabCommand({ kind: "open" }));

  const snapshot = await host.tabsSnapshot();
  const pageId = snapshot.windows.find((window) => window.windowId === host.windowId)?.activePageId;
  if (!pageId) throw new Error("There is no active tab for this command.");

  const action = command === "close_tab" ? { kind: "close" as const, pageId } : { kind: command, pageId };
  return accepted(await host.tabCommand(action, snapshot.version));
}

function accepted(ack: TabCommandAck): TabCommandAck {
  if (ack.status === "rejected")
    throw new Error(ack.error?.message ?? "The browser could not run that command.");
  return ack;
}
