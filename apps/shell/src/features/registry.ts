import { COMMANDS, type AuxFeature, type ShellCommandId } from "@aux/contracts";
import { createElement, type ComponentType, type RefObject } from "react";
import { bridge } from "../bridge";
import { featureStage } from "../use-feature";
import type { useStore } from "../store";

export type CommandContext = ReturnType<typeof useStore.getState>;
export interface CommandInvocation {
  payload?: { pageId: string } | { spaceId: string } | { target: "little" | "main" };
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
  toolbarItems?: readonly ComponentType[];
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
export function FeatureSlots({ slot }: { slot: "sidebarItems" | "toolbarItems" | "overlays" }) {
  return featureMounts.filter(enabled).flatMap(mount => (mount[slot] ?? []).map((component, index) =>
    createElement(component, { key: `${mount.feature}:${index}` })));
}
export function FeatureSettings({ category }: { category: string }) {
  return featureMounts.filter(enabled).flatMap(mount => (mount.settingsSections ?? []).filter(section => section.category === category)
    .map((section, index) => createElement(section.component, { key: `${mount.feature}:${index}` })));
}
export function FeatureComposer(props: ComposerPluginProps) {
  return featureMounts.filter(enabled).flatMap(mount => (mount.composerPlugins ?? []).map((component, index) =>
    createElement(component, { ...props, key: `${mount.feature}:${index}` })));
}
