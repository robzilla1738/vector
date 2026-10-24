#!/usr/bin/env python3
"""Exact source handoff checks only; no compiler, auth prompt or browser run."""
from pathlib import Path
import hashlib,json,subprocess,tempfile
HERE=Path(__file__).resolve().parent;BASE=HERE.parent;ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();rows=[]
def successor(name,original,edits):
 text=original.read_text()
 for e in edits:
  assert text.count(e['find'])==e['count']==1,(name,e['name']);text=text.replace(e['find'],e['replace'])
 source=HERE/'source'/name;assert source.read_text()==text
 rows.append({'path':'chrome/browser/aux/cli/'+name,'source':str(source),'input':str(original),'inputSha256':sha(original),'outputSha256':sha(source),'anchors':edits})
def edit(name,find,replace):return{'name':name,'find':find,'replace':replace,'count':1}
successor('AuxCliIngress.h',BASE/'cli-manual-profile-approval-a1/source/AuxCliIngress.h',[
 edit('Native-only open producer friends','  friend class ApprovedCliInvocation;','  friend class ApprovedCliInvocation;\n  friend class NativeOpenService;\n  friend class NativeOpenOperation;'),
 edit('Distinct native action completion sink','  bool CompleteAfterObservedExit(int exit_code);','  bool CompleteAfterObservedExit(int exit_code);\n  bool CompleteAfterNativeOpenResult(int exit_code);')])
successor('AuxCliIngress.cc',BASE/'cli-native-embedding-a1/source/common/AuxCliIngress.cc',[
 edit('No credentials/environment forwarded for narrow native open',' for(const auto* name:{"PATH","HOME","TMPDIR","TZ","LANG","LC_CTYPE","LC_MESSAGES","TERM","TERM_PROGRAM","AUX_API_TOKEN","DAEMON_AUTH_JWT","DAEMON_BASE_URL","AUX_RELEASE_BASE_URL","AUX_CLI_INSTALL_URL","AUX_CLI_LATEST_URL","AUX_CLI_UPDATE_CHECK","AUX_MCP_DEBUG","CLAUDE_CONFIG_DIR","CODEX_HOME","XDG_CONFIG_HOME","NO_COLOR","FORCE_COLOR","CLICOLOR_FORCE","AUX_CLI_AUTH_PATH","AUX_CLI_INSTALL_DIR"})if(const auto* value=getenv(name)){if(strnlen(value,kArgumentBytes+1)>kArgumentBytes)return 64;arguments.environment.emplace_back(name,value);}',' // Native open needs no caller environment or provider/authentication tokens.'),
 edit('Native-open completion implementation','struct Ingress::State{','// Only NativeOpenOperation/Service may publish this narrow native action result.\n// Exit zero means a genuine native tab/navigation start, never page-load success.\nbool Invocation::CompleteAfterNativeOpenResult(int code){return CompleteAfterObservedExit(code);}\nstruct Ingress::State{')])
successor('AuxCliManualProfileApproval.h',BASE/'cli-manual-profile-approval-a1/source/AuxCliManualProfileApproval.h',[
 edit('Single-use private native Profile consumption','  friend class BrowserInvocation;','  friend class BrowserInvocation;\n  friend class NativeOpenOperation;\n  // Single-use, called only immediately before the real native navigation.\n  std::unique_ptr<Invocation> ConsumeForNativeOpen(Profile* actual_target);')])
successor('AuxCliManualProfileApproval.mm',BASE/'cli-manual-profile-approval-a1/source/AuxCliManualProfileApproval.mm',[
 edit('Consume only actual currently approved target','struct ManualProfileApprovalRequest::State {','std::unique_ptr<Invocation> ApprovedCliInvocation::ConsumeForNativeOpen(Profile* target) {\n  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);\n  if (!target || !Current() || state_->target.profile.get() != target) return {};\n  return std::move(state_->invocation);\n}\nstruct ManualProfileApprovalRequest::State {')])
successor('AuxNativeCliFrontend.cc',BASE/'cli-native-embedding-a1/source/common/AuxNativeCliFrontend.cc',[
 edit('Real narrow parser dependency','#include "AuxCliIngress.h"','#include "AuxCliIngress.h"\n#include "AuxCliOpenArguments.h"\n#include <vector>'),
 edit('Bounded argv inspection dependency','#include <cstdio>','#include <cstdio>\n#include <cstring>'),
 edit('Only native open reaches audited browser ingress',' return aux::cli::ForwardTerminalInvocation(argc,argv);',''' std::vector<std::string> arguments;
 if(argc<1||argc>257||!argv)return 64;
 for(int i=1;i<argc;++i){if(!argv[i]||strnlen(argv[i],8193)>8192)return 64;arguments.emplace_back(argv[i]);}
 const auto parsed=aux::cli::ParseNativeOpenArguments(arguments);
 if(parsed.status==aux::cli::OpenParseStatus::help){
  std::fputs("Usage: aux open <https://URL> [--profile <native profile ID or unique name>]\\n",stdout);return 0;
 }
 if(parsed.status!=aux::cli::OpenParseStatus::accepted){
  std::fputs("Aux currently supports native open only; installation/account CLI commands remain unavailable\\n",stderr);return 64;
 }
 return aux::cli::ForwardTerminalInvocation(argc,argv);''')])
