import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {basename} from 'node:path';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/desktop/product-information/source-pins.json',import.meta.url),'utf8'));
export function transformAuxProductInformationLinks({path,text,source}) {
  const pin=pins.files.find(file=>file.name===basename(path));
  if(!pin)return {text,anchors:[]};
  if(typeof text!=='string'||typeof source!=='string'||createHash('sha256').update(source).digest('hex')!==pin.inputSha256)
    throw Error('Product information links require the exact original A38 UI source separately from accumulated text.');
  const anchors=[];
  for(const rule of pin.anchors){
    if(source.split(rule.before).length-1!==rule.count||text.split(rule.before).length-1!==rule.count)
      throw Error(`Product information link drift: ${pin.name} ${rule.before}`);
    text=text.replace(rule.before,()=>rule.after);
    anchors.push({kind:'integration',scope:'public product information route',find:rule.before,replace:rule.after,count:rule.count});
  }
  return {text,anchors};
}
