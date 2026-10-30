const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'app','src','main','assets','index.html'),'utf8');

// sidebar menu entry renamed to Home
assert.ok(html.includes('data-target=player>Home</button>'),'sidebar entry is Home');
assert.ok(!html.includes('data-target=player>My Player</button>'),'old My Player menu entry is gone');
// top card: no My Players heading, just the Start/Resume buttons, no toggle
assert.ok(!html.includes('<h2>My Players</h2>'),'top card no longer says My Players');
assert.ok(html.includes('data-action=start-active'),'start game button still there');
assert.ok(html.includes('Resume Active Game'),'resume game button still there');
// the profiles section itself is untouched
assert.ok(html.includes('<h3>My Players</h3>'),'profiles section keeps its heading');
assert.ok(html.includes('data-action=myplayer-card'),'profile cards still there');

console.log('beta16 tests PASS');
