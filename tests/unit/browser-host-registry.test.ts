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
  it("retains the exact additive 0333 channel descriptor and refuses foreign or malformed receipts", () => {
    const capabilities = BrowserHostMethods.capabilities.result;
    expect(RuntimeHostMethods["native.capabilities"].result).toBe(capabilities);
    const descriptor = jsonSchema(capabilities).properties!.nativeAppearanceFileChannel;
    expect(createHash("sha256").update(JSON.stringify(descriptor)).digest("hex")).toBe(
      "bed49294c7e5f04acf53bd53c1ab49a2b694ae8432274731dae77d0945081283",
    );
    const original = { buildId: "original-build", sourceCommit: "a".repeat(40), methods: [] };
    const channel = {
      producer: "aux-native-appearance-file-channel",
      version: 1,
      pid: 733,
      processUuid: "1".repeat(32),
      processStartMachTicks: "100",
      buildId: "original-build",
      sourceCommit: "a".repeat(40),
      nonce: "2".repeat(32),
      basename: "native-appearance-channel.jsonl",
      rootDevice: "1",
      rootInode: "2",
      profileName: "Default",
      profileDevice: "1",
      profileInode: "3",
      fileDevice: "1",
      fileInode: "4",
      publicKeySpkiHex: "b".repeat(88),
      headerSha256: "c".repeat(64),
    };
    expect(capabilities.parse(original)).toEqual(original);
    expect(capabilities.parse({ ...original, nativeAppearanceFileChannel: channel })).toEqual({
      ...original,
      nativeAppearanceFileChannel: channel,
    });
    for (const change of [
      { producer: "foreign" },
      { processUuid: "0".repeat(32) },
      { processStartMachTicks: "18446744073709551616" },
      { pid: 2147483648 },
      { basename: "foreign.jsonl" },
      { nonce: "2".repeat(31) },
      { unexpected: true },
    ])
      expect(
        capabilities.safeParse({ ...original, nativeAppearanceFileChannel: { ...channel, ...change } })
          .success,
      ).toBe(false);
  });

  it("combines the exact browser and runtime entries without aliases or replacements", () => {
    expect(Object.keys(HostMethods)).toEqual([
      ...Object.keys(BrowserHostMethods),
      ...Object.keys(RuntimeHostMethods),
    ]);
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
    expect(Object.keys(BrowserHostMethods).some((id) => id.startsWith("native."))).toBe(false);
  });
});


it("admits the full Chromium default zoom range and refuses out-of-range or fractional writes", () => {
  const args = BrowserHostMethods.defaultPageZoom.args;
  expect(args.safeParse([]).success).toBe(true);
  for (const percent of [25, 33, 50, 100, 200, 250, 300, 400, 500]) expect(args.safeParse([percent]).success).toBe(true);
  for (const percent of [24, 501, 33.5, NaN, Infinity]) expect(args.safeParse([percent]).success).toBe(false);
});
