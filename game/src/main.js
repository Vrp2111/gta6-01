// Boot the Lumen Bay world, drive a fixed-step loop, and expose stable capture staging.
import * as THREE from 'three';
import { buildCity, districtAt } from './city.js';
import { WORLD } from './config.js';
import { createAudio } from './audio.js';
import { createHud, createOverlay } from './hud.js';
import { createInput } from './input.js';
import { createPlayer, updateWalking } from './player.js';
import { createRenderer, resizeRenderer, updateChaseCamera } from './render.js';
import { createTraffic, updateTraffic } from './traffic.js';
import { stageShot, shotName } from './shots.js';
import { driveVehicle } from './vehicles.js';

const canvas=document.querySelector('#world'), hudHost=document.querySelector('#hud'), overlayHost=document.querySelector('#overlay');
const scene=new THREE.Scene(); buildCity(scene,Number(new URLSearchParams(location.search).get('seed')||WORLD.seed));
const {renderer,camera}=createRenderer(canvas,scene); const hud=createHud(hudHost), input=createInput(), audio=createAudio(), player=createPlayer(scene);
const staging=stageShot(scene,player,hud,camera), traffic=createTraffic(scene,Number(new URLSearchParams(location.search).get('seed')||WORLD.seed),11);
const overlay=createOverlay(overlayHost,startGame,startGame);
let screen=staging.state, radioIndex=0, elapsed=0, accumulator=0, frameTime=performance.now(), fpsFrames=0, fpsLast=frameTime, fpsAverage=0, impactShake=0;
const STEP=1/60, stats={elapsed:0,frames:0};

function startGame() { screen='gameplay'; hudHost.style.display=''; overlay.hide(); window.__gameStarted=true; }
function togglePause() { if(screen==='gameplay'){screen='pause';overlay.showPause(()=>{screen='gameplay';overlay.hide();});} else if(screen==='pause'){screen='gameplay';overlay.hide();} }
function simulate(dt) {
  elapsed+=dt; staging.update(elapsed); updateTraffic(traffic,dt,elapsed);
  if(input.take('pause')) togglePause();
  if(input.take('radio')) { radioIndex=(radioIndex+1)%2; hud.radio(radioIndex); }
  if(input.take('horn')) audio.horn();
  updateWalking(player,input,dt,staging.car);
  if(player.inCar && screen==='gameplay') {
    const collision=traffic.cars.some(vehicle=>Math.hypot(vehicle.position.x-staging.car.position.x,vehicle.position.z-staging.car.position.z)<2.8);
    driveVehicle(staging.car,{...input.drive(),colliding:collision},dt,()=>{impactShake=1;});
    impactShake=Math.max(0,impactShake-dt*2.5);
  }
  audio.update(staging.car.userData.speed);
  const subject=player.inCar?staging.car:player.group;
  if(screen==='gameplay' && shotName==='chase') {
    const data=staging.car.userData; data.speed=48+Math.sin(elapsed*.45)*2; staging.car.position.z=elapsed*5;
    for(let i=0;i<staging.cops.length;i++){staging.cops[i].position.z=staging.car.position.z-13-i*2;staging.cops[i].position.x=(i?3.7:-3.7)+Math.sin(elapsed+i)*.3;}
    staging.helicopter.position.z=staging.car.position.z-2; staging.helicopter.position.x=staging.car.position.x+3+Math.sin(elapsed*.5)*2;
  }
  if(screen==='gameplay' && shotName==='mission' && elapsed<12) staging.car.userData.speed=16;
  if(screen==='gameplay' && shotName==='onfoot') { staging.car.userData.speed=0; staging.car.position.x=-20; staging.car.position.z=-36; }
  if(screen==='gameplay' && subject!==staging.car) {
    const back=new THREE.Vector3(-Math.sin(subject.rotation.y),0,-Math.cos(subject.rotation.y));
    camera.position.lerp(subject.position.clone().addScaledVector(back,9).add(new THREE.Vector3(0,5.4,0)),1-Math.exp(-dt*3));
    camera.lookAt(subject.position.clone().add(new THREE.Vector3(0,1,0)));
  }
  else updateChaseCamera(camera,staging.car,dt,Math.max(impactShake,Math.abs(staging.car.userData.speed)>45?.14:0));
  hud.update({speed:player.inCar?staging.car.userData.speed:0,vehicle:player.inCar?'SOLSTICE GT':'ON FOOT',condition:staging.car.userData.condition,district:districtAt(subject.position.x,subject.position.z),x:subject.position.x,z:subject.position.z,yaw:subject.rotation.y,inCar:player.inCar});
  stats.elapsed+=dt; stats.frames++;
}

function animate(now) {
  requestAnimationFrame(animate);
  const dt=Math.min(.05,(now-frameTime)/1000); frameTime=now;
  if(screen==='gameplay') { accumulator=Math.min(accumulator+dt,.2); while(accumulator>=STEP){simulate(STEP);accumulator-=STEP;} }
  else if(screen==='title') { if(shotName!=='start') startGame(); else { camera.position.x=Math.sin(now*.0001)*.3; camera.lookAt(0,8,0); } }
  else if(screen==='pause') input.clear();
  renderer.render(scene,camera); fpsFrames++;
  if(now-fpsLast>=5000){fpsAverage=fpsFrames*1000/(now-fpsLast);fpsFrames=0;fpsLast=now;window.__fps5=fpsAverage;} else if(now-fpsLast>=1000) window.__fps=fpsFrames*1000/(now-fpsLast);
}

addEventListener('resize',()=>resizeRenderer(renderer,camera));
addEventListener('keydown',event=>{ if(event.code==='Escape'&&screen==='title'){startGame();} });
if(shotName==='start') { hudHost.style.display='none'; overlay.showTitle(); }
else { startGame(); }
staging.ready(); requestAnimationFrame(animate);
window.__lumenBay={get screen(){return screen;},get fps(){return fpsAverage;},get elapsed(){return stats.elapsed;},player,car:staging.car};
