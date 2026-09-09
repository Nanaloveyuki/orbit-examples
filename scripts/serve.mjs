import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../vibecraft/desktop/assets/', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(resolve(root) + sep)) { res.writeHead(403).end(); return; }
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'text/plain' }).end(content);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Resource unavailable');
  }
});
const port = Number(process.env.PORT ?? 4173);
server.on('error', error => {
  if (error.code === 'EADDRINUSE' && !process.env.PORT) server.listen(0, '127.0.0.1');
  else { console.error(error); process.exitCode = 1; }
});
server.listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${server.address().port}`));
