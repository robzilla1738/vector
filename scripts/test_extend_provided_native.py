"""Pure filesystem coverage for unapplied and applied native compositions."""
import difflib
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

TOOL = Path(__file__).with_name('extend-provided-native.py')


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def patch_file(path, before, after):
    result = f'diff --git a/{path} b/{path}\n'
    if before is None:
        result += 'new file mode 100644\n'
    for line in difflib.unified_diff(
            before.decode().splitlines(True) if before is not None else [],
            after.decode().splitlines(True),
            fromfile=f'a/{path}' if before is not None else '/dev/null', tofile=f'b/{path}'):
        result += line if line.endswith('\n') else line + '\n\\ No newline at end of file\n'
    return result.encode()


class ExtendNativeTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='aux-native-staged-fixture-')
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name).resolve()
        self.native = self.root / 'native'
        self.native.mkdir()
        self.base = self.root / 'v18'
        self.base.mkdir()
        (self.native / 'source.cc').write_bytes(b'shared16\n')
        (self.native / 'keep.cc').write_bytes(b'unchanged\n')
        (self.native / 'icon.bin').write_bytes(b'old-art')
        parent = patch_file('source.cc', b'shared16\n', b'parent18\n') + patch_file('new.cc', None, b'parent-new\n')
        (self.base / 'combined.patch').write_bytes(parent)
        self.manifest = {
            'sourceRoot': str(self.native), 'combinedPatchSha256': sha(parent),
            'steps': [{'patch': 'historical-parent', 'sha256': 'retained-history'}],
            'files': [
                {'path': 'source.cc', 'sourceSha256': sha(b'shared16\n'), 'outputSha256': sha(b'parent18\n')},
                {'path': 'keep.cc', 'sourceSha256': sha(b'unchanged\n'), 'outputSha256': sha(b'unchanged\n')},
                {'path': 'new.cc', 'sourceSha256': None, 'outputSha256': sha(b'parent-new\n')}],
            'binaryAssets': [{'target': 'icon.bin', 'baselineSha256': sha(b'old-art'), 'replacementSha256': sha(b'new-art')}]
        }
        self.save_parent()
        changes = [('source.cc', b'parent18\n', b'final19'),
                   ('new.cc', b'parent-new\n', b'updated-new\n'),
                   ('follow.cc', None, b'follow-up\n'), ('empty.cc', None, b'')]
        self.patch = self.root / 'follow.patch'
        self.patch.write_bytes(b''.join(patch_file(*item) for item in changes))
        self.metadata = self.root / 'follow.json'
        self.metadata.write_text(json.dumps({'files': [
            {'path': path, 'baselineSha256': sha(before) if before is not None else None,
             'outputSha256': sha(after)} for path, before, after in changes]}))

    def save_parent(self):
        (self.base / 'manifest.json').write_text(json.dumps(self.manifest))

    def run_tool(self, name, staged=True, base=None, patch=None, metadata=None, success=True):
        output = self.root / name
        command = [sys.executable, str(TOOL), str(base or self.base),
                   '--patch', str(patch or self.patch), '--metadata', str(metadata or self.metadata),
                   '--output', str(output)]
        if staged:
            command.append('--staged-base')
        result = subprocess.run(command, capture_output=True, text=True)
        if success:
            self.assertEqual(result.returncode, 0, result.stderr)
            return output, json.loads((output / 'manifest.json').read_text())
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(output.exists())
        return result.stderr

    def inventory(self):
        return {str(path.relative_to(self.native)): path.read_bytes()
                for path in self.native.rglob('*') if path.is_file()}

    def test_staged_overlap_new_files_and_nested_cumulative_replay(self):
        original = self.inventory()
        parent_hash = sha((self.base / 'manifest.json').read_bytes())
        output, manifest = self.run_tool('v19')
        self.assertEqual(self.inventory(), original)
        rows = {item['path']: item for item in manifest['files']}
        self.assertEqual(rows['source.cc']['sourceSha256'], sha(b'shared16\n'))
        self.assertIsNone(rows['new.cc']['sourceSha256'])
        self.assertIsNone(rows['follow.cc']['sourceSha256'])
        self.assertEqual(rows['empty.cc']['outputSha256'], sha(b''))
        self.assertEqual(manifest['parentCompositionSha256'], parent_hash)
        self.assertEqual(manifest['steps'][0], self.manifest['steps'][0])
        self.assertEqual(manifest['binaryAssets'], self.manifest['binaryAssets'])
        # Independently apply the emitted cumulative patch to actual shared16.
        replay = self.root / 'independent-replay'
        replay.mkdir()
        for name, raw in original.items():
            (replay / name).write_bytes(raw)
        subprocess.run(['git', 'apply', str(output / 'combined.patch')], cwd=replay, check=True)
        self.assertEqual((replay / 'source.cc').read_bytes(), b'final19')
        self.assertEqual((replay / 'new.cc').read_bytes(), b'updated-new\n')
        self.assertEqual((replay / 'follow.cc').read_bytes(), b'follow-up\n')
        self.assertEqual((replay / 'empty.cc').read_bytes(), b'')
        nested_patch = self.root / 'nested.patch'
        nested_patch.write_bytes(patch_file('new.cc', b'updated-new\n', b'nested20\n'))
        nested_metadata = self.root / 'nested.json'
        nested_metadata.write_text(json.dumps({'files': [{'path': 'new.cc',
            'baselineSha256': sha(b'updated-new\n'), 'outputSha256': sha(b'nested20\n')}]}))
        _, nested = self.run_tool('v20', base=output, patch=nested_patch, metadata=nested_metadata)
        nested_rows = {item['path']: item for item in nested['files']}
        self.assertIsNone(nested_rows['new.cc']['sourceSha256'])
        self.assertEqual(nested_rows['source.cc']['sourceSha256'], sha(b'shared16\n'))
        self.assertEqual(len(nested['steps']), 3)
        self.assertEqual(self.inventory(), original)

    def test_staged_parent_source_patch_and_output_drift_refuse_publication(self):
        source = self.native / 'source.cc'
        source.write_bytes(b'changed-shared-source\n')
        self.assertIn('Staged input drift', self.run_tool('bad-source', success=False))
        source.write_bytes(b'shared16\n')
        parent = self.base / 'combined.patch'
        parent.write_bytes(parent.read_bytes() + b'\n')
        self.assertIn('patch hash differs', self.run_tool('bad-patch', success=False))
        self.manifest['combinedPatchSha256'] = sha(parent.read_bytes())
        self.manifest['files'][1]['outputSha256'] = sha(b'invented-parent-output\n')
        self.save_parent()
        self.assertIn('Parent output differs', self.run_tool('bad-output', success=False))
        self.manifest['files'][1]['outputSha256'] = sha(b'unchanged\n')
        self.save_parent()
        metadata = json.loads(self.metadata.read_text())
        metadata['files'][0]['baselineSha256'] = sha(b'wrong-follow-up-input\n')
        self.metadata.write_text(json.dumps(metadata))
        self.assertIn('Pinned follow-up input differs', self.run_tool('bad-follow-up', success=False))
        (self.native / 'icon.bin').write_bytes(b'new-art')
        self.assertIn('Artwork differs', self.run_tool('bad-artwork', success=False))
        (self.native / 'icon.bin').write_bytes(b'old-art')
        (self.native / 'new.cc').write_bytes(b'unexpected-new-file\n')
        self.assertIn('Staged input drift', self.run_tool('bad-new-file', success=False))

    def test_default_applied_mode_uses_applied_inputs_and_asset_baselines(self):
        (self.native / 'source.cc').write_bytes(b'parent18\n')
        (self.native / 'new.cc').write_bytes(b'parent-new\n')
        (self.native / 'icon.bin').write_bytes(b'new-art')
        original = self.inventory()
        _, manifest = self.run_tool('applied-follow-up', staged=False)
        rows = {item['path']: item for item in manifest['files']}
        self.assertEqual(rows['source.cc']['sourceSha256'], sha(b'parent18\n'))
        self.assertEqual(rows['new.cc']['sourceSha256'], sha(b'parent-new\n'))
        self.assertEqual(manifest['binaryAssets'][0]['baselineSha256'], sha(b'new-art'))
        self.assertEqual(manifest['binaryAssets'][0]['parentBaselineSha256'], sha(b'old-art'))
        self.assertEqual(self.inventory(), original)


if __name__ == '__main__':
    unittest.main()
