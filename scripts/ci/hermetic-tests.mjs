// Runs the Node part of `pnpm test` minus the host-only files in host-only-tests.txt.
import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { repoRoot } from '../lib/repo-root.mjs';

// Same sets as the `test` script in package.json.
const directories = ['vendor/provided', 'vendor/provided/provider-cli', 'scripts/release', 'vendor/aside/shims', 'scripts/lib', 'scripts/lib/__tests__'];
const all = [
  ...directories.flatMap(dir =>
    readdirSync(`${repoRoot}/${dir}`).filter(name => name.endsWith('.test.mjs')).sort().map(name => `${dir}/${name}`)),
  'scripts/test_launcher_port_contract.mjs',
];

const hostOnly = readFileSync(new URL('host-only-tests.txt', import.meta.url), 'utf8')
  .split('\n').map(line => line.replace(/#.*/, '').trim()).filter(Boolean);
const stale = hostOnly.filter(file => !all.includes(file));
if (stale.length) {
  console.error(`host-only-tests.txt lists files that pnpm test no longer runs:\n${stale.join('\n')}`);
  process.exit(1);
}

const files = all.filter(file => !hostOnly.includes(file));
console.log(`Running ${files.length} hermetic test files (${hostOnly.length} host-only files left out).`);
const { status } = spawnSync(process.execPath, ['--experimental-vm-modules', '--test', ...files], { cwd: repoRoot, stdio: 'inherit' });
process.exit(status ?? 1);
