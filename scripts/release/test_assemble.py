import hashlib
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('assemble', HERE / 'assemble.py')
assemble = importlib.util.module_from_spec(spec)
spec.loader.exec_module(assemble)


class PackageEdits(unittest.TestCase):
    def setUp(self):
        self.app = Path(tempfile.mkdtemp())
        (self.app / 'a').mkdir()
        (self.app / 'a/one.md').write_text('icon: https://old/x.svg\n')
        (self.app / 'a/two.md').write_text('icon: https://old/y.svg https://old/z.svg\n')
        (self.app / 'entry.js').write_text('origin===`api`||local')

    def edit(self, **edit):
        return assemble.apply_edits(self.app, {'edits': [{'why': 'test', **edit}]})

    def test_glob_total_spreads_across_files(self):
        self.edit(target='a/*.md', find='https://old/', replace='https://new/', total=3)
        self.assertEqual((self.app / 'a/two.md').read_text(), 'icon: https://new/y.svg https://new/z.svg\n')

    def test_count_mismatch_refuses_without_writing(self):
        with self.assertRaises(SystemExit):
            self.edit(target='a/*.md', find='https://old/', replace='https://new/', total=2)
        self.assertIn('https://old/', (self.app / 'a/one.md').read_text())

    def test_single_file_edit(self):
        self.edit(target='entry.js', find='origin===`api`||', replace='', count=1)
        self.assertEqual((self.app / 'entry.js').read_text(), 'local')

    def test_shipped_spec_is_well_formed(self):
        spec = json.loads((HERE / 'package-edits.json').read_text())
        for edit in spec['edits']:
            self.assertTrue(edit['why'] and edit['find'] != edit['replace'])
            self.assertTrue(('count' in edit) != ('total' in edit))


class RuntimeRepin(unittest.TestCase):
    def test_repins_changed_runtime_file_and_bootstrap_hash(self):
        app = Path(tempfile.mkdtemp())
        runtime, native = app / assemble.AUX / 'agent-runtime', app / assemble.NATIVE
        (runtime / 'bin').mkdir(parents=True)
        native.mkdir(parents=True)
        tool = runtime / 'bin/rg'
        tool.write_bytes(b'old')
        pins = native / 'runtime-source-pins.json'
        pins.write_text(json.dumps({'files': [{'path': 'bin/rg', 'type': 'file', 'size': 3,
                                               'sourceSha256': hashlib.sha256(b'old').hexdigest()}]}))
        old = assemble.sha256(pins)
        (native / 'runtime-bootstrap.cjs').write_text(f"if(hash!=='{old}')throw Error()")
        tool.write_bytes(b'resigned')
        self.assertEqual(assemble.repin_runtime(app, [tool]), 1)
        entry = json.loads(pins.read_text())['files'][0]
        self.assertEqual(entry['sourceSha256'], hashlib.sha256(b'resigned').hexdigest())
        self.assertIn(assemble.sha256(pins), (native / 'runtime-bootstrap.cjs').read_text())

    def test_refuses_unpinned_runtime_file(self):
        app = Path(tempfile.mkdtemp())
        runtime, native = app / assemble.AUX / 'agent-runtime', app / assemble.NATIVE
        runtime.mkdir(parents=True)
        native.mkdir(parents=True)
        (native / 'runtime-source-pins.json').write_text(json.dumps({'files': []}))
        stray = runtime / 'stray'
        stray.write_bytes(b'x')
        with self.assertRaises(SystemExit):
            assemble.repin_runtime(app, [stray])


