import { Hono, type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { reserveUsage, settleUsage } from './usage';
import { hostedAiEnabled } from './launch-mode';
import { audioReservationSeconds } from './audio-duration';
import { generateGatewayImages } from './image-generation';
import { withInferenceUploads, MAX_INFERENCE_BYTES, assertInputSignature } from './inference-uploads';

type Env = { Variables: { user: { id: string; clerkId: string; email: string; sessionId: string } } };
type Json = Record<string, unknown>;
type PriceTier = { cost: string; min: number; max?: number };
type Model = { id: string; name?: string; type?: string; zdr?: string; context_window?: number; max_tokens?: number; tags?: string[]; modalities?: { input?: string[]; output?: string[] }; pricing?: { input?: string; output?: string; input_tiers?: PriceTier[]; output_tiers?: PriceTier[]; input_cache_write?: string; input_cache_write_tiers?: PriceTier[]; varies_by_provider?: boolean; transcription_duration_cost_per_second?: string; speech_input_character_cost?: string; image?: string } };
const gatewayOrigin = 'https://ai-gateway.vercel.sh';
const maxBody = 4 * 1024 * 1024; // Below the Vercel Function 4.5 MB request limit, including multipart framing.
const maxAudio = 3 * 1024 * 1024;
const encoder = new TextEncoder();
const strictGateway = { zeroDataRetention: true, disallowPromptTraining: true };
function fail(status: 400 | 413 | 415 | 422 | 502 | 503, message: string): never { throw new HTTPException(status, { message }); }
let catalogCache: { until: number; models: Model[] } | undefined;

export const inferenceRoutes = new Hono<Env>();
inferenceRoutes.use('*', async (c, next) => {
  c.header('Cache-Control', 'no-store');
  if (c.req.method !== 'GET' && !hostedAiEnabled()) return c.json({ error: 'Aux-hosted AI is disabled. Connect your own provider in Aux.' }, 503);
  await next();
});

/** Read bounded bytes rather than trusting Content-Length or buffering an unbounded body. */
export async function boundedBody(request: Request, limit = maxBody): Promise<Uint8Array<ArrayBuffer>> {
  const declared = request.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > limit)) fail(413, 'Request exceeds the upload limit.');
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); fail(413, 'Request exceeds the upload limit.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let position = 0;
  for (const chunk of chunks) { bytes.set(chunk, position); position += chunk.length; }
  return bytes;
}

async function jsonBody(c: Context<Env>): Promise<Json> {
  if (!c.req.header('content-type')?.toLowerCase().startsWith('application/json')) fail(415, 'Expected application/json.');
  try {
    const body: unknown = JSON.parse(new TextDecoder().decode(await boundedBody(c.req.raw)));
    if (!body || typeof body !== 'object' || Array.isArray(body)) fail(400, 'Expected a JSON object.');
    return body as Json;
  } catch (error) { if (error instanceof HTTPException) throw error; return fail(400, 'Invalid JSON request.'); }
}

function gatewayKey(): string {
  const key = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  return key || fail(503, 'AI service authentication is not configured.');
}

async function catalog(): Promise<Model[]> {
  if (catalogCache && catalogCache.until > Date.now()) return catalogCache.models;
  try {
    const response = await fetch(`${gatewayOrigin}/v1/models`, { signal: AbortSignal.timeout(10_000), redirect: 'error' });
    if (!response.ok) fail(503, 'The AI model catalog is temporarily unavailable.');
    const payload = await response.json() as { data?: Model[] };
    if (!Array.isArray(payload.data)) fail(503, 'The AI model catalog is invalid.');
    catalogCache = { until: Date.now() + 600_000, models: payload.data };
    return payload.data;
  } catch (error) { if (error instanceof HTTPException) throw error; return fail(503, 'The AI model catalog is temporarily unavailable.'); }
}

async function verifiedModel(id: string, type: string): Promise<Model> {
  const model = (await catalog()).find(model => model.id === id && model.type === type && ['all', 'some'].includes(model.zdr ?? ''));
  return model || fail(503, 'The configured model is unavailable under the required privacy policy.');
}

