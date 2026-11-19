import * as THREE from 'three';
import { JOBS, WORLD } from './config.js';

export const STORY_JOBS=JOBS;
export function createJobRun(car,hud,player) {
  const checkpoint=new THREE.Vector3(-3.7,0,78), origin=new THREE.Vector3(-12,0,0);
  const state={active:true,complete:false,chapter:JOBS[0].chapter,job:JOBS[0].name,stage:1,reward:0,next:JOBS[0].next,time:0,completedInSeconds:0,distance:Number(origin.distanceTo(checkpoint).toFixed(1)),initialDistance:Number(origin.distanceTo(checkpoint).toFixed(1)),checkpoint:{x:-3.7,z:78}};
  window.__jobState=state; hud.setMission(JOBS[0].chapter,JOBS[0].objective,'01 / 08');
  return {state,update(dt,autopilot=false) {
    if(!state.active)return state;
    state.time+=dt;
    if(autopilot) {
      const dx=checkpoint.x-car.position.x,dz=checkpoint.z-car.position.z,dist=Math.hypot(dx,dz);
      if(dist>0.01) { const step=Math.min(dist,18*dt); car.position.x+=dx/dist*step; car.position.z+=dz/dist*step; car.rotation.y=Math.atan2(dx,dz); car.userData.speed=50; }
    }
    const distance=Math.hypot(checkpoint.x-car.position.x,checkpoint.z-car.position.z); state.distance=Number(distance.toFixed(1));
    if(distance<8) {
      state.active=false; state.complete=true; state.stage=3; state.reward=850; state.completedInSeconds=Number(state.time.toFixed(2));
      state.next='Glass Harbor'; player.money+=850; state.money=player.money;
      document.body.dataset.jobComplete='true'; hud.setMission('JOB COMPLETE · +$850','Afterglow delivered. Mira is safe at the Marina Strip.','03 / 03');
    }
    return state;
  }};
}
