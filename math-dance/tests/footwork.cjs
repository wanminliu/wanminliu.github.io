'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),c={window:{}};
for(const f of ['graphs.js','scenes.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),c);
const seq=require('../sequence.js'),planner=seq.createPlanner(c.window.MATH_GRAPHS,c.window.MATH_SCENES);
let seed=52;const rng=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const isFoot=f=>f.scene?.startsWith('footwork_');let sessions=0,blocks=0,lateral=0;
for(const kinds of [...Object.values(seq.presets),...Object.keys(seq.weights).map(k=>[k])])for(const duration of [120,180])for(const accelerate of [true,false])for(let i=0;i<10;i++){
 const options={duration,kinds,accelerate,derivatives:true,relations:true,jumps:false};
 const seated=planner.plan({...options,jumps:true},rng);assert(seated.every(f=>!isFoot(f)&&f.cue!=='jump'),'Footwork leaked into default seated mode');
 const frames=planner.plan({...options,footwork:true},rng);sessions++;
 assert.equal(frames.at(-1).end,duration);
 const seen=new Set(frames.filter(f=>f.start<duration-10).map(f=>planner.map.get(f.graph).kind));for(const k of kinds)assert(seen.has(k),'Missing type: '+k);
 let count=0,seconds=0;
 for(let j=0;j<frames.length;j++){
  const f=frames[j];assert(f.end>f.start);if(j)assert.equal(f.start,frames[j-1].end);assert.notEqual(f.cue,'jump');
  if(!isFoot(f))continue;
  count++;blocks++;const trio=frames.slice(j,j+3);assert.equal(trio.length,3);
  for(const t of trio){assert.equal(t.scene,f.scene);assert.equal(t.end-t.start,4);assert(t.end<=duration-10);assert(kinds.includes(planner.map.get(t.graph).kind))}
  assert.equal(trio[0].graph,trio[2].graph,'Step must return to original graph');
  const a=planner.map.get(trio[0].graph),b=planner.map.get(trio[1].graph);assert.equal(a.kind,b.kind);
  if(['stepLeft','stepRight'].includes(trio[1].cue)){
   lateral++;const dx=trio[1].cue==='stepRight'?2:-2;
   if(a.kind==='linear')assert.equal(b.k,a.k-a.a*dx);else assert.equal(b.h,a.h+dx);
   assert.equal(trio[2].cue,'feetReturn');
  }else{assert.equal(trio[1].cue,'feetBend');assert(b.k<a.k);assert.equal(trio[2].cue,'feetStand')}
  seconds+=12;j+=2;
 }
 assert(count>=2,'Enabled footwork should appear repeatedly');
 assert(seconds>=24);
 frames.slice(-5).forEach((f,i)=>{assert.equal(f.start,duration-10+2*i);assert.equal(f.graph,`constant_1_0_${[2,0,-2,0,2][i]}`)});
}
const jumping=planner.plan({duration:120,kinds:['constant'],footwork:true,jumps:true},rng);assert(jumping.some(f=>f.cue==='jump'));assert.equal(jumping[2].cue,'feetFinish');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.match(html,/<input id="footwork" type="checkbox">/);assert.match(html,/<input id="jumps" type="checkbox">/);
console.log(`PASS: ${sessions} paired seated/footwork sessions; ${blocks} complete blocks, ${lateral} side steps; default off, directions, return positions, function selection and endings verified.`);
