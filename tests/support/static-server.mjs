import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, normalize, resolve, sep } from "node:path";

const root = resolve(process.cwd());
const portIndex = process.argv.indexOf("--port");
const port = Number(process.argv[portIndex + 1] ?? 4180);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function getFilePath(urlPath) {
  const requestedPath = decodeURIComponent(urlPath === "/" ? "/index.html" : urlPath);
  const filePath = resolve(root, `.${normalize(requestedPath)}`);
  return filePath === root || filePath.startsWith(`${root}${sep}`) ? filePath : null;
}

const server = createServer(async (request, response) => {
  if (!request.url || !["GET", "HEAD"].includes(request.method ?? "")) {
    response.writeHead(405).end();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host ?? "127.0.0.1"}`);
  const filePath = getFilePath(url.pathname);

  try {
    if (!filePath || !(await stat(filePath)).isFile()) {
      response.writeHead(404).end();
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": mimeTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream",
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 500).unref();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

server.listen(port, "127.0.0.1");
