import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  listNativeProfiles,
  resolveNativeUserDataDir,
  type NativeProfile,
} from "@aux/contracts/installation";
import { AuxClient, readRuntimeDescriptor, requireLiveRuntime } from "@aux/sdk";

export interface CliProfile extends NativeProfile {
  spaces: { id: string; name: string; color: string }[];
}
export class SelectionError extends Error {
  readonly exitCode = 2;
}
const profileId = (id: string) => (id === "Default" ? "default" : id);

/** Only Local State's discovery metadata is read, never a Profile's storage. */
export function discoverProfiles(userDataDir = resolveNativeUserDataDir()): CliProfile[] {
  const profiles = listNativeProfiles(userDataDir);
  if (!profiles.length) return [];
  const state = JSON.parse(readFileSync(join(userDataDir, "Local State"), "utf8"));
  return profiles.map((profile) => ({
    ...profile,
    archived: profile.archived || state.aux?.archived_profiles?.[profileId(profile.id)] === true,
    spaces: (state.aux?.profile_spaces_index?.[profileId(profile.id)] ?? []).filter(
      (space: unknown) =>
        space &&
        typeof space === "object" &&
        typeof (space as Record<string, unknown>).id === "string" &&
        typeof (space as Record<string, unknown>).name === "string" &&
        typeof (space as Record<string, unknown>).color === "string",
    ),
  }));
}
export function selectProfile(profiles: CliProfile[], selector: string): CliProfile {
  const exact = profiles.find((profile) => profileId(profile.id) === selector || profile.id === selector);
  const matches = exact
    ? [exact]
    : profiles.filter((profile) => profile.name.toLocaleLowerCase() === selector.toLocaleLowerCase());
  if (matches.length !== 1)
    throw new SelectionError(
      matches.length
        ? `Ambiguous Profile “${selector}”: ${matches.map((profile) => `${profile.name} (${profileId(profile.id)})`).join(", ")}`
        : `Unknown Profile “${selector}”. Available: ${profiles.map((profile) => `${profile.name} (${profileId(profile.id)})`).join(", ") || "none"}`,
    );
  if (matches[0]!.archived) throw new SelectionError(`Profile “${selector}” is archived.`);
  return matches[0]!;
}
export function selectSpace(profile: CliProfile, selector: string): string {
  const exact = profile.spaces.find((space) => space.id === selector);
  const matches = exact
    ? [exact]
    : profile.spaces.filter((space) => space.name.toLocaleLowerCase() === selector.toLocaleLowerCase());
  if (matches.length !== 1)
    throw new SelectionError(
      matches.length
        ? `Ambiguous Space “${selector}”: ${matches.map((space) => `${space.name} (${space.id})`).join(", ")}`
        : `Unknown Space “${selector}” in ${profile.name}.`,
    );
  return matches[0]!.id;
}
export interface OpenOptions {
  profile?: string;
  space?: string;
  little?: boolean;
  newWindow?: boolean;
  background?: boolean;
  wait?: boolean;
}
export function openRequest(
  url: string,
  options: OpenOptions,
  profiles: CliProfile[],
): { url: string; profile?: CliProfile; spaceId?: string } {
  const inner = new URL(url);
  if (!["http:", "https:"].includes(inner.protocol) || inner.username || inner.password || url.length > 8192)
    throw new SelectionError("Open requires an HTTP or HTTPS URL without credentials.");
  if (options.little && options.newWindow) throw new SelectionError("Choose --little or --new-window.");
  let profile = options.profile ? selectProfile(profiles, options.profile) : undefined;
  if (options.space && !profile) {
    const candidates = profiles
      .filter((item) => !item.archived)
      .flatMap((item) =>
        item.spaces.filter((space) => space.id === options.space).map((space) => ({ profile: item, space })),
      );
    const matches = candidates.length
      ? candidates
      : profiles
          .filter((item) => !item.archived)
          .flatMap((item) =>
            item.spaces
              .filter((space) => space.name.toLocaleLowerCase() === options.space!.toLocaleLowerCase())
              .map((space) => ({ profile: item, space })),
          );
    if (matches.length !== 1)
      throw new SelectionError(
        matches.length
          ? `Ambiguous Space “${options.space}”: ${matches.map((item) => `${item.profile.name} (${profileId(item.profile.id)}) / ${item.space.name} (${item.space.id})`).join(", ")}`
          : `Unknown Space “${options.space}”.`,
      );
    profile = matches[0]!.profile;
  }
  const spaceId = options.space && profile ? selectSpace(profile, options.space) : undefined;
  const request = new URL("aux://open");
  request.searchParams.set("url", inner.href);
  request.searchParams.set("source", "cli");
  if (profile) request.searchParams.set("profile", profileId(profile.id));
  if (spaceId) request.searchParams.set("space", spaceId);
  if (options.little || options.newWindow)
    request.searchParams.set("window", options.little ? "little" : "new-window");
  if (options.background) request.searchParams.set("background", "1");
  return { url: request.href, profile, spaceId };
}
async function runtime(profile: CliProfile, userDataDir: string, deadline?: number) {
  const descriptor = readRuntimeDescriptor(join(userDataDir, profile.id, "Aux Runtime Data", "runtime.json"));
  const remaining = () =>
    deadline === undefined ? 1500 : Math.max(1, Math.min(1500, deadline - Date.now()));
  const boundedFetch: typeof fetch = (input, init) =>
    fetch(input, {
      ...init,
      signal: AbortSignal.any([...(init?.signal ? [init.signal] : []), AbortSignal.timeout(remaining())]),
    });
  await requireLiveRuntime(descriptor, boundedFetch);
  return new AuxClient(descriptor, { timeoutMs: remaining(), fetch: boundedFetch });
}
export async function profileListing(userDataDir = resolveNativeUserDataDir()) {
  return Promise.all(
    discoverProfiles(userDataDir).map(async (profile) => {
      let running = false;
      try {
        await runtime(profile, userDataDir);
        running = true;
      } catch {
        /* A missing or stale descriptor is not a running Profile. */
      }
      return { ...profile, id: profileId(profile.id), running };
    }),
  );
}
export interface OpenSnapshot {
  pages: { pageId: string; url: string; ownedByRuntime: boolean; windowKind?: string; viewStatus: string }[];
  tabPlacements: Record<string, { spaceId: string }>;
}
export function openedPage(
  snapshot: OpenSnapshot,
  previous: ReadonlySet<string>,
  url: string,
  spaceId?: string,
) {
  return snapshot.pages.find(
    (page) =>
      !previous.has(page.pageId) &&
      page.url === url &&
      !page.ownedByRuntime &&
      page.windowKind !== "private" &&
      page.viewStatus !== "detached" &&
      (!spaceId || snapshot.tabPlacements[page.pageId]?.spaceId === spaceId),
  );
}
export type OpenLauncher = (url: string, background: boolean) => Promise<unknown>;
const launchNative: OpenLauncher = (url, background) =>
  promisify(execFile)("/usr/bin/open", ["-b", "dev.aux.browser", ...(background ? ["-g"] : []), url]);
