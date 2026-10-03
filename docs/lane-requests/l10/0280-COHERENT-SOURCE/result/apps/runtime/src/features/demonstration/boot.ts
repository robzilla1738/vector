import { AuxError } from "@aux/contracts";
import type { Services } from "../../api/methods/context.js";
import { DemoRecorder } from "../../services/demo-recorder.js";
import { installDemoRecorder } from "./service.js";
export const feature = "demonstrationSkills" as const;
export function boot(s: Services) {
  if (s.featureHost !== "chromium-fork") return;
  if (!s.repo.columnCipher) throw new AuxError("backend_unavailable", "Demonstrations require protected Profile storage.");
  const recorder = new DemoRecorder(s.repo, id => ({ ...s.pages.get(id), attached: s.pages.isAttached(id) }),
    id => s.pages.recorderObserver(id), (demo, failure) => s.events.emit("recorder.updated", { demonstration: demo, ...(failure !== undefined ? { captureFailed: true } : {}) }), s.clock?.now);
  return installDemoRecorder(s, recorder);
}
