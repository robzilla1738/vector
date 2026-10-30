// Hermetic: the command bar's local math and unit answers.
import assert from 'node:assert/strict';
import test from 'node:test';
import {auxAnswerSections, auxQuickAnswer} from './aux-quick-answer.js';

const value = query => auxQuickAnswer(query)?.text;

test('arithmetic follows precedence, parentheses, powers and percents', () => {
  for (const [query, answer] of [['2+2', '4'], ['2 + 3 * 4', '14'], ['(2+3)*4', '20'], ['2^10', '1024'], ['2^3^2', '512'], ['10/4', '2.5'], ['-5 + 3', '-2'], ['1,000 * 3', '3000'],
    ['20% of 150', '30'], ['100 + 10%', '110'], ['200 - 25%', '150'], ['50%*10', '5'], ['6 × 7', '42'], ['9 ÷ 3', '3'], ['sqrt(16)', '4'], ['.5 * 2', '1'], ['0.1 + 0.2', '0.3']])
    assert.equal(value(query), answer, query);
});

test('anything that isn’t a sum gets no answer', () => {
  for (const query of ['', 'hello', '42', '1.5', '2026-10-30', '555-1234', '1.2.3', 'google.com', 'a/b', '1/0', '(1+2', 'what is 2+2', '2 +', 'process.exit()', 'sqrt 4'])
    assert.equal(auxQuickAnswer(query), null, query);
});

test('units convert within a kind, and read with their units', () => {
  for (const [query, title] of [['5 km to mi', '3.106856 mi'], ['3 feet in inches', '36 in'], ['2 lb to kg', '0.907185 kg'], ['1 cup to ml', '236.588237 ml'], ['90 min to h', '1.5 h'],
    ['1.5 GB to MB', '1,500 MB'], ['1 GiB to MiB', '1,024 MiB'], ['30 mph to km/h', '48.28032 km/h'], ['100 c in f', '212 °F'], ['32 °f to c', '0 °C'], ['0 c to k', '273.15 K'], ['10 fl oz to ml', '295.735296 ml']])
    assert.equal(auxQuickAnswer(query).title, title, query);
  for (const query of ['5 km to kg', '5 apples to pears', 'km to mi', '5 km'])
    assert.equal(auxQuickAnswer(query), null, query);
});

test('the answer heads the sections with a Copy row; nothing changes without one', () => {
  const sections = [{id: 'tabs', items: []}];
  const [answer, ...rest] = auxAnswerSections('6 * 7', sections);
  assert.deepEqual(answer, {id: 'aux-answer', title: 'Answer', items: [{id: 'aux-answer', kind: 'aux-answer', actionLabel: 'Copy', text: '42', title: '42', subtitle: '6 * 7'}]});
  assert.deepEqual(rest, sections);
  assert.equal(auxAnswerSections('hello', sections), sections);
});
