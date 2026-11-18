// AudioContext is created only after a user gesture; synth loop is optional.
export function createAudio() {
  let context, oscillator, gain;
  const start = () => {
    if (context) return; const Audio = window.AudioContext || window.webkitAudioContext; if (!Audio) return;
    context = new Audio(); oscillator = context.createOscillator(); gain = context.createGain();
    oscillator.type='sawtooth'; oscillator.frequency.value=62; gain.gain.value=.018; oscillator.connect(gain); gain.connect(context.destination); oscillator.start();
  };
  addEventListener('pointerdown',start,{once:true}); addEventListener('keydown',start,{once:true});
  return { update(speed) { if (context && oscillator) oscillator.frequency.setTargetAtTime(52+Math.abs(speed)*2,context.currentTime,.08); }, horn() { start(); if (!context) return; const tone=context.createOscillator(), volume=context.createGain(); tone.frequency.value=390; volume.gain.value=.08; tone.connect(volume); volume.connect(context.destination); tone.start(); tone.stop(context.currentTime+.22); } };
}
