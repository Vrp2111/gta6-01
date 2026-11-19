import * as THREE from 'three';
import { CARS, WORLD } from './config.js';

const paint = (color, extra={}) => new THREE.MeshStandardMaterial({ color, roughness:.42, metalness:.2, ...extra });
function shape(parent, geometry, material, position, rotation=null) {
  const mesh=new THREE.Mesh(geometry,material); mesh.position.set(...position); if(rotation) mesh.rotation.set(...rotation); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
export function makeVehicle(scene, spec=CARS[0], police=false) {
  const group=new THREE.Group(); group.name=police?`LBPD ${spec.name}`:spec.name;
  const color=police?0xf0eee5:spec.color;
  const body=paint(color), dark=paint(police?0x192631:0x172a38,{metalness:.55,roughness:.18}), trim=paint(0x333943), rubber=paint(0x17191d), chrome=paint(0xb5bcc1,{metalness:.7,roughness:.25});
  shape(group,new THREE.BoxGeometry(4.2,.86,7.1),body,[0,.78,0]);
  shape(group,new THREE.BoxGeometry(3.65,.46,2.4),body,[0,1.24,2.08]);
  shape(group,new THREE.BoxGeometry(3.15,1.18,3.05),dark,[0,1.48,-.2]);
  shape(group,new THREE.BoxGeometry(3.25,.16,3.12),police?paint(0xe9e8dc):body,[0,2.08,-.2]);
  shape(group,new THREE.BoxGeometry(3.8,.22,1.08),trim,[0,.45,3.44]);
  shape(group,new THREE.BoxGeometry(3.8,.18,.7),chrome,[0,.53,-3.48]);
  const wheelMat=rubber, wheels=[];
  for(const x of [-1.82,1.82]) for(const z of [-2.25,2.25]) {
    const wheel=shape(group,new THREE.CylinderGeometry(.58,.58,.34,12),wheelMat,[x,.57,z],[0,0,Math.PI/2]);
    const hub=shape(group,new THREE.CylinderGeometry(.22,.22,.36,10),chrome,[x,.57,z],[0,0,Math.PI/2]); wheels.push({wheel,hub});
  }
  const head=new THREE.MeshStandardMaterial({color:0xfff1c3,emissive:0xffc65a,emissiveIntensity:1.7});
  const tail=new THREE.MeshStandardMaterial({color:0xe54d53,emissive:0xd51e2b,emissiveIntensity:1.2});
  for(const x of [-1.35,1.35]) { shape(group,new THREE.BoxGeometry(.55,.22,.12),head,[x,.9,3.58]); shape(group,new THREE.BoxGeometry(.62,.2,.14),tail,[x,.9,-3.58]); }
  const sirens=[];
  if(police) {
    shape(group,new THREE.BoxGeometry(1.75,.25,.42),trim,[0,2.3,-.1]);
    for(const [x,c] of [[-.57,0x168aff],[.57,0xff253b]]) {
      const material=new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:2.5});
      sirens.push(shape(group,new THREE.BoxGeometry(.82,.25,.38),material,[x,2.48,-.1]));
    }
    shape(group,new THREE.BoxGeometry(.12,.32,1.5),paint(0x292d31),[0,1.45,0]);
  }
  group.userData={spec,speed:0,condition:100,police,wheels,sirens,collisionTime:0};
  scene.add(group); return group;
}
export function driveVehicle(car,input,dt,onCrash=()=>{}) {
  const data=car.userData, max=data.spec.speed+(input.nitro?24:0), accel=input.forward?38:input.reverse?-25:0;
  if(input.brake) data.speed*=Math.max(0,1-dt*5.5);
  else if(accel) data.speed+=accel*dt;
  else data.speed*=Math.max(0,1-dt*(input.handbrake?3.8:1.05));
  data.speed=THREE.MathUtils.clamp(data.speed,-22,max);
  const steer=(input.left?1:0)-(input.right?1:0);
  const grip=input.handbrake?1.65:1;
  car.rotation.y+=steer*dt*grip*THREE.MathUtils.clamp(Math.abs(data.speed)/25,0,1.5)*Math.sign(data.speed||1);
  car.position.x+=Math.sin(car.rotation.y)*data.speed/3.6*dt;
  car.position.z+=Math.cos(car.rotation.y)*data.speed/3.6*dt;
  car.position.x=THREE.MathUtils.clamp(car.position.x,-145,145); car.position.z=THREE.MathUtils.clamp(car.position.z,-165,165);
  for(const {wheel} of data.wheels) wheel.rotation.x+=data.speed*dt*.035;
  if(data.speed>48 && data.collisionTime<=0) { data.condition=Math.max(25,data.condition-7); data.speed*=.8; data.collisionTime=.55; onCrash(); }
  data.collisionTime-=dt;
  return data;
}
