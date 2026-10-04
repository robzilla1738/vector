import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { stockLfsInventorySha256, verifyStockGraphEvidence } from './stock-graph-evidence.mjs';
const hash = raw => createHash('sha256').update(raw).digest('hex');
const artifact = value => { const raw = JSON.stringify(value); return {raw, sha256:hash(raw)}; };
const originalRaw = readFileSync(new URL('../../../docs/lane-requests/l10/stock-graph-evidence/original-local-lfs-inventory.json', import.meta.url), 'utf8');
const original = JSON.parse(originalRaw);
const sourceRaw=readFileSync(new URL('../../../docs/lane-requests/l10/stock-graph-collector/gpu_registry.cc', import.meta.url),'utf8');
const labels = ['//chrome:chrome','//chrome/test:unit_tests','//chrome/test:browser_tests','//content/test:content_unittests'];
function specimen() {
  const nodes = Object.fromEntries(labels.map(label => [label, {deps:[], public_deps:[], data_deps:[], sources:[]} ]));
  const missing = original.paths.map(row => `//third_party/litert/src/${row.path}`);
  const loader = {producer:'stock-original-litert-loader-closure/v1', unresolvedDynamicLoads:false, effectiveUseLitertTflite:false,
    selectedTargets:[], sourcePath:'//third_party/litert/src/litert/runtime/accelerators/gpu_registry.cc', sourceSha256:hash(sourceRaw),gpuBranches:[],
    macosPaths:missing.filter(path => path.includes('/macos_arm64/')), runtimeLoads:[],
    classifications:missing.map(path => ({path,classification:'absent_from_selected_graph_and_source_load_closure'}))};
  return {inventory:{raw:originalRaw,sha256:hash(originalRaw)}, nodes, actions:{targetLabels:labels, dynamicUndeclaredReads:false,
    rows:labels.map(target => ({target,inputs:[],runtimeLoads:[],argv:[],commandSha256:hash('[]')}))}, loader};
}
function evidence(state) {
  const value = {inventory:state.inventory, graph:artifact(state.nodes), commands:artifact(state.actions), loader:artifact(state.loader),loaderSource:{raw:sourceRaw,sha256:hash(sourceRaw)}};
  return {...value, expected:Object.fromEntries(Object.entries(value).map(([key,v]) => [key,v.sha256]))};
}
test('joins retained original23 inventory; mock graph success grants no compile/SDK/deployed/native acceptance', () => {
  assert.equal(hash(originalRaw),stockLfsInventorySha256);
  assert.deepEqual(verifyStockGraphEvidence(evidence(specimen())), {candidateEvidenceVerified:true,classifiedMissingObjects:23,
    selectedTargetCount:4,compilationAdmitted:false,sdkCompileClosureProven:false,deployedLoadClosureProven:false,stock11Qualified:false});
});
test('refuses externally expected raw hash mismatch and duplicate original graph keys', () => {
  const e=evidence(specimen());e.graph.raw+=' ';assert.throws(()=>verifyStockGraphEvidence(e),/bytes changed/);
  const d=evidence(specimen());d.graph.raw=d.graph.raw.replace('"deps":[]','"deps":[],"deps":[]');d.graph.sha256=hash(d.graph.raw);d.expected.graph=d.graph.sha256;
  assert.throws(()=>verifyStockGraphEvidence(d),/Duplicate/);
});
test('traverses public/data dependencies; missing transitive node and omitted action row refuse', () => {
  const s=specimen();s.nodes[labels[0]].data_deps=['//data:resource'];assert.throws(()=>verifyStockGraphEvidence(evidence(s)),/Missing transitive/);
  s.nodes['//data:resource']={public_deps:[],inputs:[]};assert.throws(()=>verifyStockGraphEvidence(evidence(s)),/omits selected target/);
  s.actions.targetLabels=[...labels,'//data:resource'];assert.throws(()=>verifyStockGraphEvidence(evidence(s)),/Missing action closure/);
});
test('a required missing object in source/action/data/script/copy/runtime-load inputs cannot be excluded by label', () => {
  for (const field of ['sources','inputs','data','script']) {
    const s=specimen(); const missing=s.loader.macosPaths[0];s.nodes[labels[0]][field]=field==='script'?missing:[missing];
    assert.throws(()=>verifyStockGraphEvidence(evidence(s)),/Missing object required/);
  }
  for (const field of ['inputs','runtimeLoads']) {const s=specimen();s.actions.rows[0][field]=[s.loader.macosPaths[1]];
    assert.throws(()=>verifyStockGraphEvidence(evidence(s)),/Missing object required/);}
});
test('requires all23 classifications, both macOS loader witnesses and no unresolved dynamic read', () => {
  for (const change of [s=>s.loader.classifications.pop(),s=>s.loader.macosPaths.pop(),s=>s.loader.unresolvedDynamicLoads=true,
    s=>s.actions.dynamicUndeclaredReads=true,s=>delete s.loader.effectiveUseLitertTflite]) {
    const s=specimen();change(s);assert.throws(()=>verifyStockGraphEvidence(evidence(s)));
  }
});
test('selected LiteRT macro witnesses must join every original command argv', () => {
  const s=specimen();const target='//third_party/litert:runtime';s.nodes[labels[0]].deps=[target];s.nodes[target]={};
  s.actions.targetLabels=[...labels,target];const argv=['-DLITERT_STATIC','-DLITERT_DISABLE_METAL_SUPPORT']; const commandSha256=hash(JSON.stringify(argv));
  s.actions.rows.push({target,inputs:[],runtimeLoads:[],argv,commandSha256});
  s.loader.selectedTargets=[{target,commands:[{commandSha256,defines:['LITERT_STATIC','LITERT_DISABLE_METAL_SUPPORT']}]}];
  assert.equal(verifyStockGraphEvidence(evidence(s)).selectedTargetCount,5);
  s.loader.selectedTargets[0].commands[0].commandSha256='d'.repeat(64);assert.throws(()=>verifyStockGraphEvidence(evidence(s)),/original target command/);
  s.loader.selectedTargets[0].commands[0].commandSha256=commandSha256;s.loader.selectedTargets[0].commands[0].defines.pop();assert.throws(()=>verifyStockGraphEvidence(evidence(s)),/macros/);
});
