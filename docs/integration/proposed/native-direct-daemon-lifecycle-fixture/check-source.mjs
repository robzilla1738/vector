import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('./',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8'),sha=p=>createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex'),manifest=JSON.parse(read('manifest.json'));
for(const file of manifest.files){if(file.action==='modify')assert.equal(sha('baseline/'+file.path),file.baselineSha256);assert.equal(sha('source/'+file.path),file.outputSha256)}assert.equal(sha('fixture.patch'),manifest.patchSha256);
const base=read('baseline/chrome/browser/aux/daemon_supervisor.cc'),source=read('source/chrome/browser/aux/daemon_supervisor.cc'),header=read('source/chrome/browser/aux/daemon_supervisor.h'),fixture=read('source/chrome/browser/aux/daemon_supervisor_lifecycle_unittest.cc');
assert.ok(header.includes('friend class DaemonSupervisorLifecycleTest;'));
const gate='base::AutoLock hold(admission->lock);\n  if (!admission->open || admission->generation != generation) {\n    return base::Process();\n  }';assert.ok(base.includes(gate));assert.ok(source.includes(gate));assert.ok(source.includes('return std::move(launch).Run();'));
assert.ok(source.includes('return RunAdmittedLaunch('));assert.ok(source.includes('return base::LaunchProcess(command, options);'));
// All lifecycle/drain code after launch is unchanged by this testability refactor.
assert.equal(source.slice(source.indexOf('DirectDaemonDrainResult StopVerified(')),base.slice(base.indexOf('DirectDaemonDrainResult StopVerified(')));
for(const name of ['NoOwnedProcessPostsNarrowTerminalResult','QueuedLaunchCannotEnterAfterQuiesce','AdmittedChildReplyDrainsBeforeAcknowledgement','FailedOwnershipDrainRetainsHandleAndFailure'])assert.ok(fixture.includes(name));
assert.ok(fixture.includes('DaemonSupervisor::RunAdmittedLaunch('));assert.ok(fixture.includes('supervisor_->DidLaunch(generation'));assert.ok(fixture.includes('supervisor_->QuiesceDirectDaemonForMigration('));assert.ok(fixture.includes('cleanup_.CreationTime(), cleanup_created_'));assert.ok(fixture.includes('factory_.GetSafeWeakWrapper()'));
console.log(JSON.stringify({sourcePins:manifest.files.length,productionGateReused:true,lifecycleBodyUnchanged:true,fixtureCases:4,compiled:false,executed:false}));
