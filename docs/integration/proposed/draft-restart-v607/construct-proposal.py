from pathlib import Path
import hashlib,json,difflib
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
out=Path(__file__).resolve().parent
patches={
'chrome/browser/extensions/api/aux_account/aux_account_api.cc':[
('#include "chrome/browser/aux/browser_platform.h"','#include "chrome/browser/aux/browser_platform.h"\n#include "chrome/browser/extensions/extension_tab_util.h"\n#include "chrome/browser/ui/aux/page_identity.h"'),
('''  if (method == "auxAccount.getProfileContext") {
    if (!args().empty()) return RespondNow(Error("This method takes no arguments"));''','''  if (method == "auxAccount.getProfileContext") {
    if (args().size() > 1 || (!args().empty() && !args()[0].is_int()))
      return RespondNow(Error("Optional draft tab ID must be an integer"));'''),
('''    context.Set("profilePath", current->GetPath().value());''','''    context.Set("profilePath", current->GetPath().value());
    // Additive private draft identity; never replace the live DevTools target.
    // OTR documents retain only their original session-scoped draft storage.
    if (!args().empty() && profile()->IsRegularProfile() &&
        !profile()->IsOffTheRecord() && args()[0].GetInt() > 0) {
      content::WebContents* tab = nullptr;
      if (ExtensionTabUtil::GetTabById(args()[0].GetInt(), profile(),
                                      false, &tab) &&
          tab && tab->GetBrowserContext() == profile()) {
        context.Set("draftPageId", aux::PageIdentity::GetOrCreate(profile(), tab));
      }
    }''')],
'chrome/common/extensions/api/aux_account.json':[
('''        "name": "getProfileContext",
        "type": "function",
        "parameters": [],''','''        "name": "getProfileContext",
        "type": "function",
        "parameters": [{
          "name": "draftTabId",
          "type": "integer",
          "optional": true
        }],''')]}
patches['chrome/browser/extensions/api/aux_account/BUILD.gn'] = [
 ('deps = [ "//base",', 'deps = [ "//chrome/browser/extensions", "//chrome/browser/ui/aux:surface_headers", "//base",')]
patches['chrome/browser/ui/aux/BUILD.gn'] = [
 ('source_set("surface_headers") {\n  sources = [', 'source_set("surface_headers") {\n  public_deps = [ "//content/public/browser" ]\n  sources = [\n    "page_identity.h",')]
records=[]; diff=[]
for rel, edits in patches.items():
 s=(root/rel).read_text();t=s
 for a,b in edits:
  assert t.count(a)==1,(rel,a);t=t.replace(a,b)
 p=out/'sources'/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(t)
 records.append({'path':rel,'baselineSha256':hashlib.sha256(s.encode()).hexdigest(),'outputSha256':hashlib.sha256(t.encode()).hexdigest(),'anchors':[{'count':1,'findSha256':hashlib.sha256(a.encode()).hexdigest(),'replaceSha256':hashlib.sha256(b.encode()).hexdigest()}for a,b in edits]})
 diff+=list(difflib.unified_diff(s.splitlines(True),t.splitlines(True),fromfile='a/'+rel,tofile='b/'+rel))
(out/'native.patch').write_text(''.join(diff));(out/'files.json').write_text(json.dumps({'baseComposition':'v607','files':records},indent=2)+'\n')
