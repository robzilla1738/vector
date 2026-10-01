import { COMMANDS, type AuxFeature, type ShellCommandId } from "@aux/contracts";
import { createElement, type ComponentType, type RefObject, useSyncExternalStore } from "react";
import { bridge } from "../bridge";
import { featureStage } from "../use-feature";
import type { useStore } from "../store";

export type CommandContext = ReturnType<typeof useStore.getState>;
export interface CommandInvocation {
  payload?: { queue: import("@aux/contracts").MethodParams<"nightShift.queue"> }
    | import("@aux/contracts").MethodParams<"nightShift.review">
    | { nightShift: import("zod").infer<typeof import("@aux/contracts").NightShiftSettingsSchema> }
    | { demonstration: { recordingId: string; taskId: string; expectedTaskRevision: number; title: string; review: import("zod").infer<typeof import("@aux/contracts").DemonstrationReviewSchema> } }
    | { compileReplay: import("@aux/contracts").MethodParams<"routines.replay.compile"> }
    | { testReplay: import("@aux/contracts").MethodParams<"routines.replay.test"> }
    | { replayResult: import("@aux/contracts").MethodParams<"routines.replay.result"> }
    | { proposeRepair: import("@aux/contracts").MethodParams<"routines.replay.repair.propose"> }
    | { applyRepair: import("@aux/contracts").MethodParams<"routines.replay.repair.apply"> }
    | { pageId: string; edge?: "left" | "right" | "top" | "bottom" }
    | { receiptId: string } | { downloadNaming: import("@aux/contracts").DownloadNamingSettings }
    | { pageId: string; divider: number; ratio: number; persist?: boolean } | { spaceId: string } | { target: "little" | "main" }
    | { spaceId: string; pinUrl: string; beforePinUrl?: string | null } | { folderId: string; itemId?: string } | { archiveId: string } | { batchId: string }
    | { folderId: string; live: import("@aux/contracts").LiveFolder }
    | { spaceId: string; archiveHours: 12 | 24 | 72 | 168 | 720 | "never" }
    | { connectionId: string } | { name: string; token: string }
    | { profileId: string; spaceId: string | null } | { pageId: string; profileId: string }
    | { extensionId: string; anchor?: { x: number; y: number; width: number; height: number } }
    | { extensionId: string; pinned: boolean } | { extensionId: string; name: string; shortcut: string }
    | { extensionId: string; enabled: boolean } | { extensionId: string; source: "store" | "managed" | "environment" }
    | { name: string } | { profileId: string } | { profileId: string; name: string } | { profileId: string; archived: boolean }
    | { profileId: string; color: import("@aux/contracts").HostMethodArgs<"setBrowserProfileAppearance">[1]["color"]; icon: string }
    | { revision: number; linkRoutes: import("@aux/contracts").LinkRoutes }
    | { url: string; source: import("@aux/contracts").HostMethodArgs<"testLinkRoute">[1] }
    | { promptId: string; destination: import("@aux/contracts").LinkRouteDestination; remember: boolean }
    | { enabled: boolean };
}
export interface ComposerPluginProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}
export interface FeatureMount {
  feature: AuxFeature;
  privateWindows?: boolean;
  boot?: () => void | (() => void);
  sidebarItems?: readonly ComponentType[];
  sidebarFooterItems?: readonly ComponentType[];
  startItems?: readonly ComponentType[];
  toolbarItems?: readonly ComponentType[];
  railView?: { component: ComponentType; active: () => boolean; subscribe: (listener: () => void) => () => void };
  overlays?: readonly ComponentType[];
  composerPlugins?: readonly ComponentType<ComposerPluginProps>[];
  settingsSections?: readonly { category: string; component: ComponentType }[];
  commands?: Partial<Record<ShellCommandId, (context: CommandContext, invocation: CommandInvocation) => unknown>>;
  /** Registry IDs only: bindings and remapping stay in the shared command contract. */
  shortcuts?: readonly ShellCommandId[];
}

const modules = import.meta.glob<{ mount: FeatureMount }>("./*/mount.ts", { eager: true });
export const featureMounts = Object.entries(modules).sort(([a], [b]) => a.localeCompare(b)).map(([, module]) => module.mount);
const commandIds = new Set(COMMANDS.map(command => command.id));
const handlers = new Set<string>();
for (const mount of featureMounts) {
  for (const id of [...Object.keys(mount.commands ?? {}), ...(mount.shortcuts ?? [])]) {
    if (!commandIds.has(id as ShellCommandId)) throw new Error(`Unregistered feature command: ${id}`);
  }
  for (const id of Object.keys(mount.commands ?? {})) {
    if (handlers.has(id)) throw new Error(`Duplicate feature command handler: ${id}`);
    handlers.add(id);
  }
}
const enabled = (mount: FeatureMount) => featureStage(mount.feature) === "on" && (!bridge.privateMode || mount.privateWindows === true);
export function bootShellFeatures() {
  const cleanup = featureMounts.filter(enabled).flatMap(mount => {
    const stop = mount.boot?.();
    return stop ? [stop] : [];
  });
  return () => { for (const stop of cleanup.reverse()) stop(); };
}
export function runFeatureCommand(id: string, context: CommandContext, invocation: CommandInvocation = {}): { handled: false } | { handled: true; result: unknown } {
  const mount = featureMounts.find(mount => enabled(mount) && Object.hasOwn(mount.commands ?? {}, id));
  if (!mount) return { handled: false };
  return { handled: true, result: mount.commands![id as ShellCommandId]!(context, invocation) };
}
export function FeatureSlots({ slot }: { slot: "sidebarItems" | "sidebarFooterItems" | "toolbarItems" | "overlays" | "startItems" }) {
  return featureMounts.filter(enabled).flatMap(mount => (mount[slot] ?? []).map((component, index) =>
    createElement(component, { key: `${mount.feature}:${index}` })));
}
export function FeatureSettings({ category }: { category: string | null }) {
  return featureMounts.filter(enabled).flatMap(mount => (mount.settingsSections ?? [])
    .map((section, index) => createElement("div", { key: `${mount.feature}:${index}`, hidden: section.category !== category }, createElement(section.component))));
}
export function FeatureComposer(props: ComposerPluginProps) {
  return featureMounts.filter(enabled).flatMap(mount => (mount.composerPlugins ?? []).map((component, index) =>
    createElement(component, { ...props, key: `${mount.feature}:${index}` })));
}

export function useFeatureRailView() {
  const feature = useSyncExternalStore(listener => {
    const stops = featureMounts.flatMap(mount => mount.railView ? [mount.railView.subscribe(listener)] : []);
    return () => { for (const stop of stops) stop(); };
  }, () => featureMounts.find(mount => enabled(mount) && mount.railView?.active())?.feature ?? null);
  return featureMounts.find(mount => mount.feature === feature)?.railView?.component ?? null;
}
