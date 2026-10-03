import assert from 'node:assert/strict';
import { constants, openSync, closeSync, fstatSync, readSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('./appearance-channel-retire.py', import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
// Internal only. Original retained FDs, not caller paths or process selectors.
export function removeOriginalAppearanceChannel(descriptors, pins) {
  assert.equal(descriptors.length, 3);
  const interpreter = realpathSync('/usr/bin/python3');
  const flags = constants.O_RDONLY | constants.O_NOFOLLOW;
  const toolFd = openSync(source, flags), interpreterFd = openSync(interpreter, flags);
  try {
    const metadata = fd => {
      const s = fstatSync(fd, { bigint: true });
      assert.ok(s.isFile() && (s.mode & 0o022n) === 0n, 'Cleanup tool must be a protected regular file');
      assert.ok(s.size > 0n && s.size <= 134217728n, 'Cleanup tool size exceeded bound');
      const bytes = Buffer.alloc(Number(s.size)); let offset = 0;
      while (offset < bytes.length) { const n = readSync(fd, bytes, offset, bytes.length - offset, offset); assert.ok(n > 0); offset += n; }
      return { device: String(s.dev), inode: String(s.ino), mode: String(s.mode), uid: String(s.uid), sha256: digest(bytes) };
    };
    const tool = metadata(toolFd), python = metadata(interpreterFd);
    assert.equal(tool.uid, String(process.getuid()));
    assert.ok(fstatSync(toolFd).size < 1048576, 'Held cleanup source exceeded fixed read bound');
    const validate = () => {
      assert.deepEqual(metadata(toolFd), tool); assert.deepEqual(metadata(interpreterFd), python);
      for (const [path, expected] of [[source, tool], [interpreter, python]]) {
        const fd = openSync(path, flags);
        try { assert.deepEqual(metadata(fd), expected, 'Original cleanup tool replaced'); } finally { closeSync(fd); }
      }
    };
    validate();
    const result = execFileSync(interpreter, ['-I', '-c', "import os; exec(compile(os.pread(6, 1048576, 0), '<held-original-appearance-cleanup>', 'exec'))"], {
      input: JSON.stringify(pins), timeout: 5000, maxBuffer: 4096,
      env: { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' },
      stdio: ['pipe', 'pipe', 'pipe', ...descriptors, toolFd],
    });
    validate();
    assert.equal(result.toString('utf8'), '{"producer":"aux-original-appearance-channel-retirement","version":1,"removed":true}\n');
    return Object.freeze({ producer: 'aux-original-appearance-channel-retirement', version: 1, removed: true,
      tool: Object.freeze(tool), interpreter: Object.freeze(python) });
  } finally { closeSync(toolFd); closeSync(interpreterFd); }
}
