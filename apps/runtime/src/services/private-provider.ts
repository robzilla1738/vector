import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CopilotRuntime } from "./copilot-runtime.js";
import { CopilotRuntimeInstaller } from "./copilot-runtime-install.js";
import { copilotModelClient } from "../agent/copilot-model.js";
import type { NativeBridge } from "../native.js";
import { AuxError, type RpcChannel } from "@aux/contracts";
import {
  PrivateProviderRequestSchema,
  PrivateProviderResultSchema,
  type PrivateProviderDescriptor,
  type PrivateProviderRequest,
  type PrivateProviderResult,
} from "@aux/contracts/private-provider";
import { z } from "zod";
import type { ModelClient, ModelCallSource } from "../agent/model-client.js";
import { directModelClient } from "../agent/direct-providers.js";
import { GatewayModelClient } from "../agent/gateway-client.js";
import { chatgptModelClient } from "../agent/chatgpt-model.js";
import { vercelModelClient } from "../agent/vercel-model.js";

/** Native-only channel. Its caller is the original normal Profile's authenticated host. */
export function registerPrivateProviderBroker(
  channel: Pick<RpcChannel, "onMethod">,
  deps: {
    current(): boolean;
    request(request: PrivateProviderRequest): Promise<PrivateProviderResult>;
  },
) {
  let closed = false;
  const params = z.object({ sessionId: z.string().uuid(), request: PrivateProviderRequestSchema }).strict();
  channel.onMethod("provider.private", async (raw) => {
    const input = params.parse(raw);
    if (closed || !deps.current()) throw new AuxError("cancelled", "Original credential owner retired.");
    const result = PrivateProviderResultSchema.parse(await deps.request(input.request));
    if (closed || !deps.current()) throw new AuxError("cancelled", "Original credential owner retired.");
    return result;
  });
  return () => {
    closed = true;
  };
}

