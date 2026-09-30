'use strict';
// ===== turn-based battles with pixel VFX =====
let B=null;const parts=[],fxs=[],floats=[],cells=new Map();
const flipC=new Map();const flipped=c=>{let f=flipC.get(c);if(!f){f=mk(c.width,c.height,g=>{g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0)});flipC.set(c,f)}return f};
const SLOT=[[[72,104],[44,118],[98,130]],[[184,104],[212,118],[158,130]]];
const nameOf=e=>e.side?e.u.n:SP[e.u.sp].n;
const st=(e,k)=>e.side?e.u[k]:S(e.u,k);
const hpOf=e=>e.u.hp,mhpOf=e=>e.side?e.u.mhp:mhp(e.u);
const elOf=e=>e.side?e.u.el:SP[e.u.sp].el;
const alive=s=>B.ents.filter(e=>e.side==s&&e.u.hp>0);
const imgOf=e=>SPR[e.side?e.u.spr:e.u.sp];
const cen=e=>{const im=imgOf(e);return[e.x+e.ox,e.y-im.height/2]};
function mkFoe(k,sc=1,pre=''){const d=ENY[k];return{n:pre+d.n,spr:(pre?'n_':'')+d.spr,el:d.el,hp:Math.round(d.hp*sc),mhp:Math.round(d.hp*sc),atk:Math.round(d.atk*(1+(sc-1)*.6)),def:Math.round(d.def*(1+(sc-1)*.6)),spd:d.spd,moves:d.moves,xp:Math.round(d.xp*sc*.9),bits:Math.round(d.bits*sc)}}
const ZONES={forest:()=>{const k=pick(['gelbit','gelbit','bitbat','sparkfox']);return mkFoe(k)},
 cave:()=>{const k=pick(['gelbit','bitbat','sparkfox','rockmon','rockmon']);return mkFoe(k,k=='rockmon'?1:1.7)},
 tower:()=>{const k=pick(['gelbit','bitbat','sparkfox','rockmon']);return mkFoe(k,k=='rockmon'?1.5:2.6,'NULL ')}};
async function randomBattle(){const z=curMap().enc;const n=1+(Math.random()<.5?1:0)+(G.party.length>2&&Math.random()<.45?1:0);
  const foes=[];for(let i=0;i<Math.min(3,n);i++)foes.push(ZONES[z]());
  const r=await battle(foes,{bg:curMap().bg,mus:'battle'});if(r=='lose')await gameOver();else await postBattle()}
// ---------- particles & fx ----------
function burst(x,y,n,cols,sp,life,grav=.05,size=2){for(let i=0;i<n;i++){const a=Math.random()*6.283,s=Math.random()*sp;
  parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:life*(.6+Math.random()*.6),max:life,c:pick(cols),g:grav,s:size})}}
