import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {SourceTextModule} from 'node:vm';
import {pathToFileURL} from 'node:url';
import {createAuxThemeSession,parseAuxThemeImport,transformAuxThemeEditor,THEME_APPEARANCE_ASSET} from './aux-theme-editor.mjs';

const root=process.env.AUX_SUPPLIED_SOURCE_ROOT??'/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent';
const source=await readFile(`${root}/${THEME_APPEARANCE_ASSET}`,'utf8');
const navigation=await import(process.env.AUX_NAVIGATION_ADAPTER?pathToFileURL(process.env.AUX_NAVIGATION_ADAPTER):new URL('./aux-navigation-command-bar.mjs',import.meta.url));

test('the supplied Appearance extension composes after navigation and rejects anchor drift',()=>{
  const upstream=navigation.transformAuxNavigation({relative:THEME_APPEARANCE_ASSET,text:source});
  const result=transformAuxThemeEditor({relative:THEME_APPEARANCE_ASSET,text:upstream.text});
  assert.equal(result.anchors.length,2);
  assert.equal(createHash('sha256').update(source).digest('hex'), '5d6795dc6c007d961e8960cc41e6825634be81da00d023e179647bc22e20f318');
  new SourceTextModule(result.text);
  assert.ok(result.text.includes('(0,e.jsx)(AuxFullUrlSetting,{}),(0,e.jsx)(AuxThemeEditorSetting,{})'));
  assert.throws(()=>transformAuxThemeEditor({relative:THEME_APPEARANCE_ASSET,text:source}),/pinned anchor/);
  assert.throws(()=>transformAuxThemeEditor({relative:THEME_APPEARANCE_ASSET,text:result.text}),/pinned anchor/);
});

test('closing waits for a pending native preview, then cancels; queued mutations cannot reapply',async()=>{
  const calls=[],states=[],errors=[];
  let resolvePreview;
  const api={getThemeState:async()=>({success:true,revision:'r1',tokens:{version:1}}),
    previewTheme:async input=>{calls.push(['preview',input]);return await new Promise(resolve=>resolvePreview=resolve)},
    applyTheme:async input=>{calls.push(['apply',input]);return {success:true,revision:'r2'}},
    cancelTheme:async()=>{calls.push(['cancel']);return {success:true,revision:'r1'}}};
  const client=createAuxThemeSession(api,state=>states.push(state),error=>errors.push(error));
  await client.load();
  const pending=client.run('previewTheme',{tokens:{version:1,material:'clear'}});
  await new Promise(resolve=>setImmediate(resolve));
  const queued=client.run('applyTheme',{tokens:{version:1}}),closing=client.close();
  assert.equal(calls.length,1);
  resolvePreview({success:true,revision:'r1'});
  await Promise.all([pending,queued,closing]);
  assert.deepEqual(calls.map(call=>call[0]),['preview','cancel']);
  assert.equal(states.length,1); assert.deepEqual(errors,[]);
});

test('native revision is consumed serially and rejected changes never become client state',async()=>{
  const requests=[],errors=[];
  const client=createAuxThemeSession({
    getThemeState:async()=>({success:true,revision:'r1'}),
    saveThemePreset:async input=>{requests.push(input);return {success:true,revision:'r2'}},
    previewTheme:async input=>{requests.push(input);return {success:false,error:'Another window is previewing'}},
    applyTheme:async input=>{requests.push(input);return {success:true,revision:'r3'}},
  },()=>{},error=>errors.push(error));
  await client.load();
  await client.run('saveThemePreset',{name:'One',tokens:{version:1}});
  await assert.rejects(client.run('previewTheme',{tokens:{version:1}}),/Another window/);
  await client.run('applyTheme',{tokens:{version:1}});
  assert.deepEqual(requests.map(input=>input.revision),['r1','r2','r2']);
  assert.deepEqual(errors,['Another window is previewing']);
});

test('preset file parsing limits input and accepts only the versioned local envelope',()=>{
  const tokens={version:1,background:'#26323C',material:'soft'};
  assert.deepEqual(parseAuxThemeImport(JSON.stringify({format:'aux-theme',version:1,tokens})),tokens);
  for(const text of ['null','[]','{}',JSON.stringify({format:'aux-theme',version:2,tokens}),
    JSON.stringify({format:'aux-theme',version:1,tokens,script:'alert(1)'}),' '.repeat(4097)])
    assert.throws(()=>parseAuxThemeImport(text));
});
