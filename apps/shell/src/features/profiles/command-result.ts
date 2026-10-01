import type { z } from "zod";
import { executeCommand } from "../../commands";
import type { CommandInvocation } from "../registry";
/** UI mutations await the registered executor and validate its actual native acknowledgement. */
export async function commandResult<S extends z.ZodType>(id: string, schema: S, payload?: CommandInvocation["payload"]): Promise<z.output<S>> {
  return schema.parse(await executeCommand(id, {payload}));
}
