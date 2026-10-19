/** Local injection points; daemon/agent.md Tool inventory. No network/provider defaults. */
import type { AgentEngine } from './engine.js';
import type { Selection } from './providers.js';
import type { Session } from './types.js';

export interface CustomSubagentProfile {
  id: string;
  instructions: string;
  context: 'fresh' | 'forked';
  readOnly: boolean;
  allowedTools?: string[];
}
export interface RoutineToolInput {
  operation: 'create' | 'suggest' | 'update' | 'pause' | 'resume' | 'delete';
  routineId?: string | undefined;
  record?: Record<string, unknown> | undefined;
}
export interface AgentToolServices {
  prepareRoutineUpdate?: (
    session: Session,
    input: RoutineToolInput,
    toolCallId: string,
    signal: AbortSignal,
  ) => Promise<{ preview: unknown; execute: () => unknown | Promise<unknown> }>;
  customSubagentProfile?: (
    accountId: number,
    id: string,
  ) => CustomSubagentProfile | undefined;
  subagentModel?: (
    accountId: number,
    category: 'fast' | 'standard' | 'deep' | 'visual',
  ) => Selection | Promise<Selection>;
}
const services = new WeakMap<AgentEngine, AgentToolServices>();
export function configureAgentTools(
  engine: AgentEngine,
  value: AgentToolServices,
) {
  services.set(engine, value);
}
export function agentToolServices(engine: AgentEngine) {
  return services.get(engine) ?? {};
}
