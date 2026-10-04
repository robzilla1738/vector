import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { posix } from 'node:path';
import { readStockEvidenceDocument, verifyStockGraphEvidence } from './stock-graph-evidence.mjs';
const sourceRoot = '/Users/rcourson/aux-chromium-stock-measurement/chromium/src';
const buildDirectory = `${sourceRoot}/out/StockMemory`;
const roots = ['//chrome:chrome','//chrome/test:unit_tests','//chrome/test:browser_tests','//content/test:content_unittests'];
const gpuSource = '//third_party/litert/src/litert/runtime/accelerators/gpu_registry.cc';
const hash = raw => createHash('sha256').update(raw).digest('hex');
const artifact = value => {const raw=JSON.stringify(value);return {raw,sha256:hash(raw)};};
function originalPath(value) {
  assert.equal(typeof value,'string');assert.ok(!value.includes('\\') && !value.includes('\0'));
  if (value.startsWith('//')) {assert.ok(!value.split('/').includes('..'));return value;}
  const absolute=posix.resolve(buildDirectory,value);
  assert.ok(absolute.startsWith(`${sourceRoot}/`),'Foreign/build-relative source input');
  return `//${absolute.slice(sourceRoot.length+1)}`;
}
/** Offline conversion of independently pinned original GN/command/macro captures.
 * Capture rows require exact original target mapping; compdb file names alone
 * cannot assign an ambiguous target. This function never invokes a producer. */
