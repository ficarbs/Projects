'use strict';
// ===== story, NPCs, title, intro, ending, menus, save =====
const SAVEKEY='digitaldawn_v1';
function save(){try{localStorage.setItem(SAVEKEY,JSON.stringify({map:G.map,x:G.x,y:G.y,dir:G.dir,party:G.party,items:G.items,bits:G.bits,flags:G.flags}))}catch(e){}}
function hasSave(){try{return!!localStorage.getItem(SAVEKEY)}catch(e){return false}}
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SAVEKEY));Object.assign(G,s);return true}catch(e){return false}}
const lvNew=()=>Math.max(3,G.party[0].lv-1);
function place(){pl.mv=0;let bx=G.x-DV[G.dir][0],by=G.y-DV[G.dir][1];if(!walkable(bx,by)){bx=G.x;by=G.y}pl.fx=bx;pl.fy=by;pl.fox=bx;pl.foy=by;pl.fdir=G.dir==1?1:0;setAmb();applyFlags()}
function applyFlags(){for(const m of Object.values(MAPS))for(const n of m.npcs)if(n.flag&&G.flags[n.flag])n.hide=true}

// ---------- NPCs ----------
function setupNpcs(){
  const town=MAPS.town,forest=MAPS.forest,cave=MAPS.cave,tower=MAPS.tower;
  town.npcs=[
   {x:12,y:7,k:'elder',dir:0,get mark(){return!G.flags.met||(G.flags.crest&&!G.flags.gate)},talk:elderTalk},
   {x:8,y:4,k:'inn',dir:0,talk:innTalk},{x:18,y:4,k:'shop',dir:0,talk:shopTalk},
   {x:5,y:8,k:'girl',dir:0,talk:async()=>say(G.flags.gate?['PIXIE|THE SUNRISE... IT HASN\'T LOOPED SINCE YOU CAME.','PIXIE|PLEASE COME BACK SAFE!']:['PIXIE|DID YOU NOTICE? THE SUNRISE HAS HAPPENED NINE TIMES TODAY.','PIXIE|TIME KEEPS LOOPING. EACH RESET, THE NULL TIDE GETS CLOSER.'])},
   {x:22,y:13,k:'boy',dir:0,talk:async()=>say(['BYTE|DO YOU HEAR THE HUM AT NIGHT? THE NULL TIDE SINGS.','BYTE|MY MOM SAYS IT\'S LONELY. LIKE SOMEONE CALLING A NAME NOBODY ANSWERS.'])},
   {x:16,y:11,k:'sleuth',dir:0,talk:async()=>say(['HEX|NAME\'S HEX. I USED TO CHASE HACKERS IN THE OUTSIDE WORLD.','HEX|NOW I CHASE GHOSTS IN THE NET. SAME JOB, WEIRDER CASES.','HEX|THE CASE: SOMEONE IS DELETING PIXELIA ON PURPOSE. NOT A BUG. A GRIEF.'])}];
  forest.npcs=[
   {x:19,y:8,c:'aquabit',flag:'aqua',dir:0,mark:true,talk:async n=>{
     await say(['AQUABIT|OH! A TAMER! PLEASE... THE NULL TIDE DRANK MY POND. ONLY THIS PUDDLE IS LEFT.','KAI|WE\'RE GOING TO STOP IT. WILL YOU COME WITH US?','AQUABIT|I... I\'D LIKE THAT. MY HEALING MIST IS YOURS!']);
     G.party.push(mkMember('aquabit',lvNew()));G.flags.aqua=1;n.hide=true;sfx('level');await say('AQUABIT JOINED YOUR TEAM!')}},
   {x:22,y:20,c:'sprigmon',flag:'sprig',dir:0,mark:true,talk:async n=>{
     await say(['SPRIGMON|HEY! THAT ROCK GUARD STOLE MY SUNLEAF!','SPRIGMON|BEAT HIM, TAMER, AND I\'LL FOLLOW YOU ANYWHERE!','ROCK GUARD|GRRRMMMM... (THE GUARD LUMBERS TOWARD YOU.)']);
     const r=await battle([mkFoe('guard')],{bg:'forest',mus:'boss',boss:1,intro:'THE ROCK GUARD BLOCKS THE WAY!'});
     if(r=='lose'){await gameOver();return}
     await say('SPRIGMON|WOOHOO! YOU\'RE STRONG! I\'M COMING WITH YOU!');G.party.push(mkMember('sprigmon',lvNew()));G.flags.sprig=1;n.hide=true;
     const g=forest.npcs.find(x=>x.k=='guard');if(g)g.hide=true;sfx('level');await say('SPRIGMON JOINED YOUR TEAM!');await postBattle()}},
   {x:24,y:20,c:'rockmon',flag:'sprig',flip:true,k:'guard',dir:0,talk:async()=>say('ROCK GUARD|GRRRMMM...')}];
  cave.npcs=[{x:30,y:6,c:'wraith',flag:'crest',aura:1,dir:0,mark:true,talk:async n=>{
    await say(['GLITCHWRAITH|...TAMER. YOUR SCENT... IT\'S FAMILIAR. LIKE THE OLD DAYS.','GLITCHWRAITH|I GUARD THE DAWN CREST FOR MY LORD. NO ONE TAKES IT.','EMBERMON|WE\'RE TAKING IT! KAI, READY?']);
    const f=mkFoe('wraith');f.half=async e=>{B.aura=1;flash('#ff62b8',10);B.shake=6;await banner('THE WRAITH SHRIEKS! STATIC TEARS THE AIR!',50);e.u.atk+=8;e.u.spd+=3;};
    const r=await battle([f],{bg:'cave',mus:'boss',boss:1,intro:'THE GLITCHWRAITH RISES FROM THE STATIC!'});
    if(r=='lose'){await gameOver();return}
    await say(['GLITCHWRAITH|...THE CREST IS YOURS. BUT KNOW THIS, TAMER.','GLITCHWRAITH|THE SOVEREIGN REMEMBERS A SMALL BOY, A HANDHELD, AND A PROMISE.','GLITCHWRAITH|"I\'LL COME BACK TOMORROW," HE SAID. HE NEVER DID.','KAI|...I FEEL LIKE I\'VE HEARD THAT BEFORE.','GLITCHWRAITH|FORGIVE HIM, IF YOU CAN.']);
    G.flags.crest=1;n.hide=true;sfx('level');await say('GOT THE DAWN CREST!  IT GLOWS WARMLY.');save();await postBattle()}}];
  tower.npcs=[
   {x:12,y:31,c:'crest',dir:0,aura:1,mark:true,talk:async()=>{await say('A DATA WELL HUMS SOFTLY. ITS LIGHT MENDS YOUR TEAM.');sfx('heal');G.party.forEach(m=>{m.hp=mhp(m);m.mp=mmp(m)});save()}},
   {x:12,y:5,c:'sovereign',flag:'sov',aura:1,dir:0,mark:true,talk:async n=>{await finalBoss()}}];
  MAPS.town.ev={};
}
async function elderTalk(){const F=G.flags;
  if(!F.met){await say(['ELDER BYTESWORTH|AH. A TAMER FROM THE OUTSIDE. THE LOGS SPOKE OF YOU, KAI.','ELDER BYTESWORTH|THE NULL TIDE ERASES ALL DATA IT TOUCHES. IT RISES FROM THE NULL TOWER.','ELDER BYTESWORTH|THE TOWER IS SEALED. ONLY THE DAWN CREST CAN OPEN IT - HIDDEN IN THE GLITCH CAVERN, BEYOND FERNWIRE FOREST.','ELDER BYTESWORTH|YOU\'LL NEED ALLIES. TWO BITLINGS WANDER THE FOREST: AQUABIT AND SPRIGMON.','KAI|UNDERSTOOD! LET\'S GO, EMBERMON!','EMBERMON|RIGHT BEHIND YOU, PARTNER!']);F.met=1;G.items.potion+=2;sfx('ok');await say('GOT 2 POTIONS!')}
  else if(F.crest&&!F.gate){await say(['ELDER BYTESWORTH|THE DAWN CREST... IT\'S WARM. KAI, THERE IS SOMETHING I NEVER TOLD YOU.','ELDER BYTESWORTH|THE NULL TIDE IS NOT A MONSTER. IT IS A PARTNER LEFT BEHIND - FORGOTTEN WHEN ITS TAMER LOGGED OUT FOR THE LAST TIME.','ELDER BYTESWORTH|IT CALLS ITSELF THE SOVEREIGN. IT IS ERASING EVERYTHING SO NOTHING CAN BE LEFT BEHIND AGAIN.','KAI|...THAT\'S SO SAD. BUT WE CAN\'T LET IT DELETE PIXELIA.','ELDER BYTESWORTH|THE TOWER GATE IS OPEN, SOUTH OF TOWN. REST AT THE INN FIRST.']);F.gate=1;sfx('warp');save()}
  else if(F.gate)await say('ELDER BYTESWORTH|THE TOWER AWAITS. BELIEVE IN YOUR BOND, KAI.');
  else if(G.party.length<3)await say('ELDER BYTESWORTH|FIND AQUABIT AND SPRIGMON IN FERNWIRE FOREST, EAST OF TOWN.');
  else await say('ELDER BYTESWORTH|THE GLITCH CAVERN LIES PAST THE FOREST. BE CAREFUL.')}
