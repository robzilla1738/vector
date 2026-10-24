#!/usr/bin/env python3
"""Pin/replay exact source changes and compiler inputs, never run toolchain."""
from pathlib import Path
import hashlib,json
HERE=Path(__file__).resolve().parent;BASE=HERE.parent;ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');WEB=HERE.parents[4]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();rows=[]
def edit(name,find,replace):return{'name':name,'find':find,'replace':replace,'count':1}
def successor(name,path,original,edits,append=''):
 text=original.read_text()
 for e in edits:assert text.count(e['find'])==e['count']==1,(name,e['name']);text=text.replace(e['find'],e['replace'])
 text+=append;source=HERE/'source'/name;assert source.read_text()==text
 rows.append({'path':path,'source':str(source),'input':str(original),'inputSha256':sha(original),'outputSha256':sha(source),'anchors':edits,'append':append,'appendCount':1 if append else 0})
old=''' // Preserve the current packaged-state quarantine. This can deny startup;
 // neither a marker nor an argument grants a native installation owner.
 if(!aux::packaged_identity::MarkerAllowedAt(root+"/bundle.json")){
  std::fputs("Aux packaged state identity is unsupported or unaccepted\\n",stderr);return 78;
 }
'''
successor('AuxNativeCliFrontend.mm','chrome/browser/aux/cli/AuxNativeCliFrontend.mm',BASE/'cli-native-open-command-a1/source/AuxNativeCliFrontend.cc',[
 edit('Standalone Objective-C++ process owns its autorelease pool','int main(int argc,char* argv[]){','int main(int argc,char* argv[]){\n @autoreleasepool {'),
 edit('Old installation marker no longer blocks the unrelated native browser command',old,''),
 edit('Private Node child remains marker-gated and unconditionally unsupported',''' if(endpoint!=MACH_PORT_NULL){
  mach_port_deallocate(mach_task_self(),endpoint);''',''' if(endpoint!=MACH_PORT_NULL){
  mach_port_deallocate(mach_task_self(),endpoint);
  // A browser-owned Node/installation role remains unsupported regardless of
  // immutable marker contents. No marker creates an installation owner.
  if(!aux::packaged_identity::MarkerAllowedAt(root+"/bundle.json")){
   std::fputs("Aux packaged state identity is unsupported or unaccepted\\n",stderr);return 78;
  }'''),
 edit('Retain installation/account marker refusal only in unsupported broad branch',''' if(parsed.status!=aux::cli::OpenParseStatus::accepted){
  std::fputs("Aux currently supports native open only; installation/account CLI commands remain unavailable\\n",stderr);return 64;
 }''',''' if(parsed.status!=aux::cli::OpenParseStatus::accepted){
  // Keep the old installation/account marker refusal in that unsupported role.
  // The narrow native browser command never reads a mutable home or starts Node.
  if(!aux::packaged_identity::MarkerAllowedAt(root+"/bundle.json")){
   std::fputs("Aux packaged state identity is unsupported or unaccepted\\n",stderr);return 78;
  }
  std::fputs("Aux currently supports native open only; installation/account CLI commands remain unavailable\\n",stderr);return 64;
 }'''),
 edit('State the real narrow authority route',' return aux::cli::ForwardTerminalInvocation(argc,argv);',' // Native open is admitted only by the exact browser peer, its genuine native\n // startup/Profile binding and actual one-shot OS approval. Markers grant none.\n return aux::cli::ForwardTerminalInvocation(argc,argv);'),
 edit('Close standalone process autorelease pool',' return aux::cli::ForwardTerminalInvocation(argc,argv);\n}',' return aux::cli::ForwardTerminalInvocation(argc,argv);\n }\n}')])
successor('AuxCliIngress.cc','chrome/browser/aux/cli/AuxCliIngress.cc',BASE/'cli-native-open-command-a1/source/AuxCliIngress.cc',[
 edit('Avoid deprecated C++20 volatile compound assignment','void SignalHandler(int sig){if(sig==SIGINT)signals|=1;else if(sig==SIGTERM)signals|=2;else if(sig==SIGHUP)signals|=4;else if(sig==SIGWINCH)signals|=8;}','void SignalHandler(int sig){if(sig==SIGINT)signals=signals|1;else if(sig==SIGTERM)signals=signals|2;else if(sig==SIGHUP)signals=signals|4;else if(sig==SIGWINCH)signals=signals|8;}')])