function addFx(dur,draw){return new Promise(res=>fxs.push({t:0,dur,draw,res}))}
function floatTxt(x,y,s,c){floats.push({x,y,s,c,t:0})}
const FIRE=['#fff6a0','#ffd83c','#f08a24','#e23a3a'],WATER=['#ffffff','#9ad0ff','#3f7ae8','#5ce0f4'],LEAF=['#d8ff90','#56c250','#2d8040','#ffffff'],VOID=['#ff62b8','#5ce0f4','#a858e0','#ffffff'],BOLT=['#ffffff','#ffef60','#5ce0f4'];
const line=(x0,y0,x1,y1,c,w=1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0;for(let i=0;i<=n;i++)R(x0+(x1-x0)*i/n-w/2|0,y0+(y1-y0)*i/n-w/2|0,w,w,c)};
async function projectile(a,b,n,draw,trail){await addFx(n,(t)=>{const k=t/n,x=a[0]+(b[0]-a[0])*k,y=a[1]+(b[1]-a[1])*k-Math.sin(k*Math.PI)*10;draw(x,y,t);if(trail&&t%1==0)burst(x,y,2,trail,.6,14,-.02,2)})}
const FX={
 async fire(att,tg,mv){sfx('fire');const a=cen(att);for(const t of tg){const b=cen(t);
   await projectile(a,b,16,(x,y,f)=>{R(x-4,y-4,8,8,'#e23a3a');R(x-3,y-3,6,6,'#f08a24');R(x-2,y-2,4,4,'#ffd83c');R(x-1,y-1,2,2,'#fff');if(f%2)R(x-6,y-1,2,2,'#e23a3a')},FIRE);
   burst(b[0],b[1],36,FIRE,2.4,26,-.03,2);
   addFx(26,(f)=>{for(let i=-8;i<=8;i+=2){const h=(14-Math.abs(i))*(1-f/26)*(.6+hash(i,T>>1)*.6);for(let y=0;y<h;y+=2)R(b[0]+i,b[1]+10-y,2,2,y>h*.65?'#fff6a0':y>h*.35?'#ffd83c':hash(i,y)>.5?'#f08a24':'#e23a3a')}})}
   await wait(20)},
 async claw(att,tg){sfx('slash');for(const t of tg){const b=cen(t);for(let k=0;k<3;k++){await addFx(5,(f)=>{const o=k*6-6,p=f/4;line(b[0]-12+o,b[1]-16,b[0]-12+o+22*p,b[1]-16+32*p,'#5a1010',4);line(b[0]-12+o,b[1]-16,b[0]-12+o+22*p,b[1]-16+32*p,'#fff',2)});
     addFx(8,()=>{line(b[0]-12+k*6-6,b[1]-16,b[0]+10+k*6-6,b[1]+16,'#ffffffaa',1)})}
   burst(b[0],b[1],14,['#fff','#ffd83c','#e23a3a'],2.2,14,.08,2)}await wait(8)},
 async slash(att,tg){sfx('slash');for(const t of tg){const b=cen(t);await addFx(8,(f)=>{const p=Math.min(1,f/4);line(b[0]-16,b[1]-18,b[0]-16+32*p,b[1]-18+36*p,'#ffffff',3);line(b[0]-16,b[1]-18,b[0]-16+32*p,b[1]-18+36*p,'#9ad0ff',1)});
   burst(b[0],b[1],12,['#fff','#9ad0ff'],2,12,.05,2)}await wait(6)},
 async slashfire(att,tg){sfx('fire');for(const t of tg){const b=cen(t);await addFx(10,(f)=>{const p=Math.min(1,f/4);for(let i=0;i<3;i++)line(b[0]-18+i*2,b[1]-20,b[0]-18+i*2+36*p,b[1]-20+40*p,['#e23a3a','#ffd83c','#fff'][i],3-i)});
   burst(b[0],b[1],34,FIRE,2.6,24,-.03,2)}await wait(10)},
 async bolt(att,tg){sfx('bolt');for(const t of tg){const b=cen(t);flash('#fff',3);await addFx(18,(f)=>{let x=b[0]+(hash(f>>1,1)-.5)*10,y=0;const seg=[];while(y<b[1]+8){seg.push([x,y]);x+=(hash(f>>1,y|0)-.5)*14;y+=10}seg.push([b[0],b[1]+8]);
     for(let i=0;i<seg.length-1;i++){line(seg[i][0],seg[i][1],seg[i+1][0],seg[i+1][1],'#ffef60',3);line(seg[i][0],seg[i][1],seg[i+1][0],seg[i+1][1],'#fff',1)}if(f%3==0)R(0,0,256,146,'#ffffff22')});
   burst(b[0],b[1],30,BOLT,3,18,.06,2)}await wait(6)},
 async water(att,tg){sfx('water');const a=cen(att);for(const t of tg){const b=cen(t);
   await addFx(26,(f)=>{for(let i=0;i<7;i++){const k=clamp((f-i*1.5)/14,0,1);if(k<=0||k>=1)continue;const x=a[0]+(b[0]-a[0])*k,y=a[1]+(b[1]-a[1])*k-Math.sin(k*Math.PI)*18+Math.sin(i*2+f)*3;
     R(x-3,y-2,6,4,'#3f7ae8');R(x-2,y-3,4,6,'#3f7ae8');R(x-2,y-2,4,4,'#9ad0ff');R(x-1,y-2,1,1,'#fff')}});
   burst(b[0],b[1],30,WATER,2.4,22,.12,2);addFx(18,(f)=>{const r=f*1.6;for(let a2=0;a2<360;a2+=20){const rd=a2*Math.PI/180;R(b[0]+Math.cos(rd)*r|0,b[1]+10+Math.sin(rd)*r*.4|0,2,1,'#9ad0ff')}})}
   await wait(14)},
 async tidal(att,tg){sfx('water');await addFx(46,(f)=>{const x0=-30+f*7;for(let x=0;x<256;x++){const sx=x0-x;if(sx<0||sx>46)continue;const h=(46-sx)*.9+Math.sin(x*.3+f*.4)*4;for(let y=0;y<h;y+=2)R(x,132-y,1,2,y>h-3?'#ffffff':y>h*.6?'#9ad0ff':'#3f7ae8')}});
   for(const t of tg)burst(cen(t)[0],cen(t)[1],20,WATER,2.4,22,.12,2);await wait(6)},
 async leaf(att,tg){sfx('leaf');for(const t of tg){const b=cen(t);await addFx(28,(f)=>{for(let i=0;i<9;i++){const k=clamp((f-i*1.5)/18,0,1);if(k<=0||k>=1)continue;const ang=i*.9+k*7,r=(1-k)*36;
     const x=b[0]+Math.cos(ang)*r,y=b[1]+Math.sin(ang)*r*.7-4;R(x-1,y-2,3,1,'#2d8040');R(x-2,y-1,5,2,'#56c250');R(x-1,y+1,3,1,'#d8ff90');R(x,y,1,1,'#fff')}});
   for(let k=0;k<2;k++){await addFx(5,(f)=>{line(b[0]-16,b[1]-12+k*12,b[0]+16,b[1]-4+k*12+f,'#d8ff90',2)})}burst(b[0],b[1],24,LEAF,2.6,20,.05,2)}await wait(8)},
 async void(att,tg){sfx('void');for(const t of tg){const b=cen(t),im=imgOf(t);await addFx(30,(f)=>{const w=im.width+8,h=im.height+8;
     for(let i=0;i<12;i++){const x=b[0]-w/2+hash(i,f>>1)*w,y=b[1]-h/2+hash(f>>1,i*7)*h;R(x,y,hash(i,f)*14+3,hash(f,i)*3+1,i%3==0?'#ff62b8':i%3==1?'#5ce0f4':'#a858e0')}
     for(let i=0;i<3;i++){const y=b[1]-h/2+hash(f>>2,i)*h;R(b[0]-w/2,y,w,1,'#ffffff88')}
     const r=(1-f/30)*30;for(let a2=0;a2<360;a2+=12){const rd=a2*Math.PI/180;R(b[0]+Math.cos(rd)*r|0,b[1]+Math.sin(rd)*r|0,2,2,'#a858e0')}});
   t.glitch=12;burst(b[0],b[1],26,VOID,2.6,18,0,2)}B.shake=Math.max(B.shake,4);await wait(8)},
 async heal(att,tg){sfx('heal');for(const t of tg){const b=cen(t),im=imgOf(t);await addFx(34,(f)=>{for(let i=0;i<8;i++){const y=b[1]+im.height/2-((f*1.4+i*9)%im.height),x=b[0]+Math.sin(i*2.1+f*.15)*im.width*.4;
     if(((f+i)>>1)%2){R(x-1,y,3,1,'#9dff9d');R(x,y-1,1,3,'#9dff9d');R(x,y,1,1,'#fff')}else R(x,y,1,1,'#d8ffd8')}
     const r=f*1.1;for(let a2=0;a2<360;a2+=30){const rd=a2*Math.PI/180;R(b[0]+Math.cos(rd)*r|0,b[1]+im.height/2-4+Math.sin(rd)*r*.3|0,2,1,'#9dff9d')}})}await wait(4)}};
