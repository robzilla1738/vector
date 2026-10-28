import hashlib
import importlib.util
import json
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


if __name__ == '__main__':
    unittest.main()
