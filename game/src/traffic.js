// Light traffic and walkers give the streets a lived-in scale.
import * as THREE from 'three';
import { CARS } from './config.js';
import { makeVehicle } from './vehicles.js';
import { random } from './random.js';

export function createTraffic(scene, seed = 96321, count = 9) {
  const rng = random(seed ^ 0x4a12); const cars = [], walkers = [], signals=[];
  const redMat=new THREE.MeshStandardMaterial({color:0xf45b55,emissive:0xd42f2a,emissiveIntensity:1.4});
  const greenMat=new THREE.MeshStandardMaterial({color:0x5ee09b,emissive:0x28c875,emissiveIntensity:1.2});
  for(const [x,z] of [[0,-42],[-42,0],[42,42],[84,0]]){
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,5,6),new THREE.MeshStandardMaterial({color:0x343a3d})); pole.position.set(x+4.8,2.5,z+4.8); scene.add(pole);
    const head=new THREE.Mesh(new THREE.BoxGeometry(.65,1.65,.55),new THREE.MeshStandardMaterial({color:0x252c30})); head.position.set(x+4.8,5.2,z+4.8); scene.add(head);
    const red=new THREE.Mesh(new THREE.SphereGeometry(.19,8,6),redMat.clone()), green=new THREE.Mesh(new THREE.SphereGeometry(.19,8,6),greenMat.clone());
    red.position.set(x+4.8,5.65,z+5.1); green.position.set(x+4.8,4.75,z+5.1); scene.add(red,green); signals.push({red,green,offset:rng()*12});
  }
  for (let i = 0; i < count; i++) {
    const spec = CARS[1 + (i % (CARS.length - 1))]; const car = makeVehicle(scene, spec);
    const lane = (i % 2 ? 1 : -1) * 3.7, axis = i % 2 ? 'x' : 'z';
    const road = Math.round((rng() * 8 - 4) * 42);
    if (axis === 'x') { car.position.set(-152 + rng() * 304, 0, road + lane); car.rotation.y = Math.PI / 2; }
    else { car.position.set(road + lane, 0, -152 + rng() * 304); car.rotation.y = 0; }
    car.userData.lane = lane; car.userData.trafficSpeed = 7 + rng() * 6; car.userData.signalOffset = rng()*12; car.userData.axis = axis; cars.push(car);
  }
  const colors = [0xe8a589, 0x526c89, 0xe7d9bf, 0x698c7a];
  for (let i = 0; i < 10; i++) {
    const person = new THREE.Group(); const shirt = new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: .8 });
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.38, .72, 3, 6), shirt); torso.position.y = 1.12; torso.castShadow = true; person.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.28, 8, 6), new THREE.MeshStandardMaterial({ color: 0xb87959 })); head.position.y = 1.86; person.add(head);
    person.position.set(-30 + rng() * 18, 0, -104 + rng() * 190); person.userData.phase = rng() * 6; scene.add(person); walkers.push(person);
  }
  return { cars, walkers, signals };
}

export function updateTraffic(traffic, dt, time) {
  for(const signal of traffic.signals){const stopped=(time+signal.offset)%12>7;signal.red.material.emissiveIntensity=stopped?2.1:.18;signal.green.material.emissiveIntensity=stopped?.18:1.7;}
  for (const car of traffic.cars) {
    const axis=car.userData.axis, coordinate=axis==='x'?'x':'z', cross=axis==='x'?'z':'x';
    let pace=car.userData.trafficSpeed;
    for(const other of traffic.cars){if(other===car||other.userData.axis!==axis||Math.abs(other.position[cross]-car.position[cross])>2.8)continue;const gap=other.position[coordinate]-car.position[coordinate];if(gap>0&&gap<9)pace=Math.min(pace,Math.max(0,gap-3)*1.2);}
    const intersection=Math.ceil((car.position[coordinate]+.01)/42)*42, distance=intersection-car.position[coordinate];
    const signalPhase=(time+car.userData.signalOffset)%12; if(distance>0&&distance<8&&signalPhase>7)pace=Math.min(pace,Math.max(0,distance-2)*1.8);
    car.position[coordinate]+=pace*dt;
    const key = car.userData.axis === 'x' ? 'x' : 'z'; if (car.position[key] > 158) car.position[key] = -158;
  }
  for (const person of traffic.walkers) { person.position.z += Math.sin(time * 1.1 + person.userData.phase) * dt * .7; person.position.x += Math.cos(time + person.userData.phase) * dt * .35; }
}
