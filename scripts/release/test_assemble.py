import hashlib
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

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


class PdfRuntime(unittest.TestCase):
    def setUp(self):
        self.app, self.built = Path(tempfile.mkdtemp()), Path(tempfile.mkdtemp())
        self.target = self.app / assemble.AUX / 'agent-runtime/native/bin/pdfinfo'
        self.target.parent.mkdir(parents=True)
        self.target.write_bytes(b'supplied')
        self.target.chmod(0o755)
        (self.built / 'native/bin').mkdir(parents=True)
        (self.built / 'native/bin/pdfinfo').write_bytes(b'rebuilt')
        self.manifest = self.built / 'manifest.json'
        self.linked = self.target.with_name('rg')
        self.linked.write_bytes(b'links a rebuilt library')
        self.manifest.write_text(json.dumps({'relinked': ['native/bin/rg'], 'files': {'native/bin/pdfinfo': {
            'originalSha256': hashlib.sha256(b'supplied').hexdigest(),
            'sha256': hashlib.sha256(b'rebuilt').hexdigest(), 'rpaths': []}}}))

    def test_replaces_and_reports_the_old_digest(self):
        (path, (old, size)), _ = assemble.substitute_pdf_runtime(self.app, self.built, self.manifest)
        self.assertEqual((path.read_bytes(), old, size), (b'rebuilt', hashlib.sha256(b'supplied').hexdigest(), 8))
        self.assertEqual(path.stat().st_mode & 0o777, 0o755)

    def test_relinked_files_stay_byte_identical_but_are_signed_and_pinned_too(self):
        _, (path, (old, size)) = assemble.substitute_pdf_runtime(self.app, self.built, self.manifest)
        self.assertEqual(path, self.linked)
        self.assertEqual(path.read_bytes(), b'links a rebuilt library')
        self.assertEqual((old, size), (hashlib.sha256(path.read_bytes()).hexdigest(), 23))

    def test_refuses_a_file_the_manifest_does_not_record(self):
        (self.built / 'native/bin/pdfinfo').write_bytes(b'other')
        with self.assertRaises(SystemExit):
            assemble.substitute_pdf_runtime(self.app, self.built, self.manifest)
        self.assertEqual(self.target.read_bytes(), b'supplied')

    def test_shipped_manifest_covers_the_34_files(self):
        files = json.loads(assemble.PDF_RUNTIME_MANIFEST.read_text())['files']
        self.assertEqual(len(files), 34)
        self.assertTrue(all(len(entry['originalSha256']) == 64 for entry in files.values()))


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

if __name__ == '__main__':
    unittest.main()
