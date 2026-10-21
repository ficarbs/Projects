#!/usr/bin/env python3
"""Bundle index.html + js/*.js into one self-contained page (digital-dawn.html and the repo-root index.html for GitHub Pages)."""
import pathlib
here=pathlib.Path(__file__).parent
js=''.join((here/'js'/f'{n}.js').read_text().replace('</script','<\\/script')+'\n' for n in ['art','audio','game','battle','story'])
js=js.replace("Math.min(innerWidth/W,innerHeight/H)","Math.min((innerWidth-32)/W,(innerHeight-50)/H)")
html='''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Digital Dawn</title>
<style>
:root{--bg:#05030c;--fg:#dde2ee;--dim:#7880a8;color-scheme:dark}
html,body{height:100%;margin:0}
body{background:var(--bg);color:var(--fg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding-inline:16px;box-sizing:border-box;font:12px monospace}
canvas{image-rendering:pixelated;image-rendering:crisp-edges;background:#000;max-width:100%;outline:none}
p{margin:0;color:var(--dim);text-align:center}
</style></head><body>
<canvas id="c" width="256" height="224" tabindex="0"></canvas>
<p>Click the game, then: arrows/WASD move, Z or Enter confirm, X menu, M mute</p>
<script>
'''+js+'''
document.getElementById('c').addEventListener('click',()=>{document.getElementById('c').focus();auInit()});
fit();
</script></body></html>
'''
(here/'digital-dawn.html').write_text(html)
(here.parent/'index.html').write_text(html)
print('built',len(html),'bytes')
