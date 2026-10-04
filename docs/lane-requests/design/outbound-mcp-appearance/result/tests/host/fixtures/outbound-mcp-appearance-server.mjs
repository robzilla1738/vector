let pending = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => {
  pending += chunk;
  let end;
  while ((end = pending.indexOf("\n")) >= 0) {
    const line = pending.slice(0, end);
    pending = pending.slice(end + 1);
    if (!line.trim()) continue;
    const request = JSON.parse(line);
    if (request.id === undefined) continue;
    const longTool = { name: "tool_" + "x".repeat(180), description: "Owned long-name appearance fixture; no external effects", inputSchema: { type: "object", properties: { name: { type: "string" } } } };
    const result = request.method === "initialize"
      ? { protocolVersion: request.params.protocolVersion, capabilities: { tools: {} },
          serverInfo: { name: "settings-fixture", version: "1" } }
      : request.method === "tools/list"
        ? { tools: [{ name: "greet", description: "Say hello from the disposable MCP fixture",
            inputSchema: { type: "object", properties: { name: { type: "string" } } } }, longTool] }
        : { content: [{ type: "text", text: `Hello, ${request.params.arguments.name ?? "world"}` }] };
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: request.id, result }) + "\n");
  }
});
