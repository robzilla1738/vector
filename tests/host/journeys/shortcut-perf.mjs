import { execFileSync } from "node:child_process";
import { setTabLayout } from "../lib/tab-layout.mjs";
export const journey = {
  id: "shortcut-perf",
  title: "Measure HID shortcut to AX effect on AC power",
  features: ["commandRegistry"],
  devAcceptance: ["commandRegistry", "spaces", "layouts"],
  needs: ["accessibility", "screen-recording"],
  model: "none",
  launch: {},
  timeoutMs: 90_000,
  owner: "L1",
};
export async function run(t) {
  const power = execFileSync("/usr/bin/pmset", ["-g", "batt"], { encoding: "utf8", timeout: 5000 });
  t.assert.match(power, /AC Power/, "Shortcut performance trials require AC power");
  const red = await t.rpc("pages.open", { url: `${t.fixture.url}/red`, activate: true });
  await t.until("Red ready", async () =>
    (await t.rpc("pages.list")).some((page) => page.pageId === red.pageId && !page.loading),
  );
  await setTabLayout(t, "vertical", {
    role: "AXRadioButton",
    name: "^Aux native Red(?: Close Aux native Red)?$",
    match: "regex",
    scope: "shell",
    index: 0,
  });
  let observedP95 = Infinity;
  await t.step(
    "record 20 physical shortcut effect trials",
    { kind: "ui", features: ["commandRegistry"] },
    async () => {
      const samples = [];
      for (let trial = 0; trial < 20; trial++) {
        await t.ax.click({ role: "AXWebArea", name: "Aux native Red", scope: "page", index: 0 });
        const expanded =
          (await t.ax.query({ role: "AXButton", name: "Hide sidebar", scope: "shell" })).length > 0;
        const started = performance.now();
        await t.ax.key("command+s", "hid");
        let observed = false;
        while (performance.now() - started < 500) {
          observed =
            (
              await t.ax.query({
                role: "AXButton",
                name: expanded ? "Show sidebar" : "Hide sidebar",
                scope: "shell",
              })
            ).length > 0;
          if (observed) break;
        }
        t.assert.ok(observed, `Trial ${trial + 1} produced no sidebar effect`);
        samples.push(performance.now() - started);
        await new Promise((resolve) => setTimeout(resolve, 850));
      }
      const sorted = [...samples].sort((a, b) => a - b),
        p95 = sorted[Math.ceil(sorted.length * 0.95) - 1];
      await t.capture("shortcut-performance");
      const evidence = {
        ax: await t.ax.dump(),
        rpc: {
          power,
          samplesMs: samples,
          p95Ms: p95,
          measurement: "HID request start through first AX observation; includes helper/IPC overhead",
          workspace: await t.rpc("workspace.get"),
        },
      };
      observedP95 = p95;
      return evidence;
    },
  );
  await t.step(
    "check shortcut effect p95 budget",
    { kind: "rpc", features: ["commandRegistry"] },
    async () => {
      t.assert.ok(observedP95 <= 50, `Shortcut effect p95 ${observedP95.toFixed(2)}ms exceeds 50ms`);
      return { rpc: { p95Ms: observedP95, budgetMs: 50 } };
    },
  );
}
