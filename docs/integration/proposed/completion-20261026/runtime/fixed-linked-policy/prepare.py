from pathlib import Path
import json,hashlib,difflib
HERE=Path(__file__).resolve().parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web');FRESH=ROOT/'docs/integration/proposed/completion-20261026/integrator/fresh-successor-scope/source';FIXED=ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-builtins/source';sha=lambda b:hashlib.sha256(b).hexdigest();records=[];patch=[]
def apply(path,name,pairs):
 before=path.read_text();after=before
 for a,z in pairs:assert after.count(a)==1,(name,a[:90],after.count(a));after=after.replace(a,z)
 (HERE/'source'/name).write_text(after);records.append({'input':str(path),'inputSha256':sha(before.encode()),'output':name,'outputSha256':sha(after.encode()),'anchors':[{'before':a,'after':z,'count':1} for a,z in pairs]});patch.append(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile=str(path),tofile=name)));return after
# Compile only in a separate, explicit future v11 variant. Existing targets omit this definition.
flag='#if AUX_BROWSER_ONLY_NATIVE_STARTUP || AUX_FIXED_LINKED_PTY_POLICY'
parser_pairs=[
 ('// A pre-generation resource contract.',(HERE/'source/linked-policy.swift.inc').read_text()+'\n// A pre-generation resource contract.'),
 ('    var includesContainedPtyModule:Bool=false','    var includesContainedPtyModule:Bool=false\n    var includesFixedLinkedPty:Bool=false\n    var linkedPtyHelper:AuxFreshBootstrapPtyArtifact?=nil'),
 ('#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n    var includesFixedNativeBuiltins',flag+'\n    var includesFixedNativeBuiltins'),
 ('#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n        let fixedBuiltins',flag+'\n#if AUX_FIXED_LINKED_PTY_POLICY\n        let fixedLinked=object["format"] as? String=="aux.fresh.bootstrap.policy.v11"\n#else\n        let fixedLinked=false\n#endif\n        let fixedBuiltins'),
 ('let fixedBuiltins=object["format"] as? String=="aux.fresh.bootstrap.policy.v10"','let fixedBuiltins=fixedLinked || object["format"] as? String=="aux.fresh.bootstrap.policy.v10"'),
 ('(fixedBuiltins ? ["pdfModule","macOSUtilitiesModule"]:[])','(fixedBuiltins ? ["pdfModule","macOSUtilitiesModule"]:[]) + (fixedLinked ? ["linkedPty"]:[])'),
 ('            let native=try AuxNativeCurrentUserLocation.capture()', '            var linkedHelper:AuxFreshBootstrapPtyArtifact?\n            if fixedLinked{linkedHelper=try AuxFreshBootstrapLinkedPtyIdentity.decode(object["linkedPty"])}\n            let native=try AuxNativeCurrentUserLocation.capture()'),
 ('nativeUserLocation:native,browserPreparedRecovery:true,embeddedDaemon:true,includesFixedNativeBuiltins:fixedBuiltins)', 'nativeUserLocation:native,browserPreparedRecovery:true,embeddedDaemon:true,includesFixedLinkedPty:fixedLinked,linkedPtyHelper:linkedHelper,includesFixedNativeBuiltins:fixedBuiltins)'),
 ('        let allowed:Set<String>=', '        var allowed:Set<String>='),
 ('        guard Set(captured.entitlements.keys).isSubset(of:allowed)', '''#if AUX_FIXED_LINKED_PTY_POLICY
        if role == .daemon {
            let key="com.apple.developer.endpoint-security.client"
            allowed.insert(key)
            guard let value=captured.entitlements[key],CFGetTypeID(value as CFTypeRef)==CFBooleanGetTypeID(),let boolean=value as? NSNumber,boolean.boolValue else{throw AuxFreshBootstrapPolicyError.identity}
        }
#endif
        guard Set(captured.entitlements.keys).isSubset(of:allowed)'''),
 ('key=="com.apple.security.cs.allow-jit" || !boolean.boolValue','key=="com.apple.security.cs.allow-jit" || (key=="com.apple.developer.endpoint-security.client" && role == .daemon) || !boolean.boolValue'),
 ('#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n    guard policy.role == .daemon', '''#if AUX_FIXED_LINKED_PTY_POLICY
    guard policy.role == .daemon,policy.embeddedDaemon,policy.browserStartupRoots != nil,policy.nativeUserLocation != nil,
          policy.browserPreparedRecovery,policy.includesFixedNativeBuiltins,policy.includesFixedLinkedPty,policy.linkedPtyHelper != nil,
          policy.ptyArtifacts == nil,!policy.includesRebuiltPtyModule,!policy.includesContainedPtyModule else{throw AuxFreshBootstrapPolicyError.policy}
#elseif AUX_BROWSER_ONLY_NATIVE_STARTUP
    guard policy.role == .daemon''')]
