import * as THREE from 'three';
import { CARS } from './config.js';
import { makeVehicle } from './vehicles.js';
import { seededRandom } from './random.js';

export function createTraffic(scene,seed=96321,count=14) {
  const random=seededRandom(seed+91), cars=[], pedestrians=[], lights=[];
  const slots=[[-2.4,14],[2.4,29],[-2.4,43],[2.4,57],[-2.4,72],[2.4,-20],[-2.4,-37],[2.4,-58]];
  for(let i=0;i<count;i++) {
    const spec=CARS[1+Math.floor(random()*(CARS.length-1))], car=makeVehicle(scene,spec);
    const [x,z]=slots[i]??[(random()-.5)*9,Math.round((random()-.5)*260/20)*20];
    car.position.set(x,.03,z); car.rotation.y=(z<0?Math.PI:0); car.userData.speed=spec.speed*.24; car.userData.aiLane=x;
    cars.push(car);
  }
  const torsoMat=[0x42769a,0xc46750,0x3f8a77,0x8a638b,0xd3a548].map(color=>new THREE.MeshStandardMaterial({color,roughness:.9}));
  for(let i=0;i<18;i++) {
    const group=new THREE.Group(), x=i===0?-8.6:(i<8?(i%2?-10.2:10.2):(random()-.5)*55), z=i===0?5.2:(i<8?-58+i*16:(random()-.5)*230);
    const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.31,.85,3,6),torsoMat[i%torsoMat.length]); torso.position.y=1.15; group.add(torso);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.28,8,6),new THREE.MeshStandardMaterial({color:0xd5a77f})); head.position.y=1.9; group.add(head);
    const legMat=new THREE.MeshStandardMaterial({color:0x333b4c});
    for(const side of [-1,1]) { const leg=new THREE.Mesh(new THREE.CylinderGeometry(.09,.1,.65,6),legMat); leg.position.set(side*.14,.4,0); group.add(leg); }
    group.position.set(x,.1,z); group.userData={baseZ:z,phase:random()*6.28,walker:i<8}; group.traverse(o=>{if(o.isMesh)o.castShadow=true;}); scene.add(group); pedestrians.push(group);
  }
  const red=new THREE.MeshStandardMaterial({color:0x6e2624,emissive:0x7c1511,emissiveIntensity:.4}), green=new THREE.MeshStandardMaterial({color:0x245a42,emissive:0x21884d,emissiveIntensity:.3});
  for(const z of [-80,0,80]) for(const x of [-8,8]) {
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,5,6),new THREE.MeshStandardMaterial({color:0x41454a})); pole.position.set(x,2.5,z); scene.add(pole);
    const head=new THREE.Mesh(new THREE.BoxGeometry(.55,1.25,.52),new THREE.MeshStandardMaterial({color:0x252b31})); head.position.set(x,5,z); scene.add(head);
    const lamps=[]; for(let j=0;j<2;j++){const m=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),j?green:red);m.position.set(x,5.28-j*.55,z+.29);scene.add(m);lamps.push(m);}
    lights.push({lamps,phase:lights.length*.7});
  }
  return {cars,pedestrians,lights,seed};
}
export function updateTraffic(traffic,dt,time) {
  for(const light of traffic.lights) { const green=Math.sin(time*.32+light.phase)>-.35; light.lamps[0].material.emissiveIntensity=green?.08:1.5; light.lamps[1].material.emissiveIntensity=green?1.3:.08; }
  for(let i=0;i<traffic.cars.length;i++) {
    const car=traffic.cars[i], d=car.userData, dir=car.rotation.y===Math.PI?-1:1;
    const ahead=traffic.cars.some((other,j)=>i!==j&&Math.abs(other.position.x-car.position.x)<2&&dir*(other.position.z-car.position.z)>0&&dir*(other.position.z-car.position.z)<10);
    const redLight=Math.abs(car.position.z%80)<5&&Math.sin(time*.32+i)>.35;
    const target=ahead||redLight?0:d.spec.speed*.24;
    d.speed=THREE.MathUtils.lerp(d.speed,target,dt*(ahead?1.4:.35));
    car.position.z+=dir*d.speed*dt*.34;
    if(car.position.z>174)car.position.z=-174; if(car.position.z< -174)car.position.z=174;
  }
  for(const walker of traffic.pedestrians) {
    walker.position.z=walker.userData.baseZ+Math.sin(time*.7+walker.userData.phase)*.7;
    walker.rotation.y=Math.sin(time*.45+walker.userData.phase)*.3;
  }
}
