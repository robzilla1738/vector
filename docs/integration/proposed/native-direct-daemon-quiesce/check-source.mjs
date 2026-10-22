/** Offline proof of proposal/source pins and critical lifecycle structure only. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('./',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8'),sha=p=>createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex');
const manifest=JSON.parse(read('manifest.json'));
for(const file of manifest.files){assert.equal(sha('baseline/'+file.path),file.baselineSha256);assert.equal(sha('source/'+file.path),file.outputSha256)}assert.equal(sha('quiesce.patch'),manifest.patchSha256);
const d=read('source/chrome/browser/aux/daemon_supervisor.cc'),h=read('source/chrome/browser/aux/daemon_supervisor.h'),p=read('source/chrome/browser/aux/browser_platform.cc');
assert.ok(h.includes('Scope { kOwnedDirectDaemonOnly }'));assert.ok(h.includes('kNoOwnedProcess, kExited, kDrainFailed'));
assert.match(d,/base::AutoLock hold\(admission->lock\);[\s\S]*?if \(!admission->open \|\| admission->generation != generation\)[\s\S]*?return base::LaunchProcess\(command, options\);/);
const q=d.slice(d.indexOf('void DaemonSupervisor::QuiesceDirectDaemonForMigration('),d.indexOf('void DaemonSupervisor::Shutdown('));assert.ok(q.indexOf('admission_closed_ = true')<q.indexOf('quiesce_result_'));assert.ok(q.indexOf('launch_admission_->open = false')<q.indexOf('launch_pending_'));assert.ok(q.includes('++launch_admission_->generation'));
assert.ok(d.includes('if (admission_closed_ || launch_pending_ || process_.IsValid()'));assert.ok(d.includes('admission_closed_ || generation != launch_generation_'));assert.ok(d.includes('process_.Duplicate(), process_created_'));assert.ok(!d.includes('&StopVerified, std::move(process_)'));assert.ok(d.includes('if (drained.exited) process_.Close();'));
for(const name of ['Poll','Authenticate','DidReadChallenge','DidReadSession']){const start=d.indexOf('void DaemonSupervisor::'+name+'(');assert.ok(start>0);assert.ok(d.slice(start,d.indexOf('\n}',start)).includes('if (admission_closed_) return;'),name)}
assert.ok(p.includes('components_loop.Run();\n  // A migration quiesce'));assert.ok(p.includes('if (supervisor_->state() != DaemonSupervisor::State::kStopped) return;'));
console.log(JSON.stringify({sourcePins:manifest.files.length,criticalLifecycleSourceChecks:true,compiled:false,runtimeChecked:false,scope:manifest.scope}));
