import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";
import {
  backupRetention,
  cancelRuntimeRestore,
  createRuntimeBackup,
  deleteRuntimeBackup,
  listRuntimeBackups,
  runtimeRestoreStatus,
  setBackupRetention,
  stageRuntimeRestore,
} from "../../services/runtime-backup.js";

async function h_installation_createBackup(ctx: MethodCtx): Promise<unknown> {
  const { client, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Runtime backups require an explicit action in Aux.");
  return createRuntimeBackup(s.repo, s.settings.all().dataDir);
}
async function h_installation_listBackups(ctx: MethodCtx): Promise<unknown> {
  const { client, s } = ctx;
  if (client.external && client.scope)
    throw new AuxError("permission_denied", "Runtime backups require an explicit action in Aux.");
  return listRuntimeBackups(s.settings.all().dataDir);
}
async function h_installation_deleteBackup(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Delete backups from the Aux settings window.");
  return deleteRuntimeBackup(s.settings.all().dataDir, params.name, params.expectedSha256);
}
async function h_installation_backupRetention(ctx: MethodCtx): Promise<unknown> {
  const { client, s } = ctx;
  if (client.external && client.scope)
    throw new AuxError("permission_denied", "Runtime backups require an explicit action in Aux.");
  return backupRetention(s.repo);
}
async function h_installation_setBackupRetention(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Backup retention is managed in Aux.");
  return setBackupRetention(s.repo, params.keep);
}
async function h_installation_stageRestore(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Runtime restore requires an explicit action in Aux.");
  return stageRuntimeRestore(s.settings.all().dataDir, params.path);
}
async function h_installation_cancelRestore(ctx: MethodCtx): Promise<unknown> {
  const { client, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Runtime restore requires an explicit action in Aux.");
  return cancelRuntimeRestore(s.settings.all().dataDir);
}
async function h_installation_restoreStatus(ctx: MethodCtx): Promise<unknown> {
  if (ctx.client.external)
    throw new AuxError("permission_denied", "Runtime restore status is available in Aux settings.");
  return runtimeRestoreStatus(ctx.s.settings.all().dataDir);
}

export const installationMethods: Partial<Record<MethodName, MethodHandler>> = {
  "installation.createBackup": h_installation_createBackup,
  "installation.listBackups": h_installation_listBackups,
  "installation.deleteBackup": h_installation_deleteBackup,
  "installation.backupRetention": h_installation_backupRetention,
  "installation.setBackupRetention": h_installation_setBackupRetention,
  "installation.stageRestore": h_installation_stageRestore,
  "installation.cancelRestore": h_installation_cancelRestore,
  "installation.restoreStatus": h_installation_restoreStatus,
};
