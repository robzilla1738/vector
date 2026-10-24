import fs from 'node:fs';
const anchors=JSON.parse(fs.readFileSync(new URL('./anchors.json',import.meta.url),'utf8'));
const helper=fs.readFileSync(new URL('./chatgpt-lifetimes.js',import.meta.url),'utf8');
export function transformAuxChatGPTLogin(input) {
  let text=input;const changes=[];
  const apply=edit=>{if(text.split(edit.find).length!==2||edit.count!==1)throw Error('ChatGPT lifetime source anchor differs');text=text.replace(edit.find,edit.replace);changes.push(edit);};
  for(const edit of anchors)apply(edit);
  const marker='function auxCreateInteractiveOAuth({boundary, isClosing, isCandidate, isReviewed, createTransport, context}) {';
  apply({find:marker,replace:helper+'\n'+marker,count:1});
  return {text,changes};
}
export function transformAuxChatGPTShim(input) {
  let text=input;const changes=JSON.parse(fs.readFileSync(new URL('./shim-anchors.json',import.meta.url),'utf8'));
  for(const edit of changes){if(text.split(edit.find).length!==2||edit.count!==1)throw Error('ChatGPT shim anchor differs');text=text.replace(edit.find,edit.replace);}
  if(text!==fs.readFileSync(new URL('./aux-chatgpt.cjs',import.meta.url),'utf8'))throw Error('Reviewed ChatGPT shim differs');
  return {text,changes};
}
