import type { McpTransportProvider } from "@aux/runtime";
type Transport = Awaited<ReturnType<McpTransportProvider>>;
export function fakeTransport(
  calls: string[],
  toolResult: unknown = { content: [{ type: "text", text: "done" }] },
): Transport {
  const transport = {
    onmessage: undefined as ((message: unknown) => void) | undefined,
    async start() {},
    async close() {},
    async send(message: { id?: number; method?: string; params?: { protocolVersion?: string } }) {
      if (message.id === undefined) return;
      calls.push(message.method ?? "");
      const result =
        message.method === "initialize"
          ? {
              protocolVersion: message.params?.protocolVersion ?? "2025-11-25",
              capabilities: { tools: {} },
              serverInfo: { name: "fixture", version: "1" },
            }
          : message.method === "tools/list"
            ? { tools: [{ name: "read", inputSchema: { type: "object", properties: {} } }] }
            : toolResult;
      queueMicrotask(() => transport.onmessage?.({ jsonrpc: "2.0", id: message.id, result }));
    },
  };
  return transport as unknown as Transport;
}
