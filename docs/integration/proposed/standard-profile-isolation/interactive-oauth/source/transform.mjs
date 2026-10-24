import {readFileSync} from 'node:fs';
const helper=readFileSync(new URL('./interactive-oauth.js',import.meta.url),'utf8');
const anchors=JSON.parse(readFileSync(new URL('./anchors.json',import.meta.url),'utf8'));
export function transformAuxInteractiveOAuth(input) {
  const changes=anchors.map(change=>({...change,replace:change.replace.replace('/* AUX_INTERACTIVE_OAUTH_HELPER */',()=>helper)}));
  let text=input;
  for(const change of changes) {
    if(text.split(change.find).length-1!==change.count)throw Error(`Interactive OAuth anchor count mismatch: ${change.find.slice(0,100)}`);
    text=text.replace(change.find,()=>change.replace);
  }
  return {text,changes};
}