function flash(c,n){B&&(B.flash={c,n,m:n})}
// ---------- battle scene ----------
function drawBattle(){if(!B)return;const ox=B.shake>0?Math.round((Math.random()-.5)*B.shake*2):0,oy=B.shake>0?Math.round((Math.random()-.5)*B.shake):0;
  R(0,0,W,H,'#000');ctx.save();ctx.translate(ox,oy);ctx.drawImage(TI.bg[B.bg],0,0);
  if(B.aura){for(let i=0;i<12;i++){R((T*2+i*23)%256,140-((T*1.3+i*17)%120),2,2,i%2?'#ff62b8':'#5ce0f4')}}
  const order=B.ents.slice().sort((a,b)=>a.y-b.y);
  for(const e of order)drawEnt(e);
  for(const p of parts){R(p.x,p.y,p.s*(p.life/p.max>.4?1:.5)|0||1,p.s*(p.life/p.max>.4?1:.5)|0||1,p.c)}
  for(const f of fxs)f.draw(f.t);
  for(const f of floats){const y=f.y-Math.abs(Math.sin(Math.min(f.t,20)*.16))*10-(f.t>20?(f.t-20)*.3:0);tx(f.s,f.x-tw(f.s)/2|0,y|0,f.c,'#1a1030')}
  if(B.flash&&B.flash.n>0){const a=Math.round(B.flash.n/B.flash.m*8).toString(16);R(0,0,256,146,B.flash.c+a+a)}
  if(B.sel){const e=B.sel,[cx]=cen(e),y=e.y-imgOf(e).height-10+((T>>3)&1)*2;R(cx-3,y,7,2,'#fff');R(cx-2,y+2,5,2,'#ffd83c');R(cx-1,y+4,3,2,'#ffd83c');R(cx,y+6,1,1,'#ffd83c')}
  ctx.restore();
  if(B.msg){const w=tw(B.msg)+14;box(128-w/2|0,4,w,18);tx(B.msg,128-w/2+7|0,9)}
  drawPanel()}
