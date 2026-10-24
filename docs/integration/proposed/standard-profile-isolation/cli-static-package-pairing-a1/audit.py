#!/usr/bin/env python3
"""Static source/plist/manifest/Mach-O inspection only. No SecCode/tool execution."""
from pathlib import Path
import hashlib,json,plistlib,re,stat,struct,os
HERE=Path(__file__).resolve().parent;BASE=HERE.parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
WEB=Path('/Users/rcourson/Documents/Vibe/web')
APP=WEB/'out/provided-candidate-desktop-completion-20261024-a3/Aux.app';AUX=APP/'Contents/Resources/aux';CLI=AUX/'apps/cli/Aux CLI.app'
def sha(p):
 h=hashlib.sha256()
 with p.open('rb')as f:
  for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
 return h.hexdigest()
def version(n):return f'{n>>16}.{(n>>8)&255}.{n&255}'
def macho(p):
 with p.open('rb')as f:
  header=f.read(32);magic,cpu,sub,kind,count,size,flags,reserved=struct.unpack('<8I',header)
  assert magic==0xfeedfacf and size<=1024*1024
  commands=f.read(size);off=0;dependencies=[];build=[];signature=None
  for _ in range(count):
   cmd,length=struct.unpack_from('<II',commands,off);assert length>=8 and off+length<=len(commands)
   if cmd in [0xc,0x18,0x80000018,0x8000001f,0x80000023]:
    start=struct.unpack_from('<I',commands,off+8)[0];assert start<length
    dependencies.append(commands[off+start:off+length].split(b'\0',1)[0].decode())
   if cmd==0x32:
    platform,minimum,sdk,tools=struct.unpack_from('<4I',commands,off+8)
    build.append({'platform':platform,'minimumOS':version(minimum),'sdk':version(sdk)})
   if cmd==0x1d:signature=struct.unpack_from('<II',commands,off+8)
   off+=length
  code=[]
  if signature:
   f.seek(signature[0]);blob=f.read(signature[1])
   if len(blob)>=12:
    magic,total,slots=struct.unpack_from('>III',blob)
    if magic==0xfade0cc0 and total<=len(blob)and slots<64:
     for i in range(slots):
      slot,at=struct.unpack_from('>II',blob,12+i*8)
      if at+44>total:continue
      tag,length,format,code_flags=struct.unpack_from('>4I',blob,at)
      if tag!=0xfade0c02 or at+length>total:continue
      identifier_at=struct.unpack_from('>I',blob,at+20)[0]
      identifier=blob[at+identifier_at:at+length].split(b'\0',1)[0].decode(errors='replace')if identifier_at<length else''
      code.append({'slot':slot,'flags':code_flags,'adHocFlag':bool(code_flags&2),'identifier':identifier,'codeDirectorySha256':hashlib.sha256(blob[at:at+length]).hexdigest()})
 return{'cpuType':cpu,'fileType':kind,'dependencies':dependencies,'buildVersion':build,'codeSignatureLoadCommandPresent':signature is not None,'embeddedCodeDirectories':code,'signatureValidated':False}
pins={}
def pin(p):pins[str(p)]=sha(p)
def select_source(name):
 fixed=BASE/'cli-native-product-buffer-fix-a1/source/chrome/browser/aux/cli'/name
 p=fixed if fixed.exists()else ROOT/'chrome/browser/aux/cli'/name
 pin(p);return p
sealed=select_source('AuxCliSealedImages.cc');frontend=select_source('AuxNativeCliFrontend.mm');ingress=select_source('AuxCliIngress.cc');opened=select_source('AuxCliOpenCommand.mm')
text=sealed.read_text();code=frontend.read_text()
array=text.split('constexpr std::array<uint8_t, 32> kCertificate = {',1)[1].split('};',1)[0];certificate=bytes(int(n,16)for n in re.findall(r'0x([0-9a-f]{2})',array)).hex();assert len(certificate)==64
manifest=AUX/'bundle.json';pin(manifest);bundle=json.loads(manifest.read_text())
metadata={}
for label,p in [('browser',APP/'Contents/Info.plist'),('cli',CLI/'Contents/Info.plist')]:
 pin(p);d=plistlib.loads(p.read_bytes());metadata[label]={k:d.get(k)for k in ['CFBundleIdentifier','CFBundleExecutable','CFBundleName','CFBundlePackageType','CFBundleVersion','CFBundleShortVersionString','LSMinimumSystemVersion','CFBundleIconFile']}
