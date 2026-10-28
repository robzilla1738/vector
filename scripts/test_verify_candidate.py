"""verify-candidate.py against a tiny fixture app: pins, chromium tree pin and whole-inventory drift."""
import hashlib, importlib.util, json, shutil, tempfile, unittest
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('verify_candidate', SCRIPTS/'verify-candidate.py')
verify_candidate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify_candidate)
HELPER = SCRIPTS.parent/'docs/integration/proposed/profile-isolation-delivery/package/assemble.py'


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


class VerifyCandidateTest(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix='aux-verify-fixture-')).resolve()
        self.addCleanup(shutil.rmtree, self.root)
        self.app = self.root/'Aux.app'
        (self.app/'Contents/MacOS').mkdir(parents=True)
        (self.app/'Contents/MacOS/Aux').write_text('browser\n')
        (self.app/'Contents/Info.plist').write_text('<plist/>\n')
        (self.app/'Contents/Current').symlink_to('MacOS')
        spec = importlib.util.spec_from_file_location('helper', HELPER)
        self.helper = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.helper)
        files = self.helper.inventory(self.app)
        receipt = self.root/'repair/receipt.json'
        receipt.parent.mkdir()
        receipt.write_text(json.dumps({'files': files, 'inventorySha256': self.helper.digest(files)}))
        self.input = self.root/'inputs/index.mjs'
        self.input.parent.mkdir()
        self.input.write_text('input\n')
        self.tree = self.root/'manifest.json'
        self.tree.write_text('{"files": {}}\n')
        self.review = self.root/'review.json'
        self.review.write_text(json.dumps({'inventoryHelper': {'path': str(HELPER), 'sha256': sha(HELPER)}}))
        self.selection = self.root/'selection.json'
        # One pin is recorded under the pre-rename root and must be re-rooted.
        legacy_input = verify_candidate.LEGACY + str(self.input)[len(str(self.root)):]
        self.selection.write_text(json.dumps({
            'signedInventorySha256': self.helper.digest(files), 'chromiumTreeManifestSha256': sha(self.tree),
            'repair': {'path': str(receipt), 'sha256': sha(receipt)},
            'nested': [{'inputs': [{'path': legacy_input, 'sha256': sha(self.input)}]}]}))

    def verify(self):
        return verify_candidate.verify(self.selection, self.app, self.review, self.tree, self.root)

    def test_matching_fixture_passes(self):
        result = self.verify()
        self.assertTrue(result['passed'], result)
        self.assertEqual((result['pins'], result['chromiumTree']), (2, 'current'))
        self.assertEqual(result['inventory'], '3 entries, 0 differ')

    def test_changed_and_missing_pins_fail(self):
        self.input.write_text('edited\n')
        result = self.verify()
        self.assertFalse(result['passed'])
        self.assertEqual(len(result['changed']), 1)
        self.input.unlink()
        self.assertEqual(len(self.verify()['missing']), 1)

    def test_stale_chromium_tree_fails(self):
        self.tree.write_text('{"files": {"new.cc": "0"}}\n')
        result = self.verify()
        self.assertFalse(result['passed'])
        self.assertTrue(result['chromiumTree'].startswith('stale'))

    def test_added_changed_or_retargeted_app_entries_fail(self):
        for change in (lambda: (self.app/'Contents/Extra').write_text('new\n'),
                       lambda: (self.app/'Contents/MacOS/Aux').write_text('changed\n'),
                       lambda: ((self.app/'Contents/Current').unlink(), (self.app/'Contents/Current').symlink_to('.'))):
            with self.subTest(change=change):
                self.setUp()
                change()
                result = self.verify()
                self.assertFalse(result['passed'])
                self.assertIn('1 differ', result['inventory'])

    def test_no_receipt_for_the_sealed_inventory_fails(self):
        selection = json.loads(self.selection.read_text())
        selection['signedInventorySha256'] = '0' * 64
        self.selection.write_text(json.dumps(selection))
        self.assertEqual(self.verify()['inventory'], 'no receipt matches signedInventorySha256')


if __name__ == '__main__':
    unittest.main()
