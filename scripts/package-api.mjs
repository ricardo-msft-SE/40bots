import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = path.join(root, "dist-api");
await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, "which-tool"), { recursive: true });
await cp(path.join(root, "api", "src"), path.join(out, "api", "src"), { recursive: true });
await cp(path.join(root, "api", "host.json"), path.join(out, "host.json"));
await cp(path.join(root, "which-tool", "catalog.mjs"), path.join(out, "which-tool", "catalog.mjs"));
const manifest = JSON.parse(await readFile(path.join(root, "api", "package.json"), "utf8"));
manifest.main = "api/src/index.mjs";
manifest.scripts = { start: "func start" };
await writeFile(path.join(out, "package.json"), JSON.stringify(manifest, null, 2) + "\n");
await cp(path.join(root, "api", "package-lock.json"), path.join(out, "package-lock.json"));
console.log("Packaged function root in dist-api. Deploy this directory, not api, so the shared catalog is included.");
