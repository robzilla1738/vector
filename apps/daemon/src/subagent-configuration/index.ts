/** Original Aux configuration; daemon/agent.md Tool inventory/Subagents. */
import {
  type AgentEngine,
  type AgentToolServices,
  type CustomSubagentProfile,
  fail,
  type Selection,
  scope,
  selectionSchema,
} from '@aux/agent';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
export const modelCategories = ['fast', 'standard', 'deep', 'visual'] as const;
export type AvailableSubagentModel = {
  provider: string;
  modelId: string;
  name?: string;
  thinkingLevels: string[];
  inputModalities: string[];
  fastMode?: boolean;
};
export type SubagentTool = { name: string; label: string; readOnly: boolean };
const coreTools: SubagentTool[] = [
  ['read_file', 'Read files', true],
  ['page_view', 'Read a page snapshot', true],
  ['browser_tabs', 'List browser tabs', true],
  ['browser_owned_tabs', 'List agent-owned tabs', true],
  ['subagent_wait', 'Read child-task status', true],
  ['browser_open', 'Open a browser tab', false],
  ['browser_close', 'Close an owned tab', false],
  ['browser_navigate', 'Navigate a browser tab', false],
  ['browser_click', 'Click a page element', false],
  ['browser_type', 'Type into a page', false],
  ['browser_scroll', 'Scroll a page', false],
  ['write_file', 'Write files', false],
  ['edit_file', 'Edit files', false],
  ['bash', 'Run permitted shell commands', false],
  ['webfetch', 'Fetch a public web page', false],
  ['routine_update', 'Propose routine changes', false],
  ['write_todos', 'Update task checklist', false],
].map(([name, label, readOnly]) => ({
  name: String(name),
  label: String(label),
  readOnly: Boolean(readOnly),
}));
const blocked = new Set([
  'subagent',
  'ask_user_question',
  'request_action_confirmation',
]);
const profileId = z.string().regex(/^custom-[A-Za-z0-9_-]{1,93}$/);
export const subagentProfileSchema = z
  .object({
    id: profileId,
    name: z.string().trim().min(1).max(120),
    instructions: z.string().max(32000),
    context: z.enum(['fresh', 'forked']).default('fresh'),
    readOnly: z.boolean().default(true),
    allowedTools: z
      .array(z.string().regex(/^[A-Za-z0-9_]{1,100}$/))
      .max(100)
      .default([]),
  })
  .strict();
const selection = selectionSchema
  .safeExtend({
    provider: z.string().min(1).max(100),
    modelId: z.string().min(1).max(256),
  })
  .strict();
const routingSchema = z
  .object({
    fast: selection.nullable().optional(),
    standard: selection.nullable().optional(),
    deep: selection.nullable().optional(),
    visual: selection.nullable().optional(),
  })
  .strict();
const configSchema = z
  .object({
    version: z.literal(1),
    profiles: z.array(subagentProfileSchema).max(100),
    routing: routingSchema,
  })
  .strict();
