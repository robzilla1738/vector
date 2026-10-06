import type { MethodCtx, MethodHandler } from "./context.js";
import { AuxError } from "@aux/contracts";
import type { MethodName } from "@aux/contracts";

async function h_models_list(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  return s.settings.listModels();
}
async function h_models_probe(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.settings.probe((params as { modelId?: string }).modelId);
}

function authOwner(ctx: MethodCtx): string {
  if (ctx.client.external || !ctx.client.nativeTurnContext)
    throw new AuxError("permission_denied", "Provider sign-in requires its original Aux window.");
  return ctx.client.nativeTurnContext;
}
async function h_models_auth_start(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.settings.startProviderAuth(authOwner(ctx), ctx.params.provider, ctx.params.accountId);
}
async function h_models_auth_status(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.settings.providerAuthStatus(ctx.params.attemptId, authOwner(ctx));
}
async function h_models_auth_cancel(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.settings.cancelProviderAuth(ctx.params.attemptId, authOwner(ctx));
}
async function h_models_auth_accounts(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.settings.savedChatgptAccounts(authOwner(ctx));
}
async function h_models_auth_disconnect(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.settings.disconnectChatgptAccount(ctx.params.accountId, authOwner(ctx));
}
async function h_models_copilot_setup(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.settings.copilotSetup(authOwner(ctx));
}
async function h_models_copilot_install(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.settings.copilotInstall(authOwner(ctx));
}
async function h_models_copilot_start(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.settings.copilotStart(authOwner(ctx));
}
async function h_models_copilot_status(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.settings.copilotStatus(ctx.params.attemptId, authOwner(ctx));
}
async function h_models_copilot_cancel(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.settings.copilotCancel(ctx.params.attemptId, authOwner(ctx));
}
async function h_models_copilot_accounts(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.settings.copilotAccounts(authOwner(ctx));
}
async function h_models_copilot_disconnect(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.settings.copilotDisconnect(ctx.params.accountId, authOwner(ctx));
}
async function h_models_copilot_catalog(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.settings.copilotCatalog(ctx.params.accountId, authOwner(ctx));
}
export const modelsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "models.auth.start": h_models_auth_start,
  "models.auth.status": h_models_auth_status,
  "models.auth.cancel": h_models_auth_cancel,
  "models.auth.accounts": h_models_auth_accounts,
  "models.auth.disconnect": h_models_auth_disconnect,
  "models.copilot.setup": h_models_copilot_setup,
  "models.copilot.install": h_models_copilot_install,
  "models.copilot.start": h_models_copilot_start,
  "models.copilot.status": h_models_copilot_status,
  "models.copilot.cancel": h_models_copilot_cancel,
  "models.copilot.accounts": h_models_copilot_accounts,
  "models.copilot.disconnect": h_models_copilot_disconnect,
  "models.copilot.catalog": h_models_copilot_catalog,
  "models.list": h_models_list,
  "models.probe": h_models_probe,
};
