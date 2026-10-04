import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {collectStockGraphEvidence} from './stock-graph-collector.mjs';
const hash=raw=>createHash('sha256').update(raw).digest('hex');
const art=value=>{const raw=JSON.stringify(value);return{raw,sha256:hash(raw)};};
const file=name=>{const raw=readFileSync(new URL(name,import.meta.url),'utf8');return{raw,sha256:hash(raw)};};
const inventory=file('../../../docs/lane-requests/l10/stock-graph-evidence/original-local-lfs-inventory.json');
const loaderSource=file('../../../docs/lane-requests/l10/stock-graph-collector/gpu_registry.cc');
const gpu='//third_party/litert/src/litert/runtime/accelerators/gpu_registry.cc';
const roots=['//chrome:chrome','//chrome/test:unit_tests','//chrome/test:browser_tests','//content/test:content_unittests'];
function specimen(){return{nodes:Object.fromEntries(roots.map(target=>[target,{deps:[],sources:[]} ])),capture:{producer:'stock-original-target-command-capture/v1',
 sourceRoot:'/Users/rcourson/aux-chromium-stock-measurement/chromium/src',buildDirectory:'/Users/rcourson/aux-chromium-stock-measurement/chromium/src/out/StockMemory',
 dynamicUndeclaredReads:false,unresolvedDynamicLoads:false,rows:roots.map(target=>({target,argv:[],commandSha256:hash('[]'),inputs:[],runtimeLoads:[]}))}};}
function collect(s,mutate=()=>{}){const a={inventory,loaderSource,graph:art(s.nodes),capturedCommands:art(s.capture),effectiveArgs:{raw:'use_litert_tflite = false\n',sha256:hash('use_litert_tflite = false\n')}};a.expected=Object.fromEntries(Object.entries(a).map(([key,v])=>[key,v.sha256]));mutate(a);return collectStockGraphEvidence(a);}
function gpuSpecimen(){const s=specimen();const target='//third_party/litert:gpu';s.nodes[roots[0]].deps=[target];s.nodes[target]={sources:[gpu]};
 const argv=['clang++','-DLITERT_DISABLE_GPU','-c',gpu],commandSha256=hash(JSON.stringify(argv));const raw='#define LITERT_DISABLE_GPU 1\n';
 s.capture.rows.push({target,argv,commandSha256,inputs:[gpu],runtimeLoads:[],effectiveMacros:{source:gpu,originalCommandSha256:commandSha256,exitCode:0,raw,rawSha256:hash(raw)}});return s;}
test('retains original raw GN source join; explicit mock candidate cannot authorize Stock',()=>{const s=specimen();const r=collect(s);assert.equal(r.originalGraphRaw,JSON.stringify(s.nodes));assert.equal(r.result.classifiedMissingObjects,23);assert.equal(r.requiresIndependentRootAudit,true);assert.equal(r.stock11Qualified,false);assert.equal(r.compilationAdmitted,false);});
test('actual installed pinned GPU source + original command/macro join supports disabled branch only',()=>{const r=collect(gpuSpecimen());const d=JSON.parse(r.evidence.loader.raw);assert.equal(d.sourceSha256,loaderSource.sha256);assert.equal(d.gpuBranches.length,1);assert.equal(d.gpuBranches[0].active,false);});
test('static/Metal labels and enabled arbitrary runtime directory never become false absence',()=>{const s=gpuSpecimen();const row=s.capture.rows.at(-1);row.argv=['clang++','-DLITERT_STATIC','-DLITERT_DISABLE_METAL_SUPPORT','-c',gpu];row.commandSha256=hash(JSON.stringify(row.argv));row.effectiveMacros.originalCommandSha256=row.commandSha256;row.effectiveMacros.raw='#define LITERT_STATIC 1\n#define LITERT_DISABLE_METAL_SUPPORT 1\n';row.effectiveMacros.rawSha256=hash(row.effectiveMacros.raw);assert.throws(()=>collect(s),/runtime-directory loader/);});
test('unadmitted/changed raw source, missing macro producer, source/command substitution and late failed macro capture refuse',()=>{
 assert.throws(()=>collect(specimen(),a=>a.loaderSource={...a.loaderSource,raw:a.loaderSource.raw+' '}));
 for(const change of [row=>delete row.effectiveMacros,row=>row.effectiveMacros.source='//foreign.cc',row=>row.effectiveMacros.originalCommandSha256='a'.repeat(64),row=>row.effectiveMacros.exitCode=1]){const s=gpuSpecimen();change(s.capture.rows.at(-1));assert.throws(()=>collect(s));}
});
test('relative GN inputs resolve only exact original Stock tree; foreign and ambiguous target mappings refuse',()=>{const s=specimen();s.nodes[roots[0]].sources=['../../chrome/example.cc'];s.capture.rows[0].inputs=['../../chrome/example.cc'];const r=collect(s);assert.deepEqual(JSON.parse(r.evidence.graph.raw)[roots[0]].sources,['//chrome/example.cc']);s.capture.rows[0].inputs=['../../../../foreign.cc'];assert.throws(()=>collect(s),/Foreign/);const d=specimen();d.capture.rows.push({...d.capture.rows[0]});assert.throws(()=>collect(d),/Ambiguous/);});
test('missing transitive/actions/declared source or runtime23/macOS inputs, unknown effective args and unresolved loads refuse',()=>{
 for(const change of [s=>s.nodes[roots[0]].data_deps=['//missing:target'],s=>s.capture.rows.pop(),s=>s.nodes[roots[0]].sources=['//missing.cc'],s=>s.capture.unresolvedDynamicLoads=true,s=>s.capture.rows[0].runtimeLoads=['//third_party/litert/src/litert/prebuilt/macos_arm64/libLiteRtMetalAccelerator.dylib']]){const s=specimen();change(s);assert.throws(()=>collect(s));}
 assert.throws(()=>collect(specimen(),a=>{a.effectiveArgs=art({defaultUseLitertTflite:false});a.expected.effectiveArgs=a.effectiveArgs.sha256;}),/effective GN/);
});
