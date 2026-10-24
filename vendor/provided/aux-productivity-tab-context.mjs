// Capabilities are opaque native document identities, never renderer-selected
// profile identifiers. A restored draft is deliberately not silently rebound.
export async function captureTabCandidates(api,candidates) {
  const tabs=candidates.filter(item=>item.type==='tab');
  if(!tabs.length)return candidates;
  if(tabs.length>64||typeof api?.captureTabReferences!=='function')throw Error('Tab context is unavailable.');
  const result=await api.captureTabReferences({references:tabs.map(({targetId,url})=>({targetId,url}))});
  if(!result?.success||!Array.isArray(result.references)||result.references.length!==tabs.length)
    throw Error(result?.error??'Could not capture the selected tabs.');
  let index=0;
  return candidates.map(item=>{
    if(item.type!=='tab')return item;
    const ref=result.references[index++];
    if(ref.targetId!==item.targetId||ref.url!==item.url||typeof ref.documentCapability!=='string'||!ref.documentCapability)
      throw Error('Tab context changed. Select the tab again.');
    return {...item,documentCapability:ref.documentCapability};
  });
}
export async function validateTabAttachments(api,attachments) {
  const references=attachments.filter(item=>item.type==='tab').map(({targetId,url,documentCapability})=>({targetId,url,documentCapability}));
  if(!references.length)return;
  if(references.length>64||references.some(ref=>!ref.documentCapability))throw Error('Select referenced tabs again before sending; your draft is preserved.');
  if(typeof api?.validateTabReferences!=='function')throw Error('Tab context validation is unavailable.');
  const result=await api.validateTabReferences({references});
  if(!result?.success)throw Error(result?.error??'A referenced tab changed; select it again before sending.');
}
function replace(text,find,replacement,anchors,kind) {
  const count=text.split(find).length-1;
  if(count!==1)throw Error(`${kind}: expected one pinned anchor, got ${count}`);
  anchors.push({kind,find,replace:replacement,count:1});return text.replace(find,replacement);
}
export function transformAuxTabContext({relative,text}) {
  const anchors=[];const change=(find,next,kind)=>{text=replace(text,find,next,anchors,kind)};
  if(relative==='assets/provider-Cw0zhujt.js') {
    change('command:({editor:d,range:f,props:h})=>{const g=',
      'command:async({editor:d,range:f,props:h})=>{const auxSelectionState=d.state;try{const g=','aux-tab-context-selection-async');
    change('C=h.type==="tab-group"?h.tabs.map(A=>({...A,type:"tab"})):[h];d.chain()',
      'auxCandidates=h.type==="tab-group"?h.tabs.map(A=>({...A,type:"tab"})):[h],C=await captureTabCandidates(chrome.auxBrowserPreferences,auxCandidates);if(d.isDestroyed||d.state!==auxSelectionState)throw Error("Composer changed; select the tab again.");d.chain()','aux-tab-context-selection-capture');
    change('getSelection()?.collapseToEnd()},allow:',
      'getSelection()?.collapseToEnd()}catch(error){Ce.error(error instanceof Error?error.message:"Could not attach tab context.")}},allow:','aux-tab-context-selection-error');
    text+=`\n${captureTabCandidates.toString()}\n`;
    anchors.push({kind:'aux-tab-context-selection-helper',append:captureTabCandidates.toString(),count:1});
  }
  if(relative==='assets/create-editor-B-Br5Wz9.js') {
    change('source:"",targetId:"",type:"tab",url:""','source:"",targetId:"",documentCapability:"",type:"tab",url:""','aux-tab-context-editor-attribute');
  }
  if(relative==='assets/utils-Cl9zfMcr.js') {
    change('{...i,type:"tab",url:p,targetId:l}',
      '{...i,type:"tab",url:p,targetId:l,documentCapability:c(t,"documentCapability")}','aux-tab-context-parse');
    change('targetId:t.targetId,faviconUrl:t.icon}',
      'targetId:t.targetId,documentCapability:t.documentCapability,faviconUrl:t.icon}','aux-tab-context-attachment');
    change('source:t.source,targetId:t.targetId,type:"tab",url:t.url}',
      'source:t.source,targetId:t.targetId,documentCapability:t.documentCapability??"",type:"tab",url:t.url}','aux-tab-context-mention-node');
  }
  if(relative==='assets/browser-binding-CzDmxQNA.js') {
    change('const n=o?.id?{id:`tab:${o.id}`,type:"tab",url:r,name:i,targetId:o.id,faviconUrl:e.favIconUrl||void 0}:null;',
      'let n=o?.id?{id:`tab:${o.id}`,type:"tab",url:r,name:i,targetId:o.id,faviconUrl:e.favIconUrl||void 0}:null;if(n){try{[n]=await captureTabCandidates(chrome.auxBrowserPreferences,[n])}catch{n={...n,documentCapability:""}}}',
      'aux-tab-context-current-tab-capture');
    text+=`\n${captureTabCandidates.toString()}\n`;
    anchors.push({kind:'aux-tab-context-current-tab-helper',append:captureTabCandidates.toString(),count:1});
  }
  if(relative==='assets/permission-approval-D-GTf91U.js') {
    change('const Be=An(d,ne),H=s?await s(Be):Be;if(!(c.whileResponding',
      'try{await validateTabAttachments(chrome.auxBrowserPreferences,ne)}catch(error){se.error(error instanceof Error?error.message:"Tab context is unavailable.");return}const Be=An(d,ne),H=s?await s(Be):Be;if(!(c.whileResponding','aux-tab-context-submit-validation');
    change('&&!await I(H))){if(ae.current)',
      '&&!await I(H))){try{await validateTabAttachments(chrome.auxBrowserPreferences,ne)}catch(error){se.error(error instanceof Error?error.message:"Tab context changed.");return}if(ae.current)','aux-tab-context-post-confirmation-validation');
    text+=`\n${validateTabAttachments.toString()}\n`;
    anchors.push({kind:'aux-tab-context-submit-helper',append:validateTabAttachments.toString(),count:1});
  }
  return {text,anchors};
}
