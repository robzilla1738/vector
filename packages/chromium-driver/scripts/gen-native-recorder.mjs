import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { RECORDER_SOURCE } from "../dist/recorder-script.js";

const output = resolve(import.meta.dirname, "../../../.native/chrome/common/native_recorder_script.h");
const wrapperOutput = resolve(
  import.meta.dirname,
  "../../../.native/chrome/browser/ui/aux/native_recorder_script.h",
);
const sourceSha = createHash("sha256").update(RECORDER_SOURCE).digest("hex");
const begin = `((token) => {
  globalThis.__auxRecorderStop?.();
  const state = { token, events: [], bytes: 0, overflow: false };
  globalThis.__auxNativeRecorder = state;
  globalThis.__auxRec = raw => {
    if (state.overflow || typeof raw !== 'string') return;
    if (raw.length > 16000 || state.events.length >= 50 || state.bytes + raw.length > 65536) {
      state.overflow = true; state.events.length = 0; state.bytes = 0;
      globalThis.__auxRecorderStop?.(); return;
    }
    state.events.push(JSON.parse(raw)); state.bytes += raw.length;
  };
  ${RECORDER_SOURCE};
  return true;
})`;
const drain = `((token) => {
  const state = globalThis.__auxNativeRecorder;
  if (!state || state.token !== token) return null;
  const result = { events: state.events, overflow: state.overflow };
  state.events = []; state.bytes = 0;
  return result;
})`;
const stop = `((token) => {
  if (globalThis.__auxNativeRecorder?.token !== token) return false;
  globalThis.__auxRecorderStop?.();
  delete globalThis.__auxNativeRecorder;
  delete globalThis.__auxRec;
  return true;
})`;
const literal = (value) => {
  if (value.includes(')AUX_REC"')) throw new Error("Recorder literal delimiter collision");
  return `uR"AUX_REC(${value})AUX_REC"`;
};
const header = `// Generated from the single fixed RECORDER_SOURCE; run gen-native-recorder.mjs.
#ifndef CHROME_COMMON_NATIVE_RECORDER_SCRIPT_H_
#define CHROME_COMMON_NATIVE_RECORDER_SCRIPT_H_
namespace aux::recorder_script {
inline constexpr char kProducerSha256[] = "${sourceSha}";
inline constexpr char16_t kBegin[] = ${literal(begin)};
inline constexpr char16_t kDrain[] = ${literal(drain)};
inline constexpr char16_t kStop[] = ${literal(stop)};
inline constexpr char16_t kStreamingBegin[] = ${literal(`globalThis.__auxRecorderStop?.();${RECORDER_SOURCE};true`)};
inline constexpr char16_t kStreamingStop[] = ${literal("globalThis.__auxRecorderStop?.();delete globalThis.__auxRec;true")};
}  // namespace aux::recorder_script
#endif
`;
const wrapper = `// Fixed recorder producer lives in the shared common header.
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_RECORDER_SCRIPT_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_RECORDER_SCRIPT_H_
#include "chrome/common/native_recorder_script.h"
#endif
`;
if (process.argv.includes("--check")) {
  if (readFileSync(output, "utf8") !== header || readFileSync(wrapperOutput, "utf8") !== wrapper)
    throw new Error("Native recorder source is stale");
} else {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, header);
  mkdirSync(dirname(wrapperOutput), { recursive: true });
  writeFileSync(wrapperOutput, wrapper);
}
