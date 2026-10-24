import {readFileSync} from 'node:fs';
const helper=readFileSync(new URL('./research-ui.js',import.meta.url),'utf8');
export function transformAuxResearchUi(text,file){
 const changes=[];
 if(file.endsWith('assets/session-composer-Dc0LRfZA.js')){
  changes.push({find:'N.current=!0;try{const[$,oe]=await Promise.all([c?.(D)??{},cl()]),Be=',replace:'N.current=!0;try{const auxResearch=auxReadResearchIntent(n,l,X,t);const[$,oe]=await Promise.all([c?.(D)??{},cl()]);auxAssertResearchIntent(auxResearch,$.browserBinding??oe);const Be=',count:1});
  changes.push({find:'Be={...$,projectId:U,browserBinding:$.browserBinding??oe,model:X,',replace:'Be={...$,...auxResearch?{research:{kind:"web-search",query:auxResearch.query}}:{},projectId:U,browserBinding:$.browserBinding??oe,model:X,',count:1});
  const suffix=text.slice(-160);changes.push({find:suffix,replace:suffix+'\n'+helper+'\n',count:1});
 }else if(file.endsWith('assets/ask-omnibox-panel-DkxXbN8c.js')){
  changes.push({find:'import{AuxUnavailableNewTabControls,A as P,',replace:'import{AuxResearchControl,AuxUnavailableNewTabControls,A as P,',count:1});
  changes.push({find:'(0,e.jsx)(R,{size:"sm"}),(0,e.jsx)(D,{})',replace:'(0,e.jsx)(R,{size:"sm"}),(0,e.jsx)(D,{}),(0,e.jsx)(AuxResearchControl,{})',count:1});
 }
 for(const change of changes){if(text.split(change.find).length-1!==1)throw Error('Research UI source anchor drift: '+file);text=text.replace(change.find,change.replace)}
 return {text,changes};
}
