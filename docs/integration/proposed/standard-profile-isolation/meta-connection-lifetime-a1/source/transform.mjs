import fs from 'node:fs';
const anchors=JSON.parse(fs.readFileSync(new URL('./anchors.json',import.meta.url),'utf8'));
const lifetime=fs.readFileSync(new URL('./owned-cdp-lifetime.js',import.meta.url),'utf8');
const window=fs.readFileSync(new URL('./oauth-window.js',import.meta.url),'utf8');
export function transformAuxMetaConnectionLifetime(input) {
  const changes=anchors.map(edit=>({...edit,replace:edit.replace.replace('/* AUX_OWNED_CDP_LIFETIME */',()=>lifetime).replace('/* AUX_OWNED_OAUTH_WINDOW */',()=>window)}));
  let text=input;
  for(const edit of changes){if(edit.count!==1||text.split(edit.find).length!==2)throw Error('Meta owned connection anchor differs');text=text.replace(edit.find,()=>edit.replace);}
  return {text,changes};
}