export function modelAliases(): Record<string, string> {
  return {
    'grok-aux-balanced': process.env.AUX_AI_MODEL || 'openai/gpt-6-luna',
    'gpt-aux-fast': process.env.AUX_AI_FAST_MODEL || 'openai/gpt-6-luna',
  };
}

async function selectedTextModel(alias: unknown): Promise<{ alias: string; model: Model }> {
  if (typeof alias !== 'string' || !Object.hasOwn(modelAliases(), alias)) fail(400, 'Choose an available Aux model.');
  return { alias, model: await verifiedModel(modelAliases()[alias]!, 'language') };
}

async function hostedCatalog() {
  if (!hostedAiEnabled()) return { provider: 'aux', models: [], visibleModelIds: [], imageModels: [] };
  const models = await Promise.all(Object.entries(modelAliases()).map(async ([id, target]) => {
    const model = await verifiedModel(target, 'language');
    const reasoning = model.tags?.includes('reasoning') ?? false;
    return { id, name: id === 'gpt-aux-fast' ? 'Aux Fast' : 'Aux Balanced', minPlan: 'free', reasoning, supportsReasoningEffort: reasoning,
      api: 'openai-responses', supportsFastMode: false, contextWindow: model.context_window || 128_000,
      maxTokens: Math.min(model.max_tokens || 8192, 8192), availableThinkingLevels: reasoning ? ['low', 'medium', 'high'] : ['off'] };
  }));
  const imageModel = (await catalog()).find(model => model.id === (process.env.AUX_IMAGE_MODEL || 'meta/muse-image-1.0') && model.type === 'image' && ['all','some'].includes(model.zdr ?? ''));
  return { provider: 'aux', models, visibleModelIds: models.map(model => model.id), imageModels: imageModel ? [{ id: 'aux-image', name: imageModel.name || 'Aux Image' }] : [] };
}

inferenceRoutes.get('/ai/catalog/v1', async c => c.json(await hostedCatalog()));
inferenceRoutes.get('/ai/models/v2', async c => c.json(await hostedCatalog()));
// The supplied runtime has a separate optional refresh catalog. An empty override set preserves its built-in providers.
inferenceRoutes.get('/ai/model-catalog/v1/providers/:providerId', c => c.json({ error: 'No catalog override.' }, 404));

/** Never copy client providerOptions, headers, credentials, routing, retention, or URL overrides. */
export function safeTextRequest(body: Json, target: string, protocol: 'responses' | 'messages' | 'chat'): Json {
  const fields = protocol === 'responses'
    ? ['input', 'instructions', 'tools', 'tool_choice', 'parallel_tool_calls', 'temperature', 'top_p', 'reasoning', 'text', 'stream', 'include', 'max_output_tokens']
    : protocol === 'messages'
      ? ['messages', 'system', 'tools', 'tool_choice', 'temperature', 'top_p', 'top_k', 'stop_sequences', 'thinking', 'stream', 'max_tokens']
      : ['messages', 'tools', 'tool_choice', 'parallel_tool_calls', 'temperature', 'top_p', 'stop', 'reasoning_effort', 'response_format', 'stream', 'max_completion_tokens'];
  if (body.background === true || body.previous_response_id || body.conversation) fail(400, 'Stored or background model conversations are not supported.');
  if (body.tools !== undefined && (!Array.isArray(body.tools) || body.tools.some(tool => !tool || typeof tool !== 'object' || (('type' in tool) && (tool as Json).type !== 'function')))) fail(400, 'Only client-executed function tools are supported.');
  const clean: Json = Object.fromEntries(fields.filter(field => body[field] !== undefined).map(field => [field, body[field]]));
  if (protocol === 'responses' ? body.input === undefined : !Array.isArray(body.messages)) fail(400, 'The request has no model input.');
  const outputField = protocol === 'responses' ? 'max_output_tokens' : protocol === 'messages' ? 'max_tokens' : 'max_completion_tokens';
  const output = body[outputField] ?? 4096;
  if (typeof output !== 'number' || !Number.isInteger(output) || output < 1 || output > 8192) fail(400, 'Output token limit must be between 1 and 8192.');
  clean[outputField] = output;
  if (clean.stream !== undefined && typeof clean.stream !== 'boolean') fail(400, 'Invalid streaming option.');
  if (protocol === 'responses' || protocol === 'chat') clean.store = false;
  clean.model = target;
  clean.providerOptions = { gateway: strictGateway };
  return clean;
}

