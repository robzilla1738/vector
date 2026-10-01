import { create } from "zustand";
import { type Demonstration, type Routine } from "@aux/contracts";
import { bridge } from "../../bridge";
import { call } from "../../store";
export const useRecording = create<{ demonstration: Demonstration | null; saved: Routine | null; exported: string; review: boolean; busy: boolean; error: string }>(() => ({ demonstration: null, saved: null, exported: "", review: false, busy: false, error: "" }));
let generation = 0;
export const recordingGeneration = () => generation;
export function bootRecorder() {
  const life = ++generation;
  let latestEvent = 0;
  const stop = bridge.onEvent(async event => {
    if (life !== generation || event.type !== "recorder.updated") return;
    const currentEvent = ++latestEvent;
    try {
      const { DemonstrationSchema } = await import("@aux/contracts/demonstration");
      if (life !== generation || currentEvent !== latestEvent) return;
      const parsed = DemonstrationSchema.safeParse(event.payload.demonstration);
      if (!parsed.success || useRecording.getState().demonstration?.id !== parsed.data.id) return;
      useRecording.setState({ demonstration: parsed.data, review: parsed.data.state === "stopped" });
    } catch (reason) {
      if (life === generation && currentEvent === latestEvent) useRecording.setState({ error: String(reason) });
    }
  });
  return () => { ++generation; stop(); useRecording.setState({ demonstration: null, saved: null, exported: "", review: false, busy: false, error: "" }); };
}
export async function recorderAction(action: "start" | "pause" | "resume" | "stop" | "discard", pageId?: string) {
  if (useRecording.getState().busy) return;
  const life = generation, demo = useRecording.getState().demonstration;
  useRecording.setState({ busy: true, error: "" });
  try {
    if (action === "start") {
      if (!pageId || demo && demo.state !== "stopped") throw new Error("Choose an available tab before recording.");
      const result = await call("recorder.start", { pageId });
      if (life === generation) useRecording.setState({ demonstration: result, saved: null, exported: "", review: false });
      else await call("recorder.discard", { recordingId: result.id });
    } else {
      if (!demo) throw new Error("No recording is active.");
      if (action === "discard") { await call("recorder.discard", { recordingId: demo.id }); if (life === generation) useRecording.setState({ demonstration: null, saved: null, exported: "", review: false }); }
      else {
        const result = await call(`recorder.${action}`, { recordingId: demo.id });
        if (life === generation) useRecording.setState({ demonstration: result, review: action === "stop" });
      }
    }
  } catch (error) { if (life === generation) useRecording.setState({ error: error instanceof Error ? error.message : String(error) }); throw error; }
  finally { if (life === generation) useRecording.setState({ busy: false }); }
}
