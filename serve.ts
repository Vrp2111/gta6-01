import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('./game/',import.meta.url));
const flag=process.argv.indexOf('--port'),port=flag>=0?Number(process.argv[flag+1]):8080;
const mime={html:'text/html',js:'text/javascript',mjs:'text/javascript',css:'text/css',json:'application/json',png:'image/png',jpg:'image/jpeg',webp:'image/webp',svg:'image/svg+xml',ico:'image/x-icon',woff2:'font/woff2',glb:'model/gltf-binary',gltf:'model/gltf+json',bin:'application/octet-stream',wasm:'application/wasm',wav:'audio/wav',mp3:'audio/mpeg',ogg:'audio/ogg',txt:'text/plain'};
createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(path!==root.slice(0,-1)&&!path.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403);res.end('Forbidden');return;}const body=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path).slice(1)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(404,{'Cache-Control':'no-store'});res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Lumen Bay: http://127.0.0.1:${port}`));
