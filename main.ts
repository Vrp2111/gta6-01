import { buildDossier } from './vendor/makefun-game.ts';
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// Batch 2 repair: package the fully rewritten procedural coastal game.
const source=fileURLToPath(new URL('.',import.meta.url));
const output=resolve(process.env.MAKEFUN_OUTPUT_DIR||'/output');
await mkdir(output,{recursive:true});
await cp(resolve(source,'game'),resolve(output,'game'),{recursive:true});
await cp(resolve(source,'screenshots'),resolve(output,'screenshots'),{recursive:true});
const caps={text_max_bytes:163840,screenshots:{max:4,max_bytes:262144},game_max_files:993,game_max_bytes:48*1024*1024,game_path_max_bytes:1000};
const dossier=await buildDossier(output,caps);
await writeFile(resolve(output,'dossier.json'),dossier);
console.log('Lumen Bay dossier written to '+output);
