import { Hono } from 'hono';

// Aux funds no AI: users connect their own provider in the desktop app. The
// supplied client still asks for a hosted catalog and speech configuration, so
// those answer "nothing hosted"; every hosted inference route is unavailable.
const emptyCatalog = { provider: 'aux', models: [], visibleModelIds: [], imageModels: [] };
const unavailable = { error: 'Aux-hosted AI is not offered. Connect your own provider in Aux.' };

export const inferenceRoutes = new Hono();
inferenceRoutes.get('/ai/catalog/v1', c => c.json(emptyCatalog));
inferenceRoutes.get('/ai/models/v2', c => c.json(emptyCatalog));
inferenceRoutes.get('/ai/model-catalog/v1/providers/:providerId', c => c.json({ error: 'No catalog override.' }, 404));
inferenceRoutes.get('/speech/config', c => c.json({ transcription: { enabled: false, maxUploadBytes: 0, inlineUploadBytes: 0, privateUploadPurpose: null }, speech: { enabled: false }, realtime: { enabled: false, reason: 'Aux-hosted speech is not offered.' } }));
for (const path of ['/ai/*', '/stt/*', '/tts/*']) inferenceRoutes.all(path, c => c.json(unavailable, 404));
