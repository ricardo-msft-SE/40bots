import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = path.join(root, "dist");
await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, "which-tool"), { recursive: true });
for (const name of ["index.html", "styles.css", "script.js", ".nojekyll", "assets", "deployment-plan"]) {
  await cp(path.join(root, name), path.join(out, name), { recursive: true });
}
const gameFiles = (await readdir(path.join(root, "which-tool"))).filter((name) =>
  [".html", ".css", ".mjs"].includes(path.extname(name)) && name !== "auth-entry.mjs");
for (const name of gameFiles) await cp(path.join(root, "which-tool", name), path.join(out, "which-tool", name));
await build({
  entryPoints: [path.join(root, "which-tool", "auth-entry.mjs")],
  outfile: path.join(out, "which-tool", "auth.js"),
  bundle: true,
  minify: true,
  format: "esm",
  target: ["es2022"],
  legalComments: "eof"
});
console.log("Built static-only site in dist. API source, tests, and local settings are excluded.");
