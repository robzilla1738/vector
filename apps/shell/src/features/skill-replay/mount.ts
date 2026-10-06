import type { FeatureMount } from "../registry";
import { call } from "../../store";
export const mount: FeatureMount = {
  feature: "automations",
  commands: {
    "prepare-skill-replay": (_context, invocation) => {
      if (!invocation.payload || !("compileReplay" in invocation.payload))
        throw new Error("Choose a verified source trace first.");
      return call("routines.replay.compile", invocation.payload.compileReplay);
    },
    "test-skill-replay": (_context, invocation) => {
      if (!invocation.payload || !("testReplay" in invocation.payload))
        throw new Error("Review fresh test values first.");
      return call("routines.replay.test", invocation.payload.testReplay);
    },
    "check-skill-replay": (_context, invocation) => {
      if (!invocation.payload || !("replayResult" in invocation.payload))
        throw new Error("Choose the current replay test.");
      return call("routines.replay.result", invocation.payload.replayResult);
    },
  },
};
