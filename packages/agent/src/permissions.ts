/** Shared routine permission decisions; daemon/agent.md Suspension and action policy. */
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import type { AgentEngine } from './engine.js';
import { fail } from './storage.js';

const rulesSchema = z.object({
  deny: z.array(z.string()).default([]),
  ask: z.array(z.string()).default([]),
  allow: z.array(z.string()).default([]),
  approved: z.array(z.string()).default([]),
});
function canonicalRule(path: string) {
  const full = resolve(path);
  return existsSync(full)
    ? realpathSync(full)
    : resolve(realpathSync(dirname(full)), full.split('/').at(-1) ?? '');
}
function matches(rule: string, toolName: string, path?: string) {
  if (rule === '*' || rule === toolName || rule === `tool:${toolName}`)
    return true;
  if (rule.startsWith('tool:') && rule.endsWith('*'))
    return toolName.startsWith(rule.slice(5, -1));
  if (!path || !isAbsolute(rule)) return false;
  const suffix = relative(canonicalRule(rule), path);
  return suffix === '' || (!suffix.startsWith('..') && !isAbsolute(suffix));
}
export async function approveOperation(
  engine: AgentEngine,
  accountId: number,
  sessionId: string,
  toolCallId: string,
  toolName: string,
  title: string,
  operation: unknown,
  signal: AbortSignal,
  options: {
    path?: string;
    defaultAsk?: boolean;
    mutation?: boolean;
    finalAction?: boolean;
  } = {},
) {
  const fingerprint = createHash('sha256')
    .update(JSON.stringify({ toolName, operation }))
    .digest('hex');
  const evaluate = () => {
    const session = engine.get(accountId, sessionId);
    const account = rulesSchema.parse(
      engine.store.get(accountId, 'permissions', 'rules') ?? {},
    );
    const local = rulesSchema.parse(session.permissionOverrides ?? {});
    const rules = {
      deny: [...account.deny, ...local.deny],
      ask: [...account.ask, ...local.ask],
      allow: [...account.allow, ...local.allow],
      approved: [...account.approved, ...local.approved],
    };
    const match = (rule: string) => matches(rule, toolName, options.path);
    if (rules.deny.some(match))
      fail('FORBIDDEN', 'Operation is denied by account or session policy');
    if (options.mutation && session.permissionMode === 'read-only')
      fail('FORBIDDEN', 'Session is read-only for this operation');
    const explicitAsk = rules.ask.some(match);
    const approved =
      (engine.store.get(accountId, 'sessionApprovals', sessionId) as
        | string[]
        | null) ?? [];
    return {
      ask:
        explicitAsk ||
        (!rules.allow.some(match) &&
          !rules.approved.some(match) &&
          !approved.includes(fingerprint) &&
          session.permissionMode !== 'full-access' &&
          (options.defaultAsk ?? true)),
      explicitAsk,
    };
  };
  const decision = evaluate();
  signal.throwIfAborted();
  if (options.finalAction) {
    const response = (await engine.suspend(
      accountId,
      sessionId,
      toolCallId,
      'action-confirmation',
      { title, operation },
      signal,
    )) as { verdict: string };
    if (response.verdict !== 'confirm')
      fail('FORBIDDEN', 'The user did not confirm this action');
  } else if (decision.ask) {
    const response = (await engine.suspend(
      accountId,
      sessionId,
      toolCallId,
      'approval',
      {
        title,
        message: 'Review the concrete operation before allowing execution.',
        operation,
      },
      signal,
    )) as { verdict: string; always: boolean };
    if (response.verdict !== 'allow')
      fail('FORBIDDEN', 'The user denied this operation');
    if (response.always && !decision.explicitAsk) {
      const approved =
        (engine.store.get(accountId, 'sessionApprovals', sessionId) as
          | string[]
          | null) ?? [];
      engine.store.set(accountId, 'sessionApprovals', sessionId, [
        ...new Set([...approved, fingerprint]),
      ]);
    }
  }
  // A policy can become stricter while the decision UI is open.
  evaluate();
  signal.throwIfAborted();
}
