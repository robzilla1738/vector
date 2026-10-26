import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { auxEventPollState, auxStopEventPolling, auxRunEventRefresh, auxCreateEventPollClientClass } from './aux-event-poll-client.mjs';

const pins = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/integration/events/source-pins.json', import.meta.url), 'utf8'));
export function transformAuxEventPolling({ text, source = text }) {
  if (typeof source !== 'string' || !pins.inputSha256.includes(createHash('sha256').update(source).digest('hex')))
    throw Error('Aux event polling requires a pinned current daemon source.');
  if (typeof text !== 'string' || text.includes('function auxEventPollState(')) throw Error('Unknown or repeated Aux event polling source.');
  for (const rule of pins.rules) if (text.split(rule.find).length - 1 !== rule.count || source.split(rule.find).length - 1 !== rule.count)
    throw Error(`Aux event polling source drift: ${rule.scope}`);
  const anchors = [];
  for (const rule of pins.rules) { text = text.replace(rule.find, () => rule.replace); anchors.push({ ...rule, kind: 'integration' }); }
  const append = '\n' + [auxEventPollState, auxStopEventPolling, auxRunEventRefresh, auxCreateEventPollClientClass].map(fn => fn.toString()).join('\n') + '\n';
  return { text: text + append, anchors: [...anchors, { kind: 'integration', scope: 'finite Aux event polling helpers', append, count: 1 }] };
}
