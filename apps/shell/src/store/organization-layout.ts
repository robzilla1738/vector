import type { OrganizationLayout } from "@aux/contracts";
import { tidyFoldersMatch } from "../tidy-layout";
import { emptyLayout, type Layout } from "../workspace";

export function toOrganizationLayout(layout: Layout): OrganizationLayout {
  return {
    shared: {
      spaces: layout.spaces,
      archivedSpaces: layout.archivedSpaces ?? [],
      pins: layout.pins,
      folders: layout.folders,
      tabSpace: layout.tabSpace,
      order: layout.order,
      tabFolder: layout.tabFolder,
      tabNames: layout.tabNames ?? {},
      splitGroups: layout.splitGroups ?? [],
      ...(layout.tidyUndo ? { tidyUndo: layout.tidyUndo } : {}),
      archivedTabs: layout.archivedTabs ?? [],
    },
    window: {
      activeSpaceId: layout.activeSpaceId,
      activeTabs: layout.activeTabs ?? {},
      splitRatio: layout.splitRatio ?? 0.5,
    },
  };
}

export function fromOrganizationLayout(value: OrganizationLayout): Layout {
  // Retain Undo only while its created folders still match the shared state.
  const stored = value.shared.tidyUndo;
  const receipt = stored && tidyFoldersMatch(stored.created, value.shared.folders) ? stored : undefined;
  return {
    ...emptyLayout(),
    ...value.shared,
    ...value.window,
    tidyUndo: receipt,
  };
}

const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);

function mergeRecord<T>(
  base: Record<string, T>,
  local: Record<string, T>,
  remote: Record<string, T>,
): Record<string, T> {
  const merged = { ...remote };
  for (const key of new Set([...Object.keys(base), ...Object.keys(local)])) {
    if (same(base[key], local[key])) continue;
    if (Object.hasOwn(local, key)) merged[key] = local[key]!;
    else delete merged[key];
  }
  return merged;
}

function mergeItems<T>(base: T[], local: T[], remote: T[], key: (item: T) => string): T[] {
  const baseByKey = new Map(base.map((item) => [key(item), item]));
  const localByKey = new Map(local.map((item) => [key(item), item]));
  const merged = new Map(remote.map((item) => [key(item), item]));
  for (const id of new Set([...baseByKey.keys(), ...localByKey.keys()])) {
    if (same(baseByKey.get(id), localByKey.get(id))) continue;
    const item = localByKey.get(id);
    if (item === undefined) merged.delete(id);
    else merged.set(id, item);
  }
  return [...merged.values()];
}

function mergeOrder(base: string[], local: string[], remote: string[]): string[] {
  if (same(base, local)) return remote;
  if (same(base, remote)) return local;
  const removed = new Set(base.filter((id) => !local.includes(id)));
  for (const id of base) if (!remote.includes(id)) removed.add(id);
  const remoteOnly = remote.filter((id) => !base.includes(id) && !local.includes(id));
  const merged = local.filter((id) => !removed.has(id));
  // Preserve tabs added by the other window next to their nearest surviving predecessor.
  for (const id of remoteOnly) {
    const index = remote.indexOf(id);
    const predecessor = remote
      .slice(0, index)
      .reverse()
      .find((item) => merged.includes(item));
    const insertAt = predecessor ? merged.indexOf(predecessor) + 1 : merged.length;
    merged.splice(insertAt, 0, id);
  }
  return merged;
}

function mergePins(
  base: OrganizationLayout["shared"]["pins"],
  local: OrganizationLayout["shared"]["pins"],
  remote: OrganizationLayout["shared"]["pins"],
) {
  const merged = { ...remote };
  for (const spaceId of new Set([...Object.keys(base), ...Object.keys(local)])) {
    if (same(base[spaceId], local[spaceId])) continue;
    if (!Object.hasOwn(local, spaceId)) {
      delete merged[spaceId];
      continue;
    }
    merged[spaceId] = mergeItems(
      base[spaceId] ?? [],
      local[spaceId] ?? [],
      remote[spaceId] ?? [],
      (pin) => pin.url,
    );
  }
  return merged;
}

/** Three-way merge: this window's changed fields win, untouched fields retain the newer Profile snapshot. */
export function rebaseOrganizationLayout(
  base: OrganizationLayout,
  local: OrganizationLayout,
  remote: OrganizationLayout,
): OrganizationLayout {
  const baseShared = base.shared,
    localShared = local.shared,
    remoteShared = remote.shared;
  return {
    shared: {
      spaces: mergeItems(baseShared.spaces, localShared.spaces, remoteShared.spaces, (item) => item.id),
      archivedSpaces: mergeItems(
        baseShared.archivedSpaces,
        localShared.archivedSpaces,
        remoteShared.archivedSpaces,
        (item) => item.id,
      ),
      pins: mergePins(baseShared.pins, localShared.pins, remoteShared.pins),
      folders: mergeItems(baseShared.folders, localShared.folders, remoteShared.folders, (item) => item.id),
      archivedTabs: mergeItems(
        baseShared.archivedTabs ?? [],
        localShared.archivedTabs ?? [],
        remoteShared.archivedTabs ?? [],
        (item) => item.archiveId,
      ),
      tabSpace: mergeRecord(base.shared.tabSpace, local.shared.tabSpace, remote.shared.tabSpace),
      order: mergeOrder(base.shared.order, local.shared.order, remote.shared.order),
      tabFolder: mergeRecord(base.shared.tabFolder, local.shared.tabFolder, remote.shared.tabFolder),
      tabNames: mergeRecord(base.shared.tabNames, local.shared.tabNames, remote.shared.tabNames),
      splitGroups: mergeItems(
        baseShared.splitGroups,
        localShared.splitGroups,
        remoteShared.splitGroups,
        (item) => item.id,
      ),
      tidyUndo: same(baseShared.tidyUndo, localShared.tidyUndo)
        ? remoteShared.tidyUndo
        : localShared.tidyUndo,
    },
    window: {
      activeSpaceId: same(base.window.activeSpaceId, local.window.activeSpaceId)
        ? remote.window.activeSpaceId
        : local.window.activeSpaceId,
      activeTabs: mergeRecord(base.window.activeTabs, local.window.activeTabs, remote.window.activeTabs),
      splitRatio: same(base.window.splitRatio, local.window.splitRatio)
        ? remote.window.splitRatio
        : local.window.splitRatio,
    },
  };
}
