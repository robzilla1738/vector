/** Independent user-initiated capture; docs/spec/daemon/services.md Capture and UI utilities. */
import { constants } from 'node:fs';
import { open, realpath, unlink } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fail, scope } from '@aux/agent';
import { z } from 'zod';
import type { HelperClient } from '../helpers/client.js';
import type { DaemonServices } from '../http/server.js';

const region = z
  .object({
    x: z.number().finite().nonnegative(),
    y: z.number().finite().nonnegative(),
    width: z.number().finite().positive().max(16384),
    height: z.number().finite().positive().max(16384),
  })
  .strict();
const inputSchema = scope.extend({
  profileId: z.string().min(1).max(256),
  browserMode: z.enum(['default', 'incognito']),
  targetId: z.string().min(1).max(256),
  documentId: z.string().min(1).max(1024),
  documentUrl: z.string().url().max(16384),
});
const pngLimit = 24 * 1024 * 1024;
function image(data: Buffer) {
  if (
    data.length < 33 ||
    data.length > pngLimit ||
    data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' ||
    data.toString('ascii', 12, 16) !== 'IHDR'
  )
    fail('PRECONDITION_FAILED', 'Capture did not produce a bounded PNG image');
  const width = data.readUInt32BE(16),
    height = data.readUInt32BE(20);
  if (!width || !height || width * height > 40_000_000)
    fail('PRECONDITION_FAILED', 'Captured image exceeds the pixel limit');
  return {
    mimeType: 'image/png' as const,
    data: data.toString('base64'),
    width,
    height,
  };
}
export function createCaptureService(
  { store, bridge, t, procedure }: DaemonServices,
  security: {
    status(accountId: number): { locked: boolean; initialized: boolean };
  },
  helper?: HelperClient,
) {
  const pending = new Map<number, AbortController>();
  let closed = false;
  function authorize(input: z.infer<typeof inputSchema>) {
    const account = store.requireAccount(input.accountId);
    const state = security.status(input.accountId);
    if (
      closed ||
      store.current() !== input.accountId ||
      state.locked ||
      !state.initialized ||
      !account.onboardingCompletedAt
    )
      fail(
        'PRECONDITION_FAILED',
        'Capture requires the current unlocked account',
      );
    if (
      !store
        .bindings()
        .some(
          (b) =>
            b.accountId === input.accountId && b.profileId === input.profileId,
        )
    )
      fail('FORBIDDEN', 'Capture profile is not bound to this account');
    if (!['http:', 'https:'].includes(new URL(input.documentUrl).protocol))
      fail('FORBIDDEN', 'Capture requires an ordinary web page');
  }
  const run = async (
    input: z.infer<typeof inputSchema>,
    mode: 'viewport' | 'fullPage' | 'region' | 'screen',
    rectangle?: z.infer<typeof region>,
  ) => {
    authorize(input);
    if (pending.has(input.accountId))
      fail('CONFLICT', 'A capture is already running');
    if (rectangle && rectangle.width * rectangle.height > 40_000_000)
      fail('BAD_REQUEST', 'Capture region exceeds the pixel limit');
    const controller = new AbortController();
    pending.set(input.accountId, controller);
    try {
      // Even screen capture verifies the page's actual native profile/document first.
      await bridge.command(
        input,
        { method: 'capture.verify', params: input },
        { signal: controller.signal },
      );
      let result: ReturnType<typeof image>;
      if (mode === 'screen') {
        if (!helper)
          fail(
            'PRECONDITION_FAILED',
            'The screen capture helper is unavailable',
          );
        const captured = z
          .object({ path: z.string(), mimeType: z.literal('image/png') })
          .parse(await helper.call('screen.capture', {}));
        const file = resolve(
            await realpath(dirname(captured.path)),
            basename(captured.path),
          ),
          directory = await realpath(helper.artifactDirectory);
        if (
          dirname(file) !== directory ||
          !/^screenshot-[\w-]+\.png$/.test(file.slice(directory.length + 1))
        )
          fail(
            'FORBIDDEN',
            'Capture artifact is outside the private helper directory',
          );
        const descriptor = await open(
          file,
          constants.O_RDONLY | constants.O_NOFOLLOW,
        );
        try {
          const stat = await descriptor.stat();
          if (
            !stat.isFile() ||
            stat.nlink !== 1 ||
            stat.uid !== process.getuid?.() ||
            stat.mode & 0o077 ||
            stat.size > pngLimit
          )
            fail(
              'FORBIDDEN',
              'Capture artifact is not an owner-only bounded image',
            );
          result = image(await descriptor.readFile());
        } finally {
          await descriptor.close();
          await unlink(file).catch(() => {});
        }
      } else {
        const captured = z
          .object({ data: z.string().max(Math.ceil((pngLimit * 4) / 3)) })
          .parse(
            await bridge.command(
              input,
              {
                method: 'capture.page',
                params: {
                  ...input,
                  mode,
                  ...(rectangle ? { region: rectangle } : {}),
                },
              },
              { signal: controller.signal },
            ),
          );
        result = image(Buffer.from(captured.data, 'base64'));
      }
      authorize(input);
      if (controller.signal.aborted)
        fail('CONFLICT', 'Capture authorization changed');
      await bridge.command(
        input,
        { method: 'capture.verify', params: input },
        { signal: controller.signal },
      );
      return result;
    } finally {
      if (pending.get(input.accountId) === controller)
        pending.delete(input.accountId);
    }
  };
  return {
    router: t.router({
      viewport: procedure
        .input(inputSchema)
        .mutation(({ input }) => run(input, 'viewport')),
      fullPage: procedure
        .input(inputSchema)
        .mutation(({ input }) => run(input, 'fullPage')),
      region: procedure
        .input(inputSchema.extend({ region }))
        .mutation(({ input }) => run(input, 'region', input.region)),
      screen: procedure
        .input(inputSchema)
        .mutation(({ input }) => run(input, 'screen')),
      cancel: procedure.input(scope).mutation(({ input }) => {
        store.requireAccount(input.accountId);
        pending.get(input.accountId)?.abort();
        return { cancelled: true };
      }),
    }),
    invalidate(accountId: number) {
      pending.get(accountId)?.abort();
    },
    close() {
      closed = true;
      for (const controller of pending.values()) controller.abort();
    },
  };
}
