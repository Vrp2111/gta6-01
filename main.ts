import { buildDossier } from './vendor/makefun-game.ts';
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(fileURLToPath(import.meta.url));
// Fix round: retain the full visible-world game and the real-distance Afterglow route in the dossier.
const output=resolve(process.env.MAKEFUN_OUTPUT_DIR||'/output');
await mkdir(output,{recursive:true});
await cp(resolve(root,'game'),resolve(output,'game'),{recursive:true,force:true});
await cp(resolve(root,'screenshots'),resolve(output,'screenshots'),{recursive:true,force:true});
const limits={text_max_bytes:163840,max_screenshots:4,screenshot_max_bytes:262144,game_max_files:993,game_max_bytes:48*1024*1024,path_max_bytes:1000};
const dossier=await buildDossier(output,limits);
await writeFile(resolve(output,'dossier.json'),dossier);
