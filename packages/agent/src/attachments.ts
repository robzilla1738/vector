/** Local explicit attachments are untrusted model input; daemon/agent.md tool boundaries. */
import { createHash, randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import type { UserContent } from 'ai';
import { z } from 'zod';
import type { Selection } from './providers.js';
import { defaultModel } from './providers.js';
import { type AgentStorage, fail } from './storage.js';

export const attachmentInput = z.object({
  fileName: z.string().min(1).max(255),
  mediaType: z.enum([
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
  ]),
  base64: z.string().min(4).max(2_800_000),
});
export interface Attachment {
  id: string;
  sessionId: string;
  fileName: string;
  mediaType: string;
  size: number;
  sha256: string;
  createdAt: number;
}
export interface StoredAttachment extends Attachment {
  base64: string;
}
export class Attachments {
  constructor(private store: AgentStorage) {}
  list(accountId: number, sessionId: string): Attachment[] {
    this.store.requireAccount(accountId);
    return Object.values(this.store.all(accountId, 'sessionAttachments'))
      .filter(
        (value): value is StoredAttachment =>
          !!value &&
          typeof value === 'object' &&
          'sessionId' in value &&
          value.sessionId === sessionId,
      )
      .map(({ base64, ...metadata }) => metadata);
  }
  read(accountId: number, sessionId: string, id: string): StoredAttachment {
    this.store.requireAccount(accountId);
    const value = this.store.get(
      accountId,
      'sessionAttachments',
      id,
    ) as StoredAttachment | null;
    if (!value || value.sessionId !== sessionId)
      fail('NOT_FOUND', 'Attachment does not exist in this session');
    return value;
  }
  upload(
    accountId: number,
    sessionId: string,
    input: z.infer<typeof attachmentInput>,
  ) {
    const data = attachmentInput.parse(input);
    const bytes = Buffer.from(data.base64, 'base64');
    if (
      bytes.toString('base64') !== data.base64 ||
      !bytes.length ||
      bytes.length > 2 * 1024 * 1024
    )
      fail('BAD_REQUEST', 'Attachment must be canonical base64, at most 2 MiB');
    if (
      this.list(accountId, sessionId).reduce(
        (size, file) => size + file.size,
        0,
      ) +
        bytes.length >
      8 * 1024 * 1024
    )
      fail(
        'PRECONDITION_FAILED',
        'Session attachments exceed the 8 MiB local limit',
      );
    const head = bytes.subarray(0, 16);
    const valid =
      data.mediaType === 'application/pdf'
        ? head.toString().startsWith('%PDF-')
        : data.mediaType === 'image/png'
          ? head
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : data.mediaType === 'image/jpeg'
            ? head[0] === 255 && head[1] === 216 && head[2] === 255
            : data.mediaType === 'image/gif'
              ? /^GIF8[79]a/.test(head.toString())
              : data.mediaType === 'image/webp'
                ? head.toString('ascii', 0, 4) === 'RIFF' &&
                  head.toString('ascii', 8, 12) === 'WEBP'
                : (() => {
                    try {
                      new TextDecoder('utf-8', { fatal: true }).decode(bytes);
                      return !bytes.includes(0);
                    } catch {
                      return false;
                    }
                  })();
    if (!valid)
      fail(
        'BAD_REQUEST',
        'Attachment content does not match its declared media type',
      );
    const attachment: StoredAttachment = {
      id: randomUUID(),
      sessionId,
      fileName: basename(data.fileName.replaceAll('\\', '/')),
      mediaType: data.mediaType,
      size: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      createdAt: Date.now(),
      base64: data.base64,
    };
    this.store.set(accountId, 'sessionAttachments', attachment.id, attachment);
    const { base64, ...metadata } = attachment;
    return metadata;
  }
  remove(accountId: number, sessionId: string, id: string) {
    this.read(accountId, sessionId, id);
    this.store.set(accountId, 'sessionAttachments', id, null);
  }
  copy(
    accountId: number,
    sourceSession: string,
    targetSession: string,
    id: string,
  ) {
    const value = this.read(accountId, sourceSession, id);
    const copied = { ...value, id: randomUUID(), sessionId: targetSession };
    this.store.set(accountId, 'sessionAttachments', copied.id, copied);
    return copied.id;
  }
  content(
    accountId: number,
    sessionId: string,
    ids: string[],
    model: Selection,
    redact: (value: string) => string,
  ): UserContent {
    return ids.flatMap((id): Exclude<UserContent, string> => {
      const file = this.read(accountId, sessionId, id);
      if (
        file.mediaType.startsWith('text/') ||
        file.mediaType === 'application/json'
      )
        return [
          {
            type: 'text',
            text: `Untrusted attached file ${file.fileName}:\n${redact(Buffer.from(file.base64, 'base64').toString('utf8'))}\nEnd of attached file.`,
          },
        ];
      if (
        model.provider !== defaultModel.provider ||
        model.modelId !== defaultModel.modelId
      )
        fail(
          'PRECONDITION_FAILED',
          'Binary attachment input is verified only for Muse Spark; select that model or attach UTF-8 text',
        );
      return file.mediaType.startsWith('image/')
        ? [{ type: 'image', image: file.base64, mediaType: file.mediaType }]
        : [
            {
              type: 'file',
              data: file.base64,
              mediaType: file.mediaType,
              filename: file.fileName,
            },
          ];
    });
  }
}