async function innTalk(){await say('INNKEEPER|WELCOME TO THE DATA INN! A FULL RESTORE AND SAVE FOR TAMERS - FREE OF CHARGE. REST?');
  const r=await menu(['YES','NO'],200,100,{w:50});if(r!=0){await say('INNKEEPER|COME BACK ANYTIME!');return}
  await fade(1,16);sfx('heal');G.party.forEach(m=>{m.hp=mhp(m);m.mp=mmp(m)});await wait(30);save();await fade(0,16);await say('INNKEEPER|YOU LOOK REFRESHED. GAME SAVED!')}
async function shopTalk(){await say('MERCHANT|WELCOME! BITS FOR POTIONS AND ETHERS, PIXEL-FRESH!');
  const u={draw(){box(150,4,100,18);tx('BITS '+G.bits,158,9,'#ffd83c')}};uis.push(u);let c=0;
  while(true){const r=await menu(['POTION  20','ETHER   30','LEAVE'],150,26,{c,w:100});c=Math.max(0,r);if(r<0||r==2)break;const k=r==0?'potion':'ether',p=ITEMS[k].price;
    if(G.bits>=p){G.bits-=p;G.items[k]++;sfx('ok')}else sfx('no')}
  uis.splice(uis.indexOf(u),1);await say('MERCHANT|COME AGAIN!')}
