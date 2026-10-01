import { createElement, lazy, Suspense } from "react";
import { bridge } from "../../bridge";
import { call, useStore } from "../../store";
import { useRecording } from "./state";
import type { FeatureMount } from "../registry";
import { RecordButton, RecorderBanner } from "./RecorderControls";
import { bootRecorder, recorderAction, recordingGeneration } from "./state";
const ReviewRecording = lazy(() => import("./ReviewRecording"));
function RecorderReview() {
  const review = useRecording(state => state.review);
  return review ? createElement(Suspense, { fallback: createElement("p", { role: "status" }, "Loading demonstration review…") }, createElement(ReviewRecording)) : null;
}
export const mount: FeatureMount = {
  feature: "demonstrationSkills", boot: bootRecorder, sidebarItems: [RecordButton], overlays: [RecorderBanner, RecorderReview],
  commands: {
    "export-demonstration": async () => {
      const demo = useRecording.getState().demonstration, life = recordingGeneration();
      if (!demo || demo.state !== "stopped") throw new Error("Stop and review this demonstration before exporting.");
      const current = await call("recorder.get", { recordingId: demo.id });
      if (recordingGeneration() !== life || useRecording.getState().demonstration?.id !== demo.id) throw new Error("This Profile changed before export.");
      if (current.state !== "stopped") throw new Error("Stop the current demonstration before export.");
      return bridge.saveFile("aux-demonstration.json", JSON.stringify(current, null, 2));
    },
    "record-demonstration": (context, invocation) => recorderAction("start", invocation.payload && "pageId" in invocation.payload ? invocation.payload.pageId : context.activePageId ?? undefined),
    "pause-demonstration": () => recorderAction("pause"), "resume-demonstration": () => recorderAction("resume"),
    "propose-skill-repair": (_context, invocation) => {
      if (!invocation.payload || !("proposeRepair" in invocation.payload)) throw new Error("Choose a changed target to repair.");
      return call("routines.replay.repair.propose", invocation.payload.proposeRepair);
    },
    "approve-skill-repair": (_context, invocation) => {
      if (!invocation.payload || !("applyRepair" in invocation.payload)) throw new Error("Review a current repair diff first.");
      return call("routines.replay.repair.apply", invocation.payload.applyRepair);
    },
    "save-demonstration": async (_context, invocation) => {
      if (!invocation.payload || !("demonstration" in invocation.payload)) throw new Error("Review this demonstration before saving it.");
      if (useRecording.getState().busy) return;
      const life = recordingGeneration();
      const current = () => { if (recordingGeneration() !== life) throw new Error("This Profile changed while saving the Skill."); };
      const data = invocation.payload.demonstration, demo = useRecording.getState().demonstration;
      if (!demo || demo.id !== data.recordingId || demo.state !== "stopped") throw new Error("This demonstration is no longer available.");
      useRecording.setState({ busy: true, error: "" });
      try {
        const { task } = await call("tasks.get", { taskId: data.taskId });
        current();
        if (task.revision !== data.expectedTaskRevision) throw new Error("The saved task changed. Review it again.");
        let routine = useRecording.getState().saved;
        const names = [...new Set(data.review.inputs.map(input => input.parameter))];
        if (routine && (routine.sourceTaskId !== task.taskId || routine.sourceTaskRevision !== task.revision
          || routine.title !== data.title || JSON.stringify(routine.parameters.map(item => item.name)) !== JSON.stringify(names))) routine = null;
        if (!routine) {
          routine = await call("routines.create", { title: data.title, objective: `Replay ${data.title}`, workspaceId: task.workspaceId,
            sourceTaskId: task.taskId, sourceTaskRevision: task.revision, paused: true, parameters: names.map(name => ({ name, label: name })),
            siteOrigins: [...new Set(demo.steps.flatMap(step => step.kind === "navigate" ? [new URL(step.url).origin] : []))], trigger: { kind: "manual" } });
          current(); useRecording.setState({ saved: routine });
        }
        routine = await call("routines.replay.compileDemonstration", { routineId: routine.routineId, expectedRevision: routine.revision, recordingId: demo.id, review: data.review });
        current(); useRecording.setState({ saved: routine });
        const exported = await call("routines.exportSkill", { routineId: routine.routineId });
        current(); useRecording.setState({ exported: exported.content });
        useStore.setState({ skillSelection: { routineId: routine.routineId, workspaceId: routine.workspaceId } });
      } catch (error) { if (recordingGeneration() === life) useRecording.setState({ error: error instanceof Error ? error.message : String(error) }); throw error; }
      finally { if (recordingGeneration() === life) useRecording.setState({ busy: false }); }
    },
    "stop-demonstration": () => recorderAction("stop"), "discard-demonstration": () => recorderAction("discard"),
  },
};
