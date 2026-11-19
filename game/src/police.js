import * as THREE from 'three';
import { CARS, POLICE_UNITS } from './config.js';
import { makeVehicle } from './vehicles.js';

export function makeAircraft(scene) {
  const group=new THREE.Group(), body=new THREE.MeshStandardMaterial({color:0x82909a,emissive:0x182027,emissiveIntensity:.35,metalness:.12,roughness:.48}), glass=new THREE.MeshStandardMaterial({color:0xa5fff0,emissive:0x17666b,emissiveIntensity:1.1,metalness:.1,roughness:.16,transparent:true,opacity:.96});
  const cube=(geo,mat,pos)=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.castShadow=true;group.add(m);return m;};
  cube(new THREE.BoxGeometry(2.8,1.25,4.5),body,[0,0,0]); cube(new THREE.BoxGeometry(2.3,1,1.8),glass,[0,.22,1.5]);
  cube(new THREE.BoxGeometry(.5,.5,4),body,[0,.18,-3.25]); cube(new THREE.BoxGeometry(1.5,.22,.5),body,[0,.2,-5.3]);
  const rotor=new THREE.Group(); rotor.position.y=.8; group.add(rotor);
  for(const angle of [0,Math.PI/2]) { const blade=cube(new THREE.BoxGeometry(angle?7.4:.3,.09,angle?.3:.3),new THREE.MeshStandardMaterial({color:0xffedcf,emissive:0x725534,emissiveIntensity:.55}),[0,0,0]); blade.rotation.y=angle; rotor.add(blade); }
  const tailRotor=cube(new THREE.BoxGeometry(.12,1.5,.08),new THREE.MeshStandardMaterial({color:0xe5d3b4}),[0,.25,-5.2]);
  const tailBlade=cube(new THREE.BoxGeometry(.95,.12,.08),new THREE.MeshStandardMaterial({color:0xe5d3b4}),[0,.25,-5.2]);
  for(const [x,z,color] of [[-1.35,1.5,0x52d6ff],[1.35,1.5,0xff566c]]) { const nav=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:2})); nav.position.set(x,.2,z);group.add(nav); }
  const cone=new THREE.Mesh(new THREE.ConeGeometry(3.4,12,20,1,true),new THREE.MeshBasicMaterial({color:0xffe7a5,transparent:true,opacity:.11,side:THREE.DoubleSide,depthWrite:false})); cone.position.set(0,-7,0); cone.rotation.x=Math.PI; group.add(cone);
  const glow=new THREE.PointLight(0xffd89b,2,28); glow.position.set(0,-.35,1); group.add(glow);
  group.scale.setScalar(1.5); scene.add(group); return {group,rotor,tailRotor,tailBlade};
}
export function createPolice(scene,car) {
  const units=POLICE_UNITS.map((spec,i)=>{
    const vehicle=makeVehicle(scene,{...CARS[0],name:spec.name,color:0xf0eee5,speed:46},true);
    vehicle.position.set((i-1)*4.7,.02,-5-i*3); vehicle.rotation.y=0;
    return {name:spec.name,mode:spec.mode,vehicle};
  });
  const aircraft=makeAircraft(scene); aircraft.group.visible=true;
  return {units,aircraft,car};
}
export function updatePolice(pursuit,seconds,wanted=0) {
  const {car,units,aircraft}=pursuit;
  units.forEach((unit,i)=>{
    const offsets=[[-5,-5],[5,-9],[0,-15]][i], targetX=car.position.x+offsets[0],targetZ=car.position.z+offsets[1], alpha=Math.min(1,.8/60);
    unit.vehicle.position.x=THREE.MathUtils.lerp(unit.vehicle.position.x,targetX,alpha);
    unit.vehicle.position.z=THREE.MathUtils.lerp(unit.vehicle.position.z,targetZ,alpha);
    unit.vehicle.position.y=.02; unit.vehicle.rotation.y=car.rotation.y;
    unit.vehicle.userData.sirens.forEach((lamp,j)=>{lamp.material.emissiveIntensity=Math.sin(seconds*9+j*Math.PI+i)>.0?3.8:.35;});
    const distance=Math.hypot(car.position.x-unit.vehicle.position.x,car.position.z-unit.vehicle.position.z)/1000;
    const status=i===0&&seconds%8<2?'RAMMING':i===2&&seconds%12>8?'ROADBLOCK':'PURSUIT';
    return {name:unit.name,status,distance:`${distance.toFixed(2)} km`};
  });
  aircraft.group.visible=wanted>=3;
  if(aircraft.group.visible) { aircraft.group.position.set(car.position.x-6+Math.sin(seconds*.6),8+Math.sin(seconds*1.1)*.35,car.position.z+13); aircraft.group.rotation.y=car.rotation.y+Math.PI/2; aircraft.rotor.rotation.y=seconds*18; aircraft.tailRotor.rotation.z=seconds*17; aircraft.tailBlade.rotation.z=seconds*17; }
  return units.map((unit,i)=>({name:unit.name,status:i===0&&seconds%8<2?'RAMMING':i===2&&seconds%12>8?'ROADBLOCK':'PURSUIT',distance:`${(Math.hypot(car.position.x-unit.vehicle.position.x,car.position.z-unit.vehicle.position.z)/1000).toFixed(2)} km`}));
}
