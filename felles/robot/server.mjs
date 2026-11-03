// Liten statisk server for bildeverkstedet (bare localhost).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const TYPER = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.glb': 'model/gltf-binary', '.json': 'application/json' };
export function startServer(rot, port = 0) {
  const srv = http.createServer((req, res) => {
    const p = path.join(rot, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(rot) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPER[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise(r => srv.listen(port, '127.0.0.1', () => r(srv)));
}
