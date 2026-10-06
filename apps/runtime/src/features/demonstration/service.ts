import { AuxError } from "@aux/contracts";
import type { Services } from "../../api/methods/context.js";
import type { DemoRecorder } from "../../services/demo-recorder.js";
const instances = new WeakMap<Services, DemoRecorder>();
export function installDemoRecorder(s: Services, recorder: DemoRecorder) {
  if (instances.has(s)) throw new AuxError("conflict", "This Profile already has a recorder.");
  instances.set(s, recorder);
  return async () => {
    instances.delete(s);
    await recorder.close();
  };
}
export function demoRecorder(s: Services): DemoRecorder {
  const recorder = instances.get(s);
  if (!recorder) throw new AuxError("feature_unavailable", "The recorder is unavailable in this Profile.");
  return recorder;
}
