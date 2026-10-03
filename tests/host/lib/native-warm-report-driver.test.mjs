import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { serializeWarmCohortReport } from './native-warm-report.mjs';
function fixture(report,primary){const exports={},configuration={candidate:{},trialConfiguration:{},signal:new AbortController().signal};let calls=0;const imports={
 './native-warm-report.mjs':{serializeWarmCohortReport},
 './native-aux-warm-trial.mjs':{createAuxWarmTrialFactory:value=>{assert.equal(value,configuration.trialConfiguration);return 'actual-bound-factory';}},
 './native-aux-warm-cohort.mjs':{async collectAuxWarmWindows(value){calls++;assert.equal(value.trials,20);assert.equal(value.openTrial,'actual-bound-factory');assert.equal(value.signal,configuration.signal);if(primary)throw primary;return report;}}};
 const code=ts.transpileModule(readFileSync(new URL('./native-aux-warm-driver.mjs',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require(name){assert.ok(imports[name],name);return imports[name];}});return {run:()=>exports.captureAuxWarmWindowReport(configuration),calls:()=>calls};}
test('actual caller persistence boundary retains original report separately from graph bytes',async()=>{const report={status:'observed',samplesUs:['12']},f=fixture(report),value=await f.run();assert.equal(value.report,report);assert.equal(JSON.parse(value.serializedReport).inferredCleanup,false);assert.equal(f.calls(),1);});
test('actual caller rethrows original cyclic failure with full separate encoded primary/cleanup evidence',async()=>{const original=new Error('native original failure');original.report={status:'failed',primary:original,cleanupDebt:true};const f=fixture(undefined,original);await assert.rejects(f.run(),error=>{assert.equal(error,original);const graph=JSON.parse(error.serializedWarmReport);assert.ok(graph.nodes.some(node=>node.kind==='error'&&node.message===original.message));assert.equal(graph.inferredCleanup,false);return true;});assert.equal(f.calls(),1);});

test('successful original measurement with serialization refusal preserves report identity and raw native intervals',async()=>{const report={status:'observed',samplesUs:['12345678901234567890'],nativeQualificationProven:false};Object.defineProperty(report,'unserializableReceipt',{get(){throw new Error('Getter must not execute');}});const f=fixture(report);await assert.rejects(f.run(),error=>{assert.match(error.message,/Accessor report property refused/);assert.equal(error.originalWarmReport,report);assert.equal(error.originalWarmReport.samplesUs[0],'12345678901234567890');assert.equal(report.status,'observed');assert.equal(report.nativeQualificationProven,false);assert.equal(error.reportPersistenceProven,false);assert.equal(error.serializedWarmReport,undefined);return true;});assert.equal(f.calls(),1);});
