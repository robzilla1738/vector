/** Original direct Search API adapter. No inference/model request is made. */
import { lookup } from 'node:dns/promises';
import type { IncomingMessage } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import { fail } from '@aux/agent';
export const SEARCH_ENDPOINT = 'https://api.perplexity.ai/search';
export interface SearchPayload {
  query: string;
  max_results: number;
  max_tokens: number;
  max_tokens_per_page: number;
}
export type SearchTransport = (
  key: string,
  payload: SearchPayload,
  signal: AbortSignal,
) => Promise<unknown>;
export function publicAddress(address: string) {
  if (isIP(address) === 4) {
    const [a = 0, b = 0, c = 0] = address.split('.').map(Number);
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 168 || b === 0)) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113)
    );
  }
  // Only ordinary global unicast; no mapped/compatible/local/multicast/translation.
  return (
    isIP(address) === 6 &&
    /^[23][0-9a-f]{3}:/i.test(address) &&
    !/^2001:(?:0{0,3}[0-9a-f]{0,2}:|0?1[0-9a-f]{2}:|0?db8:)/i.test(address) &&
    !/^(?:2002|3fff):/i.test(address)
  );
}
export const requestSearch: SearchTransport = async (key, payload, signal) => {
  signal.throwIfAborted();
  const addresses = await new Promise<Awaited<ReturnType<typeof resolveHost>>>(
    (resolve, reject) => {
      const abort = () =>
        reject(signal.reason ?? new Error('Search cancelled'));
      signal.addEventListener('abort', abort, { once: true });
      resolveHost()
        .then(resolve, () =>
          reject(new Error('Search provider DNS resolution failed')),
        )
        .finally(() => signal.removeEventListener('abort', abort));
    },
  );
  signal.throwIfAborted();
  if (
    !addresses.length ||
    addresses.some((item) => !publicAddress(item.address))
  )
    fail(
      'FORBIDDEN',
      'Search provider did not resolve exclusively to public network addresses',
    );
  const address = addresses[0];
  if (!address)
    fail('PRECONDITION_FAILED', 'Search provider could not be resolved');
  const body = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      SEARCH_ENDPOINT,
      {
        method: 'POST',
        signal,
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Encoding': 'identity',
          'Content-Length': Buffer.byteLength(body),
        },
        // Pin the validated address; TLS still verifies the original hostname.
        lookup: (_hostname, _options, callback) =>
          callback(null, address.address, address.family),
      },
      (response) => {
        readSearchResponse(response).then(resolve, reject);
      },
    );
    request.on('error', () =>
      reject(
        new Error(
          signal.aborted
            ? 'Search cancelled or deadline exceeded'
            : 'Search provider connection failed',
        ),
      ),
    );
    request.end(body);
  });
};
function resolveHost() {
  return lookup('api.perplexity.ai', { all: true, verbatim: true });
}

/** Bounded decoder, fixture-tested without any external network. */
export function readSearchResponse(
  response: IncomingMessage,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const deny = (message: string) => {
      response.destroy();
      reject(new Error(message));
    };
    const status = response.statusCode ?? 0;
    if (status !== 200) {
      deny(
        status >= 300 && status < 400
          ? 'Search redirects are forbidden'
          : `Search provider rejected the request (HTTP ${status})`,
      );
      return;
    }
    if (
      !(response.headers['content-type'] ?? '')
        .toLowerCase()
        .includes('application/json') ||
      !['identity', undefined].includes(response.headers['content-encoding']) ||
      Number(response.headers['content-length'] ?? 0) > 512000
    ) {
      deny('Search provider returned unsupported or oversized content');
      return;
    }
    const chunks: Buffer[] = [];
    let size = 0;
    response.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > 512000) {
        deny('Search response exceeds the size limit');
        return;
      }
      chunks.push(chunk);
    });
    response.on('error', () =>
      reject(new Error('Search response stream failed')),
    );
    response.on('aborted', () =>
      reject(new Error('Search response stream interrupted')),
    );
    response.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('Search provider returned invalid JSON'));
      }
    });
  });
}
