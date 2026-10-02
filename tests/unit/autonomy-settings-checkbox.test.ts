import assert from "node:assert/strict";
import { expect, it } from "vitest";
import { nightSettingsUI } from "../host/journeys/autonomy.mjs";

// Actual native-window.swift elementRecord contract and original4ac AX evidence:
// AXCheckBox publishes a Boolean checked, never a text-field value.
const checkbox = { role: "AXCheckBox", name: "Enable overnight work", names: ["Enable overnight work"], enabled: true, focused: false };
function boundary(record: typeof checkbox & { checked?: boolean; value?: string }) {
  const presses: string[] = [];
  const nextTimeEdit = new Error("Fixture stops at the next physical time-edit boundary");
  return { presses, nextTimeEdit, t: {
    assert,
    ax: {
      key: async () => {},
      press: async (target: { name: string }) => { presses.push(target.name); },
      waitFor: async () => {},
      query: async (target: { name: string }) => target.name === "Enable overnight work" ? [record] : [],
      click: async () => { throw nextTimeEdit; },
    },
  } };
}

for (const [checked, enabled, toggle] of [[true, false, true], [false, true, true], [true, true, false], [false, false, false]] as const)
  it(`uses the actual checked state ${checked} when requesting ${enabled}`, async () => {
    const f = boundary({ ...checkbox, checked });
    await expect(nightSettingsUI(f.t, { enabled })).rejects.toBe(f.nextTimeEdit);
    expect(f.presses).toEqual(toggle ? ["Automations", "Enable overnight work"] : ["Automations"]);
  });

it("refuses missing native checkbox state before toggling or editing time", async () => {
  const f = boundary({ ...checkbox, value: "1" });
  await expect(nightSettingsUI(f.t, { enabled: true })).rejects.toThrow("Native overnight checkbox state is unavailable.");
  expect(f.presses).toEqual(["Automations"]);
});
