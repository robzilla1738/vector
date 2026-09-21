import {z} from 'zod';

export const CloudLocalRequestSchema=z.object({kind:z.enum(['browser','credential','approval','file','question']),prompt:z.string().trim().min(1).max(2000),resourceId:z.string().trim().min(1).max(100).optional()});
export const CloudPreservedArtifactSchema=z.object({artifactId:z.string().min(1),label:z.string().min(1).max(200),sha256:z.string().regex(/^[a-f0-9]{64}$/),bytes:z.number().int().nonnegative().max(25*1024*1024)});
export const PreservedCloudResultSchema=z.object({resultId:z.string().uuid(),taskId:z.string().min(1),taskRevision:z.number().int().positive(),environmentId:z.string().uuid(),sourceTree:z.string().regex(/^[a-f0-9]{40,64}$/),status:z.enum(['completed','needs_input','failed']),summary:z.string().trim().min(1).max(4000),localRequest:CloudLocalRequestSchema.optional(),resultUpdatedAt:z.number().int().nonnegative(),preservedAt:z.number().int().nonnegative(),claims:z.array(z.object({criterionId:z.string().min(1).max(100),status:z.enum(['met','not_met','needs_review']),summary:z.string().trim().min(1).max(2000)})).max(20),artifacts:z.array(CloudPreservedArtifactSchema).max(51)});
export type PreservedCloudResult=z.infer<typeof PreservedCloudResultSchema>;

