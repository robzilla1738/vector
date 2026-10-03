import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
test('actual Stock entrypoint constructs the fixed admitted factory and invokes only Stock cohort',async()=>{
 const config={manifestPath:'controlled'},candidate={stock:{}},signal=new AbortController().signal,report={status:'observed',nativeQualificationProven:false},open=()=>{};let factoryCalls=0,collectorCalls=0;
 const exports={};const code=ts.transpileModule(readFileSync(new URL('./native-stock-warm-driver.mjs',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require(name){if(name==='./native-stock-warm-trial.mjs')return {createStockWarmTrialFactory(value){factoryCalls++;assert.equal(value,config);return open;}};assert.equal(name,'./native-warm-cohort.mjs');return {collectWarmWindows(kind,options){collectorCalls++;assert.equal(kind,'stock');assert.equal(options.candidate,candidate);assert.equal(options.signal,signal);assert.equal(options.trials,20);assert.equal(options.openTrial,open);return report;}};}});
 assert.equal(await exports.measureStockWarmWindows({candidate,trialConfiguration:config,signal}),report);assert.equal(factoryCalls,1);assert.equal(collectorCalls,1);
});