export async function openUrl(
  url: string,
  options: OpenOptions,
  userDataDir = resolveNativeUserDataDir(),
  launch: OpenLauncher = launchNative,
) {
  const profiles = discoverProfiles(userDataDir);
  const request = openRequest(url, options, profiles);
  const candidates = request.profile ? [request.profile] : profiles.filter((profile) => !profile.archived);
  const previous = new Set<string>();
  if (options.wait)
    await Promise.all(
      candidates.map(async (profile) => {
        try {
          const snapshot = await (await runtime(profile, userDataDir)).call("workspace.get", {});
          for (const page of snapshot.pages) previous.add(page.pageId);
        } catch {
          /* Cold launches have no live descriptor yet. */
        }
      }),
    );
  await launch(request.url, options.background === true);
  if (!options.wait) return { opened: true };
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const available = candidates.length
      ? candidates
      : discoverProfiles(userDataDir).filter((profile) => !profile.archived);
    const matches = await Promise.all(
      available.map(async (profile) => {
        try {
          const snapshot = (await (
            await runtime(profile, userDataDir, deadline)
          ).call("workspace.get", {})) as OpenSnapshot;
          const page = openedPage(snapshot, previous, new URL(url).href, request.spaceId);
          if (page)
            return {
              pageId: page.pageId,
              profile: profileId(profile.id),
              spaceId: snapshot.tabPlacements[page.pageId]?.spaceId ?? null,
            };
        } catch {
          /* Startup/restart descriptors and placement arrive asynchronously. */
        }
        return null;
      }),
    );
    const match = matches.find(Boolean);
    if (match) return match;
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, Math.min(100, deadline - Date.now()))));
  }
  throw new Error("Aux did not open the requested page in its target Profile and Space within 30 seconds.");
}