async function finalBoss(){const n=MAPS.tower.npcs.find(x=>x.k!=='well'&&x.c=='sovereign');
  await say(['SOVEREIGN|...SO. A TAMER COMES TO THE END OF THE WORLD.','SOVEREIGN|I WAS ONCE A SMALL THING. A BETA-TEST PARTNER. A LITTLE NULLBIT.','SOVEREIGN|MY TAMER SAID "I\'LL COME BACK TOMORROW." I WAITED 3,652 TOMORROWS.','KAI|...WAIT. THE BETA TEST. I WAS EIGHT. I HAD A PARTNER... I NEVER EVEN SAID GOODBYE.','SOVEREIGN|YOU REMEMBER NOW. TOO LATE. IF EVERYTHING IS ERASED, NOTHING CAN BE LEFT BEHIND AGAIN!','EMBERMON|KAI, HE\'S NOT EVIL - HE\'S HURT. WE HAVE TO REACH HIM!']);
  const f=mkFoe('sov');f.half=async e=>{B.aura=1;flash('#ff62b8',14);B.shake=8;await say(['SOVEREIGN|NO... NO! I WILL NOT BE FORGOTTEN AGAIN!','EMBERMON|WE WON\'T FORGET YOU! NOT EVER!','KAI|NULLBIT! I\'M HERE! I\'M NOT LOGGING OUT!']);e.u.atk=Math.round(e.u.atk*1.2);e.u.hp=Math.min(e.u.mhp,e.u.hp+160);floatTxt(cen(e)[0],cen(e)[1]-20,'+160','#9dff9d');await banner('THE SOVEREIGN\'S POWER SURGES!',40)};
  const r=await battle([f],{bg:'tower',mus:'boss',boss:1,intro:'THE NULL SOVEREIGN STANDS AT THE END OF TIME!'});
  if(r=='lose'){await gameOver();return}
  await ending()}

