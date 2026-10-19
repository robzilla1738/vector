/** Native permission bridge for the opt-in context ledger (services.md). */
import type { CaptureAdapter, CapturePermissions } from '@aux/memory';
import { z } from 'zod';
import type { HelperClient } from './client.js';

const permissionsSchema = z.object({
  accessibility: z.enum(['granted', 'not-granted']),
  screenRecording: z.enum(['granted', 'not-granted']),
  semanticCapture: z.enum(['available', 'permission-required']).optional(),
});
const candidateSchema = z.object({
  id: z.string().min(1),
  pid: z.number().int().positive(),
  bundleId: z.string().min(1),
  appName: z.string(),
});
const preparationSchema = z.discriminatedUnion('state', [
  z.object({ state: z.literal('ready'), candidate: candidateSchema }),
  z.object({ state: z.literal('skipped'), reason: z.string() }),
]);
const captureSchema = z.discriminatedUnion('state', [
  z.object({
    state: z.literal('captured'),
    candidateId: z.string(),
    pid: z.number().int().positive(),
    bundleId: z.string().min(1),
    appName: z.string(),
    windowTitle: z.string().max(2000),
    content: z.string().max(100000),
    occurredAt: z.number().nonnegative(),
    editableValuesOmitted: z.literal(true),
    browserContentOmitted: z.literal(true),
  }),
  z.object({ state: z.literal('skipped'), reason: z.string() }),
]);
export function createHelperCaptureAdapter(
  client: HelperClient,
): CaptureAdapter {
  const permissions = async (
    _accountId: number,
    signal?: AbortSignal,
  ): Promise<CapturePermissions> => {
    const value = permissionsSchema.parse(
      await client.call(
        'permissions.status',
        {},
        { ...(signal ? { signal } : {}), timeoutMs: 3000 },
      ),
    );
    return {
      accessibility: value.accessibility === 'granted' ? 'granted' : 'denied',
      screenCapture: value.screenRecording === 'granted' ? 'granted' : 'denied',
      semanticCapture:
        value.semanticCapture === 'available'
          ? 'granted'
          : value.semanticCapture === 'permission-required'
            ? 'denied'
            : 'unavailable',
    };
  };
  return {
    permissions,
    async prepare(_accountId, signal) {
      return preparationSchema.parse(
        await client.call('semantic.prepare', {}, { signal, timeoutMs: 6000 }),
      );
    },
    async capture(_accountId, candidate, signal) {
      const result = captureSchema.parse(
        await client.call(
          'semantic.capture',
          { id: candidate.id },
          { signal, timeoutMs: 6000 },
        ),
      );
      if (
        result.state === 'captured' &&
        (result.candidateId !== candidate.id ||
          result.pid !== candidate.pid ||
          result.bundleId !== candidate.bundleId)
      )
        throw new Error(
          'Native semantic capture does not match its prepared application',
        );
      return result;
    },
    async requestPermissions(accountId) {
      await client.call('permissions.request', { kind: 'accessibility' });
      return permissions(accountId);
    },
  };
}
