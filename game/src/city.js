// Procedural low-poly Lumen Bay: shoreline, street grid, districts and landmarks.
import * as THREE from 'three';
import { DISTRICTS, PALETTE, WORLD } from './config.js';
import { random } from './random.js';

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.86, ...extra });
const box = (parent, size, material, position, cast = false) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position); mesh.castShadow = cast; mesh.receiveShadow = true; parent.add(mesh); return mesh;
};

function createPalm(scene, x, z, scale = 1) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.22 * scale, .42 * scale, 5 * scale, 6), mat(0x886047));
  trunk.position.set(x, 2.45 * scale, z); trunk.rotation.z = .08; trunk.castShadow = true; scene.add(trunk);
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(.48 * scale, 4.6 * scale, 5), mat(i % 2 ? 0x3e8067 : 0x579070));
    leaf.position.set(x + Math.cos(i * Math.PI / 3.5) * 1.55 * scale, 4.8 * scale, z + Math.sin(i * Math.PI / 3.5) * 1.55 * scale);
    leaf.rotation.z = Math.cos(i * Math.PI / 3.5) * 1.05; leaf.rotation.x = Math.sin(i * Math.PI / 3.5) * .42; leaf.castShadow = true; scene.add(leaf);
  }
}

const FONT = {
  L:['10001','10001','10001','10001','10001','10001','11111'], U:['10001','10001','10001','10001','10001','10001','01110'], M:['10001','11011','10101','10101','10001','10001','10001'], E:['11111','10000','10000','11110','10000','10000','11111'], N:['10001','11001','10101','10011','10001','10001','10001'], B:['11110','10001','10001','11110','10001','10001','11110'], A:['01110','10001','10001','11111','10001','10001','10001'], Y:['10001','10001','01010','00100','00100','00100','00100'], F:['11111','10000','10000','11110','10000','10000','10000'], I:['11111','00100','00100','00100','00100','00100','11111'], G:['01111','10000','10000','10111','10001','10001','01111'], O:['01110','10001','10001','10001','10001','10001','01110'], R:['11110','10001','10001','11110','10100','10010','10001'], ' ':['00000','00000','00000','00000','00000','00000','00000'], '9':['01110','10001','10001','01111','00001','00010','11100'], '6':['00110','01000','10000','11110','10001','10001','01110'], '.':['00000','00000','00000','00000','00000','00110','00110']
};

function add3DSign(scene, text, x, y, z, color, unit = .36) {
  const group = new THREE.Group(); group.position.set(x, y, z);
  const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.1, metalness: .1, roughness: .35 });
  const unitGeo = new THREE.BoxGeometry(unit * .74, unit * .74, .16);
  let cursor = 0;
  for (const char of text) {
    const glyph = FONT[char] || FONT[' '];
    for (let row = 0; row < glyph.length; row++) for (let col = 0; col < glyph[row].length; col++) if (glyph[row][col] === '1') {
      const pixel = new THREE.Mesh(unitGeo, material);
      pixel.position.set(cursor + col * unit, (6 - row) * unit, 0); group.add(pixel);
    }
    cursor += unit * 6;
  }
  group.position.x -= cursor * .5; scene.add(group); return group;
}

function building(scene, rng, x, z, width, depth, height, index) {
  const hues = [0xb57f72, 0x9e7770, 0x8e8e9b, 0x7f8f91, 0xc09c77, 0x79768b];
  const body = mat(hues[index % hues.length], { flatShading: true });
  box(scene, [width, height, depth], body, [x, height / 2, z], true);
  const floors = Math.max(2, Math.floor(height / 3.2));
  const windowMat = new THREE.MeshStandardMaterial({ color: 0xffd294, emissive: 0xffa74f, emissiveIntensity: .68, roughness: .4 });
  const windows = new THREE.InstancedMesh(new THREE.BoxGeometry(.72,.9,.08),windowMat,Math.max(1,floors*40));
  const transform = new THREE.Object3D(); let windowCount=0;
  for (let level = 0; level < floors; level++) {
    const y = 1.3 + level * (height - 1.6) / floors;
    for (let side = -1; side <= 1; side += 2) for (let j = 0; j < Math.floor(width / 2.6); j++) {
      if (rng() > .82) continue;
      const w = .72, h = .9, wx = x + (j - Math.floor(width / 5.2)) * 2.5;
      transform.position.set(wx,y,z + side*(depth/2+.045)); transform.updateMatrix(); windows.setMatrixAt(windowCount++,transform.matrix);
    }
    for (let side = -1; side <= 1; side += 2) for (let j = 0; j < Math.floor(depth / 3.4); j++) {
      if (rng() > .86) continue;
      const w = .68, h = .86, wz = z + (j - Math.floor(depth / 6.8)) * 3.2;
      transform.position.set(x+side*(width/2+.045),y,wz); transform.rotation.y=Math.PI/2; transform.updateMatrix(); windows.setMatrixAt(windowCount++,transform.matrix); transform.rotation.y=0;
    }
  }
  windows.count=windowCount; windows.instanceMatrix.needsUpdate=true; scene.add(windows);
  if (height > 30) {
    const roof = box(scene, [width * .42, 2.2, depth * .44], mat(0x594e5b), [x, height + 1.1, z]);
    roof.rotation.y = rng() * .5;
  }
}