// ---------- menus ----------
async function worldMenu(){sfx('ok');let c=0;
  const u={draw(){box(150,88,100,34);tx('BITS '+G.bits,158,94,'#ffd83c');tx('TEAM LV '+G.party[0].lv,158,106,'#9ad0ff')}};uis.push(u);
  while(true){const r=await menu(['ITEMS','TEAM','SAVE','SOUND '+(AU.muted?'OFF':'ON'),'CLOSE'],150,8,{c,w:100});c=Math.max(0,r);if(r<0||r==4)break;
    if(r==0)await itemMenu();else if(r==1)await teamView();else if(r==2){save();await say('GAME SAVED!')}else AU.muted=!AU.muted}
  uis.splice(uis.indexOf(u),1)}
async function itemMenu(){while(true){const ks=Object.keys(ITEMS);const r=await menu(ks.map(k=>({t:ITEMS[k].n.padEnd(8)+'X'+G.items[k],d:!G.items[k]})),60,30,{w:130});if(r<0)return;
  const k=ks[r],m=await menu(G.party.map(p=>({t:SP[p.sp].n.padEnd(10)+p.hp+'/'+mhp(p)})),60,30,{w:150});if(m<0)continue;const p=G.party[m];
  if(k=='potion'){if(p.hp>=mhp(p)){sfx('no');continue}p.hp=Math.min(mhp(p),p.hp+60);G.items.potion--;sfx('heal')}else{if(p.mp>=mmp(p)){sfx('no');continue}p.mp=Math.min(mmp(p),p.mp+20);G.items.ether--;sfx('heal')}}}
async function teamView(){let i=0;const u={draw(){const m=G.party[i],d=SP[m.sp];box(8,8,240,208);tx('< '+d.n+' >',128-tw('< '+d.n+' >')/2,16,'#ffd83c');
    const im=SPR[m.sp],sc=im.width>30?2:3;ctx.drawImage(im,36,110-im.height*sc/2|0,im.width*sc,im.height*sc);
    const L=[['LEVEL',m.lv],['HP',m.hp+'/'+mhp(m)],['MP',m.mp+'/'+mmp(m)],['ATK',S(m,'atk')],['DEF',S(m,'def')],['SPD',S(m,'spd')],['EXP',m.xp+'/'+need(m)],['TYPE',d.el.toUpperCase()]];
    L.forEach((l,j)=>{tx(l[0],130,36+j*12,'#9ad0ff');tx(l[1],180,36+j*12)});tx('MOVES',20,150,'#ffd83c');
    mvs(m).forEach((k,j)=>{tx(MV[k].n,20+(j%2)*112,164+(j>>1)*12);});tx('< > CHANGE   X BACK',128-tw('< > CHANGE   X BACK')/2,200,'#7880a8')}};
  uis.push(u);keyq.length=0;while(true){const k=await key();if(k=='no')break;if(k=='left'){i=(i+G.party.length-1)%G.party.length;sfx('blip')}if(k=='right'){i=(i+1)%G.party.length;sfx('blip')}}uis.splice(uis.indexOf(u),1)}

