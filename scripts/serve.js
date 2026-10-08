// Minimal static server: browsers refuse to load ES modules from file:// URLs.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DEFAULT_PORT = 8080;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function resolveRequestPath(url) {
  const { pathname } = new URL(url, 'http://localhost');
  const relativePath = pathname === '/' ? 'index.html' : decodeURIComponent(pathname);
  const filePath = resolve(join(ROOT, relativePath));
  return filePath.startsWith(ROOT + sep) ? filePath : null;
}

const server = createServer(async (request, response) => {
  const filePath = resolveRequestPath(request.url);
  const contentType = filePath && CONTENT_TYPES[extname(filePath)];
  if (!contentType) {
    response.writeHead(404).end('Not found');
    return;
  }
  try {
    const body = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': contentType }).end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Serving on http://localhost:${PORT}`);
});
