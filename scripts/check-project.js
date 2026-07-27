import { access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const failures = [];

async function walk(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", ".wrangler"].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walk(fullPath));
    else output.push(fullPath);
  }
  return output;
}

const files = await walk(root);
const jsFiles = files.filter((file) => file.endsWith(".js"));
for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } catch (error) {
    failures.push(`JavaScript syntax: ${path.relative(root, file)}\n${error.stderr?.toString() || error.message}`);
  }
}

for (const file of files.filter((item) => item.endsWith(".html"))) {
  const source = await readFile(file, "utf8");
  if (!/<!doctype html>/i.test(source)) failures.push(`DOCTYPE missing: ${path.relative(root, file)}`);
  for (const match of source.matchAll(/(?:src|href)=["']([^"'#]+)["']/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|\$\{)/.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    if (!clean) continue;
    const target = clean.startsWith("/")
      ? path.join(root, clean)
      : path.resolve(path.dirname(file), clean);
    try {
      await access(target, constants.F_OK);
    } catch {
      failures.push(`Missing local reference: ${path.relative(root, file)} -> ${reference}`);
    }
  }
}

const authSource = await readFile(path.join(root, "js/auth.js"), "utf8");
if (!authSource.includes("export function requireAdmin")) failures.push("auth.js does not export requireAdmin");

const workerSource = await readFile(path.join(root, "worker.js"), "utf8");
for (const marker of ["og:image:width", "news-schema", "createCloudinarySignature", "createSitemap"]) {
  if (!workerSource.includes(marker)) failures.push(`Worker feature missing: ${marker}`);
}

const directUploadFiles = [];
for (const file of jsFiles.filter((item) =>
  !item.endsWith("cloudinary-upload.js") && !item.endsWith("check-project.js")
)) {
  const source = await readFile(file, "utf8");
  if (source.includes("api.cloudinary.com/v1_1")) directUploadFiles.push(path.relative(root, file));
}
if (directUploadFiles.length) failures.push(`Direct unsigned Cloudinary upload remains in: ${directUploadFiles.join(", ")}`);

if (failures.length) {
  console.error(`Project check failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`Project check passed: ${jsFiles.length} JavaScript files and ${files.filter((file) => file.endsWith(".html")).length} HTML files checked.`);
