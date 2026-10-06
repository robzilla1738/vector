// Pure Python filesystem fixtures. No app/helper or native measurement operation.
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
test("descriptor-bound fixture writer refuses hostile root and profile replacements", () => {
  execFileSync(
    "/usr/bin/python3",
    ["-I", fileURLToPath(new URL("./performance_mailbox_writer_test.py", import.meta.url))],
    { timeout: 10000, stdio: "pipe" },
  );
});
