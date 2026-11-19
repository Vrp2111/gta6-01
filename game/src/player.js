import * as THREE from 'three';
export function createPlayer(scene) {
  const group=new THREE.Group(), jacket=new THREE.MeshStandardMaterial({color:0x263f66,roughness:.85}), skin=new THREE.MeshStandardMaterial({color:0xc99670}), trousers=new THREE.MeshStandardMaterial({color:0x242a39});
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.9,4,8),jacket); torso.position.y=1.22; group.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.29,10,8),skin); head.position.y=2.12; group.add(head);
  const legs=[]; for(const x of [-.17,.17]) { const leg=new THREE.Mesh(new THREE.CylinderGeometry(.12,.14,.8,7),trousers); leg.position.set(x,.42,0); group.add(leg); legs.push(leg); }
  group.traverse(o=>{if(o.isMesh)o.castShadow=true;}); group.visible=false; scene.add(group);
  return {group,inCar:true,position:group.position,money:38420,health:100,armour:75,legs,walkingTime:0};
}
export function updateWalking(player,input,dt,car) {
  if(input.take('enter')) {
    if(player.inCar) { player.inCar=false; player.group.visible=true; player.position.set(car.position.x+2.8,.05,car.position.z); }
    else if(player.position.distanceTo(car.position)<9) { player.inCar=true; player.group.visible=false; }
  }
  if(input.take('interact')&&!player.inCar&&player.position.distanceTo(car.position)<9) { player.inCar=true; player.group.visible=false; }
  if(player.inCar) { player.group.visible=false; return player; }
  player.group.visible=true;
  const keys=input.drive(), speed=keys.nitro?9.5:5.3, fx=(keys.right?1:0)-(keys.left?1:0), fz=(keys.reverse?1:0)-(keys.forward?1:0), length=Math.hypot(fx,fz);
  if(length) { const dx=fx/length*speed*dt,dz=fz/length*speed*dt; player.position.x+=dx; player.position.z+=dz; player.group.rotation.y=Math.atan2(dx,dz); }
  player.position.x=THREE.MathUtils.clamp(player.position.x,-145,145); player.position.z=THREE.MathUtils.clamp(player.position.z,-165,165);
  player.walkingTime+=dt; player.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(player.walkingTime*9+i*Math.PI)*.36);
  return player;
}
