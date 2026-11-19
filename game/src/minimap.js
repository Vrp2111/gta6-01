export function makeMinimap() {
  const root=document.createElement('div');root.className='minimap';
  root.innerHTML='<span class="mini-n">N</span><i class="mini-road road-a"></i><i class="mini-road road-b"></i><i class="mini-road road-c"></i><i class="mini-road road-d"></i><b class="mini-pin player-pin">▲</b><b class="mini-pin police-pin police-a">●</b><b class="mini-pin police-pin police-b">●</b><b class="mini-pin objective-pin">◆</b>';
  const player=root.querySelector('.player-pin'), police=[...root.querySelectorAll('.police-pin')], objective=root.querySelector('.objective-pin');
  function place(node,x,z){node.style.left=`${Math.max(10,Math.min(90,50+x))}%`;node.style.top=`${Math.max(10,Math.min(90,50+z))}%`;}
  return {root,update(x,z,yaw,active=true){player.style.transform=`translate(-50%,-50%) rotate(${yaw*180/Math.PI}deg)`;place(player,Math.max(-31,Math.min(31,x*.13)),Math.max(-31,Math.min(31,z*.13)));place(police[0],Math.max(-35,Math.min(35,x*.13+22)),Math.max(-35,Math.min(35,z*.13-22)));place(police[1],Math.max(-35,Math.min(35,x*.13-25)),Math.max(-35,Math.min(35,z*.13-34)));place(objective,x>0?-28:28,23);root.classList.toggle('walking',!active);}};
}
