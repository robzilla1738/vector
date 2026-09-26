import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { MethodSchemas } from "@aux/contracts";
import { browserImporter } from "./context.js";

async function h_import_preview(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  return browserImporter(s).preview();
}
async function h_import_run(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return browserImporter(s).start(MethodSchemas["import.run"].parse(params));
}
async function h_import_status(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return browserImporter(s).status(MethodSchemas["import.status"].parse(params).jobId);
}
async function h_import_cancel(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return browserImporter(s).cancel(MethodSchemas["import.cancel"].parse(params).jobId);
}

export const importMethods: Partial<Record<MethodName, MethodHandler>> = {
  "import.preview": h_import_preview,
  "import.run": h_import_run,
  "import.status": h_import_status,
  "import.cancel": h_import_cancel,
};
