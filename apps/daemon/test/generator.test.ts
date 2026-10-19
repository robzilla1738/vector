import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  generatePassword,
  generatorOptions,
} from '../src/passwords/generator.js';
import { passphraseWords } from '../src/passwords/wordlist.js';

test('password generator enforces configured groups, minimums and invalid option boundaries', async () => {
  const { password } = await generatePassword(generatorOptions.parse({}));
  assert.equal(password.length, 20);
  assert.match(password, /[a-z]/);
  assert.match(password, /[A-Z]/);
  assert.match(password, /[2-9]/);
  assert.match(password, /[^A-Za-z0-9]/);
  assert.doesNotMatch(password, /[Il1O0o]/);
  const numeric = await generatePassword(
    generatorOptions.parse({
      length: 8,
      lowercase: false,
      uppercase: false,
      symbols: false,
      minimumDigits: 8,
    }),
  );
  assert.match(numeric.password, /^[2-9]{8}$/);
  assert.throws(() => generatorOptions.parse({ length: 65 }));
  assert.throws(() =>
    generatorOptions.parse({
      lowercase: false,
      uppercase: false,
      digits: false,
      symbols: false,
    }),
  );
  assert.throws(() =>
    generatorOptions.parse({ length: 8, minimumDigits: 6, minimumSymbols: 6 }),
  );
  assert.throws(() => generatorOptions.parse({ customSymbols: 'alpha' }));
});
test('passphrase uses the independently licensed vocabulary with selected options', async () => {
  assert.equal(passphraseWords.length, 2048);
  assert.equal(new Set(passphraseWords).size, 2048);
  const { password, entropyBits } = await generatePassword(
    generatorOptions.parse({
      kind: 'passphrase',
      wordCount: 10,
      separator: '::',
      capitalize: true,
      includeNumber: true,
    }),
  );
  const words = password.split('::');
  assert.equal(words.length, 11);
  assert.match(words.pop() ?? '', /^[1-9][0-9]{2}$/);
  for (const word of words) {
    assert.match(word, /^[A-Z][a-z]+$/);
    assert.ok(passphraseWords.includes(word.toLowerCase()));
  }
  assert.ok(entropyBits !== undefined && entropyBits >= 110);
  assert.throws(() => generatorOptions.parse({ wordCount: 11 }));
  assert.throws(() => generatorOptions.parse({ separator: '' }));
});
