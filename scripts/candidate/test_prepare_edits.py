import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('prepare_edits', Path(__file__).with_name('prepare_edits.py'))
prepare_edits = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prepare_edits)


class PrepareEditsTest(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        (self.root / 'app/Contents').mkdir(parents=True)
        (self.root / 'app/Contents/a.js').write_text('let x=`old`;let y=`old`;')

    def run_spec(self, files):
        return prepare_edits.prepare(self.root / 'app', {'format': prepare_edits.FORMAT, 'files': files}, self.root / 'out')

    def test_applies_counted_edits_and_records_hashes(self):
        receipt = self.run_spec([{'target': 'Contents/a.js', 'edits': [{'find': '`old`', 'replace': '`new`', 'count': 2}]}])
        self.assertEqual((self.root / 'out/a.js').read_text(), 'let x=`new`;let y=`new`;')
        self.assertEqual((self.root / 'app/Contents/a.js').read_text(), 'let x=`old`;let y=`old`;')
        self.assertEqual(json.loads((self.root / 'out/preparation-receipt.json').read_text()), receipt)

    def test_refuses_count_drift(self):
        with self.assertRaisesRegex(ValueError, 'expected 1'):
            self.run_spec([{'target': 'Contents/a.js', 'edits': [{'find': '`old`', 'replace': '`new`', 'count': 1}]}])

    def test_refuses_already_applied_replacement(self):
        (self.root / 'app/Contents/a.js').write_text('`old` `new`')
        with self.assertRaisesRegex(ValueError, 'already present'):
            self.run_spec([{'target': 'Contents/a.js', 'edits': [{'find': '`old`', 'replace': '`new`', 'count': 1}]}])

    def test_whole_file_replacement(self):
        self.run_spec([{'target': 'Contents/a.js', 'content': 'stub\n'}])
        self.assertEqual((self.root / 'out/a.js').read_text(), 'stub\n')


if __name__ == '__main__':
    unittest.main()
