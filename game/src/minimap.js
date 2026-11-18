// Compact DOM minimap: street grid, player heading and nearby police pins.
export function makeMinimap() {
  const root = document.createElement('div'); root.className = 'minimap'; root.innerHTML = '<div class="map-grid"></div><div class="map-road r1"></div><div class="map-road r2"></div><div class="map-road r3"></div><div class="map-road r4"></div><i class="map-pin player-pin">▲</i><i class="map-pin cop-pin c1">●</i><i class="map-pin cop-pin c2">●</i><i class="map-pin objective-pin">◆</i><span class="map-n">N</span>';
  return { root, update(x,z,yaw,active=true) {
    root.classList.toggle('map-onfoot',!active);
    const px = Math.max(8,Math.min(92,50+x*.18)), py = Math.max(8,Math.min(92,50+z*.18));
    const player = root.querySelector('.player-pin'); player.style.left = px+'%'; player.style.top = py+'%'; player.style.transform = `translate(-50%,-50%) rotate(${yaw}rad)`;
    root.querySelectorAll('.cop-pin').forEach((pin,i)=>{ pin.style.left=(Math.max(9,Math.min(91,px-15+i*23)))+'%'; pin.style.top=(py+10+i*2)+'%'; });
    const objective=root.querySelector('.objective-pin'); objective.style.left=(x < -20?'72%':'32%'); objective.style.top='31%';
  }};
}