type TokenUsage = { input: number; output: number };
export function tokenUsage(value: unknown): Partial<TokenUsage> | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const object = value as Json;
  const usage = (object.usage ?? (object.response as Json | undefined)?.usage ?? (object.message as Json | undefined)?.usage) as Json | undefined;
  if (!usage || typeof usage !== 'object') return undefined;
  const rawInput = usage.input_tokens ?? usage.prompt_tokens;
  const input = typeof rawInput === 'number' ? rawInput + Number(usage.cache_read_input_tokens ?? 0) + Number(usage.cache_creation_input_tokens ?? 0) : undefined;
  const output = usage.output_tokens ?? usage.completion_tokens;
  const result: Partial<TokenUsage> = {};
  if (typeof input === 'number' && Number.isSafeInteger(input) && input >= 0) result.input = input;
  if (typeof output === 'number' && Number.isSafeInteger(output) && output >= 0) result.output = output;
  return Object.keys(result).length ? result : undefined;
}

export function inferenceCost(pricing: Model['pricing'], input: number, output: number): number {
  const tier = (base: string | undefined, tiers: PriceTier[] | undefined) => Number(tiers?.find(tier => input >= tier.min && (tier.max === undefined || input < tier.max))?.cost ?? base);
  const inputRate = Math.max(tier(pricing?.input, pricing?.input_tiers), tier(pricing?.input_cache_write || '0', pricing?.input_cache_write_tiers));
  const outputRate = tier(pricing?.output, pricing?.output_tiers);
  if (!pricing || pricing.varies_by_provider || !Number.isFinite(inputRate) || !Number.isFinite(outputRate) || inputRate < 0 || outputRate <= 0) fail(503, 'The configured model has no verified price.');
  // Catalog prices are dollars per token. Reserve microdollars plus a 20% operating margin.
  return Math.max(1, Math.ceil((input * inputRate + output * outputRate) * 1_000_000 * 1.2));
}

async function upstream(body: Json, path: string, request: Request, extraHeaders: Record<string, string> = {}) {
  return fetch(`${gatewayOrigin}${path}`, { method: 'POST', headers: { Authorization: `Bearer ${gatewayKey()}`, 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body), redirect: 'error', signal: AbortSignal.any([request.signal, AbortSignal.timeout(150_000)]) });
}

async function safeUpstreamError(response: Response): Promise<never> {
  await response.body?.cancel();
  // Provider bodies can echo prompts, file contents, or upstream credentials. Do not relay or log them.
  if (response.status === 429) throw new HTTPException(429, { message: 'The AI service is busy. Please try again shortly.' });
  if (response.status === 400 || response.status === 422) fail(422, 'The model could not accept this request under the required privacy policy.');
  fail(502, 'The AI service could not complete this request.');
}

