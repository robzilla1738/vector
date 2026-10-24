export function mediaSections(context,query,sections) {
 if(context?.mode!=='commands'||!context.pictureInPicture?.available||
    (query.trim()&&!/picture|video|pip/i.test(query)))return sections;
 return [{id:'aux-media',title:'Media',items:[{id:'aux-pip',kind:'aux-pip',title:context.pictureInPicture.active?'Return video to tab':'Picture in picture',actionLabel:'Run'}]},...sections];
}
export function transformAuxMediaUi({relative,text}) {
 const anchors=[];if(relative!=='assets/tabsearch-3k_2hgil.js')return{text,anchors};
 const change=(find,next,kind)=>{const count=text.split(find).length-1;if(count!==1)throw Error(`${kind}: expected one anchor, got ${count}`);anchors.push({find,replace:next,kind,count:1});text=text.replace(find,next)};
 change('function Qe(){const[auxFileState,',`${mediaSections.toString()}\nfunction Qe(){const[auxFileState,`,'aux-media-context-row');
 change('navigationSections(auxNavContext,r,Pe($,r)))','mediaSections(auxNavContext,r,navigationSections(auxNavContext,r,Pe($,r))))','aux-media-section-composition');
 change('let auxNavSuccess=false;try{if(n.kind?.startsWith("aux-file"))',
  'let auxNavSuccess=false;try{if(n.kind==="aux-pip"){const result=await chrome.auxBrowserPreferences.togglePictureInPicture({generation:auxNavContext.generation});if(!result.success)throw Error(result.error);auxNavSuccess=true;return}if(n.kind?.startsWith("aux-file"))','aux-media-native-action');
 return{text,anchors};
}
