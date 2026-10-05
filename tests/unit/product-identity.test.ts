import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { productIdentity } from '../../scripts/lib/product-identity.mjs';

it('keeps docs-only commits and test evidence outside the product identity', () => {
  const root = mkdtempSync(join(tmpdir(), 'aux-product-identity-'));
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root });
  const commit = () => {
    git('add', '.');
    git('-c', 'user.name=Aux Test', '-c', 'user.email=fixture@aux.test', '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'fixture');
  };
  try {
    git('init', '--initial-branch=main');
    mkdirSync(join(root, 'apps'));
    writeFileSync(join(root, 'apps/product.ts'), 'export const product = 1;');
    commit();
    const initial = productIdentity(root);
    mkdirSync(join(root, 'docs'));
    writeFileSync(join(root, 'docs/evidence.md'), 'passed');
    writeFileSync(join(root, 'HANDOFF.md'), 'resume');
    writeFileSync(join(root, 'apps/product.test.ts'), 'test evidence');
    expect(productIdentity(root)).toEqual(initial);
    commit();
    expect(productIdentity(root)).toEqual(initial);
    // Large evidence inventories must not break the code-only identity reader.
    for (let index = 0; index < 4600; index++) {
      writeFileSync(join(root, 'docs', `evidence-${index}-${'r'.repeat(190)}.md`), 'passed');
    }
    commit();
    const inventory = execFileSync('git', ['ls-tree', '-r', '-z', 'HEAD'], { cwd: root, maxBuffer: 8 * 1024 * 1024 });
    expect(inventory.byteLength).toBeGreaterThan(1024 * 1024);
    expect(productIdentity(root)).toEqual(initial);
    writeFileSync(join(root, 'apps/new.ts'), 'export const next = 2;');
    expect(productIdentity(root)).toEqual({ ...initial, dirty: true, label: `${initial.commit}+dirty` });
    commit();
    expect(productIdentity(root).commit).not.toBe(initial.commit);
    expect(productIdentity(root).tree).not.toBe(initial.tree);
    expect(productIdentity(root).dirty).toBe(false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