async function forwardText(c: Context<Env>, protocol: 'responses' | 'messages' | 'chat') {
  const body = await jsonBody(c);
  const { model } = await selectedTextModel(body.model);
  const clean = safeTextRequest(body, model.id, protocol);
  const inputBytes = encoder.encode(JSON.stringify(clean)).byteLength;
  gatewayKey(); // Validate configuration before reserving usage.
  const output = Number(clean.max_output_tokens ?? clean.max_tokens ?? clean.max_completion_tokens);
  // UTF-8 bytes conservatively bound text tokens; reserve image-heavy input at the same conservative bound.
  const reserved = inferenceCost(model.pricing, inputBytes, output);
  const reservation = await reserveUsage(c.get('user').id, 'inference_micros', reserved);
  let dispatched = false;
  let settled = false;
  const settle = async (usage?: Partial<TokenUsage>) => {
    const units = usage?.input !== undefined && usage.output !== undefined ? inferenceCost(model.pricing, usage.input, usage.output) : reserved;
    if (settled) return;
    settled = true;
    await settleUsage(reservation, { succeeded: dispatched, units: Math.max(0, Math.ceil(units)) });
  };
  try {
    const paths = { responses: '/v1/responses', messages: '/v1/messages', chat: '/v1/chat/completions' };
    dispatched = true;
    const response = await upstream(clean, paths[protocol], c.req.raw, protocol === 'messages' ? { 'anthropic-version': '2023-06-01' } : {});
    if (!response.ok) { await settle(); return await safeUpstreamError(response); }
    if (!response.body) { await settle(); return fail(502, 'The AI service returned an empty response.'); }
    if (!clean.stream) {
      const bytes = await boundedBody(new Request('https://internal.invalid', { method: 'POST', body: response.body, duplex: 'half' } as RequestInit), 16 * 1024 * 1024);
      let payload: unknown;
      try { payload = JSON.parse(new TextDecoder().decode(bytes)); } catch { await settle(); return fail(502, 'The AI service returned an invalid response.'); }
      await settle(tokenUsage(payload));
      return new Response(bytes, { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let partial = '';
    const units: Partial<TokenUsage> = {};
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const chunk = await reader.read();
          if (chunk.done) { await settle(units); reader.releaseLock(); controller.close(); return; }
          // Read only usage metadata while passing the original provider protocol through unchanged.
          partial += decoder.decode(chunk.value, { stream: true });
          const lines = partial.split('\n');
          partial = lines.pop() || '';
          for (const line of lines) if (line.startsWith('data:') && line.length < 65_536) {
            try { const found = tokenUsage(JSON.parse(line.slice(5).trimStart())); if (found?.input !== undefined) units.input = Math.max(units.input ?? 0, found.input); if (found?.output !== undefined) units.output = Math.max(units.output ?? 0, found.output); } catch { /* Not every SSE event is JSON. */ }
          }
          if (partial.length > 65_536) partial = '';
          controller.enqueue(chunk.value);
        } catch (error) { await settle(); controller.error(error); }
      },
      async cancel(reason) { try { await reader.cancel(reason); } finally { await settle(); } },
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' } });
  } catch (error) { await settle(); throw error; }
}

inferenceRoutes.post('/ai/v1/responses', c => forwardText(c, 'responses'));
inferenceRoutes.post('/ai/messages', c => forwardText(c, 'messages'));
inferenceRoutes.post('/ai/v1/messages', c => forwardText(c, 'messages'));
inferenceRoutes.post('/ai/v1/chat/completions', c => forwardText(c, 'chat'));

const audioTypes = new Set(['audio/webm', 'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/flac']);
inferenceRoutes.post('/stt/transcribe', async c => {
  if (c.req.header('content-type')?.toLowerCase().startsWith('application/json')) {
    const body = await jsonBody(c);
    if (typeof body.uploadId !== 'string' || Object.keys(body).some(key => !['uploadId','language'].includes(key))) fail(400, 'Expected a private audio input reference.');
    return withInferenceUploads(c.get('user').id, [body.uploadId], async ([input]) => transcribeFile(c, new File([new Uint8Array(input!.bytes)], 'recording', { type: input!.mimeType }), body.language ?? null));
  }
  if (!c.req.header('content-type')?.toLowerCase().startsWith('multipart/form-data;')) fail(415, 'Expected an audio upload.');
  const bytes = await boundedBody(c.req.raw);
  let form: FormData;
  try { form = await new Response(bytes, { headers: { 'Content-Type': c.req.header('content-type')! } }).formData(); }
  catch { return fail(400, 'Invalid audio upload.'); }
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) fail(400, 'Missing audio file.');
  if (file.size > maxAudio) fail(413, 'Audio must be 3 MB or smaller.');
  return transcribeFile(c, file, form.get('language'));
});

