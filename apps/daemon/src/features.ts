import { join } from 'node:path';
import { AgentEngine } from '@aux/agent';
import {
  BrowsingHistory,
  ContextService,
  MemoryService,
  memoryTools,
} from '@aux/memory';
import { matchingSkills } from '@aux/skills';
import { TRPCError } from '@trpc/server';
import type { Hono } from 'hono';
import { z } from 'zod';
import { createReplService } from './cli/repl.js';
import { accountSkills, createSkillRouters } from './cli/skills.js';
import { createContextRouter } from './context/index.js';
import { createVaultBiometryAdapter, HelperClient } from './helpers/client.js';
import {
  computerUseTools,
  createHelperCaptureAdapter,
  createHelperRouter,
  createNativeImportRouter,
  createPasswordImporterAdapter,
} from './helpers/index.js';
import { createHistoryRouter } from './history/index.js';
import type { DaemonServices } from './http/server.js';
import { installSessionHttp } from './http/sessions.js';
import { createInboxRouter, InboxService } from './inbox/index.js';
import { createMemoryRouter } from './memory/index.js';
import { pollRoutines } from './routines/index.js';
import { createAgentRouters } from './sessions/index.js';
import { createVaultRouters, VaultService } from './vault/index.js';

export function createFeatures() {
  let engine: AgentEngine | undefined;
  let memory: MemoryService | undefined;
  let helper: HelperClient | undefined;
  let importer: HelperClient | undefined;
  let vault: VaultService | undefined;
  let repl: ReturnType<typeof createReplService> | undefined;
  let routineTimer: NodeJS.Timeout | undefined;
  return {
    extendRouter(services: DaemonServices) {
      engine = new AgentEngine(services.store, services.bridge, 4, {
        async instructions(session) {
          const skills = await accountSkills(
            services.store,
            session.accountId,
            session.projectId,
          );
          const prompt =
            [...session.messages]
              .reverse()
              .find((message) => message.role === 'user')?.content ?? '';
          const active = matchingSkills(skills, prompt, []);
          return `Available skills (load one with skill_load when it is relevant):\n${skills
            .filter((item) => item.enabled)
            .map((item) => `${item.name}: ${item.description}`)
            .join('\n')}\n${active.map((item) => item.body).join('\n\n')}`;
        },
        tools: (session, signal) => ({
          ...(engine && helper
            ? computerUseTools(engine, helper, session, signal)
            : {}),
          ...(memory ? memoryTools(memory, session) : {}),
          skill_load: {
            description:
              'Load an available independently authored workflow guide by its exact skill name.',
            inputSchema: z.object({ name: z.string().min(1) }),
            execute: async ({ name }: { name: string }) => {
              const skill = (
                await accountSkills(
                  services.store,
                  session.accountId,
                  session.projectId,
                )
              ).find((item) => item.name === name && item.enabled);
              if (!skill)
                throw new TRPCError({
                  code: 'NOT_FOUND',
                  message: 'Enabled skill not found.',
                });
              return { name: skill.name, body: skill.body };
            },
          },
        }),
      });
      const activeEngine = engine;
      memory = new MemoryService(services.store, activeEngine);
      const history = new BrowsingHistory(memory);
      const inbox = new InboxService(services.store, activeEngine);
      if (process.env.AUX_HELPER_PATH) {
        helper = new HelperClient(
          process.env.AUX_HELPER_PATH,
          join(services.store.home, 'helper-artifacts'),
        );
      }
      const context = new ContextService(
        memory,
        helper ? createHelperCaptureAdapter(helper) : undefined,
      );
      if (process.env.AUX_IMPORTER_PATH)
        importer = new HelperClient(
          process.env.AUX_IMPORTER_PATH,
          join(services.store.home, 'importer-artifacts'),
        );
      vault = new VaultService(
        services.store,
        helper ? createVaultBiometryAdapter(helper) : undefined,
      );
      routineTimer = setInterval(() => {
        for (const account of services.store.accounts())
          inbox.dispatch(account.id);
        for (const result of pollRoutines(services.store, activeEngine)) {
          if (result.error)
            console.error(
              `Routine ${result.routineId} failed; inspect its local execution state.`,
            );
        }
      }, 1000);
      routineTimer.unref();
      const skills = createSkillRouters(services);
      repl = createReplService(services, activeEngine);
      return {
        ...createAgentRouters(services, activeEngine),
        ...createVaultRouters(services, vault),
        ...(importer
          ? {
              nativeImport: createNativeImportRouter(
                services,
                vault,
                createPasswordImporterAdapter(importer),
              ),
            }
          : {}),
        ...(helper
          ? { computerUse: createHelperRouter(services, helper) }
          : {}),
        memory: createMemoryRouter(services, memory),
        contextAwareness: createContextRouter(services, context),
        inbox: createInboxRouter(services, inbox),
        browsingHistory: createHistoryRouter(services, history),
        cli: services.t.mergeRouters(skills.cliSkills, repl.router),
        developers: skills.developers,
      };
    },
    extendHttp(app: Hono, services: DaemonServices) {
      if (!engine)
        throw new Error('Agent engine must initialize before HTTP routes.');
      installSessionHttp(app, services, engine);
    },
    runningSessionCount: () => engine?.semaphore.active ?? 0,
    async shutdown() {
      if (routineTimer) clearInterval(routineTimer);
      await repl?.close();
      vault?.close();
      await helper?.close();
      await importer?.close();
      await engine?.close();
    },
  };
}
