/** The tools that reach other agents: subagent, subagent_wait, message_agent, start_coder, workflow
 * and structured_output. Sessions, the coder and the workflow runner stay the supplied ones. */
import {randomUUID} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import path from 'node:path';
import {DELIVERY_TEXT, MESSAGE_AGENT, START_CODER, SUBAGENT_WAIT, WORKFLOW, subagentDescription} from './prompts.mjs';
import {toolSchemas} from './schemas.mjs';
import {reply} from './common.mjs';

export function create({typebox, tools: t}) {
  const schemas = toolSchemas(typebox);

  const profiles = hidden => Object.entries(t.SUBAGENT_PROFILES).filter(([name, profile]) => !profile.hideFromAgent && !hidden.includes(name))
    .map(([name, {description, modelCategory}]) => `- ${name}: ${description} (model_category: ${modelCategory})`).join('\n');

  async function requestApproval(context, id, {task_id: taskId, request_id: requestId}) {
    if (!taskId || !requestId) throw Error('request_approval requires task_id and request_id');
    const held = context.session.suspension;
    const replayed = held?.kind === 'approval' && held.toolCallId === id && held.request.source?.taskId === taskId && held.request.source.requestId === requestId && (held.response || held.error);
    const request = replayed ? held.request : {scope: t.getSubagentApproval(context.accountId, context.session.id, taskId, requestId).request.scope, source: {taskId, requestId}};
    const {verdict} = await context.suspend('approval', id, request);
    return reply(`User ${verdict === 'allow' ? 'allowed' : 'denied'} request ${requestId} for subagent ${taskId}. Use subagent_wait for its result.`, {taskId, requestId, verdict});
  }

  async function spawn(context, id, input, hidden, signal) {
    if (!input.description?.trim() || !input.prompt?.trim()) throw Error('spawn requires description and prompt');
    const blank = input.model && !input.model.provider.trim() && !input.model.modelId.trim(), model = blank ? undefined : input.model;
    if (model && input.model_category !== undefined) throw Error('spawn cannot combine model with model_category');
    if (model && (!model.provider.trim() || !model.modelId.trim())) throw Error('model requires provider and modelId');
    if (input.subagent_profile && hidden.includes(input.subagent_profile)) throw Error(`${input.subagent_profile} is not available here.`);
    const task = await t.spawnSubagent({accountId: context.accountId, parentSession: context.session, toolCallId: id, description: input.description, prompt: input.prompt, subagentProfile: input.subagent_profile,
      model: model ? {provider: model.provider.trim(), modelId: model.modelId.trim()} : undefined, modelCategory: input.model_category, parentModel: context.getModelSelection(), parentTracking: {isBackground: !!input.run_in_background}});
    if (input.run_in_background) {
      const {text, details} = t.describeRunning(task);
      return reply(`${text}\nyou will be notified for result.`, details);
    }
    const [result] = await t.waitForSubagent(context.accountId, context.session, [task.id], signal);
    const {taskId, status, model: used, error, result: output, pendingApproval} = result;
    return reply(`task_id: ${taskId}\nstatus: ${status}\nmodel: ${t.formatModel(used)}${error ? `\nerror: ${error}` : ''}\nresult:\n${output || '(empty result)'}${pendingApproval ? `\npendingApproval: ${JSON.stringify(pendingApproval)}` : ''}`, result);
  }

  const createSubagentTool = (context, hidden = []) => ({
    name: 'subagent', label: 'Subagent', description: subagentDescription(profiles(hidden), t.MAX_ACTIVE_SUBAGENTS), parameters: schemas.subagent,
    execute: async (id, {action, ...input}, signal) => {
      switch (action) {
        case 'request_approval':
          return requestApproval(context, id, input);
        case 'list_models': {
          const models = await t.listSubagentModels(context, input.query, input.limit);
          return reply(JSON.stringify(models), models);
        }
        case 'spawn':
          return spawn(context, id, input, hidden, signal);
        case 'resume': {
          if (!input.task_id?.trim() || !input.prompt?.trim()) throw Error('resume requires task_id and prompt. Use subagent_wait to read completed background results.');
          const {text, details} = t.describeRunning(await t.resumeSubagent({accountId: context.accountId, parentSession: context.session, taskId: input.task_id, message: input.prompt, unawaited: context.session.harnessId === 'coder'}));
          return reply(text, details);
        }
        default:
          throw Error(`Invalid input: ${JSON.stringify(input)}`);
      }
    },
  });

  const waitResult = ({taskId, status, model, error, result, pendingApproval}) => `<subagent_result task_id="${taskId}" status="${status}" model="${t.formatModel(model)}">
${error ?? (result || (status === 'running' ? '(still running)' : '(empty result)'))}${pendingApproval ? `\npendingApproval: ${JSON.stringify(pendingApproval)}` : ''}
</subagent_result>`;

  const createSubagentWaitTool = context => ({
    name: 'subagent_wait', label: 'Subagent wait', description: SUBAGENT_WAIT, parameters: schemas.subagentWait,
    execute: async (id, {task_ids: taskIds}, signal) => {
      const {results, messaged} = await t.waitUnlessMessaged(context, taskIds, signal);
      return reply(`${results.map(waitResult).join('\n\n') || 'No subagent results.'}${messaged ? '\n\nReturned early: a message for you arrived and is shown next. Call subagent_wait again to keep waiting.' : ''}`, {taskIds, results});
    },
  });

  const createMessageAgentTool = context => ({
    name: 'message_agent', label: 'Message agent', description: MESSAGE_AGENT, parameters: schemas.messageAgent,
    execute: async (id, {action = 'send', to, message}) => {
      const {accountId, session} = context;
      if (action === 'list') {
        const peers = t.listActiveAgents(accountId, session);
        return reply(peers.length ? t.formatAgentList(peers) : 'No other Aux agents are active in this Project.', {peers});
      }
      const target = to?.trim() || t.delegatorOf(session);
      if (!target) throw Error('`to` is required: pass a task id from the list action.');
      if (!message?.trim()) throw Error('`message` is required.');
      if (t.isReadOnlySubagent(session) && target !== session.parentId) throw Error('Read-only subagents can only message their parent.');
      await t.approveEscalation(context, id, target, message);
      const {recipient, delivery} = await t.sendAgentMessage(accountId, session, target, message);
      const wakes = recipient.trigger?.type === 'agent' && recipient.trigger.starterId === session.id && (delivery === 'steered' || delivery === 'woke');
      return reply(`Delivered to ${t.formatAgentLabel(recipient)}: ${DELIVERY_TEXT[delivery]}${wakes ? ' Its reply reaches you as a message that starts your next turn: do not poll it, end your turn.' : ''}`,
        {recipientId: recipient.id, recipientTitle: recipient.title, delivery});
    },
  });

  const createStartCoderTool = context => ({
    name: 'start_coder', label: 'Start Aux Code', description: START_CODER, parameters: schemas.startCoder,
    execute: async (id, input) => {
      const model = input.model?.provider.trim() || input.model?.modelId.trim() ? input.model : undefined;
      const started = await t.startCoder(context, id, {title: input.description.trim(), prompt: input.prompt, workingDir: input.working_dir, model, toolCallAt: t.callTimestamp(context, id)});
      return reply(`Started Aux Code ${started.taskId} "${started.title}" in ${started.cwd} (${started.model.provider}/${started.model.modelId}). The user sees it as a card here. Tell the user in one sentence that Aux Code is on it, then end your turn.`, started);
    },
  });

  function createWorkflowTool(context) {
    return {
      name: 'workflow', label: 'Workflow', description: WORKFLOW, parameters: schemas.workflow,
      execute: async (id, {script, args, background = false}, signal) => {
        const runId = `wf-${randomUUID().slice(0, 8)}`, runDir = t.sessionTmpDir(context.sessionDir, 'workflows', runId);
        await writeFile(path.join(runDir, 'script.js'), script, {flag: 'wx'});
        const run = {toolCallId: id, runId, runDir, script, args: t.parseArgs(args)};
        if (!background) return reply((await t.runWorkflow(context, {...run, signal})).text, {runId, runDir});
        const controller = new AbortController();
        const done = t.runWorkflow(context, {...run, signal: controller.signal, background}).catch(error => ({status: 'failed', text: `Workflow ${runId} failed: ${t.errorText(error)}`}))
          .then(({text, status}) => t.notify(context.accountId, context.session.id, runId, status, text)).finally(() => t.backgroundRuns.delete(runId));
        t.backgroundRuns.set(runId, {accountId: context.accountId, sessionId: context.session.id, controller, done});
        return reply(`Workflow launched in background (run ${runId}).\nArtifacts: ${runDir}\nYou'll receive a follow-up message when it finishes.`, {runId, runDir, background});
      },
    };
  }

  function structuredOutputTool(schema, record) {
    return {
      name: 'structured_output', label: 'Structured Output', description: 'Return your final result as structured data matching the required schema. Call this exactly once, as your last action; do not write any other text after it.',
      parameters: schemas.structuredOutput(schema),
      execute: async (id, input) => {
        record(input);
        return {...reply('Recorded structured result.', input), terminate: true};
      },
    };
  }

  return {createSubagentTool, createSubagentWaitTool, createMessageAgentTool, createStartCoderTool, createWorkflowTool, structuredOutputTool};
}
