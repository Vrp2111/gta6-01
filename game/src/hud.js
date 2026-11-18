// All crisp gameplay labels live in DOM above the 3D scene.
import { RADIO, UNITS } from './config.js';
import { makeMinimap } from './minimap.js';

const pad = (n) => String(n).padStart(2,'0');
export function createHud(host) {
  host.innerHTML = `
  <section class="hud-top"><div class="brand"><b>LUMEN BAY</b><span>LEO VANCE / SUNSET RUN</span></div><div class="clock">DAY 1 <strong>18:<span id="clock-min">52</span></strong><small>MARINA COUNTY</small></div></section>
  <section class="money"><span>CASH ON HAND</span><strong>$<i id="money">38.420</i></strong><div class="rep">REP 02 <b>COASTLINE REGULAR</b><span>1.240 / 2.000</span><i><em></em></i></div></section>
  <section class="mission"><div class="mission-kicker"><span>STORY JOB</span><b id="job-count">01 / 08</b></div><h2 id="chapter">CH 01 — AFTERGLOW</h2><p id="objective">Keep Mira moving. Meet Dario at the Marina Strip.</p><div class="stage"><span>STAGE 2 / 3</span><b>68%</b></div><div class="stage-line"><i></i></div><div class="next">NEXT <strong>Find the boardwalk entrance</strong></div></section>
  <section class="wanted"><span>LBPD / WANTED</span><div class="stars"><b>★</b><b>★</b><b class="dim">★</b><b class="dim">★</b><b class="dim">★</b></div><div class="unit-line">${UNITS[0]} <i>● PURSUIT</i></div><div class="unit-line">${UNITS[1]} <i>● CLOSING</i></div></section>
  <section class="unit-track"><span>LBPD DISPATCH</span><b>PELICAN-12 <i>RAMMING</i></b><b>HERON-7 <i>PURSUIT</i></b><em>2 UNITS · 0.3 KM</em></section>
  <section class="lower-left"><div id="map-mount"></div><div class="district"><span>CURRENT DISTRICT</span><b id="district">MARINA STRIP</b><small>OCEAN DRIVE / 03</small></div></section>
  <section class="dialog"><div class="avatar"><b>MS</b><i></i></div><div class="speaker"><b>MIRA SOLIS <span>· WHEELWOMAN</span></b><p>“Two units on our tail. Keep us by the water!”</p></div><div class="comms">CREW LINK <strong>LIVE</strong></div></section>
  <section class="lower-center"><div class="weapons"><span>LOADOUT</span><b class="selected"><i>1</i> PISTOL <strong>12/72</strong></b><b><i>2</i> SMG <strong>30/120</strong></b><b><i>3</i> EMPTY <strong>—</strong></b><b><i>4</i> EMPTY <strong>—</strong></b></div><div class="radio"><span>NOW TUNED</span><b id="radio-station">${RADIO[0].station}</b><small id="radio-song">♫ ${RADIO[0].song}</small></div></section>
  <section class="vehicle-readout"><div class="health"><span>VITALS</span><b>HEALTH <i><em></em></i> 100</b><b>ARMOUR <i><em></em></i> 075</b></div><div class="speed"><strong><i id="speed">137</i><small>KM/H</small></strong><span id="car-name">SOLSTICE GT</span><b>CONDITION <i><em id="condition"></em></i> <small id="condition-num">100%</small></b></div></section>
  <div class="controls-hint">WASD DRIVE / WALK <i>SPACE</i> BRAKE <i>E</i> EXIT / ENTER <i>M</i> RADIO <i>ESC</i> PAUSE</div>`;
  const map = makeMinimap(); host.querySelector('#map-mount').append(map.root);
  return {
    update(data) {
      const speed = data.speed || 0; host.querySelector('#speed').textContent = String(Math.round(Math.abs(speed)*2.24)).padStart(3,'0');
      host.querySelector('#car-name').textContent = data.vehicle;
      host.querySelector('#condition-num').textContent = Math.round(data.condition)+'%'; host.querySelector('#condition').style.width=data.condition+'%';
      host.querySelector('#district').textContent = data.district.toUpperCase();
      map.update(data.x,data.z,data.yaw,data.inCar);
      host.classList.toggle('foot-mode',!data.inCar);
    },
    radio(index) { host.querySelector('#radio-station').textContent=RADIO[index].station; host.querySelector('#radio-song').textContent='♫ '+RADIO[index].song; },
    setMission(chapter, objective, job='03 / 08') { host.querySelector('#chapter').textContent=chapter; host.querySelector('#objective').textContent=objective; host.querySelector('#job-count').textContent=job; },
    setStars(count) { host.querySelectorAll('.stars b').forEach((star,i)=>star.classList.toggle('dim',i>=count)); },
  };
}

export function createOverlay(host, onNewGame, onContinue) {
  const showTitle = () => {
    host.innerHTML = `<div class="title-screen"><div class="title-sun"></div><div class="title-mark"><span>WELCOME TO</span><h1>LUMEN<br><i>BAY</i></h1><p>A CITY THAT GLOWS AFTER DARK</p></div><div class="title-menu"><button id="newgame">NEW GAME <b>01</b></button><button id="continue">CONTINUE <b>›</b></button><div class="jobs-title">AVAILABLE JOBS <span>01 / 08 OPEN</span></div><ol>${['Afterglow','Glass Harbor','Open Channel','Neon Weather','Palm Shadow','Last Ferry','Low Tide','City of Light'].map((name,i)=>`<li><b>${String(i+1).padStart(2,'0')}</b>${name}<i>${i?'LOCKED':'READY'}</i></li>`).join('')}</ol><small>SAVE SLOT 01 · LEO VANCE · AUTOSAVE READY</small></div><div class="title-foot">PALM ROW　/　MARINA STRIP　/　OLD HARBOR　/　NEON MILE　/　SUNSET CAUSEWAY</div><button class="title-radio" id="start">▶ ENTER LUMEN BAY</button></div>`;
    host.querySelector('#newgame').onclick=onNewGame; host.querySelector('#continue').onclick=onContinue; host.querySelector('#start').onclick=onContinue;
  };
  return { showTitle, hide:()=>{host.innerHTML='';}, showPause:resume=>{host.innerHTML='<div class="pause-card"><span>PAUSED</span><h2>Take a breath.</h2><p>Lumen Bay will still be here.</p><button id="resume">RESUME DRIVE　▶</button>'; host.querySelector('#resume').onclick=resume;}, showTitle() { showTitle(); } };
}
