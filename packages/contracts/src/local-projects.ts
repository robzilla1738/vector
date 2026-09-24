import {z} from 'zod';
export const LocalPreviewCheckSchema=z.object({url:z.string(),checkedAt:z.number(),state:z.enum(['responding','http_error','unreachable']),statusCode:z.number().optional(),message:z.string()});
export type LocalPreviewCheck=z.infer<typeof LocalPreviewCheckSchema>;
export const ProjectGithubStatusSchema=z.object({owner:z.string(),repository:z.string(),remoteUrl:z.string().url(),branch:z.string(),baseCommit:z.string(),headCommit:z.string(),defaultBranch:z.string(),private:z.boolean(),account:z.string(),permissions:z.object({admin:z.boolean(),maintain:z.boolean().optional(),push:z.boolean(),triage:z.boolean().optional(),pull:z.boolean()}),basePresent:z.boolean(),headPresent:z.boolean(),checks:z.object({state:z.string(),total:z.number().int().nonnegative(),updatedAt:z.number()}).nullable(),checkRuns:z.array(z.object({id:z.number(),name:z.string(),status:z.string(),conclusion:z.string().nullable(),detailsUrl:z.string().url().nullable()})).default([]),pullRequests:z.array(z.object({number:z.number().int().positive(),title:z.string(),url:z.string().url(),draft:z.boolean(),base:z.string(),head:z.string(),updatedAt:z.string()})).default([]),issues:z.array(z.object({number:z.number().int().positive(),title:z.string().max(500),url:z.string().url(),body:z.string().max(8000).nullable(),author:z.string().max(200),labels:z.array(z.string().max(100)).max(20),updatedAt:z.string()})).max(20).default([]),checkedAt:z.number()});
export type ProjectGithubStatus=z.infer<typeof ProjectGithubStatusSchema>;
export const ProjectIncidentReportSchema=z.object({projectId:z.string().uuid(),generatedAt:z.number(),path:z.string(),content:z.string(),page:z.object({pageId:z.string(),url:z.string(),title:z.string()}),consoleCount:z.number().int().nonnegative(),networkCount:z.number().int().nonnegative(),preparedFixPath:z.string().optional(),preparedFixContent:z.string().optional()});
export type ProjectIncidentReport=z.infer<typeof ProjectIncidentReportSchema>;
export const LocalProjectSchema = z.object({
  projectId:z.string().uuid(), name:z.string(), sourcePath:z.string(), path:z.string(),
  branch:z.string(), baseCommit:z.string(), createdAt:z.number(), preview:LocalPreviewCheckSchema.optional(),
  state:z.enum(['creating','ready','failed']), error:z.string().optional(),
  github:z.lazy(()=>ProjectGithubStatusSchema).optional(),
});
export type LocalProject = z.infer<typeof LocalProjectSchema>;
export type RepositorySelection = {selectionId:string; name:string; path:string; commit:string; status:string};
export const ProjectEnvironmentToolSchema=z.object({command:z.string(),available:z.boolean(),version:z.string().optional()});
export const ProjectEnvironmentSuggestionSchema=z.object({id:z.string(),label:z.string(),command:z.string().min(1).max(8000),intent:z.enum(['setup','check','run','service'])});
export const ProjectEnvironmentSchema=z.object({
  detectedAt:z.number(),tools:z.array(ProjectEnvironmentToolSchema),
  unsupported:z.array(z.object({ecosystem:z.string(),markers:z.array(z.string()),reason:z.string()})),
  javascript:z.object({manager:z.enum(['npm','pnpm','yarn','bun']),lockfile:z.string().optional(),dependenciesPresent:z.boolean(),scripts:z.array(z.string()),workspace:z.object({marker:z.string(),patterns:z.array(z.string()),affectedSuggestion:ProjectEnvironmentSuggestionSchema.optional(),packages:z.array(z.object({path:z.string(),name:z.string(),scripts:z.array(z.string()),dependencies:z.array(z.string()),affected:z.boolean(),reasons:z.array(z.string()),suggestions:z.array(ProjectEnvironmentSuggestionSchema)}))}).optional(),suggestions:z.array(ProjectEnvironmentSuggestionSchema),error:z.string().optional()}).optional(),
  python:z.object({manager:z.enum(['python','uv','poetry','pipenv']),manifests:z.array(z.string()),environmentPresent:z.boolean(),frameworks:z.array(z.enum(['django','fastapi','flask'])),suggestions:z.array(ProjectEnvironmentSuggestionSchema),error:z.string().optional()}).optional(),
  rust:z.object({manifest:z.string(),workspace:z.boolean(),binary:z.boolean(),locked:z.boolean().default(false),members:z.array(z.object({path:z.string(),name:z.string(),affected:z.boolean(),reasons:z.array(z.string())})).default([]),affectedSuggestion:ProjectEnvironmentSuggestionSchema.optional(),suggestions:z.array(ProjectEnvironmentSuggestionSchema),error:z.string().optional()}).optional(),
  go:z.object({manifest:z.string(),module:z.string().optional(),binary:z.boolean(),workspace:z.object({marker:z.literal('go.work'),modules:z.array(z.object({path:z.string(),module:z.string(),affected:z.boolean(),reasons:z.array(z.string())})),affectedSuggestion:ProjectEnvironmentSuggestionSchema.optional()}).optional(),suggestions:z.array(ProjectEnvironmentSuggestionSchema),error:z.string().optional()}).optional(),
  additional:z.array(z.object({ecosystem:z.enum(['Ruby','JVM','PHP','Container']),manifests:z.array(z.string()),description:z.string(),suggestions:z.array(ProjectEnvironmentSuggestionSchema),error:z.string().optional()})).optional(),
});
export type ProjectEnvironment=z.infer<typeof ProjectEnvironmentSchema>;
export type ProjectEnvironmentSuggestion=z.infer<typeof ProjectEnvironmentSuggestionSchema>;
export const ProjectInspectionSchema=z.object({project:LocalProjectSchema,status:z.string(),inspectedAt:z.number(),environment:ProjectEnvironmentSchema,changes:z.object({patch:z.string(),untracked:z.array(z.string()),error:z.string().optional()})});
export type ProjectInspection = z.infer<typeof ProjectInspectionSchema>;