class RebuiltRuntime(unittest.TestCase):
    def setUp(self):
        self.app, self.build = Path(tempfile.mkdtemp()), Path(tempfile.mkdtemp())
        self.runtime = self.app / assemble.AUX / 'agent-runtime'
        self.target = self.runtime / 'native/bin/pdfinfo'
        self.target.parent.mkdir(parents=True)
        self.target.write_bytes(b'supplied')
        self.target.chmod(0o755)
        (self.build / 'pdf/native/bin').mkdir(parents=True)
        (self.build / 'pdf/native/bin/pdfinfo').write_bytes(b'rebuilt')
        self.node = self.runtime / 'node/bin/node'
        self.node.parent.mkdir(parents=True)
        self.node.write_bytes(b'supplied node')
        (self.build / 'rest/node/bin').mkdir(parents=True)
        (self.build / 'rest/node/bin/node').write_bytes(b'rebuilt node')
        self.manifests = [self.build / 'pdf.json', self.build / 'rest.json']
        self.manifests[0].write_text(json.dumps({'built': 'pdf', 'files': {'native/bin/pdfinfo': self.entry(b'supplied', b'rebuilt')}}))
        self.manifests[1].write_text(json.dumps({'built': 'rest', 'files': {'node/bin/node': {
            **self.entry(b'supplied node', b'rebuilt node'), 'identifier': 'node',
            'entitlements': ['com.apple.security.cs.allow-jit']}}}))

    @staticmethod
    def entry(old, new):
        return {'originalSha256': hashlib.sha256(old).hexdigest(), 'sha256': hashlib.sha256(new).hexdigest(), 'rpaths': []}

    def test_one_path_covers_every_manifest_and_reports_the_old_digests(self):
        replaced = dict(assemble.substitute_runtime(self.app, self.build, self.manifests))
        self.assertEqual(self.target.read_bytes(), b'rebuilt')
        self.assertEqual(self.node.read_bytes(), b'rebuilt node')
        self.assertEqual(replaced[self.target], (hashlib.sha256(b'supplied').hexdigest(), 8))
        self.assertEqual(self.target.stat().st_mode & 0o777, 0o755)

    def test_refuses_a_file_the_manifest_does_not_record_and_changes_nothing(self):
        (self.build / 'rest/node/bin/node').write_bytes(b'other')
        with self.assertRaises(SystemExit):
            assemble.substitute_runtime(self.app, self.build, self.manifests)
        self.assertEqual(self.target.read_bytes(), b'supplied')

    def test_refuses_a_supplied_file_that_changed(self):
        self.target.write_bytes(b'changed underneath')
        with self.assertRaises(SystemExit):
            assemble.substitute_runtime(self.app, self.build, self.manifests)

    def test_signing_keeps_the_identifier_and_entitlements(self):
        subprocess.run(['clang', '-x', 'c', '-', '-o', self.node], input=b'int main(void) { return 0; }', check=True)
        entry = assemble.runtime_entries(self.app, self.manifests)[self.node][1]
        assemble.sign_runtime_file(self.node, entry, '-', False, self.build)
        details = subprocess.run(['codesign', '-d', '--entitlements', '-', '--xml', '-v', self.node], capture_output=True)
        self.assertIn(b'Identifier=node', details.stderr)
        self.assertIn(b'com.apple.security.cs.allow-jit', details.stdout)

    def test_any_other_signature_left_in_the_runtime_is_reported(self):
        for path in (self.target, self.node):
            subprocess.run(['clang', '-x', 'c', '-', '-o', path], input=b'int main(void) { return 0; }', check=True)
        authorities = {self.target: 'Developer ID Application: Aux', self.node: 'Developer ID Application: At Inc.'}
        real, assemble.signing_details = assemble.signing_details, lambda path: (authorities[path], None)
        self.addCleanup(setattr, assemble, 'signing_details', real)
        self.assertEqual(assemble.foreign_runtime_signatures(self.app, 'Developer ID Application: Aux'),
                         ['node/bin/node: Developer ID Application: At Inc.'])

    def test_shipped_manifests_cover_every_rebuilt_file_once(self):
        pdf, rest = (json.loads(m.read_text())['files'] for m in assemble.RUNTIME_MANIFESTS)
        self.assertEqual((len(pdf), len(rest)), (34, 50))
        self.assertFalse(pdf.keys() & rest.keys())
        self.assertIn('native/bin/rg', rest)
        for entry in (*pdf.values(), *rest.values()):
            self.assertEqual((len(entry['originalSha256']), len(entry['sha256'])), (64, 64))

    def test_shipped_manifest_keeps_the_entitlements_hardened_runtime_needs(self):
        rest = json.loads(assemble.RUNTIME_MANIFESTS[1].read_text())['files']
        self.assertIn('com.apple.security.cs.allow-jit', rest['node/bin/node']['entitlements'])
        self.assertNotIn('com.apple.security.get-task-allow', rest['node/bin/node']['entitlements'])
        for name in ('runtime/bin/python3.13', 'venv/bin/python', 'venv/bin/python3', 'venv/bin/python3.13'):
            self.assertEqual(rest[f'python/{name}']['entitlements'], ['com.apple.security.cs.disable-library-validation'])