export type SubagentConfiguration = z.infer<typeof configSchema>;
const KEY = 'subagents.configuration';
export function createSubagentConfiguration(
  services: DaemonServices,
  _engine: AgentEngine,
  availableModels: (
    accountId: number,
  ) => AvailableSubagentModel[] | Promise<AvailableSubagentModel[]>,
  additionalTools?: () => SubagentTool[],
) {
  const { store, procedure, t } = services;
  function catalog() {
    const rows = new Map(coreTools.map((tool) => [tool.name, tool]));
    for (const tool of additionalTools?.() ?? [])
      if (/^[A-Za-z0-9_]{1,100}$/.test(tool.name) && !blocked.has(tool.name))
        rows.set(tool.name, { ...tool });
    return Array.from(rows.values()).map((tool) => ({ ...tool }));
  }
  function read(accountId: number): SubagentConfiguration {
    store.requireAccount(accountId);
    const value = store.get(accountId, 'settings', KEY);
    if (value === null) return { version: 1, profiles: [], routing: {} };
    const parsed = configSchema.safeParse(value);
    if (!parsed.success)
      fail(
        'PRECONDITION_FAILED',
        'Subagent configuration is invalid. Restore a valid local configuration before changing it.',
      );
    return parsed.data;
  }
  function write(accountId: number, value: SubagentConfiguration) {
    store.set(accountId, 'settings', KEY, configSchema.parse(value));
    return structuredClone(value);
  }
  function validateModel(
    models: AvailableSubagentModel[],
    category: (typeof modelCategories)[number],
    value: Selection,
  ) {
    const model = models.find(
      (model) =>
        model.provider === value.provider && model.modelId === value.modelId,
    );
    if (!model)
      fail(
        'PRECONDITION_FAILED',
        'Choose a currently configured available model for this category.',
      );
    const levels = model.thinkingLevels.length ? model.thinkingLevels : ['off'];
    if (!levels.includes(value.thinkingLevel))
      fail(
        'BAD_REQUEST',
        'This model does not advertise the selected thinking level.',
      );
    if (value.fastMode && model.fastMode !== true)
      fail('BAD_REQUEST', 'This model does not advertise fast mode.');
    if (category === 'visual' && !model.inputModalities.includes('image'))
      fail(
        'BAD_REQUEST',
        'The visual category requires a model with image input.',
      );
    return structuredClone(value);
  }
  const callbacks: Required<
    Pick<AgentToolServices, 'customSubagentProfile' | 'subagentModel'>
  > = {
    customSubagentProfile: (
      accountId,
      id,
    ): CustomSubagentProfile | undefined => {
      const profile = read(accountId).profiles.find(
        (profile) => profile.id === id,
      );
      if (!profile) return;
      return structuredClone({
        id: profile.id,
        instructions: profile.instructions,
        context: profile.context,
        readOnly: profile.readOnly,
        allowedTools: profile.allowedTools,
      });
    },
    subagentModel: async (accountId, category) => {
      const value = read(accountId).routing[category];
      if (!value)
        fail(
          'PRECONDITION_FAILED',
          `Choose a model for the ${category} subagent category in settings.`,
        );
      return validateModel(await availableModels(accountId), category, value);
    },
  };
  const router = t.router({
    list: procedure.input(scope).query(async ({ input }) => ({
      ...read(input.accountId),
      catalog: catalog(),
      models: structuredClone(await availableModels(input.accountId)),
    })),
    setProfile: procedure
      .input(
        scope.extend({
          profile: subagentProfileSchema,
          createOnly: z.boolean().default(false),
        }),
      )
      .mutation(({ input }) => {
        const config = read(input.accountId),
          tools = new Set(catalog().map((tool) => tool.name));
        if (
          new Set(input.profile.allowedTools).size !==
            input.profile.allowedTools.length ||
          input.profile.allowedTools.some(
            (name) => blocked.has(name) || !tools.has(name),
          )
        )
          fail(
            'BAD_REQUEST',
            'Choose unique tools from the current configurable catalog.',
          );
        const existing = config.profiles.findIndex(
          (profile) => profile.id === input.profile.id,
        );
        if (existing >= 0 && input.createOnly)
          fail(
            'CONFLICT',
            'This profile ID already exists. Edit it or choose another ID.',
          );
        if (existing < 0) config.profiles.push(input.profile);
        else config.profiles[existing] = input.profile;
        return write(input.accountId, config);
      }),
    removeProfile: procedure
      .input(scope.extend({ profileId }))
      .mutation(({ input }) => {
        const config = read(input.accountId),
          before = config.profiles.length;
        config.profiles = config.profiles.filter(
          (profile) => profile.id !== input.profileId,
        );
        write(input.accountId, config);
        return { removed: config.profiles.length !== before };
      }),
    setRouting: procedure
      .input(scope.extend({ routing: routingSchema }))
      .mutation(async ({ input }) => {
        const models = await availableModels(input.accountId);
        for (const category of modelCategories) {
          const value = input.routing[category];
          if (value) validateModel(models, category, value);
        }
        const config = read(input.accountId);
        return write(input.accountId, {
          ...config,
          routing: { ...config.routing, ...input.routing },
        });
      }),
  });
  return { router, ...callbacks };
}
