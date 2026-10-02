"""Pure hostile filesystem fixtures, never native measurement evidence."""
import importlib.util
import json
import os
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("writer", Path(__file__).parents[1] / "host/lib/performance-mailbox-writer.py")
writer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(writer)


class WriterTest(unittest.TestCase):
    def setUp(self):
        self.root = tempfile.mkdtemp(prefix="aux-native-journey-writer-test-", dir="/private/tmp")
        os.mkdir(self.root + "/profile", 0o700)
        root, profile = os.lstat(self.root), os.lstat(self.root + "/profile")
        self.value = {"profile": self.root + "/profile", "rootDevice": root.st_dev,
                      "rootInode": root.st_ino, "profileDevice": profile.st_dev,
                      "profileInode": profile.st_ino, "action": "publish",
                      "sequence": "1", "operation": "prepareGuestTabSwitchPresentation"}
        self.foreign = tempfile.mkdtemp(prefix="aux-synthetic-foreign-writer-", dir="/private/tmp")
        self.target = Path(self.foreign) / writer.FILE
        self.target.write_text("untouched")
        self.moved = self.root + "-moved"

    def tearDown(self):
        if os.path.islink(self.root):
            os.unlink(self.root)
        else:
            shutil.rmtree(self.root, ignore_errors=True)
        shutil.rmtree(self.moved, ignore_errors=True)
        shutil.rmtree(self.foreign)

    def run_request(self, value=None):
        value = value or self.value
        fd = writer.admission(value)
        try:
            writer.execute(value, fd)
        finally:
            os.close(fd)

    def test_fixed_private_publish_and_reset(self):
        self.run_request()
        file = Path(self.root) / writer.FILE
        self.assertEqual(json.loads(file.read_text()), {"sequence": "1", "operation": self.value["operation"]})
        self.assertEqual(file.stat().st_mode & 0o777, 0o600)
        value = {key: val for key, val in self.value.items() if key not in ("sequence", "operation")}
        value["action"] = "reset"
        self.run_request(value)
        self.assertFalse(file.exists())

    def test_closed_shape_and_operation(self):
        for changes in ({"windowId": 7}, {"operation": "pages.open"}, {"sequence": "01"}, {"sequence": "4001"}):
            with self.assertRaises(ValueError):
                writer.parse(json.dumps({**self.value, **changes}).encode())

    def test_symlink_root_and_stale_inode_refuse(self):
        value = {**self.value, "rootInode": self.value["rootInode"] + 1}
        with self.assertRaises(ValueError):
            self.run_request(value)
        os.rename(self.root, self.moved)
        os.symlink(self.foreign, self.root)
        with self.assertRaises(OSError):
            self.run_request()
        self.assertEqual(self.target.read_text(), "untouched")

    def test_profile_and_control_symlinks_refuse(self):
        os.symlink(self.target, Path(self.root) / writer.FILE)
        with self.assertRaises(ValueError):
            self.run_request()
        self.assertEqual(self.target.read_text(), "untouched")
        os.unlink(Path(self.root) / writer.FILE)
        os.rmdir(self.root + "/profile")
        os.symlink(self.foreign, self.root + "/profile")
        with self.assertRaises(OSError):
            self.run_request()

    def test_root_swapped_between_validation_and_rename_cannot_redirect_write(self):
        actual = os.rename

        def replace(src, dst, **kwargs):
            self.assertEqual(src, writer.TEMP)
            self.assertEqual(dst, writer.FILE)
            self.assertEqual(kwargs["src_dir_fd"], kwargs["dst_dir_fd"])
            actual(self.root, self.moved)
            os.symlink(self.foreign, self.root)
            actual(src, dst, **kwargs)

        with patch.object(writer.os, "rename", replace), self.assertRaises(ValueError):
            self.run_request()
        self.assertEqual(self.target.read_text(), "untouched")
        self.assertTrue((Path(self.moved) / writer.FILE).is_file())

    def test_reset_root_swap_cannot_delete_foreign_control_file(self):
        self.run_request()
        actual = os.unlink

        def replace(name, **kwargs):
            if name == writer.FILE:
                os.rename(self.root, self.moved)
                os.symlink(self.foreign, self.root)
            actual(name, **kwargs)

        value = {key: val for key, val in self.value.items() if key not in ("sequence", "operation")}
        value["action"] = "reset"
        with patch.object(writer.os, "unlink", replace), self.assertRaises(ValueError):
            self.run_request(value)
        self.assertEqual(self.target.read_text(), "untouched")


if __name__ == "__main__":
    unittest.main()
