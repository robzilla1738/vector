"""Exact replay plus preservation and real native API contract checks."""
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = Path(tempfile.mkdtemp(prefix='aux-navigation-replay-20261024-a3-', dir='/private/tmp'))
TREE = OUT / 'tree'
TREE.mkdir()
sha = lambda v: hashlib.sha256(v).hexdigest()
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
    # Concrete behavior changes leave existing popup dimensions and paint/
    # native controls decoration byte-identical. Theme/frame files untouched.
    if row['path'].endswith('aux_tab_search_bubble.cc'):
        for start, end in [('  gfx::Rect CenteredBounds() const {','  void FinishHide() {'),
                           ('class AuxTabSearchDelegate :','}  // namespace')]:
            assert original.decode().split(start,1)[1].split(end,1)[0] == text.split(start,1)[1].split(end,1)[0]
    if row['path'].endswith('aux_keyboard_shortcuts.mm'):
        for start, end in [('std::string ShortcutOwner(', 'std::string ShortcutRevision('),
                           ('std::optional<std::string> ValidateMappings(', '}  // namespace')]:
            assert original.decode().split(start,1)[1].split(end,1)[0] == text.split(start,1)[1].split(end,1)[0]
    if row['path'].endswith('aux_preview_controller.cc'):
        assert original.decode().split('bool Regular(',1)[1].split('OpenResult Open(',1)[0] == text.split('bool Regular(',1)[1].split('OpenResult Open(',1)[0]
        start, end = '  gfx::Rect bounds(', '  const auto source_current = '
        old = original.decode().split(start,1)[1].split('  auto* browser = CreateBrowserWindow',1)[0]
        new = text.split(start,1)[1].split(end,1)[0]
        assert old == new
    if row['path'].endswith('aux_preview_controls.cc'):
        assert original.decode().split('  explicit Controls(',1)[1].split('  void DidStopLoading()',1)[0] == text.split('  explicit Controls(',1)[1].split('  void DidStopLoading()',1)[0]
    target = TREE / row['path']
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(original)

def git(*args):
    return subprocess.run(['git','-C',str(TREE),*map(str,args)],check=True,capture_output=True)
git('init','-q')
git('apply','--check',HERE/'native.patch')
git('apply',HERE/'native.patch')
for row in plan['files']:
    assert sha((TREE/row['path']).read_bytes()) == row['outputSha256']
    assert sha((ROOT/row['path']).read_bytes()) == row['inputSha256']
git('apply','--reverse','--check',HERE/'native.patch')
contracts = {}
for name in ['chrome/browser/ui/navigator/browser_navigator_params.h',
             'chrome/app/chrome_command_ids.h', 'ui/views/view.h',
             'chrome/browser/ui/aux_keyboard_shortcut_parser.h',
             'chrome/browser/extensions/api/aux_browser_preferences/aux_browser_preferences_api.cc',
             'chrome/browser/ui/views/frame/aux_navigation_placement.cc',
             'chrome/browser/ui/views/frame/aux_frame_presentation_state.h',
             'chrome/browser/ui/views/frame/multi_contents_view_mini_toolbar.cc']:
    contracts[name] = sha((ROOT/name).read_bytes())
assert '#define IDC_TAB_SEARCH 52500' in (ROOT/'chrome/app/chrome_command_ids.h').read_text()
assert 'void RemoveAccelerator(const ui::Accelerator& accelerator);' in (ROOT/'ui/views/view.h').read_text()
assert 'raw_ptr<content::WebContents, DanglingUntriaged>\n      navigated_or_inserted_contents' in (ROOT/'chrome/browser/ui/navigator/browser_navigator_params.h').read_text()
receipt = {'format':'aux.navigation-completion.replay.actual.v1','passed':True,
 'sourcePlanSha256':sha((HERE/'source-plan.json').read_bytes()),'patchSha256':sha((HERE/'native.patch').read_bytes()),
 'files':len(plan['files']),'countedAnchors':sum(len(r['anchors']) for r in plan['files']),
 'output':str(OUT),'reviewedContracts':contracts,'exactReplayPassed':True,'reverseCheckPassed':True,
 'existingPaletteAndPreviewGeometryUnchanged':True,'nativePreviewDecorationUnchanged':True,
 'existingStartupAndProtectedWorkPredicatesUnchanged':True,
 'nativeRootChanged':False,'nativeCompiled':False,'productExecuted':False,'runtimeAccepted':False}
(HERE/'actual-replay-a1.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k!='reviewedContracts'}))
