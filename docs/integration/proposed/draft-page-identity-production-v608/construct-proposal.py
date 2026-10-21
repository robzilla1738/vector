from pathlib import Path
import hashlib,json,difflib
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
out=Path(__file__).resolve().parent
patches={
'chrome/browser/aux/BUILD.gn':[
('source_set("profile_identity") {', '''# Stable tab metadata shared by the supplied browser and optional legacy shell.
# Keep it outside ui/aux/BUILD.gn, which asserts enable_aux_shell.
source_set("page_identity") {
  sources = [
    "../ui/aux/page_identity.cc",
    "../ui/aux/page_identity.h",
  ]
  public_deps = [ "//content/public/browser" ]
  deps = [
    "//base",
    "//chrome/browser/profiles:profile",
    "//chrome/browser/sessions",
    "//components/sessions",
    "//ui/gfx/geometry",
  ]
}

source_set("profile_identity") {''')],
'chrome/browser/extensions/api/aux_account/BUILD.gn':[
('"//chrome/browser/ui/aux:surface_headers"','"//chrome/browser/aux:page_identity"')],
'chrome/browser/ui/BUILD.gn':[
('    "//chrome/browser/aux:profile_identity",','    "//chrome/browser/aux:profile_identity",\n    "//chrome/browser/aux:page_identity",')],
'chrome/browser/ui/aux/BUILD.gn':[
('    "page_identity.cc",\n    "page_identity.h",\n',''),
('  public_deps = [ ":semantic" ]','  public_deps = [ ":semantic", "//chrome/browser/aux:page_identity" ]'),
('source_set("surface_headers") {\n  public_deps = [ "//content/public/browser" ]\n  sources = [\n    "page_identity.h",','source_set("surface_headers") {\n  sources = [')],
'chrome/browser/ui/browser_tabrestore.cc':[
('#if BUILDFLAG(ENABLE_AUX_SHELL)\n#include "chrome/browser/ui/aux/page_identity.h"','#if BUILDFLAG(ENABLE_AUX_BROWSER) || BUILDFLAG(ENABLE_AUX_SHELL)\n#include "chrome/browser/ui/aux/page_identity.h"'),
('#if BUILDFLAG(ENABLE_AUX_SHELL)\n  aux::PageIdentity::RestoreFromExtraData(web_contents.get(), extra_data);','#if BUILDFLAG(ENABLE_AUX_BROWSER) || BUILDFLAG(ENABLE_AUX_SHELL)\n  aux::PageIdentity::RestoreFromExtraData(web_contents.get(), extra_data);')],
'chrome/browser/ui/aux/page_identity.cc':[
('#include "chrome/browser/sessions/session_service_factory.h"','#include "chrome/browser/sessions/session_service_factory.h"\n#include "chrome/browser/sessions/session_service.h"')]
}
records=[];diff=[]
for rel,edits in patches.items():
 s=(root/rel).read_text();t=s
 for a,b in edits:
  assert t.count(a)==1,(rel,a,t.count(a));t=t.replace(a,b)
 p=out/'sources'/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(t)
 records.append({'path':rel,'baselineSha256':hashlib.sha256(s.encode()).hexdigest(),'outputSha256':hashlib.sha256(t.encode()).hexdigest(),'anchors':[{'count':1,'findSha256':hashlib.sha256(a.encode()).hexdigest()} for a,b in edits]})
 diff+=list(difflib.unified_diff(s.splitlines(True),t.splitlines(True),fromfile='a/'+rel,tofile='b/'+rel))
(out/'files.json').write_text(json.dumps({'baseComposition':'v608','files':records},indent=2)+'\n');(out/'native.patch').write_text(''.join(diff))