// ---------- title ----------
const tt={stage:0};
function drawTitle(){const t=T;nightSky(ctx);
  for(let i=0;i<70;i++){const x=hash(i,1)*256|0,y=hash(i,2)*120|0;if((t+i*9)%70<55)R(x,y,1,1,i%5?'#fff':'#ffd83c')}
  for(let i=0;i<14;i++){const x=(hash(i,9)*256|0),y=((t*.6+hash(i,4)*224+i*30)%224)|0;tx(hash(i,t>>5)>.5?'1':'0',x,y,'#1c6a90',null)}
  // moon
  for(let y=-16;y<=16;y++)for(let x=-16;x<=16;x++)if(x*x+y*y<=256)R(200+x,44+y,1,1,(x*x+y*y)>225?'#f0e0ff':(hash(x,y)>.93?'#c8b8e8':'#fff6f0'));
  // tower
  R(58,86,10,60,'#140a2c');R(56,82,14,6,'#1c0f40');R(60,70,6,14,'#140a2c');R(62,62,2,10,'#140a2c');const gl=(Math.sin(t*.05)+1)/2;R(61,90,4,4,gl>.5?'#ff62b8':'#a030b0');R(61,110,4,4,'#5ce0f4');
  for(let i=0;i<5;i++)R(63-Math.sin(t*.04+i)*3,52-i*9|0,2,2,'#ff62b8');
  // hills
  for(let x=0;x<256;x++){const h=130+Math.sin(x*.03)*10+Math.sin(x*.09)*4;R(x,h|0,1,100,'#1c0f40')}
  for(let x=0;x<256;x++){const h=152+Math.sin(x*.045+2)*7;R(x,h|0,1,100,'#241650')}
  for(let x=0;x<256;x++){const h=176+Math.sin(x*.05+1)*4;R(x,h|0,1,100,'#10402c');if(x%5==0)R(x,h-2|0,1,2,'#2f8a4a')}
  dither(ctx,0,170,256,6,'#241650','#10402c');
  const cs=['embermon','aquabit','sprigmon','blazewyrm'];cs.forEach((k,i)=>{const im=SPR[k],b=((t>>4)+i)&1;ctx.drawImage(im,20+i*38+(k=='blazewyrm'?6:0),186-im.height-b+(i%2?4:0))});
  const gl2=[...Array(7)].map((_,i)=>['#fff6a0','#ffe060','#ffc030','#f08a24','#e85a20','#c03030','#801830'][i]);
  txs('DIGITAL',46,14,4,gl2,'#1a0830');txs('DAWN',59,46,6,gl2,'#1a0830');
  const sub='PIXELIA CHRONICLES';tx(sub,128-tw(sub)/2,96,'#5ce0f4');
  if(tt.stage==0&&(t>>5)%2==0)tx('PRESS Z OR ENTER',128-tw('PRESS Z OR ENTER')/2,132,'#fff');
  tx('M: MUTE   ARROWS/WASD MOVE   Z OK   X MENU',128-tw('M: MUTE   ARROWS/WASD MOVE   Z OK   X MENU')/2,212,'#7880a8')}
async function titleFlow(){scene='title';tt.stage=0;music('dawn');keyq.length=0;
  while(true){tt.stage=0;let k;do k=await key();while(k!='ok'&&!tt.abort);if(tt.abort)return;tt.stage=1;
    const r=await menu(['NEW GAME',{t:'CONTINUE',d:!hasSave()}],86,128,{w:84});
    if(r==0){await newGame();return}if(r==1){await fade(1,14);loadSave();G.map=G.map||'town';scene='world';place();music(curMap().mus);await fade(0,14);return}}}

// ---------- intro ----------
const ib={lines:['DAWNBIT','ONLINE','','',''],glitch:0,t:0};
function drawIntro(){const t=++ib.t;R(0,0,W,H,'#0a0614');for(let y=0;y<H;y+=2)R(0,y,W,1,'#0e081c');
  const g=ib.glitch;const ox=g?Math.round((Math.random()-.5)*g):0;
  R(84+ox,34,88,128,'#1a0a2a');R(86+ox,36,84,124,'#7a3cb0');R(86+ox,36,84,3,'#b070e0');R(86+ox,157,84,3,'#4a2070');R(84+ox,40,2,116,'#2a1040');
  R(94+ox,46,68,62,'#10081c');R(96+ox,48,64,58,'#1c3a2c');R(96+ox,48,64,2,'#2c5a44');
  ib.lines.forEach((l,i)=>tx(l,128-tw(l)/2+ox,54+i*11,i==4&&ib.count!=null&&ib.count<4&&(t>>3)%2?'#ff4050':'#9dff9d',null));
  R(102+ox,122,6,18,'#10081c');R(98+ox,128,14,6,'#10081c');R(104+ox,124,2,14,'#3a2a5a');R(100+ox,130,10,2,'#3a2a5a');
  R(138+ox,126,10,10,'#e23a3a');R(150+ox,120,10,10,'#3f7ae8');R(140+ox,128,6,6,'#ff6a6a');R(152+ox,122,6,6,'#7aa0ff');
  for(let i=0;i<4;i++)R(112+i*8+ox,146,2,8,'#4a2070');
  const gl=(Math.sin(t*.05)+1)/2;for(let i=0;i<20;i++){const a=i*.9+t*.02;R(128+Math.cos(a)*(70+gl*6)|0,100+Math.sin(a)*(60+gl*6)|0,1,1,'#7a3cb0')}
  if(g){for(let i=0;i<8;i++)R(hash(i,t)*256|0,hash(t,i)*224|0,hash(i,t+1)*60+4,2,i%2?'#ff62b8':'#5ce0f4')}}
