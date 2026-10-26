#!/usr/bin/env python3
"""Compose current signing observation into three existing future owners only."""
from pathlib import Path
import hashlib,json
HERE=Path(__file__).resolve().parent;CURRENT=HERE.parent/'extension-sign-observation/source'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
selected_rules=[('CallAuthority(AuthorityOperation operation, std::span<const uint8_t> message) {','CallAuthority(AuthorityOperation operation, std::span<const uint8_t> message, bool observe_only = false) {'),("owner->SignDaemonChallenge(message, 2'000)","owner->SignDaemonChallenge(message, 2'000, observe_only)"),('ObserveNativeSelectedDaemonChallenge(std::string_view encoded_message) {','ObserveNativeSelectedDaemonChallenge(std::string_view encoded_message, bool observe_only) {'),('auto reply = CallAuthority(AuthorityOperation::daemonSignature,\n      std::span(*message));','auto reply = CallAuthority(AuthorityOperation::daemonSignature,\n      std::span(*message), observe_only);')]
supervisor_rules=[('base::BindOnce(&ObserveNativeDaemonChallenge, *native_challenge_),','base::BindOnce(&ObserveNativeDaemonChallenge, *native_challenge_, false),')]
child_rules=[('DaemonAuthorityReply SelectedNativeHome::SignDaemonChallenge(std::span<const uint8_t> message, uint32_t timeout_ms) {', 'DaemonAuthorityReply SelectedNativeHome::SignDaemonChallenge(std::span<const uint8_t> message, uint32_t timeout_ms, bool observe_only) {'), ('state_->transfer->SignDaemonChallenge(message, timeout_ms);', 'state_->transfer->SignDaemonChallenge(message, timeout_ms, observe_only);')]
records=[]
branch=json.loads((HERE/'browser-source-plan.json').read_text())
for name,previous,rules in [('AuxSelectedStateHome.cc',HERE/'startup-observation-source/chrome/browser/aux/AuxSelectedStateHome.cc',selected_rules),('daemon_supervisor.cc',HERE/'browser-source/chrome/browser/aux/daemon_supervisor.cc',supervisor_rules),('AuxOwnedNativePeerChild.cc',HERE/'browser-source/chrome/browser/aux/AuxOwnedNativePeerChild.cc',child_rules)]:
 original=previous.read_text();output=original
 for before,after in rules:assert output.count(before)==1;output=output.replace(before,after)
 reverse=output
 for before,after in reversed(rules):assert reverse.count(after)==1;reverse=reverse.replace(after,before)
 assert reverse==original
 # Independently apply original future-branch changes to new current source.
 current=CURRENT/name;other=current.read_text()
 anchors=next(r['anchors'] for r in branch['records'] if r['path']=='chrome/browser/aux/'+name)
 for rule in anchors:
  assert other.count(rule['before'])==rule['count'];other=other.replace(rule['before'],rule['after'])
 assert other==output,('Composition orders differ',name)
 dest=HERE/'signature-observation-source'/name;dest.write_text(output)
 records.append({'path':'chrome/browser/aux/'+name,'predecessor':{'path':str(previous),'sha256':sha(previous)},'currentSource':{'path':str(current),'sha256':sha(current)},'output':{'path':str(dest),'sha256':sha(dest)},'ruleCounts':[1]*len(rules),'reverseReplayExact':True,'bothCompositionOrdersEqual':True,'futureBranchesPreserved':True,'compileTarget':'obj/chrome/browser/aux/platform/'+Path(name).stem+'.o'})
(HERE/'signature-observation-plan.json').write_text(json.dumps({'format':'aux.future-signature-observation-source.v1','files':records,'compiled':False,'linked':False,'sharedSourceModified':False,'otherCurrentObjectsToReuse':['AuxNativePeerTransport.o','installation_auth.o','aux_account_api.o'],'existingFutureColdLaunchObjectReusable':True},indent=2)+'\n')
print('PASS exact two-order composition, signature anchors and strict future branches')
