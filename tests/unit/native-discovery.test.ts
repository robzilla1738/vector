import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { expect, it, vi } from "vitest";
import { listNativeProfiles, resolveNativeUserDataDir, resolveRuntimeDescriptor } from "@aux/contracts/installation";
import { requireLiveRuntime } from "../../packages/sdk/src/index.js";

it("discovers native Profile names without requiring a running browser", () => {
  const root = mkdtempSync(join(tmpdir(), "aux-native-discovery-"));
  try {
    expect(listNativeProfiles(root)).toEqual([]);
    writeFileSync(join(root, "Local State"), JSON.stringify({ profile: { last_used: "Profile 1", info_cache: {
      Default: { name: "Personal" }, "Profile 1": { name: "Work" }, "../escape": { name: "Bad" },
    } } }));
    expect(listNativeProfiles(root)).toEqual([
      { id: "Default", name: "Personal", current: false, archived: false },
      { id: "Profile 1", name: "Work", current: true, archived: false },
    ]);
    expect(resolveRuntimeDescriptor({ AUX_USER_DATA_DIR: root })).toBe(join(root, "Profile 1", "Aux Runtime Data", "runtime.json"));
    expect(resolveRuntimeDescriptor({ AUX_USER_DATA_DIR: root, profile: "personal" })).toBe(join(root, "Default", "Aux Runtime Data", "runtime.json"));
    expect(() => resolveRuntimeDescriptor({ AUX_USER_DATA_DIR: root, profile: "../escape" })).toThrow("Unknown Profile");
    expect(resolveRuntimeDescriptor({ AUX_DATA_DIR: root })).toBe(join(root, "runtime.json"));
    expect(resolveNativeUserDataDir({}, "/fixture")).toBe("/fixture/Library/Application Support/Aux");
    expect(() => resolveNativeUserDataDir({ AUX_USER_DATA_DIR: "relative" })).toThrow("absolute");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it("refuses ambiguous names and malformed Profile metadata", () => {
  const root = mkdtempSync(join(tmpdir(), "aux-native-discovery-"));
  try {
    mkdirSync(join(root, "Profile 1"));
    writeFileSync(join(root, "Local State"), JSON.stringify({ profile: { info_cache: {
      Default: { name: "Work" }, "Profile 1": { name: "Work" },
    } } }));
    expect(() => resolveRuntimeDescriptor({ AUX_USER_DATA_DIR: root, profile: "Work" })).toThrow(/Ambiguous Profile.*Default.*Profile 1/);
    writeFileSync(join(root, "Local State"), "invalid");
    expect(() => listNativeProfiles(root)).toThrow();
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it("requires both a live pid and ready runtime health", async () => {
  const health = vi.fn(async () => new Response(JSON.stringify({ service: "aux-runtime", ready: true })));
  const connection = { pid: process.pid, port: 12345, token: "fixture" };
  await expect(requireLiveRuntime(connection, health)).resolves.toBeUndefined();
  const offline = vi.fn(async () => new Response("{}", { status: 503 }));
  await expect(requireLiveRuntime(connection, offline)).rejects.toThrow("not ready");
  await expect(requireLiveRuntime({ ...connection, pid: 2147483647 }, health)).rejects.toThrow("no longer running");
  await expect(requireLiveRuntime({ ...connection, pid: undefined }, health)).rejects.toThrow("no live process");
  expect(health).toHaveBeenCalledTimes(1);
});
