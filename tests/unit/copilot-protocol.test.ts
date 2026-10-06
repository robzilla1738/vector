import { expect, it, vi } from "vitest";
import { copilotJson } from "../../apps/runtime/dist/services/copilot-protocol.js";

it("joins the actual refused response body before publishing account request failure", async () => {
  let release!: () => void;
  const joined = new Promise<void>((resolve) => {
    release = resolve;
  });
  const cancel = vi.fn(() => joined);
  const response = new Response(new ReadableStream<Uint8Array>({ cancel }), {
    status: 403,
  });
  let settled = false;
  const result = copilotJson(response, new AbortController().signal).then(
    () => {
      throw new Error("Unexpected accepted account response");
    },
    (error: unknown) => {
      settled = true;
      return error;
    },
  );
  await vi.waitFor(() => expect(cancel).toHaveBeenCalledTimes(1));
  expect(settled).toBe(false);
  release();
  expect(await result).toMatchObject({ code: "backend_unavailable" });
});
