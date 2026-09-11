'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'graphs.js'),'utf8'),context);const graphs=context.window.MATH_GRAPHS;
const seq=require('../sequence.js'),music=require('../music.js'),planner=seq.createPlanner(graphs);
assert.equal(graphs.length,535);assert.equal(new Set(graphs.map(g=>g.id)).size,535);
for(const g of graphs){assert(g.path.length>0);assert(!/NaN|Infinity|undefined/.test(g.path));}
assert.equal(planner.get('absolute',1,3,0).formula,'y = |x − 3|');
for(const g of graphs.filter(g=>g.kind==='log')){const points=g.path.match(/[ML](-?[\d.]+),(-?[\d.]+)/g);for(const p of points){const x=(Number(p.slice(1).split(',')[0])-400)/60;assert(x>g.h)}}
assert((planner.get('tan').path.match(/M/g)||[]).length>=5,'Tangent discontinuities must be separate');
const derivatives=graphs.filter(g=>g.kind==='derivative');
for(let i=0;i<5;i++){const a=derivatives[i].coefficients,b=derivatives[i+1].coefficients;const actual=a.length===1?[0]:a.slice(0,-1).map((v,j)=>v*(a.length-1-j));assert.equal(actual.length,b.length);actual.forEach((v,j)=>assert(Math.abs(v-b[j])<1e-12))}
let seed=29;const rng=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
for(const duration of [120,180])for(const accelerate of [false,true])for(const kinds of Object.values(seq.presets))for(let run=0;run<30;run++){
 const frames=planner.plan({duration,accelerate,kinds,derivatives:true,jumps:true},rng);assert.equal(frames[0].start,0);assert.equal(frames.at(-1).end,duration);
 for(let i=0;i<frames.length;i++){const f=frames[i];assert(planner.map.has(f.graph));assert(f.end>f.start);assert.equal(f.start*2,Math.round(f.start*2));if(i)assert.equal(f.start,frames[i-1].end);assert.equal(seq.frameAt(frames,f.start),i);
 if(f.graph==='derivative_0'){assert(f.start+24<=duration-10);for(let j=0;j<6;j++){assert.equal(frames[i+j].graph,'derivative_'+j);assert.equal(frames[i+j].end-frames[i+j].start,4)}}}
 frames.slice(-5).forEach((f,i)=>{assert.equal(f.start,duration-10+i*2);assert.equal(f.graph,`constant_1_0_${[2,0,-2,0,2][i]}`)});
}
assert.throws(()=>planner.plan({duration:120,kinds:[],accelerate:true}),/Select/);
for(const duration of [120,180]){const score=music.render(duration);assert.equal(score.intro,8);assert.equal(score.data.length,Math.ceil((duration+9.5)*score.sampleRate));let energy=0;for(const v of score.data){assert(Number.isFinite(v));assert(Math.abs(v)<=.901);energy+=v*v}assert(energy>10)}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const [,src]of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(src.startsWith('data:'))continue;assert(!/^https?:/.test(src));assert(fs.existsSync(path.join(root,src)),src)}
console.log('PASS: 535 paths; log domains; tangent breaks; five exact derivatives; 360 complete sessions; fixed endings; synthesized audio and local asset references.');