successor('AuxCliManualProfileApproval.mm','chrome/browser/aux/cli/AuxCliManualProfileApproval.mm',BASE/'cli-native-open-command-a1/source/AuxCliManualProfileApproval.mm',[
 edit('Framework sees only the main-image factual client interface','#include "base/process/mac/aux_browser_descendant_engine.h"','#include "base/process/mac/aux_browser_descendant_cli_membership.h"')])
removed='''// Only a kernel trailer supplies this token. A missing local observation is
// unknown: it never proves that the client is a manual terminal or permits
// selecting another profile. Managed includes reparented retained descendants.
enum class CliClientMembership { managed, unknown };
CliClientMembership InspectActualCliClient(audit_token_t kernel_peer) noexcept;
'''
successor('aux_browser_descendant_engine.h','base/process/mac/aux_browser_descendant_engine.h',BASE/'cli-native-embedding-a1/source/base/process/mac/aux_browser_descendant_engine.h',[
 edit('Share only narrow factual enum/interface','#include <bsm/audit.h>','#include "base/process/mac/aux_browser_descendant_cli_membership.h"'),
 edit('Separate the sole primary implementation declaration','enum class Result { pending, settled, unknown, refused };','enum class Result { pending, settled, unknown, refused };\n// Primary executable implementation; Framework clients use the narrow main-image query.\nCliClientMembership InspectActualCliClientInPrimaryImage(audit_token_t) noexcept;'),
 edit('No duplicate inline/client declaration',removed,'')])
successor('aux_browser_descendant_engine.cc','base/process/mac/aux_browser_descendant_engine.cc',BASE/'cli-native-embedding-a1/source/base/process/mac/aux_browser_descendant_engine.cc',[
 edit('Actual engine query owns the private primary implementation','CliClientMembership InspectActualCliClient(audit_token_t token) noexcept {','CliClientMembership InspectActualCliClientInPrimaryImage(audit_token_t token) noexcept {')])
append='''
// Separate finite factual query. The V1 custody table/layout stays unchanged.
extern "C" __attribute__((visibility("default")))
uint32_t AuxGetActualCliClientMembershipV1(audit_token_t peer) noexcept {
  return aux::browser_descendants::InspectActualCliClientInPrimaryImage(peer) ==
      aux::browser_descendants::CliClientMembership::managed ? 1 : 0;
}
'''
successor('aux_browser_descendant_bridge.cc','base/process/mac/aux_browser_descendant_bridge.cc',ROOT/'base/process/mac/aux_browser_descendant_bridge.cc',[],append)
p=HERE/'source/aux_browser_descendant_cli_membership.h';rows.append({'path':'base/process/mac/'+p.name,'source':str(p),'outputSha256':sha(p),'newSource':True,'anchors':[]})
for name in ['AuxNativeEndpointDelivery.cc','AuxNativeEndpointDelivery.h']:
 p=WEB/'docs/integration/proposed/aux-native-daemon-main/source'/name;rows.append({'path':'chrome/browser/aux/cli/'+name,'source':str(p),'outputSha256':sha(p),'staticCopy':True,'anchors':[]})
p=WEB/'vendor/provided/native/packaged-identity-admission.h';rows.append({'path':'chrome/browser/aux/cli/'+p.name,'source':str(p),'outputSha256':sha(p),'staticCopy':True,'anchors':[]})
gn=json.loads((HERE/'gn-plan.json').read_text())['files']
for row in gn:
 original=ROOT/row['path'];assert sha(original)==row['inputSha256'];text=original.read_text()
 for e in row['anchors']:assert text.count(e['find'])==e['count']==1;text=text.replace(e['find'],e['replace'])
 text+=row.get('append','');assert Path(row['source']).read_text()==text;assert sha(Path(row['source']))==row['outputSha256'];rows.append(row)