class MinimumMacos(unittest.TestCase):
    def setUp(self):
        self.app = Path(tempfile.mkdtemp())
        self.runtime = self.app / assemble.AUX / 'agent-runtime'
        self.runtime.mkdir(parents=True)
        (self.runtime / 'env.sh').write_text('export A=1\n')

    def binary(self, name, minimum):
        subprocess.run(['clang', '-x', 'c', '-', '-o', self.runtime / name, f'-mmacosx-version-min={minimum}'],
                       input=b'int main(void) { return 0; }', check=True)

    def test_accepts_the_floor_and_lists_only_files_above_it(self):
        self.binary('at-floor', '15.0')
        self.binary('older', '11.0')
        self.assertEqual(assemble.above_minimum_macos(self.app), [])
        self.binary('newer', '15.1')
        self.assertEqual(assemble.above_minimum_macos(self.app), ['newer'])


class CrashUpload(unittest.TestCase):
    def test_minidump_endpoint_from_dsn(self):
        self.assertEqual(assemble.crash_upload_url('https://abc123@o1.ingest.sentry.io/42\n'),
                         'https://o1.ingest.sentry.io/api/42/minidump/?sentry_key=abc123')

    def test_refuses_malformed_dsn(self):
        with self.assertRaises(SystemExit):
            assemble.crash_upload_url('http://o1.ingest.sentry.io/42')


class RepinText(unittest.TestCase):
    def test_size_only_changes_inside_the_digest_object(self):
        text = 'const X={"a":{"size":5,"sha256":"OLD"},"b":{"size":5,"sha256":"other"}};'
        self.assertEqual(assemble.repin_text(text, 'OLD', 'NEW', 5, 9),
                         'const X={"a":{"size":9,"sha256":"NEW"},"b":{"size":5,"sha256":"other"}};')

    def test_bare_digest_outside_an_object(self):
        self.assertEqual(assemble.repin_text('pin=OLD;', 'OLD', 'NEW', 1, 2), 'pin=NEW;')


class RepinCascade(unittest.TestCase):
    def test_follows_pins_of_pins(self):
        app = Path(tempfile.mkdtemp())
        root = app / assemble.AUX
        root.mkdir(parents=True)
        seed = root / 'aux-memory'
        seed.write_bytes(b'unsigned')
        old = assemble.sha256(seed)
        runtime = root / 'runtime.json'
        runtime.write_text(json.dumps({'files': [{'size': 8, 'sha256': old}]}, separators=(',', ':')))
        catalog = root / 'catalog.json'
        catalog.write_text(json.dumps({'runtime': {'bytes': runtime.stat().st_size, 'sha256': assemble.sha256(runtime)}}))
        old_runtime_size = runtime.stat().st_size
        seed.write_bytes(b'signed by Aux')
        log = assemble.repin_cascade(app, {old: (assemble.sha256(seed), 8, 13)})
        self.assertEqual(json.loads(runtime.read_text())['files'][0], {'size': 13, 'sha256': assemble.sha256(seed)})
        self.assertEqual(json.loads(catalog.read_text())['runtime'],
                         {'bytes': runtime.stat().st_size, 'sha256': assemble.sha256(runtime)})
        self.assertNotEqual(old_runtime_size, runtime.stat().st_size)
        self.assertEqual(len(log), 2)

    def test_renames_directory_named_by_digest(self):
        app = Path(tempfile.mkdtemp())
        old, new = 'a' * 64, 'b' * 64
        (app / assemble.AUX / f'runtimes/{old}').mkdir(parents=True)
        (app / assemble.AUX / 'catalog.json').write_text(f'"runtimes/{old}"')
        assemble.repin_cascade(app, {old: (new, 1, 1)})
        self.assertTrue((app / assemble.AUX / f'runtimes/{new}').is_dir())
        self.assertIn(new, (app / assemble.AUX / 'catalog.json').read_text())

    def test_refuses_digest_inside_a_longer_name(self):
        app = Path(tempfile.mkdtemp())
        old = 'a' * 64
        (app / assemble.AUX / f'runtimes/{old}.tar').mkdir(parents=True)
        with self.assertRaises(SystemExit):
            assemble.repin_cascade(app, {old: ('b' * 64, 1, 1)})


