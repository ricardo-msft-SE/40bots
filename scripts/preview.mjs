import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".svg": "image/svg+xml", ".jpg": "image/jpeg" };
const server = createServer(async (req, res) => {
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, { Allow: "GET, HEAD" }).end("Use GET or HEAD.");
    return;
  }
  let name;
  try { name = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch { res.writeHead(400).end("Invalid URL."); return; }
  if (name.endsWith("/")) name += "index.html";
  const file = path.resolve(root, `.${name}`);
  if (!file.startsWith(root)) {
    res.writeHead(403).end("Forbidden.");
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch (error) {
    if (["ENOENT", "ENOTDIR", "EISDIR"].includes(error.code)) {
      res.writeHead(404).end("Not found. Run npm run build first.");
      return;
    }
    console.error("Preview read failed:", error.message);
    res.writeHead(500).end("Preview file could not be read.");
  }
});
server.listen(8000, "127.0.0.1", () => console.log("Preview: http://localhost:8000/which-tool/"));
