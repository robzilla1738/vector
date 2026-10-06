import type { bridge } from "../../bridge";
export type BrowserProfile = Awaited<ReturnType<typeof bridge.browserProfiles>>[number];
/** Default first, then native directory ordinal; Space array order is committed organization order. */
export function orderedProfiles(profiles: BrowserProfile[]) {
  return profiles
    .filter((profile) => !profile.archived)
    .toSorted((a, b) =>
      a.id === "default"
        ? b.id === "default"
          ? 0
          : -1
        : b.id === "default"
          ? 1
          : a.id.localeCompare(b.id, "en", { numeric: true }),
    );
}
export function orderedProfileSpaces(profiles: BrowserProfile[]) {
  return orderedProfiles(profiles).flatMap((profile) =>
    (profile.spaces ?? []).map((space) => ({ profileId: profile.id, spaceId: space.id, name: space.name })),
  );
}