class ComputerUseHelper(unittest.TestCase):
    SOURCE = 'debc03deb3f94eb7e8b50fa88d25e617f970b75f1e515b757b131655ad3dde51'

    def bundle(self, root: Path, executable: bytes) -> Path:
        contents = root / 'Contents'
        (contents / 'MacOS').mkdir(parents=True)
        (contents / 'Info.plist').write_bytes(assemble.plistlib.dumps(
            {'CFBundleIdentifier': 'dev.aux.browser.computer-use', 'CFBundleExecutable': 'aux-computer-use'}))
        (contents / 'MacOS/aux-computer-use').write_bytes(executable)
        return root

    def setUp(self):
        self.app = Path(tempfile.mkdtemp())
        self.bundle(self.app / assemble.COMPUTER_USE_APP, b'supplied helper')
        (self.app / assemble.COMPUTER_USE_APP / 'Contents/Resources').mkdir()
        (self.app / assemble.COMPUTER_USE_APP / 'Contents/Resources/imessage.png').write_bytes(b'png')
        self.policy = self.app / assemble.COMPUTER_USE_POLICY
        self.policy.parent.mkdir(parents=True)
        self.record = {'bytes': 15, 'format': 'aux.computer-use.fixed-helper-launch.v1',
                       'identifier': 'dev.aux.browser.computer-use', 'sha256': hashlib.sha256(b'supplied helper').hexdigest(),
                       'sourceSha256': self.SOURCE, 'team': assemble.TEAM}
        self.policy.write_text(json.dumps(self.record, indent=2))
        self.built = self.bundle(Path(tempfile.mkdtemp()) / 'Aux Computer Use.app', b'aux own helper, unsigned')

    def test_replaces_the_app_and_repins_the_policy(self):
        edits, cascade = assemble.replace_computer_use_helper(self.app, self.built)
        helper = self.app / assemble.COMPUTER_USE_APP
        self.assertEqual((helper / 'Contents/MacOS/aux-computer-use').read_bytes(), b'aux own helper, unsigned')
        self.assertFalse((helper / 'Contents/Resources').exists(), 'nothing of the supplied app is kept')
        self.assertEqual(json.loads(self.policy.read_text()), {
            **self.record, 'bytes': 24, 'sha256': hashlib.sha256(b'aux own helper, unsigned').hexdigest()})
        self.assertEqual(json.loads(self.policy.read_text())['sourceSha256'], self.SOURCE)
        self.assertEqual(edits[0]['sha256'], hashlib.sha256(b'aux own helper, unsigned').hexdigest())
        self.assertIn(str(self.policy.relative_to(self.app)), [entry['path'] for entry in cascade])

    def test_refuses_a_policy_that_does_not_pin_the_supplied_helper(self):
        self.policy.write_text(json.dumps({**self.record, 'bytes': 16}))
        with self.assertRaises(SystemExit):
            assemble.replace_computer_use_helper(self.app, self.built)
        self.assertEqual((self.app / assemble.COMPUTER_USE_APP / 'Contents/MacOS/aux-computer-use').read_bytes(), b'supplied helper')

    def test_refuses_another_bundle_identity(self):
        (self.built / 'Contents/Info.plist').write_bytes(assemble.plistlib.dumps(
            {'CFBundleIdentifier': 'dev.aux.browser.other', 'CFBundleExecutable': 'aux-computer-use'}))
        with self.assertRaises(SystemExit):
            assemble.replace_computer_use_helper(self.app, self.built)



