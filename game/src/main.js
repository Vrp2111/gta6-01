import * as THREE from 'three';
import {buildCity,districtAt} from './city.js';
import {createRenderer,resizeRenderer,updateChaseCamera} from './render.js';
import {createHud,createOverlay} from './hud.js';
import {createPlayer,updateWalking} from './player.js';
import {createInput} from './input.js';
import {createAudio} from './audio.js';
import {stageShot,shot,seed} from './shots.js';
import {createTraffic,updateTraffic} from './traffic.js';
import {driveVehicle} from './vehicles.js';
import {updatePolice} from './police.js';
import {createJobRun} from './missions.js';
const params=new URLSearchParams(location.search),jobMode=params.get('play')==='job1',scene=new THREE.Scene();
buildCity(scene,seed);const {renderer,camera}=createRenderer(document.querySelector('#world'),scene),hudHost=document.querySelector('#hud'),hud=createHud(hudHost),input=createInput(),audio=createAudio(),player=createPlayer(scene),staging=stageShot(scene,player,hud,camera),car=staging.car,traffic=createTraffic(scene,seed,17);
let screen=staging.state,elapsed=0,radio=0,shake=0,job=jobMode?createJobRun(car,hud,player):null;
const overlay=createOverlay(document.querySelector('#overlay'),()=>{screen='gameplay';overlay.hide();hudHost.hidden=false;car.position.set(-3.7,0,0);player.inCar=true;job=createJobRun(car,hud,player);},()=>{screen='gameplay';overlay.hide();hudHost.hidden=false;});
if(screen==='title'){hudHost.hidden=true;overlay.showTitle();}
function simulate(dt){if(input.take('pause')){screen=screen==='paused'?'gameplay':'paused';input.clear();if(screen==='paused')overlay.showPause();else overlay.hide();}if(screen!=='gameplay')return;elapsed+=dt;if(!jobMode)staging.update(elapsed);updateTraffic(traffic,dt,elapsed);if(input.take('radio'))hud.radio(radio=1-radio);if(input.take('horn'))audio.horn();updateWalking(player,input,dt,car);const controls=input.drive(),driving=Object.values(controls).some(Boolean);if(player.inCar){controls.collision=traffic.cars.some(other=>other.position.distanceTo(car.position)<2.8);driveVehicle(car,controls,dt,()=>{shake=1;});}if(job){job.update(dt,jobMode);if(!jobMode&&job.state.complete)job=null;}const wanted=jobMode?0:shot==='chase'?4:shot==='mission'?1:0;hud.setPolice(updatePolice(staging.pursuit,elapsed,wanted),wanted);audio.update(car.userData.speed,shot==='chase'&&!jobMode);if(!driving&&player.inCar&&!jobMode&&!job){if(shot==='chase'){car.userData.speed=48+Math.sin(elapsed)*2;car.position.z=elapsed*5;}else if(shot==='mission'&&elapsed<12)car.userData.speed=16;}if(jobMode)car.userData.speed=17;if(shot==='onfoot'&&player.inCar===false)car.userData.speed=0;shake*=Math.exp(-dt*6);if(player.inCar)updateChaseCamera(camera,car,dt,shake);else if(driving){const target=player.position.clone().add(new THREE.Vector3(7,5.4,8));camera.position.lerp(target,1-Math.exp(-dt*4.2));camera.lookAt(player.position.clone().add(new THREE.Vector3(0,1,0)));}const subject=player.inCar?car:player.group;hud.update({speed:player.inCar?car.userData.speed:0,vehicle:player.inCar?'SOLSTICE GT':'ON FOOT',condition:car.userData.condition,district:districtAt(subject.position.x,subject.position.z),x:subject.position.x,z:subject.position.z,yaw:subject.rotation.y,inCar:player.inCar});}
let last=performance.now(),accumulator=0,frames=0,fiveFrames=0,fpsTime=last,fiveTime=last;window.__lumenBay={screen,fps:0,elapsed,player,car};
function animate(now){const dt=Math.min(.05,(now-last)/1000);last=now;accumulator=Math.min(.2,accumulator+dt);while(accumulator>=1/60){simulate(1/60);accumulator-=1/60;}renderer.render(scene,camera);frames++;fiveFrames++;if(now-fpsTime>=1000){window.__fps=frames*1000/(now-fpsTime);fpsTime=now;frames=0;}if(now-fiveTime>=5000){window.__fps5=fiveFrames*1000/(now-fiveTime);fiveTime=now;fiveFrames=0;}Object.assign(window.__lumenBay,{screen,fps:window.__fps||0,elapsed});requestAnimationFrame(animate);}
addEventListener('resize',()=>resizeRenderer(renderer,camera));addEventListener('keydown',e=>{if(screen==='title'&&(e.code==='Escape'||e.code==='Enter')){overlay.hide();screen='gameplay';hudHost.hidden=false;input.clear();}});staging.ready();requestAnimationFrame(animate);
