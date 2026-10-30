/** The terminal tools: bash, bash_interact and the background terminals and monitors. Spawning,
 * the sandbox and the process table stay the supplied ones. */
import {BG_KILL, BG_LIST, BG_MONITOR, BG_START, BG_STATUS, BASH_INTERACT, BACKGROUND_AFTER_MS, MAX_TIMEOUT_MS, SLEEP_GUIDANCE, TIMEOUT_GUIDANCE, bashDescription} from './prompts.mjs';
import {MONITOR_DEFAULT_TIMEOUT_MS, MONITOR_MAX_TIMEOUT_MS, MONITOR_MIN_TIMEOUT_MS, toolSchemas} from './schemas.mjs';
import {reply} from './common.mjs';

export function create({typebox, tools: t}) {
  const schemas = toolSchemas(typebox);

  function createTerminalTool(context) {
    return process.platform === 'win32' ? t.createPowerShellTool(context) : createBashTool(context);
  }

  function createBashTool(context, options = {}) {
    const mode = options.moveToBackground ? 'background' : 'stop';
    return {
      name: 'bash', label: 'Bash', description: bashDescription(t.isCloudRuntime()) + TIMEOUT_GUIDANCE[mode], parameters: schemas.bash,
      execute: async (id, {title, command, tty = false, yield_ms: yieldMs, timeout_ms: timeout}, signal) => {
        if (!tty && yieldMs === undefined) {
          const blocked = t.blockedSleepReason(command, SLEEP_GUIDANCE[mode]);
          if (blocked) throw Error(blocked);
          return t.runSessionBash(context, command, {...options, signal, title, timeoutMs: t.resolveTimeoutMs(timeout, options.moveToBackground ? BACKGROUND_AFTER_MS : MAX_TIMEOUT_MS)});
        }
        const combined = AbortSignal.any([context.execSessions.signal, ...signal ? [signal] : []]);
        const {spawnOptions, release} = await t.prepareSessionSpawn(context, {signal: combined});
        return t.executeYieldedCommand({command: ['bash', '-c', command], execSessions: context.execSessions, runtime: 'local-bash', signal: combined, spawnOptions, tty, yieldMs, onExit: release});
      },
    };
  }

  function createTerminalInteractTool(context) {
    return {
      name: 'bash_interact', label: 'Bash interact', description: BASH_INTERACT, parameters: schemas.bashInteract,
      execute: async (id, input, signal) => {
        try {
          const session = context.execSessions.get(input.exec_session_id);
          const waitMs = Math.min(3e4, Math.max(250, input.wait_ms ?? (input.input !== undefined || input.signal || input.resize ? 250 : 5e3)));
          const {text: output, status, exitCode} = await session.interact({input: input.input, resize: input.resize, signal: input.signal, waitMs}, signal);
          const state = status === 'running' ? `[session ${session.id} still running]` : `[session ${session.id} ${status}${exitCode === undefined ? '' : ` with exit code ${exitCode}`}]`;
          return {...reply([output, state].filter(Boolean).join('\n'), {runtime: 'local-terminal', tty: session.tty, execSessionId: session.id, status, exitCode}), isError: false};
        } catch (error) {
          return {...reply(error instanceof Error ? error.message : String(error), {runtime: 'local-terminal'}), isError: true};
        }
      },
    };
  }

  /** What bg_kill says of one process, having stopped it. */
  async function kill(entry) {
    const wasRunning = entry.state.status === 'running', leftovers = !wasRunning && t.groupAlive(entry), stopped = await t.stop(entry, 'kill');
    entry.unreported = false;
    const label = `${entry.id} "${entry.title}"`;
    if (!stopped) return `${label} did not stop: processes in its group are still running after SIGKILL.`;
    if (!wasRunning) return `${label} was already ${entry.state.status} (${t.formatExit(entry)})${leftovers ? '; killed the processes it left running' : ''}.`;
    return entry.state.status === 'killed' ? `Killed ${label} (${t.formatExit(entry)}).` : `${label} exited on its own before the kill landed (${t.formatExit(entry)}).`;
  }

  function createBackgroundProcessTools(context) {
    return {
      bg_start: {name: 'bg_start', label: 'Start Background Terminal', description: BG_START, parameters: schemas.bgStart,
        execute: async (id, input, signal) => {
          const {id: processId, title, pid, cwd} = await t.start(context, id, {...input, kind: 'terminal'}, signal);
          return reply(`Started background terminal ${processId} "${title}" (pid ${pid ?? '?'}, ${cwd}).\nIt runs in the background with no stdin. You'll get a message when it exits, or use bg_status(id: "${processId}") to peek, bg_kill to stop it, bg_list to see all.`, {id: processId, pid, cwd});
        }},
      bg_monitor: {name: 'bg_monitor', label: 'Start Monitor', description: BG_MONITOR, parameters: schemas.bgMonitor,
        execute: async (id, {description, timeout_ms: requested, ...input}, signal) => {
          const timeoutMs = Math.min(Math.max(Math.round(requested ?? MONITOR_DEFAULT_TIMEOUT_MS), MONITOR_MIN_TIMEOUT_MS), MONITOR_MAX_TIMEOUT_MS);
          const {id: processId, title, pid, cwd} = await t.start(context, id, {...input, title: description, kind: 'monitor', timeoutMs}, signal);
          return reply(`Started monitor ${processId} "${title}" (pid ${pid ?? '?'}, ${cwd}). It expires in ${Math.round(timeoutMs / 6e4)}m.\nEach stdout line arrives as an event message, and events wake you when you are idle, so you can end your turn to wait. Use bg_kill(ids: ["${processId}"]) to stop it early.`, {id: processId, pid, cwd});
        }},
      bg_status: {name: 'bg_status', label: 'Check Background Terminal', description: BG_STATUS, parameters: schemas.bgStatus,
        execute: async (id, {id: processId}) => {
          const entry = t.find(context, processId);
          entry.unreported = false;
          return reply([t.describe(entry), entry.state.status === 'failed' && `Error: ${entry.state.error}`, t.outputSection('stdout', entry.stdout, t.STATUS_STDOUT),
            t.outputSection('stderr', entry.stderr, t.STATUS_STDERR)].filter(Boolean).join('\n\n'), {id: processId, status: entry.state.status});
        }},
      bg_list: {name: 'bg_list', label: 'List Background Terminals', description: BG_LIST, parameters: schemas.bgList,
        execute: async () => {
          const entries = t.processesBySession.get(t.entryKey(context.accountId, context.session.id)) ?? [];
          return reply(entries.length ? entries.map(t.describe).join('\n') : 'No background terminals.', {count: entries.length});
        }},
      bg_kill: {name: 'bg_kill', label: 'Kill Background Terminals', description: BG_KILL, parameters: schemas.bgKill,
        execute: async (id, input) => {
          const ids = [...new Set(input.ids)];
          if (ids.length === 0) throw Error('Provide at least one terminal id.');
          const entries = ids.map(processId => t.find(context, processId));
          return reply((await Promise.all(entries.map(kill))).join('\n'), {ids});
        }},
    };
  }

  return {createTerminalTool, createBashTool, createTerminalInteractTool, createBackgroundProcessTools};
}
