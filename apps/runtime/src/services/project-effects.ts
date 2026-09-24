import type { ProjectEffectName } from "@aux/contracts";

/** Access required at both broker dispatch and native effect confirmation. */
export const PROJECT_EFFECT_ACCESS: Record<ProjectEffectName, "read" | "write" | "command"> = {
  "file.write": "write",
  "file.create": "write",
  "file.rename": "write",
  "file.delete": "write",
  "command.start": "command",
  "command.stop": "read",
  "commit.create": "write",
  "preview.open": "read",
  "incident.report": "read",
};
