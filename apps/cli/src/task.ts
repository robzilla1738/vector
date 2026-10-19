import { setTimeout as delay } from 'node:timers/promises';
import { type Client, type Json, object, text } from './client.js';

export type TaskOptions = {
  model?: string;
  provider?: string;
  effort?: string;
  permission?: string;
  speed?: string;
  profile?: string;
};
export async function selection(
  client: Client,
  options: TaskOptions,
): Promise<Record<string, Json>> {
  const result: Record<string, Json> = {
    ephemeral: true,
    permissionMode:
      options.permission === 'full-access' ? 'full-access' : 'guard',
  };
  const effort = options.effort ?? 'medium';
  if (
    ![
      'off',
      'minimal',
      'low',
      'medium',
      'high',
      'xhigh',
      'max',
      'ultrabrowse',
    ].includes(effort)
  )
    throw new Error('Invalid effort.');
  if (
    options.permission &&
    !['ask', 'guard', 'full-access'].includes(options.permission)
  )
    throw new Error('Invalid permission mode.');
  if (options.speed && !['default', 'fast'].includes(options.speed))
    throw new Error('Invalid speed.');
  if (options.model || options.provider || options.effort || options.speed) {
    const stored = await client.scoped('settings.get', {
      key: 'models.default',
    });
    let preferred: Record<string, Json> = {
      provider: 'vercel-ai-gateway',
      modelId: 'meta/muse-spark-1.3-contributor',
    };
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      const value = object(stored);
      const candidate = value.value ?? value;
      if (
        candidate &&
        typeof candidate === 'object' &&
        !Array.isArray(candidate)
      )
        preferred = object(candidate);
    }
    const slash = options.model?.indexOf('/') ?? -1;
    let provider = options.provider ?? text(preferred.provider);
    let modelId = options.model ?? text(preferred.modelId);
    if (options.model && slash >= 0) {
      provider = options.model.slice(0, slash);
      modelId = options.model.slice(slash + 1);
    }
    if (
      options.provider &&
      !options.model &&
      options.provider !== preferred.provider
    ) {
      const available = await client.scoped('models.listAvailable');
      if (!Array.isArray(available))
        throw new Error('Daemon returned an invalid model catalog.');
      const match = available
        .map(object)
        .find((model) => model.provider === provider);
      if (!match)
        throw new Error('No configured model is available for this provider.');
      modelId = text(match.modelId ?? match.id);
    }
    if (!modelId) throw new Error('Model must not be empty.');
    result.model = {
      provider,
      modelId,
      thinkingLevel: effort === 'ultrabrowse' ? 'max' : effort,
      fastMode: options.speed === 'fast',
    };
  }
  if (options.profile)
    result.browserBinding = {
      profileId: options.profile,
      browserMode: 'default',
    };
  result.runtimeConfig = {
    strictModelSelection: Boolean(options.model || options.provider),
    proactiveMode: effort === 'ultrabrowse',
  };
  return result;
}
function messageText(value: Json): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(messageText).join('');
  if (value && typeof value === 'object' && typeof value.text === 'string')
    return value.text;
  return '';
}

export async function executeTask(
  client: Client,
  prompt: string,
  options: TaskOptions,
  sessionId?: string,
  emit: (chunk: string) => void = () => {},
  respond?: (suspension: Json) => Promise<Json>,
): Promise<Json> {
  if (!prompt.trim()) throw new Error('Task prompt must not be empty.');
  let session: Record<string, Json>;
  if (sessionId) {
    await client.scoped('sessions.queue', { sessionId, prompt }, true);
    session = object(await client.scoped('sessions.get', { sessionId }));
  } else {
    const input = await selection(client, options);
    const saved = await client.scoped('settings.get', {
      key: 'cli.saveSessions',
    });
    input.ephemeral =
      saved !== true &&
      !(
        saved &&
        typeof saved === 'object' &&
        !Array.isArray(saved) &&
        saved.value === true
      );
    session = object(
      await client.scoped(
        'sessions.createAndPrompt',
        { ...input, message: prompt },
        true,
      ),
    );
    if (session.session) session = object(session.session);
    sessionId = text(session.id);
  }
  const id = sessionId;
  let cancelled = false;
  let cancelFailure: unknown;
  const abort = () => {
    cancelled = true;
    void client
      .scoped('sessions.abort', { sessionId: id }, true)
      .catch((error: unknown) => {
        cancelFailure = error;
      });
  };
  process.once('SIGINT', abort);
  const seen = new Map<string, string>();
  let finalText = '';
  try {
    while (true) {
      const transcript = await client.scoped('sessions.messages', {
        sessionId: id,
      });
      const rows = Array.isArray(transcript)
        ? transcript
        : object(transcript).messages;
      if (!Array.isArray(rows))
        throw new Error('Daemon returned an invalid transcript.');
      finalText = '';
      for (const row of rows) {
        const message = object(row);
        if (message.role !== 'assistant') continue;
        const content = messageText(message.content ?? message.text ?? '');
        const key = text(message.id);
        const previous = seen.get(key) ?? '';
        if (content.startsWith(previous)) emit(content.slice(previous.length));
        seen.set(key, content);
        finalText += content;
      }
      session = object(await client.scoped('sessions.get', { sessionId: id }));
      if (session.status === 'suspended' && respond && session.suspension) {
        const response = await respond(session.suspension);
        await client.scoped(
          'sessions.resolveSuspension',
          {
            sessionId: id,
            toolCallId: text(object(session.suspension).toolCallId),
            response,
          },
          true,
        );
        continue;
      }
      if (session.status !== 'running') break;
      if (cancelFailure) throw cancelFailure;
      await delay(150);
    }
    if (cancelFailure) throw cancelFailure;
    if (
      cancelled ||
      ['errored', 'aborted', 'interrupted'].includes(text(session.status))
    ) {
      throw new Error(
        typeof session.error === 'string'
          ? session.error
          : `Task ended: ${session.status}`,
      );
    }
    return {
      session_id: id,
      status: session.status ?? 'idle',
      text: finalText,
      ...(session.suspension ? { suspension: session.suspension } : {}),
    };
  } finally {
    process.removeListener('SIGINT', abort);
  }
}