export const ProjectCommandTaskSchema=z.object({taskId:z.string().min(1),taskRevision:z.number().int().positive(),title:z.string(),workspaceId:z.string(),invocationId:z.string().optional()});
export type ProjectCommandTask=z.infer<typeof ProjectCommandTaskSchema>;
export const ProjectEffectNameSchema=z.enum(['file.write','file.create','file.rename','file.delete','command.start','command.stop','commit.create','preview.open','incident.report']);
export type ProjectEffectName=z.infer<typeof ProjectEffectNameSchema>;
export const ProjectCommandContextSchema=z.object({taskId:z.string().min(1),expectedRevision:z.number().int().positive()}).strict();
export type ProjectCommandContext=z.infer<typeof ProjectCommandContextSchema>;
export const ProjectServiceStackRequestSchema=z.object({
  label:z.string().trim().min(1).max(80).default('Local services'),
  commands:z.array(z.string().trim().min(1).max(8000)).min(2).max(4),
}).strict().superRefine((value,ctx)=>{if(new Set(value.commands).size!==value.commands.length)ctx.addIssue({code:'custom',message:'Each service command must be unique.',path:['commands']});});
export type ProjectServiceStackRequest=z.infer<typeof ProjectServiceStackRequestSchema>;
export const ProjectReviewContextSchema=z.object({taskId:z.string().min(1),taskRevision:z.number().int().positive(),title:z.string(),objective:z.string().optional(),workspaceId:z.string(),invocationId:z.string().optional()});
export type ProjectReviewContext=z.infer<typeof ProjectReviewContextSchema>;
export const ProjectCommandSchema=z.object({
  commandId:z.string().uuid(),projectId:z.string().uuid(),command:z.string().min(1).max(8000),
  mode:z.enum(['command','service']).default('command'),task:ProjectCommandTaskSchema.optional(),cwd:z.string(),startedAt:z.number(),finishedAt:z.number().optional(),
  stackId:z.string().uuid().optional(),stackLabel:z.string().min(1).max(80).optional(),stackOrder:z.number().int().min(0).max(3).optional(),
  state:z.enum(['running','stopping','succeeded','failed','canceled','timed_out','interrupted']),
  exitCode:z.number().nullable().optional(),output:z.string(),truncated:z.boolean(),
  verifiedTree:z.string().regex(/^[a-f0-9]{40,64}$/).optional(),verificationRecordedAt:z.number().optional(),verificationError:z.string().max(1000).optional(),
});
export type ProjectCommand=z.infer<typeof ProjectCommandSchema>;
export const ProjectFileSchema=z.object({projectId:z.string(),name:z.string(),content:z.string(),sha256:z.string().regex(/^[a-f0-9]{64}$/)});
export type ProjectFile=z.infer<typeof ProjectFileSchema>;
export type ProjectFileMutation={file?:ProjectFile;recoveryPath?:string;name:string};
export type ProjectFileVersion={versionId:string;savedAt:number;sha256:string;byteLength:number};
export type ProjectFileHistory={versions:ProjectFileVersion[];limited:boolean;unreadable:number};
export type ProjectFileVersionSnapshot=ProjectFileVersion&{content:string};
export const ProjectReviewSummarySchema=z.object({
  projectId:z.string(),generatedAt:z.number(),path:z.string(),content:z.string(),title:z.string(),snapshotTree:z.string().regex(/^[a-f0-9]{40,64}$/),
  readiness:z.object({state:z.enum(['ready','needs_attention']),reasons:z.array(z.string())}),
  patch:z.object({path:z.string().optional(),content:z.string().optional(),sha256:z.string().regex(/^[a-f0-9]{64}$/).optional(),byteLength:z.number().int().nonnegative().optional(),complete:z.boolean(),error:z.string().optional()}),
  draft:z.object({path:z.string(),content:z.string(),sha256:z.string().regex(/^[a-f0-9]{64}$/)}),
  manifestPath:z.string(),manifestSha256:z.string().regex(/^[a-f0-9]{64}$/),
});
export type ProjectReviewSummary=z.infer<typeof ProjectReviewSummarySchema>;
export const ProjectCommitRequestSchema=z.object({expectedPatchHash:z.string().regex(/^[a-f0-9]{64}$/),expectedTree:z.string().regex(/^[a-f0-9]{40,64}$/),message:z.string().trim().min(1).max(200),authorName:z.string().trim().min(1).max(200),authorEmail:z.string().trim().min(3).max(320).regex(/^[^\s@]+@[^\s@]+$/)}).strict();
export type ProjectCommitRequest=z.infer<typeof ProjectCommitRequestSchema>;
export const ProjectCommitResultSchema=z.object({projectId:z.string().uuid(),commit:z.string().regex(/^[a-f0-9]{40,64}$/),previousCommit:z.string().regex(/^[a-f0-9]{40,64}$/),tree:z.string().regex(/^[a-f0-9]{40,64}$/),message:z.string(),authorName:z.string(),authorEmail:z.string(),committedAt:z.number(),indexRecoveryPath:z.string()});
export type ProjectCommitResult=z.infer<typeof ProjectCommitResultSchema>;
