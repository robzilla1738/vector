/** SIWC requires public Responses requests with store=false, stream=true. */
import { createOpenAI } from '@ai-sdk/openai';
import { APICallError, type LanguageModel } from 'ai';
import type { OpenAIOAuth } from './client.js';

function responseEvents() {
  let buffer = '';
  const decoder = new TextDecoder();
  return (chunk: Uint8Array | undefined) => {
    buffer += chunk
      ? decoder.decode(chunk, { stream: true })
      : decoder.decode();
    if (buffer.length > 16000000)
      throw new Error('OAuth response event exceeded its bounded size');
    buffer = buffer.replaceAll('\r\n', '\n');
    const events: {
      type?: string;
      response?: Record<string, unknown>;
      code?: string;
    }[] = [];
    while (buffer.includes('\n\n')) {
      const end = buffer.indexOf('\n\n'),
        block = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      const data = block
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n');
      if (!data || data === '[DONE]') continue;
      let value: unknown;
      try {
        value = JSON.parse(data);
      } catch {
        throw new Error('OAuth Responses stream contained an invalid event');
      }
      if (typeof value !== 'object' || value === null)
        throw new Error('OAuth Responses stream contained an invalid event');
      events.push(value);
    }
    if (chunk === undefined && buffer.trim())
      throw new Error('OAuth Responses stream ended in a partial event');
    return events;
  };
}
export function createOAuthModel(
  oauth: OpenAIOAuth,
  accountId: number,
  modelId: string,
): LanguageModel {
  const resource = oauth.protocol.network.endpoints.resource;
  const failure = (response: Response, data: unknown) => {
    const body =
      data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
    const error =
      body.error && typeof body.error === 'object'
        ? (body.error as Record<string, unknown>)
        : {};
    const code =
      typeof error.code === 'string' && /^[a-z0-9_]{1,128}$/.test(error.code)
        ? error.code
        : undefined;
    const param =
      typeof error.param === 'string'
        ? oauth.redact(accountId, error.param).slice(0, 200)
        : undefined;
    const requestId = response.headers.get('x-request-id');
    const diagnostic = oauth
      .redact(accountId, JSON.stringify(body))
      .replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
      .slice(0, 4000);
    return new APICallError({
      message: `ChatGPT ${code ?? 'request_failed'} (${response.status})${param ? ` at ${param}` : ''}${requestId ? `; request ${requestId}` : ''}`,
      url: `${resource}/responses`,
      requestBodyValues: undefined,
      statusCode: response.status,
      responseBody: diagnostic,
      isRetryable: response.status >= 500 && !code?.includes('unsupported'),
      data: {
        code,
        param,
        requestId,
        bodyShape: body.error ? 'error' : body.detail ? 'detail' : 'other',
      },
    });
  };
  return createOpenAI({
    apiKey: 'aux-private-oauth-transport',
    baseURL: resource,
    fetch: async (input, init) => {
      const request = new Request(input, init);
      if (request.url !== `${resource}/responses` || request.method !== 'POST')
        throw new Error(
          'OAuth inference is restricted to the public Responses API',
        );
      const body = JSON.parse(await request.text()) as Record<string, unknown>;
      const streaming = body.stream === true;
      const access = await oauth.accessToken(accountId, request.signal);
      const headers = new Headers(request.headers);
      headers.set('Authorization', `Bearer ${access}`);
      const response = await oauth.protocol.network.fetch(request.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...body, store: false, stream: true }),
        signal: request.signal,
        redirect: 'error',
      });
      if (!response.ok) {
        const reader = response.body?.getReader(),
          parts: Uint8Array[] = [];
        let size = 0;
        if (reader)
          try {
            while (true) {
              const part = await reader.read();
              if (part.done) break;
              size += part.value.byteLength;
              if (size > 1000000) {
                await reader.cancel();
                break;
              }
              parts.push(part.value);
            }
          } finally {
            reader.releaseLock();
          }
        let data: unknown;
        try {
          data = JSON.parse(Buffer.concat(parts).toString());
        } catch {
          data = { detail: 'Provider returned an unstructured diagnostic' };
        }
        throw failure(response, data);
      }
      if (
        !response.body ||
        !response.headers.get('content-type')?.includes('text/event-stream')
      )
        throw new Error(
          'OAuth inference did not return a Responses event stream',
        );
      const parse = responseEvents();
      let complete = false;
      const inspect = (chunk: Uint8Array | undefined) => {
        let final: Record<string, unknown> | undefined;
        for (const event of parse(chunk)) {
          if (
            ['response.failed', 'response.incomplete', 'error'].includes(
              event.type ?? '',
            )
          )
            throw failure(response, event.response ?? event);
          if (event.type === 'response.completed') {
            if (event.response?.status !== 'completed')
              throw new Error('OAuth response.completed event was invalid');
            complete = true;
            final = event.response;
          }
        }
        return final;
      };
      if (streaming) {
        const stream = response.body.pipeThrough(
          new TransformStream<Uint8Array, Uint8Array>({
            transform(chunk, controller) {
              inspect(chunk);
              controller.enqueue(chunk);
            },
            flush() {
              inspect(undefined);
              if (!complete)
                throw new Error(
                  'ChatGPT stream ended without response.completed',
                );
            },
          }),
        );
        return new Response(stream, {
          status: response.status,
          headers: response.headers,
        });
      }
      // SDK non-stream calls (e.g. compaction) still use a real streaming HTTP
      // request. A completed response is assembled for the provider parser.
      const reader = response.body.getReader();
      let final: Record<string, unknown> | undefined;
      try {
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          final = inspect(part.value) ?? final;
        }
        inspect(undefined);
      } catch (error) {
        await reader.cancel();
        throw error;
      } finally {
        reader.releaseLock();
      }
      if (!complete || !final)
        throw new Error('ChatGPT stream ended without a completed response');
      return new Response(JSON.stringify(final), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  }).responses(modelId);
}
