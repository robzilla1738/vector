"""Round trip for chromium-tree.py on a tiny repository: export, verify, apply, refuse tampering."""
import importlib.util
import subprocess
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('chromium_tree', Path(__file__).with_name('chromium-tree.py'))
tree = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tree)


def git(root, *args):
    return subprocess.run(['git', '-C', str(root), *args], check=True, capture_output=True, text=True).stdout


def base_repo(root):
    root.mkdir()
    git(root, 'init', '-q')
    (root / 'kept.txt').write_text('upstream\n')
    (root / 'gone.txt').write_text('removed by Aux\n')
    git(root, 'add', '.')
    git(root, '-c', 'user.email=fixture@example.invalid', '-c', 'user.name=fixture', 'commit', '-qm', 'base')
    return git(root, 'rev-parse', 'HEAD').strip()


class ChromiumTreeTest(unittest.TestCase):
    def setUp(self):
        self.work = Path(tempfile.mkdtemp())
        self.src = self.work / 'src'
        tree.BASE = base_repo(self.src)
        (self.src / 'kept.txt').write_text('upstream\nAux edit\n')
        (self.src / 'gone.txt').unlink()
        (self.src / 'aux').mkdir()
        (self.src / 'aux' / 'added.cc').write_text('// Aux\n')
        self.dest = self.work / 'tree'
        tree.export(self.src, self.dest)

    def test_export_verifies_and_applies_onto_a_clean_base(self):
        tree.verify(self.src, self.dest)
        clean = self.work / 'clean'
        subprocess.run(['git', 'clone', '-q', str(self.src), str(clean)], check=True)
        tree.apply(clean, self.dest)
        self.assertEqual((clean / 'kept.txt').read_text(), 'upstream\nAux edit\n')
        self.assertEqual((clean / 'aux' / 'added.cc').read_text(), '// Aux\n')
        self.assertFalse((clean / 'gone.txt').exists())

    def test_export_is_byte_deterministic(self):
        first = (self.dest / 'added.tar.gz').read_bytes()
        tree.export(self.src, self.dest)
        self.assertEqual((self.dest / 'added.tar.gz').read_bytes(), first)

    def test_tampered_patch_is_refused(self):
        patch = self.dest / 'aux.patch'
        patch.write_text(patch.read_text().replace('+Aux edit', '+Other edit'))
        with self.assertRaises(SystemExit):
            tree.verify(self.src, self.dest)


if __name__ == '__main__':
    unittest.main()
