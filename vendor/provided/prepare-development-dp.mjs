/** Preparation only: copies unsigned test layout and writes provisioning inputs.
 * No codesign, security, xcodebuild, private key, network, native or DP execution.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const {bindings:rolePins}=createRequire(import.meta.url)('./native-role-pins.cjs');
import { nativePackagingManifest } from './native-packaging-manifest.mjs';
const repository = fileURLToPath(new URL('../../', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sha = file => hash(fs.readFileSync(file));
const xmlEscape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export function xmlPlist(value) {
  function emit(v) { if (Array.isArray(v)) return `<array>${v.map(emit).join('')}</array>`; if (typeof v === 'object' && v !== null) return `<dict>${Object.entries(v).map(([k, x]) => `<key>${xmlEscape(k)}</key>${emit(x)}`).join('')}</dict>`; if (typeof v === 'boolean') return v ? '<true/>' : '<false/>'; if (typeof v === 'number') return `<integer>${v}</integer>`; return `<string>${xmlEscape(v)}</string>`; }
  return `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0">${emit(value)}</plist>\n`;
}
function regular(file) { const s = fs.lstatSync(file); if (!s.isFile() || s.isSymbolicLink() || s.mode & 0o022 || fs.realpathSync(file) !== file) throw Error('Regular canonical nonshared input required'); return s; }
function plist(file) { const r = spawnSync('/usr/bin/plutil', ['-convert', 'json', '-o', '-', '--', file], { encoding: 'utf8', timeout: 10000, maxBuffer: 1048576 }); if (r.status !== 0) throw Error('Cannot inspect copied Info.plist'); return JSON.parse(r.stdout); }
function matches(pattern, exact) { return typeof pattern === 'string' && (pattern === exact || pattern.endsWith('*') && pattern.indexOf('*') === pattern.length - 1 && exact.startsWith(pattern.slice(0, -1))); }
/** Pure decoded-public-metadata gate. It does NOT authenticate CMS or authorize signing. */
export function validateDevelopmentProfileMetadata(profile, host, proposal, { now, testMacIdentifier }) {
  const team = proposal.identityInspection.teamId, ent = profile?.Entitlements;
  const app = `${team}.${host.bundleIdentifier}`, group = proposal.proposedFirstAndOnlySharedGroup;
  if (!Number.isFinite(Date.parse(now)) || typeof testMacIdentifier !== 'string' || !testMacIdentifier) throw Error('Explicit review time/test Mac identity required');
  if (!profile || !ent || !Array.isArray(profile.TeamIdentifier) || !profile.TeamIdentifier.includes(team) || !Array.isArray(profile.ApplicationIdentifierPrefix) || !profile.ApplicationIdentifierPrefix.includes(team) || !profile.Platform?.some(p => ['OSX', 'macOS'].includes(p))) throw Error('Profile team/prefix/platform mismatch');
  if (!(Date.parse(profile.CreationDate) <= Date.parse(now) && Date.parse(profile.ExpirationDate) > Date.parse(now))) throw Error('Profile is not current');
  if (!matches(ent['com.apple.application-identifier'] ?? ent['application-identifier'], app) || !ent['keychain-access-groups']?.some(pattern => matches(pattern, group))) throw Error('Profile does not authorize exact Aux AppID/group');
  if (ent['com.apple.developer.team-identifier'] !== team || !Array.isArray(profile.ProvisionedDevices) || !profile.ProvisionedDevices.includes(testMacIdentifier) || profile.ProvisionsAllDevices === true) throw Error('Profile does not authorize this development team/device');
  const fingerprint = proposal.identityInspection.publicCertificateSha1.toUpperCase();
  if (!Array.isArray(profile.DeveloperCertificates) || !profile.DeveloperCertificates.some(der => createHash('sha1').update(Buffer.isBuffer(der) ? der : Buffer.from(der, 'base64')).digest('hex').toUpperCase() === fingerprint)) throw Error('Profile does not authorize inspected signing certificate');
  return { metadataClaimsMatch: true, cmsSignatureVerified: false, signingAuthorized: false, requiredNext: 'Authenticate actual CMS/profile chain and pin exact bytes under explicit owner authorization; metadata alone is insufficient' };
}
export function provisioningProject(proposal) {
  const objects = {}, id = text => hash(text).slice(0, 24).toUpperCase(), project = id('project'), group = id('group'), products = id('products');
  const targetIds = [];
  objects[products] = { isa: 'PBXGroup', name: 'Products', children: [], sourceTree: '<group>' };
  objects[group] = { isa: 'PBXGroup', children: [products], sourceTree: '<group>' };
  for (const host of proposal.proposedDpHosts) {
    const role = host.role, target = id(role), config = id(role + 'config'), list = id(role + 'list'); targetIds.push(target);
    objects[config] = { isa: 'XCBuildConfiguration', name: 'Development', buildSettings: { CODE_SIGNING_ALLOWED: 'NO', CODE_SIGN_INJECT_BASE_ENTITLEMENTS:'NO', ENABLE_DEBUG_DYLIB:'NO', CODE_SIGN_STYLE: 'Automatic', CODE_SIGN_IDENTITY: 'Apple Development', DEVELOPMENT_TEAM: proposal.identityInspection.teamId, PRODUCT_BUNDLE_IDENTIFIER: host.bundleIdentifier, PRODUCT_NAME: role, SDKROOT: 'macosx', MACOSX_DEPLOYMENT_TARGET: '13.0', GENERATE_INFOPLIST_FILE: 'YES', CODE_SIGN_ENTITLEMENTS: `${role}.entitlements`, SKIP_INSTALL: 'YES' } };
    objects[list] = { isa: 'XCConfigurationList', buildConfigurations: [config], defaultConfigurationIsVisible: '0', defaultConfigurationName: 'Development' };
    const sourceRef = id(role + 'source'), buildFile = id(role + 'build'), phase = id(role + 'phase');
    objects[sourceRef] = { isa: 'PBXFileReference', lastKnownFileType: 'sourcecode.c.c', path: 'provisioning-placeholder.c', sourceTree: '<group>' };
    objects[buildFile] = { isa: 'PBXBuildFile', fileRef: sourceRef };
    objects[phase] = { isa: 'PBXSourcesBuildPhase', buildActionMask: '2147483647', files: [buildFile], runOnlyForDeploymentPostprocessing: '0' };
    objects[group].children.push(sourceRef);
    const product = id(role+'product');
    objects[product] = {isa:'PBXFileReference',explicitFileType:'wrapper.application',includeInIndex:'0',path:role+'.app',sourceTree:'BUILT_PRODUCTS_DIR'};
    objects[products].children.push(product);
    objects[target] = { productReference:product, isa: 'PBXNativeTarget', name: role, productName: role, productType: 'com.apple.product-type.application', buildConfigurationList: list, buildPhases: [phase], buildRules: [], dependencies: [] };
  }
  const pc = id('projectconfig'), pl = id('projectlist');
  objects[pc] = { isa: 'XCBuildConfiguration', name: 'Development', buildSettings: { CODE_SIGNING_ALLOWED: 'NO', SDKROOT: 'macosx' } };
  objects[pl] = { isa: 'XCConfigurationList', buildConfigurations: [pc], defaultConfigurationIsVisible: '0', defaultConfigurationName: 'Development' };
  objects[project] = { isa: 'PBXProject', buildConfigurationList: pl, compatibilityVersion: 'Xcode 14.0', mainGroup: group, productRefGroup:products, projectDirPath: '', projectRoot: '', targets: targetIds, attributes: { TargetAttributes: Object.fromEntries(targetIds.map(t => [t, { ProvisioningStyle: 'Automatic', DevelopmentTeam: proposal.identityInspection.teamId, SystemCapabilities: { 'com.apple.Keychain': { enabled: '1' } } }])) } };
  return { archiveVersion: '1', classes: {}, objectVersion: '56', objects, rootObject: project };
}
function assertDevelopmentProposal(proposal) {
  if(proposal.kind!=='conditional-development-signing-proposal-not-executable-policy'||proposal.signingAuthorized!==false||!Array.isArray(proposal.proposedDpHosts)||proposal.proposedDpHosts.length!==3||!/^[A-F0-9]{40}$/i.test(proposal.identityInspection?.publicCertificateSha1??''))throw Error('Exact unsigned development proposal required');
  if (proposal.privateKeyAccessAuthorized !== false || proposal.provisioningOperationsAuthorized !== false || proposal.dpExecutionAuthorizedByThisProposal !== false || !/^[A-Z0-9]{10}$/.test(proposal.identityInspection.teamId) || !/^[a-f0-9]{64}$/.test(proposal.exactScope) || hash(proposal.exactExistingDisposableHome)!==proposal.exactScope || proposal.proposedFirstAndOnlySharedGroup!==`${proposal.identityInspection.teamId}.dev.aux.dp.${proposal.exactScope}`) throw Error('Fixed unauthorised proposal scope required');
  const expectedHosts=[['daemon','dev.aux.browser.daemon','apps/daemon/Aux Daemon.app','Contents/MacOS/aux-daemon'],['cli-sea','dev.aux.browser.cli','apps/cli/Aux CLI.app','Contents/MacOS/aux-cli-sea'],['carrier','dev.aux.browser.native-carrier','native/Aux Native Carrier.app','Contents/MacOS/aux-native-carrier']];
  for (const [i,expected] of expectedHosts.entries()) {const h=proposal.proposedDpHosts[i];if(JSON.stringify([h.role,h.bundleIdentifier,h.proposedBundleRelativeToAuxRoot,h.proposedMainExecutable])!==JSON.stringify(expected)||JSON.stringify(h.proposedEntitlements['keychain-access-groups'])!==JSON.stringify([proposal.proposedFirstAndOnlySharedGroup]))throw Error('Unreviewed host layout or group');}
  for(const h of proposal.proposedDpHosts){
    const team=proposal.identityInspection.teamId;
    const expected={'com.apple.application-identifier':team+'.'+h.bundleIdentifier,'com.apple.developer.team-identifier':team,'keychain-access-groups':[proposal.proposedFirstAndOnlySharedGroup]};
    if(h.role!=='carrier')for(const key of ['com.apple.security.cs.allow-jit','com.apple.security.cs.allow-unsigned-executable-memory','com.apple.security.cs.disable-library-validation','com.apple.security.cs.allow-dyld-environment-variables'])expected[key]=true;
    const sorted=o=>JSON.stringify(Object.fromEntries(Object.entries(o).sort()));
    if(sorted(expected)!==sorted(h.proposedEntitlements))throw Error('Unreviewed proposed entitlement');
  }
}
function writeProvisioningProject(output,proposal) {
  const project=path.join(output,'provisioning'), projectDir=path.join(project,'AuxDpProfiles.xcodeproj');fs.mkdirSync(projectDir,{recursive:true});
  fs.writeFileSync(path.join(projectDir,'project.pbxproj'),xmlPlist(provisioningProject(proposal)),{flag:'wx'});
  fs.writeFileSync(path.join(project,'provisioning-placeholder.c'),'// Provisioning target only; never supplied product implementation or runtime evidence.\nint main(void) { return 0; }\n',{flag:'wx'});
  const schemes=path.join(projectDir,'xcshareddata/xcschemes');fs.mkdirSync(schemes,{recursive:true});
  for(const host of proposal.proposedDpHosts){
    fs.writeFileSync(path.join(project,host.role+'.entitlements'),xmlPlist(host.proposedEntitlements),{flag:'wx'});
    const target=hash(host.role).slice(0,24).toUpperCase();
    fs.writeFileSync(path.join(schemes,host.role+'.xcscheme'),`<?xml version="1.0" encoding="UTF-8"?><Scheme LastUpgradeVersion="2600" version="1.3"><BuildAction parallelizeBuildables="NO" buildImplicitDependencies="NO"><BuildActionEntries><BuildActionEntry buildForTesting="NO" buildForRunning="YES" buildForProfiling="NO" buildForArchiving="YES" buildForAnalyzing="NO"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${target}" BuildableName="${host.role}.app" BlueprintName="${host.role}" ReferencedContainer="container:AuxDpProfiles.xcodeproj"/></BuildActionEntry></BuildActionEntries></BuildAction></Scheme>\n`,{flag:'wx'});
  }
  return projectDir;
}
function prospectiveProvisioning(output, projectDir, proposal) {
  return proposal.proposedDpHosts.map(host=>({role:host.role,authorized:false,tool:'/usr/bin/python3',argv:[path.join(repository,'scripts/native-build.py'),'/usr/bin/xcodebuild','-project',projectDir,'-scheme',host.role,'-configuration','Development','-destination','platform=macOS,arch=arm64','-derivedDataPath',path.join(output,'future-derived-data'),'-allowProvisioningUpdates','-allowProvisioningDeviceRegistration','CODE_SIGNING_ALLOWED=YES','CODE_SIGN_IDENTITY=Apple Development','build'],effects:['Apple developer service AppID/profile/device provisioning','Local profile cache and isolated derived-data writes','Private-key signatures on temporary authored provisioning app only'],executed:false}));
}
export function prepareDevelopmentProject({output,proposalPath=path.join(repository,'docs/integration/proposed/development-dp-signing/proposal.json')}) {
  const proposal=JSON.parse(fs.readFileSync(proposalPath));
  assertDevelopmentProposal(proposal);
  output=path.resolve(output);
  if(fs.existsSync(output)||fs.realpathSync(path.dirname(output))!==path.dirname(output)||output===proposal.exactExistingDisposableHome||output.startsWith(proposal.exactExistingDisposableHome+path.sep))throw Error('New canonical output outside approved home required');
  fs.mkdirSync(output,{mode:0o700});
  const projectDir=writeProvisioningProject(output,proposal);
  const report={version:1,prospectiveProvisioning:prospectiveProvisioning(output,projectDir,proposal),kind:'unsigned-project-inputs-only',proposalSha256:sha(proposalPath),projectDir,defaultCodeSigningAllowed:false,actualHostBundlesCopied:false,profilesEmbedded:false,signingPerformed:false,networkOrProvisioningPerformed:false,privateKeysUsed:false,dpExecuted:false,blocked:['No usable local profile','Root must bind exact execution to explicit human authorization','Actual host copy requires fresh matching boundary receipt and explicit input pins']};
  fs.writeFileSync(path.join(output,'preparation.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});return report;
}
export function prepareDevelopmentDp({ resourceRoot, boundaryReceiptPath, output, proposalPath = path.join(repository, 'docs/integration/proposed/development-dp-signing/proposal.json') }) {
  const proposal = JSON.parse(fs.readFileSync(proposalPath)), receipt = JSON.parse(fs.readFileSync(boundaryReceiptPath));
  if (proposal.kind !== 'conditional-development-signing-proposal-not-executable-policy' || proposal.signingAuthorized !== false || proposal.proposedDpHosts.length !== 3 || receipt.buildExitCode !== 0 || receipt.mapFixturePassed !== true) throw Error('Unsigned reviewed proposal and actual boundary receipt required');
  for (const source of nativePackagingManifest().sources) if (!receipt.sources.some(p => p.path === source.path && p.sha256 === source.sha256)) throw Error('Boundary source mismatch');
  assertDevelopmentProposal(proposal);
  resourceRoot = fs.realpathSync(resourceRoot); output = path.resolve(output);
  if (output === proposal.exactExistingDisposableHome || output.startsWith(proposal.exactExistingDisposableHome+path.sep) || output === resourceRoot || output.startsWith(resourceRoot + path.sep) || resourceRoot.startsWith(output + path.sep) || fs.existsSync(output) || fs.realpathSync(path.dirname(output)) !== path.dirname(output)) throw Error('New disjoint canonical output required');
  const artifacts = new Map();
  for (const item of receipt.outputs) { regular(item.path); if (sha(item.path) !== item.sha256) throw Error('Boundary output mismatch'); artifacts.set(path.basename(item.path), item.path); }
  for (const name of ['aux-native-carrier', 'libaux-native-boundary.dylib', 'aux-native-guard.node', 'aux-cli-launcher']) if (!artifacts.has(name)) throw Error('Missing boundary artifact');
  fs.mkdirSync(output, { mode: 0o700 });
  const root = path.join(output, 'Resources/aux'), changes = [], copied = [];
  function copy(source, dest, partRoot = source) {
    const s = fs.lstatSync(source);
    if (s.isDirectory()) { fs.mkdirSync(dest, { recursive: true, mode: 0o700 }); for (const name of fs.readdirSync(source).sort()) { if (name === 'embedded.provisionprofile') { changes.push({ source: path.join(source,name), action: 'exclude original static embedded profile; no replacement profile available' }); continue; } copy(path.join(source,name), path.join(dest,name), partRoot); } }
    else if (s.isSymbolicLink()) { const link = fs.readlinkSync(source), real = fs.realpathSync(source); if (path.isAbsolute(link) || !real.startsWith(partRoot + path.sep)) throw Error('Escaping source link'); fs.symlinkSync(link,dest); }
    else { regular(source); fs.mkdirSync(path.dirname(dest), { recursive: true, mode: 0o700 }); fs.copyFileSync(source,dest,fs.constants.COPYFILE_EXCL); fs.chmodSync(dest,s.mode & 0o777); if(sha(source)!==sha(dest))throw Error('Copy changed bytes'); copied.push({source,initialCopyOutput:dest,sha256:sha(dest)}); }
  }
  for (const role of ['daemon','cli']) copy(path.join(resourceRoot,`apps/${role}/Aux ${role==='cli'?'CLI':'Daemon'}.app`),path.join(root,`apps/${role}/Aux ${role==='cli'?'CLI':'Daemon'}.app`));
  const cli = path.join(root,'apps/cli/Aux CLI.app'), mac = path.join(cli,'Contents/MacOS');
  if (!fs.existsSync(path.join(mac,'aux-cli-sea'))) fs.renameSync(path.join(mac,'aux-cli'),path.join(mac,'aux-cli-sea'));
  else fs.unlinkSync(path.join(mac,'aux-cli'));
  copy(artifacts.get('aux-cli-launcher'),path.join(mac,'aux-cli'));
  changes.push({action:'Preserve supplied CLI SEA bytes at aux-cli-sea; install exact compiled fixed sibling wrapper',seaSha256:sha(path.join(mac,'aux-cli-sea')),wrapperSha256:sha(path.join(mac,'aux-cli'))});
  const info = path.join(cli,'Contents/Info.plist'), old = plist(info);
  if(old.CFBundleExecutable!=='aux-cli'||old.CFBundleIdentifier!=='dev.aux.browser.cli')throw Error('Unexpected supplied CLI plist');
  const before=sha(info); fs.writeFileSync(info,xmlPlist({...old,CFBundleExecutable:'aux-cli-sea'}));changes.push({path:info,beforeSha256:before,afterSha256:sha(info),action:'CLI SEA becomes profile-bearing main; wrapper remains fixed sibling'});
  const carrier=path.join(root,'native/Aux Native Carrier.app');
  copy(artifacts.get('aux-native-carrier'),path.join(carrier,'Contents/MacOS/aux-native-carrier'));
  fs.writeFileSync(path.join(carrier,'Contents/Info.plist'),xmlPlist({CFBundleIdentifier:'dev.aux.browser.native-carrier',CFBundleExecutable:'aux-native-carrier',CFBundleName:'Aux Native Carrier',CFBundlePackageType:'APPL',CFBundleVersion:'1',CFBundleShortVersionString:'1.0',LSUIElement:true}));
  copy(artifacts.get('libaux-native-boundary.dylib'),path.join(root,'native/libaux-native-boundary.dylib'));
  for (const role of ['daemon','cli']) {
    const dir=path.join(root,`apps/${role}/Aux ${role==='cli'?'CLI':'Daemon'}.app/Contents/Resources/native`);
    const binding=path.join(dir,'provided-native.node');regular(binding);if(sha(binding)!==rolePins[role].sha256)throw Error('Original native binding mismatch');
    for(const [name,source] of [['aux-native-guard.node',artifacts.get('aux-native-guard.node')],['aux-native.cjs',path.join(repository,'vendor/provided/aux-native.cjs')],['native-role-pins.cjs',path.join(repository,'vendor/provided/native-role-pins.cjs')]]) {const target=path.join(dir,name);if(fs.existsSync(target))fs.unlinkSync(target);copy(source,target);}
  }
  const projectDir=writeProvisioningProject(output,proposal),project=path.dirname(projectDir);
  const hosts=proposal.proposedDpHosts.map(host=>{const app=path.join(root,host.proposedBundleRelativeToAuxRoot),code=path.join(app,host.proposedMainExecutable),info=plist(path.join(app,'Contents/Info.plist'));if(info.CFBundleIdentifier!==host.bundleIdentifier||info.CFBundleExecutable!==path.basename(host.proposedMainExecutable))throw Error('Prepared host plist does not match proposed identity/main');return {role:host.role,bundleIdentifier:info.CFBundleIdentifier,bundle:app,executable:code,sha256:sha(code),infoPlistSha256:sha(path.join(app,'Contents/Info.plist')),entitlementsFile:path.join(project,host.role+'.entitlements'),prospectiveSigningOnly:{tool:'/usr/bin/codesign',argv:['--force','--sign',proposal.identityInspection.publicCertificateSha1,'--timestamp=none',...(host.preserveExistingRuntimeFlag?['--options','runtime']:[]),'--entitlements',path.join(project,host.role+'.entitlements'),app],authorized:false,prerequisites:['Actual matching CMS-authenticated profile embedded and pinned','Explicit owner signing permission','Final executable/entitlements/profile byte pins rechecked']},requiredProfilePath:path.join(app,'Contents/embedded.provisionprofile'),profilePresent:false,signingAuthorized:false};});
  const inventory=[];function walk(dir){for(const name of fs.readdirSync(dir).sort()){const file=path.join(dir,name),stat=fs.lstatSync(file);if(stat.isDirectory())walk(file);else if(stat.isSymbolicLink())inventory.push({path:path.relative(output,file),link:fs.readlinkSync(file)});else inventory.push({path:path.relative(output,file),sha256:sha(file),mode:stat.mode&0o777});}}walk(output);
  const plan={version:1,inventory,prospectiveProvisioning:prospectiveProvisioning(output,projectDir,proposal),kind:'unsigned-development-preparation-not-executable-signing-policy',proposalSha256:sha(proposalPath),boundaryReceiptSha256:sha(boundaryReceiptPath),resourceRoot,root,hosts,wrapper:{path:path.join(mac,'aux-cli'),sha256:sha(path.join(mac,'aux-cli')),signSeparately:true,dpClaims:[]},changes,copied,provisioningProject:projectDir,defaultCodeSigningAllowed:false,requiredSourceHooks:{oldCarrier:'native/aux-native-carrier',newCarrier:'native/Aux Native Carrier.app/Contents/MacOS/aux-native-carrier',cliWrapperSourceChangeRequired:false,existingAdhocSigningPlanCompatible:false},blocking:['No usable local profiles; no profile embedded','Root must bind exact execution to explicit human authorization','Final root source hooks and signing policy require review; this is a three-host preparation, not full product'],signingPerformed:false,nativeExecuted:false,dpExecuted:false};
  fs.writeFileSync(path.join(output,'preparation.json'),JSON.stringify(plan,null,2)+'\n',{flag:'wx',mode:0o600});return plan;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args[0]==='--project-only'&&args.length===2){console.log(JSON.stringify(prepareDevelopmentProject({output:args[1]})));}
 else{const[resourceRoot,boundaryReceiptPath,output]=args;if(args.length!==3)throw Error('Usage: prepare-development-dp.mjs <copied-resources> <current-boundary-receipt> <NEW-output> OR --project-only <NEW-output>');const plan=prepareDevelopmentDp({resourceRoot,boundaryReceiptPath,output});console.log(JSON.stringify({output,hosts:plan.hosts.length,signingPerformed:false,profilesEmbedded:false,blocked:plan.blocking}));}
}
