const MAP={KeyW:'forward',ArrowUp:'forward',KeyS:'reverse',ArrowDown:'reverse',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',Space:'handbrake',ShiftLeft:'nitro',ShiftRight:'nitro',KeyE:'enter',Escape:'pause',KeyM:'radio',KeyF:'interact',KeyH:'horn'};
export function createInput() {
  const down=new Set(),edges=new Set();
  const keydown=e=>{const mapped=MAP[e.code];if(mapped||/^Digit[0-9]$/.test(e.code)){e.preventDefault();if(!down.has(e.code))edges.add(mapped||e.code);}down.add(e.code);};
  const keyup=e=>down.delete(e.code); window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
  const held=name=>[...down].some(code=>MAP[code]===name);
  return {isDown:name=>held(name),take(name){if(edges.has(name)){edges.delete(name);return true;}return false;},drive(){return {forward:held('forward'),reverse:held('reverse'),left:held('left'),right:held('right'),handbrake:held('handbrake'),brake:held('handbrake'),nitro:held('nitro')};},clear(){down.clear();edges.clear();}};
}
