import { join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

// Frozen copy of the pinned 1.26.1016.1852 inputs. Tests read it because the installed Aside keeps updating.
export const frozenSnapshotRoot = join(repoRoot, 'out/provided-source-snapshot-1.26.1016.1852');
export const frozenRoots = Object.freeze(Object.fromEntries(
  ['agent', 'vault', 'daemon', 'cli', 'runtime', 'memory'].map(name => [name, join(frozenSnapshotRoot, name)])
    .concat([['computerUse', join(frozenSnapshotRoot, 'computer-use')]]),
));
