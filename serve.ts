import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(fileURLToPath(new URL('./game',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.bin':'application/octet-stream','.wasm':'application/wasm','.wav':'audio/wav','.mp3':'audio/mpeg','.ogg':'audio/ogg','.txt':'text/plain; charset=utf-8'};
const arg=process.argv.indexOf('--port'),port=arg>=0?Number(process.argv[arg+1])||8080:8080;
createServer(async(req,res)=>{
  const rawPath=(req.url||'/').replace(/^\/{2,}/,'/');
  const pathname=decodeURIComponent(rawPath.split('?')[0]||'/');
  const file=resolve(root,`.${pathname==='/'?'/index.html':pathname}`);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403,{'Cache-Control':'no-store'});res.end('Forbidden');return;}
  try{const info=await stat(file);if(!info.isFile())throw new Error('not a file');const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file).toLowerCase()]||'application/octet-stream','Content-Length':body.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);}
  catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Lumen Bay serving ${root} at http://127.0.0.1:${port}/`));
