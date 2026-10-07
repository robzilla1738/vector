import { AuxError, MethodSchemas, type MethodName } from "@aux/contracts";
import type { MethodCtx, MethodHandler } from "./context.js";
function owner(ctx: MethodCtx) {
  if (ctx.client.external || ctx.client.codeMode || !ctx.client.nativeTurnContext || !ctx.s.terminals)
    throw new AuxError("permission_denied", "Terminal requires its original local Aux window.");
  return { terminals: ctx.s.terminals, token: ctx.client.nativeTurnContext };
}
async function h_terminal_start(ctx: MethodCtx) {
  const { terminals, token } = owner(ctx);
  return terminals.start(MethodSchemas["terminal.start"].parse(ctx.params), token);
}
async function h_terminal_read(ctx: MethodCtx) {
  const { terminals, token } = owner(ctx),
    p = MethodSchemas["terminal.read"].parse(ctx.params);
  return terminals.read(p.terminalId, p.offset, token);
}
async function h_terminal_input(ctx: MethodCtx) {
  const { terminals, token } = owner(ctx),
    p = MethodSchemas["terminal.input"].parse(ctx.params);
  return terminals.input(p.terminalId, p.sequence, p.data, token);
}
async function h_terminal_resize(ctx: MethodCtx) {
  const { terminals, token } = owner(ctx),
    p = MethodSchemas["terminal.resize"].parse(ctx.params);
  return terminals.resize(p.terminalId, p.cols, p.rows, token);
}
async function h_terminal_close(ctx: MethodCtx) {
  const { terminals, token } = owner(ctx),
    p = MethodSchemas["terminal.close"].parse(ctx.params);
  return terminals.close(p.terminalId, token);
}
async function h_terminal_listeners(ctx: MethodCtx) {
  const { terminals, token } = owner(ctx),
    p = MethodSchemas["terminal.listeners"].parse(ctx.params);
  return terminals.listeners(p.terminalId, token);
}
async function h_terminal_preview(ctx: MethodCtx) {
  const { terminals, token } = owner(ctx),
    p = MethodSchemas["terminal.preview"].parse(ctx.params);
  return terminals.preview(p, token);
}
async function h_terminal_previewClose(ctx: MethodCtx) {
  const { terminals, token } = owner(ctx),
    p = MethodSchemas["terminal.previewClose"].parse(ctx.params);
  return terminals.closePreview(p.terminalId, p.previewId, token);
}
export const terminalMethods: Partial<Record<MethodName, MethodHandler>> = {
  "terminal.start": h_terminal_start,
  "terminal.read": h_terminal_read,
  "terminal.input": h_terminal_input,
  "terminal.resize": h_terminal_resize,
  "terminal.close": h_terminal_close,
  "terminal.listeners": h_terminal_listeners,
  "terminal.preview": h_terminal_preview,
  "terminal.previewClose": h_terminal_previewClose,
};