function addFerrisWheel(scene) {
  const center = new THREE.Vector3(4, 18, -73), gold = new THREE.MeshStandardMaterial({ color: 0xf2c26e, emissive: 0xb97345, emissiveIntensity: .45, metalness: .55, roughness: .4 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(14, .38, 7, 48), gold); ring.position.copy(center); scene.add(ring);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 1, 10), mat(0xf0d5ae)); hub.position.copy(center); hub.rotation.x = Math.PI / 2; scene.add(hub);
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(.22, 28, .22), gold);
    spoke.position.copy(center); spoke.rotation.z = angle; scene.add(spoke);
    const pod = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.5, 1.5), mat([0xf09b76,0x79aeb1,0xe7d180][i % 3]));
    pod.position.set(center.x + Math.sin(angle) * 14, center.y - Math.cos(angle) * 14, center.z); scene.add(pod);
  }
  for (const x of [-8, 16]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.42, .62, 22, 6), gold); leg.position.set(x, 9, -73); leg.rotation.z = x < 0 ? -.3 : .3; scene.add(leg);
  }
}

export function buildCity(scene, seed = WORLD.seed) {
  const rng = random(seed); const ground = mat(0xb69078); const road = mat(PALETTE.asphalt); const line = new THREE.MeshStandardMaterial({ color: 0xf4c465, emissive: 0x66421e, emissiveIntensity: .22 });
  scene.background = new THREE.Color(PALETTE.sky); scene.fog = new THREE.Fog(PALETTE.fog, 110, WORLD.fog);
  box(scene, [410, 1, 520], ground, [52, -.7, 0]);
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(260, 520), new THREE.MeshStandardMaterial({ color: PALETTE.ocean, roughness: .38, metalness: .12 }));
  ocean.rotation.x = -Math.PI / 2; ocean.position.set(-174, -.48, 0); scene.add(ocean);
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(27, 480), mat(PALETTE.sand)); sand.rotation.x = -Math.PI / 2; sand.position.set(-39, -.1, 0); scene.add(sand);
  for (let p = -168; p <= 168; p += WORLD.block) {
    box(scene, [9, .18, 360], road, [p, -.06, 0]); box(scene, [360, .18, 9], road, [0, -.055, p]);
    box(scene, [.16, .04, 360], line, [p + 3.2, .05, 0]); box(scene, [.16, .04, 360], line, [p - 3.2, .05, 0]);
    box(scene, [360, .04, .16], line, [0, .05, p + 3.2]); box(scene, [360, .04, .16], line, [0, .05, p - 3.2]);
    if (p % 84 === 0) for (let d = -168; d <= 168; d += 84) {
      for (const side of [-1, 1]) createPalm(scene, p + side * 7.2, d + 7, .75 + rng() * .35);
    }
  }
  let id = 0;
  for (let x = -146; x <= 146; x += WORLD.block) for (let z = -146; z <= 146; z += WORLD.block) {
    if (Math.round((x + 146) / 42) % 2 || Math.round((z + 146) / 42) % 2) continue;
    if (x < -32 || (x > -18 && x < 20 && z < -50)) continue;
    const width = 16 + rng() * 12, depth = 15 + rng() * 12;
    const coastal = x < 5 || z < -72; const height = coastal ? 12 + rng() * 27 : 20 + rng() * 48;
    building(scene, rng, x + (rng() - .5) * 4, z + (rng() - .5) * 4, width, depth, height, id++);
  }
  // Boardwalk, skyline sign, radio sign, bridge pylons and road deck.
  box(scene, [18, .5, 92], mat(0x9a7058), [-25, .12, -77]);
  addFerrisWheel(scene);
  box(scene, [58, 13, 2.2], mat(0x493f53), [10, 44, 45], true);
  add3DSign(scene, 'LUMEN BAY', -2, 42, 43.7, 0xffd277, .45);
  box(scene, [29, 9, 1.6], mat(0x37434a), [43, 18, -48], true);
  add3DSign(scene, 'FLAMINGO FM', 44, 15, -49, 0xff7eb0, .32);
  for (const x of [-27, 35]) {
    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(.6, 1.1, 43, 6), mat(0xd9bb91)); pylon.position.set(x, 21, 105); scene.add(pylon);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, 49, 5), mat(0xe2ccaa)); cable.position.set(4, 39, 105); cable.rotation.z = Math.PI / 2; scene.add(cable);
  }
  box(scene, [112, 1.3, 16], road, [4, 1.4, 106]);
  for (const d of DISTRICTS) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(.3, 4.8, .3), mat(0xf1c75f)); post.position.set(d.x, 2.2, d.z); scene.add(post);
    box(scene, [9, 1.5, .32], mat(0xf3d5a0), [d.x + 4.2, 3.4, d.z]);
  }
  return { ground, districts: DISTRICTS };
}

export function districtAt(x, z) {
  let best = DISTRICTS[0], distance = Infinity;
  for (const district of DISTRICTS) { const d = (x - district.x) ** 2 + (z - district.z) ** 2; if (d < distance) { distance = d; best = district; } }
  return best.name;
}
