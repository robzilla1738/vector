#!/usr/bin/env python3
"""Prepare a counted source-only correction; never mutate the native tree."""
from pathlib import Path
import difflib
import hashlib
import json

HERE = Path(__file__).resolve().parent
TREE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
NAME = 'chrome/browser/extensions/api/messaging/launch_context_posix.cc'
PINS = HERE.parent / 'integration/full-native-input-pins-a4.json'


def sha(data):
    return hashlib.sha256(data).hexdigest()


assert not (HERE / 'manifest.json').exists()
before = (TREE / NAME).read_bytes()
pins = json.loads(PINS.read_text())
assert sha(before) == pins['files'][NAME]
edits = [
    {
        'path': NAME, 'count': 1,
        'old': '#include <memory>\n#include <utility>\n',
        'new': '#include <fcntl.h>\n#include <sys/stat.h>\n\n#include <memory>\n#include <utility>\n',
    },
    {
        'path': NAME, 'count': 1,
        'old': '#if BUILDFLAG(IS_MAC)\n  auto sandboxed_host = aux::peer::PrepareNativeHostPathWriteRestrictions(command_line);',
        'new': '''#if BUILDFLAG(IS_MAC)
  // A third-party host must not inherit a writable browser/profile log FD.
  // Keep native-messaging stdin/stdout framing unchanged; stderr is diagnostic.
  base::ScopedFD diagnostic_sink(
      HANDLE_EINTR(open("/dev/null", O_WRONLY | O_CLOEXEC | O_NOFOLLOW)));
  struct stat diagnostic_stat = {};
  if (!diagnostic_sink.is_valid() ||
      fstat(diagnostic_sink.get(), &diagnostic_stat) != 0 ||
      !S_ISCHR(diagnostic_stat.st_mode) || diagnostic_stat.st_uid != 0) {
    LOG(ERROR) << "Native messaging diagnostic sink unavailable";
    return std::nullopt;
  }
  options.fds_to_remap.emplace_back(diagnostic_sink.get(), STDERR_FILENO);
  auto sandboxed_host = aux::peer::PrepareNativeHostPathWriteRestrictions(command_line);''',
    },
]
after = before.decode()
for edit in edits:
    assert after.count(edit['old']) == edit['count']
    after = after.replace(edit['old'], edit['new'])
after = after.encode()
for directory, content in [('baseline', before), ('source', after)]:
    path = HERE / directory / NAME
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)
patch = ''.join(difflib.unified_diff(before.decode().splitlines(True),
    after.decode().splitlines(True), fromfile='a/' + NAME, tofile='b/' + NAME))
(HERE / 'change.patch').write_text(patch)
(HERE / 'replacements.json').write_text(json.dumps(edits, indent=2) + '\n')
manifest = {
    'format': 'aux.standard-native-host-stderr.source.v1',
    'baselineInputPins': str(PINS), 'baselineInputPinsSha256': sha(PINS.read_bytes()),
    'patchSha256': sha(patch.encode()), 'countedEdits': len(edits),
    'files': [{'path': NAME, 'beforeSha256': sha(before), 'afterSha256': sha(after)}],
    'nativeTreeChanged': False, 'uiChanged': False, 'compiled': False,
    'productExecuted': False, 'productSigned': False, 'cleanRecoveryProven': False,
}
(HERE / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps(manifest, indent=2))
