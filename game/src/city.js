import * as THREE from 'three';
import {WORLD,PALETTE,DISTRICTS} from './config.js';
import {mulberry32} from './random.js';
export function districtAt(x,z){let nearest=DISTRICTS[0],best=Infinity;for(const d of DISTRICTS){const distance=(x-d.x)**2+(z-d.z)**2;if(distance<best){best=distance;nearest=d;}}return nearest.name;}
export function buildCity(scene,seed){
 const random=mulberry32(seed),buckets=new Map(),windowTransforms=[];
 scene.background=new THREE.Color(PALETTE.sky);scene.fog=new THREE.Fog(PALETTE.fog,110,WORLD.fog);
 const world=new THREE.Group();scene.add(world);
 const mats=new Map();
 function mat(color,glow=false){const key=`${color}:${glow}`;if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color,roughness:.8,emissive:glow?color:0,emissiveIntensity:glow?1.4:0}));return mats.get(key);}
 function shape(geometry,x,y,z,color,glow=false,rz=0,ry=0){const m=mat(color,glow);const key=m.uuid;if(!buckets.has(key))buckets.set(key,{material:m,geometries:[]});const transform=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry,rz)),new THREE.Vector3(1,1,1));geometry.applyMatrix4(transform);buckets.get(key).geometries.push(geometry);}
 function box(w,h,d,x,y,z,color=0xbeb5a3,glow=false){shape(new THREE.BoxGeometry(w,h,d),x,y,z,color,glow);}
 // Static geometry is batched by material to keep the procedural city inexpensive.
 const ground=new THREE.Mesh(new THREE.BoxGeometry(410,.4,520),mat(0xa88e7e));ground.position.y=-.35;ground.receiveShadow=true;scene.add(ground);
 box(250,.15,520,-174,-.05,0,PALETTE.ocean);box(21,.18,520,-39,.04,0,PALETTE.sand);
 for(let n=-168;n<=168;n+=42){box(9,.14,340,n,.03,0,PALETTE.asphalt);box(340,.14,9,0,.04,n,PALETTE.asphalt);for(let p=-160;p<168;p+=10)for(const delta of [-.14,.14]){box(.07,.025,5,n+delta,.125,p,delta<0?0xffce77:0xeee3cf);box(5,.025,.07,p,.13,n+delta,delta<0?0xffce77:0xeee3cf);}}
 function palm(x,z){const s=.75+random()*.35;shape(new THREE.CylinderGeometry(.22*s,.42*s,10*s,7),x,5*s,z,0x82644d,false,.09);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const geometry=new THREE.ConeGeometry(.8*s,5.8*s,4);geometry.rotateZ(1.12);geometry.rotateY(a);shape(geometry,x+Math.cos(a)*1.9*s,9.6*s,z+Math.sin(a)*1.9*s,0x376b58);}}
 for(let x=-42;x<=126;x+=42)for(let z=-126;z<=126;z+=42){palm(x-7,z-7);palm(x+7,z+7);}
 const colors=[0xc58d80,0xe2b697,0xbda5a1,0x8b9fa6,0xd0bc98,0x9b889a];
 for(let x=-21;x<155;x+=42)for(let z=-147;z<160;z+=42){if(x<-32||(Math.abs(x)<25&&z>-65&&z<110))continue;const w=16+random()*12,d=15+random()*12,h=(x<30?12:20)+random()*(x<30?27:48);box(w,h,d,x,h/2,z,colors[Math.floor(random()*6)]);if(h>30)box(w*.55,2,d*.5,x,h+1,z,0x716d73);for(let yy=4;yy<h-2;yy+=4)for(let xx=-w/2+2;xx<w/2-1;xx+=3){windowTransforms.push([x+xx,yy,z-d/2-.03,Math.PI]);windowTransforms.push([x+xx,yy,z+d/2+.03,0]);}for(let yy=4;yy<h-2;yy+=4)for(let zz=-d/2+2;zz<d/2-1;zz+=3)windowTransforms.push([x-w/2-.03,yy,z+zz,-Math.PI/2]);}
 for(const side of [-1,1])for(let i=0;i<8;i++){const x=side*19,z=-52+i*19,h=8+random()*4;box(16,h,14,x,h/2,z,colors[(i+side+1)%6]);box(.25,1.1,10,x-side*8.1,h-2,z,i%2?0xffb95e:0xee7899,true);for(let zz=-4;zz<=4;zz+=4)box(.12,3,2.5,x-side*8.2,2,z+zz,0x284e5a);}
 const windows=new THREE.InstancedMesh(new THREE.PlaneGeometry(1.2,1.9),mat(0xffdc97,true),windowTransforms.length),dummy=new THREE.Object3D();windowTransforms.forEach(([x,y,z,ry],i)=>{dummy.position.set(x,y,z);dummy.rotation.y=ry;dummy.updateMatrix();windows.setMatrixAt(i,dummy.matrix);});scene.add(windows);
 box(27,.35,28,-25,.25,-77,0x9a745c);for(let x=-38;x<-12;x+=1.6)box(.07,.02,28,x,.44,-77,0xd3a784);
 shape(new THREE.TorusGeometry(14,.23,6,64),4,18,-73,0xffcb84,true);for(let i=0;i<12;i++){const a=i*Math.PI/6;shape(new THREE.CylinderGeometry(.1,.1,14,5),4+Math.cos(a)*7,18+Math.sin(a)*7,-73,0xefe0bc,false,a-Math.PI/2);box(2,2.5,2,4+Math.cos(a)*14,18+Math.sin(a)*14,-73,[0xf28f98,0x6da5ad,0xffc55f][i%3]);}for(const x of [-3,11])box(.6,18,.7,x,9,-73,0xc9b4a1);
 const font={A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],G:['01111','10000','10000','10111','10001','10001','01110'],H:['10001','10001','10001','11111','10001','10001','10001'],I:['111','010','010','010','010','010','111'],L:['10000','10000','10000','10000','10000','10000','11111'],M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['10001','10001','10001','10001','10001','10001','01110'],W:['10001','10001','10001','10101','10101','11011','10001'],Y:['10001','10001','01010','00100','00100','00100','00100']};
 function text(word,x,y,z,scale,color){let cursor=x;for(const character of word.toUpperCase()){if(character===' '){cursor+=scale*3;continue;}const glyph=font[character]||font.I;glyph.forEach((row,j)=>[...row].forEach((pixel,k)=>{if(pixel==='1')box(scale*.8,scale*.8,scale*.2,cursor+k*scale,y-j*scale,z,color,true);}));cursor+=scale*(glyph[0].length+1);}}
 box(55,10,1,2,43,57,0x303443);text('LUMEN BAY',-22,46,56.35,.8,PALETTE.gold);
 box(25,4,.7,24,13,31,0x373344);text('FLAMINGO FM',12,14.3,30.6,.38,0xff669e);
 for(const district of DISTRICTS){box(.2,5,.2,district.x,2.5,district.z,0x5b6468);box(10,1.5,.25,district.x,5,district.z,0x276974);text(district.name,district.x-4.5,5.45,district.z+.15,.12,0xffdfac);}
 box(170,1,11,0,.2,105,PALETTE.asphalt);for(const x of [-42,42]){box(1.1,29,1.1,x,14.5,100,0xbeb5a3);for(let k=-35;k<=35;k+=7){const points=[new THREE.Vector3(x,29,100),new THREE.Vector3(x+k,1,100)];scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xe1c5ad})));}}
 for(const {material,geometries} of buckets.values()){
  const positions=[],normals=[],uvs=[];
  for(const original of geometries){const g=original.index?original.toNonIndexed():original;positions.push(g.attributes.position.array);normals.push(g.attributes.normal.array);uvs.push(g.attributes.uv.array);}
  function join(arrays){const result=new Float32Array(arrays.reduce((sum,a)=>sum+a.length,0));let offset=0;for(const a of arrays){result.set(a,offset);offset+=a.length;}return result;}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(join(positions),3));geometry.setAttribute('normal',new THREE.BufferAttribute(join(normals),3));geometry.setAttribute('uv',new THREE.BufferAttribute(join(uvs),2));geometry.computeBoundingSphere();const mesh=new THREE.Mesh(geometry,material);mesh.receiveShadow=true;mesh.castShadow=false;world.add(mesh);for(const geometry of geometries)geometry.dispose();
 }
 return {ground,districts:DISTRICTS};
}