function drawEnt(e){if(e.gone)return;const im=imgOf(e),u=e.u;let x=Math.round(e.x+e.ox-im.width/2),y=Math.round(e.y+e.oy-im.height);
  const idle=((T>>4)+e.slot)%2;if(u.hp>0)y-=idle;
  shadow(Math.round(e.x+e.ox),Math.round(e.y+e.oy),Math.min(im.width,36));
  let img=e.side?flipped(im):im;
  if(e.side&&!SYM.has(u.spr))img=flipped(im);else if(e.side)img=im;
  if(e.dis>0){const n=im.height;for(let r=0;r<n;r++){if(hash(r,e.slot+3)<e.dis)continue;const jx=(hash(r,T>>2)-.5)*e.dis*10;ctx.drawImage(img,0,r,im.width,1,x+jx|0,y+r,im.width,1)}return}
  if(u.hp<=0&&!e.side){ctx.drawImage(whiteOf(img,'#30304888'),x,y+im.height/2|0,im.width,im.height/2|0);return}
  if(e.glitch>0&&(T%4<2)){ctx.drawImage(img,x+4,y);ctx.globalAlpha=.6;ctx.drawImage(whiteOf(img,'#ff62b8a0'),x-3,y);ctx.globalAlpha=1;return}
  ctx.drawImage(e.flash>0&&(e.flash%4<2)?whiteOf(img):img,x,y);
  if(e.guard){R(x-2,y+2,1,im.height-4,'#5ce0f4');R(x+im.width+1,y+2,1,im.height-4,'#5ce0f4')}}
const SYM=new Set(['gelbit','bitbat','rockmon','wraith','sovereign','n_gelbit','n_bitbat','n_rockmon','nullbit']);
function drawPanel(){box(0,148,100,76);let i=0;for(const e of B.ents.filter(e=>!e.side)){const y=153+i*23,u=e.u,cur=B.cur===e;
    tx(nameOf(e),8,y,u.hp<=0?'#7880a8':cur?'#ffd83c':'#fff');if(cur&&(T>>3)%2)tx('>',2,y,'#ffd83c');tx(u.hp+'',94-tw(u.hp+''),y,u.hp<=0?'#ff4050':'#9dff9d');
    const m=mhpOf(e),c=u.hp/m>.5?'#56e050':u.hp/m>.2?'#ffd83c':'#ff4050';bar(8,y+9,84,5,u.hp,m,c,'#b8ffb0');
    bar(8,y+15,50,4,u.mp,mmp(u),'#3f7ae8','#9ad0ff');tx(u.mp+'',62,y+14,'#9ad0ff');i++}}
