import sodium from 'libsodium-wrappers-sumo';
import { z } from 'zod';
export const generatorOptions = z
  .object({
    length: z.number().int().min(8).max(256).default(24),
    lowercase: z.boolean().default(true),
    uppercase: z.boolean().default(true),
    digits: z.boolean().default(true),
    symbols: z.boolean().default(true),
  })
  .refine(
    (value) =>
      value.lowercase || value.uppercase || value.digits || value.symbols,
    'Choose at least one character group.',
  );
export async function generatePassword(
  input: z.infer<typeof generatorOptions>,
) {
  await sodium.ready;
  const groups = [
    input.lowercase ? 'abcdefghijklmnopqrstuvwxyz' : '',
    input.uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
    input.digits ? '0123456789' : '',
    input.symbols ? '!#$%&()*+,-./:;<=>?@[]^_{|}~' : '',
  ].filter(Boolean);
  const alphabet = groups.join('');
  const characters = groups.map(
    (group) => group[sodium.randombytes_uniform(group.length)] ?? '',
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
