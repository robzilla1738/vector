import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('apply_checkout_edits', Path(__file__).with_name('apply_checkout_edits.py'))
apply_checkout_edits = importlib.util.module_from_spec(spec)
spec.loader.exec_module(apply_checkout_edits)


class ApplyCheckoutEditsTest(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        (self.root / 'a').mkdir()
        (self.root / 'a/x.grd').write_text('<m>Chrome</m>\n<m>Chrome</m>\n</bundle>\n')

    def run_edits(self, edits, *flags):
        path = self.root / 'edits.json'
        path.write_text(json.dumps(edits))
        return apply_checkout_edits.main([*flags, '--root', str(self.root), str(path)])

    def read(self):
        return (self.root / 'a/x.grd').read_text()

    def test_applies_counted_edits_in_order(self):
        edits = [
            {'path': 'a/x.grd', 'find': 'Chrome', 'replace': 'Aux', 'count': 2},
            {'path': 'a/x.grd', 'find': '</bundle>', 'replace': '<t/>\n</bundle>', 'count': 1},
            {'path': 'a/new.grdp', 'create': '<part/>\n'},
        ]
        self.assertEqual(self.run_edits(edits), 0)
        self.assertEqual(self.read(), '<m>Aux</m>\n<m>Aux</m>\n<t/>\n</bundle>\n')
        self.assertEqual((self.root / 'a/new.grdp').read_text(), '<part/>\n')

    def test_check_mode_writes_nothing(self):
        self.assertEqual(self.run_edits([{'path': 'a/x.grd', 'find': 'Chrome', 'replace': 'Aux', 'count': 2}], '--check'), 0)
        self.assertIn('Chrome', self.read())

    def test_refuses_count_mismatch_without_partial_writes(self):
        edits = [
            {'path': 'a/x.grd', 'find': '</bundle>', 'replace': '<t/>\n</bundle>', 'count': 1},
            {'path': 'a/x.grd', 'find': 'Chrome', 'replace': 'Aux', 'count': 1},
        ]
        self.assertEqual(self.run_edits(edits), 1)
        self.assertNotIn('<t/>', self.read())

    def test_refuses_present_replacement_existing_create_and_unsafe_path(self):
        (self.root / 'a/y.grd').write_text('old new')
        self.assertEqual(self.run_edits([{'path': 'a/y.grd', 'find': 'old', 'replace': 'new', 'count': 1}]), 1)
        self.assertEqual(self.run_edits([{'path': 'a/x.grd', 'create': ''}]), 1)
        self.assertEqual(self.run_edits([{'path': '../x', 'find': 'a', 'replace': 'b', 'count': 1}]), 1)
        self.assertEqual(self.run_edits([{'path': 'a/missing.grd', 'find': 'a', 'replace': 'b', 'count': 1}]), 1)


if __name__ == '__main__':
    unittest.main()
