import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  macNativeMessagingLocations,
  scanNativeMessagingLocations,
  validateNativeMessagingManifest,
} from "./native-messaging-manifests.mjs";

const directories = [];
const fixture = () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-native-manifest-test-"));
  directories.push(dir);
  const host = join(dir, "host");
  writeFileSync(host, "#!/bin/sh\nexit 0\n");
  chmodSync(host, 0o700);
  const file = join(dir, "aux.synthetic.json");
  const manifest = {
    name: "aux.synthetic",
    description: "Synthetic fixture",
    path: host,
    type: "stdio",
    allowed_origins: [`chrome-extension://${"a".repeat(32)}/`],
  };
  const write = (value) => writeFileSync(file, JSON.stringify(value));
  write(manifest);
  return { dir, host, file, manifest, write };
};
afterEach(() => {
  while (directories.length) rmSync(directories.pop(), { recursive: true, force: true });
});

test("accepts one exact extension grant and a present executable", () => {
  const { file } = fixture();
  assert.deepEqual(validateNativeMessagingManifest(file), {
    valid: true,
    name: "aux.synthetic",
    allowedOrigins: [`chrome-extension://${"a".repeat(32)}/`],
  });
});

test("rejects malformed names, paths, host type and broad or unrelated origins", () => {
  const { file, manifest, host, write } = fixture();
  const invalid = [
    [{ ...manifest, name: "aux..synthetic" }, "name"],
    [{ ...manifest, name: "aux.other" }, "name"],
    [{ ...manifest, path: "relative/host" }, "path"],
    [{ ...manifest, path: join(host, "missing") }, "host_not_executable"],
    [{ ...manifest, type: "http" }, "description_or_type"],
    [{ ...manifest, allowed_origins: ["chrome-extension://*/"] }, "allowed_origins"],
    [{ ...manifest, allowed_origins: ["https://example.test/"] }, "allowed_origins"],
    [{ ...manifest, allowed_origins: [] }, "allowed_origins"],
    [{ ...manifest, supports_native_initiated_connections: "yes" }, "native_initiated_flag"],
  ];
  for (const [value, reason] of invalid) {
    write(value);
    assert.equal(validateNativeMessagingManifest(file).reason, reason);
  }
  write(manifest);
  chmodSync(host, 0o600);
  assert.equal(validateNativeMessagingManifest(file).reason, "host_not_executable");
});

test("sanitizes system inventory and honors active user-data discovery", () => {
  const { dir, file } = fixture();
  const userData = join(dir, "disposable-profile");
  const locations = macNativeMessagingLocations(userData, dir);
  assert.equal(locations[0].path, join(userData, "NativeMessagingHosts"));
  assert.ok(locations.some((item) => item.label === "chrome-user-default"));
  assert.ok(locations.some((item) => item.label === "chromium-global"));
  const inventory = scanNativeMessagingLocations([{ label: "test", path: dir }]);
  assert.deepEqual(inventory[0], {
    location: "test",
    present: true,
    manifests: 1,
    valid: 1,
    invalid: 0,
    truncated: false,
    onePassword: "absent",
  });
  assert.ok(!JSON.stringify(inventory).includes(file));
  assert.ok(!JSON.stringify(inventory).includes("chrome-extension://"));
  mkdirSync(join(dir, "empty"));
  assert.equal(scanNativeMessagingLocations([{ label: "empty", path: join(dir, "empty") }])[0].manifests, 0);
});
