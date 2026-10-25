"""Compose/project the bounded startup patch over the last linked A24 browser."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OVERLAY = Path('/private/tmp/aux-ordinary-startup-native-a42')
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
digest = lambda value: hashlib.sha256(value).hexdigest()


def compose():
    OVERLAY.mkdir(mode=0o700)
    prior_path = HERE.parent / 'native-phase-integration-a24/source-composition.json'
    prior = json.loads(prior_path.read_text())
    selected = dict(prior['selectedFiles'])
    inputs, data = [], {}
    for relative, row in selected.items():
        assert sha(row['path']) == row['sha256'], relative
    nav = HERE.parent / 'ordinary-fresh-startup-a38'
    plans = [(nav / 'source-plan.json', nav / 'source'),
             (HERE.parent / 'integration/fresh-profile-initialization.json', None)]
    for plan_path, source_root in plans:
        inputs.append(dict(path=str(plan_path), sha256=sha(plan_path)))
        for row in json.loads(plan_path.read_text())['files']:
            relative = row['path']
            if relative in data:
                before = data[relative]
            elif relative in selected:
                before = Path(selected[relative]['path']).read_bytes()
            else:
                target = ROOT / relative
                before = target.read_bytes() if target.exists() else None
            if row.get('inputAbsent'):
                assert before is None, relative
                after = (source_root / relative).read_bytes()
            else:
                assert before is not None and digest(before) == row['inputSha256'], relative
                text = before.decode()
                for anchor in row['anchors']:
                    assert text.count(anchor['find']) == anchor['count'], relative
                    text = text.replace(anchor['find'], anchor['replace'], anchor['count'])
                after = text.encode()
            assert digest(after) == row['outputSha256'], relative
            if source_root:
                assert after == (source_root / relative).read_bytes()
            data[relative] = after

    # The old parent copy only recognized v3. Pair it with the SAME current
    # native daemon policy parser; this is metadata parsing, not a grant.
    policy = REPO / 'docs/integration/proposed/standard-profile-isolation/ordinary-fresh-browser-startup-a1/source/AuxFreshBootstrapPolicy.swift'
    data['chrome/browser/aux/native_peer_policy/AuxFreshBootstrapPolicy.swift'] = policy.read_bytes()
    inputs.append(dict(path=str(policy), sha256=sha(policy)))
    relative = 'chrome/browser/aux/native_peer_policy/BUILD.gn'
    before = Path(selected[relative]['path']).read_bytes() if relative in selected else (ROOT / relative).read_bytes()
    text = before.decode()
    anchor = '  module_name = "AuxParentSealedPolicy"\n'
    assert text.count(anchor) == 1
    data[relative] = text.replace(anchor, anchor + '  swiftflags = [ "-D", "AUX_BROWSER_ONLY_NATIVE_STARTUP" ]\n').encode()

    for relative, content in data.items():
        path = OVERLAY / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        selected[relative] = dict(path=str(path), sha256=digest(content), changed=True)
    # Freeze older changed inputs too; no later build reads a mutable proposal.
    for relative, row in list(selected.items()):
        if row.get('changed') and relative not in data:
            path = OVERLAY / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(row['path'], path)
            selected[relative] = {**row, 'path': str(path)}
    newer = json.loads((HERE.parent / 'native-closed-handoff-integration-a37/source-composition.json').read_text())
    allowed = {name: row['sha256'] for name, row in newer['selectedFiles'].items()}
    correction = json.loads((REPO / 'docs/integration/proposed/standard-profile-isolation/native-session-handoff-shadow-a39/source-plan.json').read_text())
    allowed.update({row['path']: row['outputSha256'] for row in correction['files']})
    originals = {}
    for relative, row in selected.items():
        target = ROOT / relative
        actual = sha(target) if target.exists() else None
        originals[relative] = actual
        if relative in prior['selectedFiles'] and actual != prior['selectedFiles'][relative]['sha256']:
            assert actual == allowed.get(relative), ('Unrecognized native change', relative)
    result = dict(format='aux.ordinary-startup.native-composition.v1', selectedFiles=selected,
        sourcePlans=inputs, originals=originals, startupFiles=list(data),
        ordinaryFreshMode=True, privilegedTasksEnabled=False, legacyStateAccepted=False,
        priorComposition=str(prior_path), priorCompositionSha256=sha(prior_path),
        actualCheckoutChanged=False, productExecuted=False, productSigned=False)
    (HERE / 'source-composition.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(dict(composed=True, startupFiles=len(data), selectedFiles=len(selected))), flush=True)


def project():
    composition = json.loads((HERE / 'source-composition.json').read_text())
    projected = []
    before = ROOT.parent / 'ordinary-startup-a42-before'
    before.mkdir(mode=0o700)
    for relative, row in composition['selectedFiles'].items():
        target = ROOT / relative
        actual = sha(target) if target.exists() else None
        assert actual == composition['originals'][relative], relative
        assert sha(row['path']) == row['sha256'], relative
        if actual == row['sha256']:
            continue
        assert not target.is_symlink()
        if target.exists():
            backup = before / relative
            backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target, backup)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(row['path'], target)
        projected.append(relative)
    for relative, row in composition['selectedFiles'].items():
        assert sha(ROOT / relative) == row['sha256'], relative
    pins = dict(format='aux.ordinary-startup.native-pins.v1',
        files={name: row['sha256'] for name, row in composition['selectedFiles'].items()},
        sourceCompositionSha256=sha(HERE / 'source-composition.json'), authorityWireVersion=6,
        nativeStartupMode='ordinary-fresh-v1', privilegedTasksEnabled=False)
    (HERE / 'full-native-input-pins.json').write_text(json.dumps(pins, indent=2) + '\n')
    (HERE / 'actual-native-projection.json').write_text(json.dumps(dict(passed=True,
        sourceCompositionSha256=sha(HERE / 'source-composition.json'), projected=projected,
        beforeImages=str(before), deferredRecoveryExcluded=True, ownerChangesReset=False,
        productExecuted=False, acceptedAppReplaced=False), indent=2) + '\n')
    subprocess.run([str(ROOT / 'buildtools/mac/gn'), 'gen', str(ROOT / 'out/AuxFast')],
                   cwd=ROOT, check=True)


if __name__ == '__main__':
    if sys.argv[1:] == ['--project']:
        project()
    elif not sys.argv[1:]:
        compose()
    else:
        raise SystemExit('Use --project under scripts/native-build.py, or no argument to compose.')
