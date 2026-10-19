import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {validateDevelopmentProfileMetadata,provisioningProject,xmlPlist} from './prepare-development-dp.mjs';
const proposal=JSON.parse(fs.readFileSync(new URL('../../docs/integration/proposed/development-dp-signing/proposal.json',import.meta.url)));
test('profile metadata must authorize exact team, prefix, AppID, group, cert, date and test Mac; never claims CMS/signing approval',()=>{
 const p=structuredClone(proposal),der=Buffer.from('public-certificate-fixture-only');p.identityInspection.publicCertificateSha1=createHash('sha1').update(der).digest('hex');
 const host=p.proposedDpHosts[0],team=p.identityInspection.teamId,opts={now:'2026-10-19T00:00:00Z',testMacIdentifier:'FIXTURE-MAC'};
 const profile={TeamIdentifier:[team],ApplicationIdentifierPrefix:[team],Platform:['OSX'],CreationDate:'2026-10-01T00:00:00Z',ExpirationDate:'2026-11-01T00:00:00Z',ProvisionedDevices:['FIXTURE-MAC'],DeveloperCertificates:[der.toString('base64')],Entitlements:{'com.apple.application-identifier':team+'.'+host.bundleIdentifier,'com.apple.developer.team-identifier':team,'keychain-access-groups':[p.proposedFirstAndOnlySharedGroup]}};
 const result=validateDevelopmentProfileMetadata(profile,host,p,opts);assert.equal(result.metadataClaimsMatch,true);assert.equal(result.cmsSignatureVerified,false);assert.equal(result.signingAuthorized,false);
 for(const change of [x=>x.TeamIdentifier=['OTHER'],x=>x.ApplicationIdentifierPrefix=['OTHER'],x=>x.ExpirationDate='2026-01-01T00:00:00Z',x=>x.ProvisionedDevices=['OTHER'],x=>x.DeveloperCertificates=[],x=>x.Entitlements['keychain-access-groups']=['OTHER'],x=>x.Entitlements['com.apple.application-identifier']=team+'.unrelated']) {const wrong=structuredClone(profile);change(wrong);assert.throws(()=>validateDevelopmentProfileMetadata(wrong,host,p,opts));}
});
test('generated Xcode project has three explicit app targets, products and signing disabled in every config',()=>{
 const project=provisioningProject(proposal),objects=Object.values(project.objects);
 assert.equal(objects.filter(x=>x.isa==='PBXNativeTarget').length,3);
 const configs=objects.filter(x=>x.isa==='XCBuildConfiguration');assert.equal(configs.length,4);assert.ok(configs.every(c=>c.buildSettings.CODE_SIGNING_ALLOWED==='NO'));
 assert.ok(configs.filter(c=>c.buildSettings.CODE_SIGN_STYLE==='Automatic').every(c=>c.buildSettings.CODE_SIGN_IDENTITY==='Apple Development'));
 assert.equal(objects.filter(x=>x.isa==='PBXFileReference'&&x.explicitFileType==='wrapper.application').length,3);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aux-dp-project-fixture-'));
 try{const file=path.join(dir,'project.pbxproj');fs.writeFileSync(file,xmlPlist(project));const check=spawnSync('/usr/bin/plutil',['-lint',file],{encoding:'utf8'});assert.equal(check.status,0,check.stderr);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
