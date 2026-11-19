import * as THREE from 'three';
export function createRenderer(canvas,scene) {
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(window.innerWidth,window.innerHeight,false);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.outputColorSpace=THREE.SRGBColorSpace;
  const camera=new THREE.PerspectiveCamera(62,window.innerWidth/window.innerHeight,.1,380);camera.position.set(0,8,-14);camera.lookAt(0,1,6);
  const ambient=new THREE.HemisphereLight(0xffd1bb,0x4c4b58,2.05);ambient.position.set(0,35,0);scene.add(ambient);
  const sun=new THREE.DirectionalLight(0xffc786,3.1);sun.position.set(-68,95,48);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-85;sun.shadow.camera.right=85;sun.shadow.camera.top=110;sun.shadow.camera.bottom=-100;sun.shadow.bias=-.0004;scene.add(sun);
  const fill=new THREE.PointLight(0xff72b6,22,125,1.7);fill.position.set(35,18,-25);scene.add(fill);
  return {renderer,camera,scene};
}
export function resizeRenderer(renderer,camera) { camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight,false); }
export function updateChaseCamera(camera,subject,dt,shake=0) {
  const yaw=subject.rotation.y, behind=new THREE.Vector3(-Math.sin(yaw)*14,8.1,-Math.cos(yaw)*14), desired=subject.position.clone().add(behind);
  desired.y=Math.max(5.2,subject.position.y+8.1); desired.x+=Math.sin(performance.now()*.0017)*shake*.4;desired.y+=Math.sin(performance.now()*.0023)*shake*.24;
  camera.position.lerp(desired,Math.min(1,dt*3.4));camera.lookAt(subject.position.x,subject.position.y+1.05,subject.position.z+Math.cos(yaw)*8);
}