registration=BASE/'cli-native-open-command-a1/registration-handoff.json'
register=json.loads(registration.read_text())
for row in register['files']:
 assert sha(ROOT/row['path'])==row['inputSha256']
 text=(ROOT/row['path']).read_text()
 for e in row['anchors']:assert text.count(e['find'])==e['count']==1;text=text.replace(e['find'],e['replace'])
 assert hashlib.sha256(text.encode()).hexdigest()==row['proposedOutputSha256']
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.cli-open.build-handoff.sources.v1','files':rows,'registrationPlan':str(registration),'registrationPlanSha256':sha(registration),'rootOwnsActualProjection':True,'actualNativeMutation':False},indent=2)+'\n')
sdk=json.loads((HERE/'sdk-compile-plan.json').read_text())
for row in sdk['inputs']:assert sha(Path(row['path']))==row['sha256']
assert sha(Path(sdk['compiler']))==sdk['compilerSha256']
assert len(sdk['commands'])==6 and all('-c'in c['argv']for c in sdk['commands'])
frontend=next(c for c in sdk['commands']if c['name']=='Frontend');assert frontend['language']=='objective-c++'and'-fobjc-arc'in frontend['argv']
assert 'AuxBrowserDescendantBridgeV1 kBridge{1,sizeof(AuxBrowserDescendantBridgeV1)'in(HERE/'source/aux_browser_descendant_bridge.cc').read_text()
newheader=(HERE/'source/aux_browser_descendant_cli_membership.h').read_text();assert 'RTLD_MAIN_ONLY'in newheader and 'RTLD_DEFAULT'not in newheader
sources=[Path(r['source'])for r in rows if Path(r['source']).suffix in ['.cc','.h','.mm']]
assert all('.Set('not in p.read_text()for p in sources if p.name.startswith('AuxCli')or p.name.startswith('AuxNativeCli'))
pins={str(ROOT/'base/process/mac/aux_browser_descendant_bridge.h'):sha(ROOT/'base/process/mac/aux_browser_descendant_bridge.h'),str(ROOT/'base/apple/mach_port_rendezvous.h'):sha(ROOT/'base/apple/mach_port_rendezvous.h'),str(ROOT/'base/apple/mach_port_rendezvous.cc'):sha(ROOT/'base/apple/mach_port_rendezvous.cc'),str(ROOT/'base/apple/mach_port_rendezvous_mac.cc'):sha(ROOT/'base/apple/mach_port_rendezvous_mac.cc'),str(ROOT/'build/config/compiler/BUILD.gn'):sha(ROOT/'build/config/compiler/BUILD.gn'),str(BASE/'cli-native-open-command-a1/dependency-pins.json'):sha(BASE/'cli-native-open-command-a1/dependency-pins.json')}
for row in rows:
 if 'input'in row:pins[row['input']]=row['inputSha256']
 elif 'inputSha256'in row:pins[str(ROOT/row['path'])]=row['inputSha256']
for row in sdk['inputs']:pins[row['path']]=row['sha256']
(HERE/'dependency-pins.json').write_text(json.dumps({'format':'aux.cli-open.build-handoff.dependencies.v1','files':[{'path':k,'sha256':v}for k,v in sorted(pins.items())]},indent=2)+'\n')
receipt={'format':'aux.cli-open.build-handoff.static-check.v1','passed':True,'sourceRows':len(rows),'nativeGNFiles':len(gn),'singleMatchAnchors':sum(len(r['anchors'])for r in rows),'appendBlocks':sum(r.get('appendCount',0)for r in rows),'registrationAnchors':sum(len(r['anchors'])for r in register['files']),'sdkCompileCommandsPrepared':6,'sdkInputsVerified':len(sdk['inputs']),'dependencyCount':len(pins),'bridgeV1LayoutChanged':False,'actualNativeMutation':False,'gnRun':False,'compilerRun':False,'linkerRun':False,'nativeApiExecuted':False,'localAuthenticationInvoked':False,'productExecuted':False,'signed':False,'runtimeAcceptance':False}
(HERE/'static-check.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
