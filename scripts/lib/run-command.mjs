import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

/** Keep descendants within the caller's command lifetime, including cancellation. */
export async function runCommand(command, args, options = {}) {
  const grouped = process.platform !== "win32";
  const child = spawn(command, args, { ...options, stdio: "inherit", detached: grouped });
  let interrupted;
  let forceTimer;
  function signal(signal) {
    if (!child.pid) return false;
    try {
      if (grouped) process.kill(-child.pid, signal);
      else return child.kill(signal);
      return true;
    } catch (error) {
      if (error.code === "ESRCH") return false;
      throw error;
    }
  }
  const stop = (reason) => {
    interrupted ??= reason;
    signal("SIGTERM");
    forceTimer ??= setTimeout(() => signal("SIGKILL"), 1_000);
    forceTimer.unref();
  };
  const onInterrupt = () => stop("SIGINT");
  const onTerminate = () => stop("SIGTERM");
  process.on("SIGINT", onInterrupt);
  process.on("SIGTERM", onTerminate);
  try {
    await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, exitSignal) =>
        code === 0 && !interrupted
          ? resolve()
          : reject(new Error(`${command} exited with ${interrupted ?? exitSignal ?? code}`)),
      );
    });
  } finally {
    // A command can exit before its compiler/browser children finish retiring.
    // The build lock and disposable Profile must outlive the entire group.
    try {
      if (grouped && signal("SIGTERM")) {
        const forceAt = Date.now() + 1_000;
        while (signal(0)) {
          if (Date.now() >= forceAt) signal("SIGKILL");
          await delay(20);
        }
      }
    } finally {
      clearTimeout(forceTimer);
      process.off("SIGINT", onInterrupt);
      process.off("SIGTERM", onTerminate);
    }
  }
}