export const CloudEnvironmentSchema=z.object({
  environmentId:z.string().uuid(),provider:z.literal('vercel'),remoteName:z.string(),taskId:z.string(),taskRevision:z.number().int().positive(),projectId:z.string().uuid(),
  runtime:z.enum(['universal','node24','node22','python3.13']),region:z.string(),port:z.number().int().min(1).max(65535),timeoutMinutes:z.number().int().min(5).max(45).optional(),status:z.enum(['running','stopped','deleted','error']),
  createdAt:z.number(),updatedAt:z.number(),expiresAt:z.number().optional(),cleanupAt:z.number().optional(),cleanupState:z.enum(['scheduled','deleting','failed']).optional(),cleanupLastAttemptAt:z.number().optional(),cleanupError:z.string().max(1000).optional(),retentionResultState:z.enum(['preserved','none','failed']).optional(),retentionResultCheckedAt:z.number().int().nonnegative().optional(),previewUrl:z.string().url().optional(),previewProtected:z.boolean().optional(),previewProxyCommandId:z.string().optional(),snapshotId:z.string().optional(),activeCpuMs:z.number().nonnegative().optional(),ingressBytes:z.number().nonnegative().optional(),egressBytes:z.number().nonnegative().optional(),totalCpuMs:z.number().nonnegative().optional(),totalIngressBytes:z.number().nonnegative().optional(),totalEgressBytes:z.number().nonnegative().optional(),budgetBlockedReason:z.string().max(500).optional(),syncedAt:z.number().optional(),syncedFiles:z.number().int().nonnegative().optional(),syncedBytes:z.number().int().nonnegative().optional(),skippedFiles:z.array(z.string()).max(200).optional(),exportedAt:z.number().optional(),exportedBytes:z.number().int().nonnegative().optional(),lastError:z.string().optional(),
  sourceTree:z.string().regex(/^[a-f0-9]{40,64}$/).optional(),pendingSourceTree:z.string().regex(/^[a-f0-9]{40,64}$/).optional(),syncState:z.enum(['uploading','ready','failed']).optional(),syncedPaths:z.array(z.string()).max(500).optional(),
  authority:z.enum(['local','cloud']).optional(),leaseId:z.string().uuid().optional(),authorityGrantedAt:z.number().int().nonnegative().optional(),
  lastResultStatus:z.enum(['completed','needs_input','failed']).optional(),lastResultSummary:z.string().trim().min(1).max(4000).optional(),lastResultUpdatedAt:z.number().int().nonnegative().optional(),localRequest:CloudLocalRequestSchema.optional(),
  desktopClosedAt:z.number().int().nonnegative().optional(),reconnectState:z.enum(['live','desktop_closed','credentials_unavailable','refreshed']).optional(),
});
export const CloudReconnectStatusSchema=z.object({
  checkedAt:z.number(),
  credentialsAvailable:z.boolean(),
  environments:z.array(CloudEnvironmentSchema).max(200),
  note:z.string().max(1000),
});
export type CloudReconnectStatus=z.infer<typeof CloudReconnectStatusSchema>;
export type CloudEnvironment=z.infer<typeof CloudEnvironmentSchema>;
export const CloudCommandRecordSchema=z.object({commandId:z.string().uuid(),providerCommandId:z.string().optional(),environmentId:z.string().uuid(),taskId:z.string(),projectId:z.string().uuid(),executable:z.string(),args:z.array(z.string()),mode:z.enum(['command','service']).default('command'),status:z.enum(['running','completed','failed','stopped','uncertain']),startedAt:z.number(),finishedAt:z.number().optional(),exitCode:z.number().int().optional(),stdout:z.string(),stderr:z.string(),durationMs:z.number().nonnegative().optional(),lastError:z.string().max(1000).optional()});
export type CloudCommandRecord=z.infer<typeof CloudCommandRecordSchema>;
export const CloudCommandResultSchema=CloudCommandRecordSchema.extend({environment:CloudEnvironmentSchema,finishedAt:z.number(),exitCode:z.number().int()});
export type CloudCommandResult=z.infer<typeof CloudCommandResultSchema>;
export const CloudFileEntrySchema=z.object({path:z.string(),name:z.string(),kind:z.enum(['file','directory']),size:z.number().int().nonnegative().optional(),modifiedAt:z.number().optional()});
export type CloudFileEntry=z.infer<typeof CloudFileEntrySchema>;
export const CloudFileSchema=z.object({path:z.string(),content:z.string(),size:z.number().int().nonnegative(),modifiedAt:z.number().optional()});
export type CloudFile=z.infer<typeof CloudFileSchema>;
export const CloudTerminalSessionSchema=z.object({terminalId:z.string().uuid(),environmentId:z.string().uuid(),url:z.string().url(),token:z.string().min(1),cwd:z.string(),environment:CloudEnvironmentSchema});
export type CloudTerminalSession=z.infer<typeof CloudTerminalSessionSchema>;
export const CloudPreviewSessionSchema=z.object({environment:CloudEnvironmentSchema,url:z.string().url(),token:z.string().min(32).max(256)});
export type CloudPreviewSession=z.infer<typeof CloudPreviewSessionSchema>;
export const CloudWorkspaceExportSchema=z.object({environment:CloudEnvironmentSchema,path:z.string().min(1),filename:z.string().min(1).max(255),bytes:z.number().int().nonnegative().max(100*1024*1024)});
export type CloudWorkspaceExport=z.infer<typeof CloudWorkspaceExportSchema>;
export const CloudResultArtifactExportSchema=z.object({environment:CloudEnvironmentSchema,resultUpdatedAt:z.number().int().nonnegative(),artifactPath:z.string().min(1).max(1024),path:z.string().min(1),filename:z.string().min(1).max(255),bytes:z.number().int().nonnegative().max(25*1024*1024),sha256:z.string().regex(/^[a-f0-9]{64}$/)});
export type CloudResultArtifactExport=z.infer<typeof CloudResultArtifactExportSchema>;
export const CloudTaskResultSchema=z.object({
  format:z.literal('aux-cloud-result-v1'),taskId:z.string().min(1),taskRevision:z.number().int().positive(),sourceTree:z.string().regex(/^[a-f0-9]{40,64}$/),
  leaseId:z.string().uuid().optional(),
  status:z.enum(['completed','needs_input','failed']),summary:z.string().trim().min(1).max(4000),updatedAt:z.number().int().nonnegative().max(8_640_000_000_000_000),
  localRequest:CloudLocalRequestSchema.optional(),
  criteria:z.array(z.object({criterionId:z.string().min(1).max(100),status:z.enum(['met','not_met','needs_review']),summary:z.string().trim().min(1).max(2000)})).max(20).default([]),
  artifacts:z.array(z.object({path:z.string().min(1).max(1024),label:z.string().min(1).max(200)})).max(50).default([]),
}).superRefine((result,ctx)=>{if(result.status==='needs_input'&&!result.localRequest)ctx.addIssue({code:'custom',path:['localRequest'],message:'A needs_input result must describe the local request'});});
export type CloudTaskResult=z.infer<typeof CloudTaskResultSchema>;
export const CloudProviderEnvironmentSchema=z.object({remoteName:z.string().min(1),status:z.enum(['pending','running','stopping','stopped','failed','aborted','snapshotting']),createdAt:z.number(),updatedAt:z.number(),region:z.string().optional(),runtime:z.string().optional(),timeoutMinutes:z.number().int().positive().optional(),vcpus:z.number().positive().optional(),memoryMb:z.number().positive().optional(),managed:z.boolean(),environmentId:z.string().uuid().optional(),taskId:z.string().optional()});
export type CloudProviderEnvironment=z.infer<typeof CloudProviderEnvironmentSchema>;
export const CloudResourcePolicySchema=z.object({maxActiveEnvironments:z.number().int().positive(),maxRetainedPerTask:z.number().int().positive(),maxSessionMinutes:z.number().int().positive(),maxLifetimeCpuMs:z.number().int().positive(),maxLifetimeEgressBytes:z.number().int().positive(),defaultCleanupHours:z.number().int().positive(),maxCleanupHours:z.number().int().positive(),currencyBudgetAvailable:z.boolean()});
export const CloudProviderInventorySchema=z.object({checkedAt:z.number(),environments:z.array(CloudProviderEnvironmentSchema).max(200),missingRecords:z.array(CloudEnvironmentSchema).max(200),truncated:z.boolean(),activeCount:z.number().int().nonnegative(),policy:CloudResourcePolicySchema});
export type CloudProviderInventory=z.infer<typeof CloudProviderInventorySchema>;
