/**
 * Локальный статический сервер без зависимостей.
 *
 * Зачем: браузер не даёт загружать ES-модули через file://.
 *
 * Запуск:  node tools/serve.mjs
 * Порт:    8123 (или переменная окружения PORT)
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT) || 8123;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function isInsideRoot(filePath) {
  return filePath === root || filePath.startsWith(root + sep);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);
    const pathname = decodeURIComponent(url.pathname);

    let target = resolve(join(root, pathname));

    if (!isInsideRoot(target)) {
      response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('403: выход за пределы проекта');
      return;
    }

    const info = await stat(target);
    if (info.isDirectory()) {
      target = join(target, 'index.html');
    }

    const body = await readFile(target);
    const type = MIME[extname(target).toLowerCase()] ?? 'application/octet-stream';

    response.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-cache',
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('404: файл не найден');
  }
});

server.listen(port, () => {
  console.log(`Antaria dev server: http://localhost:${port}`);
  console.log(`Root: ${root}`);
});