class MemoryDistribution(unittest.TestCase):
    """The whole pin chain, built to the shape of the shipped files."""
    S = assemble.SUPPLIED_MEMORY

    def setUp(self):
        self.app = Path(tempfile.mkdtemp())
        supplied = b'\xcf\xfa\xed\xfe' + b's' * (self.S['bytes'] - 4)
        patcher = mock.patch.dict(assemble.SUPPLIED_MEMORY, sha256=hashlib.sha256(supplied).hexdigest())
        patcher.start()
        self.addCleanup(patcher.stop)
        old = dict(assemble.SUPPLIED_MEMORY)
        descriptor = assemble.memory_runtime_descriptor(old)
        assemble.SUPPLIED_MEMORY['runtimeKey'] = hashlib.sha256(descriptor).hexdigest()
        key, gen = assemble.SUPPLIED_MEMORY['runtimeKey'], assemble.MEMORY_GENERATION
        self.root = self.app / assemble.MEMORY_RUNTIMES / key
        (self.root / gen).mkdir(parents=True)
        (self.root / gen / 'aux-memory').write_bytes(supplied)
        (self.root / gen / 'runtime.json').write_bytes(descriptor)
        (self.root / 'CURRENT').write_text(gen)
        self.catalog = self.app / assemble.MEMORY_CATALOG
        self.catalog.write_text(json.dumps({'format': 'aux.bundled-memory-catalog.v1', 'runtimes': [{'files': {'aux-memory': {
            'bytes': old['bytes'], 'sha256': old['sha256'], 'compressedBytes': old['compressedBytes'],
            'compressedSha256': old['compressedSha256']}}}], 'models': []}, separators=(',', ':')))
        self.policy = self.app / assemble.MEMORY_POLICY
        self.policy.parent.mkdir(parents=True)
        self.policy.write_text(json.dumps({'sourceSha256': old['sha256'], 'sha256': 'e' * 64, 'bytes': 7}))
        prefix = f'memory-runtimes/{key}/{gen}'
        row = lambda path, file: {'path': path, 'type': 'file', 'mode': 384, 'size': file.stat().st_size, 'sha256': assemble.sha256(file)}
        seed = {'format': 'aux.bundled-memory-seed.v2', 'catalogSha256': assemble.sha256(self.catalog),
                'groups': [{'kind': 'memory-runtimes', 'key': key, 'generation': gen, 'sourcePrefix': prefix, 'descriptor': 'runtime.json',
                            'files': [row('aux-memory', self.root / gen / 'aux-memory'), row('runtime.json', self.root / gen / 'runtime.json')]}],
                'entries': [row('memory-catalog.json', self.catalog), {'path': 'memory-runtimes', 'type': 'directory', 'mode': 448},
                            {'path': f'memory-runtimes/{key}', 'type': 'directory', 'mode': 448},
                            row(f'memory-runtimes/{key}/CURRENT', self.root / 'CURRENT'),
                            row(f'{prefix}/aux-memory', self.root / gen / 'aux-memory'),
                            row(f'{prefix}/runtime.json', self.root / gen / 'runtime.json')]}
        self.entry = self.app / assemble.MEMORY_ENTRY
        self.entry.parent.mkdir(parents=True)
        self.entry.write_text('const AUX_MEMORY_V2_SEED=' + json.dumps(seed, separators=(',', ':')) + ';\nasync function seed(){}\n')
        self.fixed = Path(tempfile.mkdtemp())
        signed = b'\xcf\xfa\xed\xfe' + b'o' * 995308
        (self.fixed / 'aux-memory').write_bytes(signed)
        self.pins = {'identifier': 'dev.aux.browser.memory', 'sha256': hashlib.sha256(signed).hexdigest(), 'bytes': len(signed),
                     'compressedSha256': 'c' * 64, 'compressedBytes': 297479}
        self.pins['runtimeKey'] = hashlib.sha256(assemble.memory_runtime_descriptor(self.pins)).hexdigest()
        (self.fixed / 'pins.json').write_text(json.dumps(self.pins))
        signature = mock.patch.object(assemble, 'require_release_signature')
        self.signature = signature.start()
        self.addCleanup(signature.stop)

    def replace(self):
        return assemble.replace_memory_distribution(self.app, self.fixed)

    def edit_entry(self, old, new):
        self.assertIn(old, self.entry.read_text())
        self.entry.write_text(self.entry.read_text().replace(old, new))

    def test_repins_every_link(self):
        supplied_key = assemble.SUPPLIED_MEMORY['runtimeKey']
        self.replace()
        key = self.pins['runtimeKey']
        self.assertEqual((self.app / assemble.MEMORY_RUNTIMES / key / assemble.MEMORY_GENERATION / 'aux-memory').read_bytes(),
                         (self.fixed / 'aux-memory').read_bytes())
        self.assertEqual(json.loads(self.policy.read_text())['sourceSha256'], self.pins['sha256'])
        self.assertFalse((self.app / assemble.MEMORY_RUNTIMES / supplied_key).exists())
        self.signature.assert_called_once()
        assemble.verify_memory_chain(self.app, self.pins)

    def test_a_shorter_descriptor_updates_its_size_in_every_seed_row(self):
        self.replace()
        seed = json.loads(self.entry.read_text().split('=', 1)[1].split(';\n')[0])
        descriptor = len(assemble.memory_runtime_descriptor(self.pins))
        rows = [r for r in seed['entries'] + seed['groups'][0]['files'] if r['path'].endswith('runtime.json')]
        self.assertEqual({r['size'] for r in rows}, {descriptor})
        self.assertEqual(descriptor, 214)

    def test_refuses_a_fixed_copy_that_is_not_its_pins(self):
        (self.fixed / 'aux-memory').write_bytes(b'other')
        with self.assertRaises(SystemExit):
            self.replace()

    def test_refuses_an_unsigned_fixed_copy(self):
        self.signature.side_effect = SystemExit('unsigned')
        with self.assertRaises(SystemExit):
            self.replace()

    def test_refuses_changed_supplied_bytes(self):
        (self.root / assemble.MEMORY_GENERATION / 'aux-memory').write_bytes(b'changed')
        with self.assertRaises(SystemExit):
            self.replace()

    def test_each_broken_link_is_refused(self):
        self.replace()
        key = self.pins['runtimeKey']
        breaks = {
            'binary': lambda: (self.app / assemble.MEMORY_RUNTIMES / key / assemble.MEMORY_GENERATION / 'aux-memory').write_bytes(b'x'),
            'descriptor': lambda: (self.app / assemble.MEMORY_RUNTIMES / key / assemble.MEMORY_GENERATION / 'runtime.json').write_bytes(b'{}'),
            'catalog': lambda: self.catalog.write_text(self.catalog.read_text().replace('297479', '297480')),
            'catalog hash': lambda: self.catalog.write_text(self.catalog.read_text() + ' '),
            'seed size': lambda: self.edit_entry('"size":214', '"size":215'),
            'seed key': lambda: self.edit_entry(f'"key":"{key}"', '"key":"' + 'f' * 64 + '"'),
            'policy': lambda: self.policy.write_text(json.dumps({'sourceSha256': self.S['sha256']})),
        }
        for name, damage in breaks.items():
            saved = {p: p.read_bytes() for p in self.app.rglob('*') if p.is_file()}
            damage()
            with self.subTest(name), self.assertRaises(SystemExit):
                assemble.verify_memory_chain(self.app, self.pins)
            for path, data in saved.items():
                path.write_bytes(data)

    def test_daemon_must_carry_the_new_constant(self):
        self.replace()
        daemon = Path(tempfile.mkdtemp()) / 'Aux Daemon'
        daemon.write_bytes(self.pins['sha256'].encode())
        assemble.verify_memory_chain(self.app, self.pins, daemon)
        daemon.write_bytes(assemble.SUPPLIED_MEMORY['sha256'].encode())
        with self.assertRaises(SystemExit):
            assemble.verify_memory_chain(self.app, self.pins, daemon)


