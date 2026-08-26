import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(".");
const output = resolve(root, "dist/client");

await mkdir(resolve(output, "data"), { recursive: true });
await mkdir(resolve(output, "assets"), { recursive: true });

for (const file of ["index.html", "creator.html", "styles.css", "app.js", "creator.js"]) {
  await cp(resolve(root, file), resolve(output, file));
}

await cp(
  resolve(root, "data/content.json"),
  resolve(output, "data/content.json"),
);

await cp(
  resolve(root, "assets"),
  resolve(output, "assets"),
  { recursive: true },
);

console.log("Prepared Cloudflare static assets in dist/client");
