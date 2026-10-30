const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'app','src','main','assets','index.html'),'utf8');
const kt=fs.readFileSync(path.join(__dirname,'app','src','main','java','com','baseballabtracker','app','MainActivity.kt'),'utf8');
const lines=html.split(/\r?\n/);
function lineStarting(prefix){const s=lines.find(x=>x.startsWith(prefix));assert.ok(s,`source function ${prefix}`);return s}
const ctx={console,db:{activeGames:[],archivedGames:[],teams:[]},window:{}};
vm.createContext(ctx);
vm.runInContext(lineStarting('function teamRecord'),ctx);
vm.runInContext(lineStarting('function recordText'),ctx);
vm.runInContext(lineStarting('function finalizeInningLines'),ctx);
vm.runInContext(lineStarting('function scoreboardFor'),ctx);
vm.runInContext(lineStarting('function scoreTextFor'),ctx);

// win-loss from archived games only
ctx.db.archivedGames=[
  {id:'g1',teamId:'t1',score:{team:5,opp:3}},
  {id:'g2',teamId:'t1',score:{team:2,opp:4}},
  {id:'g3',teamId:'t1',score:{team:4,opp:4}},
  {id:'g4',teamId:'t2',score:{team:9,opp:0}},
];
let r=ctx.teamRecord({id:'t1'});
assert.equal(r.w,1,'one win');assert.equal(r.l,1,'one loss');assert.equal(r.t,1,'one tie');
assert.equal(ctx.recordText(r),'1-1-1','record with tie');
assert.equal(ctx.recordText(ctx.teamRecord({id:'t2'})),'1-0','record without tie');

// finalize: mid-half with play appends once, scoreless played half appends 0, idle half appends nothing
let g={inning:3,half:'bottom',inningRuns:2,log:[{inning:3,half:'bottom'}],inningLines:[{inning:3,half:'top',runs:1}]};
ctx.finalizeInningLines(g);
assert.equal(g.inningLines.length,2,'finalize appends the in-progress half');
assert.equal(g.inningLines[1].runs,2,'finalize records its runs');
ctx.finalizeInningLines(g);
assert.equal(g.inningLines.length,2,'finalize does not duplicate');
g={inning:2,half:'top',inningRuns:0,log:[{inning:2,half:'top'}],inningLines:[{inning:1,half:'bottom',runs:0}]};
ctx.finalizeInningLines(g);
assert.equal(g.inningLines.length,2,'played scoreless half records a 0');
g={inning:2,half:'top',inningRuns:0,log:[],inningLines:[]};
ctx.finalizeInningLines(g);
assert.equal(g.inningLines.length,0,'idle half records nothing');
g={inning:6,half:'final',gameOver:true,inningRuns:0,log:[],inningLines:[{inning:6,half:'bottom',runs:3}]};
ctx.finalizeInningLines(g);
assert.equal(g.inningLines.length,1,'final game is untouched');

// scoreboard: lines + live half, runs and hits per side, no errors column
const live={id:'lg',teamId:'t1',teamName:'Eagles',oppName:'Hawks',inning:2,half:'bottom',inningRuns:1,score:{team:1,opp:3},inningLines:[{inning:1,half:'top',runs:0},{inning:1,half:'bottom',runs:2},{inning:2,half:'top',runs:1}],log:[
  {side:'team',result:'1B'},{side:'team',result:'2B'},{side:'team',result:'BB'},{side:'team',result:'SO'},
  {side:'opp',result:'HR'},{side:'opp',result:'GO'},
]};
ctx.db.activeGames=[live];
let s=ctx.scoreboardFor(live);
assert.deepEqual([...s.innings],[1,2],'innings listed');
assert.deepEqual([...s.team],[0,1],'team runs by inning');
assert.deepEqual([...s.opp],[2,1],'opp runs by inning (live half appended)');
assert.equal(s.teamR,1,'team total runs');assert.equal(s.oppR,3,'opp total runs');
assert.equal(s.teamH,2,'team hits');assert.equal(s.oppH,1,'opp hits');
assert.equal(s.final,false,'live game is not final');
// archived game: lines only, final, no phantom current half
const arch={id:'ag',teamId:'t1',teamName:'Eagles',oppName:'Hawks',inning:4,half:'bottom',inningRuns:2,score:{team:6,opp:2},inningLines:[{inning:1,half:'top',runs:1},{inning:1,half:'bottom',runs:0}],log:[]};
ctx.db.activeGames=[];
s=ctx.scoreboardFor(arch);
assert.deepEqual([...s.innings],[1],'archived game shows only recorded innings');
assert.equal(s.final,true,'archived game is final');
// shared text: traditional layout, R and H, no E column
ctx.db.activeGames=[live];
const txt=ctx.scoreTextFor(live);
assert.ok(txt.includes('Eagles vs Hawks'),'share text names both teams');
assert.ok(txt.split('\n')[1].includes('R'),'share header has R');
assert.ok(txt.split('\n')[1].includes('H'),'share header has H');
assert.ok(!txt.split('\n')[1].includes('E'),'share header has no E column');

// team hub + pages + share wiring
assert.ok(html.includes('My Teams'),'hub card says My Teams');
assert.ok(html.includes('data-action=team-roster'),'hub has roster buttons');
assert.ok(html.includes('data-action=team-stats'),'hub has stats buttons');
assert.ok(html.includes('teamcard-c'),'team cards cycle palette classes');
assert.ok(html.includes('id=team-roster-page'),'roster page exists');
assert.ok(html.includes('id=team-stats-page'),'stats page exists');
assert.ok(html.includes('id=scoreboard-page'),'scoreboard page exists');
assert.ok(html.includes('data-action=team-game-score'),'team history games open scoreboards');
assert.ok(html.includes('data-action=game-scoreboard'),'games history rows offer scoreboards');
assert.ok(html.includes('data-action=share-game'),'live game has a share button');
assert.ok(html.includes('data-action=share-scoreboard'),'scoreboard page has a share button');
assert.ok(html.includes('AndroidApp.shareText'),'share uses the native bridge');
assert.ok(kt.includes('fun shareText'),'native share method exists');
assert.ok(html.includes('inningLines.push'),'advance records completed halves');
assert.ok(html.includes('finalizeInningLines(g)'),'archive finalizes the last half');
assert.ok(html.includes('Inning-by-inning scoring starts with games recorded after this update.'),'old games note exists');

console.log('beta18 tests PASS');
