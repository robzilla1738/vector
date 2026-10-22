// Reviewed inactive macOS-only source exclusion. Never renames old ciphertext.
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const root=new URL('../../../../../',import.meta.url);
const pin=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url))),hash=x=>createHash('sha256').update(x).digest('hex');
export function excludeLegacyMacCrypto({original,composed}){
 if(hash(original)!==pin.originalSha256||hash(composed)!==pin.preparedInputSha256)throw Error('Exact coordinated purpose successor required');
 for(const dependency of pin.dependencies)if(hash(readFileSync(new URL(dependency.path,root)))!==dependency.sha256)throw Error('Crypto exclusion dependency drift');
 let code=composed;
 for(const edit of pin.edits){if(code.split(edit.find).length-1!==edit.count)throw Error('Crypto exclusion anchor drift: '+edit.name);code=code.split(edit.find).join(edit.replace);}
 for(const domain of pin.forbiddenDomains)if(code.includes(domain))throw Error('Residual original crypto domain');
 code='if(process.platform!==`darwin`)throw Error(`This Aux cryptographic runtime supports macOS only`);\n'+code;
 return {code,sha256:hash(code),activation:false,platform:'darwin',format:'aux.macos.crypto-exclusion.v1'};
}
