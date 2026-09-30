'use strict';
// ===== core: loop, input, UI, data, maps, overworld =====
let T=0,scene='title',busy=0;
const waiters=[],keyq=[],held={},uis=[];
const frame=()=>new Promise(r=>waiters.push(r));
const wait=async n=>{for(let i=0;i<n;i++)await frame()};
const KM={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',z:'ok',Z:'ok',Enter:'ok',' ':'ok',x:'no',X:'no',Escape:'no',Backspace:'no'};
addEventListener('keydown',e=>{const k=KM[e.key];if(!k)return;e.preventDefault();if(e.repeat&&(k=='ok'||k=='no'))return;keyq.push(k);held[k]=1});
addEventListener('keyup',e=>{const k=KM[e.key];if(k)held[k]=0});
addEventListener('blur',()=>{for(const k in held)held[k]=0});
async function key(){while(!keyq.length)await frame();return keyq.shift()}
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
const hash=(a,b)=>{let h=(a*374761393+b*668265263)>>>0;h=(h^(h>>>13))*1274126177>>>0;return((h^(h>>>16))>>>0)/4294967296};
function fit(){const k=Math.max(1,Math.floor(Math.min(innerWidth/W,innerHeight/H)*1)||1);cv.style.width=W*k+'px';cv.style.height=H*k+'px'}
addEventListener('resize',fit);fit();
// touch / click pad (simple)
(()=>{const f=(x,y)=>{const r=cv.getBoundingClientRect();return[(x-r.left)/r.width,(y-r.top)/r.height]};
 let tp=null;cv.addEventListener('touchstart',e=>{auInit();const t=e.touches[0],[x,y]=f(t.clientX,t.clientY);tp=[x,y];e.preventDefault()},{passive:false});
 cv.addEventListener('touchend',e=>{if(!tp)return;const t=e.changedTouches[0],[x,y]=f(t.clientX,t.clientY),dx=x-tp[0],dy=y-tp[1];
  const k=Math.abs(dx)<.03&&Math.abs(dy)<.03?(x>.5?'ok':'no'):Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');keyq.push(k);held[k]=1;setTimeout(()=>held[k]=0,140);tp=null;e.preventDefault()},{passive:false})})();

// ---------- UI ----------
function box(x,y,w,h){R(x+1,y,w-2,h,'#f4f4ff');R(x,y+1,w,h-2,'#f4f4ff');R(x+2,y+2,w-4,h-4,'#4a5ae0');R(x+3,y+3,w-6,h-6,'#141e78');R(x+3,y+3,w-6,(h-6)/2|0,'#1c2a94');R(x+3,y+3,w-6,1,'#3a4ad0')}
function wrap(t,n){const out=[];let cur='';for(const w of t.split(' ')){if((cur+' '+w).trim().length>n){out.push(cur);cur=w}else cur=(cur+' '+w).trim()}if(cur)out.push(cur);return out}
const dlg={cur:null};
async function say(lines,who){if(!Array.isArray(lines))lines=[lines];
  for(let line of lines){let name=who||'',txt=line;const m=/^([A-Z0-9' ]{2,16})\|(.*)$/.exec(line);if(m){name=m[1];txt=m[2]}
    const L=wrap(txt,37);for(let p=0;p<L.length;p+=3){const page=L.slice(p,p+3),full=page.join('\n');
      const d=dlg.cur={name,page,n:0,len:full.length,more:p+3<L.length};keyq.length=0;
      while(true){d.n=Math.min(d.len,d.n+.7);if((T&3)==0&&d.n<d.len)sfx('blip');const k=keyq.shift();
        if(k=='ok'||k=='no'){if(d.n<d.len)d.n=d.len;else{sfx('ok');break}}await frame()}}}
  dlg.cur=null}
function drawDlg(){const d=dlg.cur;if(!d)return;box(6,150,244,68);
  if(d.name){box(12,141,tw(d.name)+16,16);tx(d.name,20,145,'#ffd83c')}
  let left=Math.floor(d.n);for(let i=0;i<d.page.length;i++){const s=d.page[i].slice(0,Math.max(0,left));left-=d.page[i].length;tx(s,14,163+i*14);}
  if(d.n>=d.len&&(T>>4)%2==0)R(236,208,6,3,'#fff'),R(237,211,4,1,'#fff'),R(238,212,2,1,'#fff')}
async function menu(items,x,y,o={}){let c=o.c||0;const it=items.map(i=>typeof i=='string'?{t:i}:i);
  const w=o.w||Math.max(...it.map(i=>i.t.length))*6+24,h=it.length*12+10;
  const u={draw(){box(x,y,w,h);it.forEach((s,i)=>tx(s.t,x+15,y+6+i*12,s.d?'#7880a8':i==c?'#ffd83c':'#fff'));
    if((T>>3)%4<3)tx('>',x+5+((T>>4)%2),y+6+c*12,'#ffd83c')}};uis.push(u);keyq.length=0;let res;
  while(true){if(o.onMove)o.onMove(c);const k=await key();
    if(k=='up'){c=(c+it.length-1)%it.length;sfx('blip')}else if(k=='down'){c=(c+1)%it.length;sfx('blip')}
    else if(k=='ok'){if(it[c].d){sfx('no');continue}sfx('ok');res=c;break}else if(k=='no'&&o.cancel!==false){sfx('no');res=-1;break}}
  uis.splice(uis.indexOf(u),1);if(o.onMove)o.onMove(-1);return res}
function bar(x,y,w,h,v,m,c1,c2){R(x,y,w,h,'#10081c');R(x+1,y+1,w-2,h-2,'#3a3050');const f=Math.round((w-2)*clamp(v/m,0,1));if(f>0){R(x+1,y+1,f,h-2,c1);if(h>3)R(x+1,y+1,f,1,c2)}}

// ---------- data ----------
const SP={
 embermon:{n:'EMBERMON',el:'fire',hp:34,mp:10,atk:7,def:4,spd:6,g:{hp:8,mp:2,atk:2.2,def:1.4,spd:1},moves:[[1,'claw'],[2,'sparkflame'],[5,'emberburst']]},
 blazewyrm:{n:'BLAZEWYRM',el:'fire',hp:60,mp:26,atk:16,def:10,spd:9,g:{hp:9,mp:2.5,atk:2.6,def:1.6,spd:1.1},moves:[[1,'flameslash'],[1,'dragonclaw'],[1,'inferno']]},
 aquabit:{n:'AQUABIT',el:'water',hp:38,mp:14,atk:6,def:6,spd:5,g:{hp:7.5,mp:3,atk:1.8,def:1.6,spd:1},moves:[[1,'bubble'],[1,'aquamist'],[6,'tidal']]},
 sprigmon:{n:'SPRIGMON',el:'plant',hp:32,mp:14,atk:7,def:4,spd:9,g:{hp:6.5,mp:3,atk:2,def:1.3,spd:1.2},moves:[[1,'vine'],[3,'leafblade'],[6,'sprout']]}};
const MV={
 claw:{n:'CLAW',p:9,mp:0,fx:'claw'},tackle:{n:'TACKLE',p:6,mp:0,fx:'slash'},bite:{n:'BITE',p:8,mp:0,fx:'claw'},
 sparkflame:{n:'SPARK FLAME',p:15,mp:3,el:'fire',fx:'fire'},emberburst:{n:'EMBER BURST',p:12,mp:6,el:'fire',fx:'fire',all:1},
 flameslash:{n:'FLAME SLASH',p:22,mp:0,el:'fire',fx:'slashfire'},dragonclaw:{n:'DRAGON CLAW',p:27,mp:4,fx:'claw'},inferno:{n:'INFERNO BLAST',p:22,mp:9,el:'fire',fx:'fire',all:1},
 bubble:{n:'BUBBLE SHOT',p:13,mp:3,el:'water',fx:'water'},aquamist:{n:'AQUA MIST',p:42,mp:4,heal:1,fx:'heal'},tidal:{n:'TIDAL WAVE',p:14,mp:7,el:'water',fx:'tidal',all:1},
 vine:{n:'VINE WHIP',p:11,mp:0,el:'plant',fx:'leaf'},leafblade:{n:'LEAF BLADE',p:18,mp:4,el:'plant',fx:'leaf'},sprout:{n:'SPROUT GLOW',p:34,mp:6,heal:1,all:1,fx:'heal'},
 slime:{n:'SLIME SHOT',p:9,mp:0,el:'plant',fx:'leaf'},zap:{n:'THUNDER ZAP',p:13,mp:0,el:'elec',fx:'bolt'},rock:{n:'ROCK SMASH',p:15,mp:0,fx:'slash'},
 pulse:{n:'NULL PULSE',p:20,mp:0,el:'void',fx:'void'},storm:{n:'NULL STORM',p:16,mp:0,el:'void',fx:'void',all:1},drain:{n:'DATA DRAIN',p:24,mp:0,el:'void',fx:'void'}};
const EM={fire:{plant:1.5,water:.6,fire:.75},water:{fire:1.5,elec:.6,plant:.6},plant:{water:1.5,fire:.6},elec:{water:1.5,plant:.6}};
const mult=(a,d)=>(EM[a]||{})[d]||1;
const ENY={
 gelbit:{n:'GELBIT',spr:'gelbit',el:'plant',hp:28,atk:9,def:3,spd:3,moves:['tackle','slime'],xp:12,bits:7},
 bitbat:{n:'BITBAT',spr:'bitbat',el:'none',hp:22,atk:10,def:2,spd:9,moves:['bite','tackle'],xp:12,bits:8},
 sparkfox:{n:'SPARKFOX',spr:'sparkfox',el:'elec',hp:34,atk:11,def:3,spd:10,moves:['zap','bite'],xp:16,bits:10},
 rockmon:{n:'ROCKMON',spr:'rockmon',el:'none',hp:70,atk:15,def:9,spd:3,moves:['rock','tackle'],xp:28,bits:18},
 guard:{n:'ROCK GUARD',spr:'rockmon',el:'none',hp:140,atk:13,def:7,spd:4,moves:['rock','rock','tackle'],xp:70,bits:40},
 wraith:{n:'GLITCHWRAITH',spr:'wraith',el:'void',hp:430,atk:40,def:10,spd:12,moves:['pulse','pulse','storm','drain'],xp:220,bits:150},
 sov:{n:'NULL SOVEREIGN',spr:'sovereign',el:'void',hp:620,atk:52,def:14,spd:13,moves:['pulse','storm','drain'],xp:400,bits:0}};
const ITEMS={potion:{n:'POTION',d:'HP +60',price:20},ether:{n:'ETHER',d:'MP +20',price:30}};
const S=(m,k)=>{const d=SP[m.sp];return Math.round(d[k]+d.g[k]*m.lv)};
const mhp=m=>S(m,'hp'),mmp=m=>S(m,'mp'),need=m=>m.lv*10+m.lv*m.lv*2;
const mvs=m=>SP[m.sp].moves.filter(a=>a[0]<=m.lv).map(a=>a[1]);
const mkMember=(sp,lv)=>{const m={sp,lv,xp:0,hp:1,mp:1};m.hp=mhp(m);m.mp=mmp(m);return m};
const G={map:'town',x:14,y:9,dir:0,party:[],items:{potion:3,ether:1},bits:100,flags:{},noenc:8,steps:0};

// ---------- map generation ----------
function genMap(w,h,seed,wall,floor,enc,way,clear,extra){const r=rng(seed),g=Array.from({length:h},()=>Array(w).fill(wall));
  const carve=(x,y,rad)=>{for(let dy=-Math.ceil(rad);dy<=rad;dy++)for(let dx=-Math.ceil(rad);dx<=rad;dx++){const xx=x+dx,yy=y+dy;
    if(dx*dx+dy*dy<=rad*rad+.5&&xx>0&&yy>0&&xx<w-1&&yy<h-1)g[yy][xx]=floor}};
  for(let i=0;i<way.length-1;i++){let[x,y]=way[i];const[tx,ty]=way[i+1];let n=0;
    while((x!=tx||y!=ty)&&n++<1500){carve(x,y,1+(r()<.3?1:0));
      if(r()<.62){if(Math.abs(tx-x)>Math.abs(ty-y))x+=Math.sign(tx-x);else y+=Math.sign(ty-y)}else if(r()<.5)y+=r()<.5?-1:1;else x+=r()<.5?-1:1;
      x=clamp(x,2,w-3);y=clamp(y,2,h-3)}
    while(x!=tx){carve(x,y,1);x+=Math.sign(tx-x)}while(y!=ty){carve(x,y,1);y+=Math.sign(ty-y)}carve(tx,ty,2)}
  for(const[cx,cy,rad]of clear)carve(cx,cy,rad);
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if(g[y][x]==floor&&enc&&(Math.sin(x*.55)+Math.sin(y*.5+x*.12)+Math.sin((x+y)*.31))>.9)g[y][x]=enc;
  if(extra)extra(g,r);return g}
const rowsOf=g=>g.map(r=>r.join(''));
const MAPS={};
function buildMaps(){
  const town=["############################","#..F..RRRRR.....RRRRR...F..#","#.....HwHwH.....HwHwH......#".padEnd(28,'#').slice(0,27)+'#',
   "#.....HHDHH.....HHDHH..FF..#","#..F....=.........=....F...#","#.......=.........=........#","#.......===========........#","#..F........=.......F......#",
   "#...........=..............#","#...........================","#...........=..............#","#..####.....=.....~~~~.....#","#..####...........~~~~.....#",
   "#...F...............~~.....#","#..........................#","#.##...........FF.......##.#","#..........................#","#..........................#","#............T.............#","############################"];
  MAPS.town={rows:town.map(r=>r.padEnd(28,'#').slice(0,28)),mus:'town',bg:'forest',enc:null,amb:'petal',
   warps:{'27,9':{to:'forest',x:2,y:14,dir:2,need:'met'},'13,18':{to:'tower',x:12,y:37,dir:3,need:'gate'}}};
  const f=genMap(44,28,7,'#','.',',',[[2,14],[8,14],[12,9],[20,7],[26,13],[22,20],[30,22],[36,16],[41,6]],[[20,7,3.6],[22,20,3.2],[41,6,2.5]],(g,r)=>{
    g[14][1]='.';g[7][22]='~';g[6][22]='~';g[6][23]='~';g[7][23]='~';g[8][22]='~';
    for(let y=1;y<27;y++)for(let x=1;x<43;x++)if(g[y][x]=='.'&&r()<.035)g[y][x]='F'});
  MAPS.forest={rows:rowsOf(f),mus:'forest',bg:'forest',enc:'forest',amb:'firefly',
   warps:{'1,14':{to:'town',x:26,y:9,dir:1},'41,6':{to:'cave',x:2,y:26,dir:2,need:'team'}}};
  const c=genMap(40,30,21,'C','c','c',[[2,26],[10,22],[18,25],[26,19],[14,14],[8,8],[20,5],[30,6]],[[30,6,4.2],[2,26,2]],(g,r)=>{g[26][1]='c'});
  MAPS.cave={rows:rowsOf(c),mus:'cave',bg:'cave',enc:'cave',amb:'mote',dark:1,
   warps:{'1,26':{to:'forest',x:40,y:6,dir:1}}};
  const t=genMap(24,40,33,'W','T','T',[[12,37],[12,31],[6,26],[17,20],[8,14],[12,9],[12,5]],[[12,5,4.2],[12,31,2.4],[12,37,2]],(g,r)=>{g[38][12]='T';g[38][11]='T';g[38][13]='T'});
  MAPS.tower={rows:rowsOf(t),mus:'cave',bg:'tower',enc:'tower',amb:'bit',dark:1,
   warps:{'12,38':{to:'town',x:13,y:17,dir:0}}};
  for(const k in MAPS){const m=MAPS[k];m.w=m.rows[0].length;m.h=m.rows.length;m.npcs=[];m.ev={}}
}
const curMap=()=>MAPS[G.map];
const tileAt=(x,y)=>{const m=curMap();return y<0||x<0||y>=m.h||x>=m.w?'#':m.rows[y][x]};
const npcAt=(x,y)=>curMap().npcs.find(n=>n.x==x&&n.y==y&&!n.hide);
const walkable=(x,y)=>!TILE_BLOCK.has(tileAt(x,y))&&!npcAt(x,y);

// ---------- overworld ----------
const DV=[[0,1],[-1,0],[1,0],[0,-1]],DK=['down','left','right','up'];
const pl={mv:0,fx:14,fy:9,fox:0,foy:0,last:0};
const cam={x:0,y:0};
const amb=[];
function setAmb(){amb.length=0;const m=curMap();for(let i=0;i<(m.amb?34:0);i++)amb.push({x:Math.random()*256,y:Math.random()*224,ph:Math.random()*6.28,s:Math.random()})}
function ambDraw(){const m=curMap();for(const a of amb){let x,y,c;
  if(m.amb=='petal'){a.x-=.25+a.s*.3;a.y+=.25+Math.sin(T*.03+a.ph)*.2;if(a.x<-4){a.x=260;a.y=Math.random()*224}if(a.y>230)a.y=-4;R(a.x,a.y,2,1,a.s>.5?'#ffd0e8':'#ffffff');R(a.x+1,a.y+1,1,1,'#ff90c0')}
  else if(m.amb=='firefly'){a.x+=Math.sin(T*.02+a.ph)*.3;a.y+=Math.cos(T*.017+a.ph)*.25;const b=(Math.sin(T*.05+a.ph*3)+1)/2;
    if(b>.35){R(a.x-1,a.y-1,3,3,'#ffef6022');R(a.x,a.y,1,1,b>.7?'#fffbb0':'#ffe060')}}
  else if(m.amb=='mote'){a.y-=.12+a.s*.1;a.x+=Math.sin(T*.02+a.ph)*.2;if(a.y<-3){a.y=226;a.x=Math.random()*256}R(a.x,a.y,1,1,a.s>.6?'#b8f4ff':'#58e0f0')}
  else if(m.amb=='bit'){a.y-=.3+a.s*.4;if(a.y<-8){a.y=228;a.x=Math.random()*256}tx((hash(a.x|0,T>>4)>.5)?'1':'0',a.x,a.y,a.s>.7?'#ff62b8':'#1fa3c8',null)}}}
let lightC=null;
function light(px,py){if(!lightC){lightC=mk(360,360,g=>{const cx=180,cy=180;for(let y=0;y<360;y+=2)for(let x=0;x<360;x+=2){const d=Math.hypot(x-cx,y-cy);
    const dd=d/1.35,lv=dd<46?0:dd<64?1:dd<84?2:dd<104?3:4;const b=[[0],[1],[1,2],[1,2,3],[1,2,3,4]][lv];
    if(lv==0)continue;const bx=(x/2)%2,by=(y/2)%2,idx=bx+by*2; // bayer
    const th=[0,2,3,1][idx];const a=lv==4?1:(lv/4);if(th<a*4-0.01||lv==4)P(g,'#05030f',x,y,2,2)}})}
  ctx.drawImage(lightC,px-180,py-180);R(0,0,256,py-180,'#05030f');R(0,py+180,256,224,'#05030f');R(0,py-180,px-180,360,'#05030f');R(px+180,py-180,256,360,'#05030f')}
function drawChar(img,cx,by,flip){ctx.drawImage(img,Math.round(cx-img.width/2),Math.round(by-img.height))}
function shadow(cx,by,w){R(cx-w/2,by-2,w,2,'#00000050');R(cx-w/2+1,by-3,w-2,1,'#00000038')}
function drawWorld(){const m=curMap();
  const px=G.x*16+8-(DV[G.dir][0]*pl.mv),py=G.y*16+8-(DV[G.dir][1]*pl.mv);
  cam.x=clamp(Math.round(px-128),0,m.w*16-W);cam.y=clamp(Math.round(py-112),0,m.h*16-H);
  if(m.w*16<W)cam.x=-(W-m.w*16)/2|0;if(m.h*16<H)cam.y=-(H-m.h*16)/2|0;
  R(0,0,W,H,'#000');
  const x0=Math.floor(cam.x/16),y0=Math.floor(cam.y/16);
  for(let ty=y0;ty<=y0+15;ty++)for(let tx_=x0;tx_<=x0+17;tx_++){if(ty<0||tx_<0||ty>=m.h||tx_>=m.w)continue;const ch=m.rows[ty][tx_];
    ctx.drawImage(tileImg(ch=='D'||ch=='w'?ch:ch,tx_,ty,T),tx_*16-cam.x,ty*16-cam.y);}
  // warp glow on tower gate
  if(G.map=='town'&&G.flags.gate){const gx=13*16-cam.x,gy=18*16-cam.y;ctx.drawImage(tileImg('N',0,0,T>>1),gx,gy)}
  else if(G.map=='town'){const gx=13*16-cam.x,gy=18*16-cam.y;R(gx,gy,16,16,'#20103a');R(gx+2,gy+2,12,12,'#33205a');for(let i=0;i<4;i++)R(gx+2+i*3,gy+2,1,12,'#10081c')}
  const ents=[];for(const n of m.npcs)if(!n.hide)ents.push({y:n.y*16,d:()=>drawNpc(n)});
  ents.push({y:G.y*16+16*(pl.mv? (DV[G.dir][1]<0?0:0):0)-(DV[G.dir][1]*pl.mv),d:()=>drawPlayer()});
  if(G.party.length&&G.map!='__'){const fy=pl.fy*16;ents.push({y:fy-1,d:()=>drawFollower()})}
  ents.sort((a,b)=>a.y-b.y).forEach(e=>e.d());
  ambDraw();
  if(m.dark)light(px-cam.x,py-cam.y-4);
  if(scene=='world'&&G.map=='forest'){} }
function npcScreen(n){return[n.x*16+8-cam.x,n.y*16+16-cam.y]}
function drawNpc(n){const[cx,by]=npcScreen(n);
  if(n.c){const img=SPR[n.c];const b=((T>>4)&1);shadow(cx,by,Math.min(img.width,22));
    if(n.flip){ctx.save();ctx.translate(cx,0);ctx.scale(-1,1);ctx.drawImage(img,-img.width/2|0,by-img.height-b);ctx.restore()}else ctx.drawImage(img,cx-img.width/2|0,by-img.height-b);
    if(n.aura){const t=T*.1;for(let i=0;i<6;i++){R(cx+Math.cos(t+i)*(14+i)|0,by-16+Math.sin(t*1.3+i)*10|0,2,2,i%2?'#ff62b8':'#5ce0f4')}}
  }else{const s=SPR[n.k];const dk=n.dir==0?'f':n.dir==1?'l':n.dir==2?'r':'b';shadow(cx,by,10);drawChar(s[dk][0],cx,by)}
  if(n.mark&&(T>>4)%2)tx('!',cx-2,by-(n.c?SPR[n.c].height:20)-8,'#ffd83c')}
const walkF=()=>pl.mv>8?1:pl.mv>0?2:0;
function drawPlayer(){const px=G.x*16+8-DV[G.dir][0]*pl.mv-cam.x,py=G.y*16+16-DV[G.dir][1]*pl.mv-cam.y;
  const dk=G.dir==0?'f':G.dir==1?'l':G.dir==2?'r':'b';shadow(px,py,10);drawChar(SPR.hero[dk][walkF()],px,py-(pl.mv&&pl.mv%8<4?1:0))}
function drawFollower(){const p=G.party[0];if(!p||!p.hp)return;const img=SPR[p.sp];const sc=.5;const t=pl.mv?1-pl.mv/16:1;
  const fx=(pl.fx+(G.x-pl.fx)*0)*16,ox=pl.fox+(pl.fx-pl.fox)*t,oy=pl.foy+(pl.fy-pl.foy)*t;
  const cx=ox*16+8-cam.x,by=oy*16+16-cam.y;const w=img.width>>1,h=img.height>>1;
  R(cx-6,by-2,12,2,'#00000050');ctx.save();if(pl.fdir==1){ctx.translate(cx,0);ctx.scale(-1,1);ctx.drawImage(img,-w/2|0,by-h-((T>>4)&1),w,h)}else ctx.drawImage(img,cx-w/2|0,by-h-((T>>4)&1),w,h);ctx.restore()}

async function fade(to,n=14,col='#000'){const from=fade.a||0;for(let i=1;i<=n;i++){fade.a=from+(to-from)*i/n;fade.c=col;await frame()}fade.a=to}
fade.a=0;
async function changeMap(to,x,y,dir,snd=true){busy++;if(snd)sfx('warp');await fade(1,12);G.map=to;G.x=x;G.y=y;G.dir=dir;pl.mv=0;pl.fx=x;pl.fy=y;pl.fox=x;pl.foy=y;pl.fdir=dir;
  setAmb();music(MAPS[to].mus);G.noenc=6;await wait(4);await fade(0,12);busy--}
function startStep(d){G.dir=d;const nx=G.x+DV[d][0],ny=G.y+DV[d][1];
  const wp=curMap().warps[nx+','+ny];
  if(!walkable(nx,ny))return;pl.fox=pl.fx;pl.foy=pl.fy;pl.fx=G.x;pl.fy=G.y;pl.fdir=DV[d][0]<0?1:DV[d][0]>0?0:pl.fdir;
  G.x=nx;G.y=ny;pl.mv=16;if(T%2)sfx('step')}
function updateWorld(){if(busy)return;
  if(pl.mv>0){pl.mv-=2;if(pl.mv<=0){pl.mv=0;arrive()}return}
  let d=-1;for(let i=0;i<4;i++)if(held[DK[i]])d=i;
  const k=keyq.shift();
  if(k=='ok'){const[dx,dy]=DV[G.dir],n=npcAt(G.x+dx,G.y+dy);if(n&&n.talk){n.dir=[3,2,1,0][G.dir];run(()=>n.talk(n))}return}
  if(k=='no'){run(worldMenu);return}
  if(d>=0){if(G.dir!=d&&!pl.turn){G.dir=d;pl.turn=5}if(pl.turn>0){pl.turn--;return}startStep(d)}else pl.turn=0}
async function run(fn){busy++;try{await fn()}catch(e){console.error(e)}finally{busy--;keyq.length=0}}
function arrive(){G.steps++;if(G.noenc>0)G.noenc--;const m=curMap(),k=G.x+','+G.y;
  const w=m.warps[k];if(w){if(w.need&&!needOK(w.need)){run(()=>blockWarp(w));return}run(()=>changeMap(w.to,w.x,w.y,w.dir));return}
  if(m.ev[k]){run(m.ev[k]);return}
  const ch=tileAt(G.x,G.y);if(m.enc&&G.noenc<=0&&(ch==','||ch=='c'||ch=='T')&&G.map!='town'){
    const gate=G.map=='tower'?.085:.1;if(Math.random()<gate)run(()=>randomBattle())}}
const needOK=n=>n=='met'?G.flags.met:n=='team'?G.party.length>=3:n=='gate'?G.flags.gate:true;
async function blockWarp(w){const bx=G.x-DV[G.dir][0],by=G.y-DV[G.dir][1];
  if(w.need=='met')await say('EMBERMON|WAIT, KAI! WE SHOULD TALK TO THE ELDER FIRST.');
  else if(w.need=='team')await say(['EMBERMON|THE GLITCH CAVERN IS DANGEROUS.','EMBERMON|LET\'S FIND AQUABIT AND SPRIGMON FIRST - WE NEED A FULL TEAM!']);
  else await say(['...THE GATE IS SEALED.','EMBERMON|IT HUMS WITH NULL ENERGY. WE NEED THE DAWN CREST.']);
  G.x=bx;G.y=by;pl.mv=0;pl.fx=bx;pl.fy=by;pl.fox=bx;pl.foy=by}
