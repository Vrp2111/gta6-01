// Sunset lighting and an eased third-person perspective chase camera.
import * as THREE from 'three';

export function createRenderer(canvas, scene) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.setSize(innerWidth, innerHeight, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, .1, 380); camera.position.set(0, 10, 18);
  scene.add(new THREE.HemisphereLight(0xffd2b1, 0x52626a, 2.05));
  const sun = new THREE.DirectionalLight(0xffcb9a, 3.15); sun.position.set(-72, 115, -90); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -95; sun.shadow.camera.right = 95; sun.shadow.camera.top = 95; sun.shadow.camera.bottom = -95; sun.shadow.bias = -.0003; scene.add(sun);
  const fill = new THREE.PointLight(0xf180a0, 90, 190, 2); fill.position.set(-35, 28, -82); scene.add(fill);
  return { renderer, camera };
}

export function resizeRenderer(renderer, camera) {
  renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
}

export function updateChaseCamera(camera, car, dt, shake = 0) {
  const yaw = car.rotation.y; const back = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const desired = car.position.clone().addScaledVector(back, 12.5).add(new THREE.Vector3(0, 7.7, 0));
  desired.x += Math.sin(performance.now() * .025) * shake * .12; desired.y += shake * .12;
  camera.position.lerp(desired, 1 - Math.exp(-dt * 4.2));
  const look = car.position.clone().add(new THREE.Vector3(0, 1.15, 0)).addScaledVector(back, -5.5); camera.lookAt(look);
}
