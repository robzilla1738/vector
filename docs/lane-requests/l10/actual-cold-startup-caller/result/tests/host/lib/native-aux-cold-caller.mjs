import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { createJourneyApp } from './app.mjs';
import { retainPackagedRuntimePair, readPackagedRuntimePairBytes } from './packaged-runtime-pair-artifact.mjs';
import { retainStartupHelperArtifact } from './startup-helper-artifact.mjs';
import { retainStartupBrowserArtifact } from './startup-browser-artifact.mjs';
import { launchAuxStartupHelper, readAuxStartupAttachment } from './startup-helper-launch.mjs';
import { verifyColdStartupCohort } from './native-cold-startup-admission.mjs';
const quarantine = new Set();
export const auxColdCleanupDebtCount = () => quarantine.size;
const artifactIdentity = pair => ({runtime:pair.productIdentity,native:pair.native});
/** Sole native operator entrypoint. Import performs no launch or filesystem read.
 * The branded canonical pair and fixed helper/browser descriptors precede AC
 * and every launch. Pre-launch identity is explicitly artifact identity; live
 * runtime identity is read only after original hardware and owner attachment. */
export async function collectAuxColdStartup({pairAdmission, helper, compilerAudit, metadataWriter, browser,
  signal, trials=20, readPower=()=>execFileSync('/usr/bin/pmset',['-g','batt'],{encoding:'utf8',timeout:5000})}) {
  assert.equal(quarantine.size,0,'Original cold cleanup debt retains admission');
  assert.ok(signal instanceof AbortSignal);signal.throwIfAborted();
  assert.ok(Number.isInteger(trials)&&trials>=20&&trials<=100,'20–100 actual original AC trials required');
  const report={schema:1,producer:'aux-cold-startup-caller',classification:'cold-original-process',attempts:[],
    status:'running',nativeQualificationProven:false,firstFrameProven:false,ordinaryNavigationTimingProven:false};
  const state={pair:undefined,helperLease:undefined,browserLease:undefined,startup:undefined,launchEntered:false,cleanup:undefined};
  let held=false;
  const release=()=>{state.browserLease?.release();state.helperLease?.release();state.pair?.release();quarantine.delete(state);};
  const validate=()=>{signal.throwIfAborted();state.pair.validate();state.helperLease.validate();state.browserLease.validate();};
  const isReaped=result=>result?.cleanupDebt===false&&result.nativeSlotRetained===false;
  const retryCleanup=async()=>{
    assert.ok(state.startup,'No original startup owner returned; original failure debt remains');
    const result=await state.startup.stop(state.primary);state.cleanup=result;
    if(isReaped(result))release();return result;
  };
  try {
    state.pair=retainPackagedRuntimePair(pairAdmission);
    const pair=readPackagedRuntimePairBytes(state.pair);
    state.helperLease=retainStartupHelperArtifact(helper,compilerAudit);
    assert.equal(browser.imageUuid,pair.image.imageUuid,'Original paired browser image changed');
    state.browserLease=retainStartupBrowserArtifact(pair.bundle,browser);
    validate();
    const candidate={productIdentity:pair.productIdentity,native:pair.native};
    report.candidate=structuredClone(candidate);report.pairArtifact=structuredClone(pair.artifact);
    report.helperArtifact={identity:state.helperLease.identity,compile:state.helperLease.compile};
    report.browserArtifact=state.browserLease.identity;
    for(let index=0;index<trials;index++) {
      const attempt={trial:index+1,status:'running'};report.attempts.push(attempt);
      state.startup=undefined;state.launchEntered=false;state.cleanup=undefined;
      let primary;
      try {
        validate();
        attempt.preLaunchArtifact=structuredClone({identity:artifactIdentity(pair),bundle:pair.bundle,image:pair.image,shellDigest:pair.shellDigest});
        attempt.identityBefore=attempt.preLaunchArtifact.identity;
        attempt.identityBeforeKind='retained-packaged-artifacts';
        attempt.powerBefore=await readPower();assert.match(attempt.powerBefore,/Now drawing from 'AC Power'/,'Original pre-launch AC required');
        validate();
        const app=createJourneyApp({appPath:pair.bundle});
        validate();
        state.launchEntered=true;
        state.startup=await launchAuxStartupHelper({bundle:pair.bundle,fixtureRoot:realpathSync(app.profileRoot),
          trial:randomBytes(16).toString('hex'),helper,compilerAudit,metadataWriter,browser,signal});
        const presentation=await state.startup.presentation();validate();
        attempt.coldPresentation=presentation;
        const launch=presentation.originalLaunch;
        assert.ok(launch?.raw&&presentation.cold?.raw&&presentation.raw,'Original cold receipt chain missing');
        attempt.originalCold={trial:launch.record.trial,launcherPid:launch.record.launcherPid,
          launchRaw:launch.raw,kernelRaw:presentation.cold.raw,presentationRaw:presentation.raw};
        await app.attachStartup(state.startup);validate();
        const attachment=readAuxStartupAttachment(state.startup);attachment.assertLive();
        assert.equal(app.pid,launch.record.browserPid);
        attempt.identityAfter=structuredClone(await app.identity());
        attachment.assertLive();validate();
        assert.deepEqual(attempt.identityAfter.runtime,candidate.productIdentity);
        for(const key of ['sourceCommit','buildId','manifestHash'])assert.equal(attempt.identityAfter.native?.[key],candidate.native[key]);
        // Runtime advertises additional fields; retain them, comparing complete
        // original artifact identity only where both genuine producers overlap.
        attempt.identityAfterKind='original-live-runtime';
        attempt.artifactAfter=structuredClone(artifactIdentity(pair));
        attempt.powerAfter=await readPower();assert.match(attempt.powerAfter,/Now drawing from 'AC Power'/,'Original post-presentation AC required');
        attachment.assertLive();validate();
      } catch(error) {primary=error;attempt.primary=error;}
      if(state.startup) {
        try {
          attempt.browserCleanup=state.cleanup=await state.startup.stop(primary);
          assert.ok(isReaped(state.cleanup),'Original cold browser cleanup debt');
          assert.ok(!state.cleanup.primary&&!state.cleanup.cleanup,'Original cold cleanup failed');
        } catch(cleanup) {attempt.browserCleanupFailure=cleanup;primary=primary?new AggregateError([primary,cleanup],'Cold measurement and original cleanup failed',{cause:primary}):cleanup;}
      } else if(state.launchEntered) {
        attempt.browserCleanup=state.cleanup=primary?.cleanup && {...primary.cleanup,nativeSlotRetained:primary.nativeSlotRetained};
        if(!isReaped(state.cleanup))held=true;
      }
      if(state.startup&&!isReaped(state.cleanup))held=true;
      if(primary){attempt.status='failed';throw primary;}
      attempt.status='observed';validate();
    }
    report.admission=verifyColdStartupCohort(report.attempts,{candidate,
      helper:{binarySha256:helper.sha256,sourceSha256:helper.sourceSha256,imageUuid:helper.imageUuid},browser:state.browserLease.identity});
    report.status='observed';release();return report;
  } catch(primary) {
    report.status='failed';report.primary=primary;state.primary=primary;
    if(held||(state.launchEntered&&!isReaped(state.cleanup))) {
      quarantine.add(state);report.cleanupDebt=true;
    } else release();
    const failure=new Error('Original cold startup cohort refused',{cause:primary});
    failure.report=report;
    if(quarantine.has(state))failure.coldCleanupOwner=Object.freeze({retryCleanup});
    throw failure;
  }
}
