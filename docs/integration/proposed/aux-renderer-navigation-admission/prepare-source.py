#!/usr/bin/env python3
"""Generate exact renderer/navigation successors without modifying Chromium."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
NATIVE = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
INPUT_PINS = {
    'content/browser/renderer_host/render_process_host_impl.cc': '6d9b90abeb902d47259d5baa78c87672be140729fc86e53481b33de6221f4725',
    'content/browser/renderer_host/navigation_request.cc': 'e3cbbb2630f28e3684247796da62d1655ecd4f62501680fce3ac1356902718c2',
}


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    records = []
    patch = ''
    specs = [
        ('content/browser/renderer_host/render_process_host_impl.cc', [
            ('include', '#include "content/browser/renderer_host/render_process_host_impl.h"',
             '#include "content/browser/renderer_host/render_process_host_impl.h"\n'
             '#include "content/browser/renderer_host/aux_renderer_navigation_admission.h"'),
            ('reuse and init entry admission', 'bool RenderProcessHostImpl::Init() {',
             'bool RenderProcessHostImpl::Init() {\n'
             '  aux_migration::ScopedRendererInitAdmission aux_admission;\n'
             '  if (!aux_admission.admitted())\n'
             '    return false;\n'),
            ('observe launch before initialization callbacks',
             '  if (renderer_path.empty())\n    return false;\n\n  is_initialized_ = true;',
             '  if (renderer_path.empty())\n    return false;\n\n'
             '  aux_migration::ObserveRendererLaunchStarted(this, run_renderer_in_process());\n'
             '  is_initialized_ = true;'),
            ('launch callback lifetime', 'void RenderProcessHostImpl::OnProcessLaunched() {',
             'void RenderProcessHostImpl::OnProcessLaunched() {\n'
             '  aux_migration::ScopedRendererLaunchCallback aux_callback(this);'),
            ('launch failure callback lifetime', 'void RenderProcessHostImpl::OnProcessLaunchFailed(int error_code) {',
             'void RenderProcessHostImpl::OnProcessLaunchFailed(int error_code) {\n'
             '  aux_migration::ScopedRendererLaunchCallback aux_callback(this);'),
            ('no-callback destruction remains unknown', 'RenderProcessHostImpl::~RenderProcessHostImpl() {',
             'RenderProcessHostImpl::~RenderProcessHostImpl() {\n'
             '  aux_migration::ObserveRendererHostDestruction(this);'),
        ]),
        ('content/browser/renderer_host/navigation_request.cc', [
            ('include', '#include "content/browser/renderer_host/navigation_request.h"',
             '#include "content/browser/renderer_host/navigation_request.h"\n'
             '#include "content/browser/renderer_host/aux_renderer_navigation_admission.h"'),
            ('object destruction is not storage cleanup', 'NavigationRequest::~NavigationRequest() {',
             'NavigationRequest::~NavigationRequest() {\n'
             '  aux_migration::ObserveNavigationDestruction(this);'),
        ]),
    ]
    for function, first_entry in [('BeginNavigation', True), ('BeginNavigationImpl', False)]:
        anchor = 'void NavigationRequest::' + function + '() {'
        replacement = anchor + '\n' + (
            '  aux_migration::ScopedNavigationAdmission aux_admission(this, ' +
            ('true' if first_entry else 'false') + ');\n'
            '  if (!aux_admission.admitted()) {\n'
            '    if (frame_tree_node_->navigation_request() == this) {\n'
            '      net_error_ = net::ERR_ABORTED;\n'
            '      frame_tree_node_->ResetNavigationRequest(\n'
            '          NavigationDiscardReason::kInternalCancellation);\n'
            '      return;  // The cancellation deleted this request.\n'
            '    }\n'
            '    // A non-FrameTreeNode-owned route cannot be deleted through\n'
            '    // that owner. Preserve its original cleanup and report the gap.\n'
            '    aux_migration::ObserveUnsupportedNavigationCancellation();\n'
            '  }\n')
        specs[1][1].append((function + ' actual entry/resume admission', anchor, replacement))
    anchor = '''void NavigationRequest::OnStartChecksComplete(
    NavigationThrottle::ThrottleCheckResult result) {
  TRACE_EVENT("navigation", "NavigationRequest::OnStartChecksComplete",
              perfetto::Flow::FromPointer(this));
  CHECK(result.action() != NavigationThrottle::DEFER);
  CHECK(result.action() != NavigationThrottle::BLOCK_RESPONSE);'''
    specs[1][1].append(('actual URL-loader dispatch admission', anchor, anchor + '''
  aux_migration::ScopedNavigationAdmission aux_admission(this, false);
  if (!aux_admission.admitted()) {
    // Retain the original asynchronous failure/weak-callback cleanup below.
    result = NavigationThrottle::ThrottleCheckResult(
        NavigationThrottle::CANCEL_AND_IGNORE);
  }'''))

    for name, edits in specs:
        before = (NATIVE / name).read_bytes()
        assert sha(before) == INPUT_PINS[name], name
        text = before.decode()
        reviewed = []
        for label, find, replace in edits:
            assert text.count(find) == 1, (name, label)
            text = text.replace(find, replace)
            reviewed.append({'name': label, 'find': find, 'replace': replace, 'count': 1})
        output = text.encode()
        target = HERE / 'source' / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(output)
        records.append({'path': name, 'inputSha256': sha(before),
                        'outputSha256': sha(output), 'edits': reviewed})
        patch += 'diff --git a/' + name + ' b/' + name + '\n'
        patch += ''.join(difflib.unified_diff(before.decode().splitlines(True),
                                            text.splitlines(True),
                                            fromfile='a/' + name, tofile='b/' + name))

    for name in [
        'content/public/browser/aux_renderer_navigation_admission.h',
        'content/browser/renderer_host/aux_renderer_navigation_admission.h',
        'content/browser/renderer_host/aux_renderer_navigation_admission.cc',
    ]:
        output = (HERE / 'source' / name).read_bytes()
        records.append({'path': name, 'inputSha256': None, 'outputSha256': sha(output)})
        patch += 'diff --git a/' + name + ' b/' + name + '\nnew file mode 100644\n'
        patch += ''.join(difflib.unified_diff([], output.decode().splitlines(True),
                                            fromfile='/dev/null', tofile='b/' + name))
    (HERE / 'followup.patch').write_text(patch)
    (HERE / 'inputs.json').write_text(json.dumps({
        'format': 'aux.renderer-navigation-admission.v1',
        'nativeSourceRoot': str(NATIVE), 'files': records,
        'patchSha256': sha(patch.encode()), 'applied': False, 'compiled': False,
        'coldRefusalChanged': False, 'uiViewsChanged': False,
    }, indent=2) + '\n')


if __name__ == '__main__':
    main()
