import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_EXTENSIONS = new Set([".css", ".html", ".js", ".mjs"]);
const RETAINED_METADATA_EXTENSIONS = new Set([".md", ".txt"]);
const IGNORED_DIRECTORIES = new Set([".git", ".worktrees", "dist", "node_modules", "playwright-report", "test-results"]);
const QUOTED_ASSET_REFERENCE = /["'`](assets\/[^"'`]+)["'`]/g;
const UNQUOTED_CSS_ASSET_REFERENCE = /url\(\s*(assets\/[^\s)]+)\s*\)/g;

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

async function listFiles(rootDir, predicate, relativeDir = "") {
  const directory = path.join(rootDir, relativeDir);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) {
        files.push(...await listFiles(rootDir, predicate, relativePath));
      }
      continue;
    }

    if (entry.isFile() && predicate(relativePath)) {
      files.push(toPosixPath(relativePath));
    }
  }

  return files;
}

async function collectReferences(rootDir) {
  const sourceFiles = await listFiles(
    rootDir,
    (relativePath) => {
      const sourcePath = toPosixPath(relativePath);
      return SOURCE_EXTENSIONS.has(path.extname(relativePath))
        && (sourcePath === "index.html" || sourcePath === "game.js" || sourcePath === "styles.css" || sourcePath.startsWith("src/"));
    },
  );
  const exact = new Set();
  const prefixes = new Set();

  for (const relativePath of sourceFiles) {
    const source = await readFile(path.join(rootDir, relativePath), "utf8");
    const matches = [
      ...source.matchAll(QUOTED_ASSET_REFERENCE),
      ...source.matchAll(UNQUOTED_CSS_ASSET_REFERENCE),
    ];
    for (const rawMatch of matches) {
      const reference = rawMatch[1];
      const interpolationIndex = reference.indexOf("${");
      if (interpolationIndex >= 0) {
        prefixes.add(reference.slice(0, interpolationIndex));
      } else {
        exact.add(reference);
      }
    }
  }

  return { exact, prefixes };
}

async function hashFile(filePath) {
  const contents = await readFile(filePath);
  return createHash("sha256").update(contents).digest("hex");
}

export async function auditAssets(rootDir) {
  const assetsRoot = path.join(rootDir, "assets");
  const assetFiles = (await listFiles(assetsRoot, () => true)).map((relativePath) => `assets/${relativePath}`).sort();
  const references = await collectReferences(rootDir);
  const referenced = assetFiles.filter((assetPath) => references.exact.has(assetPath) || [...references.prefixes].some((prefix) => assetPath.startsWith(prefix)));
  const unusedAssets = assetFiles.filter((assetPath) => !referenced.includes(assetPath));
  const retainedUnreferenced = unusedAssets.filter((assetPath) => RETAINED_METADATA_EXTENSIONS.has(path.extname(assetPath).toLowerCase()));
  const unreferenced = unusedAssets.filter((assetPath) => !retainedUnreferenced.includes(assetPath));
  const missingReferenced = [...references.exact].filter((reference) => !assetFiles.includes(reference)).sort();
  const duplicateMap = new Map();
  let totalBytes = 0;

  for (const assetPath of assetFiles) {
    const absolutePath = path.join(rootDir, assetPath);
    const [{ size }, hash] = await Promise.all([stat(absolutePath), hashFile(absolutePath)]);
    totalBytes += size;
    const duplicateGroup = duplicateMap.get(hash) ?? [];
    duplicateGroup.push(assetPath);
    duplicateMap.set(hash, duplicateGroup);
  }

  const duplicateGroups = [...duplicateMap.values()]
    .filter((group) => group.length > 1)
    .map((group) => group.sort())
    .sort((left, right) => left[0].localeCompare(right[0]));

  return {
    assetCount: assetFiles.length,
    totalBytes,
    referencedCount: referenced.length,
    referenced,
    unreferenced,
    retainedUnreferenced,
    missingReferenced,
    duplicateGroups,
  };
}

export function formatAssetAuditReport(report) {
  return JSON.stringify(report, null, 2) + "\n";
}

async function runCli() {
  const rootDir = process.cwd();
  const report = await auditAssets(rootDir);
  const reportsDir = path.join(rootDir, "reports");
  await mkdir(reportsDir, { recursive: true });
  await writeFile(path.join(reportsDir, "asset-audit.json"), formatAssetAuditReport(report));
  console.log(`Asset audit: ${report.referencedCount}/${report.assetCount} referenced, ${report.unreferenced.length} unreferenced, ${report.duplicateGroups.length} duplicate groups.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runCli();
}
