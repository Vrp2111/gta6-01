export function createAudio() {
  let context=null,engine=null,siren=null,engineGain=null,sirenGain=null,started=false;
  function start() {
    if(started)return; started=true;
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
    context=new Audio(); engine=context.createOscillator();engine.type='sawtooth';engine.frequency.value=62;engineGain=context.createGain();engineGain.gain.value=.018;engine.connect(engineGain).connect(context.destination);engine.start();
    siren=context.createOscillator();siren.type='square';siren.frequency.value=740;sirenGain=context.createGain();sirenGain.gain.value=0;siren.connect(sirenGain).connect(context.destination);siren.start();
    if(context.state==='suspended')context.resume();
  }
  window.addEventListener('pointerdown',start,{once:true});window.addEventListener('keydown',start,{once:true});
  return {update(speed,pursuit){if(!context)return;engine.frequency.setTargetAtTime(62+Math.abs(speed)*2.25,context.currentTime,.06);sirenGain.gain.setTargetAtTime(pursuit?.012:0,context.currentTime,.12);siren.frequency.setTargetAtTime(620+Math.sin(context.currentTime*7)*170,context.currentTime,.08);},horn(){if(!context)return;const osc=context.createOscillator(),gain=context.createGain();osc.type='sine';osc.frequency.value=390;gain.gain.value=.08;osc.connect(gain).connect(context.destination);osc.start();gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.22);osc.stop(context.currentTime+.23);}};
}
