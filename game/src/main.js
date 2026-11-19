import * as THREE from 'three';
import { WORLD } from './config.js';
import { buildCity, districtAt } from './city.js';
import { createRenderer, resizeRenderer, updateChaseCamera } from './render.js';
import { createHud, createOverlay } from './hud.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createPlayer, updateWalking } from './player.js';
import { stageShot, shotName, shotSeed } from './shots.js';
import { createTraffic, updateTraffic } from './traffic.js';
import { updatePolice } from './police.js';
import { createJobRun } from './missions.js';
import { driveVehicle } from './vehicles.js';

const query=new URLSearchParams(location.search), jobMode=query.get('play')==='job1';
const scene=new THREE.Scene();
const city=buildCity(scene,shotSeed);
const {renderer,camera}=createRenderer(document.querySelector('#world'),scene);
const hud=createHud(document.querySelector('#hud'));
const overlay=createOverlay(document.querySelector('#overlay'),()=>startGame(),()=>resumeGame());
const input=createInput(),audio=createAudio(),player=createPlayer(scene),staged=stageShot(scene,player,hud,camera),car=staged.car;
const traffic=createTraffic(scene,shotSeed,14);
if(player.inCar) player.position.copy(car.position);
if(jobMode) car.position.set(-12,.03,0);
const job=jobMode?createJobRun(car,hud,player):null;
let elapsed=0,accumulator=0,last=performance.now(),screen=shotName==='start'?'title':'game',paused=false,radioIndex=0,shake=0;
let fpsFrames=0,fpsStart=performance.now(),fps5Frames=0,fps5Start=performance.now(),fps=0,fps5=0;
const fixed=1/60, maxSteps=12;
if(screen==='title'){hudHostVisibility(false);overlay.showTitle();}else{overlay.hide();hudHostVisibility(true);}
function hudHostVisibility(visible){document.querySelector('#hud').style.display=visible?'block':'none';}
function startGame(){screen='game';staged.state.screen='game';overlay.hide();hudHostVisibility(true);input.clear();}
function resumeGame(){paused=false;screen='game';staged.state.screen='game';overlay.hide();hudHostVisibility(true);input.clear();}
function simulate(dt){
  elapsed+=dt;
  updateTraffic(traffic,dt,elapsed);
  if(input.take('pause')) { if(screen==='game'){paused=!paused;if(paused){screen='pause';overlay.showPause();input.clear();}else resumeGame();} }
  if(screen==='pause')return;
  if(input.take('radio')){radioIndex++;hud.radio(radioIndex);}
  if(input.take('horn'))audio.horn();
  updateWalking(player,input,dt,car);
  if(screen==='game'&&player.inCar&&!jobMode){
    let crashed=false;
    for(const other of traffic.cars) if(Math.hypot(other.position.x-car.position.x,other.position.z-car.position.z)<3.3&&Math.abs(car.userData.speed)>25){crashed=true;break;}
    driveVehicle(car,input.drive(),dt,()=>{shake=.55;});if(crashed){car.userData.condition=Math.max(25,car.userData.condition-2);car.userData.speed*=.82;shake=.4;}
  }
  if(jobMode&&job)job.update(dt,true);
  if(!jobMode){staged.update(elapsed);if(shotName==='chase'){car.userData.speed=82+Math.sin(elapsed*1.2)*7;}else if(shotName==='mission'&&elapsed<12){car.userData.speed=45;}else if(shotName==='onfoot'){car.userData.speed=0;}}
  const wanted=jobMode?0:shotName==='chase'?4:shotName==='mission'?1:0;
  const dispatch=updatePolice(staged.pursuit,elapsed,wanted);
  hud.setPolice(dispatch,wanted);
  audio.update(player.inCar?car.userData.speed:0,shotName==='chase'&&!jobMode);
  const subject=player.inCar?car:player.group;
  if(jobMode||(shotName!=='onfoot'&&shotName!=='start'&&player.inCar))updateChaseCamera(camera,subject,dt,shake);
  shake=Math.max(0,shake-dt);
  const district=districtAt(subject.position.x,subject.position.z);
  hud.update({speed:player.inCar?car.userData.speed:0,condition:car.userData.condition,district,x:subject.position.x,z:subject.position.z,yaw:subject.rotation.y,inCar:player.inCar,money:player.money});
  if(job) { window.__jobState=job.state; }
}
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
  if(screen==='game'){
    accumulator=Math.min(.2,accumulator+dt);let steps=0;
    while(accumulator>=fixed&&steps<maxSteps){simulate(fixed);accumulator-=fixed;steps++;}
    if(steps===maxSteps)accumulator=0;
  }
  renderer.render(scene,camera);
  fpsFrames++;fps5Frames++;
  if(now-fpsStart>=1000){fps=fpsFrames*1000/(now-fpsStart);fpsFrames=0;fpsStart=now;window.__fps=fps;}
  if(now-fps5Start>=5000){fps5=fps5Frames*1000/(now-fps5Start);fps5Frames=0;fps5Start=now;window.__fps5=fps5;}
  window.__lumenBay={screen,scenePosition:{x:scene.position.x,y:scene.position.y,z:scene.position.z},cameraPosition:{x:camera.position.x,y:camera.position.y,z:camera.position.z},car,player,fps,elapsed,seed:shotSeed,meshes:scene.children.filter(o=>o.isMesh).length};
}
window.addEventListener('resize',()=>resizeRenderer(renderer,camera));
window.addEventListener('keydown',event=>{if(event.code==='Escape'&&screen==='title'){event.preventDefault();startGame();}});
staged.ready();
requestAnimationFrame(animate);
