import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { BrowserHostMethods, HostEvents as BrowserHostEvents } from "@aux/contracts/browser-host-methods";
import { RuntimeHostMethods } from "@aux/contracts/runtime-host-methods";
import { HostMethods, HostEvents } from "@aux/contracts/host-methods";

const jsonSchema = (schema: z.ZodType) => z.toJSONSchema(schema, { unrepresentable: "any" });

describe("separate browser host registry", () => {
  it("retains all original method and event schemas, metadata, and key order", () => {
    const record = {
      methods: Object.entries(HostMethods).map(([id, spec]) => ({
        id, owner: spec.owner, feature: spec.feature, profileScoped: spec.profileScoped,
        trusted: spec.trusted, args: jsonSchema(spec.args), result: jsonSchema(spec.result),
        ...("wireArgs" in spec ? { wireArgs: jsonSchema(spec.wireArgs) } : {}),
      })),
      events: Object.entries(HostEvents).map(([id, spec]) => ({
        id, owner: spec.owner, feature: spec.feature, profileScoped: spec.profileScoped,
        trusted: spec.trusted, payload: jsonSchema(spec.payload),
      })),
    };
    // 0333 adds one optional private appearance-channel descriptor to capabilities.
    // Keep the pre-split fingerprint for every original schema/metadata/key-order byte.
    for (const id of ["capabilities", "native.capabilities"]) {
      const capabilities = record.methods.find(entry => entry.id === id)!;
      const originalProperties = { ...capabilities.result.properties };
      expect(Object.keys(originalProperties)).toEqual([
        "buildId", "sourceCommit", "methods", "qualifiedFeatures", "nativeAppearanceFileChannel",
        "developmentAcceptanceRequested", "testClockScale", "loopbackServicesUrl",
      ]);
      delete originalProperties.nativeAppearanceFileChannel;
      capabilities.result = { ...capabilities.result, properties: originalProperties };
    }
    // 0352 adds exactly one authenticated runtime capture entry. Preserve the
    // original fingerprint separately from its exact additive schema/metadata.
    const captureIndex = record.methods.findIndex(entry => entry.id === "native.personCapture");
    expect(record.methods.filter(entry => entry.id === "native.personCapture")).toHaveLength(1);
    expect(record.methods[captureIndex - 1].id).toBe("native.egressRevoke");
    expect(record.methods[captureIndex + 1].id).toBe("native.personReadContext");
    expect(createHash("sha256").update(JSON.stringify(record.methods[captureIndex])).digest("hex"))
      .toBe("225883491bbdcda2edadd87d7a482531257db9f8cb40555faa6e554def15d399");
    record.methods.splice(captureIndex, 1);
    // Captured from the original complete registry before its source was moved.
    expect(createHash("sha256").update(JSON.stringify(record)).digest("hex"))
      .toBe("fa75c457314c47a4b44e29bb7bd73ab1fe4f45a064c75d8e2eda04554b464c3d");
  });

  it("retains the exact additive 0333 channel descriptor and refuses foreign or malformed receipts", () => {
    const capabilities = BrowserHostMethods.capabilities.result;
    expect(RuntimeHostMethods["native.capabilities"].result).toBe(capabilities);
    const descriptor = jsonSchema(capabilities).properties!.nativeAppearanceFileChannel;
    expect(createHash("sha256").update(JSON.stringify(descriptor)).digest("hex"))
      .toBe("bed49294c7e5f04acf53bd53c1ab49a2b694ae8432274731dae77d0945081283");
    const original = { buildId: "original-build", sourceCommit: "a".repeat(40), methods: [], qualifiedFeatures: [] };
    const channel = {
      producer: "aux-native-appearance-file-channel", version: 1, pid: 733,
      processUuid: "1".repeat(32), processStartMachTicks: "100", buildId: "original-build",
      sourceCommit: "a".repeat(40), nonce: "2".repeat(32), basename: "native-appearance-channel.jsonl",
      rootDevice: "1", rootInode: "2", profileName: "Default", profileDevice: "1", profileInode: "3",
      fileDevice: "1", fileInode: "4", publicKeySpkiHex: "b".repeat(88), headerSha256: "c".repeat(64),
    };
    expect(capabilities.parse(original)).toEqual(original);
    expect(capabilities.parse({ ...original, nativeAppearanceFileChannel: channel }))
      .toEqual({ ...original, nativeAppearanceFileChannel: channel });
    for (const change of [
      { producer: "foreign" }, { processUuid: "0".repeat(32) }, { processStartMachTicks: "18446744073709551616" },
      { pid: 2147483648 }, { basename: "foreign.jsonl" }, { nonce: "2".repeat(31) }, { unexpected: true },
    ]) expect(capabilities.safeParse({ ...original, nativeAppearanceFileChannel: { ...channel, ...change } }).success).toBe(false);
  });

  it("combines the exact browser and runtime entries without aliases or replacements", () => {
    expect(Object.keys(BrowserHostMethods)).toHaveLength(154);
    expect(Object.keys(RuntimeHostMethods)).toHaveLength(71);
    expect(Object.keys(RuntimeHostMethods).filter(id => id !== "native.personCapture")).toHaveLength(70);
    expect(Object.keys(HostMethods)).toEqual([...Object.keys(BrowserHostMethods), ...Object.keys(RuntimeHostMethods)]);
    for (const [id, spec] of Object.entries(BrowserHostMethods)) {
      expect(spec.owner).toBe("browser");
      expect(spec.trusted).toBe("aux-webui");
      expect(HostMethods[id as keyof typeof HostMethods]).toBe(spec);
    }
    for (const [id, spec] of Object.entries(RuntimeHostMethods)) {
      expect(spec.owner).toBe("runtime");
      expect(spec.trusted).toBe("authenticated-runtime");
      expect(HostMethods[id as keyof typeof HostMethods]).toBe(spec);
    }
    expect(HostEvents).toBe(BrowserHostEvents);
  });

  it("keeps runtime methods out of the generated production browser client dependency", () => {
    const source = readFileSync(resolve("apps/shell/src/host/client.generated.ts"), "utf8");
    expect(source).toContain('from "@aux/contracts/browser-host-methods"');
    expect(source).not.toContain('from "@aux/contracts/host-methods"');
    expect(source).not.toContain("runtime-host-methods");
    expect(Object.keys(BrowserHostMethods).some(id => id.startsWith("native."))).toBe(false);
  });
});