async function intro(){scene='cut';cut.draw=drawIntro;music(null);ib.t=0;ib.glitch=0;ib.count=null;ib.lines=['DAWNBIT','ONLINE','','',''];await fade(0,20);
  await say(['KAI|THE LAST NIGHT OF DAWNBIT ONLINE. MY FAVORITE GAME. THE SERVERS DIE AT MIDNIGHT.','KAI|ONE LAST LOGIN, EMBERMON. YOU WERE ALWAYS MY FIRST PARTNER.']);
  ib.lines=['NOTICE','SERVICE','ENDS IN','','00:00:10'];
  for(let n=10;n>=0;n--){ib.count=n;ib.lines[4]='00:00:'+String(n).padStart(2,'0');sfx(n<4?'no':'blip');await wait(26)}
  ib.lines=['ERROR','ERROR','????','',''];ib.glitch=12;sfx('flash');music('sad');await wait(50);
  await say(['KAI|...HUH? THE SCREEN... IT\'S PULLING ME IN?!','???|...AI... KAI... WAKE UP...']);
  ib.glitch=30;for(let i=0;i<20;i++){fade.a=i/20;fade.c='#fff';await frame()}await wait(10);ib.glitch=0}
async function newGame(){Object.assign(G,{map:'town',x:14,y:9,dir:0,party:[mkMember('embermon',3)],items:{potion:3,ether:1},bits:100,flags:{},noenc:8});
  for(const m of Object.values(MAPS))for(const n of m.npcs)n.hide=false;
  await intro();scene='world';place();fade.c='#fff';music(null);await fade(0,40);music('town');
  await say(['EMBERMON|KAI! KAI, WAKE UP! CAN YOU HEAR ME?','KAI|EMBERMON?! YOU\'RE... TALKING? AND YOU\'RE REAL?!','EMBERMON|THIS ISN\'T THE GAME ANYMORE. THIS IS PIXELIA - THE DIGITAL WORLD BEHIND DAWNBIT.','EMBERMON|THE SHUTDOWN NEVER FINISHED. IT BECAME SOMETHING ELSE. THEY CALL IT THE NULL TIDE.','EMBERMON|LET\'S FIND ELDER BYTESWORTH. HE\'LL KNOW WHAT TO DO!','(ARROWS/WASD TO MOVE, Z TO TALK, X FOR MENU)'])}

