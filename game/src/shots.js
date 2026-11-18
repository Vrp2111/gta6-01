// Query-driven deterministic staging for the four required capture views.
import * as THREE from 'three';
import { CARS, MISSION, UNITS, WORLD } from './config.js';
import { makeVehicle } from './vehicles.js';
import { random } from './random.js';

const params = new URLSearchParams(location.search);
export const shotName = params.get('shot') || 'chase';
export const shotSeed = Number(params.get('seed') || WORLD.seed) >>> 0;

export function stageShot(scene, player, ui, camera) {
  const rng = random(shotSeed), playerCar = makeVehicle(scene,CARS[0]);
  const cops=[];
  playerCar.position.set(-3.7,0,0); playerCar.rotation.y=0;
  for (let i=0;i<2;i++) { const cop=makeVehicle(scene,{ name:UNITS[i], color:0xdde0db },true); cop.position.set((i?3.7:-3.7),0,playerCar.position.z-13-i*2); cop.rotation.y=0; cops.push(cop); }
  const helicopter=new THREE.Group();
  const hull=new THREE.Mesh(new THREE.BoxGeometry(2.1,.9,4.1),new THREE.MeshStandardMaterial({color:0x384c55,metalness:.3,roughness:.45})); hull.castShadow=true; helicopter.add(hull);
  const beam=new THREE.Mesh(new THREE.ConeGeometry(6,28,16,1,true),new THREE.MeshBasicMaterial({color:0xffd681,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false})); beam.position.set(0,-14,0); beam.rotation.x=Math.PI; helicopter.add(beam); helicopter.position.set(2,44,playerCar.position.z+15); scene.add(helicopter);
  let avatar=player.group, state='gameplay';
  if (shotName==='onfoot') { playerCar.position.set(-20,0,-36); playerCar.rotation.y=.2; player.inCar=false; player.group.position.set(-16,0,-38); camera.position.set(-7,7,-25); camera.lookAt(-17,1,-40); ui.setStars(0); ui.setMission('CH 02 — GLASS HARBOR','Walk the Marina Strip and find Dario’s marker.','02 / 08'); }
  else if (shotName==='mission') { playerCar.position.set(6,0,106); playerCar.rotation.y=0; ui.setStars(1); ui.setMission(MISSION.chapter,'Bring the Solstice across the Sunset Causeway.','03 / 08'); camera.position.set(22,10,130); camera.lookAt(5,3,105); }
  else if (shotName==='chase' || !['start'].includes(shotName)) { ui.setStars(2); ui.setMission('CH 03 — OPEN CHANNEL','Hold the Sunset Causeway. Lose the LBPD tail.','03 / 08'); }
  else { state='title'; ui.setStars(0); }
  if (shotName==='onfoot') playerCar.visible=true;
  return { car:playerCar, cops, helicopter, state, shot:shotName, update(time) {
    if (shotName==='chase') { playerCar.position.z=Math.sin(time*.15)*.25; for(let i=0;i<cops.length;i++){cops[i].position.z=playerCar.position.z-13-i*2+Math.sin(time*.8+i)*.25;cops[i].position.x=(i?3.7:-3.7)+Math.sin(time*.4+i)*.35;} helicopter.position.x=playerCar.position.x+3+Math.sin(time*.5)*2; helicopter.position.z=playerCar.position.z-2; }
  }, ready() { requestAnimationFrame(()=>requestAnimationFrame(()=>{ window.__shotReady=true; })); } };
}
