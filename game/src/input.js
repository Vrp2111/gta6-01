// Keyboard state and action edges shared by driving and walking.
export function createInput() {
  const down = new Set(), pressed = new Set();
  const map = { KeyW:'forward', ArrowUp:'forward', KeyS:'reverse', ArrowDown:'reverse', KeyA:'left', ArrowLeft:'left', KeyD:'right', ArrowRight:'right', Space:'handbrake', ShiftLeft:'nitro', ShiftRight:'nitro', KeyE:'enter', Escape:'pause', KeyM:'radio', KeyF:'interact', KeyH:'horn' };
  addEventListener('keydown', event => {
    if (map[event.code] || event.code.startsWith('Digit')) event.preventDefault();
    if (!down.has(event.code)) pressed.add(event.code); down.add(event.code);
  });
  addEventListener('keyup', event => { down.delete(event.code); });
  const isDown = name => [...down].some(code => map[code] === name);
  const take = name => { const code = [...pressed].find(key => map[key] === name || key === name); if (!code) return false; pressed.delete(code); return true; };
  return {
    isDown, take,
    drive: () => ({ forward:isDown('forward'), reverse:isDown('reverse'), left:isDown('left'), right:isDown('right'), handbrake:isDown('handbrake'), brake:isDown('handbrake'), nitro:isDown('nitro') }),
    clear: () => { pressed.clear(); },
  };
}
