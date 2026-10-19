import { AgentEngine } from '@aux/agent';
import { matchingSkills } from '@aux/skills';
import { TRPCError } from '@trpc/server';
import type { Hono } from 'hono';
import { z } from 'zod';
import { accountSkills, createSkillRouters } from './cli/skills.js';
import type { DaemonServices } from './http/server.js';
import { installSessionHttp } from './http/sessions.js';
import { pollRoutines } from './routines/index.js';
import { createAgentRouters } from './sessions/index.js';

export function createFeatures() {
  let engine: AgentEngine | undefined;
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
        tools: (session) => ({
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
      routineTimer = setInterval(() => {
        for (const result of pollRoutines(services.store, activeEngine)) {
          if (result.error)
            console.error(
              `Routine ${result.routineId} failed; inspect its local execution state.`,
            );
        }
      }, 1000);
      routineTimer.unref();
      const skills = createSkillRouters(services);
      return {
        ...createAgentRouters(services, activeEngine),
        cli: skills.cliSkills,
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
      await engine?.close();
    },
  };
}
