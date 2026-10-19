import assert from 'node:assert/strict';
import { test } from 'node:test';
import { oneTimeCode } from '../src/passwords/totp.js';

function base32(value: string) {
  let bits = '';
  for (const byte of Buffer.from(value))
    bits += byte.toString(2).padStart(8, '0');
  return (
    bits
      .match(/.{1,5}/g)
      ?.map(
        (part) =>
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[
            Number.parseInt(part.padEnd(5, '0'), 2)
          ],
      )
      .join('') ?? ''
  );
}
// RFC6238 AppendixB: published interoperability vectors, not implementation mirrors.
test('RFC6238 interoperates with SHA1, SHA256 and SHA512 through 64-bit times', () => {
  const vectors = [
    [59, '94287082', '46119246', '90693936'],
    [1111111109, '07081804', '68084774', '25091201'],
    [1111111111, '14050471', '67062674', '99943326'],
    [1234567890, '89005924', '91819424', '93441116'],
    [2000000000, '69279037', '90698825', '38618901'],
    [20000000000, '65353130', '77737706', '47863826'],
  ] as const;
  const algorithms = [
    ['SHA1', '12345678901234567890'],
    ['SHA256', '12345678901234567890123456789012'],
    [
      'SHA512',
      '1234567890123456789012345678901234567890123456789012345678901234',
    ],
  ] as const;
  for (const [seconds, ...expected] of vectors) {
    for (const [index, [algorithm, key]] of algorithms.entries()) {
      const actual = oneTimeCode(
        `otpauth://totp/fixture?secret=${base32(key)}&algorithm=${algorithm}&digits=8`,
        seconds * 1000,
      );
      assert.equal(actual.code, expected[index]);
      assert.equal(actual.expiresAt, (Math.floor(seconds / 30) + 1) * 30000);
    }
  }
  assert.equal(
    oneTimeCode(base32('12345678901234567890'), 59000).code,
    '287082',
  );
});
test('invalid or ambiguous provisioning fails without exposing keys', () => {
  for (const invalid of [
    'sensitive-not-a-key',
    'MY',
    'A======',
    'otpauth://hotp/fixture?secret=JBSWY3DPEHPK3PXP',
    'otpauth://totp/fixture?secret=JBSWY3DPEHPK3PXP&secret=JBSWY3DPEHPK3PXP',
    'otpauth://totp/fixture?secret=JBSWY3DPEHPK3PXP&algorithm=MD5',
    'otpauth://totp/fixture?secret=JBSWY3DPEHPK3PXP&digits=7',
    'otpauth://totp/fixture?secret=JBSWY3DPEHPK3PXP&period=0',
  ]) {
    assert.throws(
      () => oneTimeCode(invalid),
      (error: Error) => !error.message.includes(invalid),
    );
  }
});
