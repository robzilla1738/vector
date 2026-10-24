export function askPaletteSections(context,query,sections) {
  if(!context?.success||!['commands','new-tab','navigate'].includes(context.mode)||
      typeof query!=='string'||!query.trim()||query.length>32768||
      !context.commands?.some(command=>command.id==='ask-aux'&&command.enabled))return sections;
  return [...sections,{id:'aux-ask-query',title:'Ask',items:[{
    id:'aux-ask-query',kind:'aux-ask-query',title:'Open Ask composer',
    subtitle:query,text:query,actionLabel:'Review'}]}];
}
export async function commitPaletteAsk(api,context,item) {
  if(!context?.success||typeof context.generation!=='string'||
      item?.kind!=='aux-ask-query'||typeof item.text!=='string'||!item.text.trim()||
      item.text.length>32768)throw Error('Ask context expired; reopen the command bar.');
  const result=await api.commitCommand({kind:'ask',generation:context.generation,text:item.text});
  if(!result?.success)throw Error(result?.error??'Could not open the Ask composer.');
  return result;
}
export function transformAuxPaletteAsk({relative,text}) {
  const anchors=[];
  if(relative!=='assets/tabsearch-3k_2hgil.js')return{text,anchors};
  const change=(find,replace,kind)=>{const count=text.split(find).length-1;if(count!==1)throw Error(`${kind}: expected one anchor, got ${count}`);anchors.push({kind,find,replace,count:1});text=text.replace(find,replace)};
  change('return [...result,...sections];','return askPaletteSections(context,query,[...result,...sections]);','aux-palette-explicit-ask-row');
  change('let auxNavSuccess=false;try{','let auxNavSuccess=false;try{if(n.kind==="aux-ask-query"){await commitPaletteAsk(chrome.auxBrowserPreferences,auxNavContext,n);auxNavSuccess=true;return}','aux-palette-explicit-ask-dispatch');
  const append='\n'+[askPaletteSections,commitPaletteAsk].map(fn=>fn.toString()).join('\n')+'\n';
  text+=append;anchors.push({kind:'aux-palette-ask-helpers',append,count:1});
  return{text,anchors};
}
