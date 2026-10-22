/** Bounded external-migration JSON parser. No traversal-based mutation. */
export function parseAuxIdentityJsonTokens(text){
 if(typeof text!=='string'||Buffer.byteLength(text)>2*1024*1024)throw Error('Bounded identity JSON text required');
 const parsed=JSON.parse(text);let i=0,nodes=0;
 const ws=()=>{while(/[\x20\t\r\n]/.test(text[i]??'!'))i++};
 function string(){const start=i++;while(i<text.length){const c=text[i++];if(c==='"')return {start,end:i,value:JSON.parse(text.slice(start,i))};if(c==='\\')i++}throw Error('Unterminated JSON string')}
 function value(depth){
  if(depth>64||++nodes>100000)throw Error('Identity JSON complexity bound exceeded');ws();const start=i,c=text[i];
  if(c==='"')return string();
  let fields,items;
  if(c==='{'){i++;ws();fields=new Map();if(text[i]!=='}')for(;;){ws();const key=string().value;if(fields.has(key))throw Error('Duplicate JSON key');ws();if(text[i++]!==':')throw Error('Invalid JSON object');fields.set(key,value(depth+1));ws();if(text[i]!==',')break;i++}if(text[i++]!=='}')throw Error('Invalid JSON object');}
  else if(c==='['){i++;ws();items=[];if(text[i]!==']')for(;;){items.push(value(depth+1));ws();if(text[i]!==',')break;i++}if(text[i++]!==']')throw Error('Invalid JSON array');}
  else {while(i<text.length&&!/[\x20\t\r\n,}\]]/.test(text[i]))i++;if(i===start)throw Error('Invalid JSON value');}
  return {start,end:i,...fields?{fields}:{},...items?{items}:{}};
 }
 const root=value(0);ws();if(i!==text.length)throw Error('Trailing JSON bytes');return {value:parsed,root};
}
export function replaceAuxIdentityJsonStringToken({text,output,token,replacement,offset=0}){
 if(typeof token?.value!=='string'||typeof replacement!=='string')throw Error('Exact string token required');
 const start=offset+Buffer.byteLength(text.slice(0,token.start)),end=offset+Buffer.byteLength(text.slice(0,token.end)),encoded=Buffer.from(JSON.stringify(replacement));
 if(start<offset||end>output.length||encoded.length>end-start)throw Error('Identity token cannot preserve offsets');
 output.fill(32,start,end);encoded.copy(output,start);return {start,end};
}
