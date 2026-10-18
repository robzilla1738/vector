import { fork } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { expect, it } from "vitest";

// Exercise main's actual process listeners in an isolated child. Holding the
// real settings cleanup leaves shutdown between quiesce and its joined ACK.
it.each([false, true])(
  "joins repeated SIGTERM through actual runtime shutdown (failure=%s)",
  async (fail) => {
    const fixture = await childRuntime(fail);
    try {
      fixture.child.kill("SIGTERM");
      await fixture.stage("join-held");
      fixture.child.kill("SIGTERM");
      fixture.child.kill("SIGTERM");
      await delay(100);
      expect(fixture.child.signalCode).toBeNull();
      expect(fixture.child.exitCode).toBeNull();
      fixture.child.send("release");
      expect(await fixture.exited).toEqual({ code: fail ? 1 : 0, signal: null });
      expect(fixture.messages).toContainEqual({ stage: "joined" });
    } finally {
      await fixture.close();
    }
  },
);

it.each([false, true])(
  "public close restores listeners after joining and preserves failure=%s",
  async (fail) => {
    const fixture = await childRuntime(fail);
    try {
      fixture.child.send("close");
      await fixture.stage("join-held");
      fixture.child.send("inspect");
      expect(await fixture.stage("listeners")).toMatchObject({ term: 1, interrupt: 1 });
      fixture.child.send("release");
      expect(await fixture.stage(fail ? "public-failed" : "public-closed")).toMatchObject({
        term: 0,
        interrupt: 0,
        samePromise: true,
        ...(fail ? { error: "Runtime shutdown did not complete every authority boundary." } : {}),
      });
      expect(await fixture.exited).toEqual({ code: 0, signal: null });
    } finally {
      await fixture.close();
    }
  },
);

async function childRuntime(fail: boolean) {
  const directory = mkdtempSync(join(tmpdir(), "aux-shutdown-signal-"));
  const script = join(directory, "child.mjs");
  writeFileSync(
    script,
    `
    import { startRuntime } from ${JSON.stringify(new URL("../../apps/runtime/dist/main.js", import.meta.url).href)};
    import { SettingsService } from ${JSON.stringify(new URL("../../apps/runtime/dist/services/settings.js", import.meta.url).href)};
    let release;
    const held = new Promise(resolve => { release = resolve; });
    const original = SettingsService.prototype.close;
    SettingsService.prototype.close = async function () {
      process.send({ stage: "join-held" });
      await held;
      await original.call(this);
      await new Promise(resolve => process.send({ stage: "joined" }, resolve));
      if (${fail}) throw new Error("Synthetic settings retirement refusal");
    };
    const initialTerm = process.listenerCount("SIGTERM");
    const initialInterrupt = process.listenerCount("SIGINT");
    const runtime = await startRuntime({
      AUX_DATA_DIR: ${JSON.stringify(join(directory, "data"))},
      AUX_API_PORT: "0", AUX_LOAD_DOTENV: "0",
      AUX_SPEND_LEDGER_PATH: ${JSON.stringify(join(directory, "spend.sqlite"))}
    });
    const listeners = () => ({
      term: process.listenerCount("SIGTERM") - initialTerm,
      interrupt: process.listenerCount("SIGINT") - initialInterrupt
    });
    process.on("message", message => {
      if (message === "release") release();
      if (message === "inspect") process.send({ stage: "listeners", ...listeners() });
      if (message === "close") {
        const first = runtime.close();
        const samePromise = runtime.close() === first;
        first.then(
          () => { process.send({ stage: "public-closed", ...listeners(), samePromise }); process.disconnect(); },
          error => { process.send({ stage: "public-failed", ...listeners(), samePromise, error: error.message }); process.disconnect(); }
        );
      }
    });
    process.send({ stage: "ready" });
  `,
  );
  const child = fork(script, [], {
    cwd: directory,
    execArgv: [],
    stdio: ["ignore", "ignore", "ignore", "ipc"],
    env: {
      PATH: process.env.PATH,
      AUX_LOAD_DOTENV: "0",
      AUX_SPEND_LEDGER_PATH: join(directory, "spend.sqlite"),
    },
  });
  const messages: { stage: string; [key: string]: unknown }[] = [];
  child.on("message", (message) => messages.push(message as (typeof messages)[number]));
  const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) => {
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
  async function stage(name: string) {
    const existing = messages.find((message) => message.stage === name);
    if (existing) return existing;
    if (child.exitCode !== null || child.signalCode !== null)
      throw new Error(`Child exited before ${name}: ${child.exitCode}/${child.signalCode}`);
    return new Promise<(typeof messages)[number]>((resolve, reject) => {
      const timer = setTimeout(() => finish(new Error(`Child stage ${name} timed out`)), 10_000);
      const message = (value: unknown) => {
        if ((value as { stage?: string }).stage === name)
          finish(undefined, value as (typeof messages)[number]);
      };
      const exit = (code: number | null, signal: NodeJS.Signals | null) =>
        finish(new Error(`Child exited before ${name}: ${code}/${signal}`));
      function finish(error?: Error, value?: (typeof messages)[number]) {
        clearTimeout(timer);
        child.off("message", message);
        child.off("exit", exit);
        if (error) reject(error);
        else resolve(value!);
      }
      child.on("message", message);
      child.once("exit", exit);
    });
  }
  async function close() {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGKILL");
      await exited;
    }
    rmSync(directory, { recursive: true, force: true });
  }
  try {
    await stage("ready");
    return { child, exited, messages, stage, close };
  } catch (error) {
    await close();
    throw error;
  }
}