expected={'browser':{'CFBundleIdentifier':'dev.aux.browser','CFBundleExecutable':'Aux','CFBundlePackageType':'APPL'},'cli':{'CFBundleIdentifier':'dev.aux.browser.cli','CFBundleExecutable':'aux-cli','CFBundlePackageType':'APPL'}}
for label,fields in expected.items():assert all(metadata[label][k]==v for k,v in fields.items())
leaf=CLI/'Contents/MacOS/aux-cli';pin(leaf);native_metadata=macho(leaf);info=leaf.stat()
row=next(r for r in bundle['files']if r['path']=='apps/cli/Aux CLI.app/Contents/MacOS/aux-cli');assert row['sha256']==sha(leaf)and row['mode']==stat.S_IMODE(info.st_mode)
sea=CLI/'Contents/MacOS/aux-cli-sea';pin(sea)
resources={}
for name in ['Resources/node-development/aux-native-cli-entry.mjs','Resources/node-development/index.mjs','Resources/AuxFreshBootstrapPolicy.json']:
 p=CLI/'Contents'/name;resources[name]={'lexists':os.path.lexists(p)}
policy=Path('/private/tmp/aux-browser-root-restart/docs/integration/proposed/profile-isolation-recovery/restart/source/AuxFreshBootstrapPolicy.swift');loader=Path('/private/tmp/aux-final-native-link/docs/integration/proposed/final-completion/native/exec-parent/source/AuxSignedFreshBootstrapPolicyLoader.swift');pin(policy);pin(loader)
policy_resources={}
for label,app in [('daemon',AUX/'apps/daemon/Aux Daemon.app'),('cli',CLI)]:
 p=app/'Contents/Resources/AuxFreshBootstrapPolicy.json';policy_resources[label]={'path':str(p),'lexists':os.path.lexists(p)}
# The narrow selected graph does not contain the dormant broad child producer.
references=[]
for p in sorted((ROOT/'chrome/browser/aux/cli').iterdir()):
 if p.suffix not in ['.cc','.h','.mm']:continue
 source=select_source(p.name);s=source.read_text()
 for line_no,line in enumerate(s.splitlines(),1):
  if 'ValidateCliLaunchResources('in line:references.append({'path':str(source),'line':line_no,'text':line.strip()})