function updBattle(){if(!B)return;if(B.shake>0)B.shake-=.25;if(B.flash&&B.flash.n>0)B.flash.n--;
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;if(--p.life<=0)parts.splice(i,1)}
  for(let i=fxs.length-1;i>=0;i--){const f=fxs[i];if(++f.t>f.dur){fxs.splice(i,1);f.res()}}
  for(let i=floats.length-1;i>=0;i--){if(++floats[i].t>50)floats.splice(i,1)}
  for(const e of B.ents){if(e.flash>0)e.flash--;if(e.glitch>0)e.glitch--;e.ox*=.8;if(Math.abs(e.ox)<.3)e.ox=0;if(e.dying&&e.dis<1){e.dis=Math.min(1,e.dis+.035);if(e.dis>=1)e.gone=1}}}
// ---------- mechanics ----------
function calc(att,mv,tg){const a=st(att,'atk'),d=st(tg,'def')*(tg.guard?2:1);let dmg=(mv.p+a*1.1)*(12/(12+d));const em=mult(mv.el,elOf(tg));dmg*=em;
  const crit=Math.random()<.08;if(crit)dmg*=1.5;dmg*=.9+Math.random()*.2;return{dmg:Math.max(1,Math.round(dmg)),em,crit}}
async function banner(s,n=26){B.msg=s;await wait(n)}
async function hurt(att,tg,mv){const c=calc(att,mv,tg);sfx(c.crit?'crit':'hit');tg.u.hp=Math.max(0,tg.u.hp-c.dmg);tg.flash=12;tg.ox=tg.side?6:-6;B.shake=Math.max(B.shake,c.crit?5:3);
  const[x,y]=cen(tg);floatTxt(x,y-14,''+c.dmg,c.crit?'#ffd83c':c.em>1?'#ff9060':'#fff');
  if(c.em>1)floatTxt(x,y-26,'WEAK!','#ff9060');else if(c.em<1)floatTxt(x,y-26,'RESIST','#9ad0ff');if(c.crit)floatTxt(x,y-26,'CRITICAL!','#ffd83c');
  if(tg.u.hp<=0){sfx('die');if(tg.side){tg.dying=1;tg.dis=.01;const im=imgOf(tg);burst(x,y,36,[...Object.values(PAL).slice(0,6)],2.4,40,-.02,2)}else burst(x,y,14,['#7880a8','#fff'],1.5,30,.04,2)}}
async function doMove(att,mv,tg){await banner(nameOf(att)+' USES '+mv.n+'!',22);if(!att.side)att.u.mp-=mv.mp;
  const list=mv.heal?(mv.all?alive(att.side):[tg.u.hp>0?tg:att]):(mv.all?alive(1-att.side):[tg]);
  await FX[mv.fx](att,list,mv);
  for(const t of list){if(mv.heal){const h=Math.round(mv.p+st(att,'atk')*.6);const m=mhpOf(t);t.u.hp=Math.min(m,t.u.hp+h);floatTxt(cen(t)[0],cen(t)[1]-14,'+'+h,'#9dff9d')}else if(t.u.hp>0)await hurt(att,t,mv)}
  await wait(18);
  for(const f of B.ents.filter(e=>e.side&&e.u.half&&e.u.hp>0&&e.u.hp<=e.u.mhp/2)){const h=f.u.half;f.u.half=null;await h(f)}}
