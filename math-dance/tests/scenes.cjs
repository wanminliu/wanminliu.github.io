'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{}};for(const f of ['graphs.js','scenes.js'])vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'..',f),'utf8'),c);
const scenes=c.window.MATH_SCENES,planner=require('../sequence.js').createPlanner(c.window.MATH_GRAPHS,scenes);
assert.equal(scenes.length,13);
for(const s of scenes)for(const card of s.cards){const g=planner.map.get(card.graph);assert(g);assert(s.requires.includes(g.kind));}
assert.equal(planner.map.get('abs_sign_0').path,planner.map.get('abs_sign_1').path);
for(let i=1;i<3;i++)assert.equal(planner.map.get('equivalent_0').path,planner.map.get('equivalent_'+i).path);
function yAt(g,x){const px=400+x*60;const p=[...g.path.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].find(m=>Math.abs(+m[1]-px)<.001);assert(p,`${g.id}: ${x}`);return (400-Number(p[2]))/60}
for(const g of c.window.MATH_GRAPHS.filter(g=>g.model))for(const x of [-2,-1,0,1,2]){
 const m=g.model;let y;
 if(m.type==='abs')y=m.outside*Math.abs(m.inside*x);
 if(m.type==='vertex')y=m.a*(x-m.b)**2+m.c;
 if(m.type==='roots')y=m.a*(x-m.r1)*(x-m.r2);
 if(m.type==='fold')y=m.fold?Math.abs(x*x-1):x*x-1;
 if(m.type==='wave')y=m.a*Math.sin(m.b*x);
 if(Math.abs(y)<=20)assert(Math.abs(yAt(g,x)-y)<.0001,`${g.id}: incorrect y`);
}
let seed=46;const rng=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296),seen=new Set();
for(let i=0;i<200;i++){
 const kinds=['quadratic','absolute','cubic','sin','exp','log'];
 const frames=planner.plan({duration:180,kinds,relations:true,derivatives:true,accelerate:true},rng);
 for(let j=0;j<frames.length;j++){const f=frames[j];if(!f.scene)continue;seen.add(f.scene);const s=scenes.find(s=>s.id===f.scene);for(const [n,card]of s.cards.entries()){assert.equal(frames[j+n].graph,card.graph);assert.equal(frames[j+n].scene,s.id);assert.equal(frames[j+n].end-frames[j+n].start,4);assert(frames[j+n].end<=170)}j+=s.cards.length-1}
}
assert.equal(seen.size,13,'All scene families must be reachable');
for(const kinds of [['absolute'],['quadratic'],['exp'],['log'],['sin']]){const frames=planner.plan({duration:120,kinds,relations:true},rng);for(const f of frames.filter(f=>f.start<110))assert(kinds.includes(planner.map.get(f.graph).kind),'Disabled type leaked into playlist')}
assert(planner.plan({duration:120,kinds:['quadratic','absolute'],relations:false},rng).every(f=>!f.scene));
console.log('PASS: 13 complete scene families; sampled graph mathematics; equivalent formulas; all scenes reachable; type and scene switches respected.');
