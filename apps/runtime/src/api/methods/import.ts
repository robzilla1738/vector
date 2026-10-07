import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError, MethodSchemas } from "@aux/contracts";
import { browserImporter } from "./context.js";

function importOwner(ctx: MethodCtx): string {
  if (ctx.client.external || ctx.client.codeMode || !ctx.client.nativeTurnContext)
    throw new AuxError("permission_denied", "Browser import requires its original Aux window.");
  return ctx.client.nativeTurnContext;
}

async function h_import_preview(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  return browserImporter(s).preview(importOwner(ctx));
}
async function h_import_run(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return browserImporter(s).start(MethodSchemas["import.run"].parse(params), importOwner(ctx));
}
async function h_import_status(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return browserImporter(s).status(MethodSchemas["import.status"].parse(params).jobId, importOwner(ctx));
}
async function h_import_cancel(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return browserImporter(s).cancel(MethodSchemas["import.cancel"].parse(params).jobId, importOwner(ctx));
}

async function h_import_selectWindow(ctx: MethodCtx): Promise<unknown> {
  return browserImporter(ctx.s).selectWindow(
    MethodSchemas["import.selectWindow"].parse(ctx.params),
    importOwner(ctx),
  );
}
async function h_import_selectExport(ctx: MethodCtx): Promise<unknown> {
  return browserImporter(ctx.s).selectExport(
    MethodSchemas["import.selectExport"].parse(ctx.params),
    importOwner(ctx),
  );
}
async function h_import_exportStatus(ctx: MethodCtx): Promise<unknown> {
  return browserImporter(ctx.s).exportStatus(
    MethodSchemas["import.exportStatus"].parse(ctx.params).selectionId,
    importOwner(ctx),
  );
}
async function h_import_cancelExport(ctx: MethodCtx): Promise<unknown> {
  return browserImporter(ctx.s).cancelExport(
    MethodSchemas["import.cancelExport"].parse(ctx.params).selectionId,
    importOwner(ctx),
  );
}

async function h_import_extensions_review(ctx: MethodCtx): Promise<unknown> {
  return browserImporter(ctx.s).reviewExtensions(
    MethodSchemas["import.extensions.review"].parse(ctx.params),
    importOwner(ctx),
  );
}
export const importMethods: Partial<Record<MethodName, MethodHandler>> = {
  "import.extensions.review": h_import_extensions_review,
  "import.selectWindow": h_import_selectWindow,
  "import.selectExport": h_import_selectExport,
  "import.exportStatus": h_import_exportStatus,
  "import.cancelExport": h_import_cancelExport,
  "import.preview": h_import_preview,
  "import.run": h_import_run,
  "import.status": h_import_status,
  "import.cancel": h_import_cancel,
};
