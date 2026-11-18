// Player car construction and arcade handling for the SOLSTICE GT.
import * as THREE from 'three';
import { CARS } from './config.js';

const paint = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .36, metalness: .28, ...extra });
export function makeVehicle(scene, spec = CARS[0], police = false) {
  const group = new THREE.Group(); group.userData.spec = spec; group.userData.speed = 0; group.userData.condition = 100; group.userData.police = police;
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, .72, 4.35), paint(police ? 0xd9e0dc : spec.color));
  body.position.y = .73; body.castShadow = true; body.receiveShadow = true; group.add(body);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(2.08, .22, 1.25), paint(police ? 0x243849 : spec.color)); hood.position.set(0, 1.12, 1.28); group.add(hood);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.68, .82, 1.85), paint(0x293843, { transparent: true, opacity: .9 })); cabin.position.set(0, 1.3, -.15); cabin.castShadow = true; group.add(cabin);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.55, .13, 1.4), paint(police ? 0xe8e6d8 : 0xe87a4e)); roof.position.set(0, 1.75, -.18); group.add(roof);
  const wheelMat = paint(0x24272b), wheels = [];
  for (const x of [-1.05, 1.05]) for (const z of [-1.35, 1.4]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.43, .43, .26, 12), wheelMat); wheel.rotation.z = Math.PI / 2; wheel.position.set(x, .44, z); wheel.castShadow = true; group.add(wheel); wheels.push(wheel);
  }
  const lamp = new THREE.MeshStandardMaterial({ color: 0xfff0c3, emissive: 0xffd587, emissiveIntensity: 2.3 });
  for (const x of [-.72, .72]) { const light = new THREE.Mesh(new THREE.BoxGeometry(.42, .2, .08), lamp); light.position.set(x, .91, 2.2); group.add(light); }
  const red = new THREE.MeshStandardMaterial({ color: 0xe95747, emissive: 0xe42d29, emissiveIntensity: 1.2 });
  for (const x of [-.76, .76]) { const light = new THREE.Mesh(new THREE.BoxGeometry(.4, .18, .08), red); light.position.set(x, .9, -2.2); group.add(light); }
  if (police) {
    for (const x of [-.48, .48]) {
      const siren = new THREE.Mesh(new THREE.BoxGeometry(.48, .24, .42), new THREE.MeshStandardMaterial({ color: x < 0 ? 0x32a9ff : 0xf84c55, emissive: x < 0 ? 0x157bff : 0xff1e30, emissiveIntensity: 2.8 }));
      siren.position.set(x, 1.92, -.1); group.add(siren);
    }
  }
  group.userData.wheels = wheels; scene.add(group); return group;
}

export function driveVehicle(car, input, dt, onCrash = () => {}) {
  const data = car.userData; const forward = input.forward ? 1 : 0, reverse = input.reverse ? 1 : 0;
  const acceleration = forward * 30 - reverse * 24 - (input.brake ? 34 : 0);
  data.speed = THREE.MathUtils.clamp(data.speed + acceleration * dt, -11, 61);
  if (!forward && !reverse) data.speed *= Math.max(0, 1 - dt * 1.2);
  const turn = (input.left ? 1 : 0) - (input.right ? 1 : 0);
  car.rotation.y += turn * dt * THREE.MathUtils.clamp(Math.abs(data.speed) / 13, .15, 1.25) * Math.sign(data.speed || 1);
  if (input.nitro && forward) data.speed = Math.min(72, data.speed + dt * 16);
  if (input.handbrake && Math.abs(data.speed) > 10) { data.speed *= .992; car.rotation.y += turn * dt * .6; }
  const direction = new THREE.Vector3(Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y));
  car.position.addScaledVector(direction, data.speed * dt);
  car.position.x = THREE.MathUtils.clamp(car.position.x, -164, 164); car.position.z = THREE.MathUtils.clamp(car.position.z, -164, 164);
  for (const wheel of data.wheels || []) wheel.rotation.x += data.speed * dt * 1.3;
  if (Math.abs(data.speed) > 48 && input.colliding) { data.condition = Math.max(25, data.condition - dt * 8); data.speed *= .8; onCrash(); }
  return data;
}
