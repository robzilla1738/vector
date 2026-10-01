import { AuxError } from "@aux/contracts";

async function h_demonstration(): Promise<never> {
  throw new AuxError("feature_unavailable", "Demonstration recording is not implemented.");
}

export const demonstrationMethods = {
  "recorder.start": h_demonstration,
  "recorder.pause": h_demonstration,
  "recorder.resume": h_demonstration,
  "recorder.stop": h_demonstration,
  "recorder.discard": h_demonstration,
};
