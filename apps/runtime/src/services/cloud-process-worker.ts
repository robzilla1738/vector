import { spawn } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { readFile, readdir, readlink } from "node:fs/promises";
import type { CloudSupervisor } from "@aux/contracts/coding-processes";
import type { CloudListener } from "@aux/contracts/cloud-preview";
export const CLOUD_PROCESS_HEADER = "\u001eAUX_PROCESS:";
function procStat(text: string) {
  const fields = text
    .slice(text.lastIndexOf(")") + 2)
    .trim()
    .split(/\s+/);
  if (fields.length < 20 || !/^\d+$/.test(fields[19]!)) throw new Error("Invalid process identity.");
  return { groupPid: Number(fields[2]), startTicks: fields[19]! };
}

/** Inspect Linux socket ownership only inside the captured provider Session. */
export async function cloudListeners(
  supervisor: CloudSupervisor,
  port?: number,
  procRoot = "/proc",
): Promise<CloudListener[]> {
  const stat = async (pid: number) => procStat(await readFile(`${procRoot}/${pid}/stat`, "utf8"));
  const current = async () => {
    const [leader, group] = await Promise.all([stat(supervisor.pid), stat(supervisor.groupPid)]);
    if (
      leader.startTicks !== supervisor.startTicks ||
      group.startTicks !== supervisor.groupStartTicks ||
      group.groupPid !== supervisor.groupPid
    )
      throw new Error("The original cloud process group retired.");
  };
  await current();
  const sockets = new Map<string, number>();
  for (const protocol of ["tcp", "tcp6"]) {
    for (const line of (await readFile(`${procRoot}/net/${protocol}`, "utf8")).trim().split("\n").slice(1)) {
      const fields = line.trim().split(/\s+/),
        local = fields[1]?.split(":"),
        inode = fields[9];
      if (fields[3] !== "0A" || !local || !inode || !/^0+$/.test(local[0]!)) continue;
      const candidate = Number.parseInt(local[1]!, 16);
      if (Number.isInteger(candidate) && candidate > 0 && candidate <= 65535 && (!port || candidate === port))
        sockets.set(inode, candidate);
    }
  }
  const listeners: CloudListener[] = [];
  for (const entry of await readdir(procRoot)) {
    if (!/^\d+$/.test(entry)) continue;
    const pid = Number(entry);
    let before;
    try {
      before = await stat(pid);
    } catch {
      continue;
    }
    if (before.groupPid !== supervisor.groupPid) continue;
    let descriptors: string[];
    try {
      descriptors = await readdir(`${procRoot}/${pid}/fd`);
    } catch {
      continue;
    }
    for (const fd of descriptors) {
      if (!/^\d+$/.test(fd)) continue;
      try {
        const path = `${procRoot}/${pid}/fd/${fd}`,
          target = await readlink(path);
        const inode = /^socket:\[(\d+)\]$/.exec(target)?.[1],
          listenerPort = inode ? sockets.get(inode) : undefined;
        if (!inode || !listenerPort) continue;
        const after = await stat(pid);
        if (
          after.startTicks !== before.startTicks ||
          after.groupPid !== supervisor.groupPid ||
          (await readlink(path)) !== target
        )
          continue;
        listeners.push({ pid, startTicks: before.startTicks, fd: Number(fd), inode, port: listenerPort });
      } catch {
        /* A closing process or descriptor is not a current listener. */
      }
    }
  }
  await current();
  return listeners.sort((a, b) => a.port - b.port || a.pid - b.pid || a.fd - b.fd);
}

export async function superviseCloudProcess(input: {
  command: string;
  workdir: string;
  processId: string;
  sessionId: string;
}): Promise<void> {
  if (realpathSync(process.cwd()) !== input.workdir)
    throw new Error("The original process directory changed.");
  const gate = `IFS= read -r _aux_ready || exit 125\n[ "$_aux_ready" = "${input.processId}" ] || exit 125\n${input.command}`;
  const child = spawn("/bin/bash", ["-lc", gate], { detached: true, stdio: ["pipe", "inherit", "inherit"] });
  child.stdin.on("error", () => {});
  let stopping = false;
  const kill = () => {
    if (child.pid)
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
      }
  };
  process.on("SIGTERM", () => {
    stopping = true;
    kill();
  });
  process.on("SIGINT", () => {
    stopping = true;
    kill();
  });
  process.on("exit", kill);
  child.on("close", (code) => {
    kill();
    process.exit(stopping ? 143 : (code ?? 125));
  });
  try {
    await new Promise<void>((resolve, reject) => {
      child.once("spawn", resolve);
      child.once("error", reject);
    });
    const supervisor: CloudSupervisor = {
      pid: process.pid,
      startTicks: procStat(readFileSync("/proc/self/stat", "utf8")).startTicks,
      groupPid: child.pid!,
      groupStartTicks: procStat(readFileSync(`/proc/${child.pid}/stat`, "utf8")).startTicks,
    };
    // This is the first stdout write; the command cannot write anything until its gate opens.
    process.stdout.write(
      CLOUD_PROCESS_HEADER +
        JSON.stringify({ processId: input.processId, sessionId: input.sessionId, supervisor }) +
        "\n",
    );
    child.stdin.end(`${input.processId}\n`);
  } catch (error) {
    kill();
    throw error;
  }
}
