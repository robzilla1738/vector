import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const changes = JSON.parse(readFileSync(new URL('./changes.json', import.meta.url), 'utf8'));
const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
const sha = value => createHash('sha256').update(value).digest('hex');
export function transformAuxDaemonShutdown(text) {
  const input = manifest.daemonInputs.find(value => value.inputSha256 === sha(text));
  if (!input) throw Error('Unreviewed daemon-shutdown source');
  for (const {find, replace, count} of changes) {
    if (count !== 1 || text.split(find).length !== 2) throw Error('Daemon-shutdown anchor mismatch');
    text = text.replace(find, () => replace);
  }
  if (sha(text) !== input.outputSha256) throw Error('Daemon-shutdown output mismatch');
  return {text, changes: changes.map(({find, replace, count}) => ({find, replace, count}))};
}
