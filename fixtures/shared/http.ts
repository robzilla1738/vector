import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse, url: URL, body: Buffer) => void | Promise<void>;

export function send(res: ServerResponse, status: number, body: string | Buffer, type = "text/html; charset=utf-8") {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(body);
}
export const html = (res: ServerResponse, s: string) => send(res, 200, s);
export const json = (res: ServerResponse, v: unknown, status = 200) =>
  send(res, status, JSON.stringify(v, null, 2), "application/json");
export const notFound = (res: ServerResponse) => send(res, 404, "not found", "text/plain");

export function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export function page(title: string, body: string, extraHead = ""): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${extraHead}
<style>
  body{font-family:system-ui,-apple-system,sans-serif;margin:0;background:#f5f6f8;color:#1b1e22}
  header{background:#1e2430;color:#fff;padding:10px 18px;display:flex;gap:14px;align-items:baseline}
  header a{color:#9fc0ff;text-decoration:none;font-size:13px}
  header h1{font-size:15px;margin:0;font-weight:600}
  main{padding:18px;max-width:960px;margin:0 auto}
  table{border-collapse:collapse;width:100%;background:#fff}
  th,td{border:1px solid #d9dde3;padding:6px 10px;text-align:left;font-size:13px}
  th{background:#eef1f5}
  .card{background:#fff;border:1px solid #d9dde3;border-radius:8px;padding:14px;margin-bottom:12px}
  button,.btn{background:#2f6fed;color:#fff;border:0;border-radius:6px;padding:7px 12px;font-size:13px;cursor:pointer;text-decoration:none;display:inline-block}
  button.secondary,.btn.secondary{background:#e8ecf2;color:#1b1e22}
  input,select,textarea{font:inherit;padding:6px 8px;border:1px solid #c7cdd6;border-radius:6px;font-size:13px}
  label{display:block;font-size:12px;color:#525a66;margin:10px 0 4px}
  .muted{color:#6b7280;font-size:12px}
  .pill{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;background:#e8ecf2}
  .pill.review{background:#fff2cc}.pill.approved{background:#d9f2df}.pill.progress{background:#dbe8ff}
  .modal-mask{position:fixed;inset:0;background:rgba(10,14,20,.45);display:none;align-items:center;justify-content:center}
  .modal-mask.open{display:flex}
  .modal{background:#fff;border-radius:10px;padding:20px;width:380px}
  nav.pagination{margin:14px 0;display:flex;gap:6px}
  nav.pagination a{padding:4px 10px;border:1px solid #d9dde3;border-radius:5px;background:#fff;text-decoration:none;color:#1b1e22;font-size:13px}
  nav.pagination a.on{background:#2f6fed;color:#fff}
</style></head><body>${body}</body></html>`;
}

export function serve(port: number, name: string, handler: Handler) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
      const body = await readBody(req);
      await handler(req, res, url, body);
    } catch (e) {
      send(res, 500, String(e), "text/plain");
    }
  });
  server.listen(port, "127.0.0.1", () => {
    console.log(`[fixture:${name}] http://127.0.0.1:${port}`);
  });
  return server;
}

export function parseForm(body: Buffer, contentType: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!contentType?.includes("application/x-www-form-urlencoded")) return out;
  for (const pair of body.toString("utf8").split("&")) {
    const [k, v = ""] = pair.split("=");
    out[decodeURIComponent(k!.replace(/\+/g, " "))] = decodeURIComponent(v.replace(/\+/g, " "));
  }
  return out;
}