/** Private content never crosses this credential-only boundary. No credential is written or cached. */
export class PrivateProviderConnection {
  private readonly controller = new AbortController();
  private copilotRuntime?: CopilotRuntime;
  private copilotVerifier?: CopilotRuntimeInstaller;
  private copilotAuthorization?: string;
  constructor(
    readonly descriptor: PrivateProviderDescriptor,
    private readonly request: (request: PrivateProviderRequest) => Promise<PrivateProviderResult>,
    private readonly network: typeof fetch = fetch,
    private readonly copilot?: { native: NativeBridge; dataDir: string },
  ) {}
  async close(): Promise<void> {
    this.controller.abort();
    await this.copilotRuntime?.close();
    await this.copilotVerifier?.close();
  }
  private privateCopilot(): CopilotRuntime {
    if (this.copilotRuntime) return this.copilotRuntime;
    const { descriptor, copilot } = this;
    if (
      !copilot?.native.copilotStart ||
      !copilot.native.copilotEndpoint ||
      !copilot.native.copilotStop ||
      !copilot.native.turnSourceContext ||
      !descriptor.copilotRuntimeRoot
    )
      throw new AuxError("capability_unsupported", "The private native Copilot owner is unavailable.");
    const native = copilot.native;
    const current = async (owner: string) => {
      this.controller.signal.throwIfAborted();
      await native.turnSourceContext!(owner);
      this.controller.signal.throwIfAborted();
    };
    const verifier = (this.copilotVerifier = new CopilotRuntimeInstaller({
      root: dirname(descriptor.copilotRuntimeRoot),
      readOnly: true,
      workerPath: fileURLToPath(import.meta.resolve("#aux-copilot-install-worker")),
      checkOwner: current,
    }));
    return (this.copilotRuntime = new CopilotRuntime({
      dataDir: copilot.dataDir,
      installationRoot: descriptor.copilotRuntimeRoot,
      native: {
        start: (input) => native.copilotStart!(input),
        endpoint: (input) => native.copilotEndpoint!(input),
        stop: (input) => native.copilotStop!(input),
      },
      installer: { status: () => verifier.status() },
      checkOwner: current,
      accounts: {
        lease: async (accountId, signal) => {
          if (accountId !== descriptor.accountId)
            throw new AuxError("cancelled", "The original private Copilot account changed.");
          const lease = await this.credential(signal);
          if (!lease.authorizationGeneration || !lease.credentialRevision)
            throw new AuxError("permission_denied", "Copilot did not return its original account lease.");
          this.copilotAuthorization = lease.authorizationGeneration;
          return {
            accountId,
            accessToken: lease.accessToken,
            authorizationGeneration: lease.authorizationGeneration,
            credentialRevision: lease.credentialRevision,
            signal: this.controller.signal,
          };
        },
        assertCurrent: (accountId, generation) => {
          this.controller.signal.throwIfAborted();
          if (accountId !== descriptor.accountId || generation !== this.copilotAuthorization)
            throw new AuxError("cancelled", "The original private Copilot lease retired.");
        },
      },
    }));
  }
  async credential(signal?: AbortSignal) {
    this.controller.signal.throwIfAborted();
    signal?.throwIfAborted();
    const result = PrivateProviderResultSchema.parse(
      await this.request({ operation: "credential", revision: this.descriptor.revision }),
    );
    this.controller.signal.throwIfAborted();
    signal?.throwIfAborted();
    if (result.operation !== "credential" || result.revision !== this.descriptor.revision)
      throw new AuxError("cancelled", "The original private model connection changed.");
    return result;
  }
  model(check: () => void): ModelClient {
    const descriptor = this.descriptor;
    const call = async <T>(
      options: { signal?: AbortSignal; source?: ModelCallSource },
      use: (client: ModelClient, signal: AbortSignal) => Promise<T>,
    ): Promise<T> => {
      const signal = AbortSignal.any([this.controller.signal, ...(options.signal ? [options.signal] : [])]);
      const current = async () => {
        signal.throwIfAborted();
        check();
        await options.source?.checkOriginal();
        signal.throwIfAborted();
        check();
      };
      await current();
      const credential = async () => {
        await current();
        const value = await this.credential(signal);
        await current();
        return value.accessToken;
      };
      const models = () => descriptor.models;
      let client: ModelClient;
      if (descriptor.authentication === "copilot") {
        client = copilotModelClient(
          {
            inference: (accountId, source, modelId, originalSignal, use) =>
              this.privateCopilot().inference(
                accountId,
                source.nativeTurnContext,
                originalSignal,
                async () => {
                  await source.checkOriginal();
                },
                modelId,
                use,
              ),
          },
          descriptor.accountId!,
          models,
          async (source, destination) => {
            await current();
            await source.authorizeDestination(destination);
            await current();
          },
          this.network,
        );
      } else if (descriptor.authentication === "chatgpt") {
        client = chatgptModelClient(
          { accessToken: credential },
          descriptor.accountId!,
          models,
          async () => {
            await current();
            await options.source?.authorizeDestination(new URL(descriptor.endpoint).origin);
            await current();
          },
          check,
          this.network,
        );
      } else if (descriptor.authentication === "vercel") {
        client = vercelModelClient(
          async () => ({ account: () => ({ teamId: descriptor.teamId! }), accessToken: credential }),
          descriptor.accountId!,
          models,
          check,
          async () => current(),
        );
      } else {
        const base = new URL(descriptor.endpoint);
        const transport: typeof fetch = async (input, init) => {
          const url = new URL(input instanceof Request ? input.url : String(input));
          if (
            url.origin !== base.origin ||
            !(
              url.pathname === base.pathname ||
              url.pathname.startsWith(base.pathname.replace(/\/$/, "") + "/")
            )
          )
            throw new AuxError(
              "permission_denied",
              "Private inference changed its configured provider destination.",
            );
          await current();
          await options.source?.authorizeDestination(base.origin);
          await current();
          const key = await credential(),
            headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
          headers.delete("authorization");
          headers.delete("x-api-key");
          headers.delete("x-goog-api-key");
          if (descriptor.provider === "anthropic") headers.set("x-api-key", key);
          else if (descriptor.provider === "google") headers.set("x-goog-api-key", key);
          else headers.set("authorization", `Bearer ${key}`);
          return this.network(input, {
            ...init,
            headers,
            redirect: "error",
            signal: AbortSignal.any([
              signal,
              ...(init?.signal ? [init.signal] : []),
              ...(input instanceof Request ? [input.signal] : []),
            ]),
          });
        };
        client =
          descriptor.provider === "gateway"
            ? new GatewayModelClient("aux-private-transport", { gatewayFetch: transport, models })
            : directModelClient(descriptor.provider, "aux-private-transport", transport, descriptor.endpoint);
      }
      const value = await use(client, signal);
      await current();
      return value;
    };
    return {
      generateStructured: <T>(
        options: Parameters<ModelClient["generateStructured"]>[0] & { schema: z.ZodType<T> },
      ) => call(options, (client, signal) => client.generateStructured<T>({ ...options, signal })),
      streamStructured: <T>(
        options: Parameters<NonNullable<ModelClient["streamStructured"]>>[0] & { schema: z.ZodType<T> },
      ) => call(options, (client, signal) => client.streamStructured!<T>({ ...options, signal })),
      generateText: (options) =>
        call(options, (client, signal) => client.generateText({ ...options, signal })),
      toolCallStep: (options) =>
        call(options, (client, signal) => client.toolCallStep!({ ...options, signal })),
      listModels: async () => descriptor.models.map(({ id, name }) => ({ id, name })),
    };
  }
}
