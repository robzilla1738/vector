"""Controlled filesystem admission tests; no helper/native authority evidence."""
import importlib.util
import json
import os
from pathlib import Path
import shutil
import stat
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('writer', Path(__file__).with_name('startup-build-writer.py'))
writer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(writer)


class StartupBuildWriterTest(unittest.TestCase):
    def setUp(self):
        self.root = tempfile.mkdtemp(prefix='aux-native-journey-', dir='/tmp')
        os.chmod(self.root, 0o700)
        os.mkdir(self.root + '/profile', 0o700)
        self.retired = None
        self.build = {'producer': 'aux-native-startup-build', 'version': 1, 'kind': 'aux', 'trial': 'a' * 32,
                      'helperBinarySha256': 'b' * 64, 'helperSourceSha256': 'c' * 64, 'helperImageUuid': 'd' * 32}

    def tearDown(self):
        if os.path.islink(self.root):
            os.unlink(self.root)
        else:
            shutil.rmtree(self.root)
        if self.retired:
            shutil.rmtree(self.retired)

    def request(self):
        return {'fixtureRoot': self.root, 'build': self.build}

    def test_exact_canonical_exclusive_private_file(self):
        record = writer.publish(self.request())
        target = Path(self.root, 'startup-build.json')
        self.assertEqual(target.read_bytes(), json.dumps(self.build, sort_keys=True, separators=(',', ':')).encode())
        self.assertEqual(stat.S_IMODE(target.stat().st_mode), 0o600)
        self.assertEqual(target.stat().st_nlink, 1)
        self.assertEqual(record['bytes'], target.stat().st_size)
        with self.assertRaises(FileExistsError):
            writer.publish(self.request())

    def test_existing_symlink_is_not_followed_or_replaced(self):
        destination = Path(self.root, 'protected')
        destination.write_text('original')
        os.symlink(destination, self.root + '/startup-build.json')
        with self.assertRaises(FileExistsError):
            writer.publish(self.request())
        self.assertEqual(destination.read_text(), 'original')
        self.assertTrue(Path(self.root, 'startup-build.json').is_symlink())

    def test_root_symlink_refuses(self):
        self.retired = self.root + '-retired'
        os.rename(self.root, self.retired)
        os.symlink(self.retired, self.root)
        with self.assertRaises((ValueError, OSError)):
            writer.publish(self.request())

    def test_profile_symlink_refuses(self):
        os.rename(self.root + '/profile', self.root + '/original-profile')
        os.symlink('original-profile', self.root + '/profile')
        with self.assertRaises(OSError):
            writer.publish(self.request())

    def test_weak_directory_permissions_refuse(self):
        for target in [self.root, self.root + '/profile']:
            os.chmod(target, 0o755)
            with self.assertRaises(ValueError):
                writer.publish(self.request())
            os.chmod(target, 0o700)

    def test_original_root_replaced_during_write_refuses(self):
        original_fsync = os.fsync
        def swap(fd):
            original_fsync(fd)
            if self.retired is None and stat.S_ISREG(os.fstat(fd).st_mode):
                self.retired = self.root + '-retired'
                os.rename(self.root, self.retired)
                os.mkdir(self.root, 0o700)
                os.mkdir(self.root + '/profile', 0o700)
        with patch.object(writer.os, 'fsync', side_effect=swap):
            with self.assertRaises(ValueError):
                writer.publish(self.request())
        self.assertFalse(Path(self.root, 'startup-build.json').exists())

    def test_unknown_fields_and_boolean_version_refuse(self):
        self.build['version'] = True
        with self.assertRaises(ValueError):
            writer.publish(self.request())
        self.build['version'] = 1
        self.build['filename'] = 'foreign'
        with self.assertRaises(ValueError):
            writer.publish(self.request())

    def test_duplicate_json_key_is_not_normalized(self):
        with self.assertRaises(ValueError):
            json.loads('{"trial":"a","trial":"b"}', object_pairs_hook=writer.unique)


if __name__ == '__main__':
    unittest.main()