assert len(references)==2 and all('bool 'in r['text']for r in references)
assert 'CopyNativeMainArguments'in code and 'ForwardTerminalInvocation'in code
assert code.index('parsed.status!=aux::cli::OpenParseStatus::accepted')<code.rindex('MarkerAllowedAt')<code.rindex('ForwardTerminalInvocation')
engine=ROOT/'base/process/mac/aux_browser_descendant_engine.cc';pin(engine)
assert '__builtin_available(macOS 27.0, *)'in engine.read_text()
root_gate=ROOT/'chrome/browser/aux/AuxSelectedStateHome.h';pin(root_gate)
audit={'format':'aux.cli-native-open.static-package-audit.v1','candidate':str(APP),'manifestSha256':sha(manifest),'metadata':metadata,'expectedInfoIdentityMatches':True,'currentCliLeaf':{'path':str(leaf),'sha256':sha(leaf),'bytes':info.st_size,'mode':stat.S_IMODE(info.st_mode),'uid':info.st_uid,'manifestRowMatches':True,'manifestSource':row.get('source'),'machO':native_metadata},'currentSeaUnchanged':{'path':str(sea),'sha256':sha(sea)},'activeNarrowCodePolicy':{'browserIdentifier':'dev.aux.browser','cliIdentifier':'dev.aux.browser.cli','cliExecutable':'aux-cli','team':'9F2JXY8TCK','leafCertificateSha256':certificate,'rejectsAdHoc':True,'strictNestedCodeValidationRequired':True,'locatorInputs':['canonical outer app path','current browser CDHash','current nested CLI CDHash','effective uid'],'requiresSameAppCopy':True,'signaturesValidatedByThisAudit':False},'dormantBroadResourceCheck':{'references':references,'narrowCallers':0,'requiresRootOwnedCanonicalAncestors':True,'fixedNodeEntry':'Contents/Resources/node-development/aux-native-cli-entry.mjs','currentResources':resources,'requiredForNarrowOpen':False,'doNotAddResourcesOrWeakenCheckForNarrowOpen':True},'freshPolicy':{'currentResources':policy_resources,'metadataPolicyFormat':bundle.get('finalLocalNativeReplacement',{}).get('policyFormatSupported'),'signedPolicyAccepted':bundle.get('finalLocalNativeReplacement',{}).get('signedPolicyAccepted'),'coldHookEnabled':bundle.get('finalLocalNativeReplacement',{}).get('coldHookEnabled'),'nativeOpenDoesNotLoadCliFreshPolicy':True,'browserStartupAdmissionRemainsSeparate':True},'operatingSystemObservations':{'candidateInfoMinimum':metadata['cli']['LSMinimumSystemVersion'],'currentCandidateCliMachMinimum':native_metadata['buildVersion'],'currentProtectedBrowserEntryRequiresMacOS27':True,'finalGnBinaryMinimumMustBeReadAfterLink':True,'noOSMetadataChanged':True},'actualProductExecution':False,'securityFrameworkCallsExecuted':False,'signingOrReleasePreparationPerformed':False,'candidateModified':False,'runtimeAcceptance':False}
(HERE/'audit.json').write_text(json.dumps(audit,indent=2)+'\n')
requests={'format':'aux.cli-native-open.scoped-package-requests.v1','baselineCandidate':str(APP),'baselineManifestSha256':sha(manifest),'runtimeActivationAuthorized':False,'requests':[
 {'id':'CLI-PKG-1','action':'Link final actual GN native_cli_open target from current integrated sources with all product checks enabled.','target':'//chrome/browser/aux:native_cli_open','requiredEvidence':['actual relative-source Ninja success','final executable SHA256 and mode','actual Mach-O dependencies/minimum OS','no ad hoc signature from this development link'],'expectedExecutableSha256':None},
 {'id':'CLI-PKG-2','action':'In a fresh inactive successor only, replace the old fixed CLI wrapper with that exact final artifact and pair it with the complete linked browser containing the same CLI service/query/startup integration.','targetRelativePath':'Contents/Resources/aux/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli','previousSha256':sha(leaf),'mode':493,'replaceInstalledOrAcceptedApp':False,'copyHistoricalSdkPrototype':False,'changeOriginalSeaAddonOrNodeResources':False},
 {'id':'CLI-PKG-3','action':'Refresh the exact bundle files row and add truthful nativeCliOpenIntegration provenance referencing final artifact/source composition/actual build/package receipts. Preserve historical original-source delivery evidence and broad CLI settlement scope.','manifestRelativePath':'Contents/Resources/aux/bundle.json','fileRowPath':row['path'],'oldFileRowSha256':row['sha256'],'mustNotSet':['productionReady','signedPolicyAccepted','authorityGranted','coldHookEnabled'],'newCapabilityScope':'native browser open only; no installation/account/Node/provider ownership'},
 {'id':'CLI-PKG-4','action':'Retain current matching Info identifiers/executable names; later separately authorized signing must satisfy exact source identity and strict nested graph, not merely any valid signer.','expectedInfo':expected,'existingPinnedTeam':'9F2JXY8TCK','existingPinnedLeafSha256':certificate,'performSigningNow':False,'prepareNewSigningOrReleaseFlow':False},
 {'id':'CLI-PKG-5','action':'Document direct full nested CLI path for local testing. A PATH command named aux requires separate explicit installation/alias setup; do not run an unrelated SDK binary or CLI from another app copy.','directInvocationSuffix':'Contents/Resources/aux/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli open https://example.com --profile <actual native ID or unique registered name>','modifyShellProfileOrInstallSymlinkNow':False},
 {'id':'CLI-PKG-6','action':'Keep fresh policy/startup and OS support gaps explicit. Do not invent policy resources, chown developer paths, add dormant Node resources, weaken identity checks or flip manifest booleans to make startup appear admitted.','nativeOpenNeedsNodeEntry':False,'existingBrowserStartupStillRequiresRealAdmission':True,'currentMacOS13MetadataVsMacOS27EntryConstraintNeedsSeparatePlatformReview':True}
 ],'candidateModified':False,'securityFrameworkCallsExecuted':False,'signingPerformed':False,'runtimeAcceptance':False}
(HERE/'package-requests.json').write_text(json.dumps(requests,indent=2)+'\n')
(HERE/'dependency-pins.json').write_text(json.dumps({'format':'aux.cli-native-open.static-package-audit.inputs.v1','files':[{'path':k,'sha256':v}for k,v in sorted(pins.items())]},indent=2)+'\n')
print(json.dumps({'staticOnly':True,'matchingInfoIdentities':True,'oldCliSha256':sha(leaf),'dormantResourceCheckerNarrowCallers':0,'packagingRequests':len(requests['requests']),'candidateModified':False,'securityFrameworkCallsExecuted':False,'productExecuted':False}))
