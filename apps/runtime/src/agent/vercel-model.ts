import { AuxError } from "@aux/contracts";
import type { ModelCapability } from "@aux/contracts/model-registry";
import type { z } from "zod";
import type { VercelAccounts } from "../services/vercel-account.js";
import { GatewayModelClient } from "./gateway-client.js";
import {
  markModelUndispatched,
  withAttempts,
  type ModelClient,
  type ModelAttempt,
  type ModelCallSource,
} from "./model-client.js";

/** Actual SIWV app token, carried by the maintained Gateway provider; normal Gateway invoices remain intact. */
export function vercelModelClient(
  accounts: () => Promise<Pick<VercelAccounts, "accessToken"> & { account(id: string): { teamId: string } }>,
  accountId: string,
  models: () => readonly ModelCapability[],
  checkSelection: () => void,
  checkOwner: (source: ModelCallSource) => Promise<void>,
  network: typeof fetch = fetch,
): ModelClient {
  async function call<T extends ModelAttempt & { retries?: ModelAttempt[] }>(
    options: { signal?: AbortSignal; source?: ModelCallSource },
    use: (client: GatewayModelClient) => Promise<T>,
  ): Promise<T> {
    let completed: T | undefined;
    let dispatched = false;
    let predispatchFailure: unknown;
    try {
      const source = options.source;
      if (!source)
        throw new AuxError(
          "needs_input",
          "Vercel account inference requires the original live run and window.",
        );
      const current = async () => {
        options.signal?.throwIfAborted();
        checkSelection();
        await source.checkOriginal();
        await checkOwner(source);
        checkSelection();
        options.signal?.throwIfAborted();
      };
      await current();
      const vault = await accounts();
      await current();
      const account = vault.account(accountId);
      const transport: typeof fetch = async (input, init) => {
        try {
          const url = new URL(input instanceof Request ? input.url : String(input));
          if (url.origin !== "https://ai-gateway.vercel.sh")
            throw new AuxError("permission_denied", "Vercel account inference changed its Gateway origin.");
          await current();
          await source.authorizeDestination(url.origin);
          await current();
          const token = await vault.accessToken(accountId, options.signal);
          await current();
          const headers = new Headers(
            init?.headers ?? (input instanceof Request ? input.headers : undefined),
          );
          headers.set("Authorization", `Bearer ${token}`);
          dispatched = true;
          const response = await network(input, {
            ...init,
            headers,
            redirect: "error",
            signal: AbortSignal.any([
              ...(options.signal ? [options.signal] : []),
              ...(init?.signal ? [init.signal] : []),
              ...(input instanceof Request ? [input.signal] : []),
            ]),
          });
          await current();
          if (!response.body) return response;
          return new Response(
            response.body.pipeThrough(
              new TransformStream<Uint8Array, Uint8Array>({
                async transform(chunk, controller) {
                  await current();
                  controller.enqueue(chunk);
                },
                async flush() {
                  await current();
                },
              }),
            ),
            {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            },
          );
        } catch (error) {
          if (!dispatched) predispatchFailure = error;
          throw error;
        }
      };
      const client = new GatewayModelClient("aux-vercel-account-transport", {
        gatewayFetch: transport,
        teamIdOrSlug: account.teamId,
        models,
      });
      completed = await use(client);
      await current();
      return completed;
    } catch (error) {
      if (completed) withAttempts(error, [...(completed.retries ?? []), completed]);
      throw dispatched ? error : markModelUndispatched(predispatchFailure ?? error);
    }
  }
  return {
    generateStructured: <T>(
      options: Parameters<ModelClient["generateStructured"]>[0] & {
        schema: z.ZodType<T>;
      },
    ) => call(options, (client) => client.generateStructured<T>(options)),
    streamStructured: <T>(
      options: Parameters<NonNullable<ModelClient["streamStructured"]>>[0] & {
        schema: z.ZodType<T>;
      },
    ) => call(options, (client) => client.streamStructured<T>(options)),
    generateText: (options) => call(options, (client) => client.generateText(options)),
    searchWeb: (options) => call(options, (client) => client.searchWeb(options)),
    toolCallStep: (options) => call(options, (client) => client.toolCallStep(options)),
    listModels: async () => models().map(({ id, name }) => ({ id, name })),
  };
}
