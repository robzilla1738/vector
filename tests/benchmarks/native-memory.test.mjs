import assert from "node:assert/strict";
import { test } from "node:test";
import { memoryFootprints, shellRoleWitness } from "./native-memory.mjs";

const witness = { event: "AUX_PERF_SHELL_ROLE", browserPid: 20, pid: 21, startMachTicks: "9007199254740993" };
const runtimePath = "/actual/Aux.app/Contents/Helpers/Aux Runtime";
const memory = () => ({
  processes: [
    { pid: 20, startMachTicks: "1", physicalFootprintBytes: 100 },
    { pid: 21, startMachTicks: witness.startMachTicks, role: "shell", physicalFootprintBytes: 40 },
    {
      pid: 22,
      startMachTicks: "9007199254740994",
      role: "runtime",
      executablePath: runtimePath,
      physicalFootprintBytes: 30,
    },
  ],
});

test("retains exact shell birth ticks and rejects duplicate or retired original owners", () => {
  const collector = shellRoleWitness(20);
  collector.observe("Unrelated Chromium diagnostic");
  assert.throws(() => collector.current(), /unavailable/);
  collector.observe(JSON.stringify(witness));
  assert.deepEqual(collector.current(), witness);
  collector.observe(JSON.stringify(witness));
  assert.throws(() => collector.current(), /Duplicate/);
  const retired = shellRoleWitness(20);
  retired.observe(JSON.stringify(witness));
  retired.observe(JSON.stringify({ event: "AUX_PERF_SHELL_RETIRED", browserPid: 20 }));
  assert.throws(() => retired.current(), /retired/);
});

test("reports full kernel process sums and exact Aux roles; stock roles stay not applicable", () => {
  assert.deepEqual(memoryFootprints(memory(), witness, runtimePath), {
    physicalFootprintBytes: 170,
    shellPhysicalFootprintBytes: 40,
    runtimePhysicalFootprintBytes: 30,
  });
  assert.deepEqual(memoryFootprints({ processes: [memory().processes[0]] }), {
    physicalFootprintBytes: 100,
    shellPhysicalFootprintBytes: null,
    runtimePhysicalFootprintBytes: null,
  });
});

test("refuses reused shell PIDs, runtime path substitutions, and ambiguous process lists", () => {
  const reused = memory();
  reused.processes[1].startMachTicks = "9007199254740995";
  assert.throws(() => memoryFootprints(reused, witness, runtimePath), /generation changed/);
  const foreign = memory();
  foreign.processes[2].executablePath = "/another/Aux Runtime";
  assert.throws(() => memoryFootprints(foreign, witness, runtimePath), /original app bundle/);
  const duplicate = memory();
  duplicate.processes.push({ ...duplicate.processes[2] });
  assert.throws(() => memoryFootprints(duplicate, witness, runtimePath), /Duplicate/);
  const missing = memory();
  missing.processes.pop();
  assert.throws(() => memoryFootprints(missing, witness, runtimePath), /runtime footprint required/);
});
