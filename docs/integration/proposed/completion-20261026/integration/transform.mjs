import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { bindCloudRequestAccount } from '../../../../../vendor/provided/cloud-transfer-binding.mjs';

const anchors = JSON.parse(readFileSync(new URL('./anchors.json', import.meta.url), 'utf8'));
const pins = JSON.parse(readFileSync(new URL('./pins.json', import.meta.url), 'utf8'));
const sha256 = text => createHash('sha256').update(text).digest('hex');

export function upgradeCloudTransfers(input) {
  const inputSha256 = sha256(input);
  const pin = pins.find(item => item.inputSha256 === inputSha256);
  if (!pin) throw Error('Cloud transfer binding requires an exact A51 source input.');
  let text = input;
  for (const anchor of anchors) {
    if (text.split(anchor.find).length !== 2) throw Error(`Cloud transfer anchor changed: ${anchor.kind}`);
    text = text.replace(anchor.find, () => anchor.replace);
  }
  const bound = bindCloudRequestAccount(text);
  const outputSha256 = sha256(bound.text);
  if (outputSha256 !== pin.outputSha256) throw Error('Cloud transfer output hash does not match reviewed bytes.');
  return { text: bound.text, inputSha256, outputSha256, changes: [...anchors, ...bound.anchors] };
}
