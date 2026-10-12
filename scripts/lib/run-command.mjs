import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { setTimeout as delay } from "node:timers/promises";

const processInventory = promisify(execFile);

async function processGroupMembers(groupId) {
  const { stdout } = await processInventory("/bin/ps", ["-A", "-o", "pid=,pgid=,uid="], {
    timeout: 2_000,
    maxBuffer: 4 * 1024 * 1024,
    encoding: "utf8",
  });
  const members = [];
  for (const line of stdout.split("\n")) {
    if (!line.trim()) continue;
    const fields = line.trim().split(/\s+/).map(Number);
    if (
      fields.length !== 3 ||
      fields.some((field) => !Number.isSafeInteger(field)) ||
      fields[0] < 0 ||
      fields[1] < 0
    )
      throw new Error("Process-group retirement inventory is invalid");
    if (fields[1] === groupId) members.push({ pid: fields[0], uid: fields[2] });
  }
  return members;
}

/** Keep descendants within the caller's command lifetime, including cancellation. */
export async function runCommand(command, args, options = {}) {
  const grouped = process.platform !== "win32";
  const child = spawn(command, args, { ...options, stdio: "inherit", detached: grouped });
  let interrupted;
  let childExited = false;
  let retirementError;
  let commandError;
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
  const retainFailure = (error) => {
    if (!retirementError) {
      retirementError = error;
      console.error("Command cleanup is not acknowledged; retaining its launch ownership:", error.message);
    }
  };
  const stop = (reason) => {
    interrupted ??= reason;
    if (childExited) return;
    try {
      signal("SIGTERM");
    } catch (error) {
      retainFailure(error);
    }
    forceTimer ??= setTimeout(() => {
      if (childExited) return;
      try {
        signal("SIGKILL");
      } catch (error) {
        retainFailure(error);
      }
    }, 1_000);
    forceTimer.unref();
  };
  const onInterrupt = () => stop("SIGINT");
  const onTerminate = () => stop("SIGTERM");
  process.on("SIGINT", onInterrupt);
  process.on("SIGTERM", onTerminate);
  try {
    await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, exitSignal) => {
        childExited = true;
        if (code === 0 && !interrupted) resolve();
        else reject(new Error(`${command} exited with ${interrupted ?? exitSignal ?? code}`));
      });
    });
  } catch (error) {
    commandError = error;
  } finally {
    // A command can exit before its compiler/browser children finish retiring.
    // The build lock and disposable Profile must outlive the entire group.
    try {
      if (grouped && child.pid) {
        const forceAt = Date.now() + 1_000;
        let termSent = false;
        while (true) {
          try {
            const members = await processGroupMembers(child.pid);
            // Only this actual OS witness releases the caller's lock/Profile.
            if (members.length === 0) break;
            if (
              members.some(
                (member) => member.uid !== process.getuid() || (childExited && member.pid === child.pid),
              )
            )
              throw new Error("The original command process group can no longer be safely identified");
            if (!termSent || Date.now() >= forceAt) {
              signal(termSent ? "SIGKILL" : "SIGTERM");
              termSent = true;
            }
          } catch (error) {
            // An EPERM on a reaped macOS group, inventory failure or surviving
            // descendant is not an ACK. Keep the real launcher alive and join
            // the original group before surfacing the retained failure.
            retainFailure(error);
          }
          await delay(retirementError ? 100 : 20);
        }
      }
    } finally {
      clearTimeout(forceTimer);
      process.off("SIGINT", onInterrupt);
      process.off("SIGTERM", onTerminate);
    }
  }
  if (commandError && retirementError)
    throw new AggregateError(
      [commandError, retirementError],
      "Command failed and its cleanup required retirement recovery",
    );
  if (retirementError) throw retirementError;
  if (commandError) throw commandError;
}
