import { backgroundRequest } from './client';
/** Call from the popup's explicit sensitive-field Copy action only. */
export async function copySensitiveField(value: string) {
  return backgroundRequest<{ copied: true; clearAfterMs: 30000 }>({
    type: 'aux.vault.clipboard.copy',
    value,
  });
}
