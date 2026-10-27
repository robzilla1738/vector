# split-menu-feedback-a1

The split-view toolbar menu offered upstream Chrome's "Send Feedback", which opens Google's feedback page. The owner decided on 2026-10-27 to remove it. The menu no longer adds the item. The command id and handler stay in place, unreachable, so the upstream enum and the metrics names don't change.

The baseline equals the file the current candidate was built from (`split-menu-startup` output). `projection.json` records both hashes and `native.patch` holds the diff.
