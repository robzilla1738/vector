import { expect, it } from "vitest";
import { orderedProfiles, orderedProfileSpaces } from "./profile-order";
it("indexes Profiles and their committed Space order globally, excluding archives", () => {
  const profiles = [
    {
      id: "Profile 10",
      name: "Later",
      current: false,
      spaces: [{ id: "later", name: "Later", color: "blue" as const }],
    },
    {
      id: "Profile 2",
      name: "Archived",
      current: false,
      archived: true,
      spaces: [{ id: "archive", name: "Archive", color: "blue" as const }],
    },
    {
      id: "Profile 1",
      name: "Work",
      current: false,
      spaces: [
        { id: "second", name: "Second", color: "green" as const },
        { id: "first", name: "First", color: "violet" as const },
      ],
    },
    {
      id: "default",
      name: "Personal",
      current: true,
      spaces: [{ id: "personal", name: "Personal", color: "blue" as const }],
    },
  ];
  expect(orderedProfiles(profiles).map((profile) => profile.id)).toEqual([
    "default",
    "Profile 1",
    "Profile 10",
  ]);
  expect(orderedProfileSpaces(profiles).map((space) => space.spaceId)).toEqual([
    "personal",
    "second",
    "first",
    "later",
  ]);
  expect(profiles[0]!.id).toBe("Profile 10");
});
