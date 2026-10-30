const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'app','src','main','assets','index.html'),'utf8');
const kt=fs.readFileSync(path.join(__dirname,'app','src','main','java','com','baseballabtracker','app','MainActivity.kt'),'utf8');
const paths=fs.readFileSync(path.join(__dirname,'app','src','main','res','xml','file_paths.xml'),'utf8');
const lines=html.split(/\r?\n/);
function lineStarting(prefix){const s=lines.find(x=>x.startsWith(prefix));assert.ok(s,`source function ${prefix}`);return s}
const ctx={console,db:{activeGames:[],archivedGames:[],teams:[{id:'t1',players:[
  {id:'a',name:'Ann',active:true},{id:'b',name:'Bo',active:true},{id:'c',name:'Cy',active:true}]}]},window:{}};
vm.createContext(ctx);
for(const fn of ['function ensureTeamShape','function teamLineup','function currentSide','function battingTeam','function currentBatter','function batterKey','function resetLiveCount','function syncMyPlayer','function jumpBatter'])vm.runInContext(lineStarting(fn),ctx);

function mkGame(over){return Object.assign({teamId:'t1',batterIndex:0,half:'top',inning:1,balls:2,strikes:1,fouls:0,pitches:5,bases:[null,null,null],myPlayer:false,myPlayerLocked:false,pendingZone:'LF',awaitingHit:false,awaitingRunnerDecision:false,pendingRunnerResult:null,pendingBatter:null,pendingRunnerResolution:null,myPlayerIds:[]},over||{})}
// lineup jump: sets the batter, fresh count, clears pending state
let g=mkGame();
assert.equal(ctx.jumpBatter(g,'c'),true,'jump to Cy succeeds');
assert.equal(g.batterIndex,2,'batter index jumps to Cy');
assert.equal(g.balls,0,'count resets on jump');assert.equal(g.strikes,0,'strikes reset on jump');
assert.equal(g.pendingZone,null,'pending zone cleared on jump');
assert.equal(ctx.jumpBatter(g,'zz'),false,'unknown player refuses');
assert.equal(g.batterIndex,2,'failed jump keeps the batter');
// opponent half: repositions the team lineup without touching the live count
g=mkGame({half:'bottom',balls:2,strikes:1});
assert.equal(ctx.jumpBatter(g,'a'),true,'jump during opp half succeeds');
assert.equal(g.batterIndex,0,'team index repositions during opp half');
assert.equal(g.balls,2,'live opp count untouched by a team jump');

// exactly one advance per resolved at-bat
assert.ok(!html.includes("playGameFX('small','RUN SCORED!','',850);advanceBatter(g);if(maybeRunRule"),'scoring branch no longer advances before the tail');
assert.ok(html.includes("if(maybeRunRule(g)){advanceBatter(g);syncMyPlayer(g);return}}"),'run-rule path keeps its own advance');
assert.equal(html.split('completeRunnerResolution(g,p,beforeRuns)').length-1,3,'helper definition plus both runner-resolution call sites');
assert.ok(lineStarting('function completeRunnerResolution').includes('pendingRunnerResolution=null'),'helper clears the pending resolution');

// undo = one logical action: hit modal open snapshots, result choice does not
const hitResult=html.slice(html.indexOf("case'live-hit-result':"),html.indexOf("case'live-hit-result':")+400);
assert.ok(!hitResult.includes('pushLiveUndo'),'result choice pushes no second snapshot');
const hitOpen=html.slice(html.indexOf("case'live-hit':"),html.indexOf("case'live-hit':")+500);
assert.ok(hitOpen.includes('pushLiveUndo'),'modal open still snapshots');

// lineup names jump
assert.ok(html.includes('data-action=jump-batter'),'lineup names are jump buttons');
assert.ok(html.includes('jumpBatter(g,b.dataset.player)'),'jump case calls the helper');

// image share wiring
assert.ok(html.includes('function drawScoreboardImage'),'canvas linescore renderer exists');
assert.ok(html.includes('AndroidApp.shareImage'),'share uses the native image bridge');
assert.ok(html.includes('showScoreImage'),'image fallback modal exists');
assert.ok(html.includes('close-share-image'),'image modal closes');
assert.ok(kt.includes('fun shareImage'),'native shareImage exists');
assert.ok(kt.includes('EXTRA_STREAM'),'native share sends a stream');
assert.ok(kt.includes('image/png'),'native share is a png');
assert.ok(paths.includes('shared/'),'FileProvider exposes the shared dir');

console.log('beta19 tests PASS');