hooks=json.loads((HERE/'native-hooks.json').read_text())['files']
for row in hooks:
 original=ROOT/row['path'];assert sha(original)==row['inputSha256'];text=original.read_text()
 for e in row['anchors']:assert text.count(e['find'])==e['count']==1;text=text.replace(e['find'],e['replace'])
 assert Path(row['source']).read_text()==text and sha(Path(row['source']))==row['outputSha256'];rows.append(row)
with tempfile.TemporaryDirectory(prefix='aux-cli-open-hooks-')as temporary:
 stage=Path(temporary)
 for row in hooks:
  target=stage/row['path'];target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes((ROOT/row['path']).read_bytes())
 for args in [[],['--reverse']]:
  subprocess.run(['git','apply',*args,str(HERE/'native-hooks.patch')],cwd=stage,check=True,capture_output=True)
 for row in hooks:assert sha(stage/row['path'])==row['inputSha256']
known={Path(r['source']).resolve()for r in rows}
for source in sorted((HERE/'source').glob('*')):
 if source.is_file()and source.resolve()not in known:rows.append({'path':'chrome/browser/aux/cli/'+source.name,'source':str(source),'outputSha256':sha(source),'newSource':True,'anchors':[]})
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.cli-native-open.sources.v1','files':rows,'sourceCount':len(rows),'nativeMutation':False,'rootOwnsGNAndRegistration':True},indent=2)+'\n')
registration=json.loads((HERE/'registration-handoff.json').read_text())['files']
for row in registration:
 actual=ROOT/row['path'];assert sha(actual)==row['inputSha256'];text=actual.read_text()
 for e in row['anchors']:assert text.count(e['find'])==e['count']==1;text=text.replace(e['find'],e['replace'])
 row['proposedOutputSha256']=hashlib.sha256(text.encode()).hexdigest()
(HERE/'registration-handoff.json').write_text(json.dumps({'format':'aux.cli-native-open.registration-handoff.v1','files':registration,'actualNativeMutation':False,'registrationApplied':False,'rootOwnsGNAndRegistration':True},indent=2)+'\n')
inputs=['chrome/browser/profiles/keep_alive/scoped_profile_keep_alive.h','chrome/browser/profiles/keep_alive/profile_keep_alive_types.h','chrome/browser/ui/browser_window/public/global_browser_collection.h','chrome/browser/ui/browser_window/public/browser_collection.h','chrome/browser/ui/browser_window/public/browser_window_interface.h','chrome/browser/profiles/profile.h','chrome/browser/profiles/profile_attributes_entry.h','chrome/browser/profiles/profile_attributes_storage.h','chrome/browser/ui/navigator/browser_navigator.h','chrome/browser/ui/navigator/browser_navigator_params.h','chrome/browser/ui/tabs/tab_strip_model.h','content/public/browser/navigation_handle.h','content/public/browser/web_contents.h','chrome/browser/aux/AuxSelectedStateHome.h','chrome/browser/aux/profile_identity.h','base/threading/thread.h','base/timer/timer.h']
pins={str(ROOT/n):sha(ROOT/n)for n in inputs}
for r in rows:
 if 'input'in r:pins[r['input']]=r['inputSha256']
for r in hooks+registration:pins[str(ROOT/r['path'])]=r['inputSha256']
for p in [BASE/'cli-native-embedding-a1/source/common/AuxCliWire.h',BASE/'cli-native-embedding-a1/source/common/AuxCliSealedImages.h',BASE/'cli-native-embedding-a1/source/base/process/mac/aux_browser_descendant_engine.h',BASE/'cli-manual-profile-approval-a1/dependency-pins.json']:pins[str(p)]=sha(p)
(HERE/'dependency-pins.json').write_text(json.dumps({'format':'aux.cli-native-open.dependencies.v1','files':[{'path':k,'sha256':v}for k,v in sorted(pins.items())]},indent=2)+'\n')
s=(HERE/'source/AuxCliOpenCommand.mm').read_text()
assert s.count('auto navigation=Navigate(&params);')==1
assert 'url.SchemeIsHTTPOrHTTPS()'in s and 'url.has_username()'in s
assert 'ids.size()==1' in s and 'names.size()==1'in s
assert 'ProfileKeepAliveOrigin::kBrowserWindow'in s and 'ConsumeForNativeOpen'in s
assert 'phase_=Phase::navigating' in s and 'canceled_during_navigation_'in s
assert 'Counters().queued.fetch_add(1)'in s and 'Counters().profile_operations.fetch_add(1)'in s
assert 'Counter' in s and 'NativeOpenObservation InspectNativeOpenService()'in s
for row in hooks:assert sha(ROOT/row['path'])==row['inputSha256']
receipt={'format':'aux.cli-native-open.static-check.v1','passed':True,'sourceCount':len(rows),'sourceAnchors':sum(len(r.get('anchors',[]))for r in rows),'rootRegistrationAnchors':sum(len(r['anchors'])for r in registration),'dependencyCount':len(pins),'nativeCheckoutChanged':False,'compilerRun':False,'nativeApiExecuted':False,'localAuthenticationInvoked':False,'productExecuted':False,'registered':False,'packageSelected':False,'runtimeAcceptance':False}
(HERE/'static-check.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
