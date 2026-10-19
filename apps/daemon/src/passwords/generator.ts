import sodium from 'libsodium-wrappers-sumo';
import { z } from 'zod';
import { passphraseWords } from './wordlist.js';

const defaultSymbols = '!#$%&()*+,-./:;<=>?@[]^_{|}~';
export const generatorOptions = z
  .object({
    kind: z.enum(['password', 'passphrase']).default('password'),
    length: z.number().int().min(8).max(64).default(20),
    lowercase: z.boolean().default(true),
    uppercase: z.boolean().default(true),
    digits: z.boolean().default(true),
    symbols: z.boolean().default(true),
    avoidAmbiguous: z.boolean().default(true),
    minimumDigits: z.number().int().min(0).max(64).default(1),
    minimumSymbols: z.number().int().min(0).max(64).default(1),
    customSymbols: z
      .string()
      .min(1)
      .max(128)
      .refine(
        (value) =>
          [...value].every(
            (char) => char >= '!' && char <= '~' && !/[A-Za-z0-9]/.test(char),
          ),
        'Use printable symbol characters.',
      )
      .default(defaultSymbols),
    wordCount: z.number().int().min(3).max(10).default(4),
    separator: z.string().min(1).max(3).default('-'),
    capitalize: z.boolean().default(true),
    includeNumber: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    if (value.kind !== 'password') return;
    if (!value.lowercase && !value.uppercase && !value.digits && !value.symbols)
      ctx.addIssue({
        code: 'custom',
        message: 'Choose at least one character group.',
      });
    const required =
      Number(value.lowercase) +
      Number(value.uppercase) +
      (value.digits ? value.minimumDigits : 0) +
      (value.symbols ? value.minimumSymbols : 0);
    if (required > value.length)
      ctx.addIssue({
        code: 'custom',
        message: 'The character minimums exceed the password length.',
      });
  });
export async function generatePassword(
  input: z.infer<typeof generatorOptions>,
) {
  await sodium.ready;
  if (input.kind === 'passphrase') {
    const words = Array.from({ length: input.wordCount }, () => {
      const word =
        passphraseWords[sodium.randombytes_uniform(passphraseWords.length)];
      if (!word) throw new Error('The passphrase dictionary is unavailable.');
      return input.capitalize
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word;
    });
    if (input.includeNumber)
      words.push(String(100 + sodium.randombytes_uniform(900)));
    const password = words.join(input.separator);
    return {
      password,
      length: password.length,
      entropyBits:
        input.wordCount * Math.log2(passphraseWords.length) +
        (input.includeNumber ? Math.log2(900) : 0),
    };
  }
  const groups = [
    { alphabet: input.lowercase ? 'abcdefghijklmnopqrstuvwxyz' : '', count: 1 },
    { alphabet: input.uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '', count: 1 },
    { alphabet: input.digits ? '0123456789' : '', count: input.minimumDigits },
    {
      alphabet: input.symbols ? input.customSymbols : '',
      count: input.minimumSymbols,
    },
  ]
    .filter((group) => group.alphabet)
    .map((group) => ({
      ...group,
      alphabet: [...new Set(group.alphabet)]
        .filter((char) => !input.avoidAmbiguous || !'Il1O0o'.includes(char))
        .join(''),
    }));
  if (groups.some((group) => !group.alphabet))
    throw new Error('An enabled character group has no available characters.');
  const alphabet = [
    ...new Set(groups.map((group) => group.alphabet).join('')),
  ].join('');
  const characters = groups.flatMap((group) =>
    Array.from(
      { length: group.count },
      () =>
        group.alphabet[sodium.randombytes_uniform(group.alphabet.length)] ?? '',
    ),
  );
  while (characters.length < input.length)
    characters.push(
      alphabet[sodium.randombytes_uniform(alphabet.length)] ?? '',
    );
  for (let index = characters.length - 1; index > 0; index--) {
    const other = sodium.randombytes_uniform(index + 1);
    [characters[index], characters[other]] = [
      characters[other] ?? '',
      characters[index] ?? '',
    ];
  }
  return { password: characters.join(''), length: input.length };
}
