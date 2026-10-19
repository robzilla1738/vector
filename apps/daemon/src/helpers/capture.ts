/** Native permission bridge for the opt-in context ledger (services.md). */
import type { CaptureAdapter, CapturePermissions } from '@aux/memory';
import { z } from 'zod';
import type { HelperClient } from './client.js';

const permissionsSchema = z.object({
  accessibility: z.enum(['granted', 'not-granted']),
  screenRecording: z.enum(['granted', 'not-granted']),
  semanticCapture: z.enum(['available', 'permission-required']).optional(),
});
export function createHelperCaptureAdapter(
  client: HelperClient,
): CaptureAdapter {
  const permissions = async (): Promise<CapturePermissions> => {
    const value = permissionsSchema.parse(
      await client.call('permissions.status'),
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
    async requestPermissions() {
      await client.call('permissions.request', { kind: 'accessibility' });
      return permissions();
    },
  };
}
