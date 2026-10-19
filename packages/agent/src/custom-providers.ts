/** Independent local custom-model configuration; see docs/spec/daemon/agent.md. */
import { randomUUID } from 'node:crypto';
import {
  closeSync,
  constants,
  existsSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { type AgentStorage, fail } from './storage.js';
export const customProviderId = z
  .string()
  .regex(/^custom-[A-Za-z0-9_-]{1,93}$/);
export const customThinkingLevel = z.enum([
  'off',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
]);
const responseEfforts = new Set([
  'none',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
]);
export const customModelSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
    name: z.string().trim().min(1).max(200).optional(),
    inputModalities: z
      .array(z.enum(['text', 'image', 'pdf']))
      .min(1)
      .max(3)
      .default(['text']),
    contextWindow: z.number().int().positive().max(1_000_000_000).optional(),
    outputLimit: z.number().int().positive().max(1_000_000_000).optional(),
    reasoning: z.boolean().default(false),
    thinkingLevels: z.array(customThinkingLevel).max(7).default([]),
    thinkingLevelMapping: z
      .partialRecord(customThinkingLevel, z.string().min(1).max(100))
      .optional(),
    costs: z
      .object({
        inputPerMillion: z.number().finite().nonnegative().optional(),
        outputPerMillion: z.number().finite().nonnegative().optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((model, ctx) => {
    if (
      new Set(model.inputModalities).size !== model.inputModalities.length ||
      new Set(model.thinkingLevels).size !== model.thinkingLevels.length
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Capabilities and thinking levels must be unique.',
      });
    if (
      !model.reasoning &&
      (model.thinkingLevels.length ||
        Object.keys(model.thinkingLevelMapping ?? {}).length)
    )
      ctx.addIssue({
        code: 'custom',
        message:
          'Enable reasoning before declaring thinking levels or mappings.',
      });
    if (model.reasoning && !model.thinkingLevels.length)
      ctx.addIssue({
        code: 'custom',
        message: 'A reasoning model must declare supported thinking levels.',
      });
    if (
      Object.keys(model.thinkingLevelMapping ?? {}).some(
        (level) =>
          !model.thinkingLevels.includes(
            level as z.infer<typeof customThinkingLevel>,
          ),
      )
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Map only declared thinking levels.',
      });
    if (
      model.contextWindow &&
      model.outputLimit &&
      model.outputLimit > model.contextWindow
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Output limit cannot exceed the context window.',
      });
  });
const endpoint = z
  .string()
  .max(4096)
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        !url.username &&
        !url.password &&
        !url.hash &&
        (url.protocol === 'https:' ||
          (url.protocol === 'http:' &&
            ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))
      );
    } catch {
      return false;
    }
  }, 'Use HTTPS or loopback HTTP, without URL credentials or a fragment.');
const headerName = z.string().regex(/^[!#$%&'*+.^_`|~0-9A-Za-z-]{1,200}$/);
const headers = z.record(
  headerName,
  z
    .string()
    .max(16384)
    .refine(
      (value) => !/[\r\n\0]/.test(value),
      'Header values cannot contain line breaks.',
    ),
);
const configSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    baseUrl: endpoint,
    apiStyle: z.enum(['openai-compatible', 'openai-responses']),
    models: z.array(customModelSchema).max(200),
  })
  .strict()
  .superRefine((config, ctx) => {
    if (
      new Set(config.models.map((model) => model.id)).size !==
      config.models.length
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Model IDs must be unique within a provider.',
      });
    if (
      config.apiStyle === 'openai-responses' &&
      config.models.some((model) =>
        Object.values(model.thinkingLevelMapping ?? {}).some(
          (value) => !responseEfforts.has(value),
        ),
      )
    )
      ctx.addIssue({
        code: 'custom',
        message:
          'Responses reasoning mappings must use none, minimal, low, medium, high, xhigh or max.',
      });
  });
export const customProviderUpdate = configSchema
  .safeExtend({
    apiKey: z.string().min(1).max(16384).optional(),
    removeApiKey: z.boolean().optional(),
    headers: headers.optional(),
    preserveHeaderNames: z.array(headerName).max(100).default([]),
  })
  .superRefine((value, ctx) => {
    if (value.apiKey && value.removeApiKey)
      ctx.addIssue({
        code: 'custom',
        message: 'Replace or remove the API key in separate actions.',
      });
  });
export const customProviderBatch = z.record(
  customProviderId,
  customProviderUpdate,
);
const privateSchema = configSchema
  .safeExtend({ apiKey: z.string().min(1).max(16384).optional(), headers })
  .strict();
const snapshotSchema = z
  .object({
    version: z.literal(1),
    providers: z.record(customProviderId, privateSchema),
  })
  .strict();
export type CustomModel = z.infer<typeof customModelSchema>;
export type CustomProviderPrivate = z.infer<typeof privateSchema>;
export type CustomProviderPublic = Omit<
  CustomProviderPrivate,
  'apiKey' | 'headers'
