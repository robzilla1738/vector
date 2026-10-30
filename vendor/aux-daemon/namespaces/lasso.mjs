/** The `lasso` tRPC namespace: rewrites a selection on the page with the default overlay model and
 * streams the text back. A failure before any text arrives is sent as a prefixed message, so the
 * page can show it; a failure mid-stream errors the stream. Model resolution and the agent loop
 * stay the supplied ones. */
export function create({lasso: l}) {
  /** The error a missing model or credential reads as. */
  const unavailable = (registry, selection) => registry.hasSupportedModel(selection.modelId, selection.provider)
    ? registry.isManagedAuthProvider(selection.provider) ? Error(`Authentication failed for "${selection.provider}".`) : Error(`No API key found for "${selection.provider}".`)
    : Error(`Model not found: ${selection.modelId}`);

  const transform = async ({ctx, input}) => {
    const selection = await l.resolveDefaultOverlayModel(ctx.accountId), registry = l.models(ctx.accountId);
    const resolved = await registry.resolve(selection.modelId, selection.provider);
    if (!resolved) throw unavailable(registry, selection);
    const encoder = new TextEncoder();
    return l.createTextStreamResponse(new ReadableStream({
      async start(controller) {
        let streamed = false;
        const agent = new l.Agent({
          streamFn: l.modelRuntime.streamSimple.bind(l.modelRuntime), sessionId: 'aux:aux:lasso',
          initialState: {systemPrompt: l.createOverlaySystemPrompt(input.selection), model: resolved.model, thinkingLevel: selection.thinkingLevel, messages: []},
          getApiKey: async provider => {
            if (provider === resolved.model.provider && resolved.apiKey !== undefined) return resolved.apiKey;
            const apiKey = await registry.getApiKeyForProvider(provider);
            if (apiKey === undefined) throw registry.isUsingManagedAuth(resolved.model) ? Error(`Authentication failed for "${provider}".`) : Error(`No API key found for "${provider}".`);
            return apiKey;
          },
          transport: resolved.model.api === 'openai-codex-responses' ? 'websocket-cached' : undefined,
        });
        const unsubscribe = agent.subscribe(async event => {
          if (event.type === 'message_update' && event.message.role === 'assistant' && event.assistantMessageEvent.type === 'text_delta') {
            streamed = true;
            controller.enqueue(encoder.encode(event.assistantMessageEvent.delta));
          }
        });
        try {
          await agent.prompt(await l.createOverlayMessages(input.selection, input.messages));
          const reply = agent.state.messages.findLast(message => message.role === 'assistant'), error = l.getAssistantErrorMessage(reply);
          if (error) throw Error(error);
          if (!streamed && reply) {
            const text = l.getAssistantTextContent(reply);
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          if (streamed) {
            controller.error(error);
            return;
          }
          controller.enqueue(encoder.encode(`${l.streamErrorPrefix}${error instanceof Error ? error.message : 'Failed to generate a response.'}`));
          controller.close();
        } finally {
          unsubscribe();
        }
      },
    }));
  };
  return {transform: l.extensionOnlyProcedure.meta({method: 'POST', path: '/lasso/transform'}).input(l.inputSchema).mutation(transform)};
}
