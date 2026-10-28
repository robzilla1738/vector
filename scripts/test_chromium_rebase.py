"""chromium-rebase.py on a tiny synthetic upstream: conflicts grouped by area, dry run leaves the checkout alone."""
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('chromium_rebase', SCRIPTS/'chromium-rebase.py')
rebase = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rebase)
tree = rebase.tree


def git(root, *args):
    return subprocess.run(['git', '-C', str(root), '-c', 'user.email=fixture@example.invalid', '-c', 'user.name=fixture', *args],
                          check=True, capture_output=True, text=True).stdout


def write(root, files):
    for path, text in files.items():
        (root/path).parent.mkdir(parents=True, exist_ok=True)
        (root/path).write_text(text)


class ChromiumRebaseTest(unittest.TestCase):
    def setUp(self):
        self.work = Path(tempfile.mkdtemp(prefix='aux-rebase-')).resolve()
        self.addCleanup(subprocess.run, ['rm', '-rf', str(self.work)])
        origin = self.origin = self.work/'origin'
        origin.mkdir()
        git(origin, 'init', '-q')
        write(origin, {'chrome/browser/foo.cc': 'one\ntwo\n', 'chrome/browser/bar.cc': 'bar\n',
                       'chrome/app/chromium_strings.grd': '<name>Chromium</name>\n'})
        git(origin, 'add', '.')
        git(origin, 'commit', '-qm', 'v1')
        git(origin, 'tag', 'v1')
        base = git(origin, 'rev-parse', 'HEAD').strip()
        # The Aux delta on v1: a platform edit, a branding edit, a clean edit and two new Aux files.
        src = self.work/'src'
        git(self.work, 'clone', '-q', str(origin), str(src))
        write(src, {'chrome/browser/foo.cc': 'aux one\ntwo\n', 'chrome/browser/bar.cc': 'bar\naux bar\n',
                    'chrome/app/chromium_strings.grd': '<name>Aux</name>\n',
                    'chrome/browser/aux/new.cc': '// Aux new\n', 'chrome/browser/aux/other.cc': '// Aux other\n'})
        self.tree = self.work/'tree'
        previous, tree.BASE = tree.BASE, base
        self.addCleanup(setattr, tree, 'BASE', previous)
        tree.export(src, self.tree)
        # Upstream v2 touches the same lines and adds a file at one of Aux's new paths.
        write(origin, {'chrome/browser/foo.cc': 'upstream one\ntwo\n', 'chrome/app/chromium_strings.grd': '<name>Chromium 2</name>\n',
                       'chrome/browser/aux/new.cc': '// upstream\n'})
        git(origin, 'add', '.')
        git(origin, 'commit', '-qm', 'v2')
        git(origin, 'tag', 'v2')

    def fresh(self, name):
        path = self.work/name
        git(self.work, 'clone', '-q', '--branch', 'v1', self.origin.as_uri(), str(path))
        git(path, 'tag', '-d', 'v2')  # the rebase must fetch the new tag itself
        return path

    def expected(self, report):
        self.assertEqual(report['conflicts'], {
            'aux-owned': [{'path': 'chrome/browser/aux/new.cc', 'kind': 'exists upstream'}],
            'branding': [{'path': 'chrome/app/chromium_strings.grd', 'kind': 'conflict'}],
            'platform': [{'path': 'chrome/browser/foo.cc', 'kind': 'conflict'}]})
        self.assertTrue(report['applied'])

    def test_rebase_fetches_the_tag_applies_three_way_and_groups_conflicts(self):
        fresh = self.fresh('fresh')
        report = rebase.rebase(fresh, 'v2', self.tree)
        self.expected(report)
        self.assertEqual(git(fresh, 'rev-parse', 'HEAD'), git(self.origin, 'rev-parse', 'v2'))
        self.assertEqual((fresh/'chrome/browser/bar.cc').read_text(), 'bar\naux bar\n')
        self.assertIn('<<<<<<<', (fresh/'chrome/browser/foo.cc').read_text())
        self.assertEqual((fresh/'chrome/browser/aux/other.cc').read_text(), '// Aux other\n')
        self.assertEqual((fresh/'chrome/browser/aux/new.cc').read_text(), '// upstream\n')

    def test_dry_run_uses_a_temporary_index_and_changes_nothing(self):
        fresh = self.fresh('dry')
        git(fresh, 'fetch', '-q', 'origin', '+refs/tags/v2:refs/tags/v2')
        head, index = git(fresh, 'rev-parse', 'HEAD'), (fresh/'.git/index').read_bytes()
        self.expected(rebase.rebase(fresh, 'v2', self.tree, dry_run=True))
        self.assertEqual(git(fresh, 'rev-parse', 'HEAD'), head)
        self.assertEqual((fresh/'.git/index').read_bytes(), index)
        self.assertEqual(git(fresh, 'status', '--porcelain', '--untracked-files=all'), '')

    def test_a_path_upstream_deleted_is_reported_as_failed(self):
        git(self.origin, 'rm', '-q', 'chrome/browser/bar.cc')
        git(self.origin, 'commit', '-qm', 'v3')
        git(self.origin, 'tag', 'v3')
        fresh = self.fresh('deleted')
        report = rebase.rebase(fresh, 'v3', self.tree)
        self.assertFalse(report['applied'])
        self.assertIn({'path': 'chrome/browser/bar.cc', 'kind': 'failed'}, report['conflicts']['platform'])
        self.assertFalse((fresh/'chrome/browser/aux/other.cc').exists())  # nothing is extracted after a failed apply

    def test_dry_run_needs_the_tag_already_present(self):
        with self.assertRaises(SystemExit):
            rebase.rebase(self.fresh('missing'), 'v2', self.tree, dry_run=True)

    def test_the_durable_checkout_is_refused(self):
        fresh = self.fresh('durable')
        for protected in (fresh, fresh/'chrome', fresh.parent):
            previous, rebase.aux_chromium.DURABLE_SRC = rebase.aux_chromium.DURABLE_SRC, protected
            try:
                with self.subTest(protected=protected), self.assertRaises(SystemExit):
                    rebase.rebase(fresh, 'v2', self.tree, dry_run=True)
            finally:
                rebase.aux_chromium.DURABLE_SRC = previous
        self.assertEqual(git(fresh, 'status', '--porcelain'), '')

    def test_area_rules(self):
        cases = {'chrome/browser/ui/views/frame/aux_sidebar_view.cc': 'aux-owned', 'chrome/browser/aux/cli/x.mm': 'aux-owned',
                 'chrome/app/theme/chromium/product_logo_32.png': 'branding', 'chrome/app/generated_resources.grd': 'branding',
                 'chrome/app/resources/chromium_strings_fr.xtb': 'branding', 'chrome/browser/ui/views/frame/browser_view.cc': 'platform',
                 'chrome/browser/auxiliary/thing.cc': 'platform', 'third_party/new_upstream_file.cc': 'aux-owned'}
        for path, expected in cases.items():
            self.assertEqual(rebase.area(path, {'third_party/new_upstream_file.cc'}), expected, path)


if __name__ == '__main__':
    unittest.main()