> & {
  providerId: string;
  modelIds: string[];
  hasApiKey: boolean;
  headerNames: string[];
};
type Snapshot = z.infer<typeof snapshotSchema>;
export class CustomProviders {
  constructor(private store: AgentStorage) {}
  private path(accountId: number) {
    this.store.requireAccount(accountId);
    const home = this.store.accountHome(accountId);
    mkdirSync(home, { recursive: true, mode: 0o700 });
    if (lstatSync(home).isSymbolicLink())
      fail('FORBIDDEN', 'Custom provider storage cannot use a symbolic link.');
    return join(home, 'custom-provider-secrets.json');
  }
  private read(accountId: number): Snapshot {
    const path = this.path(accountId);
    if (!existsSync(path)) return { version: 1, providers: {} };
    let fd: number | undefined;
    try {
      fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
      const stat = fstatSync(fd);
      if (
        !stat.isFile() ||
        stat.size > 8 * 1024 * 1024 ||
        (stat.mode & 0o077) !== 0 ||
        (process.getuid && stat.uid !== process.getuid())
      )
        throw new Error('unsafe');
      return snapshotSchema.parse(JSON.parse(readFileSync(fd, 'utf8')));
    } catch {
      return fail(
        'PRECONDITION_FAILED',
        'Custom provider storage is unavailable or invalid. Check its owner-only permissions.',
      );
    } finally {
      if (fd !== undefined) closeSync(fd);
    }
  }
  private write(accountId: number, snapshot: Snapshot) {
    const path = this.path(accountId),
      temporary = `${path}.${randomUUID()}.tmp`;
    const encoded = JSON.stringify(snapshot);
    if (Buffer.byteLength(encoded) > 8 * 1024 * 1024)
      fail(
        'BAD_REQUEST',
        'Custom provider configuration exceeds the local storage limit.',
      );
    let fd: number | undefined;
    try {
      fd = openSync(temporary, 'wx', 0o600);
      writeFileSync(fd, encoded);
      fsyncSync(fd);
      closeSync(fd);
      fd = undefined;
      renameSync(temporary, path);
    } finally {
      if (fd !== undefined) closeSync(fd);
      if (existsSync(temporary)) unlinkSync(temporary);
    }
  }
  private public(
    providerId: string,
    value: CustomProviderPrivate,
  ): CustomProviderPublic {
    const { apiKey, headers, ...config } = value;
    return {
      ...config,
      providerId,
      modelIds: config.models.map((model) => model.id),
      hasApiKey: !!apiKey,
      headerNames: Object.keys(headers),
    };
  }
  list(accountId: number) {
    return Object.entries(this.read(accountId).providers).map(([id, value]) =>
      this.public(id, value),
    );
  }
  get(accountId: number, providerId: string) {
    customProviderId.parse(providerId);
    const value = this.read(accountId).providers[providerId];
    return value ? this.public(providerId, value) : null;
  }
  resolve(accountId: number, providerId: string) {
    customProviderId.parse(providerId);
    const value = this.read(accountId).providers[providerId];
    if (!value)
      fail(
        'PRECONDITION_FAILED',
        'Configure this custom provider before starting a model.',
      );
    return value;
  }
  set(accountId: number, input: unknown) {
    const batch = customProviderBatch.parse(input),
      snapshot = this.read(accountId);
    for (const [id, update] of Object.entries(batch)) {
      const previous = snapshot.providers[id];
      const names = new Set<string>(),
        merged: Record<string, string> = {};
      for (const name of update.preserveHeaderNames) {
        const key = Object.keys(previous?.headers ?? {}).find(
          (key) => key.toLowerCase() === name.toLowerCase(),
        );
        if (!key)
          fail(
            'CONFLICT',
            'A preserved header no longer exists. Refresh this provider.',
          );
        if (names.has(key.toLowerCase()))
          fail('BAD_REQUEST', 'Preserved header names must be unique.');
        const retained = previous?.headers[key];
        if (retained === undefined)
          fail('CONFLICT', 'A preserved header is unavailable.');
        merged[key] = retained;
        names.add(key.toLowerCase());
      }
      for (const [name, value] of Object.entries(update.headers ?? {})) {
        if (names.has(name.toLowerCase()))
          fail(
            'BAD_REQUEST',
            'Remove a saved header before replacing its value.',
          );
        names.add(name.toLowerCase());
        merged[name] = value;
      }
      if (names.size > 100)
        fail('BAD_REQUEST', 'A provider can have at most 100 headers.');
      const {
        apiKey,
        removeApiKey,
        headers: _headers,
        preserveHeaderNames: _preserve,
        ...config
      } = update;
      const retainedKey = removeApiKey
        ? undefined
        : (apiKey ?? previous?.apiKey);
      snapshot.providers[id] = privateSchema.parse({
        ...config,
        ...(retainedKey ? { apiKey: retainedKey } : {}),
        headers: merged,
      });
    }
    this.write(accountId, snapshot);
    return this.list(accountId);
  }
  remove(accountId: number, providerId: string) {
    customProviderId.parse(providerId);
    const snapshot = this.read(accountId);
    const existed = !!snapshot.providers[providerId];
    delete snapshot.providers[providerId];
    if (existed) this.write(accountId, snapshot);
    return { removed: existed };
  }
  redact(accountId: number, text: string) {
    let result = text;
    for (const config of Object.values(this.read(accountId).providers))
      for (const secret of [config.apiKey, ...Object.values(config.headers)]
        .filter((value): value is string => !!value)
        .sort((a, b) => b.length - a.length))
        result = result.replaceAll(secret, '[redacted]');
    return result;
  }
}
