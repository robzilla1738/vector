import {expect,it} from 'vitest';
import {TaskReceiptSchema} from '@vector/contracts';
import {taskReceiptMarkdown} from './task-receipt-export';
it('preserves uncertainty, provenance and stale evidence without embedding active content',()=>{
 const receipt=TaskReceiptSchema.parse({taskId:'task-1',taskRevision:2,objective:'Compare ![tracker](https://example.test/image) <script>bad()</script>',generatedAt:0,status:'uncertain',
 criteria:[{criterion:{criterionId:'c1',description:'Verify result',verification:'manual'},status:'stale',evidence:[{stale:true,reason:'Page changed',record:{evidenceId:'e1',taskId:'task-1',taskRevision:1,criterionId:'c1',kind:'browser_observation',actor:'external_client',summary:'Client says done',recordedAt:0,observedAt:0,runSequence:1,source:{url:'https://example.test',pageId:'p1',documentEpoch:2},snapshot:{title:'Captured title',text:'Private captured body'}}}],review:{reviewId:'review-1',taskId:'task-1',taskRevision:1,criterionId:'c1',outcome:'accepted',actor:'desktop_user',evidenceIds:['e1'],note:'Reviewed earlier evidence',recordedAt:0,evidenceSequence:1}}],
 unresolvedActions:[{intentId:'effect-1',runId:'run-1',pageId:'p1',status:'uncertain'}],unresolvedOperations:[{invocationId:'inv-1',runId:'run-1',operation:'example.test/submit',effectClass:'write',status:'interrupted',effectOutcome:'unknown',startedAt:1,error:'Disconnected'}],runs:[{runId:'run-1',status:'failed',taskRevision:1,currentRevision:false,error:'Unknown result',durationMs:2500}],modelCalls:2,knownCostUsd:0.01,costComplete:false});
 const exported=taskReceiptMarkdown(receipt);
 expect(exported).toContain('**Outcome uncertain**');expect(exported).toContain('**Stale evidence:** Page changed');
 expect(exported).toContain('Client-submitted claim');expect(exported).toContain('Evidence reviewed: e1');
 expect(exported).toContain('effect-1 — uncertain');expect(exported).toContain('task revision 1 (earlier)');
 expect(exported).toContain('example.test/submit');expect(exported).toContain('inv-1');
 expect(exported).toContain('some costs are unknown or estimated');expect(exported).not.toContain('Private captured body');
 expect(exported).not.toContain('![tracker]');expect(exported).not.toContain('<script>');
 expect(taskReceiptMarkdown(receipt,true)).toContain('Private captured body');
});

it('exports command provenance and limitations with command text and output opt-in',()=>{
 const receipt=TaskReceiptSchema.parse({taskId:'t',taskRevision:1,objective:'Check project',generatedAt:0,status:'needs_review',criteria:[{criterion:{criterionId:'c',description:'Checks pass',verification:'test'},status:'needs_review',evidence:[{stale:false,record:{evidenceId:'e',taskId:'t',taskRevision:1,criterionId:'c',kind:'command_snapshot',actor:'desktop_user',summary:'Local command result: succeeded (exit 0)',recordedAt:0,observedAt:0,runSequence:0,source:{commandId:'command-1',projectId:'project-1',commandState:'succeeded',exitCode:0,truncated:true,sha256:'a'.repeat(64)},snapshot:{title:'Saved local command result',text:'PRIVATE_COMMAND_AND_OUTPUT <script>bad()</script>'}}}]}],unresolvedActions:[],runs:[],modelCalls:0,knownCostUsd:0,costComplete:true});
 const exported=taskReceiptMarkdown(receipt);
 expect(exported).toContain('Saved local command result selected by user');expect(exported).toContain('Output truncated: true');expect(exported).toContain('does not prove task acceptance');expect(exported).not.toContain('PRIVATE_COMMAND_AND_OUTPUT');
 expect(taskReceiptMarkdown(receipt,true)).toContain('PRIVATE\\_COMMAND\\_AND\\_OUTPUT');expect(taskReceiptMarkdown(receipt,true)).not.toContain('<script>');
});