function aiPick(e){const mv=e.u.moves.map(k=>MV[k]);return pick(mv)}
async function chooseAction(e,i,total){B.cur=e;let c=0;
  while(true){const r=await menu(['FIGHT','ITEM','GUARD','RUN'],102,148,{w:58,c,cancel:i>0});c=Math.max(0,r);
    if(r<0)return null;if(r==2)return{t:'guard'};if(r==3)return{t:'run'};
    if(r==0){const ms=mvs(e.u).map(k=>MV[k]);const items=ms.map(m=>({t:m.n.padEnd(14)+(m.mp?('MP'+m.mp):'  -'),d:m.mp>e.u.mp}));
      const pre=ms.map(m=>m);const s=await menu(items,102,148,{w:152,onMove(k){B.tip=k}});if(s<0)continue;const mv=ms[s];
      if(mv.all)return{t:'mv',mv,all:1};
      const side=mv.heal?0:1;const tg=await pickTarget(alive(side),mv.heal);if(!tg)continue;return{t:'mv',mv,tg}}
    if(r==1){const its=Object.keys(ITEMS).filter(k=>G.items[k]>0);if(!its.length){await banner('NO ITEMS!',30);B.msg='';continue}
      const s=await menu(its.map(k=>({t:ITEMS[k].n.padEnd(8)+'X'+G.items[k]})),102,148,{w:110});if(s<0)continue;
      const tg=await pickTarget(B.ents.filter(x=>!x.side),true);if(!tg)continue;return{t:'item',k:its[s],tg}}}}
async function pickTarget(list,ally){let c=0;B.sel=list[0];keyq.length=0;let res=null;
  while(true){B.sel=list[c];B.msg=(ally?'':'TARGET: ')+nameOf(list[c])+'  HP '+list[c].u.hp;const k=await key();
    if(k=='left'||k=='up'){c=(c+list.length-1)%list.length;sfx('blip')}else if(k=='right'||k=='down'){c=(c+1)%list.length;sfx('blip')}
    else if(k=='ok'){sfx('ok');res=list[c];break}else if(k=='no'){sfx('no');break}}
  B.sel=null;B.msg='';return res}
async function useItem(e,a){const t=a.tg;G.items[a.k]--;await banner(nameOf(e)+' USES '+ITEMS[a.k].n+'!',20);
  if(a.k=='potion'){sfx('heal');if(t.u.hp<=0){t.u.hp=1}const h=Math.min(60,mhpOf(t)-t.u.hp);t.u.hp+=h;floatTxt(cen(t)[0],cen(t)[1]-14,'+'+h,'#9dff9d');await FX.heal(e,[t])}
  else{t.u.mp=Math.min(mmp(t.u),t.u.mp+20);floatTxt(cen(t)[0],cen(t)[1]-14,'MP+20','#9ad0ff');await FX.heal(e,[t])}await wait(12)}
async function mosaicIn(){const order=[];for(let y=0;y<14;y++)for(let x=0;x<16;x++)order.push([x,y]);order.sort(()=>Math.random()-.5);
  for(let i=0;i<order.length;i+=8){for(let j=i;j<Math.min(order.length,i+8);j++)cells.set(order[j][0]+','+order[j][1],1);await frame()}}
