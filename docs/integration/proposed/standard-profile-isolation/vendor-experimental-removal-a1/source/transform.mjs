import fs from 'node:fs';
const changes=JSON.parse(fs.readFileSync(new URL('./anchors.json',import.meta.url),'utf8'));
export function transformAuxVendorExperimentalRemoval(text){
 for(const edit of changes){if(text.split(edit.find).length-1!==edit.count)throw Error('Experimental source anchor changed');text=text.split(edit.find).join(edit.replace);}
 return {text,changes};
}
