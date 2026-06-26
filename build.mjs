import { build, context } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, "dist");
const watch = process.argv.includes("--watch");

const entryPoints = {
  background: join(root, "src/background/index.js"),
  content: join(root, "src/content/index.js"),
  "reader/reader": join(root, "src/reader/index.js"),
  "options/options": join(root, "src/options/index.js"),
  "home/home": join(root, "src/home/index.js"),
};

const staticCopies = [
  ["manifest.json", "manifest.json"],
  ["src/reader/reader.html", "reader/reader.html"],
  ["src/options/options.html", "options/options.html"],
  ["src/home/home.html", "home/home.html"],
  ["assets/img", "assets/img"],
  ["data", "data"],
];

async function copyStatic() {
  for (const [from, to] of staticCopies) {
    await cp(join(root, from), join(outDir, to), { recursive: true });
  }
}

const buildOptions = {
  entryPoints,
  outdir: outDir,
  bundle: true,
  format: "iife",
  target: "firefox115",
  logLevel: "info",
  legalComments: "none",
};

async function run() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  if (watch) {
    const ctx = await context(buildOptions);
    await ctx.watch();
    await copyStatic();
    console.log("Watching for changes... (static files copied once)");
  } else {
    await build(buildOptions);
    await copyStatic();
    console.log("Build complete -> dist/");
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
