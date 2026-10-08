import assert from "node:assert/strict";

/** One original native shell owner; a duplicate or retired owner cannot be adopted. */
export function shellRoleWitness(browserPid) {
  let witness;
  let failure;
  return {
    observe(line) {
      if (!line.includes('"AUX_PERF_SHELL_')) return;
      try {
        assert.ok(line.length <= 512, "Oversized native shell witness");
        const value = JSON.parse(line);
        assert.equal(value.browserPid, browserPid, "Shell witness belongs to another browser");
        if (value.event === "AUX_PERF_SHELL_RETIRED") throw new Error("Original shell owner retired");
        assert.equal(value.event, "AUX_PERF_SHELL_ROLE");
        assert.deepEqual(Object.keys(value).sort(), ["browserPid", "event", "pid", "startMachTicks"]);
        assert.ok(Number.isInteger(value.pid) && value.pid > 0 && value.pid !== browserPid);
        assert.match(value.startMachTicks ?? "", /^[1-9][0-9]*$/);
        assert.ok(!witness, "Duplicate shell role witness");
        witness = value;
      } catch (error) {
        failure ??= error;
      }
    },
    current() {
      if (failure) throw failure;
      assert.ok(witness, "Native shell role witness is unavailable");
      return { ...witness };
    },
  };
}

export function memoryFootprints(memory, shellWitness, runtimePath) {
  assert.ok(Array.isArray(memory.processes) && memory.processes.length > 0, "No physical footprint rows");
  const rows = new Map();
  let physicalFootprintBytes = 0;
  for (const row of memory.processes) {
    assert.ok(Number.isInteger(row.pid) && row.pid > 0 && !rows.has(row.pid), "Duplicate or invalid PID");
    assert.match(row.startMachTicks ?? "", /^[1-9][0-9]*$/);
    assert.ok(Number.isSafeInteger(row.physicalFootprintBytes) && row.physicalFootprintBytes >= 0);
    rows.set(row.pid, row);
    physicalFootprintBytes += row.physicalFootprintBytes;
  }
  assert.ok(Number.isSafeInteger(physicalFootprintBytes));
  if (!shellWitness) {
    assert.ok(
      memory.processes.every((row) => row.role === undefined),
      "Stock has no Aux process roles",
    );
    return { physicalFootprintBytes, shellPhysicalFootprintBytes: null, runtimePhysicalFootprintBytes: null };
  }
  const shell = memory.processes.filter((row) => row.role === "shell");
  const runtime = memory.processes.filter((row) => row.role === "runtime");
  assert.equal(shell.length, 1, "One original shell footprint required");
  assert.equal(runtime.length, 1, "One exact bundled runtime footprint required");
  assert.equal(shell[0].pid, shellWitness.pid, "Shell role PID changed");
  assert.equal(shell[0].startMachTicks, shellWitness.startMachTicks, "Shell PID generation changed");
  assert.notEqual(runtime[0].pid, shellWitness.browserPid);
  assert.equal(runtime[0].executablePath, runtimePath, "Runtime executable is outside original app bundle");
  return {
    physicalFootprintBytes,
    shellPhysicalFootprintBytes: shell[0].physicalFootprintBytes,
    runtimePhysicalFootprintBytes: runtime[0].physicalFootprintBytes,
  };
}
