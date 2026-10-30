/** The tools that talk to the user or keep a task's own state: get_time, write_todos, notification,
 * ask_user_question, the action confirmation, repl, routines and automations. */
import {ACTION_CONFIRMATION, ASK_USER_QUESTION, AUTOMATION_CREATE, NOTIFICATION, NOTIFY_PARENT, ROUTINE_UPDATE, WRITE_TODOS} from './prompts.mjs';
import {toolSchemas} from './schemas.mjs';
import {reply, text} from './common.mjs';

const MIN_INTERVAL_MS = 6e4, MAX_INTERVAL_MS = 6048e5, MAX_AUTOMATIONS = 10, MAX_PROMPT_CHARS = 4e3;

export function create({typebox, tools: t}) {
  const schemas = toolSchemas(typebox);

  const createGetTimeTool = () => ({
    name: 'get_time', label: 'Get Time', description: 'Get the user\'s current date, time, and timezone.', parameters: schemas.getTime,
    execute: async () => reply(new Date().toLocaleString('en-US', {dateStyle: 'full', timeStyle: 'long'}), null),
  });

  const createTodosTool = context => ({
    name: 'write_todos', label: 'Manage Todos', description: WRITE_TODOS, parameters: schemas.todos,
    execute: async (id, {todos, merge = true}) => {
      const previousTodos = context.toolState.todo.todos, updatedTodos = t.mergeTodos(previousTodos, todos, merge);
      context.setToolState(state => ({...state, todo: {...state.todo, todos: updatedTodos}}));
      const lines = updatedTodos.map(todo => `- [${todo.status}] ${todo.id}: ${todo.content}`);
      return reply(lines.length > 0 ? `Todo list updated:\n${lines.join('\n')}` : 'Todo list updated.', {previousTodos, updatedTodos});
    },
  });

  const createNotificationTool = context => ({
    name: 'notification', label: 'Notification', description: NOTIFICATION, parameters: schemas.notification,
    execute: async (id, {title, message, requireInteraction, silent}) => {
      const {accountId, session} = context;
      if (!t.getRoutineNotificationPolicy(accountId, session, t.SessionStore.getLatestTurn(accountId, session.id)).enabled)
        return reply('Notification skipped because routine notifications are disabled.', {skipped: true, reason: 'routine_notifications_disabled'});
      if (t.hasForegroundAgentManagerSessionAttention(accountId, session.id))
        return reply('Notification skipped because the user is already viewing this session.', {skipped: true, reason: 'session_visible'});
      const {notificationId} = await t.sendCommandToExtension({method: 'Aux.showNotification', params: {title, message, type: 'basic', requireInteraction, silent}},
        {accountId, profileId: session.browserBinding?.profileId, browserMode: session.browserBinding?.browserMode, windowId: session.browserBinding?.windowId});
      return reply(`Notification shown (id: ${notificationId})`, {notificationId});
    },
  });

  const createAskUserQuestionTool = context => ({
    name: 'ask_user_question', label: 'Ask User Question', description: ASK_USER_QUESTION, parameters: schemas.askUserQuestion, executionMode: 'sequential',
    execute: async (id, {questions}) => {
      const answers = (await context.suspend('ask-user-question', id, {questions})).answers.map(({header, answer}) => `- ${header}: ${answer}`).join('\n');
      return reply(`Asked user ${questions.length} question(s). Received response.\n\nUser responses to asked questions:\n${answers}`, {});
    },
  });

  const createActionConfirmationTool = context => ({
    name: 'request_action_confirmation', label: 'Request Action Confirmation', description: ACTION_CONFIRMATION, parameters: schemas.actionConfirmation, executionMode: 'sequential',
    execute: async (id, input) => {
      const request = t.actionConfirmationRequestSchema.parse(input), {verdict, instruction: given} = await context.suspend('action-confirmation', id, request);
      if (verdict === 'confirm') return reply(`User confirmed the action: ${request.message}\n\nProceed only with the confirmed action.`, {verdict});
      const instruction = given?.trim();
      return reply(instruction ? `User did not confirm. Follow this instruction instead: ${instruction}` : 'User did not confirm. Do not perform the proposed action.', {verdict, instruction});
    },
  });

  const createReplTool = repl => ({
    name: 'repl', label: 'REPL', description: t.replDescription, parameters: schemas.repl, executionMode: 'sequential',
    async execute(id, {code}, signal) {
      const started = performance.now(), {error, content: output} = await repl.run(code, {signal, toolCallId: id}), elapsedMs = performance.now() - started;
      const content = error ? [text(`Error: ${error}`), ...output] : output, contextContent = t.capReplContextContent(content);
      return {content, isError: !!error, details: {elapsedMs, ...contextContent === content ? {} : {contextContent}}};
    },
  });

  function createRoutineUpdateTool(context) {
    return {
      name: 'routine_update', label: 'Update Routine', parameters: schemas.routineUpdate, description: ROUTINE_UPDATE,
      execute: async (id, input) => {
        const {accountId, session} = context;
        if (session.routineId) throw Error('Routine runs cannot manage routines.');
        if (input.mode !== 'create') {
          if (!input.id || !t.getRoutine(accountId, input.id, {projectId: session.projectId})) throw Error('Routine not found.');
          if (input.mode === 'delete') {
            await t.deleteRoutine(accountId, input.id);
            return reply('Routine deleted.', {routineId: input.id});
          }
        }
        const {mode, id: routineId, permissionMode, notificationsEnabled, ...fields} = input;
        const changes = {...fields, ...permissionMode === undefined && notificationsEnabled === undefined ? {} : {sessionConfig: {
          ...permissionMode === undefined ? {} : {permissionMode}, ...notificationsEnabled === undefined ? {} : {notificationsEnabled}}}};
        const origin = mode === 'create' ? (await t.SessionStore.listAllMessageRows(accountId, session.id)).findLast(row => row.msg.role === 'user') : undefined;
        const routine = mode === 'create' ? await t.createRoutine(accountId, {...changes, name: input.name ?? '', prompt: input.prompt ?? '', rrule: input.rrule ?? '', type: 'child', parentSessionId: session.id,
          metadata: origin ? {origin: {type: 'session-message', sessionId: session.id, messageId: origin.id}} : {}}) : await t.updateRoutine(accountId, routineId, changes);
        return reply(`${routine.id}: ${routine.name} (${routine.status})\n${routine.rrule}`, {routineId: routine.id, routine});
      },
    };
  }

  function createRoutineNotifyParentTool(context) {
    return {
      name: 'notify_parent', label: 'Notify Parent', parameters: schemas.notifyParent, description: NOTIFY_PARENT,
      execute: async (id, {message}) => {
        if (!await t.notifyRoutineParent(context.accountId, context.session, message)) throw Error('Routine parent is unavailable.');
        return reply('Queued for the parent.', {});
      },
    };
  }

  function createAutomationTools(context) {
    const {accountId} = context, sessionId = context.session.id, active = () => context.toolState.coder?.automations ?? [];
    const interval = value => {
      const ms = t.parseInterval(value);
      if (ms === undefined) throw Error(`Unrecognized interval "${value}". Use a duration like "30m", "2h", or "1h30m".`);
      if (ms < MIN_INTERVAL_MS || ms > MAX_INTERVAL_MS) throw Error(`Interval must be between ${t.formatInterval(MIN_INTERVAL_MS)} and ${t.formatInterval(MAX_INTERVAL_MS)}.`);
      return ms;
    };
    return {
      automation_create: {name: 'automation_create', label: 'Create Automation', description: AUTOMATION_CREATE, parameters: schemas.automationCreate,
        execute: async (id, input) => {
          const intervalMs = interval(input.interval), prompt = input.prompt.trim();
          if (!prompt) throw Error('prompt must not be empty.');
          if (prompt.length > MAX_PROMPT_CHARS) throw Error(`prompt must be at most ${MAX_PROMPT_CHARS} characters.`);
          if (active().length >= MAX_AUTOMATIONS) throw Error(`Max ${MAX_AUTOMATIONS} automations can be active. Delete one with automation_delete first.`);
          const number = (context.toolState.coder?.automationCount ?? 0) + 1;
          const automation = {id: `au-${number}`, title: input.title.replace(/\s+/g, ' ').trim().slice(0, 80) || 'automation', prompt, intervalMs, maxRuns: input.max_runs, createdAt: Date.now(), runs: 0};
          context.setToolState(state => ({...state, coder: {...state.coder, automationCount: number, automations: [...state.coder?.automations ?? [], automation]}}));
          const {next} = t.arm(accountId, sessionId, automation), runs = automation.maxRuns === undefined ? '' : `, ${t.plural(automation.maxRuns, 'run')}`;
          return reply(`Created automation ${automation.id} "${automation.title}": every ${t.formatInterval(intervalMs)}${runs}, first run at ${t.formatClock(next)}. Each run arrives as a message that starts a new turn, so you can end your turn now. Stop it with automation_delete(ids: ["${automation.id}"]).`,
            {id: automation.id, title: automation.title, intervalMs, maxRuns: automation.maxRuns, next});
        }},
      automation_list: {name: 'automation_list', label: 'List Automations', description: 'List active automations.', parameters: schemas.automationList,
        execute: async () => {
          const timers = t.timersBySession.get(t.entryKey(accountId, sessionId))?.timers;
          const listed = active().map(automation => ({automation, next: timers?.get(automation.id)?.next}));
          const lines = listed.map(({automation, next}) => t.describeAutomation(automation, next));
          return reply(lines.length === 0 ? 'No active automations.' : lines.join('\n'), {automations: listed.map(({automation, next}) => ({id: automation.id, title: automation.title, runs: automation.runs, next}))});
        }},
      automation_delete: {name: 'automation_delete', label: 'Delete Automations', description: 'Delete automations by id.', parameters: schemas.automationDelete,
        execute: async (id, input) => {
          const ids = [...new Set(input.ids)];
          if (ids.length === 0) throw Error('Provide at least one automation id.');
          const current = active(), unknown = ids.filter(wanted => !current.some(automation => automation.id === wanted));
          if (unknown.length > 0) throw Error(`Unknown automation id(s): ${unknown.join(', ')}. Active: ${current.map(automation => automation.id).join(', ') || 'none'}.`);
          const removed = current.filter(automation => ids.includes(automation.id));
          t.setAutomations(accountId, sessionId, automations => automations.filter(automation => !ids.includes(automation.id)));
          for (const removedId of ids) t.disarm(accountId, sessionId, removedId);
          return reply(removed.map(automation => `Deleted ${automation.id} "${automation.title}".`).join('\n'), {ids});
        }},
    };
  }

  return {createGetTimeTool, createTodosTool, createNotificationTool, createAskUserQuestionTool, createActionConfirmationTool, createReplTool,
    createRoutineUpdateTool, createRoutineNotifyParentTool, createAutomationTools};
}
