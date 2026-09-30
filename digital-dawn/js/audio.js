'use strict';
// ===== chiptune engine: square/triangle/noise voices via WebAudio =====
const AU={ctx:null,muted:false,track:null,step:0,next:0,vol:.5};
function auInit(){if(AU.ctx)return;try{AU.ctx=new (window.AudioContext||window.webkitAudioContext)();AU.master=AU.ctx.createGain();AU.master.gain.value=AU.vol*.3;AU.master.connect(AU.ctx.destination);
  AU.nb=AU.ctx.createBuffer(1,AU.ctx.sampleRate,AU.ctx.sampleRate);const d=AU.nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  setInterval(auSched,50)}catch(e){}}
const hz=n=>440*Math.pow(2,(n-9)/12); // n semitones above C4... (0=C4)
function voice(type,f,t,dur,v,slide){const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f*slide),t+dur);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g);g.connect(AU.master);o.start(t);o.stop(t+dur+.02)}
function noise(t,dur,v,hp){const c=AU.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=AU.nb;f.type='highpass';f.frequency.value=hp||3000;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur);s.connect(f);f.connect(g);g.connect(AU.master);s.start(t);s.stop(t+dur+.02)}
const _=null;
// patterns: 16th-note steps. numbers = semitones from C4, null = rest
const TRK={
 town:{bpm:108,lead:[12,_,16,_,19,_,16,_,17,_,14,_,17,_,_,_,16,_,12,_,16,_,19,_,21,_,19,_,16,_,_,_,14,_,17,_,21,_,17,_,19,_,16,_,19,_,_,_,17,_,14,_,12,_,14,_,16,_,_,_,_,_,_,_],
  bass:[0,_,7,_,0,_,7,_,5,_,12,_,5,_,12,_,0,_,7,_,0,_,7,_,7,_,14,_,7,_,14,_,2,_,9,_,2,_,9,_,4,_,11,_,4,_,11,_,5,_,12,_,7,_,14,_,0,_,7,_,0,_,_,_],lv:'square',drum:0},
 forest:{bpm:120,lead:[9,_,12,_,16,_,12,_,14,_,11,_,14,_,_,_,9,_,12,_,16,_,19,_,17,_,14,_,12,_,_,_,7,_,11,_,14,_,11,_,12,_,9,_,12,_,_,_,14,_,11,_,7,_,11,_,9,_,_,_,_,_,_,_],
  bass:[-3,_,4,_,-3,_,4,_,-5,_,2,_,-5,_,2,_,-3,_,4,_,-3,_,4,_,-1,_,6,_,-1,_,6,_,-5,_,2,_,-5,_,2,_,-3,_,4,_,-3,_,4,_,-1,_,6,_,-1,_,6,_,-3,_,4,_,-3,_,_,_],lv:'square',drum:0},
 cave:{bpm:84,lead:[9,_,_,_,12,_,_,_,8,_,_,_,11,_,_,_,9,_,12,_,16,_,_,_,15,_,_,_,11,_,_,_,8,_,_,_,11,_,_,_,7,_,_,_,10,_,_,_,9,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  bass:[-15,_,_,_,-15,_,_,_,-16,_,_,_,-16,_,_,_,-15,_,_,_,-15,_,_,_,-17,_,_,_,-17,_,_,_,-15,_,_,_,-15,_,_,_,-16,_,_,_,-16,_,_,_,-15,_,-3,_,-15,_,-3,_,-17,_,_,_,-17,_,_,_],lv:'triangle',drum:0},
 battle:{bpm:156,lead:[9,9,_,12,_,9,_,16,_,14,_,12,_,14,16,_,9,9,_,12,_,9,_,17,_,16,_,14,_,12,_,_,7,7,_,11,_,7,_,14,_,12,_,11,_,12,14,_,16,_,14,_,12,_,11,_,9,_,_,_,_,_,_,_],
  bass:[-3,-3,-15,-3,-3,-15,-3,-15,-3,-3,-15,-3,-3,-15,-3,-15,-3,-3,-15,-3,-3,-15,-3,-15,-1,-1,-13,-1,-1,-13,-1,-13,-5,-5,-17,-5,-5,-17,-5,-17,-5,-5,-17,-5,-5,-17,-5,-17,-3,-3,-15,-3,-3,-15,-3,-15,-1,_,-13,_,-1,_,-13,_],lv:'square',drum:1},
 boss:{bpm:168,lead:[9,_,9,_,21,_,9,_,20,_,9,_,18,_,9,_,9,_,9,_,21,_,9,_,23,_,9,_,21,_,20,_,7,_,7,_,19,_,7,_,18,_,7,_,16,_,7,_,8,_,8,_,20,_,8,_,18,_,17,_,15,_,14,_],
  bass:[-15,-15,-15,-3,-15,-15,-15,-3,-15,-15,-15,-3,-15,-15,-3,-15,-15,-15,-15,-3,-15,-15,-15,-3,-17,-17,-17,-5,-17,-17,-17,-5,-17,-17,-17,-5,-17,-17,-5,-17,-16,-16,-16,-4,-16,-16,-16,-4,-16,-16,-4,-16,-14,-14,-14,-2,-14,-14,-2,-14],lv:'square',drum:1},
 victory:{bpm:150,once:1,lead:[12,12,12,_,12,_,9,_,11,_,12,_,_,_,_,_,16,_,_,_,_,_,_,_],bass:[0,_,0,_,0,_,5,_,7,_,0,_,_,_,_,_,4,_,_,_,_,_,_,_],lv:'square',drum:0},
 sad:{bpm:70,lead:[9,_,_,_,12,_,_,_,14,_,_,_,12,_,_,_,11,_,_,_,9,_,_,_,7,_,_,_,_,_,_,_,9,_,_,_,12,_,_,_,16,_,_,_,14,_,_,_,12,_,_,_,11,_,_,_,9,_,_,_,_,_,_,_],
  bass:[-3,_,_,_,_,_,_,_,-5,_,_,_,_,_,_,_,-7,_,_,_,_,_,_,_,-3,_,_,_,_,_,_,_,-3,_,_,_,_,_,_,_,-1,_,_,_,_,_,_,_,-5,_,_,_,_,_,_,_,-3,_,_,_,_,_,_,_],lv:'triangle',drum:0},
 dawn:{bpm:96,lead:[12,_,16,_,19,_,24,_,23,_,19,_,16,_,19,_,17,_,21,_,24,_,28,_,26,_,24,_,21,_,_,_,19,_,23,_,26,_,31,_,28,_,26,_,23,_,_,_,24,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  bass:[0,_,_,_,7,_,_,_,5,_,_,_,12,_,_,_,7,_,_,_,14,_,_,_,9,_,_,_,16,_,_,_,0,_,_,_,7,_,_,_,5,_,_,_,12,_,_,_,0,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],lv:'square',drum:0}};
function music(name){if(AU.trackName===name)return;AU.trackName=name;AU.track=name?TRK[name]:null;AU.step=0;if(AU.ctx)AU.next=AU.ctx.currentTime+.05}
function auSched(){const c=AU.ctx;if(!c||!AU.track||AU.muted)return;const T=AU.track,sd=60/T.bpm/4;
  if(AU.next<c.currentTime)AU.next=c.currentTime+.02;
  while(AU.next<c.currentTime+.2){const i=AU.step%T.lead.length,l=T.lead[i],b=T.bass[i%T.bass.length];
    if(l!=null)voice('square',hz(l),AU.next,sd*2.2,.22);
    if(b!=null)voice(T.lv,hz(b),AU.next,sd*2.4,.35);
    if(T.drum){if(i%4==0)voice('sine',120,AU.next,.12,.6,.3);if(i%2==1)noise(AU.next,.04,.18);if(i%8==4)noise(AU.next,.12,.3,1800)}
    AU.step++;AU.next+=sd;
    if(T.once&&AU.step>=T.lead.length){AU.track=null;AU.trackName=null;break}}}
function sfx(name){const c=AU.ctx;if(!c||AU.muted)return;const t=c.currentTime;
  switch(name){
   case'blip':voice('square',880,t,.05,.2);break;
   case'ok':voice('square',660,t,.05,.22);voice('square',990,t+.05,.07,.22);break;
   case'no':voice('square',180,t,.12,.25);break;
   case'step':noise(t,.02,.05,800);break;
   case'hit':noise(t,.15,.5,600);voice('square',160,t,.15,.35,.4);break;
   case'crit':noise(t,.25,.6,400);voice('sawtooth',300,t,.25,.3,.3);break;
   case'fire':noise(t,.4,.35,1000);voice('sawtooth',400,t,.35,.2,.3);break;
   case'bolt':for(let i=0;i<6;i++)voice('square',1800-i*200,t+i*.03,.04,.25);noise(t,.2,.4,2000);break;
   case'water':for(let i=0;i<5;i++)voice('sine',900+Math.random()*600,t+i*.05,.1,.25,1.5);break;
   case'leaf':for(let i=0;i<6;i++)voice('triangle',500+i*120,t+i*.04,.08,.3);break;
   case'void':for(let i=0;i<8;i++)voice('sawtooth',100+Math.random()*900,t+i*.03,.06,.22);break;
   case'heal':[0,4,7,12].forEach((n,i)=>voice('triangle',hz(n+12),t+i*.07,.15,.3));break;
   case'slash':noise(t,.1,.4,4000);voice('sawtooth',1200,t,.1,.15,.3);break;
   case'die':voice('sawtooth',400,t,.5,.3,.1);noise(t,.5,.3,500);break;
   case'level':[0,4,7,12,16].forEach((n,i)=>voice('square',hz(n+12),t+i*.08,.14,.25));break;
   case'evolve':for(let i=0;i<24;i++)voice('square',hz(i*2+4),t+i*.1,.15,.22);break;
   case'flash':noise(t,.6,.5,300);break;
   case'warp':voice('sine',300,t,.4,.3,3);break;
  }}
addEventListener('keydown',e=>{auInit();if(AU.ctx&&AU.ctx.state=='suspended')AU.ctx.resume();if(e.key=='m'||e.key=='M'){AU.muted=!AU.muted}},{once:false});
