"""Complete callback routing and ingress settlement without changing the UI."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda data: hashlib.sha256(data).hexdigest()
files, patch = [], []


def project(name, edits):
    original = (ROOT / name).read_bytes()
    text, anchors = original.decode(), []
    for old, new in edits:
        assert text.count(old) == 1, (name, old[:100])
        text = text.replace(old, new)
        anchors.append({'find': old, 'replace': new, 'count': 1})
    output = HERE / 'source' / name
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text)
    files.append({'path': name, 'inputSha256': sha(original), 'outputSha256': sha(text.encode()),
                  'output': str(output), 'anchors': anchors})
    patch.extend(difflib.unified_diff(original.decode().splitlines(True), text.splitlines(True),
                                       fromfile='a/' + name, tofile='b/' + name))


project('chrome/browser/aux/routing/routing_service.cc', [
    ('#include "base/strings/utf_string_conversions.h"',
     '#include "base/strings/utf_string_conversions.h"\n#include "base/strings/string_split.h"'),
    ('#include "content/public/browser/browser_thread.h"',
     '#include "content/public/browser/browser_thread.h"\n#include "content/public/browser/web_contents.h"'),
    ('#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"',
     '#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"\n'
     '#include "chrome/browser/ui/tabs/tab_strip_model.h"'),
    ('bool BypassAutomaticRouting(const GURL& url) {',
     '''bool AuthenticationParameter(std::string_view key) {
  return key.find('%') != std::string_view::npos || key == "code" ||
      key == "state" || key == "access_token" || key == "id_token" ||
      key == "oauth_token" || key == "oauth_verifier";
}
bool BypassAutomaticRouting(const GURL& url) {'''),
    ('''    if (key.find('%') != std::string::npos) return true;
    if (key == "code" || key == "state" || key == "access_token" ||
        key == "id_token" || key == "oauth_token" || key == "oauth_verifier")
      return true;''',
     '    if (AuthenticationParameter(key)) return true;'),
    ('''  const auto fragment = base::ToLowerASCII(url.ref());
  return fragment.find("access_token=") != std::string::npos ||
         fragment.find("id_token=") != std::string::npos;''',
     '''  // OAuth callbacks can carry code/state in a fragment, including a
  // hash-router query. Keep them with their original profile just like query
  // callbacks. Inspect parameter names only; never log or decode token values.
  const auto fragment = base::ToLowerASCII(url.ref());
  std::string_view parameters(fragment);
  if (const auto query = parameters.find('?'); query != std::string_view::npos)
    parameters.remove_prefix(query + 1);
  for (const auto field : base::SplitStringPiece(parameters, "&", base::KEEP_WHITESPACE,
                                                 base::SPLIT_WANT_ALL))
    if (AuthenticationParameter(field.substr(0, field.find('=')))) return true;
  return false;'''),
    ('    NavigateParams params(browser, intent_.url, ui::PAGE_TRANSITION_LINK);',
     '    auto retained_browser = browser->GetWeakPtr();\n'
     '    NavigateParams params(browser, intent_.url, ui::PAGE_TRANSITION_LINK);'),
    ('    if (!params.navigated_or_inserted_contents) { Fail("navigation-refused"); return; }',
     '''    if (!params.navigated_or_inserted_contents) { Fail("navigation-refused"); return; }
    // Navigate may synchronously reenter profile/window observers. The issued
    // navigation is never retried or rolled back, but cannot publish a stale
    // success or fall through into another profile after losing its binding.
    if (!Current() || !target_ || !Admitted(target_.get()) || !retained_browser ||
        retained_browser->GetProfile() != target_.get() ||
        aux::GetProfileCookieBindingEpoch(target_.get()) != target_epoch_) {
      Fail("routing-changed-after-navigation"); return;
    }
    auto* strip = retained_browser->GetTabStripModel();
    const int inserted = strip->GetIndexOfWebContents(params.navigated_or_inserted_contents);
    if (inserted == TabStripModel::kNoTab ||
        strip->GetWebContentsAt(inserted)->GetBrowserContext() != target_.get()) {
      Fail("routing-changed-after-navigation"); return;
    }'''),
])
project('chrome/browser/aux/routing/external_routing_ingress.cc', [
    ('''    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(&ExternalBatch::Next, base::RetainedRef(this)));''',
     '''    if (!base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
            FROM_HERE, base::BindOnce(&ExternalBatch::Next, base::RetainedRef(this)))) {
      // TaskRunner false means this continuation definitely cannot run. Settle
      // only the unissued remainder; accepted posts keep their normal custody.
      refused_ += tabs_.size() - index_;
      index_ = tabs_.size();
      Finish();
    }'''),
])
(HERE / 'source-plan.json').write_text(json.dumps({'format': 'aux.profile-routing.completion.source.v1',
    'nativeRoot': str(ROOT), 'files': files, 'taskRunnerContract': {
        'path': 'base/task/task_runner.h', 'sha256': sha((ROOT / 'base/task/task_runner.h').read_bytes()),
        'line': 63, 'claim': 'PostTask false means the task definitely will not run'},
    'productExecuted': False, 'nativeCheckoutChanged': False}, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patch))
print(json.dumps({'files': len(files), 'anchors': sum(len(row['anchors']) for row in files)}))