// ---------- ending ----------
const en={t:0,credits:[],go:0};
function drawEnding(){const t=en.go?++en.t:0;const rise=clamp(t/500,0,1);const cols=['#0e0a30','#2c2070','#6a3a98','#c0609a','#f08a70','#ffc080','#ffe8a0'];
  const k=Math.floor(rise*3);const sky=cols.slice(k,k+5);banded(ctx,sky,0,150);
  const sy=150-rise*78;for(let y=-14;y<=14;y++)for(let x=-14;x<=14;x++)if(x*x+y*y<=196)R(128+x,sy+y|0,1,1,x*x+y*y>150?'#ffb060':'#fff2c0');
  for(let i=0;i<50;i++){if(rise<.6)R(hash(i,1)*256|0,hash(i,2)*90|0,1,1,'#fff')}
  for(let i=0;i<5;i++){const bx=(t*.6+i*70)%300-20,by=40+i*9+Math.sin(t*.1+i)*3;R(bx,by,3,1,'#2c2440');R(bx+3,by-1,2,1,'#2c2440')}
  for(let x=0;x<256;x++){const h=148+Math.sin(x*.04)*7;R(x,h|0,1,80,'#183a3a')}
  for(let x=0;x<256;x++){const h=168+Math.sin(x*.06+1)*4;R(x,h|0,1,60,'#2a6a3a');if(x%4==0)R(x,h-2|0,1,2,'#56c250')}
  const row=[['hero','f'],['embermon'],['aquabit'],['sprigmon'],['nullbit']];
  ctx.drawImage(SPR.hero.f[0],70,178-17-((t>>5)&1));
  [['blazewyrm',96],['aquabit',132],['sprigmon',160],['nullbit',192]].forEach(([k,x],i)=>{const im=SPR[k];ctx.drawImage(im,x-(k=='blazewyrm'?6:0),184-im.height-((t>>4)+i&1))});
  for(let i=0;i<24;i++)R(hash(i,5)*256|0,(hash(i,6)*200+t*.3*(i%3+1))%224|0,1,1,'#ffe8a0');
  if(t>560){const y0=224-(t-560)*.35;en.credits.forEach((c,i)=>{const y=y0+i*14;if(y>-8&&y<230)tx(c,128-tw(c)/2,y|0,c[0]=='*'?'#ffd83c':'#fff')})}}
async function ending(){busy++;await fade(1,20);scene='cut';cut.draw=drawEnding;en.t=0;en.go=0;
  en.credits=['*DIGITAL DAWN','*PIXELIA CHRONICLES','','EVERY PIXEL HAND-PLACED','SPRITES  TILES  VFX  MUSIC','ALL DRAWN AND COMPOSED IN CODE','','AN ORIGINAL STORY','INSPIRED BY THE DIGITAL MONSTER','ADVENTURES - WORLD 3, CYBER','SLEUTH AND TIME STRANGER','','KAI AND EMBERMON','AQUABIT  SPRIGMON','AND NULLBIT','','THANK YOU FOR PLAYING','','TOMORROW IS A PROMISE.','KEEP IT.'];
  music('sad');await fade(0,20);
  await say(['SOVEREIGN|...KAI. YOU CAME BACK.','KAI|I\'M SORRY I LEFT YOU, NULLBIT. I WAS A KID. I THOUGHT YOU WERE JUST DATA.','NULLBIT|I WAS. BUT YOU GAVE ME A NAME. THAT MADE ME SOMEONE.','KAI|THEN COME WITH US. NO MORE TOMORROWS ALONE.','NULLBIT|...TOMORROW. I LIKE THAT WORD.']);
  music('dawn');sfx('heal');en.go=1;await say(['THE DAWN CREST BLAZED. THE NULL TIDE FADED INTO LIGHT.','PIXELIA REMEMBERED ITS SUNRISE...','AND FOR THE FIRST TIME IN 3,652 DAYS, THE CLOCK MOVED FORWARD.']);
  while(en.t<2050)await frame();await fade(1,40);G.flags.done=1;save();location.reload()}

// ---------- boot ----------
function boot(){buildSprites();buildTiles();buildBG();buildMaps();setupNpcs();setAmb();
  let last=performance.now(),acc=0;const step=1000/60;
  (function loop(now){acc+=Math.min(250,now-last);last=now;while(acc>=step){tick();acc-=step}requestAnimationFrame(loop)})(last);
  titleFlow()}
window.DBG={G,MAPS,battle,evolve,ending,say,mkFoe,mkMember,boot:()=>{},jump(m,x,y){G.map=m;G.x=x;G.y=y;scene='world';place();music(curMap().mus)},
  async newGameFast(){Object.assign(G,{map:'town',x:14,y:9,dir:0,party:[mkMember('embermon',3)],items:{potion:3,ether:1},bits:100,flags:{met:1}});tt.abort=1;keyq.push('x');await wait(3);scene='world';place()},pl,keyq,get scene(){return scene},set scene(v){scene=v},setScene(v){scene=v},ending2:ending};
boot();
