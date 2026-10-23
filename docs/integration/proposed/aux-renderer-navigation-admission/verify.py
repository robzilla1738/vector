#!/usr/bin/env python3
"""Check exact changed inputs, successor bytes, and safe cancellation shape."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    pins = json.loads((HERE / 'inputs.json').read_text())
    native = Path(pins['nativeSourceRoot'])
    for item in pins['files']:
        output = (HERE / 'source' / item['path']).read_bytes()
        assert sha(output) == item['outputSha256'], item['path']
        if item['inputSha256'] is not None:
            original = (native / item['path']).read_bytes()
            assert sha(original) == item['inputSha256'], item['path']
            text = original.decode()
            for edit in item['edits']:
                assert text.count(edit['find']) == edit['count'], edit['name']
                text = text.replace(edit['find'], edit['replace'])
            assert text.encode() == output, item['path']
    assert sha((HERE / 'followup.patch').read_bytes()) == pins['patchSha256']
    navigation = (HERE / 'source/content/browser/renderer_host/navigation_request.cc').read_text()
    for function in ['BeginNavigation', 'BeginNavigationImpl']:
        body = navigation.split('void NavigationRequest::' + function + '() {', 1)[1]
        cancel = body.split('frame_tree_node_->ResetNavigationRequest(', 1)[1]
        assert cancel.startswith('''
          NavigationDiscardReason::kInternalCancellation);
      return;  // The cancellation deleted this request.''')
    renderer = (HERE / 'source/content/browser/renderer_host/render_process_host_impl.cc').read_text()
    init = renderer.split('bool RenderProcessHostImpl::Init() {', 1)[1]
    assert init.index('ScopedRendererInitAdmission') < init.index('IsInitializedAndNotDead()')
    assert init.index('ObserveRendererLaunchStarted') < init.index('RenderProcessWillLaunch(this)')
    print('PASS: five exact source pins; eleven anchors; immediate-return cancellation; '
          'Init gate precedes reuse and launch observations precede callbacks')


if __name__ == '__main__':
    main()
