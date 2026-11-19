export const WORLD = { size: 360, seed: 96321, start: [-12, 0], checkpoint: [-3, 78] };
export const SUNSET = { sky: 0xf4a08f, fog: 0xe99a94, road: 0x434551, sand: 0xe5b88f, ocean: 0x416f84, gold: 0xffd27a };
export const DISTRICTS = [
  { name: 'Palm Row', x: -95, z: -88 }, { name: 'Marina Strip', x: 0, z: 10 },
  { name: 'Old Harbor', x: 80, z: -80 }, { name: 'Neon Mile', x: 90, z: 92 },
  { name: 'Sunset Causeway', x: -15, z: 142 }
];
export const CARS = [
  { name: 'SOLSTICE GT', color: 0xf27037, speed: 56, class: 'SPORT' },
  { name: 'TIDELINE S', color: 0x34b5aa, speed: 31, class: 'COUPE' },
  { name: 'SANDPIPER XL', color: 0xd9c59d, speed: 26, class: 'PICKUP' },
  { name: 'VIOLET HOUR', color: 0x8560ad, speed: 34, class: 'SEDAN' },
  { name: 'CLOUDLINE', color: 0xe8e9e2, speed: 25, class: 'VAN' }
];
export const POLICE_UNITS = [
  { name: 'PELICAN-12', mode: 'RAMMING' }, { name: 'HERON-7', mode: 'PURSUIT' }, { name: 'OSPREY-3', mode: 'ROADBLOCK' }
];
export const JOBS = [
  { chapter:'CH 01 — AFTERGLOW', name:'Afterglow', objective:'Keep Mira moving. Meet Dario at the Marina Strip.', stage:3, reward:850, next:'Glass Harbor', dialog:'Two units on our tail. Keep us by the water!' },
  { chapter:'CH 02 — GLASS HARBOR', name:'Glass Harbor', objective:'Walk the Marina Strip and find Dario’s marker.', stage:3, reward:1200, next:'Open Channel', dialog:'Dario says the harbor lights are still ours.' },
  { chapter:'CH 03 — OPEN CHANNEL', name:'Open Channel', objective:'Hold the Sunset Causeway. Lose the LBPD tail.', stage:3, reward:1650, next:'Low Tide', dialog:'Keep the channel clear until the signal fades.' },
  { chapter:'CH 04 — LOW TIDE', name:'Low Tide', objective:'Recover the sealed case from the old seawall.', stage:3, reward:2250, next:'Paper Moon', dialog:'The tide is turning. Take the service road.' },
  { chapter:'CH 05 — PAPER MOON', name:'Paper Moon', objective:'Deliver Mira’s ledger before the night market closes.', stage:3, reward:2900, next:'Saltwater Saints', dialog:'The names in that book can change everything.' },
  { chapter:'CH 06 — SALTWATER SAINTS', name:'Saltwater Saints', objective:'Reach the lighthouse before the second patrol.', stage:3, reward:3550, next:'Blue Hour', dialog:'I can see the beacon. Just one more stretch.' },
  { chapter:'CH 07 — BLUE HOUR', name:'Blue Hour', objective:'Cross Neon Mile and meet the crew at first light.', stage:3, reward:4300, next:'Last Light', dialog:'Blue hour is our window. Keep moving.' },
  { chapter:'CH 08 — LAST LIGHT', name:'Last Light', objective:'Bring the crew home along the open coast.', stage:3, reward:5000, next:'Free Roam', dialog:'We made it to the other side, Leo.' }
];
export const RADIO = [ { station:'LUMEN FM 96.3', song:'Sunset Static' }, { station:'COASTLINE 88.4', song:'Amber Frequency' } ];
export const OPENING = { chapter:'CH 01 — AFTERGLOW', objective:'Keep Mira moving. Meet Dario at the Marina Strip.', next:'Find the boardwalk entrance', dialog:'Two units on our tail. Keep us by the water!' };
