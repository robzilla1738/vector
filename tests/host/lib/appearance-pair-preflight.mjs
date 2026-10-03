import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readPackagedRuntimePair } from './packaged-runtime-pair-artifact.mjs';
import { readNativeWindowCompilerExecutable } from './native-window-compiler-artifact.mjs';

// Same fixed zero-argument permissions operation, using only the externally
// admitted original helper. Missing admission never falls back to compilation.
export function preflightAppearancePair(pair) {
  const lease = readPackagedRuntimePair(pair);
  const source = fileURLToPath(new URL('../native-window.swift', import.meta.url));
  const executable = readNativeWindowCompilerExecutable(lease.compilerArtifact, source);
  lease.validate();
  const bytes = execFileSync(executable, ['trusted'], { encoding: 'utf8', timeout: 10000, stdio: 'pipe' });
  readNativeWindowCompilerExecutable(lease.compilerArtifact, source); lease.validate();
  return JSON.parse(bytes);
}
