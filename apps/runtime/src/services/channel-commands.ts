import { randomUUID } from "node:crypto";
import { AuxError, taskConversationId, type Run } from "@aux/contracts";
import { isTextModelCandidate, type ModelCapability } from "@aux/contracts/model-registry";
import type { ChannelConnection, ChannelInbound, ChannelReply } from "@aux/contracts/channels";
import type { Repo } from "../store/repo.js";
import type { ChannelThread } from "./channel-store.js";

export type ChannelModels = {
  list(): Promise<readonly ModelCapability[]>;
  default(): string;
  generation(): string;
};
const names = ["pair", "stop", "model", "effort", "sessions", "usage"] as const;
type Command = { name: (typeof names)[number]; argument: string };

export function channelCommand(message: ChannelInbound, connection: ChannelConnection): Command | undefined {
  let text = message.text.trim();
  for (const mention of [
    `<@${connection.identity.botId}>`,
    `<@!${connection.identity.botId}>`,
    `@${connection.identity.username ?? ""}`,
  ]) {
    if (mention !== "@" && text.toLowerCase().startsWith(`${mention.toLowerCase()} `))
      text = text.slice(mention.length).trim();
  }
  const match = /^\/([a-z]+)(?:@([^\s]+))?(?:\s+([\s\S]*))?$/i.exec(text);
  if (!match || (match[2] && match[2].toLowerCase() !== connection.identity.username?.toLowerCase()))
    return undefined;
  const name = names.find((value) => value === match[1]!.toLowerCase());
  const argument = match[3]?.trim() ?? "";
  return name && (!(name === "pair" || name === "stop") || !argument) ? { name, argument } : undefined;
}

export function channelThreadRuns(
  repo: Repo,
  connection: ChannelConnection,
  peerAuthority: string,
  thread: ChannelThread,
): Run[] {
  const rows = repo.db
    .prepare(
      `SELECT r.run_id FROM run_lookup l JOIN runs r ON r.run_id=l.run_id
    WHERE json_extract(l.config,'$.taskId')=? ORDER BY r.created_at DESC,r.run_id DESC LIMIT 100`,
    )
    .all(thread.taskId) as { run_id: string }[];
  return rows.flatMap(({ run_id }) => {
    const run = repo.getRun(run_id);
    return run &&
      run.config?.externalConnectionId === peerAuthority &&
      run.config.chatId === taskConversationId(thread.taskId) &&
      run.config.contextWorkspaceId === connection.workspaceId
      ? [run]
      : [];
  });
}

