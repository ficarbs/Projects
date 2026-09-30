'use strict';
// ===== DIGITAL DAWN :: art.js — every graphic is raw pixels (fillRect / string masks) =====
const W=256,H=224;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=false;
const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x|0,y|0,w,h)};
const P=(g,c,x,y,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
const mk=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;f(g);return c};
const rng=s=>()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
const hx=c=>[1,3,5].map(i=>parseInt(c.substr(i,2),16));
const sh=(c,f)=>'#'+hx(c).map(v=>{v=f>0?v+(255-v)*f:v*(1+f);return Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')}).join('');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// ---------- 5x7 bitmap font ----------
const FD={
A:".###.|#...#|#...#|#####|#...#|#...#|#...#",B:"####.|#...#|#...#|####.|#...#|#...#|####.",
C:".###.|#...#|#....|#....|#....|#...#|.###.",D:"####.|#...#|#...#|#...#|#...#|#...#|####.",
E:"#####|#....|#....|####.|#....|#....|#####",F:"#####|#....|#....|####.|#....|#....|#....",
G:".###.|#...#|#....|#.###|#...#|#...#|.###.",H:"#...#|#...#|#...#|#####|#...#|#...#|#...#",
I:".###.|..#..|..#..|..#..|..#..|..#..|.###.",J:"..###|...#.|...#.|...#.|...#.|#..#.|.##..",
K:"#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#",L:"#....|#....|#....|#....|#....|#....|#####",
M:"#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#",N:"#...#|##..#|#.#.#|#..##|#...#|#...#|#...#",
O:".###.|#...#|#...#|#...#|#...#|#...#|.###.",P:"####.|#...#|#...#|####.|#....|#....|#....",
Q:".###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#",R:"####.|#...#|#...#|####.|#.#..|#..#.|#...#",
S:".####|#....|#....|.###.|....#|....#|####.",T:"#####|..#..|..#..|..#..|..#..|..#..|..#..",
U:"#...#|#...#|#...#|#...#|#...#|#...#|.###.",V:"#...#|#...#|#...#|#...#|#...#|.#.#.|..#..",
W:"#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#",X:"#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#",
Y:"#...#|#...#|.#.#.|..#..|..#..|..#..|..#..",Z:"#####|....#|...#.|..#..|.#...|#....|#####",
0:".###.|#...#|#..##|#.#.#|##..#|#...#|.###.",1:"..#..|.##..|..#..|..#..|..#..|..#..|.###.",
2:".###.|#...#|....#|...#.|..#..|.#...|#####",3:"####.|....#|....#|.###.|....#|....#|####.",
4:"...#.|..##.|.#.#.|#..#.|#####|...#.|...#.",5:"#####|#....|####.|....#|....#|#...#|.###.",
6:".###.|#....|#....|####.|#...#|#...#|.###.",7:"#####|....#|...#.|..#..|.#...|.#...|.#...",
8:".###.|#...#|#...#|.###.|#...#|#...#|.###.",9:".###.|#...#|#...#|.####|....#|....#|.###.",
'.':".....|.....|.....|.....|.....|.##..|.##..",',':".....|.....|.....|.....|.##..|..#..|.#...",
'!':"..#..|..#..|..#..|..#..|..#..|.....|..#..",'?':".###.|#...#|....#|...#.|..#..|.....|..#..",
"'":"..#..|..#..|.#...|.....|.....|.....|.....",'-':".....|.....|.....|#####|.....|.....|.....",
':':".....|.##..|.##..|.....|.##..|.##..|.....",'/':"....#|....#|...#.|..#..|.#...|#....|#....",
'>':"#....|##...|###..|####.|###..|##...|#....",'+':".....|..#..|..#..|#####|..#..|..#..|.....",
'%':"##..#|##..#|...#.|..#..|.#...|#..##|#..##",'(':"...#.|..#..|.#...|.#...|.#...|..#..|...#.",
')':".#...|..#..|...#.|...#.|...#.|..#..|.#...",'*':".....|#.#.#|.###.|#####|.###.|#.#.#|.....",
'<':"...#.|..##.|.###.|####.|.###.|..##.|...#."};
const GL={};for(const k in FD)GL[k]=FD[k].split('|');
function tx(s,x,y,c='#fff',sd='#1a1030'){s=String(s).toUpperCase();
  for(let p=0;p<(sd?2:1);p++){const ox=sd&&p==0?1:0,col=p==0&&sd?sd:c;ctx.fillStyle=col;
    for(let i=0;i<s.length;i++){const gl=GL[s[i]];if(!gl)continue;
      for(let r=0;r<7;r++)for(let q=0;q<5;q++)if(gl[r][q]=='#')ctx.fillRect(x+i*6+q+ox,y+r+ox,1,1)}}}
const tw=s=>String(s).length*6-1;
function txs(s,x,y,sc,cols,ol){s=String(s).toUpperCase();
  for(let p=0;p<2;p++){for(let i=0;i<s.length;i++){const gl=GL[s[i]];if(!gl)continue;
    for(let r=0;r<7;r++)for(let q=0;q<5;q++)if(gl[r][q]=='#'){
      if(p==0){ctx.fillStyle=ol;ctx.fillRect(x+(i*6+q)*sc-1,y+r*sc-1,sc+2,sc+2)}
      else{ctx.fillStyle=cols[r];ctx.fillRect(x+(i*6+q)*sc,y+r*sc,sc,sc)}}}}}

// ---------- sprite compiler: mask strings -> auto-outlined, auto-shaded pixel sprites ----------
const PAL={o:'#f08a24',y:'#ffd83c',r:'#e23a3a',g:'#56c250',G:'#2d8040',b:'#3f7ae8',c:'#5ce0f4',p:'#a858e0',n:'#8c5a32',s:'#f9c9a0',
e:'#9aa2b6',E:'#646a7c',l:'#dde2ee',w:'#ffffff',K:'#14101c',m:'#ff62b8',d:'#554068',u:'#f2c030',t:'#e8d4a0',a:'#7a3cb0',z:'#2c2440',
H:'#6a3a1c',S:'#f9c9a0',C:'#3a6ad0',Q:'#5ce0f4',B:'#2450b8'};
PAL.P='#34406a';
function spr(rows,o={}){const pal=Object.assign({},PAL,o.pal||{});
  let w=Math.max(...rows.map(r=>r.length));rows=rows.map(r=>r.padEnd(w,'.'));
  if(o.sym)rows=rows.map(r=>r+[...r].reverse().join(''));
  w=rows[0].length;const h=rows.length;
  const c=document.createElement('canvas');c.width=w+2;c.height=h+2;const g=c.getContext('2d');
  const at=(x,y)=>x<0||y<0||x>=w||y>=h?'.':rows[y][x];
  for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++){const k=at(x,y);
    if(k!=='.'){const base=pal[k];let col=base;
      if(k!='w'&&k!='K'){
        if(at(x,y-1)==='.'||(at(x-1,y-1)==='.'&&at(x-1,y)==='.'))col=sh(base,.28);
        else if(at(x,y+1)==='.')col=sh(base,-.3);
        else if(at(x,y+2)==='.'&&(x+y)%2==0)col=sh(base,-.3);
        else if(at(x+1,y)==='.'&&(x+y)%2==0)col=sh(base,-.2);
        else if(at(x-1,y)==='.'&&(x+y)%2==1)col=sh(base,.14)}
      P(g,col,x+1,y+1)}
    else{const nb=[at(x+1,y),at(x-1,y),at(x,y+1),at(x,y-1)].find(v=>v!=='.');
      if(nb)P(g,sh(pal[nb],-.68),x+1,y+1)}}
  return c}
const flashCache=new Map();
function whiteOf(c,col='#fff'){const key=c.width+':'+col;let m=flashCache.get(c);if(!m){m={};flashCache.set(c,m)}
  if(!m[col]){m[col]=mk(c.width,c.height,g=>{g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';P(g,col,0,0,c.width,c.height)})}return m[col]}

// ---------- creature & character masks ----------
const EMBER=[
"..........oooooo.........",
".........oooooooo........",
"........oooooooooo.......",
"........ooooooKwooo......",
"........oooooooKKooooo...",
"........ooooooooooooooo..",
"........ooooooooooooooo..",
".........oKKKKKKKKKoooo..",
"..........ooowwooooooo...",
"....rr.....oooooooooo....",
"...ryyr...oooooyyyooo....",
"...ryyoooooooooyyyyoooo..",
"....oooooooooooyyyyoooo..",
"...ooooooooooooyyyyooow..",
"..oooooooooooooyyyyoooo..",
"...oooooooooooyyyyyooo...",
"....ooooooooooyyyyoooo...",
".....ooooooooooooooooo...",
"......ooooooo..ooooooo...",
"......ooooooo..ooooooo...",
".....owwwooo...owwwwoo..."];
const BLAZE=[
"..............rr..........",
".............rrrr...rr....",
"............roooorrrrr....",
"...........ooooooooooo....",
"..........oooooooooooooo..",
"..........ooooooKwoooooo..",
"..........oooooooKKoooooo.",
"..........ooooooooooooooo.",
"..........ooKKKKKKKKooooo.",
"...........oowwowwoooo....",
"..rr.......oooooooooo.....",
".ryyr.....oooooooooooo....",
"..ryyr..ooooooyyyyoooo....",
"...ryyoooooooooyyyyooooo..",
"....ooooooooooooyyyyoooow.",
"...oooooooooooooyyyyoooow.",
"..ooooooooooooooyyyyoooow.",
"...oooooooooooooyyyyooow..",
"....ooooooooooooyyyyoooo..",
".....oooooooooooyyyyooo...",
"......oooooooooooooooo....",
".......ooooooo.oooooooo...",
".......ooooooo..ooooooo...",
".......oooooo...ooooooo...",
"......owwwooo...owwwwooo..",
"......owwwoo....owwwwoo..."];
const AQUA=[
"..........bbbbb.........",
".........bbbbbbb........",
"........bbbbbbbbb.......",
"........bbbbbbKwbb......",
".......bbbbbbbbKKbbbb...",
".......bbbbbbbbbbbbbbb..",
"....b..bbbKKKKKKKbbbb...",
"...bbb.bbbbbbwwwbbbb....",
"..bbbbbbbbbbbbbbbbb.....",
".bbbbbbbbbbbbwwwwbbb....",
"bbbbbbbbbbbbwwwwwwbb....",
"bbbbbbbbbbbbbwwwwwbbb...",
".bbbbbbbbbbbbbwwwbbb....",
"..bbbbbbbbbbbbbbbbb.....",
"...bbbbbbbbbbbbbbb......",
"....bbbbb..bbbbbbb......",
"....bbbbb..bbbbbbbb.....",
"....cccc....cccccc......"];
const SPRIG=[
"..........gg.............",
"........gggggg...g.......",
".......ggggggg.ggg.......",
"......GGGGGGGGGgg........",
"........oooooo...........",
".......oooooooooo........",
"......ooooooooooooo......",
"......oooooKwoooooo......",
".....ooooooKKoooooooo....",
"......oooooooooooooooo...",
".......ooKKKKKKoooooo....",
"........oooooooooooo.....",
".........ggggggggg.......",
"........gggggggggggg.....",
".......ggggggGGgggggg.g..",
"......gggggggGGgggggggg..",
".......gggggggggggggggg..",
"........ggggggggggggg....",
".......ggggg..ggggggg....",
".......ggggg..ggggggg....",
"......nnnnnn..nnnnnnn...."];
const GELBIT=[
"..........gg","........gggg",".......ggggg","......gggggg",".....gwwggggg","....gwwggggg",
"....gggggggg","...ggGGKKggg","...ggGGKKggg","..ggggggggggg","..gggggggKKKK","..gggggggggg","..gggggggggg","...ggggggggg","....gggggggg"];
const BITBAT=[
".........pp...","p........ppp..","pp......pppppp","ppp...pppprrpp","pppp.ppppppppp","pppppppppppppp",
".pppppppppwwpp",".pp.ppp.pppppp","..p..p..pppppp","..........pppp","...........ppp"];
const ROCK=[
"....eeeeeeee","...eeeeeeeee","...eeyyeeeee","...eeeeeeeee","....eeeeEeee","..eeeeeeeeee",".eeeeeEeeeee",
"eeeeeeeeeeee","eeelleeeEeee","eeeeeeeeeeee","eeeeeeeeeeee",".eeeeeeeeeee","..eeeeeeeeee","...eeeeeeeEe","...eeeee..ee","...eeeee..ee","..EEEEEE..EE"];
const FOX=[
"..............y.y.......",".............yyyyyy.....",".........y...yyyyyyy....",".........yy.yyyKwyyyyy..",
"....y....yyyyyyyKKyyyyyyy","...yyy..yyyyyyyyyyyyyyyy.","..yyyyyyyyyyyyyyyyyKK....","yyyyyyyyyyyyyyywwyyyy...",
".yyyyyyyyyyyyyyyyyyy....","..yyyyyyyyyyyyyyyyyy....","...yyyyyyyyyyyyyyyy.....","....yyyyyyyyyyyyyyy.....",
".....yyyy..yyyyyyy......",".....yyyy..yyyy.yyy.....",".....KKKK..KKKK.KKK....."];
const WRAITH=[
"........dddddddd","......dddddddddd","....dddddddddddd","...ddddddddddddd","...dddddzzzzzzzz","..ddddzzzzzzzzzz",
"..ddddzzmmzzzmmz","..ddddzzmmzzzmmz","..dddddzzzzzzzzz","..dddddddzzzzKKK","...mmmmmmmmmmmmm","...dddddddddddda",
"..ddddddddddddaa","..ddmmmmmmdddaaa","..dddddddddddddd","...dddddddddmmmm","...ddd.ddddddddd","....dd..dddd.ddd",
"....d....dd...dd","..........d....."];
const SOV=[
"......u.......uu..","......uu.....uuuu.","......uuu...uuuuuu","......uuuuuuuuuuuu",".....uuuuuuuuuuuuu","...zzzzzzzzzzzzzzz",
"..zzzzzllllllllll","..zzzzllllllllllll","..zzzzlllllKKllll","..zzzzllllKmmKllll","..zzzzllllKmmKllll","..zzzzzlllllllllll",
"..zzzzzzllllKKKKKK","..zzzzzzzllllllllll","...zzzzzzzzlllllll","..zzzzzzzzzzzzzzzz","..zzzaazzzzzzzzzzz","..zzzaazzzzmmzzzzz",
".zzzzaazzzzzmmmzzz",".zzzzzzzzzzzzzmmmz",".zzzzzzzzzaazzzzzz","zzzzzzzzzzaazzzzzz","zzzzzzzzzzzzzzzzzz","zzzzzzzzzzzzmmzzzz",
"zzzzzzzzzzzzmmzzzz","zzzzzzzzzzzzzzzzzz"];
const NULLB=["......zzzz","....zzzzzz","...zzzzzzz","..zzzzzzzz","..zzzzmmmz","..zzzzmwmz","..zzzzmmmz","..zzzzzzzz","..zzzzzzzz","...zzzzzzz","...zzzzzzz","....aazzzz","....aa..zz"];
const HUM={
 f:["...HHHHHH...","..HHHHHHHH..","..QQQQQQQQ..","..HSSSSSSH..","..HSKSSKSH..","...SSSSSS...","..CCCCCCCC..",".CCCCCCCCCC.",".SCCCCCCCCS.",".SCCCCCCCCS.","..CCCCCCCC..","..PPPPPPPP..","..PPP..PPP..","..PPP..PPP..","..nnn..nnn.."],
 b:["...HHHHHH...".slice(0,12),"..HHHHHHHH..","..QQQQQQQQ..","..HHHHHHHH..","..HHHHHHHH..","...HHHHHH...","..CCCCCCCC..",".CCCCCCCCCC.",".SCCCCCCCCS.",".SCCCCCCCCS.","..CCCCCCCC..","..PPPPPPPP..","..PPP..PPP..","..PPP..PPP..","..nnn..nnn.."],
 s:["...HHHHHH...","..HHHHHHHH..","..QQQQQQQQ..","..SSSHHHHH..","..SKSHHHHH..","..SSSSHHH...","...SSSSS....","...CCCCCC...","..CCCCCCCC..","..CCCCCCSC..","..CCCCCCSC..","...CCCCCC...","...PPPPPP...","...PPPPPP...","...PPPnnn..."]};
function humanSet(pal){const o={pal},L=[];
  const mkf=(rows,ov)=>{const r=rows.slice();if(ov)for(const k in ov)r[k]=ov[k];return spr(r,o)};
  const S={};
  S.f=[mkf(HUM.f),mkf(HUM.f,{14:"..nnn.......",13:"..PPP..PPP.."}),mkf(HUM.f,{14:".......nnn..",13:"..PPP..PPP.."})];
  S.b=[mkf(HUM.b),mkf(HUM.b,{14:"..nnn.......",13:"..PPP..PPP.."}),mkf(HUM.b,{14:".......nnn..",13:"..PPP..PPP.."})];
  S.l=[mkf(HUM.s),mkf(HUM.s,{14:"...PPPnnn...",13:"...PPPP.....",12:"...PPPPPP..."}),mkf(HUM.s,{14:"...nnnn.....",13:"....PPPPP...",12:"...PPPPPP..."})];
  S.r=S.l.map(c=>mk(c.width,c.height,g=>{g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0)}));
  return S}

// ---------- SPRITES ----------
const SPR={};
function buildSprites(){
  SPR.embermon=spr(EMBER);SPR.blazewyrm=spr(BLAZE);SPR.aquabit=spr(AQUA);SPR.sprigmon=spr(SPRIG);
  SPR.gelbit=spr(GELBIT,{sym:1});SPR.bitbat=spr(BITBAT,{sym:1});SPR.rockmon=spr(ROCK,{sym:1});
  SPR.sparkfox=spr(FOX);SPR.nullbit=spr(NULLB,{sym:1});SPR.wraith=spr(WRAITH,{sym:1});SPR.sovereign=spr(SOV,{sym:1});
  // corrupted variants (tower)
  for(const k of ['gelbit','bitbat','rockmon','sparkfox'])SPR['n_'+k]=mk(SPR[k].width,SPR[k].height,g=>{g.drawImage(SPR[k],0,0);
    g.globalCompositeOperation='source-atop';P(g,'#b020c070',0,0,SPR[k].width,SPR[k].height);
    g.globalCompositeOperation='source-over';const r=rng(9);for(let i=0;i<14;i++){const x=r()*SPR[k].width|0,y=r()*SPR[k].height|0;
      if(g.getImageData(x,y,1,1).data[3])P(g,i%2?'#ff62b8':'#5ce0f4',x,y,2,1)}});
  SPR.hero=humanSet({H:'#7a4422',C:'#e8502e',P:'#2c3a78',Q:'#5ce0f4'});
  SPR.elder=humanSet({H:'#dde2ee',C:'#7a3cb0',P:'#7a3cb0',Q:'#dde2ee'});
  SPR.girl=humanSet({H:'#ff62b8',C:'#f2c030',P:'#3f7ae8',Q:'#ff62b8'});
  SPR.shop=humanSet({H:'#8c5a32',C:'#56c250',P:'#2d8040',Q:'#8c5a32'});
  SPR.inn=humanSet({H:'#f08a24',C:'#dde2ee',P:'#8c5a32',Q:'#f08a24'});
  SPR.boy=humanSet({H:'#2c2440',C:'#3f7ae8',P:'#554068',Q:'#2c2440'});
  SPR.sleuth=humanSet({H:'#2c2440',C:'#9aa2b6',P:'#554068',Q:'#646a7c'});
  SPR.heart=spr(["..hh.hh..",".hhhhhhh.","hhhhhhhhh","hhhhhhhhh",".hhhhhhh.","..hhhhh..","...hhh...","....h...."],{pal:{h:'#ff4060'}});
  SPR.crest=spr(["...u...","..uuu..",".uuyuu.","uuyyyuu",".uuyuu.","..uuu..","...u..."],{});
}

// ---------- TILES ----------
const TI={};
function buildTiles(){
  const grass=(g,s,base='#4fae40',a='#45a138',b='#63c04e')=>{const r=rng(s);P(g,base,0,0,16,16);for(let i=0;i<46;i++){const x=r()*16|0,y=r()*16|0;P(g,r()<.65?a:b,x,y)}
    for(let i=0;i<3;i++){const x=r()*14|0,y=r()*14|0;P(g,b,x,y+1);P(g,b,x+1,y);P(g,a,x+1,y+1)}};
  TI['.']=[0,1,2,3].map(i=>mk(16,16,g=>grass(g,i*77+5)));
  TI[',']=[0,1].map(f=>mk(16,16,g=>{grass(g,31,'#3c9634','#338a2e','#4fae40');const r=rng(11);
    for(let i=0;i<9;i++){const x=(r()*13|0)+1,y=(r()*11|0)+4;const o=f&&i%2?1:0;
      P(g,'#246f26',x+o,y,1,4);P(g,'#62c050',x+1+o,y-1,1,3);P(g,'#62c050',x-1+o,y-1,1,3);P(g,'#8de070',x+o,y-2,1,1)}}));
  TI['#']=[0,1].map(v=>mk(16,16,g=>{P(g,'#1f5a2c',0,0,16,16);
    const blob=(cx,cy,r0)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=x-cx,dy=y-cy,d=Math.sqrt(dx*dx+dy*dy);if(d<r0){
      const l=(-dx*.5-dy*.7)/r0+((x+y)%2?.08:0);P(g,l>.35?'#4cae4a':l>.05?'#35944a'.replace('4a','3a'):l>-.35?'#2a7a34':'#1d5f2a',x,y)}
      else if(d<r0+1)P(g,'#0f3a1a',x,y)}};
    blob(v?5:4,v?4:5,7);blob(v?12:11,v?11:10,6.5);blob(8,8,5.5);
    const r=rng(v+3);for(let i=0;i<8;i++)P(g,'#7cd062',r()*14+1|0,r()*14+1|0)}));
  TI['~']=[0,1,2].map(f=>mk(16,16,g=>{P(g,'#2a66d0',0,0,16,16);const r=rng(4);for(let i=0;i<30;i++)P(g,'#3376e0',r()*16|0,r()*16|0,2,1);
    for(let k=0;k<3;k++){const y=3+k*5,x=(f*3+k*5)%16;P(g,'#9ad0ff',x,y,3,1);P(g,'#9ad0ff',(x+8)%16,y+2,2,1);P(g,'#1f4fb0',(x+4)%16,y+1,3,1)}}));
  TI['=']=[0,1,2,3].map(i=>mk(16,16,g=>{const r=rng(i*13+2);P(g,'#dcb878',0,0,16,16);for(let j=0;j<34;j++)P(g,r()<.5?'#cfa860':'#e8c890',r()*16|0,r()*16|0);
    for(let j=0;j<3;j++){const x=r()*13|0,y=r()*13|0;P(g,'#a88448',x,y,2,1);P(g,'#c4a060',x,y+1,2,1)}}));
  TI['R']=[mk(16,16,g=>{P(g,'#c8352f',0,0,16,16);for(let row=0;row<4;row++){const y=row*4,o=row%2?4:0;
    for(let x=-8;x<20;x+=8){P(g,'#e4574a',x+o,y,7,1);P(g,'#c8352f',x+o,y+1,7,2);P(g,'#8a2020',x+o,y+3,7,1);P(g,'#8a2020',x+o+7,y,1,4)}}})];
  TI['H']=[mk(16,16,g=>{P(g,'#eadcb6',0,0,16,16);for(let x=0;x<16;x+=5)P(g,'#cdb98e',x,0,1,16);P(g,'#b89c6c',0,15,16,1);P(g,'#8a6a40',0,0,16,1);
    const r=rng(8);for(let i=0;i<14;i++)P(g,'#f4ead0',r()*16|0,r()*15|0)})];
  TI['w']=[mk(16,16,g=>{TI['H'][0]&&g.drawImage(TI['H'][0],0,0);P(g,'#5a3a1c',3,2,10,11);P(g,'#7ac8ff',4,3,8,9);P(g,'#b8e4ff',4,3,3,3);P(g,'#5a3a1c',7,3,2,9);P(g,'#5a3a1c',4,7,8,1);P(g,'#9a7a4a',2,13,12,2)})];
  TI['D']=[mk(16,16,g=>{g.drawImage(TI['H'][0],0,0);P(g,'#3a2010',2,1,12,15);P(g,'#7a4a24',3,2,10,14);P(g,'#8f5a2c',3,2,4,14);P(g,'#5a3418',8,2,1,14);P(g,'#ffd83c',11,9,2,2);P(g,'#3a2010',5,6,2,1);P(g,'#3a2010',10,6,2,1)})];
  TI['F']=[0,1].map(i=>mk(16,16,g=>{grass(g,50+i);const r=rng(i+90);const cs=['#ff5070','#ffd83c','#ffffff','#ff62b8'];
    for(let k=0;k<5;k++){const x=(r()*13|0)+1,y=(r()*13|0)+1;P(g,cs[k%4],x,y);P(g,cs[(k+1)%4],x+1,y,1,1);P(g,'#ffd83c',x,y+1)}}));
  TI['f']=[mk(16,16,g=>{grass(g,70);P(g,'#5a3a1c',0,6,16,2);P(g,'#8a5a30',0,6,16,1);P(g,'#5a3a1c',0,10,16,2);P(g,'#8a5a30',0,10,16,1);
    for(const x of[2,11]){P(g,'#3a2010',x,3,3,11);P(g,'#9a6a38',x,3,2,10)}})];
  TI['_']=[mk(16,16,g=>{P(g,'#b88850',0,0,16,16);for(let y=0;y<16;y+=4){P(g,'#8a6030',0,y,16,1)};P(g,'#d0a068',0,1,16,1)})];
  TI['c']=[0,1,2,3].map(i=>mk(16,16,g=>{const r=rng(i*31+7);P(g,'#3a3358',0,0,16,16);for(let j=0;j<40;j++)P(g,r()<.6?'#2f2a4a':'#4a4470',r()*16|0,r()*16|0);
    if(i==1){P(g,'#58e0f0',4,9);P(g,'#b8f4ff',4,8)}if(i==3){P(g,'#ff62b8',11,5);P(g,'#ffb0dc',11,4)}
    P(g,'#221c38',r()*12|0,r()*12|0,3,1)}));
  TI['C']=[0,1].map(v=>mk(16,16,g=>{P(g,'#1c1630',0,0,16,16);const r=rng(v+40);
    for(let i=0;i<5;i++){const x=(r()*12|0),y=(r()*12|0);P(g,'#2e2650',x,y,4,3);P(g,'#463c78',x,y,4,1);P(g,'#463c78',x,y,1,3);P(g,'#0e0a1c',x+1,y+3,4,1)}
    for(let i=0;i<24;i++)P(g,'#2a2248',r()*16|0,r()*16|0);
    if(v){P(g,'#58e0f0',6,6);P(g,'#b8f4ff',6,5);P(g,'#2c9cc0',7,7)}}))
  TI['T']=[0,1].map(f=>mk(16,16,g=>{P(g,'#0c1c34',0,0,16,16);P(g,'#14345a',1,1,14,14);P(g,'#0c1c34',2,2,12,12);
    P(g,f?'#ff62b8':'#5ce0f4',7,7,2,2);P(g,'#1fa3c8',0,0,16,1);P(g,'#1fa3c8',0,0,1,16);P(g,'#5ce0f4',7,1,2,1);P(g,'#5ce0f4',1,7,1,2)}));
  TI['W']=[0,1,2].map(f=>mk(16,16,g=>{P(g,'#070e1e',0,0,16,16);P(g,'#10264a',0,0,16,2);P(g,'#1a3a6a',0,0,16,1);const r=rng(17);
    for(let i=0;i<7;i++){const x=(r()*14|0)+1,y=((r()*16|0)+f*3)%15;P(g,i%3==0?'#ff62b8':'#1fa3c8',x,y,1,2);P(g,'#5ce0f4',x,y,1,1)}
    for(let x=0;x<16;x+=8)P(g,'#0c1a34',x,2,1,14)}));
  TI['N']=[0,1].map(f=>mk(16,16,g=>{g.drawImage(TI['T'][0],0,0);const c=f?'#ff62b8':'#5ce0f4';P(g,c,2,2,12,1);P(g,c,2,13,12,1);P(g,c,2,2,1,12);P(g,c,13,2,1,12);P(g,'#fff',6,6,4,4)}));
}
const TILE_BLOCK=new Set('#~RHwDfCW');
const TILE_ANIM=new Set(',~TWN');
function tileImg(ch,x,y,t){const v=TI[ch]||TI['.'];if(v.length==1)return v[0];
  if(TILE_ANIM.has(ch))return v[(t>>(ch=='~'?4:5))%v.length];return v[(x*7+y*3)%v.length]}

// ---------- battle backgrounds ----------
function dither(g,x,y,w,h,c1,c2){for(let j=0;j<h;j++)for(let i=0;i<w;i++)P(g,(i+j)%2?c1:c2,x+i,y+j)}
function banded(g,cols,y0,y1){const n=cols.length,bh=(y1-y0)/n;
  for(let i=0;i<n;i++){P(g,cols[i],0,y0+i*bh|0,256,Math.ceil(bh)+1);if(i<n-1)dither(g,0,(y0+(i+1)*bh|0)-2,256,4,cols[i],cols[i+1])}}
function buildBG(){
  TI.bg={};
  TI.bg.forest=mk(256,146,g=>{banded(g,['#1c2a5a','#26397a','#3a5a9a','#6a8acc','#e8a878','#ffd8a0'],0,100);
    P(g,'#fff6d0',200,14,18,18);P(g,'#ffd8a0',198,16,22,14);P(g,'#fff6d0',202,12,14,22);
    const r=rng(5);for(let i=0;i<30;i++)P(g,'#fff',r()*256|0,r()*40|0);
    const pine=(x,y,s,c,c2)=>{for(let k=0;k<s;k++){const w=2+k*2,yy=y+k*4;P(g,c,x-w/2,yy,w,4);P(g,c2,x-w/2,yy,1,4)}P(g,'#2a1a10',x-1,y+s*4,3,4)};
    for(let x=-4;x<270;x+=14)pine(x,44+(x*7%9),5,'#1c4a4a','#2a6a5a');
    for(let x=6;x<270;x+=22)pine(x,30+(x*5%11),7,'#0f3a2c','#1c5a3c');
    P(g,'#2a7a30',0,98,256,48);dither(g,0,98,256,4,'#2a7a30','#1c5a2c');
    for(let y=104;y<146;y+=6)for(let x=((y/6)%2)*8;x<256;x+=16)P(g,'#3f9a3c',x,y,8,3);
    for(let i=0;i<50;i++)P(g,'#62c050',r()*256|0,100+r()*44|0,1,2)});
  TI.bg.cave=mk(256,146,g=>{banded(g,['#0a0618','#140c2c','#1e1440','#2a1e58','#36286c'],0,100);
    P(g,'#2e2650',0,100,256,46);dither(g,0,100,256,4,'#2e2650','#221c3c');
    const r=rng(9);for(let x=0;x<260;x+=10+(x%7)){const hh=14+(x*13%30);for(let k=0;k<hh;k+=2){const w=Math.max(1,(hh-k)/3|0);P(g,k<2?'#4a4270':'#241a44',x-w,k,w*2,2)}}
    for(let i=0;i<8;i++){const x=r()*240+8|0,y=84+r()*10|0;const c=i%2?'#58e0f0':'#ff62b8',c2=i%2?'#b8f4ff':'#ffb0dc';
      P(g,c+'30'.slice(0,0)||c,x,y,4,14);P(g,c2,x+1,y+1,1,10);P(g,c,x-2,y+6,2,8);P(g,c,x+4,y+4,2,10);P(g,c2,x-3+4,y+4,1,1)}
    for(let y=106;y<146;y+=7)for(let x=(y%2)*10;x<256;x+=20)P(g,'#3c3468',x,y,10,1);
    for(let i=0;i<40;i++)P(g,'#58e0f0',r()*256|0,r()*140|0)});
  TI.bg.tower=mk(256,146,g=>{P(g,'#04081a',0,0,256,146);const r=rng(21);
    for(let i=0;i<70;i++){const x=r()*256|0,y=r()*100|0;P(g,r()<.5?'#1fa3c8':'#ff62b8',x,y,1,3);P(g,'#5ce0f4',x,y,1,1)}
    for(let k=0;k<7;k++){const y=100+k*k*1.2|0;P(g,'#1fa3c8',0,y,256,1)}
    for(let k=-10;k<=10;k++){const x0=128+k*8,x1=128+k*60;for(let s=0;s<46;s++){const x=x0+(x1-x0)*s/46|0;P(g,'#14527a',x,100+s,1,1)}}
    P(g,'#0b2440',0,100,256,1);
    for(let a=0;a<360;a+=3){const rad=a*Math.PI/180;P(g,'#5a1c6a',128+Math.cos(rad)*50|0,48+Math.sin(rad)*44|0,2,2);P(g,'#a030b0',128+Math.cos(rad)*34|0,48+Math.sin(rad)*30|0,1,1)}
    P(g,'#ff62b8',124,44,8,8);P(g,'#fff',126,46,4,4)});
}

// ---------- title / ending backdrops ----------
function nightSky(g,t){const cols=['#080418','#0e0a30','#1a1450','#2c2070','#4a3290','#7a4aa8','#c070a0','#f0a070'];
  banded(g,cols,0,150)}
