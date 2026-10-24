#!/usr/bin/env python3
"""Prepare exact GN source proposals, never modifies actual GN or runs GN."""
from pathlib import Path
import hashlib,json
HERE=Path(__file__).resolve().parent;ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();rows=[]
def edit(name,find,replace):return{'name':name,'find':find,'replace':replace,'count':1}
def project(path,edits):
 p=ROOT/path;text=p.read_text()
 for e in edits:assert text.count(e['find'])==e['count']==1,(path,e['name']);text=text.replace(e['find'],e['replace'])
 target=HERE/'source'/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
 rows.append({'path':path,'inputSha256':sha(p),'outputSha256':sha(target),'source':str(target),'anchors':edits,'rootOwned':True,'applied':False})
project('base/BUILD.gn',[edit('Headers-only factual CLI query, primary implementation remains private',
 '''    public = [
      "process/mac/aux_browser_descendant_bridge.h",
      "process/mac/aux_browser_descendant_client.h",
    ]''',
 '''    public = [
      "process/mac/aux_browser_descendant_bridge.h",
      "process/mac/aux_browser_descendant_client.h",
      "process/mac/aux_browser_descendant_cli_membership.h",
    ]''')])
append='''
# Narrow native browser URL command. Common transport has only SDK dependencies;
# the actual profile/approval/navigation implementation remains in :ui.
if (enable_aux_browser && is_mac) {
  source_set("native_cli_open_headers") {
    public = [ "cli/AuxCliOpenCommand.h" ]
  }
  source_set("native_cli_ingress") {
    public = [
      "cli/AuxCliIngress.h",
      "cli/AuxCliSealedImages.h",
      "cli/AuxCliWire.h",
      "cli/AuxCliOpenArguments.h",
    ]
    sources = public + [
      "cli/AuxCliIngress.cc",
      "cli/AuxCliSealedImages.cc",
      "cli/AuxCliWire.cc",
      "cli/AuxCliOpenArguments.cc",
    ]
    frameworks = [ "CoreFoundation.framework", "Security.framework" ]
    libs = [ "bsm" ]
  }
  executable("native_cli_open") {
    # Genuine standalone SDK-only native frontend, not a Node/SEA launcher.
    # Root packaging places this output in the fixed signed CLI bundle later.
    sources = [
      "cli/AuxNativeCliFrontend.mm",
      "cli/AuxNativeEndpointDelivery.cc",
      "cli/AuxNativeEndpointDelivery.h",
      "cli/packaged-identity-admission.h",
    ]
    deps = [ ":native_cli_ingress" ]
    frameworks = [ "Foundation.framework" ]
    libs = [ "bsm" ]
    configs += [ "//build/config/compiler:enable_arc" ]
    ldflags = [ "-Wl,-no_adhoc_codesign" ]
  }
}
'''
p=ROOT/'chrome/browser/aux/BUILD.gn';original=p.read_text();target=HERE/'source/chrome/browser/aux/BUILD.gn';target.parent.mkdir(parents=True,exist_ok=True)
# The existing deps assignment would overwrite a prior +=. Add the interface
# only after that exact target's existing complete dependency declaration.
old='''    "//chrome/browser/profiles:profile_util",
    "//components/prefs",
    "//content/public/browser",
  ]
}

source_set("profile_security_client")'''
new='''    "//chrome/browser/profiles:profile_util",
    "//components/prefs",
    "//content/public/browser",
  ]
  if (enable_aux_browser && is_mac) {
    deps += [ ":native_cli_open_headers" ]
  }
}

source_set("profile_security_client")'''
assert original.count(old)==1;text=original.replace(old,new)+append;target.write_text(text)
rows.append({'path':'chrome/browser/aux/BUILD.gn','inputSha256':sha(p),'outputSha256':sha(target),'source':str(target),'anchors':[edit('Profile identity header dependency without UI cycle',old,new)],'append':append,'appendCount':1,'rootOwned':True,'applied':False})
project('chrome/browser/ui/BUILD.gn',[
 edit('Native CLI UI implementation and genuine dependencies in existing Aux block',
 '''  if (enable_aux_browser && is_mac) {
    deps += [
      "//chrome/browser/profiles:profile",''',
 '''  if (enable_aux_browser && is_mac) {
    sources += [
      "../aux/cli/AuxCliManualProfileApproval.h",
      "../aux/cli/AuxCliManualProfileApproval.mm",
      "../aux/cli/AuxCliOpenCommand.h",
      "../aux/cli/AuxCliOpenCommand.mm",
    ]
    deps += [
      "//chrome/browser/aux:native_cli_open_headers",
      "//chrome/browser/aux:native_cli_ingress",
      "//chrome/browser/profiles/keep_alive",
      "//chrome/browser/profiles:profile",'''),
 edit('Native OS approval frameworks on actual UI Mac target',
 '''    frameworks = [
      "Carbon.framework",
      "Quartz.framework",
    ]''',
 '''    frameworks = [
      "Carbon.framework",
      "Quartz.framework",
    ]
    if (enable_aux_browser) {
      frameworks += [ "AppKit.framework", "Foundation.framework", "LocalAuthentication.framework" ]
    }''')])
project('chrome/browser/BUILD.gn',[edit('Actual PostBrowserStart caller header dependency',
 '''  if (enable_aux_browser && is_mac) {
    deps += [ "//chrome/browser/extensions/api/aux_mini_popup" ]
  }''',
 '''  if (enable_aux_browser && is_mac) {
    deps += [ "//chrome/browser/extensions/api/aux_mini_popup",
              "//chrome/browser/aux:native_cli_open_headers" ]
  }''')])
project('chrome/BUILD.gn',[edit('Retain the separate factual main-image CLI query export',
 '      ldflags += [ "-Wl,-u,_AuxGetBrowserDescendantBridgeV1" ]',
 '      ldflags += [ "-Wl,-u,_AuxGetBrowserDescendantBridgeV1",\n                   "-Wl,-u,_AuxGetActualCliClientMembershipV1" ]')])
project('chrome/app/aux_browser_app.exports',[edit('Expose only the actual primary query beside the unchanged V1 getter',
 '_AuxGetBrowserDescendantBridgeV1\n',
 '_AuxGetBrowserDescendantBridgeV1\n_AuxGetActualCliClientMembershipV1\n')])
(HERE/'gn-plan.json').write_text(json.dumps({'format':'aux.cli-open.gn-proposals.v1','files':rows,'actualNativeMutation':False,'gnRun':False},indent=2)+'\n')
print(json.dumps({'gnFiles':len(rows),'singleMatchAnchors':sum(len(r['anchors'])for r in rows),'appendBlocks':1,'applied':False}))