async function mosaicOut(){const k=[...cells.keys()].sort(()=>Math.random()-.5);for(let i=0;i<k.length;i+=8){for(let j=i;j<Math.min(k.length,i+8);j++)cells.delete(k[j]);await frame()}cells.clear()}
async function battle(foes,o={}){busy++;const prevMus=AU.trackName;music(null);sfx('flash');
  for(let i=0;i<3;i++){fade.a=.9;fade.c='#fff';await wait(2);fade.a=0;await wait(2)}
  await mosaicIn();
  if(!G.party.some(m=>m.hp>0))G.party.forEach(m=>m.hp=1);
  B={bg:o.bg||'forest',ents:[],msg:'',shake:0,aura:0,cur:null,sel:null,boss:!!o.boss};parts.length=0;fxs.length=0;floats.length=0;
  G.party.forEach((m,i)=>B.ents.push({side:0,u:m,slot:i,x:-40,y:SLOT[0][i][1],tx:SLOT[0][i][0],ox:0,oy:0,flash:0,dis:0}));
  foes.forEach((u,i)=>B.ents.push({side:1,u,slot:i,x:300,y:SLOT[1][i][1],tx:SLOT[1][i][0],ox:0,oy:0,flash:0,dis:0}));
  scene='battle';music(o.mus||'battle');await mosaicOut();
  // slide in
  for(let f=0;f<22;f++){for(const e of B.ents){const k=1-Math.pow(1-f/21,3);e.x=e.side?300+(e.tx-300)*k:-40+(e.tx+40)*k}await frame()}
  B.ents.forEach(e=>e.x=e.tx);
  await banner(o.intro||(foes.length>1?foes[0].n+' AND FRIENDS APPEAR!':foes[0].n+' APPEARS!'),34);B.msg='';
  let result=null;
  while(!result){
    B.ents.forEach(e=>e.guard=false);
    const mem=alive(0),acts=[];
    for(let i=0;i<mem.length;){const a=await chooseAction(mem[i],i,mem.length);if(a===null){i--;continue}acts[i]=a;i++;if(a.t=='run')break}
    B.cur=null;B.msg='';
    if(acts.some(a=>a&&a.t=='run')){if(o.boss||Math.random()<.35){await banner(o.boss?'NO ESCAPE FROM THIS BATTLE!':'COULDN\'T ESCAPE!',34);acts.length=0}else{await banner('GOT AWAY SAFELY!',34);result='run';break}}
    const q=[];mem.forEach((e,i)=>{if(acts[i])q.push({e,a:acts[i],s:st(e,'spd')+(acts[i].t=='guard'?99:0)+Math.random()*4})});
    for(const e of alive(1))q.push({e,a:{t:'ai'},s:st(e,'spd')+Math.random()*5});
    q.sort((a,b)=>b.s-a.s);
    for(const{e,a}of q){if(e.u.hp<=0)continue;if(!alive(0).length||!alive(1).length)break;
      if(a.t=='guard'){e.guard=true;await banner(nameOf(e)+' GUARDS!',20)}
      else if(a.t=='item')await useItem(e,a);
      else if(a.t=='mv'){let tg=a.tg;if(tg&&tg.u.hp<=0&&!a.mv.heal){const l=alive(1);tg=l[0]}
        if(!a.mv.all&&!tg)continue;await doMove(e,a.mv,tg)}
      else if(a.t=='ai'){const mv=aiPick(e);const l=alive(0);const tg=pick(l);await doMove(e,mv,tg)}
      B.msg=''}
    if(!alive(1).length)result='win';else if(!alive(0).length)result='lose'}
  B.msg='';
  if(result=='win'){music('victory');await banner('VICTORY!',40);let xp=0,bits=0;foes.forEach(f=>{xp+=f.xp;bits+=f.bits});G.bits+=bits;
    await banner('GOT '+xp+' EXP AND '+bits+' BITS!',50);if(Math.random()<.3||o.boss){G.items.potion++;await banner('FOUND A POTION!',34)}
    for(const m of G.party){if(m.hp<=0)continue;m.xp+=xp;while(m.xp>=need(m)){m.xp-=need(m);const oh=mhp(m),om=mmp(m);m.lv++;m.hp+=mhp(m)-oh;m.mp+=mmp(m)-om;sfx('level');
      const e=B.ents.find(x=>x.u===m);burst(cen(e)[0],cen(e)[1],30,['#ffd83c','#fff','#9dff9d'],2.6,30,-.04,2);await banner(SP[m.sp].n+' REACHED LV '+m.lv+'!',46);
      const nm=SP[m.sp].moves.find(a=>a[0]==m.lv);if(nm){await banner('LEARNED '+MV[nm[1]].n+'!',46)}}}
    await wait(10)}
  B.msg='';await fade(1,14);scene=o.after||'world';B=null;parts.length=0;fxs.length=0;floats.length=0;
  if(scene=='world'){music(prevMus&&prevMus!='battle'&&prevMus!='boss'&&prevMus!='victory'?prevMus:curMap().mus)}
  G.noenc=8;for(const k in held)held[k]=0;keyq.length=0;await fade(0,14);busy--;return result}
