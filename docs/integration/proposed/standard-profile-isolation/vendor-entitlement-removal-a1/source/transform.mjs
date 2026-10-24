import fs from 'node:fs';
const changes=JSON.parse(fs.readFileSync(new URL('./anchors.json',import.meta.url),'utf8'));
export function transformAuxVendorEntitlementRemoval(text){
  for(const edit of changes){
    if(typeof text!=='string'||text.split(edit.find).length-1!==edit.count)throw new Error('Vendor entitlement source anchor changed');
    text=text.split(edit.find).join(edit.replace);
  }
  return {text,changes};
}
