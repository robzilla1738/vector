import { AuxError, type MethodName } from "@aux/contracts";
import type { MethodCtx, MethodHandler } from "./context.js";
import { demoRecorder } from "../../features/demonstration/service.js";
async function h_demonstration({ s, method, params, client }: MethodCtx) {
  if (client.external || client.codeMode)
    throw new AuxError("permission_denied", "Recording is controlled by the person in Aux.");
  const recorder = demoRecorder(s);
  if (method === "recorder.get") return recorder.get(params.recordingId);
  if (method === "recorder.start") return recorder.start(params.pageId);
  if (method === "recorder.discard") return recorder.discard(params.recordingId);
  return recorder.control(
    params.recordingId,
    method === "recorder.pause" ? "paused" : method === "recorder.resume" ? "recording" : "stopped",
  );
}
export const demonstrationMethods: Partial<Record<MethodName, MethodHandler>> = {
  "recorder.get": h_demonstration,
  "recorder.start": h_demonstration,
  "recorder.pause": h_demonstration,
  "recorder.resume": h_demonstration,
  "recorder.stop": h_demonstration,
  "recorder.discard": h_demonstration,
};
