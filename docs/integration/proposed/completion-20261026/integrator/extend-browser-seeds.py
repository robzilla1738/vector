"""Join browser/host read-only app paths to the frozen browser source set."""
from pathlib import Path
import hashlib
import json
import os
from counted_projection import counted_anchors

HERE = Path(__file__).resolve().parent
BASE = HERE.parent
NATIVE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
PRIOR = Path('/private/tmp/aux-completion-browser-build-20261026-a1')
OUT = Path('/private/tmp/aux-completion-browser-build-20261026-a2')
sha = lambda data: hashlib.sha256(data).hexdigest()
prior = json.loads((PRIOR / 'projection.json').read_text())
current, initial, modes, origins = {}, {}, {}, {}
for row in prior['files']:
    name = row['path']
    data = (NATIVE / name).read_bytes()
    if sha(data) != row['outputSha256']:
        raise ValueError('Frozen browser source changed: ' + name)
    current[name] = data
    initial[name] = data
    modes[name] = row['mode']
    origins[name] = [dict(parentProjection=str(PRIOR / 'projection.json'), parentOutputSha256=row['outputSha256'])]

guard = BASE / 'desktop/app-seed-write-guard'
host = BASE / 'runtime/native-host-seed-denial'
changes = []
for row in json.loads((guard / 'source-plan.json').read_text())['files']:
    changes.append((row['path'], row['inputSha256'], row['outputSha256'], guard / 'source' / row['path']))
host_plan = json.loads((host / 'changes.json').read_text())
changes.append((host_plan['target'], host_plan['inputSha256'], host_plan['outputSha256'], host / 'aux_native_host_lease.cc'))
for name, before, after, source in changes:
    target = NATIVE / name
    data = current.get(name, target.read_bytes() if target.exists() else None)
    if (sha(data) if data is not None else None) != before or sha(source.read_bytes()) != after:
        raise ValueError('Seed-protection source changed: ' + name)
    initial.setdefault(name, data)
    modes.setdefault(name, target.stat().st_mode & 0o777 if target.exists() else 0o644)
    successor = source.read_bytes()
    anchors = counted_anchors(data.decode(), successor.decode()) if data is not None else []
    origins.setdefault(name, []).append(dict(source=str(source), inputSha256=before, outputSha256=after, anchors=anchors))
    current[name] = successor

for name in ['base/BUILD.gn', 'chrome/app/chrome_main_delegate.cc']:
    data = current.get(name, (NATIVE / name).read_bytes())
    initial.setdefault(name, data)
    modes.setdefault(name, (NATIVE / name).stat().st_mode & 0o777)
    text = data.decode()
    if name == 'base/BUILD.gn':
        old = '    "files/file.h",\n'
        new = '    "files/aux_read_only_app.h",\n' + old
    else:
        old = '#include "base/apple/foundation_util.h"'
        new = old + '\n#include "base/apple/bundle_locations.h"\n#include "base/files/aux_read_only_app.h"'
    if text.count(old) != 1:
        raise ValueError('Readonly app registration include changed: ' + name)
    text = text.replace(old, new, 1)
    if name.endswith('chrome_main_delegate.cc'):
        old = '    if (!ValidateOrdinaryUserDataSelection(ordinary_command)) {'
        new = '''    if (!base::RegisterAuxReadOnlyApp(base::apple::OuterBundlePath())) {
      RAW_LOG(ERROR, "Aux fresh startup refused: read-only app registration");
      return 1;
    }
''' + old
        if text.count(old) != 1:
            raise ValueError('Readonly app startup anchor changed')
        text = text.replace(old, new, 1)
    current[name] = text.encode()
    origins.setdefault(name, []).append(dict(inputSha256=sha(data), outputSha256=sha(current[name]),
                                             anchors=counted_anchors(data.decode(), text), rootOwned=True))

if OUT.exists():
    raise ValueError('Fresh seed projection output required')
for name, data in initial.items():
    target = NATIVE / name
    if target.is_symlink() or (target.read_bytes() if target.exists() else None) != data:
        raise ValueError('Native source changed before seed projection: ' + name)
OUT.mkdir(mode=0o700)
records = []
for name, data in current.items():
    target = NATIVE / name
    source = OUT / 'source' / name
    source.parent.mkdir(parents=True, exist_ok=True)
    source.write_bytes(data)
    source.chmod(modes[name])
    if initial[name] != data:
        if initial[name] is not None:
            backup = OUT / 'preimages' / name
            backup.parent.mkdir(parents=True, exist_ok=True)
            backup.write_bytes(initial[name])
        temporary = target.with_name(target.name + '.aux-seeds-a2')
        with temporary.open('xb') as stream:
            stream.write(data)
        temporary.chmod(modes[name])
        os.replace(temporary, target)
    records.append(dict(path=name, inputSha256=sha(initial[name]) if initial[name] is not None else None,
                        outputSha256=sha(data), mode=modes[name], origins=origins[name]))
result = dict(format='aux.completion.browser-projection.v1', source=str(NATIVE), output=str(OUT),
              parentProjectionSha256=sha((PRIOR / 'projection.json').read_bytes()), files=records,
              unownedPathsChanged=False, productExecuted=False, signing=False)
(OUT / 'projection.json').write_text(json.dumps(result, indent=2) + '\n')
(HERE / 'browser-seed-projection.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'passed': True, 'nativeFiles': len(records), 'output': str(OUT)}))
