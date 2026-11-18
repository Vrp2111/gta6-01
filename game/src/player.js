// Walking avatar and simple enter/exit vehicle interaction.
import * as THREE from 'three';

export function createPlayer(scene) {
  const group = new THREE.Group();
  const jacket = new THREE.MeshStandardMaterial({ color: 0x27384b, roughness: .82 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xbc8064, roughness: .9 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.4, .86, 4, 7), jacket); body.position.y = 1.05; body.castShadow = true; group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.31, 9, 7), skin); head.position.y = 1.88; head.castShadow = true; group.add(head);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x202935 });
  for (const x of [-.19,.19]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.7,6), legMat); leg.position.set(x,.35,.02); group.add(leg); }
  scene.add(group); return { group, inCar:true, position:group.position, money:38420, health:100, armour:75 };
}

export function updateWalking(player, input, dt, car) {
  if (input.take('enter')) {
    if (player.inCar) { player.inCar = false; player.group.position.copy(car.position).add(new THREE.Vector3(2.7,0,0)); player.group.rotation.y = car.rotation.y; }
    else if (player.group.position.distanceTo(car.position) < 5) player.inCar = true;
  }
  if (player.inCar) { player.group.visible = false; return; }
  player.group.visible = true;
  const move = new THREE.Vector3((input.isDown('right')?1:0)-(input.isDown('left')?1:0),0,(input.isDown('reverse')?1:0)-(input.isDown('forward')?1:0));
  if (move.lengthSq()) { move.normalize().multiplyScalar(dt * (input.isDown('nitro')?9:5)); player.group.position.add(move); player.group.rotation.y = Math.atan2(move.x,move.z); }
  player.group.position.x = THREE.MathUtils.clamp(player.group.position.x,-164,164); player.group.position.z = THREE.MathUtils.clamp(player.group.position.z,-164,164);
  if (input.take('interact') && player.group.position.distanceTo(car.position) < 9) player.inCar = true;
}