async function transcribeFile(c: Context<Env>, file: File, language: unknown) {
  const mediaType = file.type.split(';')[0]!.toLowerCase();
  if (!audioTypes.has(mediaType)) fail(415, 'This audio format is not supported.');
  if (language !== null && (typeof language !== 'string' || !/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8}){0,3}$/.test(language))) fail(400, 'Invalid transcription language.');
  const audio = Buffer.from(await file.arrayBuffer());
  assertInputSignature(audio, mediaType);
  const reservedSeconds = await audioReservationSeconds(audio, mediaType);
  const model = await verifiedModel(process.env.AUX_STT_MODEL || 'spacexai/grok-stt', 'transcription');
  if (model.id.startsWith('microsoft/') && ['audio/webm', 'audio/mp4', 'audio/m4a', 'audio/x-m4a'].includes(mediaType)) fail(415, 'The configured transcription model does not accept this recording format.');
  verifyUnitPrice('transcription', model.pricing?.transcription_duration_cost_per_second, 28);
  gatewayKey();
  const reservation = await reserveUsage(c.get('user').id, 'transcription', reservedSeconds);
  let dispatched = false;
  try {
    const providerOptions: Json = { gateway: strictGateway };
    if (language) providerOptions[model.id.startsWith('microsoft/') ? 'azure' : 'xai'] = model.id.startsWith('microsoft/') ? { locales: [language] } : { language: String(language).split('-')[0] };
    dispatched = true;
    const response = await upstream({ audio: audio.toString('base64'), mediaType, providerOptions }, '/v4/ai/transcription-model', c.req.raw,
      { 'ai-gateway-protocol-version': '0.0.1', 'ai-transcription-model-specification-version': '4', 'ai-model-id': model.id });
    if (!response.ok) { dispatched = false; return await safeUpstreamError(response); }
    const result = await response.json() as Json;
    if (typeof result.text !== 'string') fail(502, 'The transcription service returned an invalid response.');
    const duration = typeof result.durationInSeconds === 'number' && Number.isFinite(result.durationInSeconds) ? result.durationInSeconds : reservedSeconds;
    // Charge the actual duration, including recordings longer than the UI's 90-second limit.
    await settleUsage(reservation, { succeeded: true, units: Math.max(1, Math.ceil(duration)) });
    dispatched = false;
    return c.json({ text: result.text.trim() });
  } catch (error) { await settleUsage(reservation, { succeeded: dispatched }); throw error; }
}

