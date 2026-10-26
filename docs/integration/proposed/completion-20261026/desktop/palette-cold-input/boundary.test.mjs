import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createAuxPaletteInvocation} from '../palette-invocation/invocation-helper.mjs';
const text=fs.readFileSync(new URL('./source/assets/tabsearch-3k_2hgil.js',import.meta.url),'utf8');
const start=text.indexOf('(0,i.useLayoutEffect)(()=>{if(!auxNativeInput')+'(0,i.useLayoutEffect)('.length;
const callback=text.slice(start,text.indexOf(',[auxNativeInput,auxNavContext])',start));
function setup(composing=false){
 const invocation=createAuxPaletteInvocation();invocation.begin();let selected=null,focus=0,pendingInput,submitted=false,query='',context,requests=[];
 const native={active:true,revision:'2',text:'日本語 prefix',selectionStart:9,selectionEnd:3,composing};
 const scope={auxInputTransfer:{current:true},auxNativeInput:native,auxNavContext:{success:true,generation:'g'},auxInvocation:{current:invocation},T:{current:{focus(){focus++},setSelectionRange(...args){selected=args}}},chrome:{auxBrowserPreferences:{getCommandContext:request=>new Promise(resolve=>requests.push({request,resolve}))}},auxSetNativeInput:v=>pendingInput=v,t:v=>query=v,a(){},auxSetNativeSubmit:v=>submitted=v,auxNavSetContext:v=>context=v,auxNavSetError:e=>{throw Error(e)}};
 Function(...Object.keys(scope),'return ('+callback+')()')(...Object.values(scope));
 return {invocation,requests,get selected(){return selected},get focus(){return focus},get pending(){return pendingInput},get query(){return query},get submitted(){return submitted},get context(){return context}};
}
const composing=setup(true);assert.equal(composing.requests.length,0);assert.equal(composing.focus,0);
const changed=setup();assert.deepEqual(changed.selected,[3,9,'backward']);assert.deepEqual(changed.requests[0].request,{generation:'g',inputRevision:'2'});
changed.requests[0].resolve({success:true,generation:'g',nativeInput:{active:true,revision:'3',text:'日本語 prefix pasted',selectionStart:17,selectionEnd:17,composing:false}});await Promise.resolve();assert.equal(changed.query,'日本語 prefix pasted');assert.equal(changed.pending.revision,'3');assert(!changed.invocation.allows('g'));
const ready=setup();ready.requests[0].resolve({success:true,generation:'g',nativeInput:{active:false,accepted:true,submit:true}});await Promise.resolve();assert(ready.invocation.allows('g'));assert(ready.submitted);assert.equal(ready.pending,null);
const dismissed=setup();dismissed.invocation.invalidate();dismissed.requests[0].resolve({success:true,generation:'g',nativeInput:{active:false,accepted:true,submit:true}});await Promise.resolve();assert(!dismissed.submitted);assert(!dismissed.invocation.allows('g'));
console.log('PASS actual handoff effect: composition retained, reversed selection, changed revision, matching Enter, dismissed ack');
