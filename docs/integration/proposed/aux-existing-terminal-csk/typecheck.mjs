// Source-only recipe, never runs a compiled executable or protected function.
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const proposals = path.dirname(here);
const output = await mkdtemp(path.join(tmpdir(), 'aux-existing-terminal-csk-types-'));
try {
  const generated = path.join(output, 'PrivateCskHandoffJournalStore.swift');
  const generator = spawnSync(process.execPath, [path.join(proposals, 'aux-csk-prepared-handoff/generate.mjs'), generated], { encoding: 'utf8' });
  if (generator.status !== 0) throw new Error(generator.stderr || 'Pinned CSK store generation failed');
  const recipe = await readFile(path.join(proposals, 'aux-terminal-command-context/check.sh'), 'utf8');
  const replacements = new Map([
    ['aux-native-four-row-preparation/source/CapturedInstallation.swift', 'aux-existing-candidate-recovery/source/CapturedInstallation.swift'],
    ['aux-installation-additive-transaction/source/AdditiveInstallationTransaction.swift', 'aux-existing-candidate-recovery/source/AdditiveInstallationTransaction.swift'],
    ['aux-installation-journal-store/source/PrivateInstallationJournalStore.swift', 'aux-authority-selection-composition/source/PrivateInstallationJournalStore.swift'],
  ]);
  const files = [...recipe.matchAll(/"\$proposal\/([^"\n]+\.swift)"/g)]
    .map(match => match[1]).filter(file => !file.includes('/tests/'))
    .map(file => path.join(proposals, replacements.get(file) ?? file));
  files.push(...[
    'aux-existing-candidate-recovery/source/InstallationCandidateArchive.swift',
    'aux-durable-selection/source/InstallationSelection.swift',
    'aux-native-secure-store/source/AuxSecureStore.swift',
    'aux-copy-only-credentials/source/AuxCapturedCredentialCopy.swift',
    'aux-csk-prepared-handoff/source/CapturedCskPreparation.swift',
    'aux-csk-prepared-handoff/source/DurableCapturedCskHandoff.swift',
    'aux-existing-terminal-csk/source/ExistingTerminalCskHandoff.swift',
  ].map(file => path.join(proposals, file)), generated);
  const result = spawnSync('/usr/bin/xcrun', ['swiftc', '-typecheck', '-D', 'AUX_ATOMIC_CSK_DISPATCH', '-target', 'arm64-apple-macos13.0', '-module-cache-path', path.join(output, 'cache'), ...files], { encoding: 'utf8', timeout: 120000, maxBuffer: 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr || 'Actual separate-source typecheck failed');
  process.stdout.write(`PASS:${files.length} actual external existing-terminal/CSK source inputs typechecked; nothing executed\n`);
} finally {
  await rm(output, { recursive: true, force: true });
}