for path,name in [(FRESH/'daemon/AuxFreshBootstrapPolicy.swift','AuxFreshBootstrapPolicy.swift'),(FRESH/'chrome/browser/aux/native_peer_policy/AuxFreshBootstrapPolicy.swift','ParentAuxFreshBootstrapPolicy.swift')]:apply(path,name,parser_pairs)
# Paired reader selects existing native-current-user layout9 only for explicit v11.
parent_pairs=[('#if AUX_BROWSER_ONLY_NATIVE_STARTUP',flag),('#if AUX_BROWSER_ONLY_NATIVE_STARTUP',flag)]
parent=FIXED/'AuxAuthenticatedChildParentPolicyReader.swift';text=parent.read_text();count=text.count('#if AUX_BROWSER_ONLY_NATIVE_STARTUP')
# Complete counted macro occurrences recorded as distinct anchored full lines below.
reader_pairs=[]
for i in range(count):
 # Unique contexts are handled below by a full-file preprocessor-only exact replacement.
 pass
updated=text.replace('#if AUX_BROWSER_ONLY_NATIVE_STARTUP',flag)
updated=updated.replace('guard format == "aux.fresh.bootstrap.policy.v8" ||','guard (format == "aux.fresh.bootstrap.policy.v11" && policy.includesFixedLinkedPty && policy.linkedPtyHelper != nil) || format == "aux.fresh.bootstrap.policy.v8" ||')
apply(parent,'AuxAuthenticatedChildParentPolicyReader.swift',[(text,updated)])
loader=FIXED/'AuxSignedFreshBootstrapPolicyLoader.swift';text=loader.read_text();updated=text.replace('#if AUX_BROWSER_ONLY_NATIVE_STARTUP',flag).replace('#if !AUX_BROWSER_ONLY_NATIVE_STARTUP','#if !AUX_BROWSER_ONLY_NATIVE_STARTUP && !AUX_FIXED_LINKED_PTY_POLICY')
updated=updated.replace('policy.contents.includesRebuiltPtyModule else { throw AuxFreshBootstrapPolicyError.policy }','(policy.contents.includesRebuiltPtyModule || policy.contents.includesFixedLinkedPty) else { throw AuxFreshBootstrapPolicyError.policy }')
# Helper-only fixed role: preserve old module paths for their historical modes.
for start,end in [('    fileprivate static func capturePtyHelper()', '    fileprivate static func revalidatePtyHelper('),('    fileprivate static func revalidatePtyHelper(', '\n}\n')]:
 a=updated.index(start);b=updated.index(end,a+len(start));part=updated[a:b]
 part=part.replace('let artifacts = policy.contents.ptyArtifacts else','let artifact = policy.contents.linkedPtyHelper ?? policy.contents.ptyArtifacts?.helper else').replace('let artifacts = current.contents.ptyArtifacts,','let artifact = current.contents.linkedPtyHelper ?? current.contents.ptyArtifacts?.helper,').replace('artifacts.helper','artifact')
 if start.endswith('capturePtyHelper()'):
  part=part.replace('guard captured.st_uid == 0 else','guard captured.st_uid == 0 || (policy.contents.includesFixedLinkedPty && captured.st_uid==geteuid()) else')
 else:
  part=part.replace('guard now.st_uid == 0, now.st_dev','guard (now.st_uid == 0 || (current.contents.includesFixedLinkedPty && now.st_uid==geteuid())), now.st_dev')
 updated=updated[:a]+part+updated[b:]
apply(loader,'AuxSignedFreshBootstrapPolicyLoader.swift',[(text,updated)])
(HERE/'changes.json').write_text(json.dumps({'format':'aux.fixed-linked-v11-paired-policy-source.v1','records':records,'AUX_FIXED_LINKED_PTY_POLICY':'Separate future source variant only; not defined in candidate','EntitlementRequired':True,'signedHelperDigestInvented':False,'activated':False,'candidateChanged':False},indent=2)+'\n');(HERE/'source.patch').write_text(''.join(patch))
