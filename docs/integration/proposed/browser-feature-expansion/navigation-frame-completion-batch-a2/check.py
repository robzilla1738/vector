"""Check exact native replay, callback/timer contract inputs and visual constants."""
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = Path(tempfile.mkdtemp(prefix='aux-navigation-frame-replay-20261024-a2-', dir='/private/tmp'))
TREE = OUT / 'tree'
TREE.mkdir()
sha = lambda value: hashlib.sha256(value).hexdigest()
plan = json.loads((HERE / 'source-plan.json').read_text())
for row in plan['files']:
    original = (ROOT / row['path']).read_bytes()
    output = Path(row['output']).read_bytes()
    assert sha(original) == row['inputSha256']
    assert sha(output) == row['outputSha256']
    text = original.decode()
    for anchor in row['anchors']:
        assert text.count(anchor['find']) == anchor['count'] == 1
        text = text.replace(anchor['find'], anchor['replace'])
    assert text.encode() == output
    if row['path'].endswith('aux_profile_preview_admission.cc'):
        assert re.findall(r'base::Milliseconds\([^)]*\)', original.decode()) == re.findall(r'base::Milliseconds\([^)]*\)', text)
        assert re.findall(r'gfx::Tween::\w+', original.decode()) == re.findall(r'gfx::Tween::\w+', text)
    if row['path'].endswith('aux_theme_editor.cc'):
        # Actual native visual consumers/default token interpretation stay exact.
        start = 'ui::ColorProviderKey DecorateColorProviderKey('
        assert original.decode().split(start, 1)[1] == text.split(start, 1)[1]
    target = TREE / row['path']
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(original)


def git(*args):
    return subprocess.run(['git', '-C', str(TREE), *map(str, args)], check=True, capture_output=True)


git('init', '-q')
git('apply', '--check', HERE / 'native.patch')
git('apply', HERE / 'native.patch')
for row in plan['files']:
    assert sha((TREE / row['path']).read_bytes()) == row['outputSha256']
    assert sha((ROOT / row['path']).read_bytes()) == row['inputSha256']
git('apply', '--reverse', '--check', HERE / 'native.patch')

contracts = {}
for name in ['base/timer/timer.h', 'base/timer/timer.cc',
             'chrome/browser/ui/animation/browser_animation_controller.cc',
             'chrome/browser/ui/animation/browser_animation_controller.h',
             'chrome/browser/ui/views/frame/aux_navigation_placement.cc',
             'chrome/browser/ui/views/frame/aux_profile_preview_retention.cc',
             'chrome/browser/ui/views/frame/aux_frame_presentation_state.h',
             'chrome/browser/ui/views/frame/layout/browser_view_tabbed_layout_impl.cc',
             'chrome/browser/ui/views/frame/browser_view.cc']:
    contracts[name] = sha((ROOT / name).read_bytes())
timer = (ROOT / 'base/timer/timer.cc').read_text()
assert 'void RetainingOneShotTimer::RunUserTask()' in timer
assert 'Stop();\n  task.Run();' in timer
controller = (ROOT / 'chrome/browser/ui/animation/browser_animation_controller.cc').read_text()
assert 'Notify(BrowserAnimationUpdate::kEnded);\n    current_motion_ = BrowserAnimationMotion();' in controller
receipt = {'format': 'aux.navigation-frame-completion.replay.actual.v1', 'passed': True,
           'sourcePlanSha256': sha((HERE / 'source-plan.json').read_bytes()),
           'patchSha256': sha((HERE / 'native.patch').read_bytes()), 'output': str(OUT),
           'files': len(plan['files']), 'countedAnchors': sum(len(row['anchors']) for row in plan['files']),
           'reviewedContracts': contracts, 'exactReplayPassed': True, 'reverseCheckPassed': True,
           'existingAnimationDurationsAndTweensUnchanged': True,
           'nativeThemeVisualConsumersUnchanged': True,
           'nativeRootChanged': False, 'nativeCompiled': False,
           'productExecuted': False, 'runtimeAccepted': False}
(HERE / 'actual-replay-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({key: value for key, value in receipt.items() if key != 'reviewedContracts'}))
