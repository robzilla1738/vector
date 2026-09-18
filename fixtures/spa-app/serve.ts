import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const items = ["alpha", "beta"];

const server = createServer((req, res) => {
  if (req.url === "/api/state") {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ items }));
    return;
  }
  const file = req.url === "/app.js" ? "app.js" : "index.html";
  const type = file.endsWith(".js") ? "text/javascript" : "text/html";
  res.setHeader("content-type", type);
  res.end(readFileSync(join(dir, file)));
});

const port = Number(process.env.PORT ?? 4820);
server.listen(port, () => {
  console.log(`spa-app http://127.0.0.1:${port}/`);
});
