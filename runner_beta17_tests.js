const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'app','src','main','assets','index.html'),'utf8');

// In Game tab: the no-active-game branch has a Start a Game button...
const fn=html.slice(html.indexOf('function renderActiveGames(){'),html.indexOf('function renderActiveGames(){')+400);
assert.ok(fn.includes('No active game. Start one below.'),'empty game tab message still there');
assert.ok(fn.includes('data-action=start-active'),'empty game tab has a start button');
// ...and the active-games branch (game cards) has no start button
assert.ok(!html.slice(html.indexOf('return db.activeGames.map(activeGameCard)'),html.indexOf('return db.activeGames.map(activeGameCard)')+200).includes('start-active'),'active game cards have no start button');
// backdrop taps close the sidebar: the dispatcher handles the backdrop
// div before its button-only guard
assert.ok(html.includes("e.target.closest('#sidebar-backdrop')"),'click handler checks the backdrop');
const disp=html.slice(html.indexOf("addEventListener('click',"),html.indexOf("addEventListener('click',")+600);
assert.ok(disp.indexOf('sidebar-backdrop')<disp.indexOf("closest('button')"),'backdrop check runs before the button guard');
assert.ok(disp.includes("getElementById('sidebar')?.classList.remove('open')"),'backdrop tap closes the sidebar');

console.log('beta17 tests PASS');
