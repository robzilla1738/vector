import { fileURLToPath } from 'node:url';

// Absolute path of the repository checkout, independent of the folder's name.
export const repoRoot = fileURLToPath(new URL('../..', import.meta.url)).replace(/\/$/, '');
