import * as THREE from 'three';
import { SUNSET, DISTRICTS, WORLD } from './config.js';
import { seededRandom } from './random.js';

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.83, ...extra });
function box(parent, x,y,z, sx,sy,sz, material, cast = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), material); m.position.set(x,y,z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
}
function palm(parent,x,z,scale=1) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.24*scale,.38*scale,5*scale,7),mat(0x80543d));
  trunk.position.set(x,2.5*scale,z); trunk.rotation.z=.08; trunk.castShadow=true; parent.add(trunk);
  for(let i=0;i<7;i++) { const leaf=new THREE.Mesh(new THREE.ConeGeometry(.7*scale,5*scale,5),mat(i%2?0x316b56:0x3f8060)); leaf.position.set(x+Math.cos(i*6.28/7)*1.5*scale,5*scale,z+Math.sin(i*6.28/7)*1.5*scale); leaf.rotation.z=Math.cos(i*6.28/7)*.85; leaf.rotation.x=Math.sin(i*6.28/7)*.65; leaf.castShadow=true; parent.add(leaf); }
}
function sign(parent,x,y,z,text,color=0xffd578) {
  const width=Math.max(7,text.length*.43+.6);
  const board=box(parent,x,y,z,width,1.05,.2,mat(0x193240,{emissive:0x10212a})); board.userData.label=text;
  const glyph={A:['010','101','111','101','101'],B:['110','101','110','101','110'],C:['011','100','100','100','011'],D:['110','101','101','101','110'],E:['111','100','110','100','111'],F:['111','100','110','100','100'],G:['011','100','101','101','011'],H:['101','101','111','101','101'],I:['111','010','010','010','111'],J:['001','001','001','101','010'],K:['101','101','110','101','101'],L:['100','100','100','100','111'],M:['101','111','111','101','101'],N:['101','111','111','111','101'],O:['010','101','101','101','010'],P:['110','101','110','100','100'],Q:['010','101','101','111','011'],R:['110','101','110','101','101'],S:['011','100','010','001','110'],T:['111','010','010','010','010'],U:['101','101','101','101','111'],V:['101','101','101','101','010'],W:['101','101','111','111','101'],X:['101','101','010','101','101'],Y:['101','101','010','010','010'],Z:['111','001','010','100','111'],'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['110','001','010','100','111'],'3':['110','001','010','001','110'],'4':['101','101','111','001','001'],'5':['111','100','110','001','110'],'6':['011','100','110','101','010'],'7':['111','001','010','010','010'],'8':['010','101','010','101','010'],'9':['010','101','011','001','110'],'-':['000','000','111','000','000']};
  const scale=.105, advance=.43, total=text.length*advance-.08, left=x-total/2;
  for(let ci=0;ci<text.length;ci++) { const rows=glyph[text[ci]]||['000','000','000','000','000']; for(let row=0;row<5;row++) for(let col=0;col<3;col++) if(rows[row][col]==='1') box(parent,left+ci*advance+col*scale,y+.21-row*scale,z+.14,scale*.76,scale*.76,.12,mat(color,{emissive:color,emissiveIntensity:.8}),false); }
}
export function buildCity(scene, seed=96321) {
  const random=seededRandom(seed), groundMat=mat(0x887b70), roadMat=mat(SUNSET.road), sandMat=mat(SUNSET.sand), sidewalk=mat(0xc5a990);
  scene.background=new THREE.Color(SUNSET.sky); scene.fog=new THREE.Fog(SUNSET.fog,115,330);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(WORLD.size,WORLD.size),groundMat); ground.rotation.x=-Math.PI/2; ground.position.y=-.14; ground.receiveShadow=true; scene.add(ground);
  const ocean=box(scene,-142,-.04,0,76,.12,350,mat(SUNSET.ocean,{roughness:.3,metalness:.05}),false);
  box(scene,-96,-.02,0,13,.08,350,sandMat,false);
  // Ocean Drive and a legible street grid.
  box(scene,0,.01,0,12,.08,350,roadMat,false);
  box(scene,-8,.02,0,2,.12,350,sidewalk,false); box(scene,8,.02,0,2,.12,350,sidewalk,false);
  for(let z=-160;z<=160;z+=40) {
    box(scene,0,.015,z,300,.08,10,roadMat,false);
    for(let x=-5.1;x<=5.1;x+=10.2) box(scene,x,.07,z, .12,.03,7,mat(0xf6d879),false);
    for(const side of [-1,1]) { box(scene,side*8,.08,z,2,.15,10,sidewalk,false); }
  }
  // Crosswalks and dashed lane marks.
  for(let z=-150;z<=150;z+=12) box(scene,0,.075,z, .16,.025,3,mat(0xffe8c4),false);
  const buildingMats=[0xc88f79,0xd8b18e,0x82a8a5,0xe4c58c,0x9c849d,0xd28b83].map(c=>mat(c));
  const windowMat=new THREE.MeshStandardMaterial({color:0xffd77e,emissive:0xffa72f,emissiveIntensity:.62,roughness:.4});
  let buildings=0;
  for(let z=-150;z<=150;z+=20) for(const side of [-1,1]) {
    const x=side*(18+random()*8), w=8+random()*8, d=10+random()*6, h=7+random()*22;
    box(scene,x,h/2,z,w,h,d,buildingMats[Math.floor(random()*buildingMats.length)]); buildings++;
    if(h>20) box(scene,x,h+.2,z,w*.8,.55,d*.8,mat(0x4d5961));
    for(let fy=2.4;fy<h-1;fy+=3.1) for(let fx=-w*.34;fx<w*.34;fx+=2.4) {
      const win=new THREE.Mesh(new THREE.PlaneGeometry(1.15,1.35),windowMat); win.position.set(x+fx,fy,z+side*(d/2+.055)); if(side<0) win.rotation.y=Math.PI; scene.add(win);
    }
    if(Math.abs(z)<52 && side===1) sign(scene,x,h*.68,z+side*(d/2+.2),['PIER 9','MIRA CAFE','TIDE SHOP'][Math.floor(random()*3)],0xffd27a);
  }
  // Busy Marina Strip foreground: awnings, boardwalk, named shops, palms.
  for(let z=-66;z<=76;z+=18) {
    for(const side of [-1,1]) {
      const x=side*(12.7+random()*1.4), awning=box(scene,x,2.2,z,4,.34,7,mat([0xe7a285,0x64aaa4,0xe9cf9e][Math.floor(random()*3)]));
      box(scene,x,1.1,z,4,2,6,buildingMats[Math.floor(random()*buildingMats.length)]);
      if(Math.abs(z)<55) sign(scene,x,3.5,z,side<0?'BOARDWALK':'MARINA',0xffd27a);
    }
    if(z%36===0) { palm(scene,-11.8,z); palm(scene,11.8,z+9,.9); }
  }
  box(scene,-80,.02,0,28,.08,330,mat(0x9a765e),false); // boardwalk strip
  for(let x=-93;x<=-67;x+=3) box(scene,x,.1,0,.12,.1,330,mat(0xc29a70),false);
  // Ferris wheel landmark near the water.
  const wheel=new THREE.Group(); wheel.position.set(-60,10,-14); scene.add(wheel);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(9,.22,8,48),mat(0xe9b56c,{emissive:0x62421c,emissiveIntensity:.5})); wheel.add(rim);
  const spokeMat=mat(0xe8c989); for(let i=0;i<12;i++){const a=i*Math.PI/6; const s=box(wheel,Math.cos(a)*4.5,Math.sin(a)*4.5,0,.12,9,.12,spokeMat);s.rotation.z=-a; const cabin=box(wheel,Math.cos(a)*9,-Math.sin(a)*9,.2,1.2,.7,1.2,mat([0xf47770,0x62c1b6,0xf2c668,0x8589cf][i%4])); }
  box(scene,-60,3,-14,.7,7,1,mat(0x69594e)); box(scene,-55,3,-14,.7,7,1,mat(0x69594e));
  sign(scene,-60,23,-14,'LUMEN BAY',0xffd27a); sign(scene,32,12,34,'FLAMINGO FM',0xff71bf);
  // Causeway bridge piers and cables at the south end.
  for(let z=105;z<=165;z+=20) for(const x of [-9,9]) box(scene,x,3,z,.55,6,.55,mat(0xe3d4bb));
  for(const x of [-9,9]) { const cable=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,62,5),mat(0xf6ca82)); cable.position.set(x,6,135); scene.add(cable); }
  DISTRICTS.forEach((district,i)=>{ const marker=box(scene,district.x,2,district.z,1.2,4,1.2,mat(0x425e66)); sign(scene,district.x,4.5,district.z,`DISTRICT 0${i+1}`,0xffd27a); });
  // Decorative streetlamps, benches and planted edges add visible scale.
  for(let z=-145;z<=150;z+=17) for(const side of [-1,1]) {
    const x=side*10.6; const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,4,6),mat(0x464a55)); pole.position.set(x,2,z); scene.add(pole);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.22,8,6),new THREE.MeshBasicMaterial({color:0xffd689})); lamp.position.set(x,4,z); scene.add(lamp);
    if(z%34===0) box(scene,side*10.2,.45,z+3,2.8,.45,.55,mat(0x795f4c));
  }
  return { ground, districts:DISTRICTS, buildings, seed, ocean };
}
export function districtAt(x,z) {
  let closest=DISTRICTS[0], best=Infinity;
  for(const d of DISTRICTS) { const score=(d.x-x)**2+(d.z-z)**2; if(score<best){best=score;closest=d;} }
  return closest.name;
}
