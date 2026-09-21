import { execFile, spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { app, type BaseWindow, type WebContents } from "electron";

const executable = app.isPackaged
  ? join(process.resourcesPath, "app.asar.unpacked", "dist", "main", "aux-dictation")
  : join(import.meta.dirname, "aux-dictation");
type Session = { id: string; owner: WebContents; process: ChildProcessWithoutNullStreams; stop: () => void };
let active: Session | undefined;
let pendingStart: {owner: WebContents; id: string; cancelled: boolean} | undefined;
export function dictationStatus(): Promise<{ available: boolean; language?: string; reason?: string }> {
  if (process.platform !== "darwin" || !existsSync(executable)) return Promise.resolve({available:false,reason:"On-device dictation requires the Aux macOS app and its speech helper."});
  return new Promise(resolve => {
    execFile(executable, ["--status"], {timeout:10000,maxBuffer:16384}, (error, stdout) => {
      if (error) { resolve({available:false,reason:"On-device dictation could not be checked. Try reopening Aux."}); return; }
      try { const value = JSON.parse(stdout); resolve({available:value.available === true,language:typeof value.language === "string" ? value.language : undefined,reason:typeof value.reason === "string" ? value.reason : undefined}); }
      catch { resolve({available:false,reason:"The speech helper returned an invalid response."}); }
    });
  });
}
export function cancelDictation(owner?: WebContents, id?: unknown) {
  if (pendingStart && (!owner || (pendingStart.owner === owner && pendingStart.id === id))) pendingStart.cancelled = true;
  if (active && (!owner || (active.owner === owner && active.id === id))) active.stop();
}
export async function startDictation(owner: WebContents, id: unknown, window: BaseWindow) {
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid dictation session.");
  if (active || pendingStart) throw new Error("Finish dictation in the other conversation first.");
  const reservation = {owner, id, cancelled:false};
  pendingStart = reservation;
  const cancelReservation = () => { reservation.cancelled = true; };
  window.once("hide", cancelReservation);
  owner.once("did-start-navigation", cancelReservation);
  let status;
  try { status = await dictationStatus(); }
  finally {
    window.removeListener("hide", cancelReservation);
    owner.removeListener("did-start-navigation", cancelReservation);
    if (pendingStart === reservation) pendingStart = undefined;
  }
  if (reservation.cancelled) throw new Error("Dictation was cancelled.");
  if (owner.isDestroyed() || window.isDestroyed() || !window.isVisible()) throw new Error("This conversation is no longer available.");
  if (active) throw new Error("Finish dictation in the other conversation first.");
  if (!status.available) throw new Error(status.reason || "On-device dictation is unavailable.");
  const child = spawn(executable, [], {stdio:["pipe","pipe","pipe"]});
  let pending = "", terminal = false;
  const send = (value: object) => {
    try {
      if (owner.isDestroyed()) { stop(); return; }
      owner.send("dictation.event", {sessionId:id,...value});
    } catch { stop(); } // A disconnected renderer must never leave capture running.
  };
  const cleanup = () => {
    clearTimeout(timeout);
    window.removeListener("hide", hidden);
    window.removeListener("closed", stop);
    owner.removeListener("destroyed", stop);
    owner.removeListener("render-process-gone", stop);
    owner.removeListener("did-start-navigation", navigated);
    if (active?.process === child) active = undefined;
  };
  const stop = () => { terminal = true; child.kill("SIGKILL"); cleanup(); };
  const navigated = (_event: unknown, _url: string, sameDocument: boolean) => { if (!sameDocument) stop(); };
  const fail = (message: string) => { if (!terminal) send({type:"error",message}); stop(); };
  const hidden = () => fail("Dictation stopped because this window was hidden. Review the captured text before continuing.");
  const timeout = setTimeout(() => fail("Dictation timed out. Your microphone has been stopped."), 90000); timeout.unref();
  active = {id,owner,process:child,stop};
  window.once("hide", hidden);
  window.once("closed", stop);
  owner.once("destroyed", stop);
  owner.once("render-process-gone", stop);
  owner.on("did-start-navigation", navigated);
  child.stdin.on("error", () => fail("The speech helper stopped before dictation finished."));
  child.stderr.resume(); // Native diagnostics may include recognized words; never persist them.
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    if (terminal) return;
    pending += chunk;
    if (pending.length > 262144) { fail("Dictation returned too much text. Try a shorter message."); return; }
    let end: number;
    while ((end = pending.indexOf("\n")) >= 0) {
      const line = pending.slice(0,end); pending = pending.slice(end+1);
      try {
        const value = JSON.parse(line);
        if (!["recording","finishing","transcript","final","error"].includes(value.type)) throw new Error();
        send({type:value.type,...(typeof value.text === "string" ? {text:value.text.slice(0,20000)} : {}),...(typeof value.message === "string" ? {message:value.message.slice(0,1000)} : {})});
        if (terminal || value.type === "final" || value.type === "error") { stop(); return; }
      } catch { fail("Dictation returned an unreadable response."); return; }
    }
  });
  child.once("error", () => fail("The speech helper could not start."));
  child.once("exit", () => { if (!terminal) send({type:"error",message:"Dictation stopped unexpectedly. Try again."}); terminal = true; cleanup(); });
  return true;
}
export function stopDictation(owner: WebContents, id: unknown) {
  if (active?.owner !== owner || active.id !== id) return false;
  active.process.stdin.write("stop\n");
  return true;
}
