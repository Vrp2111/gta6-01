// Shared world, vehicle, mission and display constants for Lumen Bay.
export const WORLD = { seed: 96321, block: 42, extent: 168, fog: 245, seaX: -48 };
export const PALETTE = { sky: 0xf1a17f, fog: 0xc98884, asphalt: 0x292d38, sand: 0xe8bd91, gold: 0xffc55f, ocean: 0x267e91 };
export const DISTRICTS = [
  { name: 'Palm Row', x: -72, z: -65 }, { name: 'Marina Strip', x: 0, z: -38 },
  { name: 'Old Harbor', x: 72, z: -24 }, { name: 'Neon Mile', x: 30, z: 52 },
  { name: 'Sunset Causeway', x: -34, z: 100 },
];
export const CARS = [
  { name: 'SOLSTICE GT', color: 0xf26d42, speed: 58 },
  { name: 'MARINA COUPE', color: 0x52a8bd, speed: 35 },
  { name: 'HARBOR PICKUP', color: 0xb7a277, speed: 28 },
  { name: 'NEON SEDAN', color: 0x665fa1, speed: 32 },
  { name: 'CAUSEWAY VAN', color: 0xd7d0c2, speed: 25 },
];
export const UNITS = ['PELICAN-12', 'HERON-7', 'OSPREY-3', 'EGRET-9'];
export const JOBS = [
  ['01 / AFTERGLOW', 'Get Mira to the Marina Strip before the tide turns'],
  ['02 / GLASS HARBOR', 'Pick up Dario’s envelope in Old Harbor'],
  ['03 / OPEN CHANNEL', 'Take the causeway and lose the tail'],
  ['04 / NEON WEATHER', 'Meet the crew beneath the mile marker'],
  ['05 / PALM SHADOW', 'Bring the coupe back in one piece'],
  ['06 / LAST FERRY', 'Cross the bay before the gates close'],
  ['07 / LOW TIDE', 'Find the signal along the western beach'],
  ['08 / CITY OF LIGHT', 'Bring the whole crew home'],
];
export const RADIO = [
  { station: 'LUMEN FM 96.3', song: 'Sunset Static' },
  { station: 'PALM RADIO 101.2', song: 'Boardwalk Lights' },
];
export const MISSION = { chapter: 'CH 01 — AFTERGLOW', objective: 'Keep Mira moving. Meet Dario at the Marina Strip.', next: 'Find the boardwalk entrance' };