inferenceRoutes.get('/speech/config', async c => c.json({ transcription: { enabled: hostedAiEnabled(), maxUploadBytes: MAX_INFERENCE_BYTES, inlineUploadBytes: maxAudio, privateUploadPurpose: 'inference' }, speech: { enabled: hostedAiEnabled() }, realtime: { enabled: false, reason: 'No desktop consumer; ZDR-locked delegated sessions are not enabled.' } }));
inferenceRoutes.post('/tts/synthesize', async c => {
  const body = await jsonBody(c);
  if (typeof body.text !== 'string' || !body.text.trim() || body.text.length > 10_000) fail(400, 'Speech text must contain 1 to 10000 characters.');
  const model = await verifiedModel(process.env.AUX_TTS_MODEL || 'microsoft/mai-voice-2.1-flash', 'speech');
  const voice = typeof body.voice === 'string' && /^[A-Za-z0-9-]{1,60}$/.test(body.voice) ? body.voice : 'en-US-Harper';
  verifyUnitPrice('speech', model.pricing?.speech_input_character_cost, 15);
  gatewayKey();
  const reservation = await reserveUsage(c.get('user').id, 'speech', body.text.length);
  let dispatched = false;
  try {
    dispatched = true;
    const response = await upstream({ text: body.text, voice, outputFormat: 'mp3', providerOptions: { gateway: strictGateway } }, '/v4/ai/speech-model', c.req.raw,
      { 'ai-gateway-protocol-version': '0.0.1', 'ai-speech-model-specification-version': '4', 'ai-model-id': model.id });
    if (!response.ok) { dispatched = false; return await safeUpstreamError(response); }
    const result = await response.json() as Json;
    if (typeof result.audio !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(result.audio)) fail(502, 'The speech service returned invalid audio.');
    await settleUsage(reservation, { succeeded: true, units: body.text.length });
    dispatched = false;
    return new Response(Buffer.from(result.audio, 'base64'), { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' } });
  } catch (error) { await settleUsage(reservation, { succeeded: dispatched }); throw error; }
});

inferenceRoutes.post('/ai/images/generations', async c => {
  const body = await jsonBody(c);
  const inputs = body.inputImages ?? [];
  if (!Array.isArray(inputs) || inputs.length > 16) fail(400, 'At most 16 reference images are supported.');
  const ids: string[] = [];
  for (const input of inputs) {
    if (!input || typeof input !== 'object') fail(400, 'Invalid reference image.');
    if ('uploadId' in input) {
      if (typeof input.uploadId !== 'string' || Object.keys(input).length !== 1) fail(400, 'Invalid private image input reference.');
      ids.push(input.uploadId);
    }
  }
  return withInferenceUploads(c.get('user').id, ids, async uploaded => {
    const resolved = inputs.map(image => 'uploadId' in image ? { data: uploaded.find(input => input.id === image.uploadId)!.bytes.toString('base64'), mimeType: uploaded.find(input => input.id === image.uploadId)!.mimeType } : image);
    return generateImages(c, { ...body, inputImages: resolved });
  });
});

async function generateImages(c: Context<Env>, body: Json) {
  if (body.model !== 'aux-image') fail(400, 'Choose an available Aux image model.');
  if (typeof body.prompt !== 'string' || !body.prompt.trim() || body.prompt.length > 32_000) fail(400, 'An image prompt must contain 1 to 32000 characters.');
  const inputs = (body.inputImages ?? []) as { data: string; mimeType: string }[];
  let total = 0;
  for (const image of inputs) {
    if (!image || !['image/png', 'image/jpeg', 'image/webp'].includes(image.mimeType) || typeof image.data !== 'string' || image.data.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data)) fail(400, 'Invalid reference image.');
    const bytes = Buffer.from(image.data, 'base64'); total += bytes.length;
    if (total > MAX_INFERENCE_BYTES) fail(413, 'Reference images must total 20 MiB or less.');
    assertInputSignature(bytes, image.mimeType);
  }
  const model = await verifiedModel(process.env.AUX_IMAGE_MODEL || 'meta/muse-image-1.0', 'image');
  verifyUnitPrice('images', model.pricing?.image, 100000);
  gatewayKey();
  const reservation = await reserveUsage(c.get('user').id, 'images', 1);
  let dispatched = false;
  try {
    dispatched = true;
    const result = await generateGatewayImages({ modelId:model.id, prompt:body.prompt as string, inputs, apiKey:gatewayKey(), signal:AbortSignal.any([c.req.raw.signal,AbortSignal.timeout(150_000)]) });
    const images = result.map(data => ({ type: 'image', data, mimeType: imageMimeType(data) }));
    if (!images?.length) fail(502, 'The image service returned no image.');
    await settleUsage(reservation, { succeeded: true, units: 1 });
    dispatched = false;
    return c.json({ model: 'aux-image', images });
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number' && error.statusCode >= 400) dispatched=false;
    await settleUsage(reservation, { succeeded: dispatched }); throw error;
  }
}

export function imageMimeType(base64: string): string {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return fail(502, 'The image service returned invalid image data.');
  const bytes = Buffer.from(base64, 'base64');
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  return fail(502, 'The image service returned an unsupported image format.');
}

function verifyUnitPrice(kind: string, dollars: string | undefined, defaultRate: number): void {
  const price = Number(dollars);
  const allowance = Number(process.env[`AUX_RATE_${kind.toUpperCase()}_MICROS`] || defaultRate);
  if (dollars === undefined || !Number.isFinite(price) || price < 0 || !Number.isFinite(allowance) || allowance < price * 1_000_000) fail(503, 'The configured model price exceeds the service allowance.');
}