class EnclosingObject(unittest.TestCase):
    def test_a_digest_inside_a_path_finds_its_own_object(self):
        text = '{"a":{"path":"x/DIGEST/y","size":5}}'
        self.assertEqual(text[slice(*assemble.enclosing_object(text, text.index('DIGEST')))], '{"path":"x/DIGEST/y","size":5}')


class MemoryHelper(unittest.TestCase):
    SOURCE = 'b4c7d12efa87ed88515092527c7d1e7d9b43e605f39f03543e2b0e8e7005b3c0'
    SUPPLIED = b'\xcf\xfa\xed\xfe supplied helper'
    OURS = b'\xcf\xfa\xed\xfe aux own helper __deunicode'

    def setUp(self):
        self.app = Path(tempfile.mkdtemp())
        self.target = self.app / assemble.MEMORY_HELPER
        self.target.parent.mkdir(parents=True)
        self.target.write_bytes(self.SUPPLIED)
        self.policy = self.app / assemble.MEMORY_POLICY
        self.record = {'bytes': len(self.SUPPLIED), 'format': 'aux.memory.fixed-helper-launch.v1',
                       'identifier': 'dev.aux.browser.memory', 'modelDescriptorSha256': 'd' * 64,
                       'sha256': hashlib.sha256(self.SUPPLIED).hexdigest(), 'sourceSha256': self.SOURCE, 'team': assemble.TEAM}
        self.policy.write_text(json.dumps(self.record, indent=2))
        self.built = Path(tempfile.mkdtemp()) / 'aux-memory'
        self.built.write_bytes(self.OURS)

    def test_replaces_the_helper_and_repins_the_policy(self):
        edits, cascade = assemble.replace_memory_helper(self.app, self.built)
        self.assertEqual(self.target.read_bytes(), self.OURS)
        self.assertEqual(json.loads(self.policy.read_text()), {
            **self.record, 'bytes': len(self.OURS), 'sha256': hashlib.sha256(self.OURS).hexdigest()})
        self.assertEqual(edits[0]['sha256'], hashlib.sha256(self.OURS).hexdigest())
        self.assertIn(str(self.policy.relative_to(self.app)), [entry['path'] for entry in cascade])

    def test_refuses_a_policy_that_does_not_pin_the_supplied_helper(self):
        self.policy.write_text(json.dumps({**self.record, 'bytes': 1}))
        with self.assertRaises(SystemExit):
            assemble.replace_memory_helper(self.app, self.built)
        self.assertEqual(self.target.read_bytes(), self.SUPPLIED)

    def test_refuses_a_build_without_the_transliteration_tables(self):
        self.built.write_bytes(b'\xcf\xfa\xed\xfe plain swift build')
        with self.assertRaises(SystemExit):
            assemble.replace_memory_helper(self.app, self.built)

class ExtensionVersionTest(unittest.TestCase):
    def test_each_build_moves_only_the_last_part(self):
        with tempfile.TemporaryDirectory() as folder:
            app = Path(folder)
            path = app / assemble.EXTENSION_MANIFEST
            path.parent.mkdir(parents=True)
            path.write_text(json.dumps({'version': '1.26.1016.1890', 'name': 'Aux'}))
            self.assertEqual(assemble.stamp_extension_version(app, 131), '1.26.1016.2021')
            self.assertEqual(json.loads(path.read_text())['name'], 'Aux')


if __name__ == '__main__':
    unittest.main()