export function collectStockGraphEvidence({inventory,graph,capturedCommands,loaderSource,effectiveArgs,expected}) {
  assert.deepEqual(Object.keys(expected).sort(),['inventory','graph','capturedCommands','loaderSource','effectiveArgs'].sort());
  for (const [key,value] of Object.entries({inventory,graph,capturedCommands,loaderSource,effectiveArgs})) {
    assert.equal(value.sha256,expected[key],`Unadmitted original ${key}`);assert.equal(hash(value.raw),value.sha256);
  }
  const original=readStockEvidenceDocument(inventory), nodes=readStockEvidenceDocument(graph), capture=readStockEvidenceDocument(capturedCommands);
  assert.equal(effectiveArgs.raw.trim(),'use_litert_tflite = false','Actual effective GN argument is required');
  assert.equal(capture.producer,'stock-original-target-command-capture/v1');
  assert.equal(capture.dynamicUndeclaredReads,false);assert.equal(capture.unresolvedDynamicLoads,false);
  assert.equal(capture.sourceRoot,sourceRoot);assert.equal(capture.buildDirectory,buildDirectory);
  assert.ok(Array.isArray(capture.rows));
  const reached=new Set();
  function visit(target) {
    if(reached.has(target))return;const node=nodes[target];assert.ok(node,`Missing original GN target ${target}`);reached.add(target);
    for(const key of ['deps','public_deps','data_deps']) {assert.ok(Array.isArray(node[key]??[]));for(const child of node[key]??[])visit(child);}
  }
  roots.forEach(visit);
  const seen=new Set(),rows=[];
  for(const captured of capture.rows) {
    assert.ok(reached.has(captured.target),'Foreign target command');assert.ok(Array.isArray(captured.argv)&&captured.argv.every(arg=>typeof arg==='string'));
    // Complete original argv is captured, not reconstructed from a shell string.
    const commandSha256=hash(JSON.stringify(captured.argv));assert.equal(commandSha256,captured.commandSha256);
    const key=`${captured.target}:${commandSha256}`;assert.ok(!seen.has(key),'Ambiguous duplicate command mapping');seen.add(key);
    assert.ok(Array.isArray(captured.inputs)&&Array.isArray(captured.runtimeLoads));
    rows.push({target:captured.target,argv:captured.argv,commandSha256,inputs:captured.inputs.map(originalPath),runtimeLoads:captured.runtimeLoads.map(originalPath)});
  }
  for(const target of reached) {
    const targetRows=rows.filter(row=>row.target===target);assert.ok(targetRows.length,'Missing original target command capture');
    const declared=['sources','inputs','data','script'].flatMap(key=>typeof nodes[target][key]==='string'?[nodes[target][key]]:nodes[target][key]??[]).map(originalPath);
    for(const input of declared)assert.ok(targetRows.some(row=>row.inputs.includes(input)),`Uncaptured declared target input ${input}`);
  }
  const gpuBranches=[];
  for(const command of rows.filter(row=>row.inputs.includes(gpuSource))) {
    const originalRow=capture.rows.find(row=>row.target===command.target&&row.commandSha256===command.commandSha256);
    const macro=originalRow.effectiveMacros;
    assert.ok(macro,'Missing original effective macro capture');assert.equal(macro.source,gpuSource);
    assert.equal(macro.originalCommandSha256,command.commandSha256);assert.equal(macro.exitCode,0);
    assert.equal(hash(macro.raw),macro.rawSha256);
    // The pinned actual source's entire dynamic registry lies in this branch.
    // Enabled branches include arbitrary RuntimeLibraryDir path construction;
    // a basename list or static/Metal-disabled labels cannot establish closure.
    assert.ok(/^#define LITERT_DISABLE_GPU(?:\s|$)/m.test(macro.raw),'Enabled GPU runtime-directory loader is unresolved');
    gpuBranches.push({commandSha256:command.commandSha256,condition:'!defined(LITERT_DISABLE_GPU)',active:false,
      sourceSha256:loaderSource.sha256,macroRaw:macro.raw,macroRawSha256:macro.rawSha256});
  }
  const missing=original.paths.map(row=>`//third_party/litert/src/${row.path}`);
  const selectedPaths=new Set(rows.flatMap(row=>[...row.inputs,...row.runtimeLoads]));
  for(const target of reached)for(const key of ['sources','inputs','data','script','outputs']) {
    for(const value of typeof nodes[target][key]==='string'?[nodes[target][key]]:nodes[target][key]??[])selectedPaths.add(originalPath(value));
  }
  for(const value of missing)assert.ok(!selectedPaths.has(value),`Missing original object required ${value}`);
  const loader=artifact({producer:'stock-original-litert-loader-closure/v1',unresolvedDynamicLoads:false,effectiveUseLitertTflite:false,
    selectedTargets:[...reached].filter(target=>target.startsWith('//third_party/litert')).map(target=>({target,
      commands:rows.filter(row=>row.target===target).map(row=>({commandSha256:row.commandSha256,defines:row.argv.filter(arg=>arg.startsWith('-D')).map(arg=>arg.slice(2))}))})),
    sourceSha256:loaderSource.sha256,sourcePath:gpuSource,gpuBranches,
    macosPaths:missing.filter(value=>value.includes('/macos_arm64/')),runtimeLoads:rows.flatMap(row=>row.runtimeLoads),
    classifications:missing.map(path=>({path,classification:'absent_from_selected_graph_and_source_load_closure'}))});
  const commands=artifact({targetLabels:[...reached],dynamicUndeclaredReads:false,rows});
  // Normalize GN paths only; retain original raw graph + hash in the source join.
  const normalized=Object.fromEntries([...reached].map(target=>[target,{...nodes[target],...Object.fromEntries(['sources','inputs','data','script','outputs'].filter(key=>nodes[target][key]!==undefined).map(key=>[key,typeof nodes[target][key]==='string'?originalPath(nodes[target][key]):nodes[target][key].map(originalPath)]))}]));
  const normalizedGraph=artifact(normalized);
  const evidence={inventory,graph:normalizedGraph,commands,loader,loaderSource,
    expected:{inventory:inventory.sha256,graph:normalizedGraph.sha256,commands:commands.sha256,loader:loader.sha256,loaderSource:loaderSource.sha256}};
  const result=verifyStockGraphEvidence(evidence);
  return Object.freeze({evidence,sourceJoin:Object.freeze({...expected}),result,originalGraphRaw:graph.raw,
    requiresIndependentRootAudit:true,compilationAdmitted:false,stock11Qualified:false});
}
