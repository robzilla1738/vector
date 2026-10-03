import { AuxError, NativePageTakeoverSchema, type AuxErrorCode, type NativePageTakeover, type RpcChannel } from "@aux/contracts";

/** Bind only to the authenticated Profile host channel, never the public API. */
export function registerNativeControlChannel(
  channel: RpcChannel,
  apply: (input: NativePageTakeover) => Promise<unknown>,
  onNoteError: (code: AuxErrorCode) => void,
): void {
  const takeover = async (raw: unknown) => {
    const parsed = NativePageTakeoverSchema.safeParse(raw);
    if (!parsed.success)
      throw new AuxError("invalid_params", "Native takeover requires its original document and run receipt.");
    return apply(parsed.data);
  };
  channel.onMethod("view.takeover", takeover);
  channel.onNotify((type, payload) => {
    if (type === "view.takeover")
      void takeover(payload).catch((error) =>
        onNoteError(error instanceof AuxError ? error.code : "internal"),
      );
  });
}