export async function executeChannelCommand(input: {
  command: Command;
  repo: Repo;
  models?: ChannelModels;
  connection: ChannelConnection;
  authorityId: string;
  thread: ChannelThread;
  checkCurrent(): void;
}): Promise<{ thread: ChannelThread; text: string; reply?: ChannelReply }> {
  const { command, connection, thread, repo, models } = input;
  const button = (label: string, command: string) => ({
    actionId: randomUUID(),
    label,
    command,
    expiresAt: Date.now() + 600_000,
    preferencesRevision: thread.preferencesRevision,
  });
  input.checkCurrent();
  if (command.name === "model") {
    if (!models)
      throw new AuxError("capability_unsupported", "Model selection is unavailable on this channel.");
    const generation = models.generation();
    const available = (await models.list()).filter(isTextModelCandidate);
    input.checkCurrent();
    if (generation !== models.generation())
      throw new AuxError("conflict", "The model connection changed. Request /model again.");
    if (!command.argument) {
      const text = `Model: ${thread.modelId ?? `default (${models.default()})`}\nAvailable models:\n${available
        .slice(0, 20)
        .map((model) => model.id)
        .join(
          "\n",
        )}\nUse /model <id> or /model default.${available.length > 20 ? " More models are available in Aux." : ""}`;
      return {
        thread,
        text,
        reply: {
          title: "Conversation model",
          buttons: [
            button("Use default", "/model default"),
            ...available
              .slice(0, 4)
              .map((model) => button((model.name ?? model.id).slice(0, 40), `/model ${model.id}`)),
          ],
        },
      };
    }
    const modelId = command.argument === "default" ? undefined : command.argument;
    if (modelId && !available.some((model) => model.id === modelId))
      throw new AuxError("invalid_params", "Choose an available model from /model.");
    if (
      thread.reasoning &&
      available.find((model) => model.id === (modelId ?? models.default()))?.reasoning === "none"
    )
      throw new AuxError(
        "invalid_params",
        "Use /effort default before selecting a model without reasoning controls.",
      );
    return {
      thread: { ...thread, modelId, preferencesRevision: thread.preferencesRevision + 1 },
      text: `New conversation turns will use ${modelId ?? "the default model"}.`,
    };
  }
  if (command.name === "effort") {
    if (!command.argument)
      return {
        thread,
        text: `Effort: ${thread.reasoning ?? "default"}. Use /effort low, medium, high, or default.`,
        reply: {
          title: "Conversation effort",
          buttons: ["low", "medium", "high", "default"].map((effort) => button(effort, `/effort ${effort}`)),
        },
      };
    const effort = ["low", "medium", "high", "default"].find((value) => value === command.argument);
    if (!effort) throw new AuxError("invalid_params", "Choose low, medium, high, or default.");
    if (effort !== "default") {
      if (!models)
        throw new AuxError("capability_unsupported", "Effort selection is unavailable on this channel.");
      const generation = models.generation();
      const available = await models.list();
      input.checkCurrent();
      if (generation !== models.generation())
        throw new AuxError("conflict", "The model connection changed. Request /effort again.");
      const capability = available.find((model) => model.id === (thread.modelId ?? models.default()));
      if (!capability || !["supported", "required"].includes(capability.reasoning ?? "none"))
        throw new AuxError("capability_unsupported", "The selected model has no verified reasoning control.");
    }
    return {
      thread: {
        ...thread,
        reasoning: effort === "default" ? undefined : (effort as ChannelThread["reasoning"]),
        preferencesRevision: thread.preferencesRevision + 1,
      },
      text: `New conversation turns will use ${effort} effort.`,
    };
  }
  if (command.argument) throw new AuxError("invalid_params", `/${command.name} does not accept an argument.`);
  const runs = channelThreadRuns(repo, connection, input.authorityId, thread);
  if (command.name === "sessions")
    return {
      thread,
      text: runs.length
        ? `Recent sessions in this conversation:\n${runs
            .slice(0, 10)
            .map((run) => `${run.runId} · ${run.status} · ${run.goal.replace(/\s+/g, " ").slice(0, 100)}`)
            .join("\n")}`
        : "This conversation has no sessions yet.",
    };
  if (command.name === "usage") {
    const calls = runs.flatMap((run) => repo.listModelCalls(run.runId));
    const metric = (key: "inputTokens" | "outputTokens") => {
      const observed = calls.filter((call) => call[key] !== undefined);
      const total = observed.reduce((sum, call) => sum + call[key]!, 0);
      return `${total.toLocaleString("en-US")}${observed.length === calls.length ? " observed" : ` observed; ${calls.length - observed.length} unknown`}`;
    };
    const known = calls.filter((call) => call.costUsd !== undefined);
    const cost = known.reduce((sum, call) => sum + call.costUsd!, 0);
    return {
      thread,
      text: `Agent turn usage in this conversation: ${runs.length} sessions, ${calls.length} model calls.\nInput tokens: ${metric("inputTokens")}\nOutput tokens: ${metric("outputTokens")}\nCost: $${cost.toFixed(4)}${calls.some((call) => call.costEstimated) ? " (includes estimates)" : " observed"}${known.length < calls.length ? `; ${calls.length - known.length} calls have unknown cost` : ""}.${runs.length === 100 ? " Bounded to the latest 100 sessions." : ""}\nAttachment transcription is accounted separately in Aux.`,
    };
  }
  throw new AuxError("invalid_params", "Unsupported channel command.");
}
