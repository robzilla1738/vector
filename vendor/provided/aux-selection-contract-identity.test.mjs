import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import test from 'node:test';
import {applyAuxSelectionContractIdentity} from './aux-selection-contract-identity.mjs';
import {applyAuxCaptureContractIdentity} from './aux-capture-contract-identity.mjs';
import {transformProvidedNativeUi} from './native-ui-compat.mjs';
const base='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent';
const paths=['content/content.js','background.js'];
const originals=Object.fromEntries(paths.map(p=>[p,readFileSync(base+'/'+p,'utf8')]));
const predecessor=path=>applyAuxCaptureContractIdentity({component:'agent',path,text:transformProvidedNativeUi({component:'agent',path,text:originals[path]}).text,original:originals[path]}).text;
const results=Object.fromEntries(paths.map(path=>[path,applyAuxSelectionContractIdentity({component:'agent',path,text:predecessor(path),original:originals[path]})]));
const content=results['content/content.js'].text;
test('actual shared constructor covers every inventoried suffix and own-surface exclusion recognizes Aux',()=>{
 const expression=content.match(/document\.createElement\(`aux-\$\{e\}`\)/)?.[0];assert.ok(expression);
 for(const suffix of ['capture-backdrop','capture-shrink','capture-toolbar','capture-result','capture-anchor','selection-handle','selection-popup','translate-status'])assert.equal(runInNewContext(expression,{e:suffix,document:{createElement:t=>t}}),'aux-'+suffix);
 const af=content.match(/function Af\(e\)\{[^}]+\}/)?.[0],pm=content.match(/function pm\(e\)\{[^}]+\}/)?.[0];assert.ok(af&&pm);
 const capture=runInNewContext('('+af+')',{Pf:'aux-capture-toolbar'}),selection=runInNewContext('('+pm+')');
 for(const name of ['aux-capture-toolbar','aux-selection-handle','aux-selection-popup']){const el={tagName:name,closest:()=>null};assert.equal(selection(el),true);if(name.includes('capture'))assert.equal(capture(el),true)}
 assert.equal(selection({tagName:'aside',closest:()=>null}),false);
});
test('actual selection producers, related selectors, completion event and translation menu reader/writers pair',()=>{
 assert.equal(content.includes('aside-selection-'),false);assert.equal(content.includes('aside:react-grab:complete:'),false);
 for(const suffix of ['highlight','lasso','guard','react-grab-bootstrap','react-grab-response'])assert.ok(content.includes('aux-selection-'+suffix));
 assert.ok(content.includes('aux-translate-order'));
 const background=results['background.js'].text;
 for(const id of ['aux-translate-selection','aux-translate-page'])assert.equal(background.split(id).length-1,2);
 // Existing identity adapter pairs the react-grab target field without changing this helper's scope.
 assert.ok(content.includes('data-aux-react-grab-target'));const bridge=transformProvidedNativeUi({component:'agent',path:'react-grab-bridge.js',text:readFileSync(base+'/react-grab-bridge.js','utf8')}).text;assert.ok(bridge.includes('data-aux-react-grab-target'));
});
test('all actual injected style bodies remain exact and changes replay only reviewed identities',()=>{
 const styles=text=>[...text.matchAll(/(?:textContent|cssText)=`([^`]+)`/g)].map(m=>m[1]);
 assert.deepEqual(styles(content),styles(predecessor('content/content.js')));
 for(const path of paths){let replay=predecessor(path);for(const a of results[path].anchors){assert.equal(replay.split(a.find).length-1,a.count);replay=replay.split(a.find).join(a.replace)}assert.equal(replay,results[path].text)}
});
test('missing capture predecessor, mixed generation, source drift and source mismatch fail closed',()=>{
 const original=originals['content/content.js'],opts={component:'agent',path:'content/content.js',original};
 assert.throws(()=>applyAuxSelectionContractIdentity({...opts,text:original}),/predecessor/);
 assert.throws(()=>applyAuxSelectionContractIdentity({...opts,text:content}),/Mixed or repeated/);
 assert.throws(()=>applyAuxSelectionContractIdentity({...opts,text:predecessor(opts.path).replace('aside-selection-guard','missing')}),/drift/);
 assert.throws(()=>applyAuxSelectionContractIdentity({...opts,text:predecessor(opts.path),original:original+' '}),/pin mismatch/);
});
