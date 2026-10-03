// @vitest-environment jsdom
import { expect, it } from "vitest";
import { COMMANDS } from "@aux/contracts";
import { MEMORY_EXCLUSION_COMMANDS } from "./MemoryExclusionControls";
it("each actual exclusion action has exactly one normal-only remappable registered row", () => {
  for (const id of MEMORY_EXCLUSION_COMMANDS) {
    const matches = COMMANDS.filter((row) => row.id === id);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      handler: "shell",
      focusShell: true,
      palette: false,
      windows: ["normal"],
      bindings: [],
      intercept: true,
    });
  }
});
