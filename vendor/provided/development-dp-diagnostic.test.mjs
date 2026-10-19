import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fixedScope,parentPreviewSha256,prefix,checkDevelopmentReceiptShape} from './development-dp-review.mjs';

test('diagnostic retains exact original approved scope, selector family and original approval hash without accessing home',()=>{
 const s=fixedScope();assert.equal(parentPreviewSha256,'58a7808370579e09299a1d63eef02897931348ee81590d870e439c459d745752');
 assert.equal(s.policy.core.scope,'dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476');assert.equal(s.parent.approvalId,s.policy.approvalId);assert.equal(s.policy.core.installationRows.length,4);assert.equal(s.proposal.identityInspection.teamId,'9F2JXY8TCK');
});
test('development diagnostic refuses partial signing or different actual host identity/group',()=>{
 const scope=fixedScope(),team=scope.proposal.identityInspection.teamId,leaf=scope.proposal.identityInspection.publicCertificateSha1;
 const finalProofs=['apps/daemon/Aux Daemon.app','apps/cli/Aux CLI.app','native/Aux Native Carrier.app'].map(relative=>({path:prefix+'/'+relative,signer:'development',leaf:{sha1:leaf,team},team,entitlements:{'com.apple.developer.team-identifier':team,'keychain-access-groups':[scope.proposal.proposedFirstAndOnlySharedGroup]}}));
 const fixture={version:1,implementation:'exact-development-signing',status:'signed-and-verified',mode:'sign',signed:true,signingAttempted:true,untargetedLeavesPreserved:true,dpExecuted:false,productLaunched:false,proposalSha256:scope.proposalSha256,expectedDevelopmentLeafSha1:leaf,expectedTeam:team,expectedGroup:scope.proposal.proposedFirstAndOnlySharedGroup,finalProofs:[...finalProofs,...Array.from({length:8},()=>({}))],finalInventory:Array(11).fill({})};
 assert.equal(checkDevelopmentReceiptShape(fixture,scope).length,3);
 for(const mutate of [r=>r.status='signing-failed',r=>r.signed=null,r=>r.mode='verify-only',r=>r.finalProofs[0].leaf.team='OTHER',r=>r.finalProofs[1].entitlements['keychain-access-groups']=['OTHER'],r=>r.finalProofs[2].leaf.sha1='OTHER']){const r=structuredClone(fixture);mutate(r);assert.throws(()=>checkDevelopmentReceiptShape(r,scope));}
});
test('native helper uses actual Apple code signature gate and exact four scoped metadata selectors, never caller group or enumeration',()=>{
 const source=fs.readFileSync(new URL('./native/development-dp-scope-helper.mm',import.meta.url),'utf8');
 assert.match(source,/SecCodeCheckValidity\(code,kSecCSStrictValidate,requirement\)/);assert.match(source,/anchor apple generic and certificate leaf = H/);assert.match(source,/groups\.count==1/);assert.match(source,/DevelopmentSignature\(\)&&validate/);
 assert.match(source,/@\[@"aside.install.meta",@"aside.install.sig",@"aside.install.kem",@"aside.dk"\]/);
 assert.doesNotMatch(source,/kSecMatchLimitAll|SecItemUpdate\(|SecItemAdd\(/);assert.equal((source.match(/SecItemDelete\(\(__bridge CFDictionaryRef\)query\)/g)||[]).length,1);
});
