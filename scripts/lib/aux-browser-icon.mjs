/** Reviewed canonical-logo replacement, separate from byte-preserved illustration paths. */
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const auxBrowserIconReceiptPath='docs/integration/proposed/aux-browser-icon/replacement-receipt.json';
export const auxBrowserIconReceiptSha256='cd9db49cd76aa81ff405c8145fb03705173a65f73b17d2db41fd81786670d16e';
export const auxBrowserIconSource='vendor/provided-ui/branding/aux-browser-icon.webp';
export async function loadAuxBrowserIconReplacement(){
 const [receiptBytes,sourceBytes,bytes,png,inventoryBytes]=await Promise.all([auxBrowserIconReceiptPath,'assets/brand/arch-mark.svg',auxBrowserIconSource,'assets/brand/Aux.iconset/icon_512x512.png','assets/brand/inventory.json'].map(path=>readFile(new URL(path,root))));
 if(sha(receiptBytes)!==auxBrowserIconReceiptSha256)throw Error('Canonical browser icon review changed');
 const receipt=JSON.parse(receiptBytes),inventory=JSON.parse(inventoryBytes),pngPin=inventory.outputs.find(file=>file.path==='assets/brand/Aux.iconset/icon_512x512.png');
 if(receipt.kind!=='aux-reviewed-asset-replacement'||receipt.path!=='assets/aside-CeBDTZrg.webp'||sha(sourceBytes)!=='45ba4f1d823cab3085cad8902fd17420ff5a9a5ac3139b180bfc0902875f515c'||sha(sourceBytes)!==receipt.source.sha256||sha(bytes)!==receipt.output.sha256||bytes.length!==receipt.output.bytes||sha(png)!==receipt.derivation.sourcePngSha256||sha(png)!==pngPin?.sha256||png.readUInt32BE(16)!==512||png.readUInt32BE(20)!==512||receipt.derivation.decodedPixelsEqual!==true)throw Error('Canonical Aux browser icon derivation pin mismatch');
 return {bytes,receipt,receiptBytes,receiptSha256:auxBrowserIconReceiptSha256,sourceBytes,repositorySource:auxBrowserIconSource};
}