async function postBattle(){const m=G.party[0];if(m&&m.sp=='embermon'&&m.lv>=6&&m.hp>0)await evolve(m)}
async function gameOver(){busy++;music('sad');await fade(1,30);scene='cut';cut.draw=()=>{R(0,0,W,H,'#000');tx('DATA CORRUPTED...',128-tw('DATA CORRUPTED...')/2,100,'#ff4050')};await fade(0,10);
  await say(['...','EMBERMON|KAI... DON\'T GIVE UP. THE DAWN ISN\'T OVER YET.','A WARM LIGHT RETURNED YOU TO DAWNBIT TOWN.']);
  G.bits=Math.floor(G.bits/2);G.party.forEach(m=>{m.hp=mhp(m);m.mp=mmp(m)});G.map='town';G.x=8;G.y=5;G.dir=0;pl.mv=0;pl.fx=8;pl.fy=5;pl.fox=8;pl.foy=5;setAmb();
  await fade(1,10);scene='world';music('town');await fade(0,14);busy--}
// ---------- evolution ----------
const cut={draw(){}};
async function evolve(m){busy++;music(null);const old=m.sp,nw='blazewyrm',names=SP[old].n;await fade(1,14);scene='cut';const ev={t:0};
  cut.draw=()=>{const t=ev.t;R(0,0,W,H,'#05030f');
    for(let i=0;i<40;i++){const a=i*.61+t*.03,r=((t*.8+i*17)%120);const x=128+Math.cos(a)*r*(t<200?1:1.4),y=104+Math.sin(a)*r*.7;
      if(t<210)tx(hash(i,t>>3)>.5?'1':'0',x|0,y|0,i%3?'#1fa3c8':'#ff62b8',null)}
    const rings=t<210?t:t-210;for(let k=0;k<3;k++){const r=(rings*1.6+k*30)%100;for(let a2=0;a2<360;a2+=8){const rd=a2*Math.PI/180;R(128+Math.cos(rd)*r|0,108+Math.sin(rd)*r*.6|0,2,2,t<210?'#5ce0f4':'#ffd83c')}}
    const im=t<200?SPR[old]:SPR[nw];let sc=3;if(t>=120&&t<200)sc=3+(t-120)/40;
    const w=im.width*sc,h=im.height*sc;const x=128-w/2|0,y=150-h|0;
    let img=im;if(t>=60&&t<200&&((t>>(t<120?3:1))&1))img=whiteOf(im,'#ffffff');
    R(128-w/2,150,w,3,'#ffffff22');ctx.drawImage(img,x,y,w,h);
    if(t>=195&&t<215){R(0,0,W,H,'#fff')}if(t>=215&&t<240)R(0,0,W,H,'#ffffff'+Math.round((240-t)/25*15).toString(16)+'f');
    if(t>=240){tx(names+' EVOLVES!',128-tw(names+' EVOLVES!')/2,14,'#ffd83c');if(t>250)tx('>> '+SP[nw].n+' <<',128-tw('>> '+SP[nw].n+' <<')/2,26,'#fff')}};
  await fade(0,10);sfx('evolve');for(ev.t=0;ev.t<300;ev.t++){if(ev.t==197)sfx('flash');await frame()}
  m.sp=nw;m.hp=mhp(m);m.mp=mmp(m);music('victory');await say(['EMBERMON|I FEEL... STRONGER! MY DATA IS SHINING!','EMBERMON EVOLVED INTO BLAZEWYRM!','BLAZEWYRM|LET\'S SHOW THE NULL TIDE WHAT WE\'RE MADE OF, KAI!']);
  await fade(1,12);scene='world';music(curMap().mus);await fade(0,12);busy--}
function tick(){T++;
  updBattle();if(scene=='world')updateWorld();
  draw();const w=waiters.splice(0);w.forEach(r=>r())}
function draw(){
  if(scene=='title')drawTitle();else if(scene=='world')drawWorld();else if(scene=='battle')drawBattle();else if(scene=='cut')cut.draw();
  for(const u of uis)u.draw();drawDlg();
  if(cells.size)for(const k of cells.keys()){const[x,y]=k.split(',');R(x*16,y*16,16,16,'#000')}
  if(fade.a>0){ctx.globalAlpha=fade.a;R(0,0,W,H,fade.c||'#000');ctx.globalAlpha=1}}
