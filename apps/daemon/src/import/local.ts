import { createHash } from 'node:crypto';
import { TRPCError } from '@trpc/server';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { itemFields } from '../vault/schema.js';
export const importSource = z.enum([
  'aux-json',
  'generic-csv',
  'apple-csv',
  'onepassword-csv',
  'lastpass-csv',
  'dashlane-csv',
  'proton-csv',
  'bitwarden-json',
]);
export const importInput = z.object({
  source: importSource,
  data: z.string().min(1).max(16_000_000),
  vaultId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/),
});
const rowSchema = z.record(z.string(), z.string());
const bitwardenSchema = z.object({
  encrypted: z.literal(false).optional(),
  items: z
    .array(
      z.object({
        name: z.string(),
        type: z.number().optional(),
        notes: z.string().nullable().optional(),
        login: z
          .object({
            username: z.string().nullable().optional(),
            password: z.string().nullable().optional(),
            totp: z.string().nullable().optional(),
            uris: z
              .array(z.object({ uri: z.string().nullable().optional() }))
              .optional(),
          })
          .optional(),
        fields: z
          .array(
            z.object({
              name: z.string().nullable().optional(),
              value: z.string().nullable().optional(),
              type: z.number().optional(),
            }),
          )
          .optional(),
        card: z.record(z.string(), z.unknown()).optional(),
        identity: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .max(20000),
});
export function parseLocalImport(input: z.infer<typeof importInput>) {
  const items: z.infer<typeof itemFields>[] = [];
  const errors: { row: number; message: string }[] = [];
  const sourceRows: Record<string, string>[] = [];
  if (input.source === 'aux-json') {
    let decoded: unknown;
    try {
      decoded = JSON.parse(input.data);
    } catch {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This file is not valid JSON.',
      });
    }
    const snapshot = z
      .object({ items: z.array(z.unknown()).max(20000) })
      .safeParse(decoded);
    if (!snapshot.success)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Choose an Aux JSON export containing an items array.',
      });
    for (const [index, value] of snapshot.data.items.entries()) {
      const parsed = itemFields.safeParse(value);
      if (!parsed.success) {
        errors.push({
          row: index + 1,
          message: 'This saved item has invalid or unsupported fields.',
        });
        continue;
      }
      const fingerprint = createHash('sha256')
        .update(JSON.stringify(parsed.data))
        .digest('hex');
      items.push({
        ...parsed.data,
        vaultId: input.vaultId,
        importProvenance: { source: 'aux-json', fingerprint },
      });
    }
    return { items, errors, total: snapshot.data.items.length };
  }
  if (input.source === 'bitwarden-json') {
    let decoded: unknown;
    try {
      decoded = JSON.parse(input.data);
    } catch {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This file is not valid JSON.',
      });
    }
    const parsed = bitwardenSchema.safeParse(decoded);
    if (!parsed.success)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          'Use an unencrypted Bitwarden JSON export with an items array.',
      });
    for (const item of parsed.data.items) {
      const fields = Object.fromEntries(
        (item.fields ?? []).map((field, index) => [
          `Custom: ${field.name ?? `Additional field ${index + 1}`}`,
          field.value ?? '',
        ]),
      );
      sourceRows.push({
        title: item.name,
        notes: item.notes ?? '',
        username: item.login?.username ?? '',
        password: item.login?.password ?? '',
        totp: item.login?.totp ?? '',
        urls: JSON.stringify(
          (item.login?.uris ?? []).map((entry) => entry.uri).filter(Boolean),
        ),
        category:
          item.type === 3
            ? 'card'
            : item.type === 4
              ? 'identity'
              : item.type === 2
                ? 'secure-note'
                : 'login',
        ...fields,
        ...Object.fromEntries(
          Object.entries(item.card ?? item.identity ?? {}).map(
            ([name, value]) => [name, String(value ?? '')],
          ),
        ),
      });
    }
  } else {
    let decoded: unknown;
    try {
      decoded = parse(input.data, {
        columns: (headers: string[]) => {
          const names = headers.map((name) => name.toLocaleLowerCase().trim());
          if (new Set(names).size !== names.length)
            throw new Error('Duplicate CSV columns');
          return headers;
        },
        bom: true,
        skip_empty_lines: true,
        max_record_size: 2_000_000,
        trim: true,
      });
    } catch {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          'This CSV could not be read. Check its header and row columns.',
      });
    }
    const parsed = z.array(rowSchema).max(20000).safeParse(decoded);
    if (!parsed.success)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This CSV has too many rows or invalid fields.',
      });
    sourceRows.push(...parsed.data);
  }
  const aliases = {
    title: ['title', 'name', 'account', 'itemname'],
    username: ['username', 'user', 'login', 'email'],
    password: ['password', 'pass'],
    url: ['url', 'website', 'loginuri', 'loginurl'],
    notes: ['notes', 'note', 'extra'],
    totp: ['totp', 'otp', 'otpauth'],
  };
  for (const [index, row] of sourceRows.entries()) {
    const normalized = Object.fromEntries(
      Object.entries(row).map(([name, value]) => [
        name.toLowerCase().replace(/[ _-]/g, ''),
        value,
      ]),
    );
    const take = (names: string[]) =>
      names
        .map((name) => normalized[name])
        .find((value) => value !== undefined) ?? '';
    let urls: string[] = [];
    try {
      urls = normalized.urls
        ? z.array(z.string()).parse(JSON.parse(normalized.urls))
        : [take(aliases.url)].filter(Boolean);
      for (const url of urls) {
        const protocol = new URL(url).protocol;
        if (!['http:', 'https:'].includes(protocol))
          throw new Error('Invalid protocol');
      }
    } catch {
      errors.push({
        row: index + 2,
        message: 'The website address must be a complete HTTP or HTTPS URL.',
      });
      continue;
    }
    const used = new Set([
      ...Object.values(aliases).flat(),
      'category',
      'urls',
    ]);
    const additional = Object.entries(row)
      .filter(
        ([name, value]) =>
          value && !used.has(name.toLowerCase().replace(/[ _-]/g, '')),
      )
      .map(([name, value]) => ({ name, value, secret: true }));
    const fields = {
      vaultId: input.vaultId,
      category: normalized.category ?? 'login',
      title: take(aliases.title),
      subtitle: take(aliases.username),
      urls,
      notes: take(aliases.notes),
      loginFields: {
        username: take(aliases.username),
        password: take(aliases.password),
        ...(take(aliases.totp) ? { totp: take(aliases.totp) } : {}),
      },
      sections: additional.length
        ? [{ title: 'Imported fields', fields: additional }]
        : [],
      importProvenance: {
        source: input.source,
        fingerprint: createHash('sha256')
          .update(
            JSON.stringify({
              source: input.source,
              row: Object.fromEntries(Object.entries(row).sort()),
            }),
          )
          .digest('hex'),
      },
    };
    const parsed = itemFields.safeParse(fields);
    if (!parsed.success) {
      errors.push({
        row: index + 2,
        message:
          'This row needs a nonempty item name and supported field sizes.',
      });
      continue;
    }
    items.push(parsed.data);
  }
  return { items, errors, total: sourceRows.length };
}
