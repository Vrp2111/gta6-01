import * as THREE from 'three';
import { CARS, JOBS, WORLD } from './config.js';
import { makeVehicle } from './vehicles.js';
import { createPolice } from './police.js';

const params=new URLSearchParams(location.search);
export const shotName=params.get('shot')||'chase';
export const shotSeed=Number(params.get('seed')||WORLD.seed);
export function stageShot(scene,player,ui,camera) {
  const car=makeVehicle(scene,CARS[0]),pursuit=createPolice(scene,car),state={screen:shotName==='start'?'title':'game',time:0};
  car.position.set(0,.03,0);car.rotation.y=0;
  if(shotName==='chase') {
    car.position.set(0,.03,0); car.userData.speed=82;
    pursuit.units[0].vehicle.position.set(-4.6,.03,10);pursuit.units[1].vehicle.position.set(5,.03,17);pursuit.units[2].vehicle.position.set(-5,.03,29);
    pursuit.aircraft.group.position.set(2,20,27); pursuit.aircraft.group.visible=true;
    ui.setMission('CH 03 — OPEN CHANNEL','Hold the Sunset Causeway. Lose the LBPD tail.','03 / 08');ui.setStars(4);
    camera.position.set(0,8.4,-15.5);camera.lookAt(0,1.2,11);
  } else if(shotName==='mission') {
    car.position.set(-1,.03,0);car.userData.speed=45;
    pursuit.units[0].vehicle.position.set(-5,.03,12);pursuit.units[1].vehicle.position.set(5,.03,19);pursuit.units[2].vehicle.position.set(-5,.03,29);
    pursuit.aircraft.group.visible=false;ui.setMission(JOBS[0].chapter,'Bring the Solstice across the Sunset Causeway.','03 / 08');ui.setStars(1);
    camera.position.set(-1,8.2,-15);camera.lookAt(0,1,12);
  } else if(shotName==='onfoot') {
    car.position.set(-2,.03,2);car.rotation.y=-.22;car.userData.speed=0;
    player.inCar=false;player.group.visible=true;player.position.set(-4.85,.05,2.2);player.group.rotation.y=-.45;
    pursuit.units.forEach(u=>u.vehicle.visible=false);pursuit.aircraft.group.visible=false;
    ui.setMission('CH 02 — GLASS HARBOR','Walk the Marina Strip and find Dario’s marker.','02 / 08');ui.setStars(0);
    camera.position.set(-10,5.8,-6);camera.lookAt(-1.5,1.1,6);
  } else if(shotName==='start') {
    pursuit.units.forEach(u=>u.vehicle.visible=false);pursuit.aircraft.group.visible=false;
    camera.position.set(0,28,-56);camera.lookAt(-12,3,0);ui.setStars(0);
  } else { ui.setStars(0); }
  return {car,police:pursuit.units,helicopter:pursuit.aircraft,pursuit,state,shot:shotName,update(time){state.time=time;if(shotName==='chase'&&state.screen==='game'){car.position.x=Math.sin(time*.63)*1.15;car.position.z=Math.sin(time*.55)*.8;car.rotation.y=Math.sin(time*.55)*.035;}},ready(){requestAnimationFrame(()=>requestAnimationFrame(()=>{window.__shotReady=true;}));}};
}
