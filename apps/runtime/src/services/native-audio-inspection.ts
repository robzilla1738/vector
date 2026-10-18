import { AuxError } from "@aux/contracts";
import { AudioInspectionSchema } from "@aux/contracts/document-jobs";
import type { NativeBridge } from "../native.js";
import type { InspectAudio } from "./audio-transcription.js";
import { nativeDocumentJob } from "./native-document-jobs.js";

export function nativeAudioInspection(native: NativeBridge): InspectAudio {
  return async (input) => {
    const result = await nativeDocumentJob(native, { kind: "audioInspect" }, [input], input);
    if (!result.report.audio || result.outputs.length)
      throw new AuxError("backend_unavailable", "The isolated audio decoder returned an invalid report.");
    return AudioInspectionSchema.parse(result.report.audio);
  };
}
