import { describe, expect, it, vi } from "vitest";
import { channelsMethods } from "../../apps/runtime/src/api/methods/channels.js";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";
import type { ChannelControlOwner } from "../../apps/runtime/src/services/channels.js";

function fixture(
  input: {
    external?: boolean;
    codeMode?: true;
    token?: string | null;
    private?: boolean;
    changedWindow?: boolean;
  } = {},
) {
  let constructions = 0;
  const read = vi.fn(async () => ({
    windowId: input.changedWindow && read.mock.calls.length > 1 ? "other-window" : "original-window",
  }));
  const list = vi.fn(async (owner: ChannelControlOwner) => {
    await owner.current();
    return [];
  });
  const context = {
    method: "channels.list",
    params: {},
    client: {
      external: input.external ?? false,
      codeMode: input.codeMode,
      nativeTurnContext: input.token === null ? undefined : "original-native-proof",
    },
    s: {
      native: { turnSourceContext: read },
      nativeIdentity: Promise.resolve({ privateSession: input.private ?? false }),
      get channels() {
        constructions++;
        return { list };
      },
    },
  } as unknown as MethodCtx;
  return { context, read, list, constructions: () => constructions };
}

describe("original channel Settings authority", () => {
  it.each([{ external: true }, { codeMode: true as const }, { token: null }, { private: true }])(
    "refuses %o before loading channel secrets or records",
    async (input) => {
      const f = fixture(input);
      await expect(channelsMethods["channels.list"]!(f.context)).rejects.toMatchObject({
        code: "permission_denied",
      });
      expect(f.constructions()).toBe(0);
      expect(f.list).not.toHaveBeenCalled();
      expect(f.read).not.toHaveBeenCalled();
    },
  );
  it("binds reads to the original native document's window", async () => {
    const f = fixture({ changedWindow: true });
    await expect(channelsMethods["channels.list"]!(f.context)).rejects.toMatchObject({
      code: "permission_denied",
    });
    expect(f.read).toHaveBeenCalledTimes(2);
  });
  it("passes a revalidated local owner to the actual channel service", async () => {
    const f = fixture();
    await expect(channelsMethods["channels.list"]!(f.context)).resolves.toEqual([]);
    expect(f.list).toHaveBeenCalledOnce();
    expect(f.read).toHaveBeenCalledTimes(2);
  });
});
